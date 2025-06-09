from fastapi import HTTPException
from fastapi import status
from typing import Any
from src.core.schemas import APIErrorCodes


class APIException(HTTPException):
    def __init__(
        self, 
        message: str,
        error_code: APIErrorCodes,
        status_code: int = status.HTTP_401_UNAUTHORIZED,
        detail: dict[str, Any] | None = None,
    ):
        if detail is None:
            detail = {"error_code": error_code, "message": message}
        else:
            detail["error_code"] = error_code
            detail["message"] = message

        super().__init__(
            status_code=status_code, 
            detail=detail,
        )

