import React from 'react';

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
      <h2 className="text-3xl font-extrabold text-slate-800">404 - Page Not Found</h2>
      <p className="text-slate-600">The page you requested does not exist or has been moved.</p>
    </div>
  );
}

export default NotFound;
