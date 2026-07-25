import React from 'react';

export function NotificationFilters({ activeFilter, onChangeFilter }) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'read', label: 'Read' }
  ];

  return (
    <div className="flex border-b border-slate-100 dark:border-slate-800" role="tablist" aria-label="Notification filters">
      {filters.map((f) => {
        const isSelected = activeFilter === f.key;
        return (
          <button
            key={f.key}
            role="tab"
            aria-selected={isSelected}
            aria-controls="notification-list-panel"
            id={`filter-tab-${f.key}`}
            onClick={() => onChangeFilter(f.key)}
            className={`px-6 py-3 text-sm font-black transition-all border-b-2 outline-none ${
              isSelected
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200 dark:hover:text-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

export default NotificationFilters;
