import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Input from '@/components/ui/Input';

export const ApplicantSearch = ({ initialValue = '', onSearchChange, disabled = false }) => {
  const [inputValue, setInputValue] = useState(initialValue);

  // Sync state if initialValue changes externally
  useEffect(() => {
    setInputValue(initialValue);
  }, [initialValue]);

  // Debounce state value updates
  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange?.(inputValue);
    }, 350);

    return () => clearTimeout(handler);
  }, [inputValue]);

  return (
    <div className="relative w-full">
      <Input
        id="applicant-search-input"
        label="Search Candidates"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search by name, email, job title..."
        disabled={disabled}
        className="pl-10 pr-10 text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-xl"
      />
      <div className="absolute left-3.5 bottom-3.5 text-slate-400 dark:text-slate-500" aria-hidden="true">
        <Search className="w-4 h-4" />
      </div>
      {inputValue && !disabled && (
        <button
          type="button"
          onClick={() => setInputValue('')}
          className="absolute right-3 bottom-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:text-slate-600 transition-colors p-0.5 rounded-lg"
          aria-label="Clear Search Input"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ApplicantSearch;
