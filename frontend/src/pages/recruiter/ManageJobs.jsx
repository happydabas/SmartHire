import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  Edit2,
  Copy,
  Trash2,
  XCircle,
  Play,
  Plus,
  Briefcase,
  AlertCircle,
  Clock,
  Sparkles,
  Inbox,
  Calendar,
  Building,
  MapPin,
  RotateCcw,
  CheckCircle2,
  FileUp,
  UserCheck,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { recruiterService } from '@/services/recruiter/recruiterService';
import { jobService } from '@/services/jobs/jobService';
import { companyService } from '@/services/company/companyService';
import { formatDate } from '@/utils/formatDate';
import { formatJobType, formatWorkMode } from '@/utils/enumFormatters';
import { ROUTES } from '@/constants/routes';
import { notificationService } from '@/services/notificationService';

// Reusable UI components
import SearchBar from '@/components/ui/SearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import EmptyRecruiterJobs from '@/components/common/EmptyRecruiterJobs';
import Toast from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import SkeletonTable from '@/components/common/SkeletonTable';
import ActionMenu from '@/components/ui/ActionMenu';

export function ManageJobs() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // URL parameters sync hook
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State variables synchronized from URL query params
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const jobTypeParam = searchParams.get('jobType') || '';
  const workModeParam = searchParams.get('workMode') || '';
  const sortParam = searchParams.get('sort') || 'latest';
  const pageParam = Number(searchParams.get('page')) || 1;
  const pageSizeParam = Number(searchParams.get('pageSize')) || 10;

  // Local Search Input (for debounce tracking)
  const [searchInput, setSearchInput] = useState(searchParam);

  // Listing page UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobData, setJobData] = useState({ items: [], total: 0 });
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

  // Confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmVariant, setConfirmVariant] = useState('primary');

  // Global action pending lock (disables all other buttons)
  const [actionPending, setActionPending] = useState(false);

  // Debounce search effect (400ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchParams(prev => {
        if (searchInput.trim()) {
          prev.set('search', searchInput.trim());
        } else {
          prev.delete('search');
        }
        prev.set('page', '1'); // reset page to 1
        return prev;
      });
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput, setSearchParams]);

  // Sync search input with parameter changing externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Main list fetch
  const fetchJobs = async (forceRefetch = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruiterService.getManageJobs({
        search: searchParam,
        status: statusParam,
        jobType: jobTypeParam,
        workMode: workModeParam,
        sort: sortParam,
        page: pageParam,
        pageSize: pageSizeParam,
        forceRefetch
      });
      setJobData(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to fetch job postings. Verify your network or credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Sync with URL parameters changes
  useEffect(() => {
    fetchJobs(false);
  }, [searchParam, statusParam, jobTypeParam, workModeParam, sortParam, pageParam, pageSizeParam]);

  // Refetch completely on initial mount
  useEffect(() => {
    fetchJobs(true);
  }, []);

  const triggerToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Update helper actions
  const handleFilterChange = (id, value) => {
    setSearchParams(prev => {
      if (value) {
        prev.set(id, value);
      } else {
        prev.delete(id);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSortChange = (e) => {
    setSearchParams(prev => {
      prev.set('sort', e.target.value);
      prev.set('page', '1');
      return prev;
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', String(newPage));
      return prev;
    });
  };

  const handlePageSizeChange = (newSize) => {
    setSearchParams(prev => {
      prev.set('pageSize', String(newSize));
      prev.set('page', '1');
      return prev;
    });
  };

  const handleClearAllFilters = () => {
    setSearchInput('');
    setSearchParams({
      page: '1',
      pageSize: String(pageSizeParam)
    });
  };

  // Status mapping
  const getStatusBadgeVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s === 'open' || s === 'active') return 'success';
    if (s === 'draft') return 'warning';
    if (s === 'closed') return 'danger';
    return 'neutral';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const s = status.toLowerCase();
    if (s === 'open') return 'Active';
    if (s === 'draft') return 'Draft';
    if (s === 'closed') return 'Closed';
    return status;
  };

  // Formats job payload properties to comply with Job schemas
  const getJobPayload = (details, newStatus = 'open') => {
    const mappedSkills = (details.skills || []).map(s => s.skill_name);
    const pipelineStages = (details.pipeline?.stages || []).map(s => s.stage_name);
    
    return {
      title: details.title,
      description: details.description,
      location: details.location,
      job_type: details.job_type?.value || details.job_type,
      experience_level: details.experience_level?.value || details.experience_level,
      work_mode: details.work_mode?.value || details.work_mode,
      status: newStatus,
      salary_min: details.salary_min,
      salary_max: details.salary_max,
      application_deadline: details.application_deadline,
      required_skills: mappedSkills,
      hiring_pipeline: pipelineStages
    };
  };

  // API Execution Handlers
  const handleCloseJob = (jobId) => {
    setConfirmTitle('Close Job Posting');
    setConfirmMessage('Are you sure you want to close this job listing? Candidates will no longer be able to submit applications.');
    setConfirmVariant('primary');
    setConfirmAction(() => async () => {
      try {
        setConfirmLoading(true);
        await jobService.closeJob(jobId);
        recruiterService.clearJobsCache();
        triggerToast('Job closed.', 'success');

        // Trigger notification
        const targetJob = jobs.find(j => j.id === jobId);
        notificationService.notifyJobClosed(jobId, targetJob?.title || 'Job Listing', user)
          .catch(err => console.error('Notification closure trigger error:', err));

        fetchJobs(true);
      } catch (err) {
        console.error(err);
        triggerToast('Failed to close job posting.', 'error');
      } finally {
        setConfirmLoading(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleReopenJob = (jobId) => {
    setConfirmTitle('Reopen Job Posting');
    setConfirmMessage('Reopen this closed job posting? This will restore it to Active status and make it visible to candidates.');
    setConfirmVariant('primary');
    setConfirmAction(() => async () => {
      try {
        setConfirmLoading(true);
        // Load details first
        const details = await jobService.getJobDetails(jobId);
        const payload = getJobPayload(details, 'open');
        // Update to Active status
        await jobService.updateJob(jobId, payload);
        recruiterService.clearJobsCache();
        triggerToast('Job reopened.', 'success');

        // Trigger notification
        notificationService.notifyJobReopened(jobId, details?.title || 'Job Listing', user)
          .catch(err => console.error('Notification reopening trigger error:', err));

        fetchJobs(true);
      } catch (err) {
        console.error(err);
        triggerToast('Failed to reopen job posting.', 'error');
      } finally {
        setConfirmLoading(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handleDeleteJob = (jobId) => {
    setConfirmTitle('Delete Job Posting');
    setConfirmMessage('Delete this job permanently? This action is irreversible and will purge the job posting alongside all recorded applications.');
    setConfirmVariant('danger');
    setConfirmAction(() => async () => {
      try {
        setConfirmLoading(true);
        await jobService.deleteJob(jobId);
        recruiterService.clearJobsCache();
        triggerToast('Job deleted.', 'success');
        fetchJobs(true);
      } catch (err) {
        console.error(err);
        triggerToast('Failed to delete job posting.', 'error');
      } finally {
        setConfirmLoading(false);
        setConfirmOpen(false);
      }
    });
    setConfirmOpen(true);
  };

  const handlePublishJob = async (jobId) => {
    try {
      setActionPending(true);
      await jobService.publishJob(jobId);
      recruiterService.clearJobsCache();
      triggerToast('Job updated successfully.', 'success');

      // Trigger notification
      const targetJob = jobs.find(j => j.id === jobId);
      notificationService.notifyJobPublished(jobId, targetJob?.title || 'Job Listing', user)
        .catch(err => console.error('Notification publishing trigger error:', err));

      fetchJobs(true);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to publish draft listing.', 'error');
    } finally {
      setActionPending(false);
    }
  };

  const handleDuplicateJob = async (jobId) => {
    try {
      setActionPending(true);
      // Fetch details first
      const details = await jobService.getJobDetails(jobId);
      
      // Clone payload as Draft
      const duplicatedPayload = getJobPayload(details, 'draft');
      duplicatedPayload.title = `Copy of ${details.title}`.substring(0, 100);

      const duplicatedJob = await jobService.createJob(duplicatedPayload);
      recruiterService.clearJobsCache();
      triggerToast('Job duplicated.', 'success');
      
      // Redirect to Edit Page of the new draft
      setTimeout(() => {
        navigate(`/recruiter/jobs/${duplicatedJob.id}/edit`);
      }, 1000);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to duplicate job posting.', 'error');
    } finally {
      setActionPending(false);
    }
  };

  const isOwner = Boolean(user?.is_owner || user?.role === 'company_owner');

  // Recruiter Access Management Modal State
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedJobForAssignments, setSelectedJobForAssignments] = useState(null);
  const [companyRecruiters, setCompanyRecruiters] = useState([]);
  const [assignedRecruiterIds, setAssignedRecruiterIds] = useState([]);
  const [recruitersLoading, setRecruitersLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);

  const handleOpenAssignmentModal = async (job) => {
    setSelectedJobForAssignments(job);
    setAssignedRecruiterIds(job.assigned_recruiter_ids || []);
    setAssignmentModalOpen(true);

    if (user?.company_id) {
      try {
        setRecruitersLoading(true);
        const data = await companyService.getRecruiters(user.company_id);
        const list = Array.isArray(data) ? data : (data.recruiters || []);
        setCompanyRecruiters(list);
      } catch (err) {
        console.error('Failed to load recruiters:', err);
      } finally {
        setRecruitersLoading(false);
      }
    }
  };

  const toggleModalRecruiter = (recruiterId) => {
    setAssignedRecruiterIds(prev =>
      prev.includes(recruiterId)
        ? prev.filter(id => id !== recruiterId)
        : [...prev, recruiterId]
    );
  };

  const handleSaveAssignments = async () => {
    if (!selectedJobForAssignments) return;
    try {
      setAssignmentSaving(true);
      await jobService.updateJobAssignments(selectedJobForAssignments.id, assignedRecruiterIds);
      triggerToast('Recruiter access updated successfully!', 'success');
      setAssignmentModalOpen(false);
      fetchJobs(true);
    } catch (err) {
      console.error(err);
      triggerToast('Failed to update recruiter access.', 'error');
    } finally {
      setAssignmentSaving(false);
    }
  };

  // Build array of actions depending on listing status
  const getAvailableActions = (job) => {
    const actions = [];
    const status = job.status?.toLowerCase();

    // 1. View Action (valid for all statuses)
    actions.push({
      label: 'View Posting',
      icon: Eye,
      onClick: () => navigate(`/jobs/${job.id}`)
    });

    // Manage Recruiter Access (Company Owner only)
    if (isOwner) {
      actions.push({
        label: 'Manage Recruiter Access',
        icon: UserCheck,
        onClick: () => handleOpenAssignmentModal(job)
      });
    }

    // 2. Edit Action (Company Owner only, Draft or Active status)
    if (isOwner && (status === 'draft' || status === 'open')) {
      actions.push({
        label: 'Edit Job',
        icon: Edit2,
        onClick: () => navigate(`/recruiter/jobs/${job.id}/edit`)
      });
    }

    // 3. Publish Action (Company Owner only, Draft status)
    if (isOwner && status === 'draft') {
      actions.push({
        label: 'Publish Job',
        icon: CheckCircle2,
        onClick: () => handlePublishJob(job.id)
      });
    }

    // 4. Close Action (Company Owner only, Active/Open status)
    if (isOwner && status === 'open') {
      actions.push({
        label: 'Close Job',
        icon: XCircle,
        onClick: () => handleCloseJob(job.id)
      });
    }

    // 5. Reopen Action (Company Owner only, Closed status)
    if (isOwner && status === 'closed') {
      actions.push({
        label: 'Reopen Job',
        icon: Play,
        onClick: () => handleReopenJob(job.id)
      });
    }

    // 6. Duplicate Action (Company Owner only)
    if (isOwner) {
      actions.push({
        label: 'Duplicate Job',
        icon: Copy,
        onClick: () => handleDuplicateJob(job.id)
      });
    }

    // 7. Delete Action (Company Owner only)
    if (isOwner) {
      actions.push({
        label: 'Delete Posting',
        icon: Trash2,
        variant: 'danger',
        onClick: () => handleDeleteJob(job.id)
      });
    }

    return actions;
  };

  // Desktop Table columns
  const columns = [
    {
      header: 'Job Title',
      key: 'title',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-800 text-sm leading-snug">{row.title}</span>
          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">ID: {row.id}</span>
        </div>
      )
    },
    {
      header: 'Department',
      key: 'department',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500">{row.department || 'General'}</span>
      )
    },
    {
      header: 'Employment Type',
      key: 'job_type',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg">
          {formatJobType(row.job_type)}
        </span>
      )
    },
    {
      header: 'Work Mode',
      key: 'work_mode',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">{formatWorkMode(row.work_mode)}</span>
      )
    },
    {
      header: 'Location',
      key: 'location',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500">{row.location}</span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize text-[10px] px-2.5">
          {getStatusLabel(row.status)}
        </Badge>
      )
    },
    {
      header: 'Applications',
      key: 'applicationsCount',
      align: 'center',
      render: (row) => (
        <span className="text-sm font-extrabold text-slate-800">{row.applicationsCount}</span>
      )
    },
    {
      header: 'Created Date',
      key: 'created_at',
      render: (row) => (
        <span className="text-xs font-medium text-slate-400">{formatDate(row.created_at)}</span>
      )
    },
    {
      header: 'Last Updated',
      key: 'updated_at',
      render: (row) => (
        <span className="text-xs font-medium text-slate-400">{formatDate(row.updated_at)}</span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const actions = getAvailableActions(row);
        const status = row.status?.toLowerCase();

        return (
          <div className="flex items-center justify-end gap-1 shrink-0">
            {/* View - Quick access always visible */}
            <button
              disabled={actionPending}
              onClick={() => navigate(`/jobs/${row.id}`)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-40"
              title="View Posting"
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Edit - Quick access if Draft or Active (Company Owner only) */}
            {isOwner && (status === 'draft' || status === 'open') && (
              <button
                disabled={actionPending}
                onClick={() => navigate(`/recruiter/jobs/${row.id}/edit`)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-40"
                title="Edit Job Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Close - Quick access if Active (Company Owner only) */}
            {isOwner && status === 'open' && (
              <button
                disabled={actionPending}
                onClick={() => handleCloseJob(row.id)}
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-40"
                title="Close Job Posting"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}

            {/* Reopen - Quick access if Closed (Company Owner only) */}
            {isOwner && status === 'closed' && (
              <button
                disabled={actionPending}
                onClick={() => handleReopenJob(row.id)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-40"
                title="Reopen Job"
              >
                <Play className="w-4 h-4" />
              </button>
            )}

            {/* Overflow drop-down for the remaining choices */}
            <ActionMenu
              disabled={actionPending}
              actions={actions.filter(
                a => a.label !== 'View Posting' && 
                     a.label !== 'Edit Job' && 
                     a.label !== 'Close Job' && 
                     a.label !== 'Reopen Job'
              )}
            />
          </div>
        );
      }
    }
  ];

  // Mobile rendering card
  const renderMobileCard = (job, index) => {
    const actions = getAvailableActions(job);
    return (
      <Card key={job.id} className="p-5 border border-slate-100 bg-white shadow-sm space-y-4 rounded-2xl">
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm leading-snug">{job.title}</h4>
            <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5">{job.department} &bull; {job.location}</p>
          </div>
          <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize text-[10px] tracking-wide px-2.5">
            {getStatusLabel(job.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Job Type</span>
            <span className="text-slate-700">{formatJobType(job.job_type)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Work Mode</span>
            <span className="text-slate-700">{formatWorkMode(job.work_mode)}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Applications</span>
            <span className="text-slate-800 font-extrabold">{job.applicationsCount}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Created</span>
            <span className="text-slate-600">{formatDate(job.created_at)}</span>
          </div>
        </div>

        {/* Mobile Overflow action buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-300" />
            <span>Updated {formatDate(job.updated_at)}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>View</span>
            </button>
            <ActionMenu disabled={actionPending} actions={actions.filter(a => a.label !== 'View Posting')} />
          </div>
        </div>
      </Card>
    );
  };

  const hasActiveFilters = searchParam || statusParam || jobTypeParam || workModeParam;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Toast message popup */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Confirmation Dialog component */}
      <ConfirmationDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={confirmAction}
        confirmText="Proceed"
        confirmVariant={confirmVariant}
        isLoading={confirmLoading}
      />

      {/* Header Area */}
      <PageHeader
        title="Manage Job Listings"
        subtitle="Review active, draft, and closed jobs and inspect applicant rates."
      />

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters row */}
      <Card className="p-4 sm:p-5 border border-slate-100 bg-white rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
          
          <div className="flex-grow max-w-lg">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5 select-none">Search Listings</label>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={() => setSearchInput('')}
              placeholder="Search by job title, department, location..."
              disabled={loading && jobData.items.length === 0}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Status"
              value={statusParam}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={['Active', 'Draft', 'Closed']}
              placeholder="All Statuses"
              disabled={loading && jobData.items.length === 0}
            />

            <FilterDropdown
              label="Job Type"
              value={jobTypeParam}
              onChange={(e) => handleFilterChange('jobType', e.target.value)}
              options={['Full-time', 'Part-time', 'Contract', 'Internship']}
              placeholder="All Types"
              disabled={loading && jobData.items.length === 0}
            />

            <FilterDropdown
              label="Work Mode"
              value={workModeParam}
              onChange={(e) => handleFilterChange('workMode', e.target.value)}
              options={['Remote', 'Hybrid', 'Onsite']}
              placeholder="All Modes"
              disabled={loading && jobData.items.length === 0}
            />

            <SortDropdown
              value={sortParam}
              onChange={handleSortChange}
              options={[
                { label: 'Latest Created', value: 'latest' },
                { label: 'Oldest Created', value: 'oldest' },
                { label: 'Job Title (A-Z)', value: 'title' },
                { label: 'Applications Count', value: 'applications' }
              ]}
              disabled={loading && jobData.items.length === 0}
            />
          </div>

        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/50 px-3 py-2 rounded-xl self-start animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active filters in use</span>
            <button
              onClick={handleClearAllFilters}
              className="font-bold underline ml-2 hover:text-blue-800 transition-colors animate-pulse"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Main Listings */}
      {loading && jobData.items.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SkeletonTable rows={pageSizeParam} cols={5} />
        </div>
      ) : (
        <div className="relative">
          {(loading || actionPending) && (
            <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl animate-fadeIn">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xl flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs font-bold text-slate-600">Processing request...</span>
              </div>
            </div>
          )}

          {jobData.total === 0 ? (
            searchParam ? (
              <EmptyState
                title="No results found."
                description={`No results matching "${searchParam}" were found. Try modifying your search.`}
                icon={Inbox}
                primaryButton={{
                  label: "Clear Search",
                  onClick: () => setSearchInput('')
                }}
                className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100"
              />
            ) : statusParam || jobTypeParam || workModeParam ? (
              <EmptyState
                title="No items match your filters."
                description="We couldn't find any jobs matching your active filter criteria. Try resetting them."
                icon={Inbox}
                primaryButton={{
                  label: "Reset Filters",
                  onClick: handleClearAllFilters
                }}
                className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100"
              />
            ) : (
              <EmptyRecruiterJobs variant="manage" />
            )
          ) : (
            <div className="space-y-4 w-full">
              <div className="flex flex-col gap-4 w-full">
                {jobData.items.map((job) => {
                  const status = (job.status || 'draft').toLowerCase();
                  const actions = getAvailableActions(job);

                  const getStatusBadge = (st) => {
                    if (st === 'open' || st === 'active') {
                      return (
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          Active
                        </span>
                      );
                    }
                    if (st === 'closed') {
                      return (
                        <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40">
                          Closed
                        </span>
                      );
                    }
                    return (
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                        Draft
                      </span>
                    );
                  };

                  return (
                    <Card
                      key={job.id}
                      className="w-full p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm hover:shadow-md transition-all space-y-4"
                    >
                      {/* Header Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center shrink-0 font-extrabold text-base">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <h3
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                              >
                                {job.title}
                              </h3>
                              {getStatusBadge(status)}
                              {job.department && (
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {job.department}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium flex items-center gap-2 flex-wrap">
                              <span>Created {formatDate(job.created_at)}</span>
                              {job.application_deadline && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    Deadline: {formatDate(job.application_deadline)}
                                  </span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Action Menu dropdown */}
                        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                          <ActionMenu actions={actions} />
                        </div>
                      </div>

                      {/* Key details Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{job.location || 'Location Unspecified'}</span>
                        </div>

                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{formatJobType(job.job_type)}</span>
                        </div>

                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <Building className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{formatWorkMode(job.work_mode)}</span>
                        </div>

                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                          <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate">{job.experience_level || 'Entry'} Level</span>
                        </div>
                      </div>

                      {/* Bottom Footer Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => navigate(`/recruiter/applicants?jobId=${job.id}`)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-100 dark:border-blue-500/20"
                          >
                            <Inbox className="w-4 h-4" />
                            <span>{job.applications_count ?? 0} Candidate Applications</span>
                          </button>

                          {isOwner && (
                            <button
                              onClick={() => handleOpenAssignmentModal(job)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{job.assigned_recruiter_ids?.length || 0} Recruiters Assigned</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(`/jobs/${job.id}`)}
                            className="rounded-xl font-bold text-xs"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" /> View Listing
                          </Button>

                          {isOwner && (status === 'draft' || status === 'open') && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => navigate(`/recruiter/jobs/${job.id}/edit`)}
                              className="rounded-xl font-bold text-xs"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit Job
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <Pagination
                currentPage={pageParam}
                totalCount={jobData.total}
                pageSize={pageSizeParam}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      )}

      {/* Manage Recruiter Access Modal */}
      {assignmentModalOpen && selectedJobForAssignments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <Card className="max-w-md w-full p-6 sm:p-8 bg-white dark:bg-[#0d1017] border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Manage Recruiter Access</h3>
                  <p className="text-xs text-slate-400 font-medium truncate max-w-[240px]">{selectedJobForAssignments.title}</p>
                </div>
              </div>
              <button
                onClick={() => setAssignmentModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {recruitersLoading ? (
              <div className="py-8 text-center flex items-center justify-center gap-2 text-slate-400">
                <Spinner size="md" />
                <span className="text-xs font-semibold">Loading company recruiters...</span>
              </div>
            ) : companyRecruiters.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No recruiters found in your company profile.</p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {companyRecruiters.map(recruiter => {
                  const isAssigned = assignedRecruiterIds.includes(recruiter.id);
                  return (
                    <div
                      key={recruiter.id}
                      onClick={() => toggleModalRecruiter(recruiter.id)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                        isAssigned
                          ? 'bg-blue-50/60 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-900 dark:text-blue-100'
                          : 'bg-slate-50/40 dark:bg-slate-800/30 border-slate-150 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isAssigned ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {recruiter.name?.charAt(0) || 'R'}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{recruiter.name}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{recruiter.email}</p>
                        </div>
                      </div>
                      <div>
                        {isAssigned ? (
                          <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setAssignmentModalOpen(false)}
                disabled={assignmentSaving}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSaveAssignments}
                isLoading={assignmentSaving}
                disabled={assignmentSaving}
                className="rounded-xl font-bold"
              >
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ManageJobs;
