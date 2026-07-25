import React from 'react';
import Card from '@/components/ui/Card';

export const SkeletonProfile = () => {
  return (
    <div className="space-y-8 animate-pulse select-none max-w-4xl mx-auto w-full">
      {/* Profile Header skeleton */}
      <div className="flex flex-col space-y-4">
        <div className="h-8 bg-slate-200 rounded-xl w-48"></div>
        <div className="h-4 bg-slate-200 rounded-xl w-96"></div>
      </div>

      {/* Main Info Card */}
      <Card className="p-6 border border-slate-100 bg-white space-y-8">
        {/* Photo and basic details header */}
        <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-50 pb-6">
          {/* Avatar frame */}
          <div className="w-24 h-24 bg-slate-200 rounded-3xl shrink-0"></div>
          {/* Details lines */}
          <div className="space-y-3 flex-grow w-full">
            <div className="h-6 bg-slate-200 rounded-xl w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded-xl w-1/2"></div>
            <div className="h-4 bg-slate-200 rounded-xl w-1/4"></div>
          </div>
        </div>

        {/* Inputs Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 bg-slate-200 rounded-lg w-20"></div>
              <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
            </div>
          ))}
        </div>

        {/* Textarea description blocks */}
        <div className="space-y-2.5 pt-4">
          <div className="h-3 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-24 bg-slate-200 rounded-xl w-full"></div>
        </div>

        {/* Save button skeleton */}
        <div className="flex justify-end pt-4 border-t border-slate-50">
          <div className="w-32 h-11 bg-slate-200 rounded-xl"></div>
        </div>
      </Card>
    </div>
  );
};

export default SkeletonProfile;
