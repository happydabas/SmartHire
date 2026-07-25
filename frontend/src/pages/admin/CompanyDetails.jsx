import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminCompanyService } from '@/services/adminCompanyService';
import { ArrowLeft, User, Globe, MapPin, Users, Briefcase, AlertTriangle } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import CompanyStatusBadge from '@/components/admin/companies/CompanyStatusBadge';
import CompanyVerificationBadge from '@/components/admin/companies/CompanyVerificationBadge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils';
import SkeletonProfile from '@/components/common/SkeletonProfile';

export function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminCompanyService.getCompanyDetails(id);
        setCompany(res);
      } catch (err) {
        console.error('Failed to load company details:', err);
        setError('Failed to retrieve company profile details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        <button onClick={() => navigate('/admin/companies')} className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !company) {
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
        <Button variant="primary" onClick={() => navigate('/admin/companies')} className="rounded-xl font-black px-6 py-2.5 shadow-md">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin/companies')}
        className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-700 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md py-1 pr-3 transition-colors dark:text-slate-450 dark:hover:text-slate-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Companies Directory
      </button>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar name={company.name} size="lg" className="w-18 h-18 text-xl font-black" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {company.name}
            </h1>
            <CompanyVerificationBadge status={company.verification_status} />
            <CompanyStatusBadge status={company.status} />
          </div>
          <p className="text-sm text-slate-500 font-bold dark:text-slate-400">
            Registered on {formatDate(company.created_at)}
          </p>
        </div>
      </div>

      {/* Structured details columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Description summary card */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 dark:text-white dark:border-slate-800">
              About the Company
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed dark:text-slate-305">
              {company.description || 'No corporate biography details available.'}
            </p>
          </div>

          {/* Recruiters list */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
                Associated Recruiters ({company.recruiters_list?.length || 0})
              </h3>
              <Users className="w-4.5 h-4.5 text-slate-400" />
            </div>

            {(!company.recruiters_list || company.recruiters_list.length === 0) ? (
              <p className="text-sm text-slate-400 font-semibold dark:text-slate-500">No recruiters affiliated with this profile.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-2">
                {company.recruiters_list.map((rec) => (
                  <div key={rec.id} className="flex justify-between items-center py-3 text-sm">
                    <div>
                      <p className="font-extrabold text-slate-800 dark:text-white">{rec.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{rec.email}</p>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-605 font-black px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-400">
                      ID: #{rec.id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Corporate stats column */}
        <div className="space-y-6">
          
          {/* Metadata properties */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 dark:text-white dark:border-slate-800">
              Company Metadata
            </h3>

            <div className="space-y-4 text-sm font-bold text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Globe className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                {company.website ? (
                  <a
                    href={company.website}
                    className="text-blue-600 hover:text-blue-700 hover:underline truncate dark:text-blue-400"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {company.website.replace('https://', '')}
                  </a>
                ) : (
                  <span>No Website Listed</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>{company.location || 'Location Not Specified'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <span>Industry: {company.industry}</span>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider dark:text-slate-500">Profile Owner</p>
                  <p className="mt-0.5">{company.owner_name} (ID: #{company.owner_id})</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job summary statistics */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 dark:text-white dark:border-slate-800">
              Job Metrics
            </h3>
            
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-550 dark:text-slate-400">Total Postings:</span>
              <span className="text-slate-900 dark:text-white font-extrabold text-lg">{company.total_jobs}</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default CompanyDetails;
