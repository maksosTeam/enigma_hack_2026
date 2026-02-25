from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db_session
from app.repositories.user import UserRepository
from app.services.auth import AuthService

async def get_user_repo(session: AsyncSession = Depends(get_db_session)) -> UserRepository:
    return UserRepository(session)

async def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repo)
) -> AuthService:
    return AuthService(user_repo)