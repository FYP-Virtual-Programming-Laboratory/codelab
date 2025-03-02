import docker  # type: ignore
import docker.errors  # type: ignore

from src.log import logger


def get_shared_docker_client() -> docker.DockerClient:
    """Get a shared Docker client."""
    try:
        client = docker.from_env()
        return client
    except docker.errors.DockerException:
        logger.exception("Unable to connect to docker server.")
        raise RuntimeError("Unable to connect to docker server")
