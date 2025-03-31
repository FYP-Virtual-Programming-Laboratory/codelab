"""Dependency injection helpers for the code collaboration API connector."""

from typing import Generator
from fastapi import Depends
from src.external.connector import CodeCollaborationConnector
from src.core.config import settings


def get_code_collab_connector() -> Generator[CodeCollaborationConnector, None, None]:
    """Get a code collaboration connector instance.

    Args:
        settings: Code collaboration settings

    Yields:
        CodeCollaborationConnector: Connector instance
    """
    connector = CodeCollaborationConnector(
        base_url=settings.CODE_COLLAB_SERVICE_BASE_URL,
        api_key=settings.CODE_COLLAB_SERVICE_API_KEY,
        timeout=settings.CODE_COLLAB_SERVICE_TIMEOUT,
    )

    try:
        yield connector
    finally:
        connector.close()
