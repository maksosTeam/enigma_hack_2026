from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt

from app.db.session import get_db_session

from app.repositories.ticket import TicketRepository
from app.repositories.user import UserRepository

from app.services.ticket import TicketService
from app.services.auth import AuthService
from app.services.user import UserService

from app.core.config import settings
from app.core.enums import UserRole


async def get_user_repo(
    session: AsyncSession = Depends(get_db_session),
) -> UserRepository:
    return UserRepository(session)

async def get_auth_service(
    user_repo: UserRepository = Depends(get_user_repo),
) -> AuthService:
    return AuthService(user_repo)

async def get_user_service(
    user_repo: UserRepository = Depends(get_user_repo)
) -> UserService:
    return UserService(user_repo)

async def get_ticket_repo(session: AsyncSession = Depends(get_db_session)) -> TicketRepository:
    return TicketRepository(session)

async def get_ticket_service(
    ticket_repo: TicketRepository = Depends(get_ticket_repo),
    user_repo: UserRepository = Depends(get_user_repo)
) -> TicketService:
    return TicketService(ticket_repo, user_repo)

async def get_current_user_email(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
) -> str:
    """Извлекает email из JWT токена"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_id(
    email: str = Depends(get_current_user_email),
    user_repo: UserRepository = Depends(get_user_repo)
) -> int:
    """Получает user_id из БД по email из токена"""
    user = await user_repo.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user.id

async def get_current_user_role(
    email: str = Depends(get_current_user_email),
    user_repo: UserRepository = Depends(get_user_repo)
) -> UserRole:
    """Получает роль пользователя из БД"""
    user = await user_repo.get_by_email(email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return user.role

def require_role(*allowed_roles: UserRole):
    """Декоратор-зависимость для проверки роли"""
    async def role_checker(
        current_role: UserRole = Depends(get_current_user_role)
    ) -> UserRole:
        if current_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Required role: {', '.join([r.value for r in allowed_roles])}",
            )
        return current_role
    return role_checker

# Готовые зависимости для каждой роли
require_admin = require_role(UserRole.ADMIN)
require_operator_or_admin = require_role(UserRole.OPERATOR, UserRole.ADMIN)
require_any = require_role(UserRole.USER, UserRole.OPERATOR, UserRole.ADMIN)

