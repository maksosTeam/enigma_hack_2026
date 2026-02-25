from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from typing import Optional

from app.models.user import User

from app.schemas.user import UserCreate, UserUpdate

from app.core.security import get_password_hash


class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_by_id(self, user_id: int) -> Optional[User]:
        result = await self.session.execute(select(User).where(User.id == user_id))
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 10) -> tuple[list[User], int]:
        count_result = await self.session.execute(select(func.count(User.id)))
        total = count_result.scalar()
        
        result = await self.session.execute(select(User).offset(skip).limit(limit))
        users = result.scalars().all()
        return users, total

    async def create(self, user_in: UserCreate) -> User:
        db_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password)
        )
        self.session.add(db_user)
        await self.session.commit()
        await self.session.refresh(db_user)
        return db_user

    async def update(self, user_id: int, user_in: UserUpdate) -> Optional[User]:
        update_data = user_in.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        if not update_data:
            return await self.get_by_id(user_id)
        
        await self.session.execute(
            update(User)
            .where(User.id == user_id)
            .values(**update_data)
        )
        await self.session.commit()
        return await self.get_by_id(user_id)

    async def delete(self, user_id: int) -> bool:
        result = await self.session.execute(
            delete(User).where(User.id == user_id)
        )
        await self.session.commit()
        return result.rowcount > 0
