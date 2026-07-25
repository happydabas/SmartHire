import React from 'react';
import JobStatusBadge from './JobStatusBadge';
import JobActionMenu from './JobActionMenu';
import { formatDate } from '@/utils';

export function JobRow({ job, onView, onApprove, onReject, onRemove }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
      {/* Job Title */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-extrabold text-slate-800 dark:text-white truncate max-w-[200px]" title={job.title}>
          {job.title}
        </div>
        <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
          ID: #{job.id}
        </div>
      </td>

      {/* Company Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-350">
        {job.company_name}
      </td>

      {/* Recruiter Name */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-350">
        {job.recruiter_name}
      </td>

      {/* Job Type (Full-Time, Contract, etc.) */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500 dark:text-slate-450">
        {job.job_type}
      </td>

      {/* Location */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-500 dark:text-slate-450">
        {job.location}
      </td>

      {/* Applications Count */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500 text-center dark:text-slate-450">
        {job.applications_count}
      </td>

      {/* Job Status Badge */}
      <td className="px-6 py-4 whitespace-nowrap">
        <JobStatusBadge status={job.status} />
      </td>

      {/* Posted Date */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400 dark:text-slate-500">
        {formatDate(job.posted_date)}
      </td>

      {/* Actions Cell */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <JobActionMenu
          job={job}
          onView={onView}
          onApprove={onApprove}
          onReject={onReject}
          onRemove={onRemove}
        />
      </td>
    </tr>
  );
}

export default JobRow;
