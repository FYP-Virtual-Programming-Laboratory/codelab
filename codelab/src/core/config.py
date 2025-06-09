import os
import secrets
import warnings
from typing import Annotated, Any, Literal

from pydantic import (
    AnyUrl,
    BeforeValidator,
    HttpUrl,
    computed_field,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Self


def parse_cors(v: Any) -> list[str] | str:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, list | str):
        return v
    raise ValueError(v)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Use top level .env file (one level above ./backend/)
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )

    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    EXTERNAL_API_KEY: str = secrets.token_urlsafe(32)
    VPL_API_KEY: str = secrets.token_urlsafe(32)
    VPL_FRONTEND_BASE_URL: str = "http://localhost:3000"

    SUBMISSION_DIR: str
    TESTING_DIR: str
    FILESYSTEM_DIR: str
    
    CODE_COLLAB_SERVICE_BASE_URL: str
    CODE_COLLAB_SERVICE_API_KEY: str
    CODE_COLLAB_SERVICE_TIMEOUT: float = 5

    # 60 minutes * 24 hours * 8 days = 8 days
    ENVIRONMENT: Literal["local", "staging", "production"] = "local"

    BACKEND_CORS_ORIGINS: Annotated[
        list[AnyUrl] | str, BeforeValidator(parse_cors)
    ] = []

    @computed_field  # type: ignore[prop-decorator]
    @property
    def all_cors_origins(self) -> list[str]:
        return [str(origin).rstrip("/") for origin in self.BACKEND_CORS_ORIGINS]

    PROJECT_NAME: str
    SENTRY_DSN: HttpUrl | None = None
    SQLITE_DATABASE_PATH: str
    TEST_DATABASE_PATH: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        path = (
            os.path.realpath(self.SQLITE_DATABASE_PATH)
            if self.ENVIRONMENT in ["local", "production"]
            else os.path.realpath(self.TEST_DATABASE_PATH)
        )
        return f"sqlite://{path}"

    # Celery settings
    CELERY_BROKER_URL: str = "redis://localhost:6379"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379"
    CELERY_DEFAULT_QUEUE: str
    CELERY_EXECUTION_QUEUE: str

    def _check_default_secret(self, var_name: str, value: str | None) -> None:
        if value == "changethis":
            message = (
                f'The value of {var_name} is "changethis", '
                "for security, please change it, at least for deployments."
            )
            if self.ENVIRONMENT in ["local", "staging"]:
                warnings.warn(message, stacklevel=1)
            else:
                raise ValueError(message)

    @model_validator(mode="after")
    def _enforce_non_default_secrets(self) -> Self:
        self._check_default_secret("SECRET_KEY", self.SECRET_KEY)
        self._check_default_secret("EXTERNAL_API_KEY", self.EXTERNAL_API_KEY)
        self._check_default_secret("VPL_API_KEY", self.VPL_API_KEY)
        return self


settings = Settings()  # type: ignore
