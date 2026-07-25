import React, { useState, useEffect, useCallback } from 'react';
import { adminAnalyticsService } from '@/services/adminAnalyticsService';
import SummaryCard from '@/components/admin/analytics/SummaryCard';
import UserGrowthChart from '@/components/admin/analytics/UserGrowthChart';
import CompanyGrowthChart from '@/components/admin/analytics/CompanyGrowthChart';
import JobStatisticsChart from '@/components/admin/analytics/JobStatisticsChart';
import ApplicationsChart from '@/components/admin/analytics/ApplicationsChart';
import TopCompaniesTable from '@/components/admin/analytics/TopCompaniesTable';
import TopJobsTable from '@/components/admin/analytics/TopJobsTable';
import AnalyticsFilters from '@/components/admin/analytics/AnalyticsFilters';
import ExportReportsButton from '@/components/admin/analytics/ExportReportsButton';
import AnalyticsSkeleton from '@/components/admin/analytics/AnalyticsSkeleton';
import { Users, Building, Briefcase, FileText, AlertCircle, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('last_30_days');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminAnalyticsService.getAnalyticsData(dateRange);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics dashboard:', err);
      setError('Could not retrieve analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExport = async () => {
    await adminAnalyticsService.exportReport('csv');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title block with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">
            Analytics & Reports
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-2 dark:text-slate-400">
            Monitor registration trends, job openings, and applications volume activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AnalyticsFilters value={dateRange} onChange={setDateRange} />
          <ExportReportsButton onExport={handleExport} />
        </div>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-rose-100 rounded-3xl dark:bg-slate-900 dark:border-rose-950/20">
          <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30 animate-bounce">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            Data Load Failure
          </h3>
          <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
            {error}
          </p>
          <Button variant="primary" onClick={fetchAnalytics} className="rounded-xl font-black px-6 py-2.5">
            <RotateCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : loading ? (
        <AnalyticsSkeleton />
      ) : !data ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-slate-100 rounded-3xl dark:bg-slate-900 dark:border-slate-800">
          <Briefcase className="w-8 h-8 text-slate-300 mb-4" />
          <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
            No Data Available
          </h3>
          <p className="text-sm text-slate-500 font-semibold mt-1 dark:text-slate-400">
            No analytics data available for the chosen timeframe.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SummaryCard
              title="Total Users"
              value={data.summary?.totalUsers || 0}
              icon={Users}
              change={data.summary?.usersChange}
              trend="up"
            />
            <SummaryCard
              title="Total Companies"
              value={data.summary?.totalCompanies || 0}
              icon={Building}
              change={data.summary?.companiesChange}
              trend="up"
            />
            <SummaryCard
              title="Total Jobs"
              value={data.summary?.totalJobs || 0}
              icon={Briefcase}
              change={data.summary?.jobsChange}
              trend="up"
            />
            <SummaryCard
              title="Total Applications"
              value={data.summary?.totalApplications || 0}
              icon={FileText}
              change={data.summary?.applicationsChange}
              trend="up"
            />
          </div>

          {/* Charts Row 1: Users & Companies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UserGrowthChart data={data.userGrowth} />
            <CompanyGrowthChart data={data.companyGrowth} />
          </div>

          {/* Charts Row 2: Jobs & Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <JobStatisticsChart data={data.jobStatistics} />
            <ApplicationsChart data={data.applicationsOverview} />
          </div>

          {/* Ranked Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopCompaniesTable companies={data.topCompanies} />
            <TopJobsTable jobs={data.topJobs} />
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsDashboard;
