import React, { useState, useEffect } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { PIPELINE_STAGES_LIST, STAGE_LABELS } from '@/constants/ats';
import { applicationService } from '@/services/applications/applicationService';
import { showSuccess, showError } from '@/utils/notifications';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';

export const StageSelector = ({ applicationId, currentStage, onUpdateSuccess }) => {
  const { user } = useAuth();
  const normalizedCurrent = (currentStage || 'applied').toLowerCase();
  
  const [selectedStage, setSelectedStage] = useState(normalizedCurrent);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stageToTransition, setStageToTransition] = useState('');

  // Sync selected stage with prop changes
  useEffect(() => {
    setSelectedStage(normalizedCurrent);
  }, [currentStage]);

  const handleSelectChange = (e) => {
    const newStage = e.target.value;
    if (newStage && newStage.toLowerCase() !== normalizedCurrent) {
      setStageToTransition(newStage);
      setConfirmOpen(true);
    }
  };

  const handleConfirmUpdate = async () => {
    setConfirmOpen(false);
    setIsLoading(true);
    try {
      await applicationService.updateApplicationStatus(applicationId, stageToTransition, user?.name);
      showSuccess('Application status updated successfully.');
      setSelectedStage(stageToTransition);
      onUpdateSuccess?.(stageToTransition);
    } catch (err) {
      showError('Failed to update stage. Please try again.');
      // Revert selection back to current status
      setSelectedStage(normalizedCurrent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    // Reset dropdown value back to current status
    setSelectedStage(normalizedCurrent);
  };

  const options = PIPELINE_STAGES_LIST.map((stage) => ({
    label: STAGE_LABELS[stage] || stage,
    value: stage
  }));

  return (
    <div className="space-y-1.5 w-full">
      <div className="relative">
        <Select
          id="stage-selector-select"
          label={
            <span className="flex items-center gap-1.5 text-slate-500 font-bold select-none text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Update Candidate Stage</span>
            </span>
          }
          value={selectedStage}
          onChange={handleSelectChange}
          disabled={isLoading}
          options={options}
          className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl"
        />
        {isLoading && (
          <div className="absolute right-10 bottom-3">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={handleCancel}
        title="Update Application Status"
        message={`Are you sure you want to move this applicant to "${STAGE_LABELS[stageToTransition] || stageToTransition}"?`}
        onConfirm={handleConfirmUpdate}
        confirmText="Update"
        cancelText="Cancel"
        isLoading={isLoading}
      />
    </div>
  );
};

export default StageSelector;
