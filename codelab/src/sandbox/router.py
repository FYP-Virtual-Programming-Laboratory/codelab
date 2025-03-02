from fastapi import APIRouter

from src.sandbox.routes.images import router as images_router

router = APIRouter()
router.include_router(images_router, prefix="/images")
