import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  label,
  id,
  error,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on query
  const filteredOptions = options.filter(option =>
    option.skill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    option.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered options by category
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const cat = option.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(option);
    return acc;
  }, {});

  const selectedOption = options.find(opt => opt.id === value);

  const handleSelect = (option) => {
    onChange?.({ target: { id, value: option.id } });
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}
      
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 text-left flex items-center justify-between focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all select-none',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        <span className={selectedOption ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {selectedOption ? `${selectedOption.skill_name} (${selectedOption.category})` : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto p-2 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder-slate-400"
              placeholder="Search catalog skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Grouped Options List */}
          <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
            {Object.keys(groupedOptions).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No skills match your search</p>
            ) : (
              Object.keys(groupedOptions).map(category => (
                <div key={category} className="py-2 first:pt-0 last:pb-0">
                  <span className="block px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {category}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {groupedOptions[category].map(option => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => handleSelect(option)}
                        className={twMerge(
                          'w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between hover:bg-blue-50 hover:text-blue-700',
                          value === option.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                        )}
                      >
                        <span>{option.skill_name}</span>
                        {value === option.id && <Check className="w-4 h-4 text-blue-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-semibold text-red-500 select-none animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchableSelect;
