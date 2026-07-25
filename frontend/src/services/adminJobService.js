import api from './api/axios';

const LOCAL_STORAGE_JOBS_KEY = 'smarthire_admin_jobs';

const INITIAL_MOCK_JOBS = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company_name: 'Google India',
    recruiter_name: 'Sonia Sen',
    job_type: 'Full-Time',
    work_mode: 'Hybrid',
    location: 'Bangalore, India',
    applications_count: 45,
    status: 'published',
    posted_date: '2026-07-20T09:30:00Z',
    description: 'We are looking for a Senior Frontend Developer to join our core applications group. You will lead design systems engineering and build responsive client modules.',
    required_skills: ['React', 'JavaScript', 'Tailwind CSS', 'TypeScript'],
    experience_level: 'Senior (5+ years)',
    salary_min: 1500000,
    salary_max: 2200000,
    total_applications: 45
  },
  {
    id: 2,
    title: 'Staff Full-Stack Engineer',
    company_name: 'Meta Platforms',
    recruiter_name: 'Aarav Gupta',
    job_type: 'Full-Time',
    work_mode: 'On-Site',
    location: 'Hyderabad, India',
    applications_count: 32,
    status: 'published',
    posted_date: '2026-07-18T14:15:00Z',
    description: 'Lead next-generation social connectivity protocols and backend rendering nodes.',
    required_skills: ['Node.js', 'React', 'GraphQL', 'PostgreSQL'],
    experience_level: 'Lead (8+ years)',
    salary_min: 2800000,
    salary_max: 4200000,
    total_applications: 32
  },
  {
    id: 3,
    title: 'Technical Product Manager',
    company_name: 'Stripe India',
    recruiter_name: 'Sneha Rao',
    job_type: 'Contract',
    work_mode: 'Remote',
    location: 'Remote, India',
    applications_count: 14,
    status: 'pending',
    posted_date: '2026-07-25T08:00:00Z',
    description: 'Moderate secure financial gateways APIs and build customer invoicing features.',
    required_skills: ['API Design', 'Product Strategy', 'Agile Methodology'],
    experience_level: 'Mid (3-5 years)',
    salary_min: 1800000,
    salary_max: 2500000,
    total_applications: 14
  },
  {
    id: 4,
    title: 'UX / UI Design Intern',
    company_name: 'Stripe India',
    recruiter_name: 'Sneha Rao',
    job_type: 'Internship',
    work_mode: 'Hybrid',
    location: 'Mumbai, India',
    applications_count: 58,
    status: 'closed',
    posted_date: '2026-07-05T11:20:00Z',
    description: 'Design interactive prototypes for checkout interfaces and manage developer assets.',
    required_skills: ['Figma', 'UI Prototyping', 'User Research'],
    experience_level: 'Entry / Junior',
    salary_min: 500000,
    salary_max: 800000,
    total_applications: 58
  },
  {
    id: 5,
    title: 'DevOps Cloud Engineer',
    company_name: 'Vercel Inc.',
    recruiter_name: 'Neha Kapoor',
    job_type: 'Part-Time',
    work_mode: 'Remote',
    location: 'Remote, India',
    applications_count: 8,
    status: 'rejected',
    posted_date: '2026-07-12T16:45:00Z',
    description: 'Support high-availability edge networks routers configurations and server deployments.',
    required_skills: ['AWS', 'Terraform', 'CI/CD Pipelines', 'Docker'],
    experience_level: 'Mid (4+ years)',
    salary_min: 1200000,
    salary_max: 1800000,
    total_applications: 8
  },
  {
    id: 6,
    title: 'Deep Learning Scientist',
    company_name: 'Scale AI',
    recruiter_name: 'Preeti Deshmukh',
    job_type: 'Full-Time',
    work_mode: 'Remote',
    location: 'Bengaluru, India',
    applications_count: 0,
    status: 'pending',
    posted_date: '2026-07-24T10:05:00Z',
    description: 'Research machine learning model architectures and label training pipelines.',
    required_skills: ['PyTorch', 'Python', 'Machine Learning', 'CUDA'],
    experience_level: 'PhD / Senior',
    salary_min: 3500000,
    salary_max: 5500000,
    total_applications: 0
  }
];

