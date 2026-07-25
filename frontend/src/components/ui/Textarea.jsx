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
          className="block text-xs font-semibold text-slate-700 select-none"
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
            'block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-slate-50 transition-all resize-y',
            { 'border-red-500 focus:border-red-500 focus:ring-red-500': error }
          ),
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs font-semibold text-red-500 select-none animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
