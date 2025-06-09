from typing import Any

from sqlmodel import col, update

from src.events.handlers.base import AbstractLifeCycleEventHandler
from src.models import Session, Task
from src.sandbox.tasks import prune_all_containers_task
from src.schemas import TaskStatus


class SessionEndedEventHandler(AbstractLifeCycleEventHandler):
    """Handler for session ended events."""

    def handle_event(
        self,
        external_session_id: str,
        event_data: Any,  # type: ignore
    ) -> None:
        """Handle session ended events."""

        # first deatcive the session
        self.db_session.exec(
            update(Session)
            .where(Session.external_id == external_session_id)
            .values(is_active=False)
        )
        self.db_session.commit()

        # mark all active / running student tasks as dropped
        self.db_session.exec(
            update(Task)
            .where(col(Task.status).in_(TaskStatus.queued, TaskStatus.executing))
            .values(task_status=TaskStatus.dropped)
        )

        self.db_session.commit()

        # next prune all test containers related to this session
        prune_all_containers_task(lable="test")
