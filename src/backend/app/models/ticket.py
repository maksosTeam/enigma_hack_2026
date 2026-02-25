from sqlalchemy import Column, Integer, String, Text, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base
from app.core.enums import TicketPriority

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(Enum(TicketPriority), nullable=False, default=TicketPriority.LOW)
    
    awaits_response = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())