const getLocalStorageJobs = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_JOBS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(INITIAL_MOCK_JOBS));
    return INITIAL_MOCK_JOBS;
  }
  return JSON.parse(data);
};

const saveLocalStorageJobs = (jobs) => {
  localStorage.setItem(LOCAL_STORAGE_JOBS_KEY, JSON.stringify(jobs));
};

export const adminJobService = {
  useMock: false,

  getJobs: async (params = {}) => {
    const { page = 1, limit = 10, search = '', status = 'all', type = 'all', company = 'all' } = params;
    try {
      if (adminJobService.useMock) throw new Error('Mock mode is active');
      const response = await api.get('/admin/jobs', { params });
      return response.data;
    } catch (error) {
      console.warn('Admin API: getJobs failed. Using local storage fallback.', error.message);
      adminJobService.useMock = true;

      let items = getLocalStorageJobs();

      // Apply Search (Job Title, Company Name, Recruiter Name)
      if (search) {
        const query = search.toLowerCase().trim();
        items = items.filter(j => 
          j.title.toLowerCase().includes(query) || 
          j.company_name.toLowerCase().includes(query) ||
          j.recruiter_name.toLowerCase().includes(query)
        );
      }

      // Apply Status Filter
      if (status !== 'all') {
        items = items.filter(j => j.status === status);
      }

      // Apply Job Type Filter
      if (type !== 'all') {
        items = items.filter(j => j.job_type === type);
      }

      // Apply Company Filter
      if (company !== 'all') {
        items = items.filter(j => j.company_name === company);
      }

      // Sort: Newest created first (posted_date desc)
      items.sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date));

      // Calculate Pagination
      const total = items.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedItems = items.slice(start, end);

      return {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages
      };
    }
  },

  getJobDetails: async (id) => {
    try {
      if (adminJobService.useMock) throw new Error('Mock mode is active');
      const response = await api.get(`/admin/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: getJobDetails(${id}) failed. Using local storage fallback.`, error.message);
      adminJobService.useMock = true;
      const jobs = getLocalStorageJobs();
      const job = jobs.find(j => j.id === Number(id));
      if (!job) throw new Error('Job posting not found');
      return job;
    }
  },

  approveJob: async (id) => {
    try {
      if (adminJobService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/jobs/${id}/approve`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: approveJob(${id}) failed. Using local storage fallback.`, error.message);
      adminJobService.useMock = true;
      const jobs = getLocalStorageJobs();
      const updated = jobs.map(j => j.id === Number(id) ? { ...j, status: 'published' } : j);
      saveLocalStorageJobs(updated);
      return { success: true, id };
    }
  },

  rejectJob: async (id) => {
    try {
      if (adminJobService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/jobs/${id}/reject`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: rejectJob(${id}) failed. Using local storage fallback.`, error.message);
      adminJobService.useMock = true;
      const jobs = getLocalStorageJobs();
      const updated = jobs.map(j => j.id === Number(id) ? { ...j, status: 'rejected' } : j);
      saveLocalStorageJobs(updated);
      return { success: true, id };
    }
  },

  removeJob: async (id) => {
    try {
      if (adminJobService.useMock) throw new Error('Mock mode is active');
      const response = await api.delete(`/admin/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: removeJob(${id}) failed. Using local storage fallback.`, error.message);
      adminJobService.useMock = true;
      const jobs = getLocalStorageJobs();
      const updated = jobs.filter(j => j.id !== Number(id));
      saveLocalStorageJobs(updated);
      return { success: true, id };
    }
  },

  getCompaniesList: async () => {
    try {
      const response = await api.get('/admin/jobs/companies');
      return response.data;
    } catch (error) {
      const jobs = getLocalStorageJobs();
      const companies = Array.from(new Set(jobs.map(j => j.company_name)));
      return companies;
    }
  }
};

export default adminJobService;
