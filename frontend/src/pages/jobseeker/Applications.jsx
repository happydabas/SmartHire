import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  User,
  XCircle,
  Building,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';
import { useAuth } from '@/hooks/useAuth';
import { notificationService } from '@/services/notificationService';

// Reusable UI components
import Card from '@/components/ui/Card';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import EmptyApplications from '@/components/common/EmptyApplications';
import Modal from '@/components/ui/Modal';
import SkeletonCard from '@/components/common/SkeletonCard';

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search & Filter & Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recently_applied');
  const [filters, setFilters] = useState({
    status: '',
    employment_type: '',
    company: '',
  });

  // Extract unique companies & statuses for filters
  const [availableCompanies, setAvailableCompanies] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Withdrawal confirmation modal states
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState(null);

  // Application details modal states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedAppForDetails, setSelectedAppForDetails] = useState(null);
  const [modalHistory, setModalHistory] = useState([]);

  const fetchApplicationsList = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch user's full application history (using high limit to retrieve all items for client-side filtering)
      const data = await applicationService.getApplicationHistory({ page: 1, limit: 100 });
      const list = data?.items || [];
      setApplications(list);

      // Extract unique values
      const companies = Array.from(new Set(list.map(app => app.job?.company_name).filter(Boolean)));
      const statuses = Array.from(new Set(list.map(app => app.status).filter(Boolean)));
      
      setAvailableCompanies(companies);
      setAvailableStatuses(statuses);
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError("Failed to retrieve your job applications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationsList();
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
      status: '',
      employment_type: '',
      company: '',
    });
    setSortBy('recently_applied');
  };

  const handleTriggerWithdraw = (app) => {
    setAppToWithdraw(app);
    setIsWithdrawOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!appToWithdraw || actionLoading) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      
      const targetApp = appToWithdraw;
      await applicationService.withdrawApplication(targetApp.id);
      
      setSuccess("Application withdrawn successfully.");
      setIsWithdrawOpen(false);
      setAppToWithdraw(null);
      await fetchApplicationsList();

      // Trigger notification process in a non-blocking background thread
      notificationService.notifyApplicationWithdrawn(targetApp.id, targetApp.job, user)
        .catch(err => console.error("Notification withdrawal trigger error:", err));
    } catch (err) {
      console.error("Withdraw application error:", err);
      setError("Failed to withdraw the application. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardClick = async (app) => {
    if (!app) return;
    setSelectedAppForDetails(app);
    setIsDetailsOpen(true);
    try {
      const historyLogs = await applicationService.getApplicationStatusHistory(app.id);
      setModalHistory(historyLogs || []);
    } catch (err) {
      console.error("Failed to load status history:", err);
      setModalHistory([]);
    }
  };

  const handleViewJobPost = (app) => {
    setIsDetailsOpen(false);
    let targetJobId = app?.job?.id || app?.job_id || app?.id;
    if (targetJobId === undefined || targetJobId === null || targetJobId === '') {
      targetJobId = 1;
    }
    navigate(`/jobs/${targetJobId}`);
  };

  // Maps application status to UI Badge color variant
  const getStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('hire') || s === 'hired') return 'success';
    if (s.includes('reject') || s.includes('decline') || s === 'rejected' || s === 'withdrawn') return 'danger';
    if (s.includes('interview') || s.includes('technical') || s.includes('hr') || s.includes('round') || s.includes('schedule')) return 'warning';
    if (s.includes('offer') || s === 'shortlisted') return 'primary';
    if (s === 'applied' || s === 'under review') return 'info';
    return 'neutral';
  };

  // Perform client-side filter & sort logic
  const getProcessedApplications = () => {
    let result = [...applications];

    // 1. Search Query Filter (Job Title & Company Name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(app => 
        (app.job?.title || '').toLowerCase().includes(q) ||
        (app.job?.company_name || '').toLowerCase().includes(q)
      );
    }

    // 2. Metadata Filters
    if (filters.status) {
      result = result.filter(app => app.status === filters.status);
    }

    if (filters.employment_type) {
      result = result.filter(app => {
        const type = app.job?.job_type || '';
        return type.toLowerCase() === filters.employment_type.toLowerCase();
      });
    }

    if (filters.company) {
      result = result.filter(app => app.job?.company_name === filters.company);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.applied_at) - new Date(b.applied_at);
      }
      if (sortBy === 'company_name') {
        const companyA = (a.job?.company_name || '').toLowerCase();
        const companyB = (b.job?.company_name || '').toLowerCase();
        return companyA.localeCompare(companyB);
      }
      if (sortBy === 'job_title') {
        const titleA = (a.job?.title || '').toLowerCase();
        const titleB = (b.job?.title || '').toLowerCase();
        return titleA.localeCompare(titleB);
      }
      if (sortBy === 'last_updated') {
        return new Date(b.updated_at) - new Date(a.updated_at);
      }
      // default: recently_applied (sort by applied_at descending)
      return new Date(b.applied_at) - new Date(a.applied_at);
    });

    return result;
  };

  const processedApps = getProcessedApplications();



  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col space-y-4">
        <PageHeader
          title="Job Applications"
          subtitle="Review, filter, and track status updates for all applications you submitted to employers."
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
              placeholder="Search by job title or company name..."
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
                <option value="recently_applied">Recently Applied</option>
                <option value="oldest">Oldest Applications</option>
                <option value="company_name">Company Name</option>
                <option value="job_title">Job Title</option>
                <option value="last_updated">Last Updated</option>
              </select>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetFilters}
              className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all capitalize"
            >
              <option value="">All Statuses</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</label>
            <select
              id="company"
              value={filters.company}
              onChange={handleFilterChange}
              className="block w-full bg-white dark:bg-[#090a0f] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="">All Companies</option>
              {availableCompanies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

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
        </div>
      </Card>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyApplications />
      ) : processedApps.length === 0 ? (
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
            description="We couldn't find any applications matching your active filter criteria. Try resetting them."
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
          {processedApps.map((app) => {
            const isWithdrawn = app.status?.toLowerCase() === 'withdrawn';
            const isRejected = app.status?.toLowerCase() === 'rejected';
            const isInactive = isWithdrawn || isRejected;

            return (
              <Card 
                key={app.id} 
                className="flex flex-col justify-between p-6 hover:shadow-md hover:border-slate-250/80 dark:hover:border-slate-700/80 transition-all duration-200 border border-slate-150/60 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-2xl"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 
                          className="font-semibold text-slate-800 text-lg hover:text-blue-600 cursor-pointer transition-colors leading-snug truncate max-w-[220px] dark:text-white"
                          onClick={() => handleCardClick(app)}
                          title={app.job?.title}
                        >
                          {app.job?.title || 'Unknown Role'}
                        </h3>
                      </div>

                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 truncate" title={app.job?.company_name}>
                        {app.job?.company_name || 'Unknown Company'}
                      </p>
                    </div>

                    {/* Logo Placeholder */}
                    <div className="w-11 h-11 bg-blue-500/10 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 border border-blue-500/20 shadow-inner">
                      {(app.job?.company_name || 'C')[0]}
                    </div>
                  </div>

                  {/* Metadata labels */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-550 dark:text-slate-300 text-xs bg-slate-50 dark:bg-[#090a0f] px-2.5 py-1 rounded-xl border border-slate-100 dark:border-slate-800/80 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{app.job?.location || 'Unknown Location'}</span>
                    </div>

                    {app.job?.job_type && (
                      <Badge variant="info" className="uppercase text-[9px] font-medium py-1 px-2.5 rounded-xl border border-blue-100/30">
                        {app.job.job_type}
                      </Badge>
                    )}

                    <Badge variant={getStatusVariant(app.status)} className="capitalize text-[10px] font-medium py-1 px-2.5 rounded-xl border border-slate-100/50">
                      {app.status}
                    </Badge>
                  </div>
                </div>

                {/* Date tracking info */}
                <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-400 pt-4 border-t border-slate-50 mt-5">
                  <div className="flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Applied {formatDate(app.applied_at)}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium justify-end">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>Updated {formatDate(app.updated_at)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between gap-3 mt-5">
                  {!isInactive ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTriggerWithdraw(app)}
                      disabled={actionLoading}
                      className="rounded-xl border border-red-100/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-955/20 dark:border-red-950/20 font-semibold py-2 px-4 text-xs"
                      title="Withdraw Application"
                    >
                      Withdraw
                    </Button>
                  ) : (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold italic py-2">
                      Inactive Application
                    </div>
                  )}

                  <button
                    onClick={() => handleCardClick(app)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-all cursor-pointer"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      <Modal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        title="Withdraw Job Application"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to withdraw your application for the <strong>{appToWithdraw?.job?.title}</strong> role at <strong>{appToWithdraw?.job?.company_name}</strong>?
          </p>
          <p className="text-xs text-red-500 font-semibold bg-red-50 p-3 border border-red-100 rounded-xl">
            Important: Withdrawing this application is permanent. You will no longer be considered for this opening, and you cannot re-apply to this exact job listing.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsWithdrawOpen(false)}
              disabled={actionLoading}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleWithdrawConfirm}
              isLoading={actionLoading}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold"
            >
              Confirm Withdraw
            </Button>
          </div>
        </div>
      </Modal>

      {/* Application Details Modal */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Application Details"
      >
        {selectedAppForDetails && (
          <div className="space-y-6">
            {/* Job & Company Header Card */}
            <div className="p-4 bg-slate-50 dark:bg-[#0c0d14] rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <h3 className="text-base font-bold text-slate-800 dark:text-white truncate">
                  {selectedAppForDetails.job?.title || 'Unknown Role'}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  {selectedAppForDetails.job?.company_name || 'Unknown Company'}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedAppForDetails.job?.location || 'Location Not Specified'}
                  </span>
                  <Badge variant={getStatusVariant(selectedAppForDetails.status)} className="capitalize text-[10px] font-bold">
                    {selectedAppForDetails.status}
                  </Badge>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleViewJobPost(selectedAppForDetails)}
                className="rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              >
                <span>View Job</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Pipeline History Timeline Section (Matching Recruiter UI) */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Hiring Pipeline History
                </h4>
                <span className="text-[10px] font-bold text-slate-400">
                  Real-time status
                </span>
              </div>

              {/* Status Alert for Rejected/Withdrawn */}
              {selectedAppForDetails.status?.toLowerCase() === 'rejected' && (
                <div className="p-3 bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>The hiring team has closed consideration for this application.</span>
                </div>
              )}
              {selectedAppForDetails.status?.toLowerCase() === 'withdrawn' && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
                  <span>You withdrew this job application.</span>
                </div>
              )}

              <div className="space-y-6 pt-2">
                {[
                  { key: 'applied', label: 'Applied', defaultSub: 'Application submitted by candidate' },
                  { key: 'screening', label: 'Screening', defaultSub: 'Resume & profile screening' },
                  { key: 'interview', label: 'Technical Interview', defaultSub: 'Technical assessment & discussion' },
                  { key: 'selected', label: 'HR Interview', defaultSub: 'Final interview & selection' },
                  { key: 'offer', label: 'Offer', defaultSub: 'Offer letter extended' },
                  { key: 'hired', label: 'Hired', defaultSub: 'Candidate hired' }
                ].map((stage, idx, arr) => {
                  const normStatus = (selectedAppForDetails.status || 'applied').toLowerCase();
                  let normalizedCurrent = 'applied';
                  if (['applied', 'submitted'].includes(normStatus)) normalizedCurrent = 'applied';
                  else if (['screening', 'under review', 'review', 'shortlisted'].includes(normStatus)) normalizedCurrent = 'screening';
                  else if (['interview', 'technical round', 'technical interview'].includes(normStatus)) normalizedCurrent = 'interview';
                  else if (['selected', 'hr round', 'hr interview'].includes(normStatus)) normalizedCurrent = 'selected';
                  else if (['offer', 'extended'].includes(normStatus)) normalizedCurrent = 'offer';
                  else if (['hired', 'accepted'].includes(normStatus)) normalizedCurrent = 'hired';

                  const stageKeys = arr.map(s => s.key);
                  const currentIndex = stageKeys.indexOf(normalizedCurrent) !== -1 ? stageKeys.indexOf(normalizedCurrent) : 0;
                  const isRejected = normStatus === 'rejected';
                  const isWithdrawn = normStatus === 'withdrawn';

                  const isCompleted = idx < currentIndex && !isRejected && !isWithdrawn;
                  const isCurrent = idx === currentIndex && !isRejected && !isWithdrawn;
                  const isUpcoming = idx > currentIndex || isRejected || isWithdrawn;

                  const historyLog = modalHistory.find(h => (h.status || '').toLowerCase() === stage.key);
                  const timestamp = historyLog?.updated_at || (stage.key === 'applied' ? selectedAppForDetails.applied_at : (isCurrent ? selectedAppForDetails.updated_at : null));

                  let formattedTime = '';
                  if (timestamp) {
                    try {
                      const date = new Date(timestamp);
                      if (!isNaN(date.getTime())) {
                        formattedTime = new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        }).format(date);
                      }
                    } catch (e) {
                      formattedTime = '';
                    }
                  }

                  let subText = stage.defaultSub;
                  if (historyLog?.recruiter_name) {
                    subText = `Moved by ${historyLog.recruiter_name}`;
                  } else if (stage.key === 'applied') {
                    subText = 'Application submitted by candidate';
                  } else if (isUpcoming) {
                    subText = stage.key === 'interview' || stage.key === 'selected' ? 'Not scheduled yet' : 'Pending';
                  }

                  return (
                    <div key={stage.key} className="flex items-start gap-4 relative">
                      {/* Timeline Vertical Connecting Line */}
                      {idx < arr.length - 1 && (
                        <div 
                          className={`absolute left-[11px] top-6 bottom-0 w-0.5 z-0 ${
                            idx < currentIndex && !isRejected && !isWithdrawn ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'
                          }`}
                        />
                      )}

                      {/* Circle Node Container */}
                      <div className="z-10 shrink-0 w-6 h-6 flex items-center justify-center mt-0.5">
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : isCurrent ? (
                          <div className="w-6 h-6 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-950 flex items-center justify-center shadow-sm">
                            <div className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" />
                        )}
                      </div>

                      {/* Stage Text Content */}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs font-black ${isCurrent ? 'text-slate-900 dark:text-white' : (isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500')}`}>
                            {stage.label}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded-md">
                              Current Stage
                            </span>
                          )}
                        </div>

                        {formattedTime && (
                          <p className="text-[10.5px] font-bold text-slate-400 dark:text-slate-500">
                            {formattedTime}
                          </p>
                        )}

                        <p className={`text-xs font-semibold ${isCurrent || isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500 italic'}`}>
                          {subText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}

export default ApplicationsPage;
