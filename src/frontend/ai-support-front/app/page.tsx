'use client';

import React, { useCallback, useState, useEffect } from 'react';
import TicketTable from '../components/TicketTable';
import TicketForm from '../components/TicketForm';
import Modal from '../components/Modal';
import { createTicket } from '../lib/api';
import { Ticket } from '../types';

// --- Типы для авторизации ---
type Role = 'admin' | 'operator';
type User = { username: string; role: Role };

export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showOperatorModal, setShowOperatorModal] = useState(false);

  // Имитация проверки сессии при загрузке
  useEffect(() => {
    const saved = localStorage.getItem('support_ai_user');
    if (saved) setUser(JSON.parse(saved));
    setIsInitialized(true);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('support_ai_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('support_ai_user');
  };

  const onCreateTicket = useCallback(async (payload: Omit<Ticket, 'id' | 'createdAt'>) => {
    await createTicket(payload);
    setRefreshKey((k) => k + 1);
  }, []);

  // Если еще не проверили localStorage, не рендерим ничего (защита от гидратации)
  if (!isInitialized) return null;

  // 1. Экран логина
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  // 2. Основной дашборд (после входа)
  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 mb-8 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Support<span className="text-blue-600">AI</span></span>
            </div>

            {/* Меню для админа */}
            {user.role === 'admin' && (
              <button
                onClick={() => setShowOperatorModal(true)}
                className="text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
              >
                Управление операторами
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{user.username}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">{user.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Выйти"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
            <button
              onClick={() => setShowTicketModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <span>+ Новый тикет</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1440px] mx-auto px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Всего тикетов" value="128" change="+12%" />
          <StatCard label="Ожидают ответа" value="14" color="text-blue-600" />
          <StatCard label="Операторы в сети" value="4" />
        </div>

        <TicketTable key={refreshKey} refreshKey={refreshKey} />

        {/* Модалка создания тикета */}
        <Modal open={showTicketModal} title="Создать запрос" onClose={() => setShowTicketModal(false)}>
          <TicketForm
            onCreate={async (p) => {
              await onCreateTicket(p);
              setShowTicketModal(false);
            }}
            onCancel={() => setShowTicketModal(false)}
          />
        </Modal>

        {/* Модалка регистрации оператора (Только для админа) */}
        <Modal open={showOperatorModal} title="Регистрация оператора" onClose={() => setShowOperatorModal(false)}>
          <OperatorRegistrationForm onCancel={() => setShowOperatorModal(false)} />
        </Modal>
      </div>
    </main>
  );
}

// --- Компонент Формы Логина ---
function LoginForm({ onLogin }: { onLogin: (u: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin') {
      onLogin({ username: 'admin', role: 'admin' });
    } else if (username === 'user' && password === 'user') {
      onLogin({ username: 'Operator_1', role: 'operator' });
    } else {
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/40 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Войти в SupportAI</h1>
          <p className="text-gray-500 text-sm mt-1">Введите данные для доступа к панели</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-5">
          {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">{error}</div>}
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 ml-1">Логин</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2 ml-1">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all">
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
}

// --- Форма регистрации нового оператора ---
function OperatorRegistrationForm({ onCancel }: { onCancel: () => void }) {
  const [role, setRole] = useState<Role>('operator');

  return (
    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Оператор создан (имитация)'); onCancel(); }}>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">ФИО / Никнейм</label>
        <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" placeholder="Иван Иванов" />
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Роль в системе</label>
        <select
          value={role}
          onChange={e => setRole(e.target.value as Role)}
          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
        >
          <option value="operator">Оператор (только ответы)</option>
          <option value="admin">Администратор (полный доступ)</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Временный пароль</label>
        <input className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:bg-white" type="password" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Отмена</button>
        <button className="flex-[2] py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-md">Зарегистрировать</button>
      </div>
    </form>
  );
}

// Старая карточка статистики (StatCard) — без изменений
function StatCard({ label, value, change, color = "text-gray-900" }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-transform hover:scale-[1.02]">
      <div className="text-[11px] uppercase font-black text-gray-400 tracking-widest mb-1">{label}</div>
      <div className="flex items-end justify-between">
        <div className={`text-3xl font-bold ${color} tracking-tight`}>{value}</div>
        {change && <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">{change}</div>}
      </div>
    </div>
  )
}