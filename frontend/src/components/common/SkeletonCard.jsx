import React from 'react';
import Card from '@/components/ui/Card';

export const SkeletonCard = () => {
  return (
    <Card className="flex flex-col justify-between p-5 border border-slate-100 bg-white h-full animate-pulse select-none">
      <div className="space-y-4">
        {/* Title, Company and Logo */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2.5 min-w-0 flex-grow">
            {/* Title line */}
            <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
            {/* Company line */}
            <div className="h-3.5 bg-slate-200 rounded-lg w-1/2"></div>
          </div>
          {/* Logo box */}
          <div className="w-10 h-10 bg-slate-200 rounded-2xl shrink-0"></div>
        </div>

        {/* Status badges */}
        <div className="flex gap-2">
          <div className="h-5 bg-slate-200 rounded-lg w-12"></div>
          <div className="h-5 bg-slate-200 rounded-lg w-20"></div>
        </div>

        {/* Metadata lines */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
            <div className="h-3 bg-slate-200 rounded-lg w-2/3"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
            <div className="h-3 bg-slate-200 rounded-lg. w-1/2"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-200 rounded-full"></div>
            <div className="h-3 bg-slate-200 rounded-lg w-2/5"></div>
          </div>
        </div>

        {/* Skills tags */}
        <div className="space-y-1.5 pt-1">
          <div className="h-3 bg-slate-200 rounded-lg w-1/4"></div>
          <div className="flex gap-1.5 flex-wrap">
            <div className="h-5 bg-slate-200 rounded-lg w-16"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-12"></div>
            <div className="h-5 bg-slate-200 rounded-lg w-20"></div>
          </div>
        </div>
      </div>

      {/* Footer / Buttons row */}
      <div className="pt-4 border-t border-slate-50 mt-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-3.5 h-3.5 bg-slate-200 rounded-full"></div>
          <div className="h-3 bg-slate-200 rounded-lg w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="h-8 bg-slate-200 rounded-xl"></div>
          <div className="h-8 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    </Card>
  );
};

export default SkeletonCard;
