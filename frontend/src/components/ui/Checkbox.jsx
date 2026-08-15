import React from 'react';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Checkbox = React.forwardRef(({ 
  label, 
  id, 
  error, 
  className, 
  checked,
  onChange,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="peer sr-only"
            {...props}
          />
          {/* Custom Checkbox Design */}
          <div 
            onClick={() => onChange?.({ target: { id, checked: !checked } })}
            className={twMerge(
              'w-5 h-5 border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 select-none bg-white dark:bg-[#15161e]',
              checked 
                ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10 dark:bg-blue-600 dark:border-blue-600' 
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-700',
              error && 'border-red-500',
              className
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </div>
        {label && (
          <label 
            htmlFor={id} 
            className="text-sm font-bold text-slate-650 dark:text-slate-350 select-none cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
      {error && (
        <p className="text-xs font-semibold text-red-500 select-none pl-8 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
export default Checkbox;
