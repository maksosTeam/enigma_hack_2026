'use client';

import React, { useState } from 'react';
import { Priority, Ticket } from '../types';

type Props = {
    onCreate: (payload: Omit<Ticket, 'id' | 'createdAt'>) => Promise<void>;
};

export default function TicketForm({ onCreate }: Props) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('medium');
    const [loading, setLoading] = useState(false);

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (!subject.trim()) return;
        setLoading(true);
        await onCreate({ subject: subject.trim(), description: description.trim(), priority, status: 'new' });
        setSubject('');
        setDescription('');
        setPriority('medium');
        setLoading(false);
    }

    return (
        <form onSubmit={submit} className="space-y-2 p-4 bg-white rounded shadow">
            <div>
                <label className="text-sm font-medium">Тема</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full mt-1 p-2 border rounded" />
            </div>
            <div>
                <label className="text-sm font-medium">Описание</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 p-2 border rounded h-24" />
            </div>
            <div className="flex items-center gap-4">
                <div>
                    <label className="text-sm">Приоритет</label>
                    <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="ml-2 p-1 border rounded">
                        <option value="low">низкий</option>
                        <option value="medium">средний</option>
                        <option value="high">высокий</option>
                    </select>
                </div>
                <button disabled={loading} className="ml-auto bg-blue-600 text-white px-3 py-1 rounded">
                    {loading ? 'Добавление...' : 'Добавить тикет'}
                </button>
            </div>
        </form>
    );
}