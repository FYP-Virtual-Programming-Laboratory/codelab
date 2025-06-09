from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Path, status

from src.accounts.schemas import (
    AdminDashboardSchema,
    AdminProfileSchema,
    AdminPublicSchema,
    CreateAdminSchema,
    UpdateAdminSchema,
)
from src.accounts.services import (
    create_admin_service,
    get_admin_dashboard_service,
    get_admin_profile_service,
    get_admin_public_profile_service,
    list_admin_profile_service,
    update_admin_profile_service,
)
from src.models import Admin


router = APIRouter()


@router.post(
    "/admins",
    response_model=AdminProfileSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new admin",
)
async def create_admin(
    admin: Annotated[Admin, Depends(create_admin_service)],
) -> AdminProfileSchema:
    """Create a new admin."""
    return AdminProfileSchema.model_validate(admin)


@router.get(
    "/admins/me",
    response_model=AdminProfileSchema,
    summary="Get admin profile",
)
async def get_admin_profile(
    admin: Annotated[Admin, Depends(get_admin_profile_service)],
) -> AdminProfileSchema:
    """Get the admin profile."""
    return AdminProfileSchema.model_validate(admin)


@router.get(
    "/admins",
    response_model=list[AdminProfileSchema],
    summary="List admin profiles",
)
async def list_admin_profiles(
    admins: Annotated[list[Admin], Depends(list_admin_profile_service)],
) -> list[AdminProfileSchema]:
    """List all admin profiles."""
    return [AdminProfileSchema.model_validate(admin) for admin in admins]


@router.patch(
    "/admins/me",
    response_model=AdminProfileSchema,
    summary="Update admin profile",
)
async def update_admin_profile(
    admin: Annotated[Admin, Depends(update_admin_profile_service)],
) -> AdminProfileSchema:
    """Update the admin profile."""
    return AdminProfileSchema.model_validate(admin)


@router.get(
    "/admins/{user_id}",
    response_model=AdminPublicSchema,
    summary="Get admin public profile",
)
async def get_admin_public_profile(
    admin: Annotated[Admin, Depends(get_admin_public_profile_service)],
) -> AdminPublicSchema:
    """Get the admin public profile."""
    return AdminPublicSchema.model_validate(admin)


@router.get(
    "/admins/me/dashboard",
    response_model=AdminDashboardSchema,
    summary="Get admin dashboard",
)
async def get_admin_dashboard(
    dashboard: Annotated[AdminDashboardSchema, Depends(get_admin_dashboard_service)],
) -> AdminDashboardSchema:
    """Get the admin dashboard."""
    return dashboard
