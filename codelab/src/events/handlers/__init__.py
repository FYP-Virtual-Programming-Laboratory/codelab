from src.events.enums import LIfeCycleEvent

from .base import AbstractLifeCycleEventHandler
from .session_created_event import SessionCreatedEventHandler
from .session_ended_event import SessionEndedEventHandler

MAP: dict[LIfeCycleEvent, type[AbstractLifeCycleEventHandler]] = {
    LIfeCycleEvent.SESSION_CREATED: SessionCreatedEventHandler,
    LIfeCycleEvent.SESSION_ENDED: SessionEndedEventHandler,
}


__all__ = ["MAP"]
