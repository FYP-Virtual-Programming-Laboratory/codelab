from sqlmodel import Session

from src.core.docker import get_authenticated_docker_client
from src.models import LanguageImage


class ContainerBuilder:
    def __init__(
        self,
        db_session: Session,
        language_image: LanguageImage,
    ):
        self.language_image = language_image
        self.docker_client = get_authenticated_docker_client
        self.db_session = db_session
