import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Textarea = React.forwardRef(({ 
  label, 
  id, 
  error, 
  className, 
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-xs font-bold text-slate-500 dark:text-slate-400 select-none uppercase tracking-wider"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={twMerge(
          clsx(
            'block w-full rounded-2xl border border-slate-205 bg-white dark:bg-[#15161e] px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-455 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-850/40 transition-all resize-y',
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-205 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-505 hover:border-slate-300 dark:hover:border-slate-700'
          ),
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-semibold text-red-500 select-none animate-fadeIn mt-1">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
