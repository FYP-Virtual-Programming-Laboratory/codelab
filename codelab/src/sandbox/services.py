from typing import Annotated
from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path
from sqlmodel import Session, select

from src.core.dependecies import require_authenticated_vpl, require_db_session
from src.models import LanguageImage
from src.sandbox.schemas import CreateLanguageImageSchema
from src.sandbox.tasks import build_language_image_task
from src.schemas import ImageStatus
from src.utils import CeleryHelper


def create_new_langauge_image_service(
    _: Annotated[bool, Depends(require_authenticated_vpl)],
    db_session: Annotated[Session, Depends(require_db_session)],
    image_data: Annotated[CreateLanguageImageSchema, Body()],
) -> LanguageImage:
    """Create a new language image."""

    if CeleryHelper.is_being_executed(
        "build_language_image_task"
    ) or CeleryHelper.is_being_executed("build_language_image_task"):
        raise HTTPException(
            status_code=400,
            detail="Unbale to trigger language build as a build is in progress",
        )

    image = LanguageImage(
        **image_data.model_dump(),
        status=ImageStatus.created,
    )

    db_session.add(image)
    db_session.commit()
    db_session.refresh(image)

    # enqueue a celery task to build the image asynchronously
    build_language_image_task.delay(image_id=image.id)
    return image


def get_language_image_by_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    image_id: Annotated[UUID, Path()],
) -> LanguageImage:
    """Get a language image by its ID."""
    language_image = db_session.exec(
        select(LanguageImage).where(LanguageImage.id == image_id)
    ).first()

    if not language_image:
        raise HTTPException(status_code=404, detail="Language image not found")

    return language_image


def retry_language_image_build_service(
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Retry building a language image."""

    if CeleryHelper.is_being_executed(
        "build_language_image_task"
    ) or CeleryHelper.is_being_executed("build_language_image_task"):
        raise HTTPException(
            status_code=400,
            detail="Unbale to trigger language buil d as a build is in progress",
        )

    build_language_image_task.delay(image_id=language_image.id)
    return language_image
