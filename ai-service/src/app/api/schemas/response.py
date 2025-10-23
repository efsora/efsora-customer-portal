from pydantic import BaseModel


class HelloResponse(BaseModel):
    message: str


class CreateUserResponse(BaseModel):
    user_name: str
    user_surname: str
    email: str
