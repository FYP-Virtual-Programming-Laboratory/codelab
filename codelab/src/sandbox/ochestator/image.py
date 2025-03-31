import base64
import os
from functools import cached_property
from io import BytesIO

from docker.errors import (  # type: ignore
    APIError,
    BuildError,
)
from docker.models.images import Image  # type: ignore
from sqlmodel import Session

from src.core.config import settings
from src.core.docker import get_shared_docker_client
from src.log import logger
from src.models import LanguageImage
from src.sandbox.executor.build import ImageBuildExecutor
from src.sandbox.ochestator.container import (
    ContainerBuildFailed,
    ContainerNotFound,
)
from src.schemas import ImageStatus

BYTES_PER_MB_BINARY = 1_048_576  # 2^20 bytes, binary definition


class ImageBuilder:
    """
    A class to build, push, pull, and test Docker images based on a language image record.
    """

    def __init__(self, db_session: Session, language_image: LanguageImage) -> None:
        self.db_session = db_session
        self.language_image = language_image
        self.docker_client = get_shared_docker_client()

    @cached_property
    def _image_folder(self) -> str:
        """
        Returns the folder path for the Docker image and ensures it exists.
        """
        folder = os.path.join(
            settings.FILESYSTEM_DIR, "images", str(self.language_image.id)
        )
        os.makedirs(folder, mode=0o777, exist_ok=True)
        return folder

    def _update_status(
        self, status: ImageStatus, failure_message: str | None = None
    ) -> None:
        """
        Helper to update the language image status and commit the change.
        """
        self.language_image.status = status
        if failure_message:
            self.language_image.failure_message = failure_message
        self.db_session.add(self.language_image)
        self.db_session.commit()

    def _create_entrypoint_commands(self) -> str:
        """
        Returns Dockerfile commands to create and execute an entrypoint script.
        """
        if not self.language_image.entrypoint_script:
            return ""
        encoded_script = base64.b64encode(
            self.language_image.entrypoint_script.encode()
        ).decode()
        return (
            "RUN mkdir -p /scripts \n"
            f'RUN echo "{encoded_script}" | base64 -d > /scripts/entrypoint.sh \n'
            "RUN echo cat /scripts/entrypoint.sh \n"
            "RUN chmod +x /scripts/entrypoint.sh \n"
            "RUN /scripts/entrypoint.sh \n"
        )

    def _construct_docker_file(self) -> BytesIO:
        """
        Constructs the Dockerfile as a BytesIO object.
        """
        dockerfile = (
            f"FROM {self.language_image.base_image}\n"
            f"WORKDIR /{self.language_image.id}\n\n"
            "# Add bash so we can run bash commands\n"
            "RUN apk update && apk add bash\n\n"
            f"{self._create_entrypoint_commands()}\n"
            "# Set the default command to run when the container starts\n"
            'CMD ["bash"]\n'
        )
        logger.debug("Constructed Dockerfile:\n%s", dockerfile)
        return BytesIO(dockerfile.encode("utf-8"))

    def _build(self) -> None:
        """
        Builds the Docker image and updates the language image status.
        Returns the built Image or None if the build failed.
        """
        self._update_status(ImageStatus.building)
        dockerfile = self._construct_docker_file()

        try:
            image, build_logs = self.docker_client.images.build(
                pull=True,
                fileobj=dockerfile,
                tag=str(self.language_image.id),
            )
        except (BuildError, APIError) as error:
            self._update_status(ImageStatus.build_failed, failure_message=str(error))
            logger.error(
                f"Failed to build language image {self.language_image.name}: {error}",
                extra={"image_id": self.language_image.id, "error": str(error)},
            )
            return None

        self.language_image.docker_image_id = image.id
        self.language_image.image_size = self.__get_image_size(image)
        self.language_image.image_architecture = image.attrs.get("Architecture", "")
        self.language_image.docker_image_id = image.id
        self.language_image.build_logs = list(build_logs)  # type: ignore
        self._update_status(ImageStatus.build_succeeded)

    def run(self) -> None:
        """
        Attempts to build and then push the Docker image.
        """
        self._build()
        if (
            self.language_image.status == ImageStatus.build_succeeded
            and self.language_image.test_build
        ):
            self.test()
        elif (self.language_image.status == ImageStatus.build_succeeded):
            self._update_status(ImageStatus.available)

    def __get_image_size(self, image: Image) -> str | None:
        # Check if image size is available
        if "Size" in image.attrs:
            return f"{image.attrs['Size'] // BYTES_PER_MB_BINARY:.2f} MB"
        return None

    def test(self) -> None:
        """
        Tests the Docker image by writing a build test file, running the container,
        and executing the test commands (with or without compilation).
        """
        self._update_status(ImageStatus.testing)

        # Write build test file
        build_file_name = f"BuildTest.{self.language_image.file_extension}"
        build_file_path = os.path.join(self._image_folder, build_file_name)

        with open(build_file_path, "w") as file:
            file.write(self.language_image.build_test_file_content)  # type: ignore

        os.chmod(build_file_path, 0o755)
        workdir = f"/{self.language_image.id}"

        try:
            executor = ImageBuildExecutor(
                workdir=workdir,
                mount_dir=self._image_folder,
                language_image=self.language_image,
            )

            execution_command = self.language_image.default_execution_command.replace(
                "<filename>", build_file_name
            )

            if self.language_image.requires_compilation:
                # Compile test file
                compile_filename = (
                    f"BuildTest.{self.language_image.compile_file_extension}"
                )
                compile_command = self.language_image.compilation_command.replace(  # type: ignore
                    "<filename>", build_file_name
                ).replace("<output_filename>", compile_filename)

                result = executor.run(command=compile_command, is_compilation=True)
                if result.state != "success":
                    logger.error(
                        f"Compilation failed with exit code {result.exit_code}: {result.std_err}"
                    )
                    self._update_status(
                        ImageStatus.testing_failed,
                        failure_message=(
                            f"Compilation failed with exit code {result.exit_code}: {result.std_err} \n"
                            f"Result state: {result.state}\n"
                            f"Expended time: {result.expended_time}\n"
                        ),
                    )
                    return

                execution_command = (
                    self.language_image.default_execution_command.replace(
                        "<filename>", compile_filename
                    )
                )

            # after compilation execute the program itself
            result = executor.run(command=execution_command, remove_container=True)
            if result.state != "success":
                logger.error(
                    f"Execution failed with exit code {result.exit_code}: {result.std_err}"
                )
                self._update_status(
                    ImageStatus.testing_failed,
                    failure_message=(
                        f"Test Program Execution failed with exit code {result.exit_code}: {result.std_err} \n"
                        f"Result state: {result.state}\n"
                        f"Expended time: {result.expended_time}\n"
                    ),
                )
                return

            self.language_image.build_test_std_out = result.std_out
            self._update_status(ImageStatus.available)
        except (ContainerBuildFailed, ContainerNotFound) as error:
            logger.error(
                f"An error occurred while building the container Error: {error.error_message}",
                extra={"image_id": self.language_image.id, "error": str(error)},
            )
            self._update_status(
                ImageStatus.testing_failed,
                failure_message=(
                    "Container creation failed with exit_code "
                    f"{error.exit_code} : {error.error_message}"
                ),
            )

    def remove(self) -> bool:
        """Removes the Docker image."""

        try:
            self.docker_client.images.remove(
                image=self.language_image.docker_image_id,
                force=True,
                noprune=False,
            )
            return True
        except APIError as error:
            logger.error(
                f"Failed to remove language image {self.language_image.name}: {error}",
                extra={"image_id": self.language_image.id, "error": str(error)},
            )

        return False
