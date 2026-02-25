from app.repositories.user import UserRepository
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UsersListResponse
from typing import Optional

class UserService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def get_user(self, user_id: int) -> Optional[UserResponse]:
        user = await self.user_repo.get_by_id(user_id)
        if user:
            return UserResponse.model_validate(user)
        return None

    async def get_all_users(self, skip: int = 0, limit: int = 10) -> UsersListResponse:
        users, total = await self.user_repo.get_all(skip=skip, limit=limit)
        return UsersListResponse(
            users=[UserResponse.model_validate(u) for u in users],
            total=total
        )

    async def create_user(self, user_in: UserCreate) -> UserResponse:
        existing = await self.user_repo.get_by_email(user_in.email)
        if existing:
            raise ValueError("Email already registered")
        
        user = await self.user_repo.create(user_in)
        return UserResponse.model_validate(user)

    async def update_user(self, user_id: int, user_in: UserUpdate) -> Optional[UserResponse]:
        if user_in.email:
            existing = await self.user_repo.get_by_email(user_in.email)
            if existing and existing.id != user_id:
                raise ValueError("Email already registered")
        
        user = await self.user_repo.update(user_id, user_in)
        if user:
            return UserResponse.model_validate(user)
        return None

    async def delete_user(self, user_id: int) -> bool:
        return await self.user_repo.delete(user_id)