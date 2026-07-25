import React from 'react';
import Select from '@/components/ui/Select';

export function AnalyticsFilters({ value, onChange }) {
  const options = [
    { value: 'last_7_days', label: 'Last 7 Days' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'last_90_days', label: 'Last 90 Days' },
    { value: 'this_year', label: 'This Year' }
  ];

  return (
    <div className="w-full sm:w-48">
      <Select
        id="analytics-date-range"
        value={value}
        options={options}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select analytics timeframe"
      />
    </div>
  );
}

export default AnalyticsFilters;
