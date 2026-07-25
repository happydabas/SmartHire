import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

export function SecurityTab({ onPasswordUpdate }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength checker
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '', percent: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { label: 'Weak', color: 'bg-rose-500', percent: 25 };
    if (score <= 3) return { label: 'Fair', color: 'bg-amber-500', percent: 60 };
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 };
  };

  const strength = getPasswordStrength(newPassword);

  const validate = () => {
    const nextErrors = {};
    if (!currentPassword) nextErrors.currentPassword = 'Current password is required';
    if (!newPassword) {
      nextErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = 'Password must be at least 8 characters long';
    }
    if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await onPasswordUpdate(currentPassword, newPassword);
      toast.success('Your security password has been changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      toast.error('Failed to change password. Make sure current password is correct.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-6">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white">
          Security Settings
        </h3>
        <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">
          Update your login password and manage access keys
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
        
        {/* Current Password */}
        <div className="relative">
          <Input
            id="current-password"
            label="Current Password"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            error={errors.currentPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-655 focus:outline-none"
            aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
          >
            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <Input
            id="new-password"
            label="New Password"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-655 focus:outline-none"
            aria-label={showNew ? 'Hide new password' : 'Show new password'}
          >
            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Strength meter */}
        {newPassword.length > 0 && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="flex justify-between items-center text-xs font-bold text-slate-450 dark:text-slate-500">
              <span>Password Strength:</span>
              <span className={
                strength.label === 'Strong' ? 'text-emerald-600 dark:text-emerald-450' :
                strength.label === 'Fair' ? 'text-amber-500' : 'text-rose-500'
              }>{strength.label}</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden dark:bg-slate-800">
              <div
                style={{ width: `${strength.percent}%` }}
                className={`h-full transition-all duration-350 ${strength.color}`}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold dark:text-slate-505">
              Tip: Use uppercase letters, numbers, and special symbols for stronger combinations.
            </p>
          </div>
        )}

        {/* Confirm Password */}
        <div className="relative">
          <Input
            id="confirm-password"
            label="Confirm New Password"
            type={showConfirm ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-655 focus:outline-none"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <div className="pt-2">
          <Button variant="primary" type="submit" disabled={saving} className="rounded-xl font-black px-6 py-2.5">
            {saving ? 'Updating...' : 'Change Password'}
          </Button>
        </div>

      </form>
    </div>
  );
}

export default SecurityTab;
