import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function SummaryCard({ title, value, icon: Icon, change, trend = 'up' }) {
  const isPositive = trend === 'up';

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
      <div className="space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-505">
          {title}
        </p>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white">
          {value.toLocaleString()}
        </h3>
        {change !== undefined && (
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`inline-flex items-center text-xs font-black ${
              isPositive ? 'text-emerald-600 dark:text-emerald-405' : 'text-rose-600 dark:text-rose-405'
            }`}>
              {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {change}%
            </span>
            <span className="text-[10px] text-slate-400 font-bold dark:text-slate-505">vs last month</span>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 text-slate-550 rounded-2xl dark:bg-slate-800 dark:text-slate-400">
        {Icon && <Icon className="w-6 h-6 shrink-0" />}
      </div>
    </div>
  );
}

export default SummaryCard;
