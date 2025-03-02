from typing import Annotated, Any

from fastapi import APIRouter, Depends

from src.models import LanguageImage
from src.sandbox.schemas import LanguageImagePublicShcema
from src.sandbox.services import (
    cancle_language_image_delation_service,
    create_new_langauge_image_service,
    delete_language_image_service,
    get_language_image_by_id_service,
    list_language_image_services,
    prune_all_language_images_service,
    prune_langauge_image_service,
    retry_language_image_build_service,
    update_language_image_service,
)

router = APIRouter()


@router.get("/", response_model=list[LanguageImagePublicShcema])
def list_language_images(
    langauge_images: Annotated[
        list[LanguageImage], Depends(list_language_image_services)
    ],
) -> Any:
    """List all language images."""
    return langauge_images


@router.post("/", response_model=LanguageImagePublicShcema)
def create_language_image(
    language_image: Annotated[
        LanguageImage, Depends(create_new_langauge_image_service)
    ],
) -> Any:
    """Create a new language image."""
    return language_image


@router.get("/{image_id}/", response_model=LanguageImagePublicShcema)
def get_language_image_by_id(
    language_image: Annotated[LanguageImage, Depends(get_language_image_by_id_service)],
) -> Any:
    """Get a language image by its ID."""
    return language_image


@router.patch("/{image_id}/", response_model=LanguageImagePublicShcema)
def update_language_image(
    language_image: Annotated[LanguageImage, Depends(update_language_image_service)],
) -> Any:
    """Update a language image.."""
    return language_image


@router.delete("/{image_id}/", response_model=LanguageImagePublicShcema)
def delete_language_image(
    language_image: Annotated[LanguageImage, Depends(delete_language_image_service)],
) -> Any:
    """Delete a language image."""
    return language_image


@router.post("/{image_id}/cancle-deletion/", response_model=LanguageImagePublicShcema)
def cancle_langauge_image_deletion(
    language_image: Annotated[
        LanguageImage, Depends(cancle_language_image_delation_service)
    ],
) -> Any:
    """Cancel the deletion of a language image."""
    return language_image


@router.post("/{image_id}/rebuild/", response_model=LanguageImagePublicShcema)
def retry_language_build(
    language_image: Annotated[
        LanguageImage, Depends(retry_language_image_build_service)
    ],
) -> Any:
    """Retry building a language image."""
    return language_image


@router.post("/{image_id}/prune/", response_model=LanguageImagePublicShcema)
def prune_langauge_image(
    language_image: Annotated[LanguageImage, Depends(prune_langauge_image_service)],
) -> Any:
    """Prune a language image."""
    return language_image


@router.delete("/")
def prune_all_language_images(
    _: Annotated[None, Depends(prune_all_language_images_service)],
) -> Any:
    """Prune all language images."""
    return {"message": "Scheduled all language images for pruning."}
