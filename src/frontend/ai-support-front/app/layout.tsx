import './globals.css';
import React from 'react';

export const metadata = {
  title: 'Support AI Agent',
  description: 'Заготовка интерфейса для хакатона',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body suppressHydrationWarning className="bg-gray-50 min-h-screen p-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </body>
    </html>
  );
}