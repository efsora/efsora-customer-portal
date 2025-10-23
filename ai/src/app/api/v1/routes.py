from typing import Annotated

from fastapi import APIRouter, Depends, Request, status

from app.api.schemas.base_response import AppResponse
from app.api.schemas.request import CreateUserRequest
from app.api.schemas.response import CreateUserResponse, HelloResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1", tags=["v1"])

UserServiceDep = Annotated[UserService, Depends()]


@router.get("/hello", response_model=AppResponse[HelloResponse])
async def hello(request: Request) -> AppResponse[HelloResponse]:
    trace_id = getattr(request.state, "trace_id", None)
    return AppResponse.ok(HelloResponse(message="Hello, World!"), trace_id=trace_id)


@router.post(
    "/users", response_model=AppResponse[CreateUserResponse], status_code=status.HTTP_201_CREATED
)
async def create_user(
    request: Request,
    payload: CreateUserRequest,
    user_service: UserServiceDep,
) -> AppResponse[CreateUserResponse]:
    trace_id = getattr(request.state, "trace_id", None)

    user_entity = await user_service.create_user(payload.user_name, payload.user_surname)

    user = CreateUserResponse(
        user_name=user_entity.user_name,
        user_surname=payload.user_surname,
        email=user_entity.email.value,
    )

    return AppResponse.ok(user, message="User created", trace_id=trace_id)
