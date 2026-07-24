import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  User,
  Mail,
  Briefcase,
  FileText,
  Eye,
  SlidersHorizontal,
  FileDown,
  MessageSquare,
  AlertCircle,
  Inbox,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import SearchBar from '@/components/ui/SearchBar';
import FilterDropdown from '@/components/ui/FilterDropdown';
import SortDropdown from '@/components/ui/SortDropdown';
import Pagination from '@/components/ui/Pagination';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import ActionMenu from '@/components/ui/ActionMenu';

export function Applicants() {
  const navigate = useNavigate();
  
  // URL parameters sync hook
  const [searchParams, setSearchParams] = useSearchParams();

  // Search/Filters states from URL params
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const jobIdParam = searchParams.get('jobId') || '';
  const sortParam = searchParams.get('sort') || 'latest';
  const pageParam = Number(searchParams.get('page')) || 1;
  const pageSizeParam = Number(searchParams.get('pageSize')) || 10;

  // Search input state (for debouncing)
  const [searchInput, setSearchInput] = useState(searchParam);

  // Listing data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appsData, setAppsData] = useState({ items: [], total: 0 });
  const [jobsList, setJobsList] = useState([]);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

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

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Initial jobs list load (for the job filter dropdown)
  useEffect(() => {
    const loadJobsList = async () => {
      try {
        const data = await applicationService.getRecruiterJobsList();
        setJobsList(data);
      } catch (err) {
        console.error('Error fetching jobs filter list:', err);
      }
    };
    loadJobsList();
  }, []);

  // Main data fetch
  const fetchApplications = async (forceRefetch = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getRecruiterApplications({
        search: searchParam,
        status: statusParam,
        jobId: jobIdParam,
        sort: sortParam,
        page: pageParam,
        pageSize: pageSizeParam,
        forceRefetch
      });
      setAppsData(data);
    } catch (err) {
      console.error('Error fetching recruiter applications:', err);
      setError('Failed to fetch applicant list. Please verify your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Sync with URL parameter updates
  useEffect(() => {
    fetchApplications(false);
  }, [searchParam, statusParam, jobIdParam, sortParam, pageParam, pageSizeParam]);

  // Force refetch on mount
  useEffect(() => {
    fetchApplications(true);
  }, []);

  const triggerToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Update helpers
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

  // Status badges variant map
  const getStatusBadgeVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toUpperCase();
    if (s === 'APPLIED') return 'primary';
    if (s === 'SCREENING') return 'warning';
    if (s === 'INTERVIEW') return 'info';
    if (s === 'SELECTED') return 'success';
    if (s === 'REJECTED') return 'danger';
    return 'neutral';
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const s = status.toUpperCase();
    if (s === 'APPLIED') return 'Applied';
    if (s === 'SCREENING') return 'Screening';
    if (s === 'INTERVIEW') return 'Interview';
    if (s === 'SELECTED') return 'Selected';
    if (s === 'REJECTED') return 'Rejected';
    if (s === 'WITHDRAWN') return 'Withdrawn';
    return status;
  };

  const handleViewResume = (resume) => {
    if (resume?.resume_url_or_path) {
      window.open(resume.resume_url_or_path, '_blank');
    } else {
      triggerToast('No resume file associated with this candidate profile.', 'warning');
    }
  };

  // Actions configurations
  const getActions = (row) => [
    {
      label: 'View Applicant',
      icon: User,
      onClick: () => navigate(`/recruiter/applications/${row.id}`)
    },
    {
      label: 'Change Status',
      icon: SlidersHorizontal,
      onClick: () => navigate(`/recruiter/applications/${row.id}`)
    },
    {
      label: 'Recruiter Notes',
      icon: MessageSquare,
      onClick: () => navigate(`/recruiter/applications/${row.id}`)
    }
  ];

  // Desktop Table columns
  const columns = [
    {
      header: 'Applicant Name',
      key: 'candidate.name',
      render: (row) => {
        const candidate = row.candidate || {};
        return (
          <div className="flex items-center gap-3">
            <Avatar
              src={candidate.profile?.profile_picture}
              name={candidate.name}
              size="md"
            />
            <div className="flex flex-col">
              <span className="font-bold text-slate-800 text-sm leading-snug">{candidate.name}</span>
              <span className="text-[10.5px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 shrink-0" />
                {candidate.email}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Applied Job',
      key: 'job.title',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700">{row.job?.title || 'Unknown Job'}</span>
      )
    },
    {
      header: 'Match Score',
      key: 'matchScore',
      align: 'center',
      render: (row) => (
        <div className="flex items-center justify-center gap-1.5 bg-blue-50/50 border border-blue-100/50 px-2.5 py-1 rounded-xl text-blue-700">
          <Award className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="text-xs font-extrabold">{row.matchScore}%</span>
        </div>
      )
    },
    {
      header: 'Current Status',
      key: 'status',
      render: (row) => (
        <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize text-[10px] tracking-wide px-2.5">
          {getStatusLabel(row.status)}
        </Badge>
      )
    },
    {
      header: 'Applied Date',
      key: 'applied_at',
      render: (row) => (
        <span className="text-xs font-medium text-slate-400">{formatDate(row.applied_at || row.created_at)}</span>
      )
    },
    {
      header: 'Resume',
      key: 'resume',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleViewResume(row.resume)}
          className="rounded-lg text-xs py-1.5 px-3 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 font-bold"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>View Resume</span>
        </Button>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      render: (row) => {
        const actions = getActions(row);
        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => navigate(`/recruiter/applications/${row.id}`)}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="View Candidate Profile"
            >
              <Eye className="w-4 h-4" />
            </button>
            <ActionMenu actions={actions} />
          </div>
        );
      }
    }
  ];

  // Mobile card view custom renderer
  const renderMobileCard = (row, index) => {
    const candidate = row.candidate || {};
    const actions = getActions(row);

    return (
      <Card key={row.id} className="p-5 border border-slate-100 bg-white shadow-sm space-y-4 rounded-2xl">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={candidate.profile?.profile_picture}
              name={candidate.name}
              size="md"
            />
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-snug">{candidate.name}</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{candidate.email}</p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(row.status)} className="capitalize text-[10px] tracking-wide px-2.5">
            {getStatusLabel(row.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Applied Job</span>
            <span className="text-slate-700 truncate block max-w-[130px]">{row.job?.title || 'Unknown Job'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Match Score</span>
            <span className="text-blue-700 font-extrabold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-blue-500" />
              <span>{row.matchScore}%</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Applied On</span>
            <span className="text-slate-600">{formatDate(row.applied_at || row.created_at)}</span>
          </div>
        </div>

        {/* Mobile controls */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewResume(row.resume)}
            className="rounded-lg text-xs py-1.5 px-3 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 font-bold"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>View Resume</span>
          </Button>

          <ActionMenu actions={actions} />
        </div>
      </Card>
    );
  };

  const hasActiveFilters = searchParam || statusParam || jobIdParam;

  return (
    <div className="space-y-6 max-w-7xl mx-auto relative">
      {/* Toast popup */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Review Applicants</h1>
        <p className="text-slate-500 text-sm mt-1">Examine match scores, parse candidate qualifications, and schedule recruitment screenings.</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-3 p-4 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters panel */}
      <Card className="p-4 sm:p-5 border border-slate-100 bg-white rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-4">
          
          <div className="flex-grow max-w-lg">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 pl-0.5 select-none">Search Applicants</label>
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={() => setSearchInput('')}
              placeholder="Search by candidate name, job title, email..."
              disabled={loading && appsData.items.length === 0}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
              label="Filter by Job"
              value={jobIdParam}
              onChange={(e) => handleFilterChange('jobId', e.target.value)}
              options={jobsList.map(j => ({ label: j.title, value: String(j.id) }))}
              placeholder="All Jobs"
              disabled={loading && appsData.items.length === 0}
            />

            <FilterDropdown
              label="Application Status"
              value={statusParam}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={['Applied', 'Screening', 'Interview', 'Selected', 'Rejected', 'Withdrawn']}
              placeholder="All Statuses"
              disabled={loading && appsData.items.length === 0}
            />

            <SortDropdown
              value={sortParam}
              onChange={handleSortChange}
              options={[
                { label: 'Latest Applications', value: 'latest' },
                { label: 'Oldest Applications', value: 'oldest' },
                { label: 'Applicant Name (A-Z)', value: 'name' },
                { label: 'Match Score (High-Low)', value: 'score' }
              ]}
              disabled={loading && appsData.items.length === 0}
            />
          </div>

        </div>

        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50/50 px-3 py-2 rounded-xl self-start animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Active filters in use</span>
            <button
              onClick={handleClearAllFilters}
              className="font-bold underline ml-2 hover:text-blue-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </Card>

      {/* Main Content Listings */}
      {loading && appsData.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Spinner size="lg" />
          <p className="text-sm font-semibold text-slate-500 animate-pulse">Syncing candidate profile registries...</p>
        </div>
      ) : (
        <div className="relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl animate-fadeIn">
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xl flex items-center gap-2">
                <Spinner size="sm" />
                <span className="text-xs font-bold text-slate-600">Updating...</span>
              </div>
            </div>
          )}

          {appsData.total === 0 ? (
            <EmptyState
              title={hasActiveFilters ? "No matching applicants found" : "No applicants yet"}
              description={
                hasActiveFilters
                  ? "We couldn't find any candidate profiles matching your current search parameters. Try clearing search filters."
                  : "No candidates have submitted applications for your job listings yet. We will notify you when applications arrive."
              }
              icon={<Inbox className="w-12 h-12 text-slate-400" />}
              action={
                hasActiveFilters ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="rounded-xl font-bold"
                  >
                    Clear Search Filters
                  </Button>
                ) : null
              }
              className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100"
            />
          ) : (
            <div className="space-y-4 animate-in fade-in duration-200">
              <DataTable
                columns={columns}
                data={appsData.items}
                rowKey="id"
                renderMobileCard={renderMobileCard}
                emptyState={
                  <EmptyState
                    title="No applicants"
                    description="No applicants listed."
                    icon={<Inbox className="w-8 h-8" />}
                  />
                }
              />

              <Pagination
                currentPage={pageParam}
                totalCount={appsData.total}
                pageSize={pageSizeParam}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Applicants;
