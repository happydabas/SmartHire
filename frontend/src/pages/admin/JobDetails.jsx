import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminJobService } from '@/services/adminJobService';
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Award, Tag, AlignLeft, AlertTriangle } from 'lucide-react';
import JobStatusBadge from '@/components/admin/jobs/JobStatusBadge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils';
import SkeletonProfile from '@/components/common/SkeletonProfile';
import PageHeader from '@/components/ui/PageHeader';

export function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminJobService.getJobDetails(id);
        setJob(res);
      } catch (err) {
        console.error('Failed to load job details:', err);
        setError('Failed to retrieve job details. The listing might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const formatSalary = (min, max) => {
    if (!min && !max) return 'Competitive Salary';
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)} / year`;
    }
    return min ? `${formatter.format(min)} / year` : `${formatter.format(max)} / year`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        <button onClick={() => navigate('/admin/jobs')} className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto bg-white border border-rose-100 rounded-3xl mt-12 dark:bg-slate-900 dark:border-rose-950/20">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
          Details Unavailable
        </h3>
        <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
          {error}
        </p>
        <Button variant="primary" onClick={() => navigate('/admin/jobs')} className="rounded-xl font-black px-6 py-2.5 shadow-md">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <PageHeader
        title="Job Moderation Review"
        subtitle={`Inspect posting details, requirements, and status for ${job.title}`}
        backUrl="/admin/jobs"
      />

      {/* Main Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl dark:bg-blue-950/30 dark:text-blue-400">
          <Briefcase className="w-8 h-8" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {job.title}
            </h1>
            <JobStatusBadge status={job.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 font-bold dark:text-slate-400">
            <span>{job.company_name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>Posted by {job.recruiter_name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{formatDate(job.posted_date)}</span>
          </div>
        </div>
      </div>

      {/* Structured details columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Description & Skills */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Job Description card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <AlignLeft className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
                Job Description
              </h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-305">
              {job.description || 'No job description provided.'}
            </p>
          </div>

          {/* Required Skills card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Tag className="w-4.5 h-4.5 text-slate-400" />
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
                Required Skills & Tech Stack
              </h3>
            </div>
            {(!job.required_skills || job.required_skills.length === 0) ? (
              <p className="text-sm text-slate-400 font-semibold dark:text-slate-500">No skills specified.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-black bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Job Metadata sidebar */}
        <div className="space-y-6">
          
          {/* Metadata Properties */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 dark:text-white dark:border-slate-800">
              Listing Details
            </h3>

            <div className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">Employment Type</p>
                  <p className="mt-0.5">{job.job_type || 'Full-Time'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">Workplace Mode</p>
                  <p className="mt-0.5">{job.work_mode || 'Hybrid'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">Location</p>
                  <p className="mt-0.5">{job.location || 'Location Not Specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Award className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">Experience Requirement</p>
                  <p className="mt-0.5">{job.experience_level || 'Not Specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">Offered Compensation</p>
                  <p className="mt-0.5 text-slate-805 font-extrabold dark:text-white">
                    {formatSalary(job.salary_min, job.salary_max)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job summary statistics */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 dark:text-white dark:border-slate-800">
              Applications
            </h3>
            
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-550 dark:text-slate-400">Total Applicants:</span>
              <span className="text-slate-900 dark:text-white font-extrabold text-lg">{job.total_applications || 0}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default JobDetails;
