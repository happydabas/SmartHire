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
          {typeof label === 'string' ? label.replace(/\s*\*/g, '') : label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        className={twMerge(
          clsx(
            'block w-full rounded-2xl border bg-white dark:bg-[#15161e] px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:bg-slate-50 dark:disabled:bg-slate-800/40 transition-all resize-y font-medium',
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-700'
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
