import os

from sqlmodel import select

from src.core.config import settings
from src.events.handlers.base import AbstractLifeCycleEventHandler
from src.events.schemas import StudentJoinEventData
from src.log import logger
from src.models import Session, Student
from src.sandbox.ochestator.container import ContainerBuilder
from src.sandbox.ochestator.schemas import ContainerConfig


class StudentJoinSessionHandler(AbstractLifeCycleEventHandler):
    """Handler student join session event."""

    def handle_event(
        self,
        external_session_id: str,
        event_data: StudentJoinEventData,  # type: ignore
    ) -> None:
        """Handle session ended events."""
        # check if the student already has a container associated with them

        session = self.db_session.exec(
            select(Session).where(
                Session.external_id == external_session_id,
                Session.is_active == True,
            )
        ).first()

        if not session:
            logger.error("Active Session not found add student to")
            return

        student = self.db_session.exec(
            select(Student).where(
                Student.external_id == event_data.student_external_id,
                Student.session_id == session.id,
            )
        ).first()

        if not student:
            logger.error("Student not found in session.")
            return

        # create folder for the student.
        mount_dir = os.path.join(settings.TESTING_DIR, str(student.id))
        workdir = f"/{student.id}"
        os.makedirs(mount_dir, mode=0o777, exist_ok=True)

        container = ContainerBuilder(
            language_image=session.language_image,
            container_name=f"test_container_{student.id}",
            mount_dir=mount_dir,
            workdir=workdir,
            container_config=ContainerConfig(enable_network=False),
        ).get_or_create(command="sleep infinite", label="test")

        student.docker_container_id = container.id
        self.db_session.add(student)
        self.db_session.commit()
        logger.info(f"Student {student.external_id} joined session {external_session_id}")
