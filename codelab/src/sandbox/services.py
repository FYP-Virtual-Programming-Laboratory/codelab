from typing import Annotated
from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path
from sqlmodel import Session, col, select, update

from src.core.dependecies import require_authenticated_vpl, require_db_session
from src.models import LanguageImage
from src.sandbox.schemas import CreateLanguageImageSchema, UpdateLanguageSchema
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


def list_language_image_services(
    _: Annotated[bool, Depends(require_authenticated_vpl)],
    db_session: Annotated[Session, Depends(require_db_session)],
) -> list[LanguageImage]:
    """List all language images."""
    return db_session.exec(
        select(LanguageImage).order_by(col(LanguageImage.created_at))
    ).all()


def get_language_image_by_id_service(
    _: Annotated[bool, Depends(require_authenticated_vpl)],
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


def update_language_image_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
    data: Annotated[UpdateLanguageSchema, Body()],
) -> LanguageImage:
    """Update a language image."""

    update_data = data.model_dump(exclude_unset=True)

    fields_that_trigger_rebuild = [
        "base_image",
        "file_extension",
        "compile_file_extension",
        "entrypoint_script",
        "requires_compilation" "compilation_command",
        "requires_compilation",
        "default_execution_command",
    ]
    needs_rebuild = bool(
        set(update_data.keys()).intersection(fields_that_trigger_rebuild)
    )

    update_data.update(
        status=ImageStatus.scheduled_for_rebuild
        if needs_rebuild
        else language_image.status
    )

    language_image.sqlmodel_update(update_data)

    db_session.add(language_image)
    db_session.commit()
    db_session.refresh(language_image)
    return language_image


def delete_language_image_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Detete a language image."""

    language_image.status = ImageStatus.scheduled_for_deletion
    db_session.add(language_image)
    db_session.commit()
    db_session.refresh(language_image)
    return language_image


def cancle_language_image_delation_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Cancel the deletion of a language image."""

    if language_image.status != ImageStatus.scheduled_for_deletion:
        return language_image

    language_image.status = ImageStatus.scheduled_for_rebuild
    db_session.add(language_image)
    db_session.commit()

    return language_image


def retry_language_image_build_service(
    db_session: Annotated[Session, Depends(require_db_session)],  # noqa
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


def prune_langauge_image_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> LanguageImage:
    """Prune a language image."""
    language_image.status = ImageStatus.scheduled_for_prune
    db_session.add(language_image)
    db_session.commit()
    return language_image


def prune_all_language_images_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    _: Annotated[bool, Depends(require_authenticated_vpl)],
) -> None:
    """Prune all language images."""
    db_session.exec(
        update(LanguageImage)
        .where(LanguageImage.status != ImageStatus.unavailable)
        .values(status=ImageStatus.scheduled_for_prune)
    )
    db_session.commit()
