import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, variant = 'neutral', className, ...props }) => {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border transition-colors';

  const variants = {
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
