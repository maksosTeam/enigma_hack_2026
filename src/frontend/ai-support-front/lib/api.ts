import { Ticket } from '../types';

const STORAGE_KEY = 'support_tickets_v1';
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

function readStore(): Ticket[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Ticket[];
    } catch (e) {
        console.error('readStore error', e);
        return [];
    }
}

function writeStore(items: Ticket[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function getTickets(): Promise<Ticket[]> {
    // имитация задержки
    await new Promise((r) => setTimeout(r, 120));
    return readStore().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createTicket(payload: Omit<Ticket, 'id' | 'createdAt'>): Promise<Ticket> {
    await new Promise((r) => setTimeout(r, 120));
    const items = readStore();
    const t: Ticket = {
        ...payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    };
    items.push(t);
    writeStore(items);
    return t;
}

export async function updateTicket(id: string, patch: Partial<Ticket>): Promise<Ticket | null> {
    await new Promise((r) => setTimeout(r, 120));
    const items = readStore();
    const idx = items.findIndex((x) => x.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...patch };
    writeStore(items);
    return items[idx];
}

export async function deleteTicket(id: string): Promise<boolean> {
    await new Promise((r) => setTimeout(r, 120));
    let items = readStore();
    const prevLen = items.length;
    items = items.filter((x) => x.id !== id);
    writeStore(items);
    return items.length < prevLen;
}