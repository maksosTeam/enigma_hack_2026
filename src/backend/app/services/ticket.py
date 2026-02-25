from app.repositories.ticket import TicketRepository
from app.schemas.ticket import TicketCreate, TicketResponse, TicketListResponse
from typing import Optional

class TicketService:
    def __init__(self, ticket_repo: TicketRepository):
        self.ticket_repo = ticket_repo

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