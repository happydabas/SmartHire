import React from 'react';
import { Sparkles } from 'lucide-react';

export function RecommendationReason({ text = '' }) {
  return (
    <div className="flex gap-2 items-start text-xs font-semibold text-slate-700 bg-indigo-50/50 p-3.5 border border-indigo-100/50 rounded-2xl dark:bg-indigo-950/10 dark:border-indigo-950/20 dark:text-indigo-400">
      <Sparkles className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );
}

export default RecommendationReason;
