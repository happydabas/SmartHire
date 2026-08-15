import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = React.forwardRef(({
  label,
  error,
  type = 'text',
  className,
  id,
  ...props
}, ref) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-bold text-slate-500 dark:text-slate-400 select-none uppercase tracking-wider">
          {typeof label === 'string' ? label.replace(/\s*\*/g, '') : label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        className={twMerge(clsx(
          'w-full px-4 py-3 text-sm bg-white dark:bg-[#15161e] border rounded-2xl transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800/40 disabled:text-slate-400 dark:disabled:text-slate-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium',
          error 
            ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' 
            : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-700',
          className
        ))}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
