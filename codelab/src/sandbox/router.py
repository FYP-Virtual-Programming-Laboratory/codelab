from fastapi import APIRouter

from src.sandbox.routes.images import router as images_router
from src.sandbox.routes.execution import router as execution_router


router = APIRouter()


router.include_router(images_router, prefix="/images", tags=['images'])
router.include_router(execution_router, prefix="/execution", tags=['execution'])

