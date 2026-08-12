import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    let redirectPath = ROUTES.HOME;
    
    if (user.role === ROLES.JOB_SEEKER) redirectPath = ROUTES.DASHBOARD;
    else if (user.role === ROLES.RECRUITER || user.role === ROLES.COMPANY_OWNER) redirectPath = ROUTES.RECRUITER;
    else if (user.role === ROLES.ADMIN) redirectPath = ROUTES.ADMIN;

    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;
