from celery import Celery, Task
from celery.schedules import crontab
from celery.signals import task_postrun, task_prerun

from src.core.config import settings
from src.log import logger as main_logger

celery_app = Celery(
    __name__, include=["src.worker", "src.events.tasks", "src.sandbox.tasks"]
)
celery_app.conf.broker_url = settings.CELERY_BROKER_URL
celery_app.conf.result_backend = settings.CELERY_RESULT_BACKEND
celery_app.conf.task_default_queue = settings.CELERY_DEFAULT_QUEUE
celery_app.conf.broker_connection_retry_on_startup = True


@task_prerun.connect
def _log_task_before_run(task_id: str, task: Task, *args, **kwargs) -> None:  # type: ignore  # noqa
    """Log task before it runs."""
    main_logger.info(f"Stating task: {task.name}")


@task_postrun.connect
def _log_task_after_run(task_id: str, task: Task, *args, **kwargs) -> None:  # type: ignore  # noqa
    """Log task after it runs."""
    main_logger.info(f"Task {task.name} finished")


celery_app.conf.beat_schedule = {
    "cleanup_handing_builds_tasks": {
        "task": "cleanup_handing_builds_tasks",
        "schedule": crontab(minute="*/5"),  # Runs every 5 minutes
    },
    "execute_scheduled_build_actions_task": {
        "task": "execute_scheduled_build_actions_task",
        "schedule": crontab(minute="*/5"),  # Runs every minutes
    },
}
