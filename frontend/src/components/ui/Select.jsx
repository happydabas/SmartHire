import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Select = React.forwardRef(({
  label,
  error,
  options = [],
  className,
  id,
  placeholder,
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
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={twMerge(clsx(
            'w-full px-4 py-3 text-sm bg-white dark:bg-[#15161e] border rounded-2xl transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 dark:disabled:bg-slate-800/40 disabled:text-slate-400 dark:disabled:text-slate-500 appearance-none cursor-pointer text-slate-800 dark:text-slate-100 font-medium',
            error 
              ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' 
              : 'border-slate-200 dark:border-slate-800 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 dark:hover:border-slate-700',
            className
          ))}
          {...props}
        >
          {placeholder && <option value="" className="bg-white dark:bg-[#15161e] text-slate-800 dark:text-slate-100">{placeholder}</option>}
          {options.map((option, index) => {
            const val = typeof option === 'object' ? option.value : option;
            const labelText = typeof option === 'object' ? option.label : option;
            return (
              <option key={index} value={val} className="bg-white dark:bg-[#15161e] text-slate-800 dark:text-slate-100">
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 font-semibold">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
