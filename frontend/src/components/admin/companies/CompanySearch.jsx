import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import Input from '@/components/ui/Input';

export function CompanySearch({ onSearch, placeholder = 'Search companies by name, industry, or owner...' }) {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative w-full md:max-w-md">
      <Input
        id="company-search-input"
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-10 py-2.5 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 w-full"
        icon={<Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
          aria-label="Clear search query"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default CompanySearch;
