import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Menu } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';

function Navbar({ onMenuClick }) {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-4">
        {isAuthenticated && onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl lg:hidden transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="text-xl font-black text-blue-600 dark:text-white tracking-tight flex items-center gap-1.5 hover:opacity-90">
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">S</span>
          Smart<span className="text-blue-600">Hire</span>
        </Link>
      </div>

      {/* Render notification bell if authenticated, otherwise auth controls */}
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <NotificationBell />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-all px-3 py-2 rounded-xl hover:bg-slate-50"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2.5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
