import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { companyService } from '@/services/company/companyService';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

// UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';

export function AcceptInvitation() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [initLoading, setInitLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  // Form inputs
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('error');

  const triggerToast = (msg, type = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    const loadDetails = async () => {
      if (!token) {
        setFetchError('Invalid invitation link URL');
        setInitLoading(false);
        return;
      }

      try {
        setInitLoading(true);
        const data = await companyService.getInvitationDetails(token);
        setInvitation(data);
      } catch (err) {
        console.error('Failed to load invitation details:', err);
        const detail = err.response?.data?.error?.message || err.response?.data?.detail || 'Invitation link is invalid or expired.';
        setFetchError(detail);
      } finally {
        setInitLoading(false);
      }
    };

    loadDetails();
  }, [token]);

  const validateForm = () => {
    const newErrors = {};

    if (!invitation?.existing_user) {
      if (!name.trim()) {
        newErrors.name = 'Full name is required';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!invitation?.existing_user && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitLoading(true);
      const res = await companyService.acceptInvitation({
        token,
        name: invitation?.existing_user ? undefined : name.trim(),
        password
      });

      // Save tokens & user object
      const { access_token, refresh_token, user: userData } = res;
      storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, access_token);
      storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      storage.setItem(STORAGE_KEYS.USER, userData);

      triggerToast('Invitation accepted! Redirecting to Recruiter Console...', 'success');

      setTimeout(() => {
        window.location.href = '/recruiter';
      }, 1000);

    } catch (err) {
      console.error('Accept invitation error:', err);
      const errorsMap = parseFormErrors(err);
      if (errorsMap) {
        setErrors(errorsMap);
      } else {
        triggerToast(extractErrorMessage(err) || 'Failed to accept invitation.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex items-center justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  if (fetchError || !invitation) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border border-rose-100 bg-white dark:bg-[#0d1017] text-center space-y-4 rounded-3xl shadow-xl">
          <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Invitation Unavailable</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{fetchError || 'This invitation link is invalid or expired.'}</p>
          <Button variant="primary" size="md" onClick={() => navigate('/login')} className="w-full mt-2 rounded-xl">
            Return to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (invitation.is_expired || invitation.status !== 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border border-amber-100 bg-white dark:bg-[#0d1017] text-center space-y-4 rounded-3xl shadow-xl">
          <div className="mx-auto w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            {invitation.status === 'accepted' ? 'Invitation Already Accepted' : 'Invitation Expired'}
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            {invitation.status === 'accepted' 
              ? 'This invitation link has already been accepted. Please log in with your credentials.'
              : 'This invitation link has expired or was cancelled. Please request a new invitation from your company owner.'}
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/login')} className="w-full mt-2 rounded-xl">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      <Card className="max-w-lg w-full p-6 sm:p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0d1017] rounded-3xl shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20">
            S
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Join {invitation.company_name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            You have been invited to join <strong className="text-slate-700 dark:text-slate-200">{invitation.company_name}</strong> as a Recruiter on SmartHire.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Read-Only Email */}
          <div className="space-y-1.5">
            <Input
              id="accept-invitation-email"
              label={
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Invited Email (Read-Only)</span>
                </span>
              }
              value={invitation.recruiter_email}
              disabled={true}
              className="rounded-xl border-slate-200 bg-slate-50 dark:bg-slate-800/40 font-semibold text-slate-500 cursor-not-allowed text-xs"
            />
          </div>

          {!invitation.existing_user ? (
            <>
              {/* Name field for new user */}
              <div className="space-y-1.5">
                <Input
                  id="accept-invitation-name"
                  label="Full Name *"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={submitLoading}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <Input
                  id="accept-invitation-password"
                  type="password"
                  label="Create Password *"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={submitLoading}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>

              {/* Confirm Password field */}
              <div className="space-y-1.5">
                <Input
                  id="accept-invitation-confirm-password"
                  type="password"
                  label="Confirm Password *"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={errors.confirmPassword}
                  disabled={submitLoading}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                An account with this email address already exists. Please enter your password to accept this invitation.
              </div>

              <div className="space-y-1.5">
                <Input
                  id="accept-invitation-existing-password"
                  type="password"
                  label="Your Account Password *"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={submitLoading}
                  className="rounded-xl text-xs font-semibold"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitLoading}
            disabled={submitLoading}
            className="w-full rounded-xl font-bold flex items-center justify-center gap-2 mt-4 text-sm shadow-lg shadow-blue-500/20"
          >
            <span>Accept Invitation</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default AcceptInvitation;
