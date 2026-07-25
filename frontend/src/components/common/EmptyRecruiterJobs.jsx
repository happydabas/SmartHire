import React from 'react';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

export function EmptyRecruiterJobs({ variant = 'manage' }) {
  const navigate = useNavigate();

  const isDashboard = variant === 'dashboard';

  return (
    <EmptyState
      title={isDashboard ? "You haven't created any jobs yet." : "No jobs available."}
      description={
        isDashboard 
          ? "Post your first hiring listing to start receiving qualified applicant responses." 
          : "Add and publish a new job posting to expand your list."
      }
      icon={Briefcase}
      primaryButton={{
        label: isDashboard ? "Create Your First Job" : "Create Job",
        onClick: () => navigate('/recruiter/jobs/create')
      }}
      className="bg-white border border-slate-100 shadow-sm w-full py-16"
    />
  );
}

export default EmptyRecruiterJobs;
