import React from 'react';
import { Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

export function EmptySavedJobs() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="No Saved Jobs"
      description="No saved jobs."
      icon={Bookmark}
      primaryButton={{
        label: "Browse Jobs",
        onClick: () => navigate('/jobs')
      }}
      className="bg-white border border-slate-100 shadow-sm w-full py-16"
    />
  );
}

export default EmptySavedJobs;
