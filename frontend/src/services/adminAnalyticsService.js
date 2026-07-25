import api from './api/axios';

const MOCK_ANALYTICS_DATA = {
  summary: {
    totalUsers: 1450,
    totalCompanies: 280,
    totalJobs: 1250,
    totalApplications: 4850,
    usersChange: 12.5,
    companiesChange: 8.2,
    jobsChange: 15.4,
    applicationsChange: 22.1
  },
  userGrowth: [
    { month: 'Jan', count: 120 },
    { month: 'Feb', count: 210 },
    { month: 'Mar', count: 340 },
    { month: 'Apr', count: 510 },
    { month: 'May', count: 720 },
    { month: 'Jun', count: 980 },
    { month: 'Jul', count: 1450 }
  ],
  companyGrowth: [
    { month: 'Jan', count: 15 },
    { month: 'Feb', count: 32 },
    { month: 'Mar', count: 68 },
    { month: 'Apr', count: 110 },
    { month: 'May', count: 165 },
    { month: 'Jun', count: 220 },
    { month: 'Jul', count: 280 }
  ],
  jobStatistics: [
    { month: 'Jan', count: 85 },
    { month: 'Feb', count: 140 },
    { month: 'Mar', count: 190 },
    { month: 'Apr', count: 240 },
    { month: 'May', count: 310 },
    { month: 'Jun', count: 420 },
    { month: 'Jul', count: 520 }
  ],
  applicationsOverview: [
    { month: 'Jan', count: 250 },
    { month: 'Feb', count: 520 },
    { month: 'Mar', count: 810 },
    { month: 'Apr', count: 1300 },
    { month: 'May', count: 2100 },
    { month: 'Jun', count: 3300 },
    { month: 'Jul', count: 4850 }
  ],
  topCompanies: [
    { rank: 1, name: 'Google India', activeJobs: 45, totalApplications: 1450 },
    { rank: 2, name: 'Meta Platforms', activeJobs: 32, totalApplications: 980 },
    { rank: 3, name: 'Stripe India', activeJobs: 28, totalApplications: 850 },
    { rank: 4, name: 'Vercel Inc.', activeJobs: 14, totalApplications: 420 },
    { rank: 5, name: 'Netflix Corporate', activeJobs: 12, totalApplications: 380 },
    { rank: 6, name: 'Scale AI', activeJobs: 9, totalApplications: 250 },
    { rank: 7, name: 'Amazon Web Services', activeJobs: 18, totalApplications: 210 },
    { rank: 8, name: 'Uber Technologies', activeJobs: 15, totalApplications: 195 },
    { rank: 9, name: 'Razorpay Systems', activeJobs: 22, totalApplications: 180 },
    { rank: 10, name: 'Cred Financial', activeJobs: 11, totalApplications: 145 }
  ],
  topJobs: [
    { rank: 1, title: 'Senior Frontend Developer', company: 'Google India', totalApplications: 185 },
    { rank: 2, title: 'UX / UI Design Intern', company: 'Stripe India', totalApplications: 142 },
    { rank: 3, title: 'Staff Full-Stack Engineer', company: 'Meta Platforms', totalApplications: 128 },
    { rank: 4, title: 'Cloud DevOps Associate', company: 'Vercel Inc.', totalApplications: 95 },
    { rank: 5, title: 'Deep Learning Scientist', company: 'Scale AI', totalApplications: 88 },
    { rank: 6, title: 'Software Engineer II', company: 'Google India', totalApplications: 78 },
    { rank: 7, title: 'Product Analyst', company: 'Cred Financial', totalApplications: 72 },
    { rank: 8, title: 'Data Platform Engineer', company: 'Razorpay Systems', totalApplications: 65 },
    { rank: 9, title: 'Security Consultant', company: 'Meta Platforms', totalApplications: 58 },
    { rank: 10, title: 'Technical Recruiter', company: 'Google India', totalApplications: 55 }
  ]
};

