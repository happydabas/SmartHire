import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Inbox,
  TrendingUp,
  Activity,
  PlusCircle,
  Users,
  AlertCircle,
  Calendar,
  Eye,
  CheckCircle,
  FileClock,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { recruiterService } from '@/services/recruiter/recruiterService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/common/EmptyState';
import EmptyRecruiterJobs from '@/components/common/EmptyRecruiterJobs';
import Card from '@/components/ui/Card';
import SkeletonTable from '@/components/common/SkeletonTable';
import StageBadge from '@/components/ats/StageBadge';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recruiterService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching recruiter dashboard data:', err);
      setError('Failed to retrieve recruiter workspace statistics. Please verify backend connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };



  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] p-4">
        <Card className="max-w-md w-full border-rose-100 bg-rose-50/10 text-center space-y-4 p-8 rounded-3xl">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">Error Loading Workspace</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
          <Button variant="primary" size="md" onClick={fetchDashboardData} className="w-full mt-2 rounded-xl">
            Retry Connection
          </Button>
        </Card>
      </div>
    );
  }

  const { stats, recentApplications, analytics, stageCounts } = dashboardData || {
    stats: { totalJobs: 0, activeJobs: 0, draftJobs: 0, closedJobs: 0, totalApplications: 0 },
    recentApplications: [],
    analytics: { applicationsThisWeek: 0, activePipelines: 0, avgApplicationsPerJob: 0 },
    stageCounts: { applied: 0, screening: 0, interview: 0, selected: 0, rejected: 0 }
  };

  if (!loading && stats.totalJobs === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Workspace</h1>
          <p className="text-slate-500 text-sm mt-1">Manage jobs, candidates, and hiring analytics.</p>
        </div>
        <EmptyRecruiterJobs variant="dashboard" />
      </div>
    );
  }

  // Map status name to UI Badge color variant
  const getStatusVariant = (status) => {
    if (!status) return 'neutral';
    const s = status.toLowerCase();
    if (s.includes('accept') || s.includes('hire') || s.includes('success') || s.includes('select')) return 'success';
    if (s.includes('reject') || s.includes('decline') || s.includes('fail')) return 'danger';
    if (s.includes('interview') || s.includes('screening') || s.includes('review') || s.includes('schedule')) return 'warning';
    if (s.includes('applied') || s.includes('submit') || s.includes('pending')) return 'primary';
    return 'neutral';
  };

  const renderMobileCard = (row) => (
    <Card key={row.id} className="p-5 border border-slate-100 bg-white space-y-4 shadow-sm rounded-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
            {row.candidate?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 text-sm">{row.candidate?.name || 'Anonymous candidate'}</span>
            <span className="text-[10px] text-slate-400 font-semibold">{row.candidate?.email}</span>
          </div>
        </div>
        <StageBadge stage={row.status} />
      </div>
      <div className="flex justify-between items-center text-xs font-semibold text-slate-600 pt-3 border-t border-slate-50">
        <span className="text-slate-700">{row.job?.title || 'Unknown Job'}</span>
        <span className="text-[10px] text-slate-400">{formatDate(row.applied_at || row.created_at)}</span>
      </div>
      <div className="pt-2 flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => triggerToast(`Candidate profile view for ${row.candidate?.name || 'Applicant'} is coming soon!`)}
          className="w-full rounded-xl font-bold py-1.5 border border-slate-200 flex items-center justify-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </Button>
      </div>
    </Card>
  );

  // Reusable columns definition for Recent Applications Table
  const tableColumns = [
    {
      header: 'Applicant Name',
      key: 'candidate.name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
            {row.candidate?.name?.[0]?.toUpperCase() || 'C'}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 text-sm">{row.candidate?.name || 'Anonymous candidate'}</span>
            <span className="text-[10px] text-slate-400 font-medium">{row.candidate?.email}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Job Title',
      key: 'job.title',
      render: (row) => (
        <span className="font-semibold text-slate-700 text-sm leading-snug">{row.job?.title || 'Unknown Job'}</span>
      )
    },
    {
      header: 'Applied Date',
      key: 'applied_at',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(row.applied_at || row.created_at)}</span>
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
      header: 'Action',
      align: 'center',
      render: (row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => triggerToast(`Candidate profile view for ${row.candidate?.name || 'Applicant'} is coming soon!`)}
          className="rounded-xl px-3 py-1.5 font-bold border border-slate-200 inline-flex items-center gap-1.5 hover:bg-slate-50"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View</span>
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto relative">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 animate-slide-in">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm">
            <Sparkles className="w-4 h-4 text-blue-100" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-100">{toastMessage}</p>
            <p className="text-[10px] text-slate-400 font-medium">Feature coming soon in the next release.</p>
          </div>
        </div>
      )}

      {/* 1. Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center justify-center pr-12">
          <TrendingUp className="w-64 h-64 text-blue-300" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/20">
            Recruiter Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Recruiter'}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md leading-relaxed font-medium">
            Monitor active pipelines, publish jobs, and review qualified candidates inside your talent acquisition console.
          </p>
        </div>
      </div>

      {/* 2. Quick Actions Panel */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={() => triggerToast('Create Job flow is coming soon!')}
            className="flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 border border-transparent transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Job</span>
          </Button>

          <Button
            onClick={() => navigate('/recruiter/jobs')}
            className="flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:shadow-md transition-all"
          >
            <Briefcase className="w-5 h-5 text-slate-500" />
            <span>Manage Jobs</span>
          </Button>

          <Button
            onClick={() => navigate('/recruiter/applicants')}
            className="flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold hover:shadow-md transition-all"
          >
            <Users className="w-5 h-5 text-slate-500" />
            <span>View Applicants</span>
          </Button>
        </div>
      </section>

      {/* 3. Overview statistics Cards Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600" />
          <span>Hiring Snapshot</span>
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3 border border-slate-100 bg-white">
                <div className="flex items-center justify-between">
                  <div className="h-3 bg-slate-200 rounded-lg w-20"></div>
                  <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
                </div>
                <div className="h-7 bg-slate-200 rounded-xl w-12"></div>
                <div className="h-3 bg-slate-200 rounded-lg w-24"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <StatCard
              title="Total Jobs"
              value={stats.totalJobs}
              description="Overall job postings created"
              icon={<Briefcase className="w-5 h-5" />}
              iconBgColor="bg-slate-50"
              iconColor="text-slate-600"
            />
            <StatCard
              title="Active Jobs"
              value={stats.activeJobs}
              description="Open listings collecting applications"
              icon={<CheckCircle className="w-5 h-5" />}
              iconBgColor="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="Draft Jobs"
              value={stats.draftJobs}
              description="Postings pending final reviews"
              icon={<FileClock className="w-5 h-5" />}
              iconBgColor="bg-amber-50"
              iconColor="text-amber-600"
            />
            <StatCard
              title="Closed Jobs"
              value={stats.closedJobs}
              description="Fulfilled or expired listings"
              icon={<AlertCircle className="w-5 h-5" />}
              iconBgColor="bg-rose-50"
              iconColor="text-rose-600"
            />
            <StatCard
              title="Total Applications"
              value={stats.totalApplications}
              description="Total candidates applied"
              icon={<Inbox className="w-5 h-5" />}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-600"
            />
          </div>
        )}
      </section>

      {/* Applications by Stage Analytics Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span>Applications by Pipeline Stage</span>
        </h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3 border border-slate-100 bg-white">
                <div className="h-3 bg-slate-200 rounded-lg w-20"></div>
                <div className="h-7 bg-slate-200 rounded-xl w-12"></div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <Card className="p-5 border border-slate-100 bg-white rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">Applied</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{stageCounts.applied}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Initial submissions received</p>
            </Card>
            
            <Card className="p-5 border border-slate-100 bg-white rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">Screening</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{stageCounts.screening}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Candidates under active review</p>
            </Card>
            
            <Card className="p-5 border border-slate-100 bg-white rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">Interview</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{stageCounts.interview}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Scheduled and ongoing meetings</p>
            </Card>
            
            <Card className="p-5 border border-slate-100 bg-white rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">Selected</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{stageCounts.selected}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Offers extended or accepted</p>
            </Card>
            
            <Card className="p-5 border border-slate-100 bg-white rounded-3xl space-y-3 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                <span className="text-xs font-bold text-slate-500">Rejected</span>
              </div>
              <h3 className="text-3xl font-black text-slate-800">{stageCounts.rejected}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Archived or disqualified</p>
            </Card>
          </div>
        )}
      </section>

      {/* 4. Analytics & Recent Applications split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Applications Table (Left/Main Column) */}
        <div className="lg:col-span-2 space-y-4 min-w-0">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Recent Applications</span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200">
              Latest 5
            </span>
          </h2>

          {loading ? (
            <SkeletonTable rows={5} cols={4} />
          ) : recentApplications.length === 0 ? (
            <EmptyState
              title="No applications received"
              description="Your job postings haven't received any applications yet. Create or check open jobs details."
              icon={<Inbox className="w-10 h-10" />}
              className="bg-white py-14"
            />
          ) : (
            <DataTable
              columns={tableColumns}
              data={recentApplications}
              rowKey="id"
              renderMobileCard={renderMobileCard}
              emptyState={
                <EmptyState
                  title="No Applications"
                  description="No candidate applications matches."
                  icon={<Inbox className="w-8 h-8" />}
                />
              }
            />
          )}
        </div>

        {/* Analytics Highlights Panel (Right Column) */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Hiring Performance</span>
          </h2>

          {loading ? (
            <Card className="p-6 border border-slate-100 shadow-sm bg-white space-y-6 rounded-3xl animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-2 flex-grow">
                    <div className="h-3 bg-slate-200 rounded-lg w-2/3"></div>
                    <div className="h-6 bg-slate-200 rounded-xl w-12"></div>
                    <div className="h-2.5 bg-slate-200 rounded-lg w-1/2"></div>
                  </div>
                  <div className="w-11 h-11 bg-slate-200 rounded-2xl shrink-0"></div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="p-6 border border-slate-100 shadow-sm bg-white space-y-6 rounded-3xl">
              {/* Metric 1 */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Applications This Week</p>
                  <p className="text-2xl font-black text-slate-800">{analytics.applicationsThisWeek}</p>
                  <p className="text-[10px] text-slate-400 font-medium">New candidates added in last 7 days</p>
                </div>
                <div className="p-3 bg-blue-50/50 text-blue-600 rounded-2xl">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Metric 2 */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Hiring Pipelines</p>
                  <p className="text-2xl font-black text-slate-800">{analytics.activePipelines}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Open postings with applicant activity</p>
                </div>
                <div className="p-3 bg-emerald-50/50 text-emerald-600 rounded-2xl">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Metric 3 */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Applications / Job</p>
                  <p className="text-2xl font-black text-slate-800">{analytics.avgApplicationsPerJob}</p>
                  <p className="text-[10px] text-slate-400 font-medium">Overall ratio of candidates per listing</p>
                </div>
                <div className="p-3 bg-purple-50/50 text-purple-600 rounded-2xl">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
