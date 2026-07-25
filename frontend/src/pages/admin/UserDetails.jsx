import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUserService } from '@/services/adminUserService';
import { ArrowLeft, User, Phone, Mail, MapPin, Calendar, Briefcase, FileText, AlertTriangle } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import UserStatusBadge from '@/components/admin/users/UserStatusBadge';
import UserRoleBadge from '@/components/admin/users/UserRoleBadge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils';
import SkeletonProfile from '@/components/common/SkeletonProfile';

export function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await adminUserService.getUserDetails(id);
        setUser(res);
      } catch (err) {
        console.error('Failed to load user details:', err);
        setError('Failed to retrieve user details. The account might not exist.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 space-y-6">
        <button onClick={() => navigate('/admin/users')} className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-slate-700">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>
        <SkeletonProfile />
      </div>
    );
  }

  if (error || !user) {
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
        <Button variant="primary" onClick={() => navigate('/admin/users')} className="rounded-xl font-black px-6 py-2.5 shadow-md">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Back link */}
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center gap-2 text-xs font-black text-slate-500 hover:text-slate-700 outline-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-md py-1 pr-3 transition-colors dark:text-slate-450 dark:hover:text-slate-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users Directory
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar name={user.name} size="lg" className="w-18 h-18 text-xl font-black" />
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              {user.name}
            </h1>
            <UserRoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
          <p className="text-sm text-slate-500 font-bold dark:text-slate-400">
            Registered on {formatDate(user.registration_date)}
          </p>
        </div>
      </div>

      {/* Structured Details Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact & Personal Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-3 dark:text-white dark:border-slate-850">
            Contact & Location Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-center gap-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
              <Mail className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
              <Phone className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span>{user.contact_phone || 'Not Provided'}</span>
            </div>
            <div className="flex items-center gap-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
              <MapPin className="w-4.5 h-4.5 text-slate-400 shrink-0" />
              <span>{user.contact_location || 'Not Provided'}</span>
            </div>
          </div>
        </div>

        {/* Role Specific details card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-5">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-3 dark:text-white dark:border-slate-850">
            Professional Information
          </h3>

          {user.role === 'recruiter' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                <Briefcase className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider dark:text-slate-500">Corporate Affiliation</p>
                  <p className="mt-0.5">{user.company_name || 'No Associated Company'}</p>
                </div>
              </div>
            </div>
          ) : user.role === 'job_seeker' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                <FileText className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider dark:text-slate-500">Attached Resume</p>
                  {user.resume_url ? (
                    <a
                      href={user.resume_url}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-extrabold mt-0.5 block dark:text-blue-400"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.resume_name || 'Download Resume'}
                    </a>
                  ) : (
                    <p className="text-slate-400 font-semibold mt-0.5 dark:text-slate-500">No Resume Uploaded</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 text-sm font-bold text-slate-600 dark:text-slate-300">
                <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-black tracking-wider dark:text-slate-500">System Role</p>
                  <p className="mt-0.5">Administrator Access Credentials</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default UserDetails;
