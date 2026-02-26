from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.schemas.user import UserCreate, UserUpdate, UserResponse, UsersListResponse

from app.services.user import UserService

from app.api.deps import get_current_user_id, get_user_service, get_current_user_role

from app.core.enums import UserRole


router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/", response_model=UsersListResponse)
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    user_service: UserService = Depends(get_user_service)
):
    return await user_service.get_all_users(skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    user = await user_service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    user_service: UserService = Depends(get_user_service)
):
    try:
        return await user_service.create_user(user_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    user_service: UserService = Depends(get_user_service),
    current_user_id: int = Depends(get_current_user_id),
    current_role: UserRole = Depends(get_current_user_role)
):
    if current_role != UserRole.ADMIN and user_id != current_user_id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    if current_role != UserRole.ADMIN and user_in.role is not None:
        raise HTTPException(status_code=403, detail="Cannot change role")
    
    user = await user_service.update_user(user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    user_service: UserService = Depends(get_user_service)
):
    deleted = await user_service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return None