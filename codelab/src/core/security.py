from src.core.config import settings


def verify_api_key(api_key: str) -> bool:
    return api_key == settings.EXTERNAL_API_KEY
