from enum import StrEnum

class TicketPriority(StrEnum):
    LOW = "low"
    MIDDLE = "middle"
    HIGH = "high"

class UserRole(StrEnum):
    USER = "user"
    OPERATOR = "operator"
    ADMIN = "admin"