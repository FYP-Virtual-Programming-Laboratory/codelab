from src.events.enums import LifeCycleEvent

from .base import AbstractLifeCycleEventHandler
from .session_created_event import SessionCreatedEventHandler
from .session_ended_event import SessionEndedEventHandler
from .user_join_event import UserJoinSessionHandler

MAP: dict[LifeCycleEvent, type[AbstractLifeCycleEventHandler]] = {
    LifeCycleEvent.SESSION_CREATED: SessionCreatedEventHandler,  # type: ignore
    LifeCycleEvent.SESSION_ENDED: SessionEndedEventHandler,  # type: ignore
    LifeCycleEvent.USER_JOIN: UserJoinSessionHandler,  # type: ignore
}


__all__ = ["MAP"]
