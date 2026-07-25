import React from 'react';

export function AnalyticsCard({ title, value, percentage, type = 'user' }) {
  // Styles based on analytics type
  const typeConfigs = {
    user: {
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      lineColor: '#6366f1'
    },
    job: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      lineColor: '#10b981'
    },
    application: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50/50 dark:bg-blue-950/20',
      lineColor: '#3b82f6'
    }
  };

  const config = typeConfigs[type] || typeConfigs.user;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between h-full">
      <div>
        <span className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          {title}
        </span>
        <div className="flex items-baseline gap-2 mt-2">
          <h4 className="text-2xl font-black text-slate-900 dark:text-white">
            {value}
          </h4>
          <span className="text-xs font-black text-emerald-500">
            +{percentage}%
          </span>
        </div>
      </div>

      {/* Premium SVG sparkline display placeholder */}
      <div className={`mt-6 p-4 rounded-2xl ${config.bg} flex items-center justify-between`}>
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400">Growth Trend (Mock)</span>
        <svg className="w-20 h-6 shrink-0" viewBox="0 0 80 24">
          <path
            d="M0,20 Q15,4 30,16 T60,6 T80,12"
            fill="none"
            stroke={config.lineColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

export default AnalyticsCard;
