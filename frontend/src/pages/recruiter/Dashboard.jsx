import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Briefcase,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Code2,
  Atom,
  Cloud,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { recruiterService } from '@/services/recruiter/recruiterService';
import { formatDate } from '@/utils/formatDate';
import { formatJobType, formatWorkMode } from '@/utils/enumFormatters';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// 1. ECharts Donut Chart Component for Active Applications
function StageEChart({ stageCounts, totalApplications }) {
  const data = [
    { value: stageCounts?.applied || 0, name: 'Applied' },
    { value: stageCounts?.screening || 0, name: 'Screening' },
    { value: stageCounts?.interview || 0, name: 'Interview' },
    { value: stageCounts?.selected || 0, name: 'Offer' },
    { value: stageCounts?.rejected || 0, name: 'Rejected' }
  ];

  const total = data.reduce((acc, d) => acc + d.value, 0);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: '#0f172a',
      borderWidth: 0,
      textStyle: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' }
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 10,
      textStyle: {
        color: '#64748b',
        fontSize: 11,
        fontWeight: '600'
      }
    },
    color: ['#3b82f6', '#f59e0b', '#a855f7', '#10b981', '#f43f5e'],
    series: [
      {
        name: 'Stage Distribution',
        type: 'pie',
        radius: ['52%', '78%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#ffffff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          label: { show: false }
        },
        data: total > 0 ? data : [{ value: 1, name: 'No Applications', itemStyle: { color: '#e2e8f0' } }]
      }
    ]
  };

  return (
    <div className="relative w-full h-40">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
      {/* Center text overlay */}
      <div className="absolute left-[35%] top-[50%] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
        <span className="text-xl font-black text-slate-800 dark:text-white leading-none block">{totalApplications || 0}</span>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Total</span>
      </div>
    </div>
  );
}

