import React from 'react';
import Spinner from './Spinner';

export const FullPageLoader = ({ message = 'Navigating Workspace...' }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/75 backdrop-blur-sm select-none"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 flex flex-col items-center justify-center space-y-4 max-w-xs w-full text-center mx-4">
        <Spinner size="lg" className="text-blue-600" />
        <div>
          <h3 className="text-sm font-bold text-slate-800 tracking-tight">SmartHire</h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default FullPageLoader;
