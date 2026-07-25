import React from 'react';
import Select from '@/components/ui/Select';

export function UserFilters({ roleFilter, statusFilter, onRoleChange, onStatusChange }) {
  const roleOptions = [
    { value: 'all', label: 'All Roles' },
    { value: 'job_seeker', label: 'Job Seeker' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'admin', label: 'Admin' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
      <div className="w-full sm:w-44">
        <Select
          id="filter-role-select"
          value={roleFilter}
          options={roleOptions}
          onChange={(e) => onRoleChange(e.target.value)}
          aria-label="Filter by role"
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          id="filter-status-select"
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
        />
      </div>
    </div>
  );
}

export default UserFilters;
