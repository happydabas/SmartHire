import api from '../api/axios';
import { API_ENDPOINTS } from '../api/endpoints';

let cachedManageJobs = null;

const getDepartment = (title) => {
  const t = title?.toLowerCase() || '';
  if (
    t.includes('engineer') ||
    t.includes('dev') ||
    t.includes('tech') ||
    t.includes('data') ||
    t.includes('software') ||
    t.includes('qa') ||
    t.includes('backend') ||
    t.includes('frontend')
  ) {
    return 'Engineering';
  }
  if (t.includes('product') || t.includes('pm')) return 'Product';
  if (t.includes('design') || t.includes('ux') || t.includes('ui') || t.includes('graphic')) return 'Design';
  if (t.includes('marketing') || t.includes('seo') || t.includes('brand') || t.includes('growth')) return 'Marketing';
  if (t.includes('sales') || t.includes('account') || t.includes('business development')) return 'Sales';
  if (t.includes('hr') || t.includes('recruiting') || t.includes('talent') || t.includes('people')) return 'Human Resources';
  if (t.includes('finance') || t.includes('accountant') || t.includes('analyst') || t.includes('billing')) return 'Finance';
  return 'Engineering';
};

export const recruiterService = {
  clearJobsCache: () => {
    cachedManageJobs = null;
  },

  /**
   * Fetches the recruiter's own jobs, populating applications count and simulating server-side pagination, sorting, search, and filtering.
   */
  getManageJobs: async ({
    search = '',
    status = '',
    jobType = '',
    workMode = '',
    sort = 'latest',
    page = 1,
    pageSize = 10,
    forceRefetch = false
  }) => {
    if (cachedManageJobs === null || forceRefetch) {
      const jobs = await api.get(API_ENDPOINTS.MY.JOBS).then(res => res.data || []);

      const applicationsPromises = jobs.map(async (job) => {
        try {
          const url = `${API_ENDPOINTS.RECRUITER.APPLICATIONS}/${job.id}/applications`;
          const res = await api.get(url, { params: { page: 1, limit: 1 } });
          return {
            jobId: job.id,
            totalCount: res.data?.total || 0,
          };
        } catch (err) {
          return {
            jobId: job.id,
            totalCount: 0,
          };
        }
      });

      const appCounts = await Promise.all(applicationsPromises);

      cachedManageJobs = jobs.map(job => {
        const countObj = appCounts.find(c => c.jobId === job.id);
        const dept = getDepartment(job.title);
        return {
          ...job,
          department: dept,
          applicationsCount: countObj ? countObj.totalCount : 0
        };
      });
    }

    // Apply search filter (Title, Department, Location)
    let filtered = [...cachedManageJobs];
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(job => 
        job.title?.toLowerCase().includes(q) ||
        job.department?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
      );
    }

    // Apply Status filter (Active -> open, Draft -> draft, Closed -> closed)
    if (status) {
      const statusMap = {
        'Active': 'open',
        'Draft': 'draft',
        'Closed': 'closed'
      };
      const dbStatus = statusMap[status] || status.toLowerCase();
      filtered = filtered.filter(job => job.status?.toLowerCase() === dbStatus);
    }

    // Apply Job Type filter
    if (jobType) {
      filtered = filtered.filter(job => job.job_type?.toLowerCase() === jobType.toLowerCase());
    }

    // Apply Work Mode filter
    if (workMode) {
      filtered = filtered.filter(job => job.work_mode?.toLowerCase() === workMode.toLowerCase());
    }

    // Apply Sorting
    filtered.sort((a, b) => {
      if (sort === 'oldest') {
        return new Date(a.created_at || 0) - new Date(b.created_at || 0);
      }
      if (sort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sort === 'applications') {
        return b.applicationsCount - a.applicationsCount;
      }
      // default 'latest'
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    // Pagination slicing
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);

    return {
      items,
      total: totalCount
    };
  },
  /**
   * Fetches and aggregates recruiter dashboard details.
   * Gets recruiter's job listings and queries application details for each job posting.
   */
  getDashboardData: async () => {
    // 1. Fetch recruiter's jobs
    const jobs = await api.get(API_ENDPOINTS.MY.JOBS).then(res => res.data || []);

    // 2. Fetch applications for each job posting concurrently
    const applicationsPromises = jobs.map(async (job) => {
      try {
        const url = `${API_ENDPOINTS.RECRUITER.APPLICATIONS}/${job.id}/applications`;
        // Fetch with default limit of 100 to get a reasonable pool for recent display
        const res = await api.get(url, { params: { page: 1, limit: 100 } });
        return {
          jobId: job.id,
          jobTitle: job.title,
          totalCount: res.data?.total || 0,
          items: res.data?.items || [],
        };
      } catch (err) {
        console.warn(`Failed to fetch applications for job ID ${job.id}:`, err);
        return {
          jobId: job.id,
          jobTitle: job.title,
          totalCount: 0,
          items: [],
        };
      }
    });

    const applicationsResults = await Promise.all(applicationsPromises);

    // 3. Aggregate statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(j => j.status?.toLowerCase() === 'open').length;
    const draftJobs = jobs.filter(j => j.status?.toLowerCase() === 'draft').length;
    const closedJobs = jobs.filter(j => j.status?.toLowerCase() === 'closed').length;

    const totalApplications = applicationsResults.reduce((sum, res) => sum + res.totalCount, 0);

    // 4. Flatten, compile, and override status overrides from localStorage
    const allApplications = applicationsResults.flatMap(res => res.items).map(app => {
      const storedStatus = localStorage.getItem(`app_status_${app.id}`);
      return {
        ...app,
        status: storedStatus || app.status
      };
    });

    // Sort all application records by applied date descending
    const sortedApplications = [...allApplications].sort((a, b) => {
      const dateA = new Date(a.applied_at || a.created_at || 0);
      const dateB = new Date(b.applied_at || b.created_at || 0);
      return dateB - dateA;
    });

    // Extract the latest 5 applications
    const recentApplications = sortedApplications.slice(0, 5);

    // 5. Aggregate Analytics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const applicationsThisWeek = allApplications.filter(app => {
      const appliedDate = new Date(app.applied_at || app.created_at);
      return appliedDate >= sevenDaysAgo;
    }).length;

    // Active Hiring Pipelines: count of active ('open') jobs that have at least 1 application
    const activePipelines = jobs.filter(job => {
      if (job.status?.toLowerCase() !== 'open') return false;
      const appResult = applicationsResults.find(r => r.jobId === job.id);
      return appResult && appResult.totalCount > 0;
    }).length;

    const avgApplicationsPerJob = totalJobs > 0 
      ? parseFloat((totalApplications / totalJobs).toFixed(1)) 
      : 0;

    // 5. Aggregate stage counts from real application records
    const stageCounts = {
      applied: 0,
      screening: 0,
      interview: 0,
      selected: 0,
      rejected: 0
    };
    allApplications.forEach(app => {
      const stage = (app.status || '').toLowerCase();
      if (stageCounts[stage] !== undefined) {
        stageCounts[stage]++;
      } else if (stage.includes('screen')) {
        stageCounts.screening++;
      } else if (stage.includes('interview')) {
        stageCounts.interview++;
      } else if (stage.includes('select') || stage.includes('offer') || stage.includes('accept') || stage.includes('hire')) {
        stageCounts.selected++;
      } else if (stage.includes('reject')) {
        stageCounts.rejected++;
      } else {
        stageCounts.applied++;
      }
    });

    // Top active jobs list from real database
    const topActiveJobs = jobs
      .filter(j => (j.status || '').toLowerCase() === 'open')
      .map(j => {
        const appRes = applicationsResults.find(r => r.jobId === j.id);
        return {
          id: j.id,
          title: j.title,
          location: j.location || 'Remote',
          work_mode: j.work_mode || 'Onsite',
          applicationsCount: appRes?.totalCount || 0
        };
      })
      .slice(0, 5);

    // Compute real 14-day daily application trend
    const daysMap = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      daysMap[dateStr] = 0;
    }
    allApplications.forEach(app => {
      const appDate = new Date(app.applied_at || app.created_at);
      const dateStr = appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (daysMap[dateStr] !== undefined) {
        daysMap[dateStr]++;
      }
    });

    const trendData = Object.entries(daysMap).map(([date, value]) => ({ date, value }));

    return {
      stats: {
        totalJobs,
        activeJobs,
        draftJobs,
        closedJobs,
        totalApplications,
      },
      topActiveJobs,
      recentApplications: sortedApplications.slice(0, 5),
      analytics: {
        applicationsThisWeek,
        activePipelines,
        avgApplicationsPerJob,
      },
      stageCounts,
      trendData
    };
  },
};

export default recruiterService;
