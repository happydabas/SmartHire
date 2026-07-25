import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { applicationService } from '@/services/applications/applicationService';
import { showSuccess, showError } from '@/utils/notifications';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import RecruiterNoteCard from './RecruiterNoteCard';
import RecruiterNoteForm from './RecruiterNoteForm';

export const RecruiterNotes = ({ applicationId }) => {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationService.getNotes(applicationId);
      // Sort newest first
      const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotes(sorted);
    } catch (err) {
      console.error('Error fetching recruiter notes:', err);
      setError('Failed to retrieve recruiter notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (applicationId) {
      fetchNotes();
    }
  }, [applicationId]);

  const handleAddNoteSubmit = async (content) => {
    setIsSubmitting(true);
    try {
      // Use logged in user info, default to Lead Recruiter
      const recruiterName = user?.name || 'Lead Recruiter';
      const recruiterId = user?.id || 999;
      
      await applicationService.addNote(applicationId, content, recruiterName, recruiterId);
      showSuccess('Note added successfully.');
      await fetchNotes();
    } catch (err) {
      showError('Failed to save recruiter note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditNote = async (noteId, content) => {
    try {
      await applicationService.updateNote(applicationId, noteId, content);
      showSuccess('Note updated successfully.');
      // Refresh list to pull modified logs
      await fetchNotes();
    } catch (err) {
      showError('Failed to modify recruiter note. Please try again.');
      throw err;
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await applicationService.deleteNote(applicationId, noteId);
      showSuccess('Note deleted successfully.');
      await fetchNotes();
    } catch (err) {
      showError('Failed to delete recruiter note. Please try again.');
      throw err;
    }
  };

  // Only authenticated recruiters can write notes
  const isRecruiter = user?.role === 'recruiter' || user?.role === 'admin';

  return (
    <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
        <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Recruiter Collaboration Notes</h3>
      </div>

      {/* Note Creator Form */}
      {isRecruiter && (
        <div className="p-4.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
          <RecruiterNoteForm onSubmit={handleAddNoteSubmit} isLoading={isSubmitting} />
        </div>
      )}

      {/* Notes List view */}
      {loading ? (
        <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading recruiter notes...">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/20 space-y-3">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-200 rounded w-1/5" />
              </div>
              <div className="h-3.5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-5 border border-rose-100 bg-rose-50/10 rounded-2xl text-center space-y-3">
          <div className="mx-auto w-10 h-10 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">{error}</p>
          <button 
            onClick={fetchNotes}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
          >
            Retry Connection
          </button>
        </div>
      ) : notes.length === 0 ? (
        <div className="py-10 text-center space-y-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20">
          <MessageSquare className="w-9 h-9 mx-auto text-slate-300 animate-bounce" strokeWidth={1.5} />
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-700">No recruiter notes yet.</p>
            <p className="text-[10px] text-slate-400 font-semibold max-w-[200px] mx-auto leading-relaxed">
              Start candidate evaluations by adding a note in the panel above.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <RecruiterNoteCard
              key={note.id}
              note={note}
              currentRecruiterId={user?.id || 999}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
            />
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecruiterNotes;
