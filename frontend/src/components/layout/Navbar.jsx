import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-4">
        <Link to="/" className="text-xl font-black text-blue-600 tracking-tight flex items-center gap-1.5 hover:opacity-90">
          <span className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/20">S</span>
          SmartHire
        </Link>
      </div>

      {/* Only show Sign In / Get Started on public pages */}
      {!isAuthenticated && (
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
