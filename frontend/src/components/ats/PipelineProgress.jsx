import React from 'react';
import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { PIPELINE_STAGES_LIST, STAGE_LABELS } from '@/constants/ats';

export const PipelineProgress = ({ currentStage }) => {
  const normalizedCurrent = (currentStage || '').toLowerCase();
  const currentIndex = PIPELINE_STAGES_LIST.indexOf(normalizedCurrent);
  const isRejectedState = normalizedCurrent === 'rejected';

  return (
    <div className="w-full py-4 overflow-x-auto select-none">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between min-w-max md:min-w-0 gap-4 md:gap-2">
        {PIPELINE_STAGES_LIST.map((stage, idx) => {
          const label = STAGE_LABELS[stage];
          
          let state = 'upcoming'; // 'completed' | 'current' | 'upcoming'
          if (idx === currentIndex) {
            state = 'current';
          } else if (idx < currentIndex) {
            state = 'completed';
          }

          let stepBg = 'bg-slate-100 border-slate-200 text-slate-400';
          
          if (state === 'completed') {
            stepBg = 'bg-blue-600 border-blue-600 text-white';
          } else if (state === 'current') {
            if (isRejectedState) {
              stepBg = 'bg-rose-600 border-rose-600 text-white ring-4 ring-rose-100';
            } else {
              stepBg = 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100';
            }
          }

          return (
            <React.Fragment key={stage}>
              {/* Connector line on desktop */}
              {idx > 0 && (
                <div 
                  className={twMerge(
                    "hidden md:block h-0.5 flex-grow mx-2 transition-all duration-300", 
                    idx <= currentIndex ? (isRejectedState && idx === currentIndex ? "bg-rose-600" : "bg-blue-600") : "bg-slate-200"
                  )} 
                />
              )}
              
              {/* Step bubble */}
              <div 
                className="flex items-center gap-3 md:flex-col md:text-center md:gap-1.5"
                role="text"
                aria-label={`Hiring stage: ${label}. State: ${state}.`}
              >
                <div 
                  className={twMerge(
                    "w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs transition-all duration-300", 
                    stepBg
                  )}
                >
                  {state === 'completed' ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                
                <div className="flex flex-col items-start md:items-center">
                  <span 
                    className={twMerge(
                      "text-xs font-extrabold tracking-tight", 
                      state === 'current' 
                        ? (isRejectedState ? "text-rose-600" : "text-blue-600") 
                        : (state === 'completed' ? "text-slate-800" : "text-slate-400")
                    )}
                  >
                    {label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold md:hidden">
                    {state === 'current' ? 'Current Stage' : (state === 'completed' ? 'Stage Passed' : 'Upcoming Stage')}
                  </span>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineProgress;
