import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  FileText,
  User,
  MapPin,
  Calendar,
  ArrowRight,
  AlertCircle,
  Clock,
  Search,
  SlidersHorizontal,
  FolderOpen,
  LayoutGrid
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { jobService } from '@/services/jobs/jobService';
import { resumeService } from '@/services/resume/resumeService';
import { applicationService } from '@/services/applications/applicationService';
import { profileService } from '@/services/profile/profileService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';

const MOCK_RECOMMENDED_JOBS = [
  {
    id: 'mock-1',
    title: 'Frontend Developer',
    company: { name: 'Google' },
    location: 'Bangalore, India',
    job_type: 'Full-time',
    salary: '₹ 8 - 12 LPA',
    is_new: true,
    match_score: 95
  },
  {
    id: 'mock-2',
    title: 'Product Designer',
    company: { name: 'Notion Labs' },
    location: 'Remote',
    job_type: 'Full-time',
    salary: '₹ 10 - 16 LPA',
    is_new: true,
    match_score: 90
  }
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobsCount: 0,
    resumeCompletion: 0,
    profileCompletion: 0,
  });

  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [savedStatus, setSavedStatus] = useState({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      let recentApps = [];
      let totalApps = 0;
      try {
        const appsResponse = await applicationService.getApplicationHistory({ page: 1, limit: 5 });
        recentApps = appsResponse?.items || [];
        totalApps = appsResponse?.total || recentApps.length;
      } catch (err) {
        console.warn('Failed to fetch applications history:', err);
      }

      let savedList = [];
      try {
        savedList = await jobService.getSavedJobs();
      } catch (err) {
        console.warn('Failed to fetch saved jobs:', err);
      }

      let profileComp = 0;
      try {
        const profile = await profileService.getProfile();
        if (profile) {
          const fieldsToCheck = ['phone', 'dob', 'gender', 'address', 'city', 'country', 'headline', 'bio'];
          const populatedCount = fieldsToCheck.filter(field => !!profile[field]).length;
          profileComp = Math.round((populatedCount / fieldsToCheck.length) * 100);
        }
      } catch (err) {
        console.warn('Failed to fetch profile:', err);
      }

      let resumeComp = 0;
      try {
        const resumeMeta = await resumeService.getResumeMetadata();
        if (resumeMeta?.file_name) resumeComp = 100;
      } catch (err) {
        console.warn('Failed to fetch resume metadata:', err);
      }

      let recommended = [];
      try {
        const jobsResponse = await jobService.getOpenJobs({ page: 1, limit: 10 });
        recommended = jobsResponse?.items || [];
      } catch (err) {
        console.warn('Failed to fetch open jobs:', err);
      }

      // Map saved state keys
      const savedMap = {};
      (savedList || []).forEach(j => {
        savedMap[j.id] = true;
      });
      setSavedStatus(savedMap);

      setStats({
        totalApplications: totalApps,
        savedJobsCount: savedList?.length || 0,
        resumeCompletion: resumeComp,
        profileCompletion: profileComp
      });
      setRecentApplications(recentApps);
      setRecommendedJobs(recommended);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleSaveJob = async (jobId) => {
    try {
      if (savedStatus[jobId]) {
        await jobService.unsaveJob(jobId);
        setSavedStatus(prev => ({ ...prev, [jobId]: false }));
        setStats(prev => ({ ...prev, savedJobsCount: Math.max(0, prev.savedJobsCount - 1) }));
      } else {
        await jobService.saveJob(jobId);
        setSavedStatus(prev => ({ ...prev, [jobId]: true }));
        setStats(prev => ({ ...prev, savedJobsCount: prev.savedJobsCount + 1 }));
      }
    } catch {
      // fallback toggle if API fails locally
      setSavedStatus(prev => ({ ...prev, [jobId]: !prev[jobId] }));
    }
  };

  const handleJobNavigation = (jobId) => {
    if (typeof jobId === 'string' && jobId.startsWith('mock-')) {
      navigate('/jobs');
    } else {
      navigate(`/jobs/${jobId}`);
    }
  };

  const getStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('hire') || s.includes('success')) return 'success';
    if (s.includes('reject') || s.includes('decline') || s.includes('fail')) return 'danger';
    if (s.includes('interview') || s.includes('review') || s.includes('schedule')) return 'warning';
    return 'primary';
  };

  const renderCompanyLogo = (companyName) => {
    const name = companyName?.toLowerCase() || '';
    if (name.includes('google')) {
      return (
        <div className="w-10 h-10 bg-slate-50 text-rose-500 rounded-xl flex items-center justify-center font-black text-lg border border-slate-100 dark:bg-slate-900/60 dark:border-slate-800 shrink-0">
          <span className="bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500 bg-clip-text text-transparent">G</span>
        </div>
      );
    }
    if (name.includes('notion')) {
      return (
        <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-lg border border-slate-800 dark:bg-white dark:text-slate-900 shrink-0">
          N
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-lg border border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 shrink-0">
        {companyName ? companyName[0].toUpperCase() : 'C'}
      </div>
    );
  };

  const getProcessedJobs = () => {
    // Merge real database open jobs with mock screenshot jobs
    const combined = [...recommendedJobs, ...MOCK_RECOMMENDED_JOBS];
    // Remove duplicates by company name / title
    const seen = new Set();
    const unique = [];
    combined.forEach(j => {
      const key = `${j.title}-${j.company?.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(j);
      }
    });

    if (!searchQuery.trim()) return unique;
    const q = searchQuery.toLowerCase();
    return unique.filter(j =>
      j.title?.toLowerCase().includes(q) ||
      (j.company?.name || '').toLowerCase().includes(q) ||
      (j.location || '').toLowerCase().includes(q)
    );
  };

  const processedJobs = getProcessedJobs();

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-6 bg-slate-200 rounded-lg w-1/4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="h-32 bg-white border border-slate-100" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-white border border-slate-100 rounded-3xl" />
          <div className="h-[400px] bg-white border border-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fadeIn pb-12">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-200/80 dark:border-slate-800/40 pb-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Good morning, {user?.name?.split(' ')[0] || 'Candidate'}!
            <span className="animate-wave origin-bottom-right inline-block">👋</span>
          </h1>
          <p className="text-slate-500 text-sm dark:text-slate-300">
            Explore opportunities and take the next step in your career.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/jobs')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-md shadow-blue-500/20 px-6 py-3.5 shrink-0 flex items-center gap-1.5 transition-transform hover:scale-[1.01]"
        >
          <span>Browse All Jobs</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </Button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Applications */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] flex flex-col justify-between h-36 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Applications</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20 shrink-0"><Briefcase className="w-4.5 h-4.5" /></div>
          </div>
          <div className="space-y-0.5 mt-auto">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.totalApplications}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1">Submitted</p>
          </div>
        </Card>

        {/* Saved Jobs */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] flex flex-col justify-between h-36 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Saved Jobs</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-500/20 shrink-0"><Bookmark className="w-4.5 h-4.5" /></div>
          </div>
          <div className="space-y-0.5 mt-auto">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.savedJobsCount}</h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider mt-1">Bookmarked</p>
          </div>
        </Card>

        {/* Resume Strength */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] flex flex-col justify-between h-36 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Resume Strength</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20 shrink-0"><FileText className="w-4.5 h-4.5" /></div>
          </div>
          <div className="space-y-2 mt-auto">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.resumeCompletion}%</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.resumeCompletion}%` }} />
            </div>
            <button onClick={() => navigate('/resume')} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline text-left flex items-center gap-1.5">
              <span>Improve Resume</span> <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </Card>

        {/* Profile Strength */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] flex flex-col justify-between h-36 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profile Strength</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-500/20 shrink-0"><User className="w-4.5 h-4.5" /></div>
          </div>
          <div className="space-y-2 mt-auto">
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">{stats.profileCompletion}%</h3>
            <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.profileCompletion}%` }} />
            </div>
            <button onClick={() => navigate('/profile')} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider hover:underline text-left flex items-center gap-1.5">
              <span>Complete Profile</span> <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </Card>
      </div>

      {/* ── Main Dashboard Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Jobs Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Recommended Jobs</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/20 rounded-full">
                12 new
              </span>
            </h2>
            <button onClick={() => navigate('/jobs')} className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              View All
            </button>
          </div>

          {/* Jobs Listing */}
          <div className="space-y-4">
            {processedJobs.map((job) => (
              <Card key={job.id} className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] hover:shadow-md hover:border-blue-200 dark:hover:border-slate-700/80 transition-all duration-300 flex items-start gap-4 rounded-2xl shadow-sm">
                {renderCompanyLogo(job.company?.name || 'Company')}
                
                <div className="flex-grow space-y-3.5">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 
                          onClick={() => handleJobNavigation(job.id)}
                          className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-base leading-snug"
                        >
                          {job.title}
                        </h4>
                        {job.is_new && <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20 uppercase text-[9px] font-bold">New</Badge>}
                      </div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-none">{job.company?.name}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                        {job.match_score || 90}% Match
                      </span>
                      <button 
                        onClick={() => handleToggleSaveJob(job.id)}
                        className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Bookmark className={`w-4.5 h-4.5 ${savedStatus[job.id] ? 'fill-blue-600 text-blue-600' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location || 'Location'}</span>
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.job_type}</span>
                    <span className="flex items-center gap-0.5"><span className="text-slate-700 dark:text-white font-bold">₹</span> {job.salary || 'Not disclosed'}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side Column */}
        <div className="space-y-6">
          {/* Recent Applications */}
          <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] space-y-6 rounded-2xl shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">Recent Applications</h3>
              <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-white rounded-full">
                {recentApplications.length}
              </span>
            </div>

            {recentApplications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="p-4 bg-slate-100 text-slate-500 dark:bg-black/30 dark:text-slate-500 rounded-full">
                  <FolderOpen className="w-8 h-8" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">No Applications Yet</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-[200px] leading-relaxed">Start applying for jobs to track your progress here.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 space-y-4">
                {recentApplications.map((app, index) => (
                  <div key={app.id} className={`flex flex-col space-y-2 ${index > 0 ? 'pt-4 border-t border-slate-100 dark:border-slate-800' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 pr-2">
                        <h4 
                          onClick={() => handleJobNavigation(app.job?.id)}
                          className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer truncate"
                        >
                          {app.job?.title || 'Unknown Job'}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{app.job?.company_name}</p>
                      </div>
                      <Badge variant={getStatusVariant(app.status)} className="capitalize text-[9px] shrink-0 font-bold px-2">
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] space-y-6 rounded-2xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider">Quick Actions</h3>
            
            <div className="grid grid-cols-1 gap-3.5">
              <button 
                onClick={() => navigate('/resume')}
                className="p-3.5 bg-white dark:bg-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl flex items-center justify-between group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/20 shrink-0"><FileText className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">Upload / Update Resume</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/profile')}
                className="p-3.5 bg-white dark:bg-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl flex items-center justify-between group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-full border border-amber-100 dark:border-amber-500/20 shrink-0"><User className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">Complete Your Profile</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/saved-jobs')}
                className="p-3.5 bg-white dark:bg-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl flex items-center justify-between group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 rounded-full border border-purple-100 dark:border-purple-500/20 shrink-0"><Bookmark className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">Browse Saved Jobs</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/jobs')}
                className="p-3.5 bg-white dark:bg-black/30 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 rounded-2xl flex items-center justify-between group transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400 rounded-full border border-teal-100 dark:border-teal-500/20 shrink-0"><LayoutGrid className="w-4 h-4" /></div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">Explore Job Categories</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
