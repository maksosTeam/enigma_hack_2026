'use client';

import React, { useCallback, useState } from 'react';
import TicketTable from '../components/TicketTable';
import TicketForm from '../components/TicketForm';
import Modal from '../components/Modal';
import { createTicket } from '../lib/api';
import { Ticket } from '../types';

export default function Page() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const onCreate = useCallback(async (payload: Omit<Ticket, 'id' | 'createdAt'>) => {
    await createTicket(payload);
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">Support<span className="text-blue-600">AI</span></span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
          >
            <span>+</span>
            <span>Новый тикет</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Всего тикетов" value="128" change="+12%" />
          <StatCard label="Ожидают ответа" value="14" color="text-blue-600" />
          <StatCard label="Среднее время AI" value="1.2 сек" />
        </div>

        <section>
          <TicketTable key={refreshKey} refreshKey={refreshKey} />
        </section>

        <Modal open={showModal} title="Создать запрос" onClose={() => setShowModal(false)}>
          <TicketForm
            onCreate={async (p) => {
              await onCreate(p);
              setShowModal(false);
            }}
            onCancel={() => setShowModal(false)}
          />
        </Modal>
      </div>
    </main>
  );
}

function StatCard({ label, value, change, color = "text-gray-900" }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-[11px] uppercase font-bold text-gray-400 tracking-wider mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {change && <div className="text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-lg">{change}</div>}
      </div>
    </div>
  )
}