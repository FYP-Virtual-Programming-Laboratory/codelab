from collections.abc import Generator
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import jwt
from sqlmodel import Session, select

from src.core.db import engine
from src.core.exceptions import APIException
from src.core.schemas import APIErrorCodes
from src.core.security import SECURITY_HEADER, verify_api_key, ALGORITHM
from passlib.context import CryptContext
from src.core.config import settings
from src.models import Admin, Student



def require_db_session() -> Generator[Session, None, None]:
    """Get a new database db_session."""

    with Session(engine) as db_session:
        yield db_session


def require_authenticated_service(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(SECURITY_HEADER)],
) -> bool:
    """Check if the provided API key is valid."""
    if not verify_api_key(credentials.credentials):
        raise APIException(
            message="Invalid service credentials.",
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code=APIErrorCodes.UNAUTHORIZED_SERVICE,
        )

    return True


def require_authenticated_user_key(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(SECURITY_HEADER)],
) -> str:
    """Check if the provided user key is valid."""

    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            options={"require": ["exp", "sub"]},
            algorithms=[ALGORITHM]
        )

        assert isinstance(payload, dict)
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise APIException(
            message="User key has expired.",
            error_code=APIErrorCodes.AUTHENTICATION_FAILED,
        )
    except (jwt.PyJWTError, AssertionError):
        raise APIException(
            message="Invalid token.",
            error_code=APIErrorCodes.AUTHENTICATION_FAILED,
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


def require_admin(
    db_session: Annotated[Session, Depends(require_db_session)],
    user_id: Annotated[str, Depends(require_authenticated_user_key)],
) -> bool:
    """Check if the provided VPL API key is valid."""
    # check that active vpl user exisis

    user  = db_session.exec(
        select(Admin).where(
            Admin.id == user_id,
            Admin.is_active == True,
        )
    ).first()

    if not user:
        raise APIException(
            message="User not found or inactive.",
            error_code=APIErrorCodes.AUTHENTICATION_FAILED,
        )

    return user


def require_super_admin(
    db_session: Annotated[Session, Depends(require_db_session)],
    user_id: Annotated[str, Depends(require_authenticated_user_key)],
) -> Admin:
    """Check if the provided user key is valid and is a super admin."""
    admin = require_admin(db_session, user_id)
    if not admin.is_super_admin:
        raise APIException(
            message="You are not authorized to access this resource.",
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    return admin


def require_super_admin_or_anonymous(
    db_session: Annotated[Session, Depends(require_db_session)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(SECURITY_HEADER)],
) -> Admin | None:
    """Check if the provided user key is valid and is a admin or anonymous."""
    try:
        user_id = require_authenticated_user_key(credentials=credentials)
        admin = require_admin(db_session, user_id)
    except APIException:
        return None

    if not admin.is_super_admin:
        raise APIException(
            message="You are not authorized to access this resource.",
            error_code=APIErrorCodes.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
        )

    return admin


def require_student(
    db_session: Annotated[Session, Depends(require_db_session)],
    user_id: Annotated[str, Depends(require_authenticated_user_key)],
) -> Student:
    """Check if the provided user key is valid and is a student."""

    user = db_session.exec(
        select(Student).where(Student.id == user_id)
    ).first()

    if not user:
        raise APIException(
            message="User not found.",
            error_code=APIErrorCodes.AUTHENTICATION_FAILED,
        )

    return user


def require_admin_or_student(
    db_session: Annotated[Session, Depends(require_db_session)],
    user_id: Annotated[str, Depends(require_authenticated_user_key)],
) -> Student:
    """Check if the provided user key is valid and is a student or admin."""

    try:
        return require_admin(db_session, user_id)
    except APIException:
        try:
            return require_student(db_session, user_id)
        except APIException as error:
            raise APIException(
                message="User not found.",
                error_code=APIErrorCodes.AUTHENTICATION_FAILED,
            ) from error
