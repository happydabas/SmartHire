import React from 'react';

export function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Tabs list skeleton */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2 space-x-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-4 bg-slate-200 rounded w-20 dark:bg-slate-850" />
        ))}
      </div>

      {/* Main card panel skeleton */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-20 h-20 bg-slate-200 rounded-full dark:bg-slate-850" />
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-slate-200 rounded w-28 dark:bg-slate-850" />
            <div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" />
            <div className="h-3 bg-slate-200 rounded w-44 dark:bg-slate-850" />
          </div>
        </div>

        <div className="space-y-4 max-w-xl pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><div className="h-3 bg-slate-200 rounded w-12 dark:bg-slate-850" /><div className="h-10 bg-slate-100 rounded-xl dark:bg-slate-850" /></div>
            <div className="space-y-1.5"><div className="h-3 bg-slate-200 rounded w-12 dark:bg-slate-850" /><div className="h-10 bg-slate-100 rounded-xl dark:bg-slate-850" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><div className="h-3 bg-slate-200 rounded w-12 dark:bg-slate-850" /><div className="h-10 bg-slate-100 rounded-xl dark:bg-slate-850" /></div>
            <div className="space-y-1.5"><div className="h-3 bg-slate-200 rounded w-12 dark:bg-slate-850" /><div className="h-10 bg-slate-100 rounded-xl dark:bg-slate-850" /></div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl w-36 pt-4 dark:bg-slate-850" />
        </div>
      </div>
    </div>
  );
}

export default SettingsSkeleton;
