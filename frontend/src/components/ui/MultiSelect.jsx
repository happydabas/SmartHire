import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Badge from './Badge';

export const MultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Select options...',
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
  const filteredOptions = options.filter(option => {
    const name = option.skill_name || option.label || '';
    const category = option.category || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Group filtered options by category (default to "General" if not provided)
  const groupedOptions = filteredOptions.reduce((acc, option) => {
    const cat = option.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(option);
    return acc;
  }, {});

  const handleToggleOption = (optionId) => {
    const isSelected = selectedValues.includes(optionId);
    let newSelected;
    if (isSelected) {
      newSelected = selectedValues.filter(val => val !== optionId);
    } else {
      newSelected = [...selectedValues, optionId];
    }
    onChange?.({ target: { id, value: newSelected } });
  };

  const handleRemoveValue = (e, optionId) => {
    e.stopPropagation();
    const newSelected = selectedValues.filter(val => val !== optionId);
    onChange?.({ target: { id, value: newSelected } });
  };

  // Find detailed object for currently selected IDs
  const selectedObjects = options.filter(opt => selectedValues.includes(opt.id || opt.value));

  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 select-none">
          {label}
        </label>
      )}

      {/* Trigger Area containing Chips */}
      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          'w-full min-h-[46px] rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 text-left flex flex-wrap items-center gap-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 hover:border-slate-300 transition-all cursor-pointer select-none',
          error && 'border-red-400 focus-within:border-red-500 focus-within:ring-red-400/20',
          className
        )}
        {...props}
      >
        {selectedObjects.length === 0 ? (
          <span className="text-slate-400">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedObjects.map(opt => {
              const name = opt.skill_name || opt.label || '';
              const val = opt.id || opt.value;
              return (
                <Badge
                  key={val}
                  variant="primary"
                  className="pl-2.5 pr-1.5 py-0.5 rounded-lg text-xs font-semibold flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200"
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveValue(e, val)}
                    className="p-0.5 hover:bg-blue-100 hover:text-blue-900 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-current" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
        <div className="ml-auto pl-2 shrink-0">
          <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200" />
        </div>
      </div>

      {/* Dropdown Options Box */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto p-2 space-y-2 animate-in fade-in duration-100">
          {/* Search Box */}
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              className="w-full bg-slate-50 border border-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-all placeholder-slate-400"
              placeholder="Search option catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options Display List */}
          <div className="overflow-y-auto max-h-52 divide-y divide-slate-50">
            {Object.keys(groupedOptions).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No matches found</p>
            ) : (
              Object.keys(groupedOptions).map(category => (
                <div key={category} className="py-2 first:pt-0 last:pb-0">
                  <span className="block px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {category}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {groupedOptions[category].map(option => {
                      const val = option.id || option.value;
                      const name = option.skill_name || option.label || '';
                      const isChecked = selectedValues.includes(val);

                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleToggleOption(val)}
                          className={twMerge(
                            'w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between hover:bg-blue-50 hover:text-blue-700',
                            isChecked ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'
                          )}
                        >
                          <span>{name}</span>
                          {isChecked && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                        </button>
                      );
                    })}
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

export default MultiSelect;
