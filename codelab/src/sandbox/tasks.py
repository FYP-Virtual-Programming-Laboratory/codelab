from uuid import UUID

from sqlmodel import Session, col, select

from src.core.config import settings
from src.core.db import engine
from src.models import LanguageImage
from src.sandbox.ochestator.builder import ImageBuilder
from src.schemas import ImageStatus
from src.utils import CeleryHelper
from src.worker import celery_app


@celery_app.task(name="build_language_image_task", queue=settings.CELERY_BUILD_QUEUE)
def build_language_image_task(image_id: UUID) -> None:
    """Build a language image."""

    with Session(engine) as db_session:
        language_image = db_session.exec(
            select(LanguageImage).where(LanguageImage.id == image_id)
        ).first()

        if not language_image:
            return

        # create and run a new Docker image builder
        builder = ImageBuilder(db_session, language_image)
        builder.run()

        # enqueue a celery task to pull the image asynchronously
        # send the languge image into sysbox worker to pull the image
        if language_image.status == ImageStatus.pushed:
            pull_language_image_task.delay(image_id=image_id)


@celery_app.task(
    name="pull_language_image_task",
    queue=settings.CELERY_BUILD_QUEUE_SYSBOX,
)
def pull_language_image_task(image_id: UUID) -> None:
    """Pull a language image."""

    with Session(engine) as db_session:
        language_image = db_session.exec(
            select(LanguageImage).where(LanguageImage.id == image_id)
        ).first()

        if not language_image:
            return

        builder = ImageBuilder(db_session, language_image)
        builder.pull()

        # # if language  was pulled successfully run tests if requested
        if language_image.status == ImageStatus.available and language_image.test_build:
            builder.test()


@celery_app.task(name="cleanup_handing_builds_tasks")
def cleanup_handing_builds_tasks() -> None:
    """Mark all hanging langauge builds as  failed."""

    # first check that no build is in progress
    if CeleryHelper.is_being_executed(
        "build_language_image_task"
    ) or CeleryHelper.is_being_executed("build_language_image_task"):
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
            language_image.status = corresponding_failed_status.get(
                language_image.status, ImageStatus.failed
            )

            if language_image.status == ImageStatus.testing:
                language_image.failure_message = (
                    "Testing failed catastrophicly: Container crashed during testing..."
                )
            else:
                language_image.failure_message = "Build failed for unknown reasons. Please reach out to the developers."

            db_session.add(language_image)
            db_session.commit()
