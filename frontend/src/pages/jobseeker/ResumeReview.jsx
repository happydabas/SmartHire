import React, { useState } from 'react';
import ConfidenceScoreCard from '@/components/resume/ConfidenceScoreCard';
import ResumeReviewForm from '@/components/resume/ResumeReviewForm';
import { useAuth } from '@/hooks/useAuth';
import { resumeParserService } from '@/services/resumeParserService';
import { toast } from 'sonner';

export function ResumeReview({ parsedData, onSaveSuccess, onCancel }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleSave = async (updatedData) => {
    try {
      setSaving(true);
      await resumeParserService.saveParsedResume(updatedData, user?.id);
      toast.success("Resume data saved to your profile and skills registry successfully!");
      onSaveSuccess();
    } catch (err) {
      console.error("Save parsed resume failed:", err);
      toast.error("Failed to save parsed details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
          Review Extracted Resume Data
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1 dark:text-slate-450">
          Verify and edit the AI extracted information before committing it to your profile.
        </p>
      </div>

      <ConfidenceScoreCard scores={parsedData?.confidence_scores} />

      <ResumeReviewForm
        parsedData={parsedData}
        onSave={handleSave}
        onCancel={onCancel}
        saving={saving}
      />
    </div>
  );
}

export default ResumeReview;
