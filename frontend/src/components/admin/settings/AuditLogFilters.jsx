import React, { useState, useEffect } from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { Search } from 'lucide-react';

export function AuditLogFilters({
  search,
  moduleFilter,
  statusFilter,
  onSearchChange,
  onModuleChange,
  onStatusChange
}) {
  const [searchTerm, setSearchTerm] = useState(search);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearchChange(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearchChange]);

  const moduleOptions = [
    { value: 'all', label: 'All Modules' },
    { value: 'Users', label: 'Users' },
    { value: 'Companies', label: 'Companies' },
    { value: 'Jobs', label: 'Jobs' },
    { value: 'Security', label: 'Security' },
    { value: 'Analytics', label: 'Analytics' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Success', label: 'Success' },
    { value: 'Failed', label: 'Failed' }
  ];

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full items-stretch md:items-center justify-between">
      {/* Search Input */}
      <div className="relative w-full md:max-w-xs">
        <Input
          id="audit-log-search"
          type="text"
          placeholder="Search by action, admin, or IP..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-2.5 rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 w-full text-xs"
          icon={<Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />}
        />
      </div>

      {/* Selector Dropdowns */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="w-full sm:w-36">
          <Select
            id="audit-module-filter"
            value={moduleFilter}
            options={moduleOptions}
            onChange={(e) => onModuleChange(e.target.value)}
            aria-label="Filter by audit module"
          />
        </div>
        <div className="w-full sm:w-36">
          <Select
            id="audit-status-filter"
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => onStatusChange(e.target.value)}
            aria-label="Filter by audit status"
          />
        </div>
      </div>
    </div>
  );
}

export default AuditLogFilters;
