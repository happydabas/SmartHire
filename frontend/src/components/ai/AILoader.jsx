import React from 'react';
import { Loader2 } from 'lucide-react';

export function AILoader({ message = 'AI is processing...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3" role="status" aria-live="polite">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      <p className="text-sm font-bold text-slate-600 dark:text-slate-350">
        {message}
      </p>
    </div>
  );
}

export default AILoader;
