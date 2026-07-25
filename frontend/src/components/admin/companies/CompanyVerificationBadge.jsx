import React from 'react';

export function CompanyVerificationBadge({ status }) {
  const isVerified = status === 'verified';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
      isVerified 
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' 
        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
    }`}>
      {isVerified ? 'Verified' : 'Unverified'}
    </span>
  );
}

export default CompanyVerificationBadge;
