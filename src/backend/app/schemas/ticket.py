from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from app.core.enums import TicketPriority, UserRole

class TicketCreate(BaseModel):
    topic: str = Field(..., min_length=3, max_length=255, description="Тема обращения")
    description: str = Field(..., min_length=10, description="Описание проблемы")
    priority: TicketPriority = Field(default=TicketPriority.LOW, description="Приоритет: low/middle/high")

class TicketResponse(BaseModel):
    id: int
    user_id: int
    topic: str
    description: str
    priority: TicketPriority
    awaits_response: bool
    response: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TicketListResponse(BaseModel):
    tickets: list[TicketResponse]
    total: int

class TicketResponseWithUser(TicketResponse):
    """Расширенная схема тикета с информацией о пользователе (для ADMIN/OPERATOR)"""
    user_email: str
    user_role: UserRole

class TicketListResponseWithUser(BaseModel):
    """Расширенный список тикетов с информацией о пользователях"""
    tickets: list[TicketResponseWithUser]
    total: int

class TicketUpdateResponse(BaseModel):
    """Схема для добавления ответа поддержки"""
    response: str = Field(..., min_length=1, description="Текст ответа поддержки")
    awaits_response: Optional[bool] = None 