import React from 'react';

export function CompanyStatusBadge({ status }) {
  const isActive = status === 'active';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
      isActive 
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' 
        : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
    }`}>
      {isActive ? 'Active' : 'Suspended'}
    </span>
  );
}

export default CompanyStatusBadge;
