import React from 'react';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

export function EmptyApplications() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="No Applications"
      description="You haven't applied to any jobs yet."
      icon={Briefcase}
      primaryButton={{
        label: "Browse Jobs",
        onClick: () => navigate('/jobs')
      }}
      className="bg-white border border-slate-100 shadow-sm w-full py-16"
    />
  );
}

export default EmptyApplications;
