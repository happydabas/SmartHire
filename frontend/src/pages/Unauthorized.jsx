import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';

function Unauthorized() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const handleReturn = () => {
    if (!isAuthenticated || !user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    let redirectPath = ROUTES.HOME;
    if (user.role === ROLES.JOB_SEEKER) redirectPath = ROUTES.DASHBOARD;
    else if (user.role === ROLES.RECRUITER) redirectPath = ROUTES.RECRUITER;
    else if (user.role === ROLES.COMPANY_OWNER) redirectPath = ROUTES.COMPANY;
    else if (user.role === ROLES.ADMIN) redirectPath = ROUTES.ADMIN;

    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6 text-center">
        <h2 className="text-3xl font-extrabold text-red-600">Access Denied</h2>
        <p className="text-slate-600 font-medium">
          You do not have permission to access this page.
        </p>
        <Button onClick={handleReturn} className="w-full py-3">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default Unauthorized;
