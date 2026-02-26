import { Ticket } from '../types';

const AUTH_STORAGE_KEY = 'support_ai_token';

export type Token = {
    access_token: string;
    token_type: string;
    user_role?: string | null;
};

function getApiBase() {
    return process.env.NEXT_PUBLIC_API_URL || '';
}

export function saveToken(token: Token) {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(token));
    } catch (e) {
        console.error('saveToken error', e);
    }
}

export function readToken(): Token | null {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw) as Token;
    } catch (e) {
        console.error('readToken error', e);
        return null;
    }
}

export function removeToken() {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
        console.error('removeToken error', e);
    }
}

export async function login(email: string, password: string): Promise<Token> {
    const url = `${getApiBase()}/auth/login`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Login failed');
    }
    const data = await res.json();
    saveToken(data);
    return data as Token;
}

export function fetchWithAuth(input: RequestInfo, init?: RequestInit) {
    const token = readToken();
    const headers = new Headers(init?.headers as HeadersInit || {});
    if (token?.access_token && token?.token_type) {
        headers.set('Authorization', `${token.token_type} ${token.access_token}`);
    }
    return fetch(input, { ...init, headers });
}

export async function getTickets(): Promise<{tickets: Ticket[]; total: number}> {
    // choose endpoint based on role stored in token
    const token = readToken();
    let url = `${getApiBase()}/tickets`;
    if (token && token.user_role && (token.user_role === 'admin' || token.user_role === 'operator')) {
        url = `${getApiBase()}/tickets/all`;
    }
    const res = await fetchWithAuth(url);
    if (!res.ok) {
        throw new Error('Failed to fetch tickets');
    }
    const data = await res.json();
    // response shape: { tickets: [...], total: number }
    return { tickets: data.tickets as Ticket[], total: data.total };
}

export async function createTicket(payload: { topic: string; description: string; priority: string; }): Promise<Ticket> {
    const url = `${getApiBase()}/tickets`;
    const res = await fetchWithAuth(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create ticket');
    }
    const data = await res.json();
    return data as Ticket;
}

export async function updateTicket(id: number | string, patch: Partial<Ticket>): Promise<Ticket | null> {
    const url = `${getApiBase()}/tickets/${id}`;
    const res = await fetchWithAuth(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
    });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to update ticket');
    }
    const data = await res.json();
    return data as Ticket;
}

export async function deleteTicket(id: number | string): Promise<boolean> {
    const url = `${getApiBase()}/tickets/${id}`;
    const res = await fetchWithAuth(url, { method: 'DELETE' });
    return res.ok;
}