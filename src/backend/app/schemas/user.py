from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr

from app.core.enums import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.USER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    role: UserRole

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user_role: Optional[UserRole] = None

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UsersListResponse(BaseModel):
    users: list[UserResponse]
    total: int