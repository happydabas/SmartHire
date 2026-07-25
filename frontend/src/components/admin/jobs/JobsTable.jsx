import React from 'react';
import JobRow from './JobRow';

export function JobsTable({ jobs = [], loading, onView, onApprove, onReject, onRemove }) {
  const headers = [
    'Job Title',
    'Company',
    'Recruiter',
    'Job Type',
    'Location',
    'Applications',
    'Status',
    'Posted Date',
    ''
  ];

  if (loading) {
    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-3.5 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-800">
            {[1, 2, 3, 4, 5].map((idx) => (
              <tr key={idx} className="animate-pulse">
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-28 dark:bg-slate-850" />
                    <div className="h-2 bg-slate-200 rounded w-12 dark:bg-slate-850" />
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-20 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-20 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-24 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-8 mx-auto dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-14 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-16 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded w-12 ml-auto dark:bg-slate-850" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
        <thead className="bg-slate-50/50 dark:bg-slate-900/50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className={`px-6 py-3.5 text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500 ${
                  h === 'Applications' ? 'text-center' : 'text-left'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-800">
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onView={onView}
              onApprove={onApprove}
              onReject={onReject}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default JobsTable;
