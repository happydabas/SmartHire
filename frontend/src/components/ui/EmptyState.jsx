import React from 'react';
import clsx from 'clsx';
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
        'flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50',
        className
      )}
      {...props}
    >
      {icon && (
        <div className="text-slate-400 mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">{description}</p>
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
