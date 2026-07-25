import React from 'react';
import CompanyStatusBadge from './CompanyStatusBadge';
import CompanyVerificationBadge from './CompanyVerificationBadge';
import CompanyActionMenu from './CompanyActionMenu';
import { formatDate } from '@/utils';
import Avatar from '@/components/ui/Avatar';

export function CompanyRow({ company, onView, onVerify, onSuspend, onReactivate, onDelete }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
      {/* Company Name & Logo */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar name={company.name} size="sm" />
          <div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-white">
              {company.name}
            </div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              ID: #{company.id}
            </div>
          </div>
        </div>
      </td>

      {/* Industry */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-350">
        {company.industry}
      </td>

      {/* Owner */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-350">
        {company.owner_name}
      </td>

      {/* Recruiters Count */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500 text-center dark:text-slate-450">
        {company.recruiters_count}
      </td>

      {/* Total Jobs */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-500 text-center dark:text-slate-450">
        {company.total_jobs}
      </td>

      {/* Verification Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <CompanyVerificationBadge status={company.verification_status} />
      </td>

      {/* Account Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <CompanyStatusBadge status={company.status} />
      </td>

      {/* Created Date */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400 dark:text-slate-500">
        {formatDate(company.created_at)}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <CompanyActionMenu
          company={company}
          onView={onView}
          onVerify={onVerify}
          onSuspend={onSuspend}
          onReactivate={onReactivate}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

export default CompanyRow;
