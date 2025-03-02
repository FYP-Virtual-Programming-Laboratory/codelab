from typing import Annotated
from uuid import UUID

from fastapi import Body, Depends, HTTPException, Path
from sqlmodel import Session, col, func, select, update

from src.core.dependecies import require_authenticated_vpl, require_db_session
from src.models import (
    Exercise,
    LanguageImage,
    Tasks,
    User,
)
from src.models import (
    Session as WorkflowSession,
)
from src.sandbox.schemas import (
    CreateLanguageImageSchema,
    CreateTaskExecutionSchema,
    UpdateLanguageSchema,
)
from src.sandbox.tasks import build_language_image_task
from src.schemas import ImageStatus, TaskStatus
from src.utils import CeleryHelper


def create_new_langauge_image_service(
    _: Annotated[bool, Depends(require_authenticated_vpl)],
    db_session: Annotated[Session, Depends(require_db_session)],
    image_data: Annotated[CreateLanguageImageSchema, Body()],
) -> LanguageImage:
    """Create a new language image."""

    if CeleryHelper.is_being_executed(["build_language_image_task"]):
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

    if CeleryHelper.is_being_executed(["build_language_image_task"]):
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


def get_session_by_external_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    external_id: Annotated[str, Path()],
) -> WorkflowSession:
    """Get a session by its external ID."""
    session = db_session.exec(
        select(WorkflowSession).where(WorkflowSession.external_id == external_id)
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")


def get_active_session_by_external_id_service(
    _: Annotated[bool, Depends(require_authenticated_vpl)],
    session: Annotated[WorkflowSession, Depends(get_session_by_external_id_service)],
) -> WorkflowSession:
    """Get an active session by its external ID."""
    if not session.is_active:
        raise HTTPException(status_code=400, detail="Session is not active")
    return session


def get_task_by_id_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[
        WorkflowSession, Depends(get_active_session_by_external_id_service)
    ],
    task_id: Annotated[UUID, Path()],
) -> Tasks:
    """Get a task by its ID."""

    task = db_session.exec(select(Tasks).where(col(Tasks.id) == task_id)).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


def get_queued_task_by_id_service(
    task: Annotated[Tasks, Depends(get_task_by_id_service)],
) -> Tasks:
    """Get a queued task by its ID."""
    if task.status != TaskStatus.queued:
        raise HTTPException(status_code=400, detail="Task is not queued")

    return task


def get_tasks_queue_list_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[
        WorkflowSession, Depends(get_active_session_by_external_id_service)
    ],
) -> list[Tasks]:
    """Get tasks queue list for a session."""
    return db_session.exec(
        select(Tasks).where(
            col(Tasks.status).in_(
                [
                    TaskStatus.queued,
                    TaskStatus.executing,
                ]
            )
        )
    ).all()


def create_task_execution_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    session: Annotated[
        WorkflowSession, Depends(get_active_session_by_external_id_service)
    ],
    task_data: Annotated[CreateTaskExecutionSchema, Body()],
) -> Tasks:
    """Create a new task execution."""

    # check that the queue has space to take the new task
    if (
        db_session.exec(
            select(func.count(col(Tasks.id))).where(
                col(Tasks.status).in_(
                    [
                        TaskStatus.queued,
                        TaskStatus.executing,
                    ]
                )
            )
        ).first()
        >= session.configuration.max_queue_size
    ):
        raise HTTPException(
            status_code=400, detail="Queue is full, please try again later"
        )

    # get user by external_id
    user = db_session.exec(
        select(User).where(User.external_id == task_data.external_user_id)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # get excercise
    excercise = db_session.exec(
        select(Exercise).where(Exercise.external_id == task_data.external_excercise_id)
    ).first()

    if not excercise:
        raise HTTPException(status_code=404, detail="Excercise not found")

    # check if the user has exceeded their task excution threshold for this session
    if (
        db_session.exec(
            select(func.count(col(Tasks.id))).where(Tasks.user_id == user.id)
        ).first()
        or 0 >= session.configuration.max_number_of_runs
    ):
        raise HTTPException(
            status_code=400,
            detail="User has exceeded their task execution threshold for this session",
        )

    # check if the user has exceeded their daily task excution threshold
    # first check that the user does not have a task in execution or pending
    if db_session.exec(
        select(Tasks).where(
            col(Tasks.user_id) == user.id,
            col(Tasks.status).in_(
                [
                    TaskStatus.executing,
                    TaskStatus.queued,
                ]
            ),
        )
    ).first():
        raise HTTPException(
            status_code=400,
            detail="User already has a task in execution queue",
        )

    # create the task and set its status to queued
    task = Tasks(
        status=TaskStatus.queued,
        user_id=user.id,
        exercise_id=excercise.id,
    )

    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)

    # TODO: add task execution to queue
    return task


def cancle_queued_task_service(
    db_session: Annotated[Session, Depends(require_db_session)],
    task: Annotated[Tasks, Depends(get_queued_task_by_id_service)],
) -> Tasks:
    """Cancel a queued task."""

    task.status = TaskStatus.cancelled
    db_session.add(task)
    db_session.commit()

    # TODO: Attempt to cancel the tasks celery process.
    return task
