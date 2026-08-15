import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Select from './Select';

export const SortDropdown = ({
  value,
  onChange,
  options = [],
  placeholder,
  className,
  id,
  ...props
}) => {
  return (
    <div className={twMerge('flex flex-col space-y-1.5 w-full sm:w-auto min-w-[160px]', className)}>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        label={
          <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold select-none">
            <ArrowUpDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            <span>Sort By</span>
          </span>
        }
        className="py-2 text-xs font-semibold text-slate-600 dark:text-slate-200 rounded-xl"
        {...props}
      />
    </div>
  );
};

export default SortDropdown;
