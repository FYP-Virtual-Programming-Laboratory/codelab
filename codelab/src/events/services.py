from typing import Annotated

from fastapi import Body

from src.events.schemas import LifeCycleEventData


def event_handler(event_data: Annotated[LifeCycleEventData, Body(...)]) -> None:
    """Handle the event data."""
    print(event_data)
