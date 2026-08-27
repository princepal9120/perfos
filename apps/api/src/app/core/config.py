"""Application settings via pydantic-settings (reads .env, env vars win)."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "PerfOS"
    DEBUG: bool = False

    MOCK_MODE: bool = True
    DATABASE_URL: str = "sqlite:///./perfos.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "dev-secret-key-change-me"
    DEFAULT_WORKSPACE_API_KEY: str = "perfos-demo-key"
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:8000,http://127.0.0.1:8000"
    )
    SECURE_COOKIES: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
