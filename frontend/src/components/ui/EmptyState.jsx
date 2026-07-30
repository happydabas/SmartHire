import React from 'react';
import { twMerge } from 'tailwind-merge';

export const EmptyState = ({ 
  title, 
  description, 
  action, 
  icon, 
  className,
  ...props 
}) => {
  return (
    <div 
      className={twMerge(
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/10 transition-colors',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="text-slate-400 dark:text-slate-500 mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">{title}</h3>
      {description && (
        <p className="text-xs text-slate-450 dark:text-slate-500 mt-1 max-w-sm leading-relaxed font-semibold">{description}</p>
      )}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
