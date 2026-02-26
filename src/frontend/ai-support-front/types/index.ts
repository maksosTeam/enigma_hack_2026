export type Priority = 'low' | 'middle' | 'high';

export type Ticket = {
    id: number;
    topic: string;
    description: string;
    priority: Priority;
    awaits_response: boolean;
    response?: string;
    created_at: string; // ISO
    // fields returned only for admin/operator
    user_email?: string;
    user_role?: string;
};