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
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={twMerge(clsx(
            'w-full px-4 py-2.5 text-sm bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 appearance-none cursor-pointer',
            error 
              ? 'border-red-400 focus:ring-red-400/20 focus:border-red-500' 
              : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300',
            className
          ))}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option, index) => {
            const val = typeof option === 'object' ? option.value : option;
            const labelText = typeof option === 'object' ? option.label : option;
            return (
              <option key={index} value={val}>
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
