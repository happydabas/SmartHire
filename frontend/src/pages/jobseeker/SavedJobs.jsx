import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bookmark, 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  Clock, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  ArrowRight,
  SlidersHorizontal,
  Trash2
} from 'lucide-react';
import { jobService } from '@/services/jobs/jobService';
import { formatDate } from '@/utils/formatDate';
import { formatSalary } from '@/utils/formatSalary';

// Reusable UI components
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import EmptySavedJobs from '@/components/common/EmptySavedJobs';
import Modal from '@/components/ui/Modal';
import SkeletonCard from '@/components/common/SkeletonCard';

export function SavedJobsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently_saved');
  const [filters, setFilters] = useState({
    employment_type: '',
    location: '',
    work_mode: '',
  });

  // Unique list of locations for location filter dropdown
  const [availableLocations, setAvailableLocations] = useState([]);

  // Unsave confirmation modal states
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [jobToUnsave, setJobToUnsave] = useState(null);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await jobService.getSavedJobs();
      setSavedJobs(data || []);

      // Extract unique locations from list
      const locations = Array.from(new Set((data || []).map(job => job.location).filter(Boolean)));
      setAvailableLocations(locations);
    } catch (err) {
      console.error("Fetch saved jobs error:", err);
      setError("Failed to load your bookmarked job postings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({ ...prev, [id]: value }));
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      employment_type: '',
      location: '',
      work_mode: '',
    });
    setSortBy('recently_saved');
  };

  const handleTriggerUnsave = (job) => {
    setJobToUnsave(job);
    setIsConfirmOpen(true);
  };

  const handleUnsaveConfirm = async () => {
    if (!jobToUnsave || actionLoading) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await jobService.unsaveJob(jobToUnsave.id);
      
      setSuccess(`"${jobToUnsave.title}" removed from saved list.`);
      setIsConfirmOpen(false);
      setJobToUnsave(null);
      await fetchSavedJobs();
    } catch (err) {
      console.error("Unsave job error:", err);
      setError("Failed to remove the job from saved list.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewJobDetails = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  // Perform client-side filter & sort logic
  const getProcessedJobs = () => {
    let result = [...savedJobs];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(job => 
        job.title.toLowerCase().includes(q) ||
        (job.company?.name || '').toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
      );
    }

    // 2. Metadata Filters
    if (filters.employment_type) {
      result = result.filter(job => {
        // Handle job_type enum or string representation
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

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'recently_posted') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'company_name') {
        const nameA = (a.company?.name || '').toLowerCase();
        const nameB = (b.company?.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortBy === 'job_title') {
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
      }
      // default: recently_saved (uses list ordering returned by backend)
      return 0;
    });

    return result;
  };

  const processedJobs = getProcessedJobs();



  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col space-y-4">
        <PageHeader
          title="Saved Jobs"
          subtitle="Manage and track your bookmarked career opportunities."
        />

        {error && (
          <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-2xl animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Control Panel: Search, Sort, Filter */}
      <Card className="p-6 border border-slate-150/60 dark:border-slate-800 bg-white dark:bg-[#15161e] space-y-5 rounded-2xl shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-grow max-w-lg flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by job title, company, or location..."
              className="w-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 dark:text-white focus:bg-white dark:focus:bg-[#15161e] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400 dark:placeholder-slate-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sort By</span>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="recently_saved">Recently Saved</option>
                <option value="recently_posted">Recently Posted</option>
                <option value="company_name">Company Name</option>
                <option value="job_title">Job Title</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-200 font-bold"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Employment Type</label>
            <select
              id="employment_type"
              value={filters.employment_type}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="">All Types</option>
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</label>
            <select
              id="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="">All Locations</option>
              {availableLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Work Mode</label>
            <select
              id="work_mode"
              value={filters.work_mode}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="">All Modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <EmptySavedJobs />
      ) : processedJobs.length === 0 ? (
        searchQuery.trim() ? (
          <EmptyState
            title="No results found."
            description={`No results matching "${searchQuery}" were found. Try modifying your search.`}
            icon={Search}
            primaryButton={{
              label: "Clear Search",
              onClick: () => setSearchQuery('')
            }}
            className="bg-white dark:bg-[#15161e] border border-slate-150/60 dark:border-slate-800 shadow-sm w-full py-16 rounded-2xl"
          />
        ) : (
          <EmptyState
            title="No items match your filters."
            description="We couldn't find any saved jobs matching your active filter criteria. Try resetting them."
            icon={Search}
            primaryButton={{
              label: "Reset Filters",
              onClick: handleResetFilters
            }}
            className="bg-white dark:bg-[#15161e] border border-slate-150/60 dark:border-slate-800 shadow-sm w-full py-16 rounded-2xl"
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedJobs.map((job) => {
            const isClosed = job.status?.toLowerCase() === 'closed';
            const typeLabel = typeof job.job_type === 'string' ? job.job_type : (job.job_type?.value || '');
            const modeLabel = typeof job.work_mode === 'string' ? job.work_mode : (job.work_mode?.value || '');

            return (
              <Card 
                key={job.id} 
                className="flex flex-col justify-between p-6 hover:shadow-md hover:border-slate-250/80 dark:hover:border-slate-700/80 transition-all duration-200 border border-slate-150/60 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-2xl"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 
                          className="font-semibold text-slate-800 text-lg hover:text-blue-600 cursor-pointer transition-colors leading-snug truncate max-w-[220px] dark:text-white"
                          onClick={() => handleViewJobDetails(job.id)}
                          title={job.title}
                        >
                          {job.title}
                        </h3>
                        
                        <Badge variant={isClosed ? 'danger' : 'success'} className="capitalize text-[9px] py-0.5 px-2 tracking-wide font-medium">
                          {job.status || 'open'}
                        </Badge>
                      </div>

                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate" title={job.company?.name}>
                        {job.company?.name || 'Company Name'}
                      </p>
                    </div>

                    {/* Logo Placeholder */}
                    <div className="w-11 h-11 bg-blue-500/10 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 border border-blue-500/20 shadow-inner">
                      {(job.company?.name || 'C')[0]}
                    </div>
                  </div>

                  {/* Metadata labels */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-550 dark:text-slate-300 text-xs bg-slate-50 dark:bg-[#090a0f] px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800/80 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{job.location}</span>
                    </div>

                    {typeLabel && (
                      <Badge variant="info" className="uppercase text-[9px] font-medium py-1 px-2.5 rounded-xl border border-blue-100/30">
                        {typeLabel}
                      </Badge>
                    )}

                    {modeLabel && (
                      <Badge variant="neutral" className="uppercase text-[9px] font-medium py-1 px-2.5 rounded-xl border border-slate-200/50">
                        {modeLabel}
                      </Badge>
                    )}

                    {job.salary_min !== undefined && job.salary_min !== null && (
                      <div className="text-xs font-medium text-emerald-800 bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {formatSalary(job.salary_min)} {job.salary_max ? `- ${formatSalary(job.salary_max)}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footnotes & dates */}
                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 dark:text-slate-500 pt-5 border-t border-slate-100 dark:border-slate-800 mt-5">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Posted {formatDate(job.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium justify-end">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Saved Recently</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTriggerUnsave(job)}
                    disabled={actionLoading}
                    className="rounded-xl border border-red-100/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 dark:border-red-950/20 font-semibold py-2"
                    title="Remove from saved list"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewJobDetails(job.id)}
                    disabled={actionLoading}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold py-2 text-slate-650 dark:text-slate-300 dark:hover:bg-slate-800/40"
                  >
                    Details
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleViewJobDetails(job.id)}
                    disabled={actionLoading || isClosed}
                    className={`rounded-xl font-bold py-2 shadow-md text-white cursor-pointer ${isClosed ? 'opacity-50 cursor-not-allowed bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    Apply
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Unsave Confirmation Modal */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Unsave Job Posting"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to remove <strong>{jobToUnsave?.title}</strong> from your bookmarked jobs list?
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsConfirmOpen(false)}
              disabled={actionLoading}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUnsaveConfirm}
              isLoading={actionLoading}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold"
            >
              Confirm Remove
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SavedJobsPage;
