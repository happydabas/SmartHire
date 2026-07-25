import React from 'react';

export function DashboardCard({ icon: Icon, title, value, trend, trendType = 'up', colorClass = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' }) {
  return (
    <div 
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between"
      role="region"
      aria-label={`${title} statistics`}
    >
      <div className="space-y-2">
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          {title}
        </span>
        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">
          {value}
        </h3>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
              trendType === 'up' 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
            }`}>
              {trendType === 'up' ? '▲' : '▼'} {trend}
            </span>
            <span className="text-[10px] text-slate-400 font-bold dark:text-slate-500">vs last month</span>
          </div>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
    </div>
  );
}

export default DashboardCard;
