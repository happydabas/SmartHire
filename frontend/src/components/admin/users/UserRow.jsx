import React from 'react';
import UserStatusBadge from './UserStatusBadge';
import UserRoleBadge from './UserRoleBadge';
import UserActionMenu from './UserActionMenu';
import { formatDate } from '@/utils';
import Avatar from '@/components/ui/Avatar';

export function UserRow({ user, onView, onActivate, onDeactivate, onDelete }) {
  return (
    <tr className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-800/30">
      {/* Profile Avatar & Name Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="sm" />
          <div>
            <div className="text-sm font-extrabold text-slate-800 dark:text-white">
              {user.name}
            </div>
            <div className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              ID: #{user.id}
            </div>
          </div>
        </div>
      </td>

      {/* Email Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-350">
        {user.email}
      </td>

      {/* Role Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <UserRoleBadge role={user.role} />
      </td>

      {/* Status Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <UserStatusBadge status={user.status} />
      </td>

      {/* Joined Date Column */}
      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-slate-400 dark:text-slate-500">
        {formatDate(user.joined_date)}
      </td>

      {/* Actions Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <UserActionMenu
          user={user}
          onView={onView}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}

export default UserRow;
