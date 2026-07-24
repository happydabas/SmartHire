import React from 'react';

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 font-sans antialiased">
      <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-xl space-y-4 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          SmartHire Frontend
        </h1>
        <p className="text-slate-600">
          The production-ready React application foundation is successfully initialized.
        </p>
      </div>
    </div>
  );
}

export default Home;
