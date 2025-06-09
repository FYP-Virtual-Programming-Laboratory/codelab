from datetime import datetime
from uuid import UUID

from docker.errors import DockerException
from docker.models.containers import Container
from sqlmodel import Session, col, select

from src.core.config import settings
from src.core.db import engine
from src.core.docker import get_shared_docker_client
from src.external.exceptions import PullRepositoryException
from src.log import logger
from src.models import ExerciseSubmission, LanguageImage, Task
from src.models import Session as WorkflowSession
from src.sandbox.manager import ExecutionFailedError, ResourceManager
from src.sandbox.ochestator.image import ImageBuilder
from src.sandbox.schemas import ExecutionLogSchema
from src.sandbox.types import CONTAINER_LABEL
from src.schemas import ImageStatus, TaskStatus
from src.utils import CeleryHelper
from src.worker import celery_app
from src.external.utils import pull_excercise_repository


@celery_app.task(
    name="build_language_image_task",
    queue=settings.CELERY_EXECUTION_QUEUE,
)
def build_language_image_task(image_id: UUID) -> None:
    """Build a language image."""

    # do not build while pruning containers
    if CeleryHelper.is_being_executed(["prune_all_containers_task"]):
        return

    with Session(engine) as db_session:
        language_image = db_session.exec(
            select(LanguageImage).where(LanguageImage.id == image_id)
        ).first()

        if not language_image:
            return

        # create and run a new Docker image builder
        builder = ImageBuilder(db_session, language_image)
        builder.run()


@celery_app.task(name="cleanup_handing_builds_tasks")
def cleanup_handing_builds_tasks() -> None:
    """Mark all hanging langauge builds as  failed."""

    # first check that no build is in progress
    if CeleryHelper.is_being_executed(["build_language_image_task"]):
        return

    # get all hanging builds and mark them as failed
    with Session(engine) as db_session:
        for language_image in db_session.exec(
            select(LanguageImage).filter(
                col(LanguageImage.status).in_(
                    [
                        ImageStatus.building,
                        ImageStatus.testing,
                    ]
                )
            )
        ).all():
            corresponding_failed_status = {
                ImageStatus.building: ImageStatus.build_failed,
                ImageStatus.testing: ImageStatus.testing_failed,
            }

            if language_image.status == ImageStatus.testing:
                language_image.failure_message = (
                    "Testing failed catastrophicly: Container crashed during testing..."
                )
            else:
                language_image.failure_message = "Build failed for unhandled reasons. Please reach out to the developers."

            language_image.status = corresponding_failed_status.get(
                language_image.status, ImageStatus.failed
            )

            db_session.add(language_image)
            db_session.commit()


@celery_app.task(name="execute_scheduled_build_actions_task")
def execute_scheduled_build_actions_task() -> None:
    """Execute scheduled build actions."""

    # get all scheduled builds and execute them
    with Session(engine) as db_session:
        language_image = db_session.exec(
            select(LanguageImage)
            .filter(
                col(LanguageImage.status).in_(
                    [
                        ImageStatus.scheduled_for_rebuild,
                        ImageStatus.scheduled_for_deletion,
                        ImageStatus.scheduled_for_prune,
                    ]
                )
            )
            .order_by(col(LanguageImage.updated_at))
        ).first()

        if not language_image:
            return

        # ensuer that its moved to the bottom of the queue after this attempt
        language_image.updated_at = datetime.now()
        db_session.add(language_image)
        db_session.commit()

        if language_image.status == ImageStatus.scheduled_for_rebuild:
            # first check that no build is in progress
            if not CeleryHelper.is_being_executed(["build_language_image_task"]):
                build_language_image_task.delay(image_id=language_image.id)
            return

        if language_image.status == ImageStatus.scheduled_for_deletion:
            builder = ImageBuilder(db_session, language_image)
            successful = builder.remove()
            if successful:
                db_session.delete(language_image)
                db_session.commit()

        if language_image.status == ImageStatus.scheduled_for_prune:
            builder = ImageBuilder(db_session, language_image)
            successful = builder.remove()
            if successful:
                language_image.status = ImageStatus.unavailable
                db_session.add(language_image)
                db_session.commit()