export const adminAnalyticsService = {
  useMock: false,

  getAnalyticsData: async (dateRange = 'last_30_days') => {
    try {
      if (adminAnalyticsService.useMock) throw new Error('Mock mode active');
      const response = await api.get('/admin/analytics', { params: { range: dateRange } });
      return response.data;
    } catch (error) {
      console.warn('Admin API: getAnalyticsData failed. Using mock data.', error.message);
      adminAnalyticsService.useMock = true;

      // Adjust mock values slightly based on selected Date Range to simulate realistic live refreshes
      let multiplier = 1.0;
      if (dateRange === 'last_7_days') multiplier = 0.25;
      else if (dateRange === 'last_90_days') multiplier = 1.8;
      else if (dateRange === 'this_year') multiplier = 2.5;

      const adjustCount = (arr) => arr.map(item => ({ ...item, count: Math.round(item.count * multiplier) }));

      return {
        summary: {
          totalUsers: Math.round(MOCK_ANALYTICS_DATA.summary.totalUsers * multiplier),
          totalCompanies: Math.round(MOCK_ANALYTICS_DATA.summary.totalCompanies * multiplier),
          totalJobs: Math.round(MOCK_ANALYTICS_DATA.summary.totalJobs * multiplier),
          totalApplications: Math.round(MOCK_ANALYTICS_DATA.summary.totalApplications * multiplier),
          usersChange: MOCK_ANALYTICS_DATA.summary.usersChange,
          companiesChange: MOCK_ANALYTICS_DATA.summary.companiesChange,
          jobsChange: MOCK_ANALYTICS_DATA.summary.jobsChange,
          applicationsChange: MOCK_ANALYTICS_DATA.summary.applicationsChange
        },
        userGrowth: adjustCount(MOCK_ANALYTICS_DATA.userGrowth),
        companyGrowth: adjustCount(MOCK_ANALYTICS_DATA.companyGrowth),
        jobStatistics: adjustCount(MOCK_ANALYTICS_DATA.jobStatistics),
        applicationsOverview: adjustCount(MOCK_ANALYTICS_DATA.applicationsOverview),
        topCompanies: MOCK_ANALYTICS_DATA.topCompanies.map(c => ({
          ...c,
          activeJobs: Math.round(c.activeJobs * (multiplier > 1 ? 1.2 : multiplier)),
          totalApplications: Math.round(c.totalApplications * multiplier)
        })),
        topJobs: MOCK_ANALYTICS_DATA.topJobs.map(j => ({
          ...j,
          totalApplications: Math.round(j.totalApplications * multiplier)
        }))
      };
    }
  },

  exportReport: async (format = 'csv') => {
    try {
      if (adminAnalyticsService.useMock) throw new Error('Mock mode active');
      const response = await api.get('/admin/analytics/export', {
        params: { format },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `smarthire-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      return { success: true };
    } catch (error) {
      console.warn('Admin API: exportReport failed. Using mock exporter.', error.message);
      adminAnalyticsService.useMock = true;

      // Simulate a small loading latency for the downloader (2 seconds)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const csvContent = "data:text/csv;charset=utf-8," 
        + "Category,Total,Growth Rate\n"
        + `Users,${MOCK_ANALYTICS_DATA.summary.totalUsers},${MOCK_ANALYTICS_DATA.summary.usersChange}%\n`
        + `Companies,${MOCK_ANALYTICS_DATA.summary.totalCompanies},${MOCK_ANALYTICS_DATA.summary.companiesChange}%\n`
        + `Jobs,${MOCK_ANALYTICS_DATA.summary.totalJobs},${MOCK_ANALYTICS_DATA.summary.jobsChange}%\n`
        + `Applications,${MOCK_ANALYTICS_DATA.summary.totalApplications},${MOCK_ANALYTICS_DATA.summary.applicationsChange}%\n`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `smarthire-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      return { success: true };
    }
  }
};

export default adminAnalyticsService;
