"""API connector for code collaboration service."""

from typing import Any, Dict, Optional
from pydantic import JsonValue
import httpx
from fastapi import HTTPException, status

from src.core.dependecies import verify_api_key
from src.log import logger


class CodeCollaborationConnector:
    """Connector for interacting with the code collaboration service."""

    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: float = 30.0,
    ):
        """Initialize the connector.

        Args:
            base_url: Base URL of the code collaboration service
            api_key: API key for authentication
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self._client = httpx.Client(
            base_url=self.base_url,
            timeout=self.timeout,
            headers={"Authorization": f"Bearer {api_key}"}
        )

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()

    def close(self) -> None:
        """Close the HTTP client."""
        self._client.close()

    def _make_request(
        self,
        method: str,
        endpoint: str,
        **kwargs: Any,
    ) -> dict[str, JsonValue]:
        """Make an HTTP request to the API.

        Args:
            method: HTTP method (GET, POST, etc.)
            endpoint: API endpoint
            **kwargs: Additional arguments to pass to httpx

        Returns:
            Response data as dictionary

        Raises:
            HTTPException: If the request fails
        """
        try:
            response = self._client.request(method, endpoint, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as error:
            logger.error(f"API request failed: {str(error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to communicate with code collaboration service: {str(error)}"
            )
        except Exception as error:
            logger.error(f"Unexpected error during API request: {str(error)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error during API request"
            )

    def health_check(self) -> bool:
        """Verify the connection to the code collaboration service.

        Returns:
            bool: True if connection is successful
        """
        try:
            self._make_request("GET", "/health")
            return True
        except HTTPException:
            return False
