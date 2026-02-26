'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Ticket } from '../types';
import { getTickets, addTicketResponse } from '../lib/api';

type Props = {
    refreshKey?: number;
    role?: string;
    onTicketUpdated?: () => void;
};

export default function TicketTable({ refreshKey, role, onTicketUpdated }: Props) {
    const [items, setItems] = useState<Ticket[]>([]);
    const [q, setQ] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [editResponse, setEditResponse] = useState('');

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            const data = await getTickets();
            if (!mounted) return;
            setItems(data.tickets);
            setLoading(false);
        };
        load();
        return () => { mounted = false; };
    }, [refreshKey]);

    const filtered = useMemo(() => {
        const s = q.toLowerCase();
        return items.filter(t => t.topic.toLowerCase().includes(s));
    }, [items, q]);

    // ticket editing/deletion not yet supported by backend

    const getPriorityStyle = (p: string) => {
        switch (p) {
            case 'high': return 'bg-red-50 text-red-700 border-red-100';
            case 'middle': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
        }
    };

    const isStaff = role === 'admin' || role === 'operator';

    const handleAddResponse = async (ticket: Ticket) => {
        if (!editResponse.trim()) return;
        try {
            const updated = await addTicketResponse(ticket.id, editResponse.trim());
            setItems(prev => prev.map(t => t.id === ticket.id ? updated : t));
            onTicketUpdated?.();
            setSelectedId(null);
        } catch (e) {
            console.error('failed to send response', e);
            alert('Ошибка при отправке ответа');
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </span>
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Поиск тикетов..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    />
                </div>
                <div className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    {loading ? 'Загрузка...' : `${filtered.length} тикетов`}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                            <th className="px-6 py-4">Клиент и Тема</th>
                            <th className="px-6 py-4">Приоритет</th>
                            <th className="px-6 py-4">Статус</th>
                            <th className="px-6 py-4 text-right">Действия</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map((t) => {
                            const isSelected = selectedId === t.id;
                            return (
                                <React.Fragment key={t.id}>
                                    <tr
                                        onClick={() => {
                                            setSelectedId(isSelected ? null : t.id);
                                            setEditResponse(isSelected ? '' : (t.response || ''));
                                        }}
                                        className={`group hover:bg-blue-50/30 cursor-pointer transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm">{t.topic}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[300px] mt-0.5">{t.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getPriorityStyle(t.priority)}`}>
                                                {t.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600">{t.awaits_response ? 'Ожидает ответа' : 'Закрыт'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-400 group-hover:text-blue-600 transition-colors">
                                            <svg className={`w-5 h-5 ml-auto transform transition-transform ${isSelected ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </td>
                                    </tr>

                                    {isSelected && (
                                        <tr className="bg-gray-50/30">
                                            <td colSpan={4} className="px-8 py-6">
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                    <div>
                                                        <h4 className="text-[11px] uppercase font-bold text-gray-400 mb-3 tracking-widest">Описание проблемы</h4>
                                                        <p className="text-sm text-gray-700 leading-relaxed bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                            {t.description || 'Нет описания'}
                                                        </p>
                                                        {/* show response for normal users */}
                                                        {!isStaff && t.response && (
                                                            <div className="mt-4">
                                                                <h4 className="text-[11px] uppercase font-bold text-gray-400 mb-1 tracking-widest">Ответ поддержки</h4>
                                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                                    {t.response}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="space-y-3">
                                                        {t.user_email && (
                                                            <div className="text-xs text-gray-500">От: {t.user_email} ({t.user_role})</div>
                                                        )}

                                                        {isStaff && (
                                                            <div>
                                                                <label className="block text-[11px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Ответ поддержки</label>
                                                                <textarea
                                                                    value={editResponse}
                                                                    onChange={(e) => setEditResponse(e.target.value)}
                                                                    className="w-full p-3 text-sm bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                                    rows={4}
                                                                />
                                                                <button
                                                                    onClick={() => handleAddResponse(t)}
                                                                    className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
                                                                >
                                                                    Отправить ответ
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}