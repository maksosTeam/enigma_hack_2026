from app.repositories.ticket import TicketRepository
from app.schemas.ticket import (TicketCreate, TicketListResponseWithUser, 
                                TicketResponse, TicketListResponse, TicketResponseWithUser)
from typing import Optional

from app.repositories.user import UserRepository

class TicketService:
    def __init__(self, ticket_repo: TicketRepository, user_repo: UserRepository):
        self.ticket_repo = ticket_repo
        self.user_repo = user_repo

    async def create_ticket(self, ticket_in: TicketCreate, user_id: int) -> TicketResponse:
        ticket = await self.ticket_repo.create(ticket_in, user_id)
        return TicketResponse.model_validate(ticket)

    async def get_ticket(self, ticket_id: int, user_id: int) -> Optional[TicketResponse]:
        ticket = await self.ticket_repo.get_by_id(ticket_id, user_id)
        if ticket:
            return TicketResponse.model_validate(ticket)
        return None

    async def get_user_tickets(self, user_id: int, skip: int = 0, limit: int = 10) -> TicketListResponse:
        tickets, total = await self.ticket_repo.get_by_user(user_id, skip=skip, limit=limit)
        return TicketListResponse(
            tickets=[TicketResponse.model_validate(t) for t in tickets],
            total=total
        )
    
    async def get_all_tickets(self, skip: int = 0, limit: int = 10) -> TicketListResponseWithUser:
        """Получает все тикеты системы с информацией о пользователях"""
        tickets, total = await self.ticket_repo.get_all_tickets(skip=skip, limit=limit)
        
        tickets_with_user = []
        for ticket in tickets:
            user = await self.user_repo.get_by_id(ticket.user_id)
            ticket_dict = TicketResponse.model_validate(ticket).model_dump()
            ticket_dict['user_email'] = user.email if user else "unknown"
            ticket_dict['user_role'] = user.role.value if user else "user"
            tickets_with_user.append(TicketResponseWithUser(**ticket_dict))
        
        return TicketListResponseWithUser(
            tickets=tickets_with_user,
            total=total
        )