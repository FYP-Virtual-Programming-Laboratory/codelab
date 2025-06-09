from docker.models.containers import Container

from src.external.schemas import CodeRepository
from src.models import ExerciseSubmission
from src.sandbox.executor.base import BaseExecutor
from src.sandbox.ochestator.container import ContainerBuilder
from src.sandbox.ochestator.schemas import ContainerConfig


class SubmissionExecutor(BaseExecutor):
    def __init__(
        self,
        workdir: str,
        mount_dir: str,
        submission: ExerciseSubmission,
        container_config: ContainerConfig,
        code_repository: CodeRepository,
        retry_limit: int = 2,
    ):
        """Construct executor to execute a task."""
        self.submission = submission
        super().__init__(
            workdir=workdir,
            mount_dir=mount_dir,
            container_config=container_config,
            retry_limit=retry_limit,
            code_repository=code_repository,
        )

    def _get_container(self) -> Container:
        """Get a Container for the task."""

        container_id = None
        language_image = self.submission.exercise.session.language_image

        if self.submission.student:
            # Get student's container
            container_id = f'submission-{self.submission.student.docker_container_id}'

        if self.submission.group:
            # Get group container
            container_id = f'submission-{self.submission.group.docker_container_id}'

        if not container_id:
            raise ValueError("Container id should not be NULL at this point.")

        self._mount_code_repository()

        return ContainerBuilder(
            language_image=language_image,
            container_name=container_id,
            mount_dir=self.mount_dir,
            workdir=self.workdir,
            container_config=self.container_config,
        ).get_or_create(command="sleep infinite", label="submission")
