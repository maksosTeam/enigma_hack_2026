export type Priority = 'low' | 'medium' | 'high';
export type TicketStatus = 'new' | 'open' | 'in_progress' | 'resolved' | 'closed';

export type Ticket = {
    id: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: Priority;
    tags?: string[];
    createdAt: string; // ISO
    generatedAnswer: string;
};