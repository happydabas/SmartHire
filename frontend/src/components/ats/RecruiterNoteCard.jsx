import React, { useState } from 'react';
import { User, Calendar, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import RecruiterNoteForm from './RecruiterNoteForm';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Button from '@/components/ui/Button';

export const RecruiterNoteCard = ({
  note,
  currentRecruiterId,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Loose check for safety (strings vs numbers)
  const isOwner = String(note.recruiter_id) === String(currentRecruiterId);

  const formatLocalDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return '';
    }
  };

  const formatLocalTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  const handleEditSubmit = async (newContent) => {
    setIsActionLoading(true);
    try {
      await onEdit?.(note.id, newContent);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleteConfirmOpen(false);
    setIsActionLoading(true);
    try {
      await onDelete?.(note.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div 
      className={twMerge(
        "p-5 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3 relative group",
        isEditing && "border-blue-200 bg-blue-50/5"
      )}
    >
      {/* Header Info */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center text-xs font-semibold text-slate-500 gap-x-2 gap-y-1">
          <span className="flex items-center gap-1 font-bold text-slate-800 bg-white border border-slate-200/50 px-2 py-0.5 rounded-lg select-none">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{note.recruiter_name || 'Anonymous Recruiter'}</span>
          </span>
          <time dateTime={note.created_at} className="text-slate-400 flex items-center gap-1 font-bold pl-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatLocalDate(note.created_at)}</span>
            <span>•</span>
            <span>{formatLocalTime(note.created_at)}</span>
          </time>
          {note.updated_at && note.updated_at !== note.created_at && (
            <span className="text-[9px] text-blue-500 bg-blue-50/50 border border-blue-100 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
              Edited
            </span>
          )}
        </div>

        {/* Edit / Delete Actions */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              title="Edit Note"
              disabled={isActionLoading}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDeleteConfirmOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-all"
              title="Delete Note"
              disabled={isActionLoading}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Note Content / Form */}
      {isEditing ? (
        <div className="pt-1">
          <RecruiterNoteForm
            initialValue={note.content}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
            submitLabel="Save Changes"
            isLoading={isActionLoading}
          />
        </div>
      ) : (
        <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap pl-0.5 select-all">
          {note.content}
        </p>
      )}

      {/* Reusable Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Recruiter Note"
        message="Are you sure you want to delete this note?"
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isActionLoading}
      />
    </div>
  );
};

export default RecruiterNoteCard;
