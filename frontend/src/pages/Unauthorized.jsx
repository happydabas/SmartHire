import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import UnauthorizedComponent from '@/components/common/Unauthorized';

export function UnauthorizedPage() {
  const { user, isAuthenticated } = useAuth();

  const getReturnPath = () => {
    if (!isAuthenticated || !user) {
      return ROUTES.LOGIN || '/login';
    }

    if (user.role === ROLES.JOB_SEEKER) return ROUTES.DASHBOARD || '/dashboard';
    if (user.role === ROLES.RECRUITER) return ROUTES.RECRUITER || '/recruiter';
    if (user.role === ROLES.COMPANY_OWNER) return ROUTES.COMPANY || '/company';
    if (user.role === ROLES.ADMIN) return ROUTES.ADMIN || '/admin';

    return ROUTES.HOME || '/';
  };

  return <UnauthorizedComponent homePath={getReturnPath()} />;
}

export default UnauthorizedPage;
