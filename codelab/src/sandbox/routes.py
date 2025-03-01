from typing import Annotated, Any

from fastapi import APIRouter, Depends

from src.models import LanguageImage
from src.sandbox.services import (
    create_new_langauge_image_service,
    retry_language_image_build_service,
)

router = APIRouter()


@router.post("/images/")
def create_language_image(
    language_image: Annotated[
        LanguageImage, Depends(create_new_langauge_image_service)
    ],
) -> Any:
    """Create a new language image."""
    return language_image


@router.post("/images/{image_id}/rebuild")
def retry_language_build(
    language_image: Annotated[
        LanguageImage, Depends(retry_language_image_build_service)
    ],
) -> Any:
    """Retry building a language image."""
    return language_image
