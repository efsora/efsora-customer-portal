from datetime import datetime
from typing import Any

import pytest
from starlette.requests import Request

from app.api.schemas.request import CreateUserRequest
from app.api.v1 import routes
from app.domain.models import User
from app.domain.primitives import EmailStr


async def _receive() -> dict[str, Any]:
    return {"type": "http.request"}


def build_request() -> Request:
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": [],
        "query_string": b"",
        "client": ("testclient", 1234),
        "server": ("testserver", 80),
    }
    return Request(scope, _receive)


@pytest.mark.asyncio
async def test_hello_returns_trace_id() -> None:
    request = build_request()
    request.state.trace_id = "trace-123"

    response = await routes.hello(request)

    assert response.success is True
    assert response.data == routes.HelloResponse(message="Hello, World!")
    assert response.trace_id == "trace-123"


@pytest.mark.asyncio
async def test_create_user_route_builds_response() -> None:
    payload = CreateUserRequest(user_name="Alice", user_surname="Smith", password="password")
    request = build_request()
    request.state.trace_id = "trace-xyz"

    dummy_user = User(
        id=1,
        user_name=payload.user_name,
        user_surname=payload.user_surname,
        email=EmailStr("alice.smith@example.com"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    class DummyUserService:
        async def create_user(self, user_name: str, user_surname: str) -> User:
            assert user_name == payload.user_name
            assert user_surname == payload.user_surname
            return dummy_user

    response = await routes.create_user(
        request, payload, DummyUserService()  # pyright: ignore[reportArgumentType]
    )

    assert response.success is True
    assert response.message == "User created"
    assert response.trace_id == "trace-xyz"
    assert response.data == routes.CreateUserResponse(
        user_name=payload.user_name,
        user_surname=payload.user_surname,
        email="alice.smith@example.com",
    )
