import React from 'react';
import { Filter } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Select from './Select';

export const FilterDropdown = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  className,
  id,
  ...props
}) => {
  return (
    <div className={twMerge('flex flex-col space-y-1.5 w-full sm:w-auto min-w-[150px]', className)}>
      <Select
        id={id}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        label={
          label ? (
            <span className="flex items-center gap-1.5 text-slate-500 font-bold select-none">
              <Filter className="w-3 h-3 text-slate-400" />
              <span>{label}</span>
            </span>
          ) : null
        }
        className="py-2 text-xs font-semibold text-slate-600 rounded-xl"
        {...props}
      />
    </div>
  );
};

export default FilterDropdown;
