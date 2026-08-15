import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminJobService } from '@/services/adminJobService';
import JobsTable from '@/components/admin/jobs/JobsTable';
import JobSearch from '@/components/admin/jobs/JobSearch';
import JobFilters from '@/components/admin/jobs/JobFilters';
import JobPagination from '@/components/admin/jobs/JobPagination';
import { AlertCircle, RotateCcw, Briefcase, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

export function JobModeration() {
  const navigate = useNavigate();

  // State managers
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [type, setType] = useState('all');
  const [company, setCompany] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch company filters on mount
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const compList = await adminJobService.getCompaniesList();
        setCompanies(compList || []);
      } catch (err) {
        console.error('Failed to load companies list:', err);
      }
    };
    loadCompanies();
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminJobService.getJobs({
        page: currentPage,
        limit: 10,
        search,
        status,
        type,
        company
      });
      setJobs(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Could not retrieve job directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, status, type, company]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(1);
  };

  const handleStatusChange = (statusVal) => {
    setStatus(statusVal);
    setCurrentPage(1);
  };

  const handleTypeChange = (typeVal) => {
    setType(typeVal);
    setCurrentPage(1);
  };

  const handleCompanyChange = (compVal) => {
    setCompany(compVal);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/admin/jobs/${id}`);
  };

  const handleApprove = async (id) => {
    try {
      await adminJobService.approveJob(id);
      toast.success('Job listing approved successfully');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to approve job listing');
    }
  };

  const handleReject = async (id) => {
    try {
      await adminJobService.rejectJob(id);
      toast.success('Job listing rejected successfully');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to reject job listing');
    }
  };

  const handleRemove = async (id) => {
    try {
      await adminJobService.removeJob(id);
      toast.success('Job listing removed successfully');
      fetchJobs();
    } catch (err) {
      toast.error('Failed to remove job listing');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('all');
    setType('all');
    setCompany('all');
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || status !== 'all' || type !== 'all' || company !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title Header */}
      <PageHeader
        title="Job Moderation"
        subtitle="Moderate pending job postings, approve active listings, and close open vacancies."
      />

      {/* Main filter container card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        
        {/* Searches and filters */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <JobSearch onSearch={handleSearch} />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <JobFilters
              statusFilter={status}
              typeFilter={type}
              companyFilter={company}
              companies={companies}
              onStatusChange={handleStatusChange}
              onTypeChange={handleTypeChange}
              onCompanyChange={handleCompanyChange}
            />
            {isFiltered && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="rounded-xl font-black text-xs px-4 py-2.5 border-slate-200 text-slate-500 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5 mr-1.5" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Content list block */}
        <div className="pt-2">
          {error ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-rose-100 rounded-2xl dark:bg-slate-900 dark:border-rose-950/20">
              <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30 animate-bounce">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                Loading Error
              </h3>
              <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
                {error}
              </p>
              <Button variant="primary" onClick={fetchJobs} className="rounded-xl font-black px-6 py-2.5">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : !loading && jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 dark:bg-slate-800">
                <Briefcase className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                No Jobs Found
              </h3>
              <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
                No job vacancies match the current search filters.
              </p>
              {isFiltered && (
                <Button variant="primary" onClick={handleClearFilters} className="rounded-xl font-black px-6 py-2.5">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-slate-100 rounded-2xl overflow-hidden dark:border-slate-800">
              <JobsTable
                jobs={jobs}
                loading={loading}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
                onRemove={handleRemove}
              />
            </div>
          )}
        </div>

        {/* Pagination indicator */}
        {!loading && !error && jobs.length > 0 && (
          <JobPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default JobModeration;
