import docker  # type: ignore
import docker.errors  # type: ignore

from src.core.config import settings
from src.log import logger


def get_shared_docker_client() -> docker.DockerClient:
    """Get a shared Docker client."""
    try:
        client = docker.from_env()
        return client
    except docker.errors.DockerException:
        logger.exception("Unable to connect to docker server.")
        raise RuntimeError("Unable to connect to docker server")


def get_authenticated_docker_client() -> docker.DockerClient:
    """Get an authenticated Docker client."""
    try:
        client = get_shared_docker_client()
        client.login(
            username=settings.DOCKER_HUB_USERNAME,
            password=settings.DOCKER_HUB_PASSWORD,
        )
    except docker.errors.DockerException:
        logger.exception("Unable to connect to docker server with TLS.")
        raise RuntimeError("Unable to connect to docker server with TLS")

    return client
