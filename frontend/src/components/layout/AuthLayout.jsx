import React from 'react';
import { Outlet, Link } from 'react-router-dom';

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-[440px] bg-white border border-slate-200/80 rounded-[28px] shadow-[0_15px_45px_rgba(0,0,0,0.07)] p-7 sm:p-9">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center gap-2.5 group">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
              S
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Smart<span className="text-blue-600">Hire</span>
            </span>
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
