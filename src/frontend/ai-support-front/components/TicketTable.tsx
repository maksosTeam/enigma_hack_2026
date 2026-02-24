'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Ticket } from '../types';
import { getTickets, updateTicket, deleteTicket } from '../lib/api';

type Props = {
    onSelect?: (t: Ticket) => void;
};

export default function TicketTable({ onSelect }: Props) {
    const [items, setItems] = useState<Ticket[]>([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            const data = await getTickets();
            if (!mounted) return;
            setItems(data);
            setLoading(false);
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const filtered = useMemo(() => {
        if (!q.trim()) return items;
        const s = q.toLowerCase();
        return items.filter(
            (t) =>
                t.subject.toLowerCase().includes(s) ||
                t.description.toLowerCase().includes(s) ||
                (t.tags || []).some((tag) => tag.toLowerCase().includes(s))
        );
    }, [items, q]);

    const markResolved = async (id: string) => {
        const updated = await updateTicket(id, { status: 'resolved' });
        if (!updated) return;
        setItems((prev) => prev.map((p) => (p.id === id ? updated : p)));
    };

    const remove = async (id: string) => {
        const ok = await deleteTicket(id);
        if (ok) setItems((p) => p.filter((x) => x.id !== id));
    };

    return (
        <div className="bg-white rounded shadow p-4">
            <div className="flex items-center gap-2 mb-3">
                <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Поиск по теме/описанию/тегам"
                    className="flex-1 p-2 border rounded"
                />
                <div className="text-sm text-gray-500">
                    {loading ? 'Загрузка...' : `${filtered.length} записей`}
                </div>
            </div>

            <table className="w-full table-auto">
                <thead>
                    <tr className="text-left text-sm text-gray-600">
                        <th className="p-2">Тема</th>
                        <th className="p-2">Приоритет</th>
                        <th className="p-2">Статус</th>
                        <th className="p-2">Дата</th>
                        <th className="p-2">Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {filtered.map((t) => (
                        <tr key={t.id} className="border-t hover:bg-gray-50">
                            <td className="p-2 align-top">
                                <div className="font-medium">{t.subject}</div>
                                <div className="text-xs text-gray-600">
                                    {t.description.slice(0, 120)}
                                    {t.description.length > 120 ? '…' : ''}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                    {(t.tags || []).join(', ')}
                                </div>
                            </td>
                            <td className="p-2 align-top">{t.priority}</td>
                            <td className="p-2 align-top">{t.status}</td>
                            <td className="p-2 align-top">
                                {new Date(t.createdAt).toLocaleString()}
                            </td>
                            <td className="p-2 align-top">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onSelect?.(t)}
                                        className="px-2 py-1 border rounded text-sm"
                                    >
                                        Открыть
                                    </button>
                                    <button
                                        onClick={() => markResolved(t.id)}
                                        className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                                    >
                                        Решить
                                    </button>
                                    <button
                                        onClick={() => remove(t.id)}
                                        className="px-2 py-1 bg-red-600 text-white rounded text-sm"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filtered.length === 0 && !loading && (
                        <tr>
                            <td colSpan={5} className="p-6 text-center text-gray-500">
                                Нет тикетов
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}