// 2. ECharts Smooth Area Curve Component for Application Trend
function TrendEChart({ trendData }) {
  const dates = trendData?.map(d => d.date) || [];
  const values = trendData?.map(d => d.value) || [];

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0f172a',
      borderWidth: 0,
      textStyle: { color: '#ffffff', fontSize: 12 },
      axisPointer: { type: 'line', lineStyle: { color: '#94a3b8', width: 1, type: 'dashed' } }
    },
    grid: {
      top: 15,
      bottom: 25,
      left: 25,
      right: 15
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '600' }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' } },
      axisLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '600' }
    },
    series: [
      {
        data: values,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#3b82f6', borderWidth: 2, borderColor: '#ffffff' },
        lineStyle: { width: 3, color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.35)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
            ]
          }
        }
      }
    ]
  };

  return (
    <div className="w-full h-36">
      <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

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

  const { stats, topActiveJobs, recentApplications, stageCounts, trendData } = dashboardData || {
    stats: { activeJobs: 0, totalApplications: 0 },
    topActiveJobs: [],
    recentApplications: [],
    stageCounts: { applied: 0, screening: 0, interview: 0, selected: 0, rejected: 0 },
    trendData: []
  };

  const getJobIcon = (idx) => {
    if (idx === 0) return <Code2 className="w-4 h-4 text-blue-600" />;
    if (idx === 1) return <Atom className="w-4 h-4 text-blue-600" />;
    return <Cloud className="w-4 h-4 text-blue-600" />;
  };

  const getMatchScoreBadge = (score) => {
    const s = score || 85;
    if (s >= 90) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30">{s}%</span>;
    if (s >= 85) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30">{s}%</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/30">{s}%</span>;
  };

  const getStageBadge = (stageName) => {
    const st = (stageName || 'Applied').toLowerCase();
    if (st.includes('screen')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/30">Screening</span>;
    }
    if (st.includes('interview')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200/60 dark:border-purple-500/30">Interview</span>;
    }
    if (st.includes('select') || st.includes('offer')) {
      return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/30">Offer</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/30">Applied</span>;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4 sm:pt-6 pb-12 animate-in fade-in duration-200">
      
      {/* 1. Header Section */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'Harsh'}!
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Monitor your active jobs, track applications, and find the best talent for your team.
        </p>
      </div>

      {/* 2. Top Grid of 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Card 1: Active Jobs */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Active Jobs</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Currently open job listings</p>
              </div>
            </div>

            {/* Metric + Pill */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.activeJobs || 0}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                <span className="text-xs">↑</span> Active
              </span>
            </div>

            {/* Job List */}
            <div className="space-y-3 pt-2">
              {topActiveJobs.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 font-medium bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  No active job postings currently open.
                </div>
              ) : (
                topActiveJobs.map((job, idx) => (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/recruiter/jobs`)}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                        {getJobIcon(idx)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium truncate">
                          {job.location} • {job.work_mode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 text-xs block">{job.applicationsCount}</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium block">applications</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => navigate('/recruiter/jobs')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <span>View all jobs</span>
              <span>→</span>
            </button>
          </div>
        </Card>

        {/* Card 2: Active Applications (ECHART DONUT CHART) */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Active Applications</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Total applications received</p>
              </div>
            </div>

            {/* Metric + Pill */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalApplications || 0}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                <span className="text-xs">↑</span> Total
              </span>
            </div>

            {/* ECharts Circular Donut */}
            <StageEChart stageCounts={stageCounts} totalApplications={stats.totalApplications} />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => navigate('/recruiter/applicants')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <span>View all applications</span>
              <span>→</span>
            </button>
          </div>
        </Card>

        {/* Card 3: Application Trend (ECHART AREA TREND) */}
        <Card className="p-6 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">Application Trend</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Last 14 days</p>
              </div>
            </div>

            {/* Metric + Pill */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalApplications || 0}</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                <span className="text-xs">↑</span> 14 Days
              </span>
            </div>

            {/* ECharts Smooth Area Curve */}
            <TrendEChart trendData={trendData} />
          </div>
        </Card>
      </div>

      {/* 3. Bottom Table Card: Recent Applications */}
      <Card className="p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Recent Applications</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Latest candidates who applied to your jobs</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/recruiter/applicants')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <span>→</span>
          </button>
        </div>

        {/* Responsive Table */}
        {recentApplications.length === 0 ? (
          <div className="py-12 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications received yet</p>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
              Candidates who apply for your active job listings will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Job Title</th>
                  <th className="py-3 px-4">Match Score</th>
                  <th className="py-3 px-4">Stage</th>
                  <th className="py-3 px-4">Applied On</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {recentApplications.map((row) => {
                  const candidateName = row.candidate?.name || row.candidate?.full_name || row.candidate?.profile?.full_name || row.candidate?.email?.split('@')[0] || 'Candidate';
                  const candidateEmail = row.candidate?.email || 'Applicant';
                  const initial = candidateName[0]?.toUpperCase() || 'C';

                  const jobTitle = row.job?.title || row.job_title || 'Job Listing';
                  const typeLabel = formatJobType(row.job?.job_type) || 'Full-time';
                  const modeLabel = formatWorkMode(row.job?.work_mode) || 'Remote';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      
                      {/* Candidate Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          {row.candidate?.avatar ? (
                            <img
                              src={row.candidate.avatar}
                              alt={candidateName}
                              className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0">
                              {initial}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white text-sm block leading-snug">
                              {candidateName}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
                              {candidateEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Job Title Column */}
                      <td className="py-4 px-4">
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                            {jobTitle}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">
                            {typeLabel} • {modeLabel}
                          </span>
                        </div>
                      </td>

                    {/* Match Score Column */}
                    <td className="py-4 px-4">
                      {getMatchScoreBadge(row.match_score || row.ai_match_score || 85)}
                    </td>

                    {/* Stage Column */}
                    <td className="py-4 px-4">
                      {getStageBadge(row.status)}
                    </td>

                    {/* Applied On Column */}
                    <td className="py-4 px-4">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
                          {formatDate(row.applied_at || row.created_at)}
                        </span>
                      </div>
                    </td>

                    {/* Actions Column */}
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigate('/recruiter/applicants')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Dashboard;
