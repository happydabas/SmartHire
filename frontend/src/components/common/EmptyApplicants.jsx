import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

export function EmptyApplicants() {
  const navigate = useNavigate();

  return (
    <EmptyState
      title="No applicants yet."
      description="No one has applied to your job postings yet. Keep checking back or modify listings."
      icon={Users}
      primaryButton={{
        label: "Manage Jobs",
        onClick: () => navigate('/recruiter/jobs')
      }}
      className="bg-white border border-slate-100 shadow-sm w-full py-16"
    />
  );
}

export default EmptyApplicants;
