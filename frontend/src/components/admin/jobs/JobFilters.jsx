import React from 'react';
import Select from '@/components/ui/Select';

export function JobFilters({
  statusFilter,
  typeFilter,
  companyFilter,
  companies = [],
  onStatusChange,
  onTypeChange,
  onCompanyChange
}) {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'published', label: 'Published' },
    { value: 'closed', label: 'Closed' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'Full-Time', label: 'Full-Time' },
    { value: 'Part-Time', label: 'Part-Time' },
    { value: 'Internship', label: 'Internship' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Remote', label: 'Remote' }
  ];

  const companyOptions = [
    { value: 'all', label: 'All Companies' },
    ...companies.map(c => ({ value: c, label: c }))
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="w-full sm:w-40">
        <Select
          id="filter-status-select"
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by job status"
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          id="filter-type-select"
          value={typeFilter}
          options={typeOptions}
          onChange={(e) => onTypeChange(e.target.value)}
          aria-label="Filter by job type"
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          id="filter-company-select"
          value={companyFilter}
          options={companyOptions}
          onChange={(e) => onCompanyChange(e.target.value)}
          aria-label="Filter by company"
        />
      </div>
    </div>
  );
}

export default JobFilters;
