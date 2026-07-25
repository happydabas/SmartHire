import React from 'react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export function RecommendationFilters({ filters = {}, onFilterChange }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4 animate-fadeIn">
      <div>
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
          Filter Recommendations
        </h4>
        <p className="text-[10px] text-slate-505 font-semibold dark:text-slate-455 mt-0.5">
          Narrow down options matching preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Input
          id="rec-filter-location"
          label="Location"
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          placeholder="e.g. Delhi, Remote"
          className="text-xs font-semibold rounded-xl"
        />

        <Select
          id="rec-filter-type"
          label="Employment Type"
          value={filters.job_type || ''}
          onChange={(val) => onFilterChange('job_type', val)}
          options={[
            { label: 'All Types', value: '' },
            { label: 'Full-time', value: 'Full-time' },
            { label: 'Part-time', value: 'Part-time' },
            { label: 'Contract', value: 'Contract' },
            { label: 'Internship', value: 'Internship' }
          ]}
          className="text-xs font-semibold rounded-xl"
        />

        <Select
          id="rec-filter-score"
          label="Minimum Match Score"
          value={filters.min_score || ''}
          onChange={(val) => onFilterChange('min_score', val)}
          options={[
            { label: 'Show All', value: '' },
            { label: '90%+ (Excellent)', value: '90' },
            { label: '75%+ (Good)', value: '75' },
            { label: '60%+ (Average)', value: '60' }
          ]}
          className="text-xs font-semibold rounded-xl"
        />

        <Input
          id="rec-filter-salary"
          label="Preferred Salary Range"
          value={filters.salary || ''}
          onChange={(e) => onFilterChange('salary', e.target.value)}
          placeholder="e.g. 80000"
          type="number"
          className="text-xs font-semibold rounded-xl"
        />
      </div>
    </div>
  );
}

export default RecommendationFilters;
