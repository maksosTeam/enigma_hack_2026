from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.ticket import Ticket
from app.schemas.ticket import TicketCreate
from typing import List, Tuple, Optional

class TicketRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, ticket_in: TicketCreate, user_id: int) -> Ticket:
        db_ticket = Ticket(
            user_id=user_id,
            topic=ticket_in.topic,
            description=ticket_in.description,
            priority=ticket_in.priority,
            awaits_response=True
        )
        self.session.add(db_ticket)
        await self.session.commit()
        await self.session.refresh(db_ticket)
        return db_ticket

    async def get_by_id(self, ticket_id: int, user_id: Optional[int] = None) -> Optional[Ticket]:
        query = select(Ticket).where(Ticket.id == ticket_id)
        if user_id:
            query = query.where(Ticket.user_id == user_id)
        result = await self.session.execute(query)
        return result.scalars().first()

    async def get_by_user(self, user_id: int, skip: int = 0, limit: int = 10) -> Tuple[List[Ticket], int]:
        count_result = await self.session.execute(
            select(func.count(Ticket.id)).where(Ticket.user_id == user_id)
        )
        total = count_result.scalar()
        
        result = await self.session.execute(
            select(Ticket)
            .where(Ticket.user_id == user_id)
            .order_by(Ticket.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tickets = result.scalars().all()
        return tickets, total

    async def get_all_tickets(self, skip: int = 0, limit: int = 10) -> Tuple[List[Ticket], int]:
        """Получает все тикеты с пагинацией"""
        count_result = await self.session.execute(
            select(func.count(Ticket.id))
        )
        total = count_result.scalar()
        
        result = await self.session.execute(
            select(Ticket)
            .order_by(Ticket.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        tickets = result.scalars().all()
        return tickets, total
    
    async def update_response(self, ticket_id: int, response: str, awaits_response: Optional[bool] = None) -> Optional[Ticket]:
        """Обновляет ответ поддержки и флаг awaits_response"""
        ticket = await self.get_by_id(ticket_id)
        if not ticket:
            return None
        
        ticket.response = response
        if awaits_response is not None:
            ticket.awaits_response = awaits_response
        
        await self.session.commit()
        await self.session.refresh(ticket)
        return ticket