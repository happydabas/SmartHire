import api from './api/axios';

const LOCAL_STORAGE_COMPANIES_KEY = 'smarthire_admin_companies';

const INITIAL_MOCK_COMPANIES = [
  {
    id: 1,
    name: 'Google India',
    industry: 'Technology',
    owner_name: 'Sundar Pichai',
    owner_id: 101,
    recruiters_count: 24,
    total_jobs: 145,
    verification_status: 'verified',
    status: 'active',
    logo: '',
    created_at: '2026-01-15T09:00:00Z',
    description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
    website: 'https://google.com',
    location: 'Bangalore, India',
    recruiters_list: [
      { id: 201, name: 'Rahul Sharma', email: 'rahul.s@google.com' },
      { id: 202, name: 'Sonia Sen', email: 'sonia.sen@google.com' }
    ]
  },
  {
    id: 2,
    name: 'Meta Platforms',
    industry: 'Social Media',
    owner_name: 'Mark Zuckerberg',
    owner_id: 102,
    recruiters_count: 18,
    total_jobs: 88,
    verification_status: 'verified',
    status: 'active',
    logo: '',
    created_at: '2026-02-10T11:30:00Z',
    description: 'Meta builds technologies that help people connect, find communities, and grow businesses.',
    website: 'https://meta.com',
    location: 'Hyderabad, India',
    recruiters_list: [
      { id: 203, name: 'Aarav Gupta', email: 'aarav.g@meta.com' }
    ]
  },
  {
    id: 3,
    name: 'Vercel Inc.',
    industry: 'Cloud Computing',
    owner_name: 'Guillermo Rauch',
    owner_id: 103,
    recruiters_count: 5,
    total_jobs: 14,
    verification_status: 'verified',
    status: 'active',
    logo: '',
    created_at: '2026-05-20T14:15:00Z',
    description: 'Vercel provides the developer experience and infrastructure to build, deploy, and scale the web.',
    website: 'https://vercel.com',
    location: 'Remote, India',
    recruiters_list: [
      { id: 204, name: 'Neha Kapoor', email: 'neha.k@vercel.com' }
    ]
  },
  {
    id: 4,
    name: 'Stripe India',
    industry: 'Financial Technology',
    owner_name: 'Patrick Collison',
    owner_id: 104,
    recruiters_count: 9,
    total_jobs: 28,
    verification_status: 'unverified',
    status: 'active',
    logo: '',
    created_at: '2026-06-05T10:00:00Z',
    description: 'Stripe is a financial infrastructure platform for the internet.',
    website: 'https://stripe.com',
    location: 'Mumbai, India',
    recruiters_list: [
      { id: 205, name: 'Sneha Rao', email: 'sneha.r@stripe.com' }
    ]
  },
  {
    id: 5,
    name: 'Netflix Corporate',
    industry: 'Entertainment',
    owner_name: 'Ted Sarandos',
    owner_id: 105,
    recruiters_count: 12,
    total_jobs: 32,
    verification_status: 'verified',
    status: 'suspended',
    logo: '',
    created_at: '2026-03-01T15:20:00Z',
    description: 'Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, and documentaries.',
    website: 'https://netflix.com',
    location: 'Mumbai, India',
    recruiters_list: [
      { id: 206, name: 'Karan Johar', email: 'karan.j@netflix.com' }
    ]
  },
  {
    id: 6,
    name: 'Scale AI',
    industry: 'Artificial Intelligence',
    owner_name: 'Alexandr Wang',
    owner_id: 106,
    recruiters_count: 4,
    total_jobs: 9,
    verification_status: 'unverified',
    status: 'active',
    logo: '',
    created_at: '2026-07-01T08:45:00Z',
    description: 'Scale AI provides data infrastructure for AI applications.',
    website: 'https://scale.com',
    location: 'Bengaluru, India',
    recruiters_list: [
      { id: 207, name: 'Preeti Deshmukh', email: 'preeti.d@scale.com' }
    ]
  }
];

const getLocalStorageCompanies = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_COMPANIES_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_COMPANIES_KEY, JSON.stringify(INITIAL_MOCK_COMPANIES));
    return INITIAL_MOCK_COMPANIES;
  }
  return JSON.parse(data);
};

