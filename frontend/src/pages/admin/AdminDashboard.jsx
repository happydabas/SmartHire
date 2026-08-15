import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Building, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { adminDashboardService } from '@/services/adminDashboardService';
import DashboardCard from '@/components/admin/DashboardCard';
import RecentActivities from '@/components/admin/RecentActivities';
import AnalyticsCard from '@/components/admin/AnalyticsCard';
import QuickActions from '@/components/admin/QuickActions';
import DashboardSkeleton from '@/components/admin/DashboardSkeleton';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminDashboardService.getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Could not retrieve dashboard metrics. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto bg-white border border-rose-100 rounded-3xl mt-12 dark:bg-slate-900 dark:border-rose-950/20">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-full mb-4 dark:bg-rose-950/30 animate-bounce">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
          System Overview Unavailable
        </h3>
        <p className="text-sm text-slate-500 font-semibold mt-1 mb-6 dark:text-slate-400">
          {error}
        </p>
        <Button variant="primary" onClick={fetchDashboardData} className="rounded-xl font-black px-6 py-2.5 shadow-md">
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>
      </div>
    );
  }

  if (!data || !data.stats) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center max-w-lg mx-auto bg-white border border-slate-100 rounded-3xl mt-12 dark:bg-slate-900 dark:border-slate-800">
        <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-4 dark:bg-slate-800">
          <Sparkles className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-800 dark:text-white">
          Platform Init State
        </h3>
        <p className="text-sm text-slate-500 font-semibold mt-1 dark:text-slate-400">
          No platform data available.
        </p>
      </div>
    );
  }

  const { stats, recentActivities, analytics } = data;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      trend: '14.2%',
      trendType: 'up',
      colorClass: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building,
      trend: '6.8%',
      trendType: 'up',
      colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs,
      icon: Briefcase,
      trend: '8.4%',
      trendType: 'up',
      colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
    },
    {
      title: 'Active Jobs',
      value: stats.activeJobs,
      icon: CheckCircle2,
      trend: '10.5%',
      trendType: 'up',
      colorClass: 'bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400'
    },
    {
      title: 'Pending Jobs',
      value: stats.pendingJobs,
      icon: Clock,
      trend: '2.1%',
      trendType: 'down',
      colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
    },
    {
      title: 'Total Applications',
      value: stats.totalApplications,
      icon: FileCheck2,
      trend: '24.3%',
      trendType: 'up',
      colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Dashboard Heading Header */}
      <PageHeader
        title="Admin Console"
        subtitle="SmartHire global site metrics, user logs, and system operations."
      />

      {/* Grid of stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            trendType={card.trendType}
            colorClass={card.colorClass}
          />
        ))}
      </div>

      {/* Analytics, Operations & Log Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 columns containing Quick Actions and Analytics Growth */}
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />

          {/* Analytics Overview Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnalyticsCard
              title="User Growth"
              value={analytics?.userGrowth?.value || stats.totalUsers}
              percentage={analytics?.userGrowth?.change || 12.5}
              type="user"
            />
            <AnalyticsCard
              title="Job Growth"
              value={analytics?.jobGrowth?.value || stats.totalJobs}
              percentage={analytics?.jobGrowth?.change || 8.2}
              type="job"
            />
            <AnalyticsCard
              title="Application Growth"
              value={analytics?.applicationGrowth?.value || stats.totalApplications}
              percentage={analytics?.applicationGrowth?.change || 24.3}
              type="application"
            />
          </div>
        </div>

        {/* Right column containing Activities Timeline Feed */}
        <div className="lg:col-span-1">
          <RecentActivities activities={recentActivities} />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
