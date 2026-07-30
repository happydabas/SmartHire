import React from 'react';
import { Search } from 'lucide-react';
import EmptyState from './EmptyState';

export function EmptyJobs({ onClearFilters, onBrowseAll }) {
  return (
    <EmptyState
      title="No jobs found."
      description="No job postings match your current filter parameters or search queries. Try resetting filters."
      icon={Search}
      primaryButton={{
        label: "Clear Filters",
        onClick: onClearFilters
      }}
      secondaryButton={{
        label: "Browse All Jobs",
        onClick: onBrowseAll
      }}
      className="bg-white dark:bg-[#15161e] border border-slate-150/60 dark:border-slate-805 shadow-sm w-full py-16 rounded-2xl"
    />
  );
}

export default EmptyJobs;
