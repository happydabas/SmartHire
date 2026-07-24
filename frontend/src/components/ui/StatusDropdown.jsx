import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import Select from './Select';

const ALLOWED_TRANSITIONS = {
  APPLIED: ['SCREENING', 'WITHDRAWN'],
  SCREENING: ['INTERVIEW', 'WITHDRAWN'],
  INTERVIEW: ['SELECTED', 'REJECTED'],
  SELECTED: [],
  REJECTED: [],
  WITHDRAWN: []
};

export const StatusDropdown = ({
  currentStatus = 'APPLIED',
  stages = [],
  onChange,
  isLoading = false
}) => {
  const normStatus = (currentStatus || 'APPLIED').toUpperCase();

  // Map backend enum values to readable display text
  const getLabel = (statusVal) => {
    const s = statusVal.toUpperCase();
    if (s === 'APPLIED') return 'Applied';
    if (s === 'SCREENING') return 'Screening / Review';
    if (s === 'INTERVIEW') return 'Interview Round';
    if (s === 'SELECTED') return 'Selected / Offer';
    if (s === 'REJECTED') return 'Rejected';
    if (s === 'WITHDRAWN') return 'Withdrawn';
    return statusVal;
  };

  // Get transitionable stages
  const nextAllowed = ALLOWED_TRANSITIONS[normStatus] || [];

  // Options: always include current status, plus next allowed targets present in the job's pipeline
  const options = [
    { label: `${getLabel(normStatus)} (Current)`, value: normStatus }
  ];

  nextAllowed.forEach(stageVal => {
    options.push({
      label: `Move to ${getLabel(stageVal)}`,
      value: stageVal
    });
  });

  const handleSelectChange = (e) => {
    const selectedVal = e.target.value;
    if (selectedVal && selectedVal !== normStatus) {
      onChange?.(selectedVal);
    }
  };

  const isTerminal = options.length <= 1;

  return (
    <div className="space-y-1.5 w-full">
      <Select
        id="status-dropdown-select"
        label={
          <span className="flex items-center gap-1.5 text-slate-500 font-bold select-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Update Candidate Status</span>
          </span>
        }
        value={normStatus}
        onChange={handleSelectChange}
        disabled={isLoading || isTerminal}
        options={options}
        className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl"
      />
      {isTerminal && (
        <span className="block text-[10px] font-semibold text-slate-400 pl-0.5 leading-relaxed">
          This application is in a terminal state ({getLabel(normStatus)}) and cannot transition further.
        </span>
      )}
    </div>
  );
};

export default StatusDropdown;
