from pydantic import BaseModel
from typing_extensions import Self


class CodeRepository(BaseModel):
    """Schema for code repository."""

    path: str
    content: str | None = None
    sub: list[Self]


