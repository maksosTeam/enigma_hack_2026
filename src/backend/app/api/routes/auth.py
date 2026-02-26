from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.user import UserLogin, Token, UserCreate, UserResponse

from app.services.auth import AuthService

from app.api.deps import get_auth_service, get_user_repo

from app.repositories.user import UserRepository

from app.db.session import get_db_session


router = APIRouter(prefix="/auth", tags=["Authorization"])


@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin, auth_service: AuthService = Depends(get_auth_service)
):
    try:
        return await auth_service.authenticate_user(login_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post("/register", response_model=UserResponse)
async def register(
    user_in: UserCreate,
    session: AsyncSession = Depends(get_db_session),
    user_repo: UserRepository = Depends(get_user_repo),
):
    existing = await user_repo.get_by_email(user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = await user_repo.create(user_in)
    return user