const saveLocalStorageCompanies = (companies) => {
  localStorage.setItem(LOCAL_STORAGE_COMPANIES_KEY, JSON.stringify(companies));
};

export const adminCompanyService = {
  useMock: false,

  getCompanies: async (params = {}) => {
    const { page = 1, limit = 10, search = '', verification = 'all', status = 'all', industry = 'all' } = params;
    try {
      if (adminCompanyService.useMock) throw new Error('Mock mode is active');
      const response = await api.get('/admin/companies', { params });
      return response.data;
    } catch (error) {
      console.warn('Admin API: getCompanies failed. Using local storage fallback.', error.message);
      adminCompanyService.useMock = true;

      let items = getLocalStorageCompanies();

      // Apply Search (Company Name, Industry, Owner Name)
      if (search) {
        const query = search.toLowerCase().trim();
        items = items.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.industry.toLowerCase().includes(query) ||
          c.owner_name.toLowerCase().includes(query)
        );
      }

      // Apply Verification Filter
      if (verification !== 'all') {
        items = items.filter(c => c.verification_status === verification);
      }

      // Apply Account Status Filter
      if (status !== 'all') {
        items = items.filter(c => c.status === status);
      }

      // Apply Industry Filter
      if (industry !== 'all') {
        items = items.filter(c => c.industry === industry);
      }

      // Sort: Newest created first (created_at desc)
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Pagination
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

  getCompanyDetails: async (id) => {
    try {
      if (adminCompanyService.useMock) throw new Error('Mock mode is active');
      const response = await api.get(`/admin/companies/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: getCompanyDetails(${id}) failed. Using local storage fallback.`, error.message);
      adminCompanyService.useMock = true;
      const companies = getLocalStorageCompanies();
      const company = companies.find(c => c.id === Number(id));
      if (!company) throw new Error('Company profile not found');
      return company;
    }
  },

  verifyCompany: async (id) => {
    try {
      if (adminCompanyService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/companies/${id}/verify`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: verifyCompany(${id}) failed. Using local storage fallback.`, error.message);
      adminCompanyService.useMock = true;
      const companies = getLocalStorageCompanies();
      const updated = companies.map(c => c.id === Number(id) ? { ...c, verification_status: 'verified' } : c);
      saveLocalStorageCompanies(updated);
      return { success: true, id };
    }
  },

  suspendCompany: async (id) => {
    try {
      if (adminCompanyService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/companies/${id}/suspend`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: suspendCompany(${id}) failed. Using local storage fallback.`, error.message);
      adminCompanyService.useMock = true;
      const companies = getLocalStorageCompanies();
      const updated = companies.map(c => c.id === Number(id) ? { ...c, status: 'suspended' } : c);
      saveLocalStorageCompanies(updated);
      return { success: true, id };
    }
  },

  reactivateCompany: async (id) => {
    try {
      if (adminCompanyService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/companies/${id}/reactivate`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: reactivateCompany(${id}) failed. Using local storage fallback.`, error.message);
      adminCompanyService.useMock = true;
      const companies = getLocalStorageCompanies();
      const updated = companies.map(c => c.id === Number(id) ? { ...c, status: 'active' } : c);
      saveLocalStorageCompanies(updated);
      return { success: true, id };
    }
  },

  deleteCompany: async (id) => {
    try {
      if (adminCompanyService.useMock) throw new Error('Mock mode is active');
      const response = await api.delete(`/admin/companies/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: deleteCompany(${id}) failed. Using local storage fallback.`, error.message);
      adminCompanyService.useMock = true;
      const companies = getLocalStorageCompanies();
      const updated = companies.filter(c => c.id !== Number(id));
      saveLocalStorageCompanies(updated);
      return { success: true, id };
    }
  },

  getIndustriesList: async () => {
    try {
      // Dynamic list from backend if available
      const response = await api.get('/admin/companies/industries');
      return response.data;
    } catch (error) {
      // Extract unique industries from local storage companies
      const companies = getLocalStorageCompanies();
      const industries = Array.from(new Set(companies.map(c => c.industry)));
      return industries;
    }
  }
};

export default adminCompanyService;
