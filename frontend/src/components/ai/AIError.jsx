import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export function AIError({ message, onRetry }) {
  const displayMessage = message || 'AI service temporarily unavailable. Please try again later.';
  
  return (
    <div className="flex flex-col items-center justify-center p-6 text-center border border-rose-100 rounded-3xl bg-rose-50/10 dark:bg-rose-950/5 dark:border-rose-950/20 max-w-sm mx-auto">
      <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl mb-3 dark:bg-rose-950/30">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
        AI Processing Failure
      </h4>
      <p className="text-xs text-slate-500 font-semibold mt-1 mb-4 leading-normal dark:text-slate-400">
        {displayMessage}
      </p>
      {onRetry && (
        <Button
          variant="primary"
          onClick={onRetry}
          className="rounded-xl font-black text-xs px-4 py-2 flex items-center gap-1.5"
          aria-label="Retry AI request"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Request</span>
        </Button>
      )}
    </div>
  );
}

export default AIError;
