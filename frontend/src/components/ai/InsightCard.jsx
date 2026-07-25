import React from 'react';

export function InsightCard({ title = '', value = '', subtitle = '', icon: Icon }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center gap-4 animate-fadeIn">
      {Icon && (
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl dark:bg-indigo-950/20 dark:text-indigo-400 shrink-0">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="min-w-0">
        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider dark:text-slate-505">
          {title}
        </span>
        <h4 className="text-xl font-black text-slate-800 dark:text-white mt-0.5">
          {value}
        </h4>
        {subtitle && (
          <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

export default InsightCard;
