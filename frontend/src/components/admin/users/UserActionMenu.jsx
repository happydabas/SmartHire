import React, { useState } from 'react';
import { Eye, ShieldCheck, ShieldAlert, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

export function UserActionMenu({ user, onView, onActivate, onDeactivate, onDelete }) {
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeactivate = () => {
    setDeactivateConfirmOpen(false);
    onDeactivate(user.id);
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete(user.id);
  };

  return (
    <div className="relative flex items-center gap-1.5 justify-end">
      {/* View Details button */}
      <button
        onClick={() => onView(user.id)}
        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-blue-500 dark:hover:bg-slate-800"
        title="View details"
        aria-label="View user details"
      >
        <Eye className="w-4 h-4" />
      </button>

      {/* Toggle Status Action */}
      {user.status === 'inactive' ? (
        <button
          onClick={() => onActivate(user.id)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 dark:hover:bg-slate-800"
          title="Activate user"
          aria-label="Activate user"
        >
          <ShieldCheck className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setDeactivateConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-amber-500 dark:hover:bg-slate-800"
          title="Deactivate user"
          aria-label="Deactivate user"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      )}

      {/* Delete Action (Except self/admin fallback) */}
      {user.role !== 'admin' && (
        <button
          onClick={() => setDeleteConfirmOpen(true)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors outline-none focus-visible:ring-1 focus-visible:ring-rose-500 dark:hover:bg-slate-800"
          title="Delete user"
          aria-label="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Deactivate confirmation dialog */}
      <ConfirmationDialog
        isOpen={deactivateConfirmOpen}
        onClose={() => setDeactivateConfirmOpen(false)}
        title="Deactivate User?"
        message={`Are you sure you want to deactivate the account for ${user.name}? This will suspend their access to the portal.`}
        onConfirm={handleDeactivate}
        confirmText="Deactivate"
        cancelText="Cancel"
      />

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete User?"
        message={`Are you sure you want to permanently delete the user account for ${user.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

export default UserActionMenu;
