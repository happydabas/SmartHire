import React from 'react';
import Select from '@/components/ui/Select';

export function CompanyFilters({
  verificationFilter,
  statusFilter,
  industryFilter,
  industries = [],
  onVerificationChange,
  onStatusChange,
  onIndustryChange
}) {
  const verificationOptions = [
    { value: 'all', label: 'All Verifications' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const industryOptions = [
    { value: 'all', label: 'All Industries' },
    ...industries.map(ind => ({ value: ind, label: ind }))
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="w-full sm:w-40">
        <Select
          id="filter-verification-select"
          value={verificationFilter}
          options={verificationOptions}
          onChange={(e) => onVerificationChange(e.target.value)}
          aria-label="Filter by verification status"
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          id="filter-status-select"
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by account status"
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          id="filter-industry-select"
          value={industryFilter}
          options={industryOptions}
          onChange={(e) => onIndustryChange(e.target.value)}
          aria-label="Filter by industry"
        />
      </div>
    </div>
  );
}

export default CompanyFilters;
