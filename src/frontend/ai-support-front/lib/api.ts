import { Ticket } from '../types';

const STORAGE_KEY = 'support_tickets_v1';

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