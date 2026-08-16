import React from 'react';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EmptyState from './EmptyState';

import { useAuth } from '@/hooks/useAuth';

export function EmptyRecruiterJobs({ variant = 'manage' }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isOwner = Boolean(user?.is_owner || user?.role === 'company_owner');

  const isDashboard = variant === 'dashboard';

  if (!isOwner) {
    return (
      <EmptyState
        title="No jobs assigned to you yet."
        description="Your company owner has not assigned any active job postings to your account yet. Once assigned, you will see your jobs and candidate applications here."
        icon={Briefcase}
        className="bg-white border border-slate-100 shadow-sm w-full py-16"
      />
    );
  }

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
