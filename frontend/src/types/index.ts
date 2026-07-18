export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'candidate' | 'recruiter' | 'admin';
  createdAt: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  isActive: boolean;
  postedBy: string;
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileUrl: string;
  parsedData?: {
    skills: string[];
    experience: string[];
    education: string[];
    summary?: string;
  };
  createdAt: string;
}
