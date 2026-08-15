import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X, Sparkles, Trash2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Badge from './Badge';

export const MultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'Search skills (e.g. React, Python, Docker)...',
  label,
  id,
  error,
  className,
  inline = true,
  showCategoryFilters = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const containerRef = useRef(null);

  // Close dropdown on click outside if not inline
  useEffect(() => {
    if (inline) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [inline]);

  // Extract all categories
  const categories = Array.from(
    new Set(options.map(opt => opt.category || 'General'))
  );

  // Filter options based on search and category tab
  const filteredOptions = options.filter(option => {
    const name = (option.skill_name || option.label || '').toLowerCase();
    const category = (option.category || 'General').toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || category.includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || option.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Group filtered options by category
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
    e?.stopPropagation();
    const newSelected = selectedValues.filter(val => val !== optionId);
    onChange?.({ target: { id, value: newSelected } });
  };

  const handleClearAll = () => {
    onChange?.({ target: { id, value: [] } });
  };

  // Detailed objects for selected IDs
  const selectedObjects = options.filter(opt => selectedValues.includes(opt.id || opt.value));

  const renderContent = () => (
    <div className="w-full bg-slate-50/80 dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-6 shadow-sm">
      {/* Top Bar: Search Input & Quick Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        {/* Search Bar matching Resume UI */}
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0d1017] text-sm text-slate-800 dark:text-white focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Tabs (Optional) */}
        {showCategoryFilters && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('ALL')}
              className={twMerge(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none',
                activeCategory === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              )}
            >
              All ({options.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={twMerge(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer select-none',
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Clear All Action */}
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 transition-colors shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear ({selectedValues.length})</span>
          </button>
        )}
      </div>

      {/* Selected Chips Summary Tray */}
      {selectedObjects.length > 0 && (
        <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Selected Competencies ({selectedObjects.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedObjects.map(opt => {
              const name = opt.skill_name || opt.label || '';
              const val = opt.id || opt.value;
              return (
                <span
                  key={val}
                  className="pl-3 pr-2 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 bg-white dark:bg-slate-900 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs group"
                >
                  <span>{name}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveValue(e, val)}
                    className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/60 hover:text-blue-900 rounded-lg transition-colors text-blue-400 dark:text-blue-400 group-hover:text-blue-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Categorized Skills Section matching Job Seeker Resume UI */}
      {Object.keys(groupedOptions).length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-[#0d1017] rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-500">No skills matching "{searchQuery}"</p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
            className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Reset Search
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedOptions).map(category => {
            const categorySkills = groupedOptions[category];
            const catSkillIds = categorySkills.map(s => s.id || s.value);
            const selectedInCatCount = catSkillIds.filter(idVal => selectedValues.includes(idVal)).length;

            return (
              <div key={category} className="space-y-3">
                {/* Category Header Bar matching Resume UI */}
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/80 dark:border-slate-800">
                  <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {category}
                  </h4>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-900">
                    {selectedInCatCount} selected
                  </span>
                </div>

                {/* Categorized Skill Pill Chips */}
                <div className="flex flex-wrap gap-2.5">
                  {categorySkills.map(option => {
                    const val = option.id || option.value;
                    const name = option.skill_name || option.label || '';
                    const isChecked = selectedValues.includes(val);

                    return (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleToggleOption(val)}
                        className={twMerge(
                          'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer select-none',
                          isChecked
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                        )}
                      >
                        {isChecked && <Check className="w-4 h-4 text-white shrink-0" />}
                        <span>{name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  if (inline) {
    return (
      <div className="space-y-2 w-full" ref={containerRef}>
        {label && (
          <label htmlFor={id} className="block text-sm font-bold text-slate-800 dark:text-slate-200 select-none">
            {label}
          </label>
        )}
        {renderContent()}
        {error && (
          <p className="text-xs font-semibold text-red-500 select-none animate-fadeIn">
            {error}
          </p>
        )}
      </div>
    );
  }

  // Popover mode fallback
  return (
    <div className="space-y-1.5 w-full relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 select-none">
          {label}
        </label>
      )}

      <div
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={twMerge(
          'w-full min-h-[50px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15161e] px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 text-left flex flex-wrap items-center gap-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 hover:border-slate-300 transition-all cursor-pointer select-none',
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
        <div className="ml-auto pl-2 shrink-0 flex items-center gap-2">
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {selectedObjects.length} skills
          </span>
          <ChevronDown className={twMerge('w-4 h-4 text-slate-400 transition-transform duration-200', isOpen && 'rotate-180')} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {renderContent()}
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
