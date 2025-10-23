from __future__ import annotations

from functools import lru_cache
import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)
from pydantic_settings.sources import DotEnvSettingsSource


class Settings(BaseSettings):
    ENV: str = Field(default="dev")
    APP_NAME: str = Field(default="fastapi-backend")
    LOG_LEVEL: str = Field(default="INFO")
    DATABASE_URL: str = Field(default="postgresql+asyncpg://app:app@localhost:5432/app")

    model_config = SettingsConfigDict(
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        """Ensure ``.env`` loads before an environment-specific override."""

        env = os.getenv("ENV", "dev")
        specific_env_file = Path(f".env.{env}")

        if specific_env_file.exists():
            specific_env = DotEnvSettingsSource(settings_cls, env_file=specific_env_file)
            return (
                init_settings,
                env_settings,
                specific_env,
                dotenv_settings,
                file_secret_settings,
            )

        return (
            init_settings,
            env_settings,
            dotenv_settings,
            file_secret_settings,
        )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
