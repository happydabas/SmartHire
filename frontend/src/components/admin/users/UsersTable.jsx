import React from 'react';
import UserRow from './UserRow';

export function UsersTable({ users = [], loading, onView, onActivate, onDeactivate, onDelete }) {
  if (loading) {
    return (
      <div className="overflow-x-auto w-full">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
          <thead className="bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              {['User Detail', 'Email', 'Role', 'Status', 'Joined Date', ''].map((h, i) => (
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
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-850" />
                    <div className="space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-20 dark:bg-slate-850" />
                      <div className="h-2 bg-slate-200 rounded w-12 dark:bg-slate-850" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-3 bg-slate-200 rounded w-32 dark:bg-slate-850" /></td>
                <td className="px-6 py-4"><div className="h-5 bg-slate-200 rounded-full w-16 dark:bg-slate-850" /></td>
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
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
              User Detail
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
              Email
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
              Role
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
              Status
            </th>
            <th scope="col" className="px-6 py-3.5 text-left text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
              Joined Date
            </th>
            <th scope="col" className="relative px-6 py-3.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100 dark:bg-slate-900 dark:divide-slate-800">
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onView={onView}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;
