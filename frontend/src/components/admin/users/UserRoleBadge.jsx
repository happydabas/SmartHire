import React from 'react';

export function UserRoleBadge({ role }) {
  const configs = {
    admin: {
      label: 'Admin',
      style: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
    },
    recruiter: {
      label: 'Recruiter',
      style: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    },
    job_seeker: {
      label: 'Job Seeker',
      style: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400'
    }
  };

  const current = configs[role] || { label: role, style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black leading-none ${current.style}`}>
      {current.label}
    </span>
  );
}

export default UserRoleBadge;
