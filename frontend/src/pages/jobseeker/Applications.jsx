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
  Building
} from 'lucide-react';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';

export function ApplicationsPage() {
  const navigate = useNavigate();
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
      await applicationService.withdrawApplication(appToWithdraw.id);
      
      setSuccess("Application withdrawn successfully.");
      setIsWithdrawOpen(false);
      setAppToWithdraw(null);
      await fetchApplicationsList();
    } catch (err) {
      console.error("Withdraw application error:", err);
      setError("Failed to withdraw the application. Please try again later.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCardClick = (applicationId) => {
    navigate(`/applications/${applicationId}`);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading submitted applications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Applications</h1>
          <p className="text-slate-500 text-sm mt-1">Review, filter, and track status updates for all applications you submitted to employers.</p>
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

      {/* Control Panel: Search, Sort, Filter */}
      <Card className="p-6 border border-slate-100 shadow-sm space-y-5 bg-white">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-grow max-w-lg flex items-center">
            <Search className="absolute left-3 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by job title or company name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-slate-400"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By</span>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
              className="rounded-xl border border-slate-200 font-bold"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Filters Panel Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all capitalize"
            >
              <option value="">All Statuses</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company</label>
            <select
              id="company"
              value={filters.company}
              onChange={handleFilterChange}
              className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            >
              <option value="">All Companies</option>
              {availableCompanies.map(comp => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Employment Type</label>
            <select
              id="employment_type"
              value={filters.employment_type}
              onChange={handleFilterChange}
              className="block w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
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
      {processedApps.length === 0 ? (
        <EmptyState
          title="No Applications Found"
          description={
            searchQuery || filters.status || filters.employment_type || filters.company
              ? "No job applications match your current filters. Try resetting them."
              : "You haven't submitted any job applications yet. Review active job listings to apply!"
          }
          icon={<Briefcase className="w-12 h-12 text-slate-400" />}
          action={
            (searchQuery || filters.status || filters.employment_type || filters.company) ? (
              <Button variant="secondary" size="md" onClick={handleResetFilters} className="rounded-xl font-bold">
                Clear Filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedApps.map((app) => {
            const isWithdrawn = app.status?.toLowerCase() === 'withdrawn';
            const isRejected = app.status?.toLowerCase() === 'rejected';
            const isInactive = isWithdrawn || isRejected;

            return (
              <Card 
                key={app.id} 
                className="flex flex-col justify-between p-6 hover:shadow-2xl hover:border-slate-300 transition-all duration-200 border border-slate-100 bg-white"
              >
                <div className="space-y-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 
                          className="font-bold text-slate-800 text-lg hover:text-blue-600 cursor-pointer transition-colors leading-snug truncate max-w-[220px]"
                          onClick={() => handleCardClick(app.id)}
                          title={app.job?.title}
                        >
                          {app.job?.title || 'Unknown Role'}
                        </h3>
                      </div>

                      <p className="text-sm font-semibold text-slate-500 truncate" title={app.job?.company_name}>
                        {app.job?.company_name || 'Unknown Company'}
                      </p>
                    </div>

                    {/* Logo Placeholder */}
                    <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 border border-blue-100/50 shadow-inner">
                      {(app.job?.company_name || 'C')[0]}
                    </div>
                  </div>

                  {/* Metadata labels */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{app.job?.location || 'Unknown Location'}</span>
                    </div>

                    {app.job?.job_type && (
                      <Badge variant="info" className="uppercase text-[9px] font-bold py-1 px-2.5 rounded-xl border border-blue-100/30">
                        {app.job.job_type}
                      </Badge>
                    )}

                    <Badge variant={getStatusVariant(app.status)} className="capitalize text-[10px] font-bold py-1 px-2.5 rounded-xl border border-slate-100/50">
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
                      className="rounded-xl border border-red-50 text-red-500 hover:bg-red-50 font-bold py-2 px-4 text-xs"
                      title="Withdraw Application"
                    >
                      Withdraw
                    </Button>
                  ) : (
                    <div className="text-[10px] text-slate-400 font-bold italic py-2">
                      Inactive Application
                    </div>
                  )}

                  <button
                    onClick={() => handleCardClick(app.id)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-all"
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
    </div>
  );
}

export default ApplicationsPage;
