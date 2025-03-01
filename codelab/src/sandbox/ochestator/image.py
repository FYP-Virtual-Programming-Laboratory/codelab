import base64
import os
import time
from functools import cached_property
from io import BytesIO

from docker.errors import (  # type: ignore
    APIError,
    BuildError,
    DockerException,
    NotFound,
)
from docker.models.containers import Container  # type: ignore
from docker.models.images import Image  # type: ignore
from sqlmodel import Session

from src.core.config import settings
from src.core.docker import get_authenticated_docker_client
from src.log import logger
from src.models import LanguageImage
from src.schemas import ImageStatus

bytes_size = 152279515
BYTES_PER_MB_BINARY = 1_048_576  # 2^20 bytes, binary definition


class ImageBuilder:
    """
    A class to build, push, pull, and test Docker images based on a language image record.
    """

    def __init__(self, db_session: Session, language_image: LanguageImage) -> None:
        self.db_session = db_session
        self.language_image = language_image
        self.docker_client = get_authenticated_docker_client()

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
            image.tag(
                repository=settings.DOCKER_HUB_NAMESPACE,
                tag=str(self.language_image.id),
            )
            image.save()
        except (BuildError, APIError) as error:
            self._update_status(ImageStatus.build_failed, failure_message=str(error))
            logger.error(
                f"Failed to build language image {self.language_image.name}: {error}",
                extra={"image_id": self.language_image.id, "error": str(error)},
            )
            return None

        self.language_image.docker_image_id = image.id
        self.language_image.build_logs = list(build_logs)  # type: ignore
        self._update_status(ImageStatus.build_succeeded)

    def _push(self) -> None:
        """
        Pushes the Docker image to Docker Hub and updates the language image status.
        """
        self._update_status(ImageStatus.pushing)
        try:
            response = self.docker_client.images.push(
                repository=settings.DOCKER_HUB_NAMESPACE,
                tag=str(self.language_image.id),
                stream=True,
                decode=True,
            )
        except APIError as error:
            self._update_status(ImageStatus.push_failed, failure_message=str(error))
            logger.error(
                f"Failed to push language image {self.language_image.name} to Docker Hub: {error}",
                extra={"image_id": self.language_image.id, "error": str(error)},
            )
            return

        self.language_image.push_logs = list(response)  # type: ignore
        self._update_status(ImageStatus.pushed)

    def run(self) -> None:
        """
        Attempts to build and then push the Docker image.
        """
        self._build()

        if self.language_image.status == ImageStatus.build_succeeded:
            self._push()

    def __get_image_size(self, image: Image) -> str | None:
        # Check if image size is available
        if "Size" in image.attrs:
            return f"{image.attrs['Size'] // BYTES_PER_MB_BINARY:.2f} MB"
        return None

    def pull(self) -> None:
        """
        Pulls the Docker image from Docker Hub and updates the language image status.
        """
        self._update_status(ImageStatus.pulling)
        try:
            image = self.docker_client.images.pull(
                repository=settings.DOCKER_HUB_NAMESPACE,
                tag=str(self.language_image.id),
            )
        except APIError as error:
            self._update_status(ImageStatus.pull_failed, failure_message=str(error))
            logger.error(
                f"Failed to pull language image {self.language_image.name} from Docker Hub: {error}",
                extra={"image_id": self.language_image.id, "error": str(error)},
            )
            return

        self.language_image.docker_image_id = image.id
        self.language_image.image_size = self.__get_image_size(image)
        self.language_image.image_architecture = image.attrs.get("Architecture", "")
        self._update_status(ImageStatus.available)

    def _execute_command(
        self, container: Container, command: str, workdir: str
    ) -> tuple[int, tuple[bytes | None, bytes | None]]:
        """
        Executes a command inside the container.
        Returns a tuple of (exit_code, (stdout, stderr)).
        """
        try:
            full_cmd = f"bash -c '{command}'"
            return container.exec_run(
                cmd=full_cmd,
                workdir=workdir,
                demux=True,
                tty=False,
            )
        except DockerException as error:
            logger.error(
                f"Failed to execute command in container {container.id}: {error}",
                extra={"container_id": container.id, "error": str(error)},
            )
            return -1, (b"", b"")

    def test(self) -> None:
        """
        Tests the Docker image by writing a build test file, running the container,
        and executing the test commands (with or without compilation).
        """
        self._update_status(ImageStatus.testing)

        # Write build test file
        build_file_name = f"build_test.{self.language_image.file_extension}"
        build_file_path = os.path.join(self._image_folder, build_file_name)

        with open(build_file_path, "w") as file:
            file.write(self.language_image.build_test_file_content)  # type: ignore

        os.chmod(build_file_path, 0o755)

        workdir = f"/{self.language_image.id}"
        image = self.docker_client.images.get(self.language_image.docker_image_id)

        try:
            container = self.docker_client.containers.run(
                image=image,
                detach=True,
                command="sleep infinite",
                volumes={self._image_folder: {"bind": workdir, "mode": "rw"}},
                name=f"tests-image-{self.language_image.id}",
                working_dir=workdir,
                shm_size="2G",
            )
        except APIError as error:
            if error.status_code == 409:
                logger.error(
                    f"Failed to start tests container for language image {self.language_image.name}: {error}",
                    extra={"image_id": self.language_image.id, "error": str(error)},
                )
                try:
                    container = self.docker_client.containers.get(
                        f"tests-image-{self.language_image.id}"
                    )
                    container.stop()
                    container.remove(v=True)
                except NotFound:
                    logger.error(
                        "No test container found: Container was already removed"
                    )

                return self.test()

            self._update_status(
                ImageStatus.testing_failed,
                failure_message=f"Failed to run tests: {error}",
            )
            return

        # Wait for container to be fully running
        while container.status != "running":
            logger.info(
                "Waiting for container to start: status is %s", container.status
            )
            time.sleep(0.5)
            container.reload()

        if self.language_image.requires_compilation:
            # Compile test file
            compile_filename = (
                f"build_test.{self.language_image.compile_file_extension}"
            )
            compile_command = self.language_image.compilation_command.replace(  # type: ignore
                "<filename>", build_file_name
            ).replace("<output_filename>", compile_filename)
            exit_code, (_, std_err) = self._execute_command(
                container, compile_command, workdir
            )
            if exit_code != 0:
                logger.error("Failed to compile: %s", std_err)
                self._update_status(
                    ImageStatus.testing_failed,
                    failure_message=f"Compilation failed with exit code {exit_code}: {std_err}",
                )
                return

            # Execute compiled file
            std_in = self.language_image.build_test_std_in
            execution_command = self.language_image.default_execution_command.replace(
                "<filename>", compile_filename
            )
            exit_code, (std_out, std_err) = self._execute_command(
                container, f"{execution_command} <<< '{std_in}'", workdir
            )
            if exit_code != 0:
                logger.error("Error executing" + execution_command + ": " + std_err)
                self._update_status(
                    ImageStatus.testing_failed,
                    failure_message=f"Execution failed with exit code {exit_code}: {std_err} {std_out}",
                )
                return

            self.language_image.build_test_std_out = (
                std_out.decode("utf-8") if std_out else None
            )
        else:
            # Execute test file directly
            std_in = self.language_image.build_test_std_in
            execution_command = self.language_image.default_execution_command.replace(
                "<filename>", build_file_name
            )
            exit_code, (std_out, std_err) = self._execute_command(
                container, f"{execution_command} <<< '{std_in}'", workdir
            )
            if exit_code != 0:
                self._update_status(
                    ImageStatus.testing_failed,
                    failure_message=f"Execution failed with exit code {exit_code}: {std_err} {std_out}",
                )
                return

            self.language_image.build_test_std_out = (
                std_out.decode("utf-8") if std_out else None
            )

        self._update_status(ImageStatus.available)
        container.stop()
        container.remove(v=True)

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
