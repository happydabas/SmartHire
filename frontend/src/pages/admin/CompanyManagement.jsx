import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCompanyService } from '@/services/adminCompanyService';
import CompaniesTable from '@/components/admin/companies/CompaniesTable';
import CompanySearch from '@/components/admin/companies/CompanySearch';
import CompanyFilters from '@/components/admin/companies/CompanyFilters';
import CompanyPagination from '@/components/admin/companies/CompanyPagination';
import { AlertCircle, RotateCcw, Building, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import { toast } from 'sonner';

export function CompanyManagement() {
  const navigate = useNavigate();

  // State managers
  const [companies, setCompanies] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [verification, setVerification] = useState('all');
  const [status, setStatus] = useState('all');
  const [industry, setIndustry] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch unique industries once on mount
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const indList = await adminCompanyService.getIndustriesList();
        setIndustries(indList || []);
      } catch (err) {
        console.error('Failed to load industries:', err);
      }
    };
    loadIndustries();
  }, []);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminCompanyService.getCompanies({
        page: currentPage,
        limit: 10,
        search,
        verification,
        status,
        industry
      });
      setCompanies(res.items || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load companies:', err);
      setError('Could not retrieve company listings directory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, verification, status, industry]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(1);
  };

  const handleVerificationChange = (verVal) => {
    setVerification(verVal);
    setCurrentPage(1);
  };

  const handleStatusChange = (statusVal) => {
    setStatus(statusVal);
    setCurrentPage(1);
  };

  const handleIndustryChange = (indVal) => {
    setIndustry(indVal);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleView = (id) => {
    navigate(`/admin/companies/${id}`);
  };

  const handleVerify = async (id) => {
    try {
      await adminCompanyService.verifyCompany(id);
      toast.success('Company verification approved successfully');
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to verify company');
    }
  };

  const handleSuspend = async (id) => {
    try {
      await adminCompanyService.suspendCompany(id);
      toast.success('Company account suspended successfully');
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to suspend company');
    }
  };

  const handleReactivate = async (id) => {
    try {
      await adminCompanyService.reactivateCompany(id);
      toast.success('Company account reactivated successfully');
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to reactivate company');
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminCompanyService.deleteCompany(id);
      toast.success('Company listing deleted successfully');
      fetchCompanies();
    } catch (err) {
      toast.error('Failed to delete company profile');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setVerification('all');
    setStatus('all');
    setIndustry('all');
    setCurrentPage(1);
  };

  const isFiltered = search !== '' || verification !== 'all' || status !== 'all' || industry !== 'all';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Heading Title */}
      <PageHeader
        title="Company Management"
        subtitle="Moderate corporate employer status, verify businesses, and audit jobs."
      />

      {/* Main Container Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
        
        {/* Filters and search header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <CompanySearch onSearch={handleSearch} />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <CompanyFilters
              verificationFilter={verification}
              statusFilter={status}
              industryFilter={industry}
              industries={industries}
              onVerificationChange={handleVerificationChange}
              onStatusChange={handleStatusChange}
              onIndustryChange={handleIndustryChange}
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

        {/* Dynamic content rendering */}
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
              <Button variant="primary" onClick={fetchCompanies} className="rounded-xl font-black px-6 py-2.5">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          ) : !loading && companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-100 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
              <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 dark:bg-slate-800">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                No Companies Found
              </h3>
              <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
                No corporate profiles match the current search filters.
              </p>
              {isFiltered && (
                <Button variant="primary" onClick={handleClearFilters} className="rounded-xl font-black px-6 py-2.5">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="border border-slate-100 rounded-2xl overflow-hidden dark:border-slate-800">
              <CompaniesTable
                companies={companies}
                loading={loading}
                onView={handleView}
                onVerify={handleVerify}
                onSuspend={handleSuspend}
                onReactivate={handleReactivate}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>

        {/* Paging links footer */}
        {!loading && !error && companies.length > 0 && (
          <CompanyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}

export default CompanyManagement;
