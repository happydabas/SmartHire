import api from './api/axios';

const LOCAL_STORAGE_USERS_KEY = 'smarthire_admin_users';

const INITIAL_MOCK_USERS = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    role: 'job_seeker',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-15T09:30:00Z',
    contact_phone: '+91 98765 43210',
    contact_location: 'Mumbai, India',
    resume_url: '#',
    resume_name: 'Rahul_Sharma_Resume.pdf',
    registration_date: '2026-07-15T09:30:00Z'
  },
  {
    id: 2,
    name: 'Neha Kapoor',
    email: 'neha.kapoor@vercel.com',
    role: 'recruiter',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-14T14:15:00Z',
    contact_phone: '+91 87654 32109',
    contact_location: 'Bangalore, India',
    company_name: 'Vercel India',
    registration_date: '2026-07-14T14:15:00Z'
  },
  {
    id: 3,
    name: 'Amit Patel',
    email: 'amit.patel@smarthire.com',
    role: 'admin',
    status: 'active',
    avatar: '',
    joined_date: '2026-06-01T08:00:00Z',
    contact_phone: '+91 76543 21098',
    contact_location: 'Delhi, India',
    registration_date: '2026-06-01T08:00:00Z'
  },
  {
    id: 4,
    name: 'Priya Mehta',
    email: 'priya.mehta@example.com',
    role: 'job_seeker',
    status: 'inactive',
    avatar: '',
    joined_date: '2026-07-18T11:20:00Z',
    contact_phone: '+91 65432 10987',
    contact_location: 'Pune, India',
    resume_url: '#',
    resume_name: 'Priya_Mehta_CV.pdf',
    registration_date: '2026-07-18T11:20:00Z'
  },
  {
    id: 5,
    name: 'Aarav Gupta',
    email: 'aarav.gupta@meta.com',
    role: 'recruiter',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-10T16:45:00Z',
    contact_phone: '+91 99887 76655',
    contact_location: 'Hyderabad, India',
    company_name: 'Meta Platforms',
    registration_date: '2026-07-10T16:45:00Z'
  },
  {
    id: 6,
    name: 'Vikram Singh',
    email: 'vikram.singh@example.com',
    role: 'job_seeker',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-16T13:10:00Z',
    contact_phone: '+91 88776 65544',
    contact_location: 'Chennai, India',
    resume_url: '#',
    resume_name: 'Vikram_Singh_Resume.pdf',
    registration_date: '2026-07-16T13:10:00Z'
  },
  {
    id: 7,
    name: 'Sonia Sen',
    email: 'sonia.sen@google.com',
    role: 'recruiter',
    status: 'inactive',
    avatar: '',
    joined_date: '2026-07-11T10:05:00Z',
    contact_phone: '+91 77665 54433',
    contact_location: 'Gurugram, India',
    company_name: 'Google India',
    registration_date: '2026-07-11T10:05:00Z'
  },
  {
    id: 8,
    name: 'Rohan Patil',
    email: 'rohan.patil@example.com',
    role: 'job_seeker',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-20T17:50:00Z',
    contact_phone: '+91 66554 43322',
    contact_location: 'Mumbai, India',
    resume_url: '#',
    resume_name: 'Rohan_Patil_Resume.pdf',
    registration_date: '2026-07-20T17:50:00Z'
  },
  {
    id: 9,
    name: 'Sneha Rao',
    email: 'sneha.rao@stripe.com',
    role: 'recruiter',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-12T09:15:00Z',
    contact_phone: '+91 55443 32211',
    contact_location: 'Bangalore, India',
    company_name: 'Stripe India',
    registration_date: '2026-07-12T09:15:00Z'
  },
  {
    id: 10,
    name: 'Karan Malhotra',
    email: 'karan.malhotra@example.com',
    role: 'job_seeker',
    status: 'active',
    avatar: '',
    joined_date: '2026-07-22T14:40:00Z',
    contact_phone: '+91 91234 56789',
    contact_location: 'Noida, India',
    resume_url: '#',
    resume_name: 'Karan_Malhotra_CV.pdf',
    registration_date: '2026-07-22T14:40:00Z'
  },
  {
    id: 11,
    name: 'Anjali Desai',
    email: 'anjali.desai@example.com',
    role: 'job_seeker',
    status: 'inactive',
    avatar: '',
    joined_date: '2026-07-23T11:00:00Z',
    contact_phone: '+91 81234 56789',
    contact_location: 'Ahmedabad, India',
    resume_url: '#',
    resume_name: 'Anjali_Desai_Resume.pdf',
    registration_date: '2026-07-23T11:00:00Z'
  }
];

const getLocalStorageUsers = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(INITIAL_MOCK_USERS));
    return INITIAL_MOCK_USERS;
  }
  return JSON.parse(data);
};

const saveLocalStorageUsers = (users) => {
  localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
};

export const adminUserService = {
  useMock: false,

  getUsers: async (params = {}) => {
    const { page = 1, limit = 10, search = '', role = 'all', status = 'all' } = params;
    try {
      if (adminUserService.useMock) throw new Error('Mock mode is active');
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.warn('Admin API: getUsers failed. Using local storage fallback.', error.message);
      adminUserService.useMock = true;

      let items = getLocalStorageUsers();

      // Apply Search Filter (Name, Email)
      if (search) {
        const query = search.toLowerCase().trim();
        items = items.filter(u => 
          u.name.toLowerCase().includes(query) || 
          u.email.toLowerCase().includes(query)
        );
      }

      // Apply Role Filter
      if (role !== 'all') {
        items = items.filter(u => u.role === role);
      }

      // Apply Status Filter
      if (status !== 'all') {
        items = items.filter(u => u.status === status);
      }

      // Sort: Newest registered first (joined_date desc)
      items.sort((a, b) => new Date(b.joined_date) - new Date(a.joined_date));

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

  getUserDetails: async (id) => {
    try {
      if (adminUserService.useMock) throw new Error('Mock mode is active');
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: getUserDetails(${id}) failed. Using local storage fallback.`, error.message);
      adminUserService.useMock = true;
      const users = getLocalStorageUsers();
      const user = users.find(u => u.id === Number(id));
      if (!user) throw new Error('User not found');
      return user;
    }
  },

  activateUser: async (id) => {
    try {
      if (adminUserService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/users/${id}/activate`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: activateUser(${id}) failed. Using local storage fallback.`, error.message);
      adminUserService.useMock = true;
      const users = getLocalStorageUsers();
      const updated = users.map(u => u.id === Number(id) ? { ...u, status: 'active' } : u);
      saveLocalStorageUsers(updated);
      return { success: true, id };
    }
  },

  deactivateUser: async (id) => {
    try {
      if (adminUserService.useMock) throw new Error('Mock mode is active');
      const response = await api.post(`/admin/users/${id}/deactivate`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: deactivateUser(${id}) failed. Using local storage fallback.`, error.message);
      adminUserService.useMock = true;
      const users = getLocalStorageUsers();
      const updated = users.map(u => u.id === Number(id) ? { ...u, status: 'inactive' } : u);
      saveLocalStorageUsers(updated);
      return { success: true, id };
    }
  },

  deleteUser: async (id) => {
    try {
      if (adminUserService.useMock) throw new Error('Mock mode is active');
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.warn(`Admin API: deleteUser(${id}) failed. Using local storage fallback.`, error.message);
      adminUserService.useMock = true;
      const users = getLocalStorageUsers();
      const updated = users.filter(u => u.id !== Number(id));
      saveLocalStorageUsers(updated);
      return { success: true, id };
    }
  }
};

export default adminUserService;