@celery_app.task(name="prune_all_containers_task")
def prune_all_containers_task(lable: CONTAINER_LABEL | None = None) -> None:
    """Prune all Docker containers."""

    # first check that no build is in progress
    if CeleryHelper.is_being_executed(["build_language_image_task"]):
        return

    # get all unscheduled builds and mark them as unavailable
    with Session(engine) as db_session:
        # next check that no sesion are active

        active_session = db_session.exec(
            select(WorkflowSession).where(WorkflowSession.is_active == True)
        ).first()

        if active_session:
            return

    try:
        client = get_shared_docker_client()
        containers: list[Container] = client.containers.list(
            ignore_removed=True,
            filters=[f"label={lable}"] if lable else [],
        )
        for container in containers:
            container.remove(force=True, v=True)
    except DockerException as error:
        logger.exception("Unable to prune Docker containers. %s", error)


def _update_execution_log(
    db_session: Session, 
    request: Task | ExerciseSubmission,
    message: str,
) -> None:
    """Update task execution log."""
    execution_logs = list(request.execution_logs)
    execution_logs.append(
        ExecutionLogSchema(
            timestamp=str(datetime.now()), message=message
        ).model_dump()        
    )
    request.execution_logs = execution_logs
    db_session.add(request)
    db_session.commit()
    db_session.refresh(request)


@celery_app.task(
    name="program_execution_queue",
    queue=settings.CELERY_EXECUTION_QUEUE,
)
def program_execution_queue(
    task_id: UUID | None = None, 
    submission_id: UUID | None = None
) -> None:
    """Execute queued program execution request."""

    assert task_id is not None or submission_id is not None, "task_id or submission_id must be provided"

    with Session(engine) as db_session:
        request: Task | ExerciseSubmission | None = None
        
        if task_id:
            request = db_session.exec(
                select(Task).where(Task.id == task_id, Task.status == TaskStatus.queued)
            ).first()
        
        elif submission_id:
            request = db_session.exec(
                select(ExerciseSubmission).where(
                    ExerciseSubmission.id == submission_id, 
                    ExerciseSubmission.status == TaskStatus.queued,
                )
            ).first() 

        if not request:
            logger.error(
                "src::sandbox:tasks::program_execution_queue:: "
                "Program execution request not found or is no longer in queue.",
                extra={
                    'task_id': str(task_id),
                    'submission_id': str(submission_id),
                }
            )
            return

        # set task status to executing
        request.status = TaskStatus.executing
        _update_execution_log(
            db_session=db_session,
            request=request,
            message='Execution started.',
        )

        try:
            # pull code repository from codecollab repository
            # set execution log to pulling code repository
            _update_execution_log(
                db_session=db_session,
                request=request,
                message='Pulling code repository.',
            )
            code_repository = pull_excercise_repository(
                request.exercise_id, 
                request.exercise.session_id,
            )
            _update_execution_log(
                db_session=db_session,
                request=request,
                message='Repository pulled successfully.',
            )
        except PullRepositoryException as error:
            logger.exception(
                "src::sandbox:tasks::program_execution_queue:: "
                "Repository pull failed.",
                extra={
                    'task_id': str(task_id),
                    'submission_id': str(submission_id),
                    "session_id": str(request.exercise.session_id),
                    "error_message": error.message,
                }
            )

            request.status = TaskStatus.dropped
            _update_execution_log(
                request=request,
                db_session=db_session,
                message='Service error. Aboriting, failed to pull code repository.',
            )
            return

        _update_execution_log(
            request=request,
            db_session=db_session,
            message='Executing program.',
        )

        try:
            manager = ResourceManager()
            execution_result = manager.execute(
                request=request,
                code_repository=code_repository, 
            )

            request.results = [
                result.model_dump()
                for result in execution_result
            ]
            request.status = TaskStatus.executed
            _update_execution_log(
                db_session=db_session,
                request=request,
                message='Execution completed.',
            )
        except ExecutionFailedError as error:
            request.status = TaskStatus.dropped
            _update_execution_log(
                request=request,
                db_session=db_session,
                message=f'Service error: Aborting, failed to execute program. {error}',
            )

