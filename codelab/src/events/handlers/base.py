from abc import ABC, abstractmethod
from typing import Any

from sqlmodel import Session


class AbstractLifeCycleEventHandler(ABC):
    """Abstract base class for lifecycle event handlers."""

    def __init__(self, db_session: Session) -> None:
        """Initialize the handler."""
        self.db_session = db_session

    @abstractmethod
    def handle_event(
        self,
        external_session_id: str,
        event_data: Any,
    ) -> None:
        """Handle the event data."""
