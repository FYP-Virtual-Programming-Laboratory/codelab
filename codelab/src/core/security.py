import datetime
from fastapi import HTTPException
from fastapi.security import HTTPBearer
import jwt
from passlib.context import CryptContext
from passlib.exc import UnknownHashError

from src.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
SECURITY_HEADER = HTTPBearer()


def verify_api_key(api_key: str) -> bool:
    return api_key == settings.EXTERNAL_API_KEY


def verify_vpl_key(vpl_key: str) -> bool:
    return vpl_key == settings.VPL_API_KEY


def generate_user_key(user_id: str) -> str:
    """Generate a JWT token for the user."""
    payload = {
        "sub": user_id,
        "exp": datetime.now(datetime.timezone.utc) + datetime.timedelta(days=1),
    }

    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hashed password."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except UnknownHashError:
        return False


def get_password_hash(password: str) -> str:
    """Get the hash of a password."""

    return pwd_context.hash(password)
