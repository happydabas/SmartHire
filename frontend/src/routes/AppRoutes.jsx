import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '@/components/layout/MainLayout';
import AuthLayout from '@/components/layout/AuthLayout';
import DashboardLayout from '@/components/layout/DashboardLayout';
import RecruiterLayout from '@/layouts/RecruiterLayout';

// Loading fallback
import FullPageLoader from '@/components/common/FullPageLoader';

// Pages
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const JobSeekerDashboard = lazy(() => import('@/pages/jobseeker/Dashboard'));
const RecruiterDashboard = lazy(() => import('@/pages/recruiter/Dashboard'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const Profile = lazy(() => import('@/pages/jobseeker/Profile'));
const Resume = lazy(() => import('@/pages/jobseeker/Resume'));
const AIInsights = lazy(() => import('@/pages/jobseeker/AIInsights'));
const HiringInsights = lazy(() => import('@/pages/recruiter/HiringInsights'));

const Jobs = lazy(() => import('@/pages/jobs/Jobs'));
const JobDetails = lazy(() => import('@/pages/jobs/JobDetails'));
const SavedJobs = lazy(() => import('@/pages/jobseeker/SavedJobs'));
const Applications = lazy(() => import('@/pages/jobseeker/Applications'));
const ManageJobs = lazy(() => import('@/pages/recruiter/ManageJobs'));
const CreateJob = lazy(() => import('@/pages/recruiter/CreateJob'));
const EditJob = lazy(() => import('@/pages/recruiter/EditJob'));
const Applicants = lazy(() => import('@/pages/recruiter/Applicants'));
const ApplicantDetails = lazy(() => import('@/pages/recruiter/ApplicantDetails'));
const RecruiterProfile = lazy(() => import('@/pages/recruiter/Profile'));
const RecruiterCompanySettings = lazy(() => import('@/pages/recruiter/CompanySettings'));
const RecruiterManagement = lazy(() => import('@/pages/recruiter/RecruiterManagement'));
const AcceptInvitation = lazy(() => import('@/pages/auth/AcceptInvitation'));
const CompanyDashboard = lazy(() => import('@/pages/CompanyDashboard'));
const CompanySettings = lazy(() => import('@/pages/CompanySettings'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ServerError = lazy(() => import('@/pages/ServerError'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const UserDetails = lazy(() => import('@/pages/admin/UserDetails'));
const CompanyManagement = lazy(() => import('@/pages/admin/CompanyManagement'));
const CompanyDetails = lazy(() => import('@/pages/admin/CompanyDetails'));
const JobModeration = lazy(() => import('@/pages/admin/JobModeration'));
const AdminJobDetails = lazy(() => import('@/pages/admin/JobDetails'));
const AnalyticsDashboard = lazy(() => import('@/pages/admin/AnalyticsDashboard'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));

// Guards
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Constants
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';

function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
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

        {/* 3. Protected Dashboard Pages mapped inside DashboardLayout (Job Seeker Panel) */}
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
            <Route path={ROUTES.AI_INSIGHTS} element={<AIInsights />} />

            <Route path={ROUTES.JOBS} element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path={ROUTES.SAVED_JOBS} element={<SavedJobs />} />
            <Route path={ROUTES.APPLICATIONS} element={<Applications />} />
            <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          </Route>

          {/* Company Owner Access Panel */}
          <Route element={<RoleRoute allowedRoles={[ROLES.COMPANY_OWNER]} />}>
            <Route path={ROUTES.COMPANY} element={<CompanyDashboard />} />
            <Route path={ROUTES.COMPANY_SETTINGS} element={<CompanySettings />} />
          </Route>

          {/* Admin Access Panel */}
          <Route element={<RoleRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
            <Route path={ROUTES.ADMIN_USERS} element={<UserManagement />} />
            <Route path={ROUTES.ADMIN_USER_DETAILS} element={<UserDetails />} />
            <Route path={ROUTES.ADMIN_COMPANIES} element={<CompanyManagement />} />
            <Route path={ROUTES.ADMIN_COMPANY_DETAILS} element={<CompanyDetails />} />
            <Route path={ROUTES.ADMIN_JOBS} element={<JobModeration />} />
            <Route path={ROUTES.ADMIN_JOB_DETAILS} element={<AdminJobDetails />} />
            <Route path={ROUTES.ADMIN_ANALYTICS} element={<AnalyticsDashboard />} />
            <Route path={ROUTES.ADMIN_SETTINGS} element={<AdminSettings />} />
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
          {/* All Recruiter & Owner Routes — owner-only pages enforce access at the component + backend level */}
          <Route element={<RoleRoute allowedRoles={[ROLES.RECRUITER, ROLES.COMPANY_OWNER]} />}>
            <Route path={ROUTES.RECRUITER} element={<RecruiterDashboard />} />
            <Route path={ROUTES.RECRUITER_JOBS} element={<ManageJobs />} />
            <Route path={ROUTES.RECRUITER_CREATE_JOB} element={<CreateJob />} />
            <Route path={ROUTES.RECRUITER_EDIT_JOB} element={<EditJob />} />
            <Route path={ROUTES.RECRUITER_APPLICANTS} element={<Applicants />} />
            <Route path={ROUTES.RECRUITER_APPLICANT_DETAILS} element={<ApplicantDetails />} />
            <Route path={ROUTES.RECRUITER_PROFILE} element={<RecruiterProfile />} />
            <Route path={ROUTES.RECRUITER_INSIGHTS} element={<HiringInsights />} />
            <Route path={ROUTES.RECRUITER_NOTIFICATIONS} element={<Notifications />} />
            <Route path="/recruiter/team" element={<RecruiterManagement />} />
            <Route path={ROUTES.RECRUITER_COMPANY_SETTINGS} element={<RecruiterCompanySettings />} />
          </Route>
        </Route>

        {/* 4. Standalone Public Pages */}
        <Route path="/invitations/accept/:token" element={<AcceptInvitation />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="/500" element={<ServerError />} />
        
        {/* 404 Fallback Catchall Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
