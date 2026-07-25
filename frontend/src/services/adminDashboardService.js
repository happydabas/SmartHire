import api from './api/axios';

export const adminDashboardService = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.warn('Admin API: getDashboardStats failed. Using mock dashboard data.', error.message);
      
      // Fallback mock dashboard data
      return {
        stats: {
          totalUsers: 1250,
          totalCompanies: 180,
          totalJobs: 450,
          activeJobs: 380,
          pendingJobs: 40,
          totalApplications: 2800
        },
        recentActivities: [
          {
            id: 1,
            type: 'user_registered',
            description: 'Aarav Mehta registered as a Job Seeker.',
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            type: 'job_published',
            description: 'Senior React Developer listing was published by Meta.',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          },
          {
            id: 3,
            type: 'company_registered',
            description: 'Vercel Inc. registered as a corporate employer.',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 4,
            type: 'application_submitted',
            description: 'Priya Sharma applied for Frontend Engineer at Google.',
            timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 5,
            type: 'job_closed',
            description: 'UX Designer posting was closed by Stripe.',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 6,
            type: 'user_registered',
            description: 'Neha Kapoor registered as a Corporate Recruiter.',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 7,
            type: 'job_published',
            description: 'Staff Devops Engineer listing was published by Stripe.',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 8,
            type: 'application_submitted',
            description: 'Rohan Patil applied for Full-Stack Developer at Meta.',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 9,
            type: 'company_registered',
            description: 'Scale AI registered as a corporate employer.',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 10,
            type: 'job_closed',
            description: 'Product Manager listing was closed by Netflix.',
            timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString()
          }
        ],
        analytics: {
          userGrowth: { value: 1250, change: 12.5 },
          jobGrowth: { value: 450, change: 8.2 },
          applicationGrowth: { value: 2800, change: 24.3 }
        }
      };
    }
  }
};

export default adminDashboardService;
