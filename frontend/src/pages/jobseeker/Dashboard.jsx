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
  DollarSign,
  X,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { jobService } from '@/services/jobs/jobService';
import { applicationService } from '@/services/applications/applicationService';
import { profileService } from '@/services/profile/profileService';
import { formatDate } from '@/utils/formatDate';
import { formatSalary } from '@/utils/formatSalary';

// Reusable UI components
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonCard from '@/components/common/SkeletonCard';

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

  // Search, sort, filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently_posted');
  const [filters, setFilters] = useState({
    employment_type: '',
    location: '',
    work_mode: '',
  });
  const [availableLocations, setAvailableLocations] = useState([]);

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

      let savedCount = 0;
      try {
        const savedResponse = await jobService.getSavedJobs();
        savedCount = savedResponse?.length || 0;
      } catch (err) {
        console.warn('Failed to fetch saved jobs:', err);
      }

      let profileComp = 0;
      try {
        const profile = await profileService.getProfile();
        if (profile) {
          const fieldsToCheck = ['full_name', 'phone_number', 'date_of_birth', 'gender', 'address', 'city', 'country', 'professional_summary'];
          const populatedCount = fieldsToCheck.filter(field => !!profile[field]).length;
          profileComp = Math.round((populatedCount / fieldsToCheck.length) * 100);
        }
      } catch (err) {
        console.warn('Failed to fetch profile:', err);
      }

      let resumeComp = 0;
      try {
        const resumeMeta = await profileService.getResumeMetadata();
        if (resumeMeta?.file_path) resumeComp = 100;
      } catch (err) {
        console.warn('Failed to fetch resume metadata:', err);
      }

      let recommended = [];
      try {
        const jobsResponse = await jobService.getOpenJobs({ page: 1, limit: 20 });
        recommended = jobsResponse?.items || [];
      } catch (err) {
        console.warn('Failed to fetch open jobs:', err);
      }

      // Extract unique locations
      const locations = Array.from(new Set(recommended.map(j => j.location).filter(Boolean)));
      setAvailableLocations(locations);

      setStats({ totalApplications: totalApps, savedJobsCount: savedCount, resumeCompletion: resumeComp, profileCompletion: profileComp });
      setRecentApplications(recentApps);
      setRecommendedJobs(recommended);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load dashboard data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('hire') || s.includes('success')) return 'success';
    if (s.includes('reject') || s.includes('decline') || s.includes('fail')) return 'danger';
    if (s.includes('interview') || s.includes('review') || s.includes('schedule')) return 'warning';
    if (s.includes('applied') || s.includes('submit') || s.includes('pending')) return 'primary';
    return 'neutral';
  };

  const handleJobNavigation = (jobId) => navigate(`/jobs/${jobId}`);

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({ employment_type: '', location: '', work_mode: '' });
    setSortBy('recently_posted');
  };

  const hasActiveFilters = searchQuery || filters.employment_type || filters.location || filters.work_mode;

  // Client-side filter + sort
  const getProcessedJobs = () => {
    let result = [...recommendedJobs];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(job =>
        job.title?.toLowerCase().includes(q) ||
        (job.company?.name || '').toLowerCase().includes(q) ||
        (job.location || '').toLowerCase().includes(q)
      );
    }

    if (filters.employment_type) {
      result = result.filter(job => {
        const type = typeof job.job_type === 'string' ? job.job_type : (job.job_type?.value || '');
        return type.toLowerCase() === filters.employment_type.toLowerCase();
      });
    }

    if (filters.location) {
      result = result.filter(job => job.location === filters.location);
    }

    if (filters.work_mode) {
      result = result.filter(job => {
        const mode = typeof job.work_mode === 'string' ? job.work_mode : (job.work_mode?.value || '');
        return mode.toLowerCase() === filters.work_mode.toLowerCase();
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'recently_posted') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'company_name') return (a.company?.name || '').toLowerCase().localeCompare((b.company?.name || '').toLowerCase());
      if (sortBy === 'job_title') return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      return 0;
    });

    return result;
  };

  const processedJobs = getProcessedJobs();

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto animate-pulse select-none">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded-lg w-32"></div>
            <div className="h-6 bg-slate-200 rounded-xl w-64"></div>
          </div>
          <div className="h-11 bg-slate-200 rounded-2xl w-40"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3 border border-slate-100 bg-white">
              <div className="flex items-center justify-between">
                <div className="h-3 bg-slate-200 rounded-lg w-20"></div>
                <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="h-7 bg-slate-200 rounded-xl w-12"></div>
              <div className="h-3 bg-slate-200 rounded-lg w-16"></div>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recommended Jobs Column */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-5 bg-slate-200 rounded-lg w-40"></div>
            </div>
            {/* Filter card skeleton */}
            <Card className="p-5 border border-slate-100 bg-white space-y-4">
              <div className="h-10 bg-slate-200 rounded-xl w-full"></div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>

          {/* Recent Applications Sidebar */}
          <div className="space-y-5">
            <div className="h-5 bg-slate-200 rounded-lg w-44"></div>
            <Card className="p-5 border border-slate-100 bg-white space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`space-y-2.5 ${i > 0 ? 'border-t border-slate-100 pt-4' : ''}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5 flex-grow">
                      <div className="h-3.5 bg-slate-200 rounded-lg w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded-lg w-1/2"></div>
                    </div>
                    <div className="h-5 bg-slate-200 rounded-lg w-16"></div>
                  </div>
                  <div className="h-3 bg-slate-200 rounded-lg w-1/3"></div>
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/10 text-center space-y-4 p-8">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Error Loading Dashboard</h3>
          <p className="text-sm text-slate-600">{error}</p>
          <Button variant="primary" size="md" onClick={fetchDashboardData} className="w-full mt-2">Retry Connection</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Job Seeker's Workspace</p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Candidate'}!
          </h1>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/jobs')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 px-6 py-3 shrink-0 flex items-center gap-2"
        >
          Browse All Jobs <ArrowRight className="w-5 h-5" />
        </Button>
      </div>


      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:scale-[1.02] transition-transform duration-200 p-5 space-y-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Applications</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">{stats.totalApplications}</h3>
          <p className="text-xs text-slate-400">Submitted</p>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 p-5 space-y-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Saved Jobs</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Bookmark className="w-4 h-4" /></div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800">{stats.savedJobsCount}</h3>
          <p className="text-xs text-slate-400">Bookmarked</p>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 p-5 space-y-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Resume</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><FileText className="w-4 h-4" /></div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl font-extrabold text-slate-800">{stats.resumeCompletion}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.resumeCompletion}%` }} />
            </div>
          </div>
        </Card>

        <Card className="hover:scale-[1.02] transition-transform duration-200 p-5 space-y-3 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Profile</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><User className="w-4 h-4" /></div>
          </div>
          <div className="space-y-1.5">
            <h3 className="text-2xl font-extrabold text-slate-800">{stats.profileCompletion}%</h3>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${stats.profileCompletion}%` }} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Main Content: Jobs + Sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recommended Jobs Column */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              Recommended Jobs
              <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">
                {processedJobs.length} {hasActiveFilters ? 'matches' : 'open'}
              </span>
            </h2>
          </div>

          {/* Search + Sort + Filter Panel */}
          <Card className="p-5 border border-slate-100 shadow-sm space-y-4 bg-white">
            {/* Row 1: Search + Sort + Reset */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* Search */}
              <div className="relative flex-grow flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search title, company or location..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="recently_posted">Latest</option>
                  <option value="company_name">Company</option>
                  <option value="job_title">Title</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600 border border-red-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-all shrink-0"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Row 2: Filter dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-50 pt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment Type</label>
                <select id="employment_type" value={filters.employment_type} onChange={handleFilterChange}
                  className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="">All Types</option>
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <select id="location" value={filters.location} onChange={handleFilterChange}
                  className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="">All Locations</option>
                  {availableLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work Mode</label>
                <select id="work_mode" value={filters.work_mode} onChange={handleFilterChange}
                  className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="">All Modes</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Jobs Grid */}
          {processedJobs.length === 0 ? (
            <EmptyState
              title="No Jobs Found"
              description={
                hasActiveFilters
                  ? 'No job listings match your current filters. Try resetting them.'
                  : "We couldn't find any open job listings at this moment. Check back later."
              }
              icon={<Briefcase className="w-10 h-10" />}
              action={
                hasActiveFilters ? (
                  <Button variant="secondary" size="md" onClick={handleResetFilters} className="rounded-xl font-bold">
                    Clear Filters
                  </Button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {processedJobs.map((job) => {
                const typeLabel = typeof job.job_type === 'string' ? job.job_type : (job.job_type?.value || '');
                const modeLabel = typeof job.work_mode === 'string' ? job.work_mode : (job.work_mode?.value || '');
                return (
                  <Card key={job.id} className="flex flex-col justify-between p-5 hover:shadow-2xl hover:border-slate-300 transition-all duration-200 border border-slate-100 bg-white">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-0.5 min-w-0">
                          <h4
                            className="font-bold text-slate-800 text-base leading-snug hover:text-blue-600 cursor-pointer transition-colors truncate"
                            onClick={() => handleJobNavigation(job.id)}
                          >
                            {job.title}
                          </h4>
                          <p className="text-sm font-semibold text-slate-500 truncate">{job.company?.name || 'Company'}</p>
                        </div>
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                          {(job.company?.name || 'C')[0]}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-1.5">
                        {job.location && (
                          <div className="flex items-center gap-1 text-slate-500 text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                            <MapPin className="w-3 h-3 shrink-0" /><span>{job.location}</span>
                          </div>
                        )}
                        {typeLabel && <Badge variant="info" className="uppercase text-[9px]">{typeLabel}</Badge>}
                        {modeLabel && <Badge variant="neutral" className="uppercase text-[9px]">{modeLabel}</Badge>}
                        {(job.salary !== undefined && job.salary !== null) && (
                          <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-0.5">
                            <DollarSign className="w-3 h-3 shrink-0" />{formatSalary(job.salary)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="secondary" size="sm" onClick={() => handleJobNavigation(job.id)} className="rounded-xl font-bold py-2 border border-slate-200">
                        View Details
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleJobNavigation(job.id)} className="rounded-xl font-bold py-2 shadow-sm">
                        Apply Now
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Applications Sidebar */}
        <div className="space-y-5">
          <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            Recent Applications
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-full">{recentApplications.length}</span>
          </h2>

          {recentApplications.length === 0 ? (
            <EmptyState
              title="No Applications Yet"
              description="Start applying for jobs to track your progress here."
              icon={<Clock className="w-10 h-10" />}
            />
          ) : (
            <Card className="p-5 border border-slate-100 shadow-sm space-y-4 bg-white">
              <div className="divide-y divide-slate-100 space-y-4">
                {recentApplications.map((app, index) => (
                  <div key={app.id} className={`flex flex-col space-y-2 ${index > 0 ? 'pt-4' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <h4
                          className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition-colors truncate"
                          onClick={() => handleJobNavigation(app.job?.id)}
                        >
                          {app.job?.title || 'Unknown Job'}
                        </h4>
                        <p className="text-xs font-medium text-slate-500 truncate">{app.job?.company_name || 'Unknown Company'}</p>
                      </div>
                      <Badge variant={getStatusVariant(app.status)} className="capitalize text-[10px] shrink-0">
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-slate-400 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(app.applied_at)}</span>
                      </div>
                      <button
                        onClick={() => handleJobNavigation(app.job?.id)}
                        className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-0.5 hover:underline transition-all"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
