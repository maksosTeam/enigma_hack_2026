from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer

from app.schemas.ticket import (TicketCreate, TicketListResponseWithUser, 
                                TicketResponse, TicketListResponse)

from app.services.ticket import TicketService

from app.api.deps import (get_ticket_service, get_current_user_id, 
                          require_operator_or_admin)

from app.core.enums import UserRole


router = APIRouter(prefix="/tickets", tags=["Support Tickets"])
security = HTTPBearer()

@router.post("/", response_model=TicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    ticket_in: TicketCreate,
    ticket_service: TicketService = Depends(get_ticket_service),
    current_user_id: int = Depends(get_current_user_id) 
):
    """Создать новый тикет поддержки"""
    return await ticket_service.create_ticket(ticket_in, user_id=current_user_id)


@router.get("/", response_model=TicketListResponse)
async def get_my_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    ticket_service: TicketService = Depends(get_ticket_service),
    current_user_id: int = Depends(get_current_user_id)
):
    """Получить список моих тикетов"""
    return await ticket_service.get_user_tickets(
        user_id=current_user_id, 
        skip=skip, 
        limit=limit
    )


@router.get("/all", response_model=TicketListResponseWithUser)
async def get_all_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    ticket_service: TicketService = Depends(get_ticket_service),
    role: UserRole = Depends(require_operator_or_admin)  
):
    """Получить все тикеты системы (только ADMIN и OPERATOR)"""
    return await ticket_service.get_all_tickets(skip=skip, limit=limit)


@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket(
    ticket_id: int,
    ticket_service: TicketService = Depends(get_ticket_service),
    current_user_id: int = Depends(get_current_user_id)
):
    """Получить тикет по ID (только свой)"""
    ticket = await ticket_service.get_ticket(ticket_id, user_id=current_user_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.get("/", response_model=TicketListResponse)
async def get_my_tickets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    ticket_service: TicketService = Depends(get_ticket_service),
    current_user_id: int = Depends(get_current_user_id)
):
    """Получить список моих тикетов"""
    return await ticket_service.get_user_tickets(
        user_id=current_user_id, 
        skip=skip, 
        limit=limit
    )

