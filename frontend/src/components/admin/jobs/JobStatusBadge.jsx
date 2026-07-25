import React from 'react';

export function JobStatusBadge({ status }) {
  const configs = {
    pending: {
      label: 'Pending',
      style: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    },
    published: {
      label: 'Published',
      style: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
    },
    closed: {
      label: 'Closed',
      style: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    },
    rejected: {
      label: 'Rejected',
      style: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
    }
  };

  const current = configs[status] || { label: status, style: 'bg-slate-50 text-slate-500' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${current.style}`}>
      {current.label}
    </span>
  );
}

export default JobStatusBadge;
