import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:opacity-80 transition-all">
            SmartHire
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
