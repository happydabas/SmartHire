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
  ChevronRight,
  Download
} from 'lucide-react';
import { applicationService } from '@/services/applications/applicationService';
import { formatDate } from '@/utils/formatDate';

import Pagination from '@/components/ui/Pagination';
import DataTable from '@/components/ui/DataTable';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/common/EmptyState';
import EmptyApplicants from '@/components/common/EmptyApplicants';
import Toast from '@/components/ui/Toast';
import PageHeader from '@/components/ui/PageHeader';
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

  // Resume PDF Modal state
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const [selectedAppForResume, setSelectedAppForResume] = useState(null);
  const [pdfViewUrl, setPdfViewUrl] = useState(null);
  const [resumeLoading, setResumeLoading] = useState(false);

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

  const handleViewResume = async (row) => {
    if (!row?.id) {
      triggerToast('No resume file associated with this candidate profile.', 'warning');
      return;
    }

    try {
      setSelectedAppForResume(row);
      setIsResumeModalOpen(true);
      setResumeLoading(true);
      if (pdfViewUrl) URL.revokeObjectURL(pdfViewUrl);
      setPdfViewUrl(null);

      const url = await applicationService.getResumeFileUrl(row.id);
      setPdfViewUrl(url);
    } catch (err) {
      console.error("Failed to load applicant resume PDF:", err);
      triggerToast('Failed to load candidate PDF resume document.', 'error');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleCloseResumeModal = () => {
    setIsResumeModalOpen(false);
    if (pdfViewUrl) {
      URL.revokeObjectURL(pdfViewUrl);
    }
    setPdfViewUrl(null);
    setSelectedAppForResume(null);
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
          <div className="flex items-center gap-3.5 py-1 group-hover:text-blue-600 transition-colors">
            <Avatar
              src={candidate.profile?.profile_picture}
              name={candidate.name}
              size="md"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm leading-snug truncate">
                {candidate.name}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 mt-0.5 truncate">
                <Mail className="w-3.5 h-3.5 shrink-0 text-slate-400 dark:text-slate-500" />
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
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[220px]">
          {row.job?.title || 'Unknown Job'}
        </span>
      )
    },
    {
      header: 'Match Score (Soon)',
      key: 'matchScore',
      align: 'center',
      render: (row) => (
        <div className="inline-flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300">
          <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-xs font-black">{row.matchScore}%</span>
          <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1 rounded">Soon</span>
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
      align: 'right',
      render: (row) => (
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {formatDate(row.applied_at || row.created_at)}
        </span>
      )
    }
  ];

  // Mobile card view custom renderer
  const renderMobileCard = (row, index) => {
    const candidate = row.candidate || {};

    return (
      <Card 
        key={row.id} 
        onClick={() => navigate(`/recruiter/applications/${row.id}`)}
        className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] shadow-sm space-y-4 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all group"
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={candidate.profile?.profile_picture}
              name={candidate.name}
              size="md"
            />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 text-sm leading-snug transition-colors">{candidate.name}</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">{candidate.email}</p>
            </div>
          </div>
          <StageBadge stage={row.status} />
        </div>

        <div className="grid grid-cols-2 gap-y-2 gap-x-4 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-semibold text-slate-500">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase tracking-wider">Applied Job</span>
            <span className="text-slate-800 dark:text-slate-200 truncate block max-w-[130px] font-bold">{row.job?.title || 'Unknown Job'}</span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase tracking-wider">Match Score (Soon)</span>
            <span className="text-slate-700 dark:text-slate-300 font-extrabold flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>{row.matchScore}%</span>
              <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-1 rounded ml-0.5">Soon</span>
            </span>
          </div>
          <div>
            <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase tracking-wider">Applied On</span>
            <span className="text-slate-600 dark:text-slate-400">{formatDate(row.applied_at || row.created_at)}</span>
          </div>
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
      <PageHeader
        title="Review Applicants"
        subtitle="Examine match scores, parse candidate qualifications, and schedule recruitment screenings."
      />

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
      <Card className="p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-5">
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

        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
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
          <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
            <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-0.5 select-none">Active Filters:</span>
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                onClear={() => handleRemoveFilter(filter.key)}
              />
            ))}
            <button
              onClick={handleClearAllFilters}
              className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline pl-1 focus:outline-none"
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
                onRowClick={(row) => navigate(`/recruiter/applications/${row.id}`)}
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

      {/* View Candidate Resume PDF Viewer Modal */}
      <Modal 
        isOpen={isResumeModalOpen} 
        onClose={handleCloseResumeModal} 
        title={selectedAppForResume?.candidate?.name ? `${selectedAppForResume.candidate.name}'s Resume` : 'Candidate Resume'}
        headerActions={
          <div className="flex items-center gap-2">
            {pdfViewUrl && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => window.open(pdfViewUrl, '_blank')} 
                className="rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800"
              >
                <Eye className="w-3.5 h-3.5" /> Fullscreen PDF
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                if (selectedAppForResume?.id) {
                  const name = selectedAppForResume.resume?.resume_file_name || selectedAppForResume.resume?.file_name || `${selectedAppForResume.candidate?.name || 'candidate'}_resume.pdf`;
                  applicationService.downloadResume(selectedAppForResume.id, name);
                }
              }} 
              className="rounded-xl text-xs font-bold flex items-center gap-1.5 bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800"
            >
              <Download className="w-3.5 h-3.5" /> Download
            </Button>
          </div>
        }
        className="max-w-5xl"
      >
        <div className="w-full h-[75vh]">
          {resumeLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-3">
              <Spinner className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading candidate resume PDF...</p>
            </div>
          ) : pdfViewUrl ? (
            <object
              data={pdfViewUrl}
              type="application/pdf"
              className="w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-inner overflow-hidden"
            >
              <embed
                src={pdfViewUrl}
                type="application/pdf"
                className="w-full h-full rounded-2xl"
              />
              <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Your browser does not render inline PDF documents.
                </p>
                <Button variant="primary" onClick={() => window.open(pdfViewUrl, '_blank')}>
                  Open PDF in New Window
                </Button>
              </div>
            </object>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2 text-center">
              <FileText className="w-10 h-10 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No resume file associated with this candidate profile or preview unavailable.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Applicants;
