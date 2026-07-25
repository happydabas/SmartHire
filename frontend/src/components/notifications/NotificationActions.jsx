import React, { useState } from 'react';
import { CheckCheck, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Button from '@/components/ui/Button';

export function NotificationActions({ onMarkAllAsRead, onDeleteAllRead, hasUnread, hasRead }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    setConfirmOpen(false);
    onDeleteAllRead();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onMarkAllAsRead}
        disabled={!hasUnread}
        className="text-xs font-black rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-blue-600 dark:text-blue-400" />
        Mark All as Read
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDeleteClick}
        disabled={!hasRead}
        className="text-xs font-black rounded-xl border-slate-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 disabled:hover:bg-transparent disabled:hover:text-rose-600 transition-all dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/20"
      >
        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
        Delete All Read
      </Button>

      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete All Read Notifications"
        message="Are you sure you want to permanently delete all read notifications? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete All"
        cancelText="Cancel"
      />
    </div>
  );
}

export default NotificationActions;
