import React from 'react';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-pulse">
      {/* Title block */}
      <div className="h-8 bg-slate-200 rounded w-1/3 dark:bg-slate-800" />
      <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-800 mt-2" />

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 flex justify-between items-center dark:bg-slate-900 dark:border-slate-800">
            <div className="space-y-3 w-1/2">
              <div className="h-3 bg-slate-200 rounded w-2/3 dark:bg-slate-800" />
              <div className="h-6 bg-slate-200 rounded w-1/2 dark:bg-slate-800" />
            </div>
            <div className="w-12 h-12 bg-slate-200 rounded-2xl dark:bg-slate-800" />
          </div>
        ))}
      </div>

      {/* Analytics & Quick Actions block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions skeleton */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4 dark:bg-slate-800" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border border-slate-100 p-4 rounded-2xl flex items-center justify-between dark:border-slate-800">
                  <div className="flex gap-4 items-center w-full">
                    <div className="w-11 h-11 bg-slate-200 rounded-xl dark:bg-slate-800" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3 bg-slate-200 rounded w-1/3 dark:bg-slate-800" />
                      <div className="h-2 bg-slate-200 rounded w-2/3 dark:bg-slate-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Analytics block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between h-40">
                <div className="space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/2 dark:bg-slate-800" />
                  <div className="h-5 bg-slate-200 rounded w-1/3 dark:bg-slate-800" />
                </div>
                <div className="h-10 bg-slate-200 rounded-2xl dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>

        {/* Right col: Recent activities */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 dark:bg-slate-900 dark:border-slate-800 space-y-6">
          <div className="h-4 bg-slate-200 rounded w-1/3 dark:bg-slate-800" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-8.5 h-8.5 bg-slate-200 rounded-lg dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-3/4 dark:bg-slate-800" />
                  <div className="h-2.5 bg-slate-200 rounded w-1/4 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardSkeleton;
