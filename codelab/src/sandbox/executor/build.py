from docker.models.containers import Container

from src.models import LanguageImage
from src.sandbox.executor.base import BaseExecutor
from src.sandbox.ochestator.container import ContainerBuilder
from src.sandbox.ochestator.schemas import ContainerConfig


class ImageBuildExecutor(BaseExecutor):
    def __init__(
        self,
        language_image: LanguageImage,
        workdir: str,
        mount_dir: str,
    ):
        """Construct executor to execute a image build."""
        self.language_image = language_image
        super().__init__(
            workdir=workdir,
            mount_dir=mount_dir,
            container_config=ContainerConfig(),
            retry_limit=0,
        )

    def _get_container(self) -> Container:
        """Get a Container for the task."""
        container_id = f"tests-image-{self.language_image.id}"

        return ContainerBuilder(
            language_image=self.language_image,
            container_name=container_id,
            mount_dir=self.mount_dir,
            workdir=self.workdir,
            container_config=self.container_config,
        ).get_or_create(command="sleep infinite", label="build")
