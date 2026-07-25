import React from 'react';
import { Inbox } from 'lucide-react';

export function NotificationEmptyState({ isFiltered }) {
  const message = isFiltered
    ? 'No notifications match the selected filter.'
    : 'No notifications yet.';

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
      <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 dark:bg-slate-800">
        <Inbox className="w-8 h-8" />
      </div>
      <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
        No Notifications
      </h3>
      <p className="text-sm text-slate-500 font-semibold mt-1 max-w-sm dark:text-slate-400">
        {message}
      </p>
    </div>
  );
}

export default NotificationEmptyState;
