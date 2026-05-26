import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-900">
      <header className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-2xl font-semibold">Todo App</h1>
      </header>
      <main className="flex-1 p-4">
        <Outlet />
      </main>
      <footer className="bg-surface text-center p-2 text-sm">
        © 2026 Todo App
      </footer>
    </div>
  );
}
