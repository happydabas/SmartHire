import React from 'react';

export function TopJobsTable({ jobs = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
          Most Applied Jobs
        </h3>
        <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">
          Ranked by platform application counts
        </p>
      </div>

      <div className="overflow-x-auto w-full border border-slate-100 rounded-2xl dark:border-slate-800">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500 w-16">
                Rank
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Company
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500 w-40">
                Total Applications
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-800">
            {jobs.slice(0, 10).map((job, index) => (
              <tr key={index} className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-extrabold text-slate-505 dark:text-slate-400">
                  #{job.rank || index + 1}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-extrabold text-slate-800 dark:text-white">
                  {job.title}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-semibold text-slate-650 dark:text-slate-300">
                  {job.company}
                </td>
                <td className="px-6 py-3.5 whitespace-nowrap text-sm font-bold text-slate-505 text-center dark:text-slate-400">
                  {job.totalApplications.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TopJobsTable;
