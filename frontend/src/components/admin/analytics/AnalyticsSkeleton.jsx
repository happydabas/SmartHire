import React from 'react';

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cards row skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex items-center justify-between">
            <div className="space-y-3 w-2/3">
              <div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" />
              <div className="h-7 bg-slate-200 rounded w-24 dark:bg-slate-850" />
              <div className="h-3.5 bg-slate-200 rounded w-20 dark:bg-slate-850" />
            </div>
            <div className="w-14 h-14 bg-slate-200 rounded-2xl dark:bg-slate-850" />
          </div>
        ))}
      </div>

      {/* Charts row skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-200 rounded w-32 dark:bg-slate-850" />
              <div className="h-2.5 bg-slate-200 rounded w-48 dark:bg-slate-850" />
            </div>
            <div className="h-72 bg-slate-100/50 rounded-2xl flex items-end justify-between p-4 dark:bg-slate-850/30">
              {[30, 45, 60, 40, 75, 55, 80].map((h, idx) => (
                <div key={idx} style={{ height: `${h}%` }} className="w-8 bg-slate-200 rounded dark:bg-slate-800" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tables row skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-200 rounded w-32 dark:bg-slate-850" />
              <div className="h-2.5 bg-slate-200 rounded w-48 dark:bg-slate-850" />
            </div>
            <div className="space-y-3 pt-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="flex justify-between items-center py-2.5">
                  <div className="h-3 bg-slate-200 rounded w-1/3 dark:bg-slate-850" />
                  <div className="h-3 bg-slate-200 rounded w-12 dark:bg-slate-850" />
                  <div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnalyticsSkeleton;
