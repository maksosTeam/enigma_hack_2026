'use client';

import React, { useEffect, useRef } from 'react';

type Props = {
    open: boolean;
    title?: string;
    children: React.ReactNode;
    onClose: () => void;
};

export default function Modal({ open, title, children, onClose }: Props) {
    const dialogRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            aria-modal="true"
            role="dialog"
            onMouseDown={(e) => {
                // клик вне диалога — закрыть
                if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
                    onClose();
                }
            }}
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                ref={dialogRef}
                className="relative z-10 w-full max-w-3xl mx-4 bg-white rounded-lg shadow-lg p-6"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">{title ?? 'Форма'}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded"
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                <div>{children}</div>
            </div>
        </div>
    );
}