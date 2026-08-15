import React from 'react';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import { PIPELINE_STAGES_LIST, STAGE_LABELS } from '@/constants/ats';

export const ApplicantFilters = ({
  jobsList = [],
  selectedJob = '',
  selectedStage = '',
  selectedDateFilter = '',
  startDate = '',
  endDate = '',
  onFilterChange,
  disabled = false
}) => {
  const jobOptions = jobsList.map(j => ({ label: j.title, value: String(j.id) }));
  const stageOptions = PIPELINE_STAGES_LIST.map(s => ({ label: STAGE_LABELS[s] || s, value: s }));
  
  const dateOptions = [
    { label: 'All Dates', value: '' },
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7days' },
    { label: 'Last 30 Days', value: '30days' },
    { label: 'Custom Date Range', value: 'custom' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full items-end">
      {/* Job Filter */}
      <Select
        id="filter-job-select"
        label="Filter by Job"
        value={selectedJob}
        onChange={(e) => onFilterChange?.('jobId', e.target.value)}
        options={jobOptions}
        placeholder="All Jobs"
        disabled={disabled}
        className="text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-xl"
      />

      {/* Stage Filter */}
      <Select
        id="filter-stage-select"
        label="Filter by Stage"
        value={selectedStage}
        onChange={(e) => onFilterChange?.('status', e.target.value)}
        options={stageOptions}
        placeholder="All Stages"
        disabled={disabled}
        className="text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-xl"
      />

      {/* Date Filter */}
      <Select
        id="filter-date-select"
        label="Applied Date"
        value={selectedDateFilter}
        onChange={(e) => onFilterChange?.('dateFilter', e.target.value)}
        options={dateOptions}
        disabled={disabled}
        className="text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-xl"
      />

      {/* Custom Date Inputs */}
      {selectedDateFilter === 'custom' && (
        <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1 flex gap-2 w-full">
          <div className="flex-grow">
            <Input
              id="filter-start-date"
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => onFilterChange?.('startDate', e.target.value)}
              disabled={disabled}
              className="text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-xl py-1.5"
            />
          </div>
          <div className="flex-grow">
            <Input
              id="filter-end-date"
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => onFilterChange?.('endDate', e.target.value)}
              disabled={disabled}
              className="text-xs font-semibold text-slate-700 dark:text-white bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-xl py-1.5"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicantFilters;
