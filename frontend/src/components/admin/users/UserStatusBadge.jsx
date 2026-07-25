import React from 'react';

export function UserStatusBadge({ status }) {
  const isActive = status === 'active';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
      isActive 
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

export default UserStatusBadge;
