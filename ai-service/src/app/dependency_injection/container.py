from typing import TypeAlias

from dependency_injector import containers, providers
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.core.context import Context
from app.core.settings import Settings, get_settings
from app.infrastructure.db.engine import create_engine

AsyncSessionMaker: TypeAlias = async_sessionmaker[AsyncSession]


class Container(containers.DeclarativeContainer):
    settings: providers.Singleton[Settings] = providers.Singleton(get_settings)

    # --- DB ---
    engine: providers.Singleton[AsyncEngine] = providers.Singleton(
        create_engine,
        settings=settings,
    )
    session_factory: providers.Singleton[AsyncSessionMaker] = providers.Singleton(
        async_sessionmaker,
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # --- Context factory (session provided per request) ---
    context: providers.Factory[Context] = providers.Factory(
        Context,
        session_factory=session_factory,
    )
