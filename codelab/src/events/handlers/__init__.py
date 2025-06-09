from src.events.enums import LifeCycleEvent

from .base import AbstractLifeCycleEventHandler
from .session_created_event import SessionCreatedEventHandler
from .session_ended_event import SessionEndedEventHandler
# from .student_join_event import StudentJoinSessionHandler

MAP: dict[LifeCycleEvent, type[AbstractLifeCycleEventHandler]] = {
    LifeCycleEvent.SESSION_CREATED: SessionCreatedEventHandler,  # type: ignore
    LifeCycleEvent.SESSION_ENDED: SessionEndedEventHandler,  # type: ignore
    # LifeCycleEvent.STUDENT_JOIN: StudentJoinSessionHandler,  # type: ignore
}


__all__ = ["MAP"]
