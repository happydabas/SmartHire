import React from 'react';
import { Search, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  className,
  id,
  ...props
}) => {
  return (
    <div className={twMerge('relative w-full flex items-center', className)}>
      <div className="absolute left-3.5 pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
