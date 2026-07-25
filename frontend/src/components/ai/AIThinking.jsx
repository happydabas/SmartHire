import React from 'react';
import { BrainCircuit } from 'lucide-react';

export function AIThinking({ message = 'Analyzing request parameters...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4" role="status" aria-live="polite">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-ping" />
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl dark:bg-blue-950/30 dark:text-blue-400 relative">
          <BrainCircuit className="w-8 h-8 animate-pulse" />
        </div>
      </div>
      <div className="space-y-1 text-center">
        <p className="text-sm font-black text-slate-800 dark:text-white">
          Thinking...
        </p>
        <p className="text-xs text-slate-400 font-bold dark:text-slate-500">
          {message}
        </p>
      </div>
    </div>
  );
}

export default AIThinking;
