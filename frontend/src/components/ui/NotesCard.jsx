import React, { useState } from 'react';
import { Send, Edit2, Trash2, X, Check, MessageSquare } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import Card from './Card';
import Button from './Button';
import Textarea from './Textarea';

export const NotesCard = ({
  notes = [],
  onAdd,
  onEdit,
  onDelete,
  currentRecruiterId,
  isLoading = false
}) => {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingContent, setEditingContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    onAdd?.(newNote.trim());
    setNewNote('');
  };

  const handleStartEdit = (note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  const handleSaveEdit = (noteId) => {
    if (!editingContent.trim()) return;
    onEdit?.(noteId, editingContent.trim());
    setEditingNoteId(null);
    setEditingContent('');
  };

  return (
    <Card className="p-5 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-5">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
        <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Recruiter Collaboration Notes</h3>
      </div>

      {/* Editor to Add Note */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Textarea
          id="new-note-input"
          placeholder="Type notes or candidate feedback here..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={isLoading}
          rows={2}
          className="text-xs py-2 px-3 rounded-xl hover:border-slate-300"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading || !newNote.trim()}
            className="rounded-xl font-bold flex items-center gap-1.5 py-2 px-4 shadow-md shadow-blue-500/10 text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Add Note</span>
          </Button>
        </div>
      </form>

      {/* Notes Display List */}
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 divide-y divide-slate-100">
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
            No notes logged on this applicant yet.
          </p>
        ) : (
          notes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const canEdit = String(note.recruiter_id) === String(currentRecruiterId);

            return (
              <div key={note.id} className="pt-4 first:pt-0 space-y-2 group">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                  <span className="text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg">
                    {canEdit ? 'You' : (note.recruiter_name || 'Recruiter')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(note.created_at || note.timestamp)}</span>
                    {canEdit && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleStartEdit(note)}
                          className="p-1 hover:bg-slate-100 hover:text-slate-700 rounded transition-colors disabled:opacity-50"
                          title="Edit Note"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => onDelete?.(note.id)}
                          className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors disabled:opacity-50"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      disabled={isLoading}
                      rows={2}
                      className="text-xs py-2 px-3 rounded-xl border-blue-500"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={handleCancelEdit}
                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded transition-all disabled:opacity-50"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSaveEdit(note.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-all disabled:opacity-50"
                        title="Save Changes"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default NotesCard;
