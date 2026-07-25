export const PIPELINE_STAGES = {
  APPLIED: 'applied',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  SELECTED: 'selected',
  REJECTED: 'rejected'
};

export const PIPELINE_STAGES_LIST = [
  PIPELINE_STAGES.APPLIED,
  PIPELINE_STAGES.SCREENING,
  PIPELINE_STAGES.INTERVIEW,
  PIPELINE_STAGES.SELECTED,
  PIPELINE_STAGES.REJECTED
];

export const STAGE_LABELS = {
  [PIPELINE_STAGES.APPLIED]: 'Applied',
  [PIPELINE_STAGES.SCREENING]: 'Screening',
  [PIPELINE_STAGES.INTERVIEW]: 'Interview',
  [PIPELINE_STAGES.SELECTED]: 'Selected',
  [PIPELINE_STAGES.REJECTED]: 'Rejected'
};

export const STAGE_COLORS = {
  [PIPELINE_STAGES.APPLIED]: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500'
  },
  [PIPELINE_STAGES.SCREENING]: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500'
  },
  [PIPELINE_STAGES.INTERVIEW]: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500'
  },
  [PIPELINE_STAGES.SELECTED]: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500'
  },
  [PIPELINE_STAGES.REJECTED]: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500'
  }
};
