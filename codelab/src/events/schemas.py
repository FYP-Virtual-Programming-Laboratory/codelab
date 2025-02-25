from typing import Any
from pydantic import BaseModel
from src.events.enums import LIfeCycleEvent


class LifeCycleEventData(BaseModel):
    event: LIfeCycleEvent
    external_session_id: str
    event_data: dict[str, Any]

