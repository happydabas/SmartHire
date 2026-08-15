import React from 'react';
import { X } from 'lucide-react';

export const FilterChip = ({ label, onClear, ...props }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClear?.();
    }
  };

  return (
    <span
      className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-xl select-none transition-all hover:bg-blue-100/50 dark:hover:bg-blue-900/60"
      {...props}
    >
      <span>{label}</span>
      <button
        type="button"
        onClick={onClear}
        onKeyDown={handleKeyDown}
        className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 focus:text-blue-700 transition-colors p-0.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  );
};

export default FilterChip;
