from fastapi.security import HTTPBearer
from passlib.context import CryptContext

from src.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


ALGORITHM = "HS256"
SECURITY_HEADER = HTTPBearer()


def verify_api_key(api_key: str) -> bool:
    return api_key == settings.EXTERNAL_API_KEY


def verify_vpl_key(vpl_key: str) -> bool:
    return vpl_key == settings.VPL_API_KEY
