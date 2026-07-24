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
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={id}
        className={twMerge(clsx(
          'w-full px-4 py-2.5 text-sm bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400',
          error 
            ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' 
            : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300',
          className
        ))}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
