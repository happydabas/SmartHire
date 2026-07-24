import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RecruiterLayout from '@/layouts/RecruiterLayout';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import JobSeekerDashboard from '@/pages/jobseeker/Dashboard';
import RecruiterDashboard from '@/pages/recruiter/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import Profile from '@/pages/jobseeker/Profile';
import Resume from '@/pages/jobseeker/Resume';

import Jobs from '@/pages/jobs/Jobs';
import JobDetails from '@/pages/jobs/JobDetails';
import SavedJobs from '@/pages/jobseeker/SavedJobs';
import Applications from '@/pages/jobseeker/Applications';
import ManageJobs from '@/pages/recruiter/ManageJobs';
import CreateJob from '@/pages/recruiter/CreateJob';
import EditJob from '@/pages/recruiter/EditJob';
import Applicants from '@/pages/recruiter/Applicants';
import ApplicantDetails from '@/pages/recruiter/ApplicantDetails';
import RecruiterProfile from '@/pages/recruiter/Profile';
import RecruiterCompanySettings from '@/pages/recruiter/CompanySettings';
import CompanyDashboard from '@/pages/CompanyDashboard';
import CompanySettings from '@/pages/CompanySettings';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';

// Guards
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Constants
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';

function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public Routes mapped inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
      </Route>

      {/* 2. Public Auth Routes (Redirects to dashboard if already logged in) */}
      <Route element={<AuthLayout />}>
        <Route 
          path={ROUTES.LOGIN} 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path={ROUTES.REGISTER} 
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } 
        />
      </Route>

      {/* 3. Protected Dashboard Pages mapped inside DashboardLayout */}
      <Route 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Job Seeker Access Panel */}
        <Route element={<RoleRoute allowedRoles={[ROLES.JOB_SEEKER]} />}>
          <Route path={ROUTES.DASHBOARD} element={<JobSeekerDashboard />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.RESUME} element={<Resume />} />
          <Route path={ROUTES.EDUCATION} element={<Navigate to={ROUTES.RESUME} replace />} />
          <Route path={ROUTES.EXPERIENCE} element={<Navigate to={ROUTES.RESUME} replace />} />
          <Route path={ROUTES.SKILLS} element={<Navigate to={ROUTES.RESUME} replace />} />

          <Route path={ROUTES.JOBS} element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path={ROUTES.SAVED_JOBS} element={<SavedJobs />} />
          <Route path={ROUTES.APPLICATIONS} element={<Applications />} />
        </Route>

        {/* Company Owner Access Panel */}
        <Route element={<RoleRoute allowedRoles={[ROLES.COMPANY_OWNER]} />}>
          <Route path={ROUTES.COMPANY} element={<CompanyDashboard />} />
          <Route path={ROUTES.COMPANY_SETTINGS} element={<CompanySettings />} />
        </Route>

        {/* Admin Access Panel */}
        <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Recruiter Access Panel (Separated to use RecruiterLayout instead of DashboardLayout) */}
      <Route 
        element={
          <ProtectedRoute>
            <RecruiterLayout />
          </ProtectedRoute>
        }
      >
        <Route element={<RoleRoute allowedRoles={[ROLES.RECRUITER]} />}>
          <Route path={ROUTES.RECRUITER} element={<RecruiterDashboard />} />
          <Route path={ROUTES.RECRUITER_JOBS} element={<ManageJobs />} />
          <Route path={ROUTES.RECRUITER_CREATE_JOB} element={<CreateJob />} />
          <Route path={ROUTES.RECRUITER_EDIT_JOB} element={<EditJob />} />
          <Route path={ROUTES.RECRUITER_APPLICANTS} element={<Applicants />} />
          <Route path={ROUTES.RECRUITER_APPLICANT_DETAILS} element={<ApplicantDetails />} />
          <Route path={ROUTES.RECRUITER_PROFILE} element={<RecruiterProfile />} />
          <Route path={ROUTES.RECRUITER_COMPANY_SETTINGS} element={<RecruiterCompanySettings />} />
        </Route>
      </Route>

      {/* 4. Standalone Public Pages */}
      <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      
      {/* 404 Fallback Catchall Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
