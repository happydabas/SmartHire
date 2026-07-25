import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';

export const RecruiterNoteForm = ({
  initialValue = '',
  onSubmit,
  onCancel,
  submitLabel = 'Add Note',
  isLoading = false
}) => {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (trimmed && trimmed.length <= 2000) {
      onSubmit?.(trimmed);
      setContent('');
    }
  };

  const isInvalid = !content.trim() || content.trim().length > 2000;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Textarea
          id="recruiter-note-textarea"
          label="Note Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share interview highlights, candidate evaluations, or qualifications log..."
          disabled={isLoading}
          maxLength={2000}
          className="min-h-[100px] text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl"
          required
        />
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-0.5">
          <span>Plain text note. Max 2000 characters.</span>
          <span className={content.length > 2000 ? "text-rose-500 font-extrabold" : ""}>
            {content.length}/2000
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          variant="primary"
          size="sm"
          disabled={isInvalid || isLoading}
          className="rounded-xl font-bold py-1.5 px-4"
        >
          {submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl font-bold py-1.5 px-4 border border-slate-200"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default RecruiterNoteForm;
