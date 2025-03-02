import os

from sqlmodel import select

from src.core.config import settings
from src.events.handlers.base import AbstractLifeCycleEventHandler
from src.events.schemas import UserJoinEventData
from src.log import logger
from src.models import Session, User
from src.sandbox.ochestator.container import ContainerBuilder
from src.sandbox.ochestator.schemas import ContainerConfig


class UserJoinSessionHandler(AbstractLifeCycleEventHandler):
    """Handler user join session event."""

    def handle_event(
        self,
        external_session_id: str,
        event_data: UserJoinEventData,  # type: ignore
    ) -> None:
        """Handle session ended events."""
        # check if the user already has a container associated with them

        session = self.db_session.exec(
            select(Session).where(
                Session.external_id == external_session_id,
                Session.is_active == True,
            )
        ).first()

        if not session:
            logger.error("Active Session not found add user to")
            return

        user = self.db_session.exec(
            select(User).where(
                User.external_id == event_data.user_external_id,
                User.session_id == session.id,
            )
        ).first()

        if not user:
            logger.error("User not found in session.")
            return

        # create folder for the user.
        mount_dir = os.path.join(settings.TESTING_DIR, str(user.id))
        workdir = f"/{user.id}"
        os.makedirs(mount_dir, mode=0o777, exist_ok=True)

        container = ContainerBuilder(
            language_image=session.language_image,
            container_name=f"test_container_{user.id}",
            mount_dir=mount_dir,
            workdir=workdir,
            container_config=ContainerConfig(enable_network=False),
        ).get_or_create(command="sleep infinite", label="test")

        user.docker_container_id = container.id
        self.db_session.add(user)
        self.db_session.commit()
        logger.info(f"User {user.external_id} joined session {external_session_id}")
