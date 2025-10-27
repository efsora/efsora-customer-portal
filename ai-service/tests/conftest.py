import asyncio
from collections.abc import AsyncGenerator, Iterator
import os

from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
import pytest
import pytest_asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker

from app.api.dependencies import get_session
from app.api.v1.routes import get_weaviate_service
from app.core.settings import Settings, get_settings
from app.infrastructure.db.engine import create_engine
from app.infrastructure.db.schema import metadata
from app.infrastructure.db.utils import coerce_database, ensure_database_exists
from app.main import create_app


def _configure_test_database() -> str:
    base_url = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://app:app@localhost:5432/app",
    )
    coerced = coerce_database(base_url, "app_test")
    os.environ["DATABASE_URL"] = coerced
    return coerced


os.environ["ENV"] = "test"
TEST_DATABASE_URL = _configure_test_database()


@pytest.fixture(scope="session")
def event_loop() -> Iterator[asyncio.AbstractEventLoop]:
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def settings() -> Settings:
    return get_settings()


@pytest_asyncio.fixture(scope="session")
async def async_engine(settings: Settings) -> AsyncGenerator[AsyncEngine, None]:
    await ensure_database_exists(TEST_DATABASE_URL)
    engine = create_engine(settings)
    async with engine.begin() as conn:
        await conn.run_sync(metadata.create_all)
    try:
        yield engine
    finally:
        await engine.dispose()


@pytest.fixture(scope="session")
def session_maker(async_engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(bind=async_engine, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def truncate_tables(async_engine: AsyncEngine) -> AsyncGenerator[None, None]:
    async with async_engine.begin() as conn:
        await conn.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE"))
    try:
        yield
    finally:
        async with async_engine.begin() as conn:
            await conn.execute(text("TRUNCATE TABLE users RESTART IDENTITY CASCADE"))


@pytest_asyncio.fixture()
async def db_session(
    session_maker: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[AsyncSession, None]:
    async with session_maker() as session:
        yield session


@pytest.fixture()
def sample_user_payload() -> dict[str, str]:
    return {
        "user_name": "Alice",
        "user_surname": "Smith",
        "password": "hunter22",
    }


@pytest_asyncio.fixture()
async def app_with_overrides(
    session_maker: async_sessionmaker[AsyncSession],
) -> AsyncGenerator[FastAPI, None]:
    app = create_app()

    async def _session_override() -> AsyncGenerator[AsyncSession, None]:
        async with session_maker() as session:
            yield session

    app.dependency_overrides[get_session] = _session_override
    lifespan = app.router.lifespan_context(app)
    await lifespan.__aenter__()
    try:
        yield app
    finally:
        await lifespan.__aexit__(None, None, None)
        app.dependency_overrides.clear()


class MockWeaviateService:
    """Mock Weaviate service for testing."""

    def __init__(self, host: str = "localhost", port: int = 8080) -> None:
        self.host = host
        self.port = port
        self.collections: dict[str, list[dict[str, object]]] = {}
        self.uuid_counter = 0

    async def embed_text(self, text: str, collection: str) -> dict[str, object]:
        """Mock embed text."""
        if collection not in self.collections:
            self.collections[collection] = []

        self.uuid_counter += 1
        uuid = f"test-uuid-{self.uuid_counter}"

        self.collections[collection].append({"text": text, "uuid": uuid})

        return {
            "text": text,
            "collection": collection,
            "uuid": uuid,
        }

    async def search(self, query: str, collection: str, limit: int = 10) -> dict[str, object]:
        """Mock search."""
        if collection not in self.collections:
            return {
                "query": query,
                "collection": collection,
                "results": [],
                "count": 0,
            }

        # Simple BM25-like scoring (word frequency)
        query_words = set(query.lower().split())
        results = []

        for item in self.collections[collection]:
            text = str(item.get("text", "")).lower()
            text_words = set(text.split())
            score = len(query_words & text_words) / (len(query_words) + 1)

            if score > 0:
                results.append(
                    {
                        "uuid": item["uuid"],
                        "text": item["text"],
                        "distance": 1 - score,  # Invert for distance metric
                        "properties": {"text": item["text"]},
                    }
                )

        # Sort by distance (ascending)
        results.sort(key=lambda x: float(x["distance"]))  # type: ignore[arg-type]
        results = results[:limit]

        return {
            "query": query,
            "collection": collection,
            "results": results,
            "count": len(results),
        }

    def close(self) -> None:
        """Close connection (no-op for mock)."""
        pass


@pytest_asyncio.fixture()
async def mock_weaviate() -> MockWeaviateService:
    """Provide a mock Weaviate service."""
    return MockWeaviateService()


@pytest_asyncio.fixture()
async def client(
    app_with_overrides: FastAPI,
    mock_weaviate: MockWeaviateService,
) -> AsyncGenerator[AsyncClient, None]:
    # Override the weaviate service with mock
    def mock_get_weaviate() -> MockWeaviateService:
        return mock_weaviate

    app_with_overrides.dependency_overrides[get_weaviate_service] = mock_get_weaviate

    transport = ASGITransport(app=app_with_overrides)
    async with AsyncClient(transport=transport, base_url="http://testserver") as test_client:
        yield test_client
