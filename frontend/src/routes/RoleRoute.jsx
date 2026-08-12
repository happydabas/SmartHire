import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

export const RoleRoute = ({ children, allowedRoles, requireOwner = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Determine owner status: check all possible indicators from the user object
  const isOwner = Boolean(
    user.is_owner === true ||
    user.role === 'company_owner' ||
    user.owned_company ||
    (user.company && user.company.owner_id === user.id)
  );

  // Check role-based access: user's role must be in allowedRoles OR they are an owner
  const roleAllowed = allowedRoles.includes(user.role) || isOwner;

  // If requireOwner is true, user must also be an owner
  const hasAccess = roleAllowed && (!requireOwner || isOwner);

  // Support both component wrapper and nested layout routes
  return hasAccess ? (children ? children : <Outlet />) : <Navigate to={ROUTES.UNAUTHORIZED} replace />;
};

export default RoleRoute;
