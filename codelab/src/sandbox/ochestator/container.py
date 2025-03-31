from docker.errors import (  # type: ignore
    APIError,
    ContainerError,
    ImageNotFound,
    NotFound,
)
from docker.models.containers import Container
from docker.types import Ulimit

from src.core.docker import get_shared_docker_client
from src.models import LanguageImage
from src.sandbox.ochestator.schemas import ContainerConfig
from src.sandbox.types import CONTAINER_LABEL


class ContainerBuilderErrors(Exception):
    def __init__(self, exit_code: int, error_message: str):
        super().__init__(exit_code, error_message)
        self.exit_code = exit_code
        self.error_message = error_message


class ContainerBuildFailed(ContainerBuilderErrors):
    """Container build failed."""
    pass


class ContainerNotFound(ContainerBuilderErrors):
    """Container not found."""
    pass

class ContainerBuilder:
    def __init__(
        self,
        language_image: LanguageImage,
        mount_dir: str | None = None,
        workdir: str | None = None,
        container_name: str | None = None,
        container_config: ContainerConfig | None = None,
    ):
        self.language_image = language_image
        self.docker_client = get_shared_docker_client()
        self.container_config = container_config
        self.mount_dir = mount_dir
        self.workdir = workdir
        self.container_name = container_name

    def _assert_volume_config(self) -> None:
        """
        Assert that the volume configuration is valid.
        """
        if self.mount_dir is None or self.workdir is None:
            raise ValueError("mount_dir and work_dir need to be set")

    def _assert_container_name(self) -> None:
        """
        Assert that the container name is provided.
        """
        if not self.container_name:
            raise ValueError("Container name must be provided")

    def _get_container_config(self) -> list[Ulimit] | None:
        """
        Convert ContainerConfig to a list of Docker ulimit dictionaries.

        Args:
            config (ContainerConfig): The container configuration with resource limits.

        Returns:
            list[dict[str, int]]: A list of dictionaries specifying ulimit names and their soft/hard limits.
        """

        if not self.container_config:
            return None

        ulimits = [
            # CPU time limit (in minutes)
            Ulimit(
                name="cpu",
                soft=self.container_config.cpu_time_limit_minutes,
                hard=self.container_config.cpu_time_limit_minutes,
            ),
            # Address space limit (already in KB)
            Ulimit(
                name="as",
                soft=self.container_config.memory_limit_kb,
                hard=self.container_config.memory_limit_kb,
            ),
            # Process limit
            Ulimit(
                name="nproc",
                soft=self.container_config.max_processes,
                hard=self.container_config.max_processes,
            ),
            # File size limit (already in KB)
            Ulimit(
                name="fsize",
                soft=self.container_config.max_file_size_kb,
                hard=self.container_config.max_file_size_kb,
            ),
            Ulimit(
                name="nofile",
                soft=self.container_config.max_open_files,
                hard=self.container_config.max_open_files_hard,
            ),
            Ulimit(
                name="stack",
                soft=self.container_config.stack_size_kb,
                hard=self.container_config.stack_size_kb,
            ),
        ]
        return ulimits

    def create_container(
        self,
        command: str | None = None,
        label: CONTAINER_LABEL | None = None,
    ) -> Container:
        """Build a Container."""

        self._assert_volume_config()

        try:
            image = self.docker_client.images.get(self.language_image.docker_image_id)
            container = self.docker_client.containers.create(
                image=image,
                detach=True,
                command=command,
                name=self.container_name,
                volumes={self.mount_dir: {"bind": self.workdir, "mode": "rw"}},
                # ulimits=self._get_container_config(),
                labels=[label] if label is not None else None,
                network_disabled=(not self.container_config.enable_network)
                if self.container_config
                else False,
            )

            return container
        except ContainerError as error:
            raise ContainerBuildFailed(
                exit_code=error.exit_status,
                error_message=f"Container creation failed with std_err: `{error.stderr}`",
            ) from error
        except ImageNotFound as error:
            raise ContainerBuildFailed(
                exit_code=-1024,
                error_message=f"Container creation image not found: `{error}`",
            ) from error
        except APIError as error:
            raise ContainerBuildFailed(
                exit_code=-1024,
                error_message=f"Container creation Docker API error: `{error}`",
            ) from error

    def get_container(self) -> Container:
        """Get a Container."""

        self._assert_container_name()

        try:
            container = self.docker_client.containers.get(self.container_name)
            return container
        except NotFound:
            raise ContainerNotFound(
                exit_code=-1024,
                error_message=f"Container '{self.container_name}' not found",
            ) from None

    def get_or_create(
        self,
        command: str | None = None,
        label: CONTAINER_LABEL | None = None,
    ) -> Container:
        """Get or create a Container."""

        try:
            return self.create_container(command=command, label=label)
        except ContainerBuildFailed as build_failure:
            # try to get the container
            try:
                return self.get_container()
            except ContainerNotFound as error:
                raise build_failure from error
