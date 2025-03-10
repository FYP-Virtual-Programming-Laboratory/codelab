from docker.models.containers import Container

from src.models import Tasks
from src.sandbox.executor.base import BaseExecutor
from src.sandbox.ochestator.container import ContainerBuilder
from src.sandbox.ochestator.schemas import ContainerConfig


class TaskExecutor(BaseExecutor):
    def __init__(
        self,
        task: Tasks,
        workdir: str,
        mount_dir: str,
        container_config: ContainerConfig,
        retry_limit: int = 2,
    ):
        """Construct executor to execute a task."""
        self.task = task
        super().__init__(
            workdir=workdir,
            mount_dir=mount_dir,
            container_config=container_config,
            retry_limit=retry_limit,
        )

    def _get_container(self) -> Container:
        """Get a Container for the task."""

        container_id = None

        if self.task.user:
            # Get user's container
            container_id = self.task.user.docker_container_id
            language_image = self.task.user.session.language_image

        if self.task.group:
            # Get a default container
            container_id = self.task.group.docker_container_id
            language_image = self.task.user.session.language_image

        if not container_id or not language_image:
            raise ValueError(
                "Neither Container not Language image should be NULL at this point."
            )

        return ContainerBuilder(
            language_image=language_image,
            container_name=container_id,
            mount_dir=self.mount_dir,
            workdir=self.workdir,
            container_config=self.container_config,
        ).get_or_create(command="sleep infinite", label="test")
