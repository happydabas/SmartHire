import React from 'react';
import Select from '@/components/ui/Select';

export const ApplicantSort = ({ value = 'latest', onSortChange, disabled = false }) => {
  const options = [
    { label: 'Newest Applications', value: 'latest' },
    { label: 'Oldest Applications', value: 'oldest' },
    { label: 'Applicant Name (A–Z)', value: 'name' },
    { label: 'Applicant Name (Z–A)', value: 'nameDesc' },
    { label: 'AI Match Score (High–Low)', value: 'matchScore' }
  ];

  return (
    <Select
      id="sort-applicants-select"
      label="Sort By"
      value={value}
      onChange={onSortChange}
      options={options}
      disabled={disabled}
      className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl"
    />
  );
};

export default ApplicantSort;
