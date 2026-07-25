import React from 'react';
import { twMerge } from 'tailwind-merge';
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_COLORS } from '@/constants/ats';

export const StageBadge = ({ stage, className, ...props }) => {
  const normalizedStage = (stage || '').toLowerCase();
  
  const stageConfig = STAGE_COLORS[normalizedStage] || STAGE_COLORS[PIPELINE_STAGES.APPLIED];
  const label = STAGE_LABELS[normalizedStage] || stage || 'Applied';

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize select-none',
        stageConfig.bg,
        className
      )}
      role="status"
      aria-label={`Current status: ${label}`}
      {...props}
    >
      <span className={twMerge('w-1.5 h-1.5 rounded-full shrink-0', stageConfig.dot)} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};

export default StageBadge;
