'use client';

import React, { useState } from 'react';
import { Priority } from '../types';

type Props = {
    onCreate: (payload: { topic: string; description: string; priority: Priority }) => Promise<void>;
    onCancel?: () => void;
};

export default function TicketForm({ onCreate, onCancel }: Props) {
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<Priority>('middle');
    const [loading, setLoading] = useState(false);

    async function submit(e?: React.FormEvent) {
        e?.preventDefault();
        if (!subject.trim()) return;
        setLoading(true);
        try {
            await onCreate({
                topic: subject.trim(),
                description: description.trim(),
                priority,
            });
            setSubject('');
            setDescription('');
            setPriority('medium');
            onCancel?.();
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={submit} className="space-y-5 p-1">
            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Тема обращения</label>
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Напр: Проблема с оплатой"
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Детальное описание</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите ситуацию подробнее..."
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-32 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all resize-none"
                />
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
                <div className="flex-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Приоритет</label>
                    <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                        {['low', 'middle', 'high'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPriority(p as any)}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${priority === p ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {p === 'low' ? 'Низкий' : p === 'middle' ? 'Средний' : 'Высокий'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-3 mt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-3 border border-gray-100 text-gray-500 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                    Отмена
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-50 transition-all"
                >
                    {loading ? 'Создание...' : 'Создать тикет'}
                </button>
            </div>
        </form>
    );
}