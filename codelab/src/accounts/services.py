from typing import Annotated
from uuid import UUID

from fastapi import Depends, Body, Path, status
from sqlmodel import Session, col, func, select, update

from src.core.dependecies import (
    require_db_session, 
    require_super_admin_or_anonymous,
    require_super_admin,
    require_admin,
)
from src.core.exceptions import APIException
from src.core.schemas import APIErrorCodes
from src.models import (
    Admin, 
    Session as WorkflowSession, 
    SessionEnrollment,
    Student, 
    Exercise, 
    ExerciseSubmission,
)
from src.accounts.schemas import AdminDashboardSchema, CreateAdminSchema, UpdateAdminSchema
from src.core.security import get_password_hash, verify_password
from src.schemas import SessionStatus


def _create_admin(
    db_session: Session, 
    admin_data: CreateAdminSchema,
    is_super_admin: bool = False,
    admin: Admin | None = None,
) -> Admin:
    """Create a new admin."""

    # check if admin already exists
    admin = db_session.exec(
        select(Admin).where(col(Admin.email) == admin_data.email.lower())
    ).first()

    if admin:
        raise APIException(
            message="Admin already exists.",
            error_code=APIErrorCodes.BAD_REQUEST,
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    # create admin
    return Admin(
        first_name=admin_data.first_name,
        last_name=admin_data.last_name,
        email=admin_data.email,
        password=get_password_hash(admin_data.password),
        is_super_admin=is_super_admin,
        created_by_id=admin.id if admin else None,
    )


def create_admin_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin_data: Annotated[CreateAdminSchema, Body()],
    admin: Annotated[Admin | None, Depends(require_super_admin_or_anonymous)],
) -> Admin:
    """Create a new admin."""
    if not admin:
        # check that this is the first admin, if not, return an error
        if db_session.exec(select(Admin)).first() is None:
            raise APIException(
                message="You are not authorized to access this resource.",
                error_code=APIErrorCodes.FORBIDDEN,
                status_code=status.HTTP_403_FORBIDDEN,
            )

    return _create_admin(
        db_session, 
        admin_data, 
        admin=admin,
        is_super_admin=bool(admin is None), # if admin is None, then this is the first admin and is a super admin
    )


def get_admin_profile_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
) -> Admin:
    """Get the admin profile."""
    return admin


def list_admin_profile_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_super_admin)],
) -> list[Admin]:
    """List the admin profile."""
    return db_session.exec(select(Admin)).all()


def update_admin_profile_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
    admin_data: Annotated[UpdateAdminSchema, Body()],
) -> Admin:
    """Update the admin profile."""

    update_data = admin_data.model_dump(
        exclude={"old_password", "new_password"},
        exclude_none=True,
    )

    if admin_data.old_password and admin_data.password:
        if not verify_password(admin_data.old_password, admin.password):
            raise APIException(
                message="Password is incorrect.",
                error_code=APIErrorCodes.BAD_REQUEST,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        update_data["password"] = get_password_hash(admin_data.new_password)

    # update admin profile
    db_session.exec(
        update(Admin).where(col(Admin.id) == admin.id).values(**update_data)
    )
    db_session.commit()
    return admin


def get_admin_public_profile_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    _: Annotated[Admin, Depends(require_super_admin)],
    user_id: Annotated[UUID, Path()],
) -> Admin:
    """Get the admin public profile."""
    admin = db_session.exec(select(Admin).where(col(Admin.id) == user_id)).first()

    if not admin:
        raise APIException(
            message="Admin not found.",
            error_code=APIErrorCodes.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
        )

    return admin


def get_admin_dashboard_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    admin: Annotated[Admin, Depends(require_admin)],
) -> AdminDashboardSchema:
    """Get the admin dashboard."""
    return AdminDashboardSchema(
        total_sessions=db_session.exec(
            select(func.count(col(WorkflowSession.id)))
            .where(col(WorkflowSession.admin_id) == admin.id)
        ).one(),
        total_active_sessions=db_session.exec(
            select(func.count(col(WorkflowSession.id)))
            .where(col(WorkflowSession.admin_id) == admin.id)
            .where(col(WorkflowSession.status) == SessionStatus.ongoing)
        ).one(),
        total_students=db_session.exec(
            select(func.count(col(Student.id)))
            .join(SessionEnrollment, col(SessionEnrollment.student_id) == col(Student.id))
            .join(WorkflowSession, col(WorkflowSession.id) == col(SessionEnrollment.session_id))
            .where(col(WorkflowSession.admin_id) == admin.id)
        ).one(),
        submitted_assignments=db_session.exec(
            select(func.count(col(ExerciseSubmission.id)))
            .join(Exercise, col(Exercise.id) == col(ExerciseSubmission.exercise_id))
            .join(WorkflowSession, col(WorkflowSession.id) == col(Exercise.session_id))
            .where(col(WorkflowSession.admin_id) == admin.id)
        ).one(),
    )

