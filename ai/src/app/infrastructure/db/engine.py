from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.core.settings import Settings


def create_engine(settings: Settings) -> AsyncEngine:
    return create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        pool_pre_ping=True,
    )
