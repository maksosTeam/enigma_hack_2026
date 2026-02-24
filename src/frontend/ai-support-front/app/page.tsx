'use client';

import React, { useCallback, useEffect, useState } from 'react';
import TicketForm from '../components/TicketForm';
import TicketTable from '../components/TicketTable';
import { createTicket } from '../lib/api';
import { Ticket } from '../types';

export default function Page() {
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const onCreate = useCallback(
    async (payload: Omit<Ticket, 'id' | 'createdAt'>) => {
      await createTicket(payload);
      setRefreshKey((k) => k + 1);
    },
    []
  );

  // сброс выбранного тикета при обновлении таблицы
  useEffect(() => {
    setSelected(null);
  }, [refreshKey]);

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Сервис для отслеживания тикетов в техподдержку
        </h1>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <TicketTable
            key={refreshKey}
            onSelect={(t) => setSelected(t)}
          />
        </div>

        <div className="space-y-4">
          <TicketForm onCreate={onCreate} />

          {selected && (
            <div className="p-4 bg-white rounded shadow">
              <h3 className="font-medium mb-2">Детали тикета</h3>

              <div className="text-sm text-gray-500">
                ID: {selected.id}
              </div>

              <div className="mt-2 font-medium">
                {selected.subject}
              </div>

              <div className="mt-2 text-sm whitespace-pre-wrap">
                {selected.description}
              </div>

              <div className="mt-3 text-sm text-gray-600">
                Приоритет: {selected.priority}
              </div>

              <div className="text-sm text-gray-600">
                Статус: {selected.status}
              </div>

              <div className="text-xs text-gray-400 mt-2">
                Создан: {new Date(selected.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
