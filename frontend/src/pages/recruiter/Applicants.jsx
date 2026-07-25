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

import Pagination from '@/components/ui/Pagination';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import EmptyApplicants from '@/components/common/EmptyApplicants';
import Toast from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import ActionMenu from '@/components/ui/ActionMenu';
import SkeletonTable from '@/components/common/SkeletonTable';
import StageBadge from '@/components/ats/StageBadge';
import ApplicantSearch from '@/components/ats/ApplicantSearch';
import ApplicantFilters from '@/components/ats/ApplicantFilters';
import ApplicantSort from '@/components/ats/ApplicantSort';
import FilterChip from '@/components/ats/FilterChip';
import { STAGE_LABELS } from '@/constants/ats';

export function Applicants() {
  const navigate = useNavigate();
  
  // URL parameters sync hook
  const [searchParams, setSearchParams] = useSearchParams();

  // Search/Filters states from URL params
  const searchParam = searchParams.get('search') || '';
  const statusParam = searchParams.get('status') || '';
  const jobIdParam = searchParams.get('jobId') || '';
  const sortParam = searchParams.get('sort') || 'latest';
  const dateFilterParam = searchParams.get('dateFilter') || '';
  const startDateParam = searchParams.get('startDate') || '';
  const endDateParam = searchParams.get('endDate') || '';
  const pageParam = Number(searchParams.get('page')) || 1;
  const pageSizeParam = Number(searchParams.get('pageSize')) || 10;

  // Listing data states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appsData, setAppsData] = useState({ items: [], total: 0 });
  const [jobsList, setJobsList] = useState([]);
  
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('info');

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

  const fetchApplications = async (forceRefetch = false) => {
    try {
      setLoading(true);
      setError(null);
      const data = await applicationService.getRecruiterApplications({
        search: searchParam,
        status: statusParam,
        jobId: jobIdParam,
        sort: sortParam,
        dateFilter: dateFilterParam,
        startDate: startDateParam,
        endDate: endDateParam,
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
  }, [searchParam, statusParam, jobIdParam, sortParam, dateFilterParam, startDateParam, endDateParam, pageParam, pageSizeParam]);

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
      if (id === 'dateFilter' && value !== 'custom') {
        prev.delete('startDate');
        prev.delete('endDate');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSearchChange = (value) => {
    setSearchParams(prev => {
      if (value.trim()) {
        prev.set('search', value.trim());
      } else {
        prev.delete('search');
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

  const handleRemoveFilter = (key) => {
    setSearchParams(prev => {
      prev.delete(key);
      if (key === 'dateFilter') {
        prev.delete('startDate');
        prev.delete('endDate');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleClearAllFilters = () => {
    setSearchParams({
      page: '1',
      pageSize: String(pageSizeParam)
    });
  };

  // Compute active filters list for chips
  const activeFilters = [];
  if (statusParam) {
    activeFilters.push({
      key: 'status',
      label: `Stage: ${STAGE_LABELS[statusParam.toLowerCase()] || statusParam}`
    });
  }
  if (jobIdParam) {
    const job = jobsList.find(j => String(j.id) === String(jobIdParam));
    activeFilters.push({
      key: 'jobId',
      label: `Job: ${job?.title || 'Selected Job'}`
    });
  }
  if (dateFilterParam) {
    let dateLabel = '';
    if (dateFilterParam === 'today') dateLabel = 'Today';
    else if (dateFilterParam === '7days') dateLabel = 'Last 7 Days';
    else if (dateFilterParam === '30days') dateLabel = 'Last 30 Days';
    else if (dateFilterParam === 'custom') {
      dateLabel = `Custom: ${startDateParam || '...'} to ${endDateParam || '...'}`;
    }
    activeFilters.push({
      key: 'dateFilter',
      label: `Date: ${dateLabel}`
    });
  }

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
      header: 'Current Stage',
      key: 'status',
      render: (row) => (
        <StageBadge stage={row.status} />
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
          <StageBadge stage={row.status} />
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
        <div className="flex items-center justify-between p-4 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchApplications(true)}
            className="text-blue-600 hover:text-blue-700 underline font-bold"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Search, Filters, and Sorting card */}
      <Card className="p-5 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Search Input (takes 2 cols on md+) */}
          <div className="md:col-span-2">
            <ApplicantSearch
              initialValue={searchParam}
              onSearchChange={handleSearchChange}
              disabled={loading && appsData.items.length === 0}
            />
          </div>
          {/* Sorting */}
          <div>
            <ApplicantSort
              value={sortParam}
              onSortChange={handleSortChange}
              disabled={loading && appsData.items.length === 0}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <ApplicantFilters
            jobsList={jobsList}
            selectedJob={jobIdParam}
            selectedStage={statusParam}
            selectedDateFilter={dateFilterParam}
            startDate={startDateParam}
            endDate={endDateParam}
            onFilterChange={handleFilterChange}
            disabled={loading && appsData.items.length === 0}
          />
        </div>

        {/* Filter Summary Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 animate-fadeIn">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider pl-0.5 select-none">Active Filters:</span>
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                onClear={() => handleRemoveFilter(filter.key)}
              />
            ))}
            <button
              onClick={handleClearAllFilters}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline pl-1 focus:outline-none"
            >
              Clear All
            </button>
          </div>
        )}
      </Card>

      {/* Main Content Listings */}
      {loading && appsData.items.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
          <SkeletonTable rows={pageSizeParam} cols={5} />
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
            searchParam || statusParam || jobIdParam || dateFilterParam ? (
              <EmptyState
                title="No applicants match your search."
                description="We couldn't find any candidate profiles matching your active search/filter criteria. Try resetting them."
                icon={Inbox}
                primaryButton={{
                  label: "Clear All Filters",
                  onClick: handleClearAllFilters
                }}
                secondaryButton={{
                  label: "Reset Search",
                  onClick: () => handleRemoveFilter('search')
                }}
                className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100 animate-fadeIn"
              />
            ) : (
              <EmptyApplicants />
            )
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
