import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Bookmark, 
  Clock, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { jobService } from '@/services/jobs/jobService';
import { formatDate } from '@/utils/formatDate';
import { formatSalary } from '@/utils/formatSalary';

// Reusable UI components
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import EmptyJobs from '@/components/common/EmptyJobs';
import SkeletonCard from '@/components/common/SkeletonCard';

// Predefined Options
const EMPLOYMENT_TYPES = [
  { label: 'Full-Time', value: 'full_time' },
  { label: 'Part-Time', value: 'part_time' },
  { label: 'Internship', value: 'internship' },
  { label: 'Contract', value: 'contract' },
  { label: 'Freelance', value: 'freelance' }
];

const WORK_MODES = [
  { label: 'Remote', value: 'remote' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Onsite', value: 'onsite' }
];

const EXPERIENCE_LEVELS = [
  { label: 'Fresher', value: 'fresher' },
  { label: '1–3 Years', value: 'entry' },
  { label: '3–5 Years', value: 'mid' },
  { label: '5+ Years', value: 'senior' }
];

const SALARY_RANGES = [
  { label: 'Any Salary', value: '' },
  { label: '$30,000+', value: '30000' },
  { label: '$50,000+', value: '50000' },
  { label: '$80,000+', value: '80000' },
  { label: '$100,000+', value: '100000' }
];

const SORT_OPTIONS = [
  { label: 'Latest Posted', value: 'latest' },
  { label: 'Oldest Posted', value: 'oldest' },
  { label: 'Salary: High to Low', value: 'salary_desc' },
  { label: 'Salary: Low to High', value: 'salary_asc' },
  { label: 'Company Name (A–Z)', value: 'company_asc' },
  { label: 'Company Name (Z–A)', value: 'company_desc' },
  { label: 'Job Title (A–Z)', value: 'title_asc' },
  { label: 'Job Title (Z–A)', value: 'title_desc' }
];

export function JobsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Primary API lists state
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  
  // UI status states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [savingJobId, setSavingJobId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination totals
  const [totalRecords, setTotalRecords] = useState(0);

  // Mobile Filter Drawer overlay state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Search input local state
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const searchTimeoutRef = useRef(null);

  // Read current filters, sorting and pagination parameters from URL params
  const currentPage = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  const sortBy = searchParams.get('sort') || 'latest';

  const currentFilters = {
    search: searchParams.get('search') || '',
    employment_type: searchParams.get('employment_type') || '',
    work_mode: searchParams.get('work_mode') || '',
    experience_level: searchParams.get('experience_level') || '',
    min_salary: searchParams.get('min_salary') || '',
  };

  const updateURLParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        updated.set(key, value);
      } else {
        updated.delete(key);
      }
    });
    setSearchParams(updated);
  };

  // Debounce search changes to URL search params
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchVal !== currentFilters.search) {
        updateURLParams({ search: searchVal, page: 1 }); // reset to page 1 on new search
      }
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchVal]);

  // Synchronize input if URL changes independently
  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    if (urlSearch !== searchVal) {
      setSearchVal(urlSearch);
    }
  }, [searchParams]);

  // Main fetch runner triggered on URL query changes
  const fetchFilteredJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Concurrently load saved jobs metadata
      const [savedJobsData] = await Promise.all([
        jobService.getSavedJobs()
      ]);
      const savedIds = new Set((savedJobsData || []).map(j => j.id));
      setSavedJobIds(savedIds);

      let fetchedList = [];
      let totalCount = 0;

      if (currentFilters.search) {
        // Backend Search
        const searchResults = await jobService.searchJobs(currentFilters.search);
        let list = searchResults || [];

        // Apply filters client-side on search results
        if (currentFilters.employment_type) {
          list = list.filter(job => {
            const type = typeof job.job_type === 'string' ? job.job_type : (job.job_type?.value || '');
            return type.toLowerCase() === currentFilters.employment_type.toLowerCase();
          });
        }
        if (currentFilters.work_mode) {
          list = list.filter(job => {
            const mode = typeof job.work_mode === 'string' ? job.work_mode : (job.work_mode?.value || '');
            return mode.toLowerCase() === currentFilters.work_mode.toLowerCase();
          });
        }
        if (currentFilters.experience_level) {
          list = list.filter(job => {
            const exp = typeof job.experience_level === 'string' ? job.experience_level : (job.experience_level?.value || '');
            return exp.toLowerCase() === currentFilters.experience_level.toLowerCase();
          });
        }
        if (currentFilters.min_salary) {
          list = list.filter(job => job.salary_min >= Number(currentFilters.min_salary));
        }

        // Apply client-side sorting to the matched list
        list.sort((a, b) => sortComparator(a, b, sortBy));

        totalCount = list.length;
        // Paginate sliced list client-side
        const startIndex = (currentPage - 1) * pageSize;
        fetchedList = list.slice(startIndex, startIndex + pageSize);
      } else {
        // Natively filter on backend using /jobs endpoint
        const params = {
          page: currentPage,
          limit: pageSize,
          employment_type: currentFilters.employment_type || undefined,
          work_mode: currentFilters.work_mode || undefined,
          experience_level: currentFilters.experience_level || undefined,
          min_salary: currentFilters.min_salary || undefined,
        };
        const jobsResponse = await jobService.getOpenJobs(params);
        
        fetchedList = jobsResponse?.jobs || jobsResponse || [];
        totalCount = jobsResponse?.total_records || fetchedList.length;

        // Apply client-side sorting on the returned page slice
        fetchedList = [...fetchedList].sort((a, b) => sortComparator(a, b, sortBy));
      }

      setJobs(fetchedList);
      setTotalRecords(totalCount);
    } catch (err) {
      console.error("Fetch filtered jobs error:", err);
      setError("Failed to fetch matching job postings. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredJobs();
  }, [searchParams]);

  // Comparator for sorting
  const sortComparator = (a, b, sortKey) => {
    if (sortKey === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortKey === 'salary_desc') {
      const salA = a.salary_max || a.salary_min || 0;
      const salB = b.salary_max || b.salary_min || 0;
      return salB - salA;
    }
    if (sortKey === 'salary_asc') {
      const salA = a.salary_min || a.salary_max || 0;
      const salB = b.salary_min || b.salary_max || 0;
      return salA - salB;
    }
    if (sortKey === 'company_asc') {
      const compA = (a.company?.name || '').toLowerCase();
      const compB = (b.company?.name || '').toLowerCase();
      return compA.localeCompare(compB);
    }
    if (sortKey === 'company_desc') {
      const compA = (a.company?.name || '').toLowerCase();
      const compB = (b.company?.name || '').toLowerCase();
      return compB.localeCompare(compA);
    }
    if (sortKey === 'title_asc') {
      return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
    }
    if (sortKey === 'title_desc') {
      return b.title.toLowerCase().localeCompare(a.title.toLowerCase());
    }
    // Default: latest (created_at desc)
    return new Date(b.created_at) - new Date(a.created_at);
  };

  const handleSaveJob = async (jobId, jobTitle) => {
    if (savedJobIds.has(jobId) || actionLoading) return;

    try {
      setActionLoading(true);
      setSavingJobId(jobId);
      setError(null);
      setSuccess(null);
      await jobService.saveJob(jobId);
      
      setSavedJobIds(prev => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });

      setSuccess(`"${jobTitle}" saved successfully!`);
    } catch (err) {
      console.error("Save job error:", err);
      setError("Failed to bookmark job posting.");
    } finally {
      setActionLoading(false);
      setSavingJobId(null);
    }
  };

  const handleFilterClick = (key, value) => {
    updateURLParams({ [key]: value, page: 1 }); // reset to page 1
  };

  const handleRemoveFilterChip = (key) => {
    updateURLParams({ [key]: '', page: 1 });
  };

  const handleClearAll = () => {
    setSearchVal('');
    setSearchParams(new URLSearchParams({ page: '1', pageSize: '10', sort: 'latest' }));
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateURLParams({ page: newPage });
  };

  const handlePageSizeChange = (e) => {
    updateURLParams({ pageSize: e.target.value, page: 1 });
  };

  const handleSortChange = (e) => {
    updateURLParams({ sort: e.target.value });
  };

  // Status badges calculator
  const getJobStatusBadges = (job) => {
    const badges = [];

    if (job.status?.toLowerCase() === 'closed') {
      badges.push({ text: 'Closed', variant: 'danger' });
      return badges;
    }

    const createdDate = new Date(job.created_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    if (createdDate >= threeDaysAgo) {
      badges.push({ text: 'New', variant: 'success' });
    }

    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const now = new Date();
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      if (deadline > now && deadline <= threeDaysFromNow) {
        badges.push({ text: 'Closing Soon', variant: 'warning' });
      }
    }

    return badges;
  };

  // Generate label text for active filter chips
  const getFilterLabel = (key, val) => {
    if (key === 'employment_type') {
      return EMPLOYMENT_TYPES.find(o => o.value === val)?.label || val;
    }
    if (key === 'work_mode') {
      return WORK_MODES.find(o => o.value === val)?.label || val;
    }
    if (key === 'experience_level') {
      return EXPERIENCE_LEVELS.find(o => o.value === val)?.label || val;
    }
    if (key === 'min_salary') {
      return `Salary: $${Number(val).toLocaleString()}+`;
    }
    return val;
  };

  // Determine if any filters are active (excluding search, page, pageSize, sort)
  const activeChips = Object.entries(currentFilters).filter(([k, v]) => k !== 'search' && v);
  const isAnyFilterActive = activeChips.length > 0 || currentFilters.search;

  // Pagination helpers
  const totalPages = Math.ceil(totalRecords / pageSize) || 0;
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const renderFiltersList = () => (
    <div className="space-y-6">
      {/* Employment Type */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Type</h4>
        <div className="flex flex-col gap-1">
          {EMPLOYMENT_TYPES.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterClick('employment_type', currentFilters.employment_type === opt.value ? '' : opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentFilters.employment_type === opt.value 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work Mode</h4>
        <div className="flex flex-col gap-1">
          {WORK_MODES.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterClick('work_mode', currentFilters.work_mode === opt.value ? '' : opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentFilters.work_mode === opt.value 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Experience Level</h4>
        <div className="flex flex-col gap-1">
          {EXPERIENCE_LEVELS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterClick('experience_level', currentFilters.experience_level === opt.value ? '' : opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentFilters.experience_level === opt.value 
                  ? 'bg-blue-50 text-blue-700 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Range */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Range</h4>
        <div className="flex flex-col gap-1">
          {SALARY_RANGES.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleFilterClick('min_salary', opt.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                currentFilters.min_salary === opt.value
                  ? 'bg-blue-50 text-blue-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Job Openings</h1>
          <p className="text-slate-500 text-sm mt-1">Discover active, verified career opportunities tailored for your professional growth.</p>
        </div>

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

      {/* Control Row: Search bar & Sort dropdown */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search bar */}
        <div className="relative flex-grow flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by job title, company name, or location..."
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm transition-all placeholder-slate-400 font-medium"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          {searchVal && (
            <button 
              onClick={() => setSearchVal('')} 
              className="absolute right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 justify-between md:justify-end">
          {/* Sorting */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Sort By</span>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Page Size */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">Show</span>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-white border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            >
              <option value="10">10 Jobs</option>
              <option value="20">20 Jobs</option>
              <option value="50">50 Jobs</option>
            </select>
          </div>

          <Button
            variant="secondary"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden rounded-2xl border border-slate-200 p-4 font-bold flex items-center justify-center gap-2 shrink-0 bg-white"
          >
            <SlidersHorizontal className="w-5 h-5 text-slate-600" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>
      </div>

      {/* Filter chips / Active filters row */}
      {isAnyFilterActive && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl animate-fadeIn">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Active:</span>
          
          {currentFilters.search && (
            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-xl text-xs font-bold animate-scaleIn">
              Search: "{currentFilters.search}"
              <button onClick={() => setSearchVal('')} className="hover:text-blue-900 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {activeChips.map(([key, val]) => (
            <span key={key} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-xl text-xs font-bold animate-scaleIn">
              {getFilterLabel(key, val)}
              <button onClick={() => handleRemoveFilterChip(key)} className="hover:text-blue-900 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          <button
            onClick={handleClearAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-extrabold flex items-center gap-1 px-3 py-1 hover:underline ml-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Clear All
          </button>
        </div>
      )}

      {/* Sidebar Filter / Main List Flex Layout */}
      <div className="flex gap-8 items-start">
        
        {/* Desktop Filters Sidebar */}
        <Card className="hidden lg:block w-72 shrink-0 border border-slate-100 p-6 space-y-6 bg-white self-start sticky top-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Job Filters</h3>
            {isAnyFilterActive && (
              <button onClick={handleClearAll} className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline">
                Clear All
              </button>
            )}
          </div>
          {renderFiltersList()}
        </Card>

        {/* Main List & Pagination Column */}
        <div className="flex-grow w-full space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            currentFilters.search ? (
              <EmptyState
                title="No results found."
                description={`No results matching "${currentFilters.search}" were found. Try modifying your search.`}
                icon={Search}
                primaryButton={{
                  label: "Clear Search",
                  onClick: () => setSearchVal('')
                }}
                className="bg-white border border-slate-100 shadow-sm w-full py-16"
              />
            ) : activeChips.length > 0 ? (
              <EmptyState
                title="No items match your filters."
                description="We couldn't find any jobs matching your active filter criteria. Try resetting them."
                icon={Search}
                primaryButton={{
                  label: "Reset Filters",
                  onClick: handleClearAll
                }}
                className="bg-white border border-slate-100 shadow-sm w-full py-16"
              />
            ) : (
              <EmptyJobs
                onClearFilters={handleClearAll}
                onBrowseAll={handleClearAll}
              />
            )
          ) : (
            <>
              {/* Jobs List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                {jobs.map((job) => {
                  const isSaved = savedJobIds.has(job.id);
                  const statusBadges = getJobStatusBadges(job);
                  const typeLabel = typeof job.job_type === 'string' ? job.job_type : (job.job_type?.value || '');
                  const modeLabel = typeof job.work_mode === 'string' ? job.work_mode : (job.work_mode?.value || '');
                  
                  const slicedSkills = (job.skills || []).slice(0, 3);
                  const extraSkillsCount = Math.max(0, (job.skills || []).length - 3);

                  return (
                    <Card 
                      key={job.id} 
                      hoverable
                      className="flex flex-col justify-between p-5 border border-slate-100 bg-white"
                    >
                      <div className="space-y-4">
                        {/* Logo, Title and Company */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 min-w-0">
                            <h3 
                              className="font-bold text-slate-800 text-base hover:text-blue-600 cursor-pointer transition-colors leading-snug truncate"
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              title={job.title}
                            >
                              {job.title}
                            </h3>
                            <p className="text-xs font-semibold text-slate-500 truncate" title={job.company?.name}>
                              {job.company?.name || 'Company Name'}
                            </p>
                          </div>

                          {/* Logo Initials */}
                          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 border border-blue-100/50 shadow-inner">
                            {(job.company?.name || 'C')[0]}
                          </div>
                        </div>

                        {/* Status badges */}
                        {statusBadges.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {statusBadges.map((badge, idx) => (
                              <Badge key={idx} variant={badge.variant} className="text-[9px] py-0.5 px-2 tracking-wide font-extrabold capitalize">
                                {badge.text}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Metadata Row */}
                        <div className="space-y-2 text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="capitalize">{typeLabel} ({modeLabel})</span>
                          </div>

                          {job.salary_min !== undefined && job.salary_min !== null && (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                              <DollarSign className="w-4 h-4 text-emerald-500 shrink-0" />
                              <span>
                                {formatSalary(job.salary_min)} {job.salary_max ? `- ${formatSalary(job.salary_max)}` : ''}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>Exp: {job.experience_level?.replace('_', ' ') || 'Not specified'}</span>
                          </div>
                        </div>

                        {/* Skills tags list */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="space-y-1">
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Skills</span>
                            <div className="flex flex-wrap gap-1">
                              {slicedSkills.map(skill => (
                                <span 
                                  key={skill.id} 
                                  className="text-[9px] font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-lg px-2 py-0.5"
                                >
                                  {skill.skill_name}
                                </span>
                              ))}
                              {extraSkillsCount > 0 && (
                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                                  +{extraSkillsCount} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer and actions */}
                      <div className="pt-4 border-t border-slate-50 mt-4 space-y-3">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                          <span>Posted {formatDate(job.created_at)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSaveJob(job.id, job.title)}
                            disabled={isSaved || actionLoading}
                            isLoading={savingJobId === job.id}
                            className={`rounded-xl border border-slate-200 font-bold py-2 flex items-center justify-center gap-1 text-xs ${
                              isSaved ? 'text-slate-400 bg-slate-50 border-slate-100' : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {isSaved ? (
                              <>
                                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Save</span>
                              </>
                            )}
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            disabled={actionLoading}
                            className="rounded-xl font-bold py-2 text-xs flex items-center justify-center gap-1"
                          >
                            Details <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination Controls Footer Container */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100">
                
                {/* Info summary text */}
                <div className="text-sm font-semibold text-slate-400 select-none">
                  Showing <span className="text-slate-700">{startRecord}</span>–<span className="text-slate-700">{endRecord}</span> of <span className="text-slate-700 font-bold">{totalRecords}</span> jobs
                </div>

                {/* Desktop Responsive Navigation links layout */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-500 shadow-sm"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-500 shadow-sm"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all border ${
                        pageNum === currentPage
                          ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-500 shadow-sm"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-slate-500 shadow-sm"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Responsive Navigation compact layout */}
                <div className="flex sm:hidden items-center gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="rounded-xl border border-slate-200 font-bold px-3 py-1.5"
                  >
                    Prev
                  </Button>
                  
                  <span className="text-sm font-bold text-slate-700 bg-blue-50 border border-blue-100/30 px-3 py-1 rounded-xl">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="rounded-xl border border-slate-200 font-bold px-3 py-1.5"
                  >
                    Next
                  </Button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Slide-over Filters Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden animate-fadeIn">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer content body */}
          <div className="relative w-80 max-w-full bg-white h-full flex flex-col justify-between shadow-2xl p-6 overflow-y-auto space-y-6 animate-in slide-in-from-right duration-250">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-500" /> Filter Listings
                </h3>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderFiltersList()}
            </div>

            <div className="border-t border-slate-50 pt-4 flex gap-3">
              <Button
                variant="secondary"
                onClick={handleClearAll}
                className="w-full rounded-xl font-bold"
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full rounded-xl font-bold"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobsPage;
