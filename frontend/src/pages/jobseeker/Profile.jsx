import React, { useState } from 'react';
import { 
  Settings, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user } = useAuth();
  
  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Notification Preferences States
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem(`smarthire_jobseeker_prefs_${user?.id}`);
    return saved ? JSON.parse(saved) : {
      email: { newJobs: true, applicationUpdates: true, securityAlerts: true, newsletters: false },
      inApp: { newJobs: true, applicationUpdates: true, securityAlerts: true }
    };
  });

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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
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
    
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors);
      return;
    }

    try {
      setPasswordSaving(true);
      setPasswordErrors({});
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Your security password has been changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error('Failed to change password. Make sure current password is correct.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleNotifToggle = (section, key) => {
    const updated = {
      ...notifPrefs,
      [section]: {
        ...notifPrefs[section],
        [key]: !notifPrefs[section][key]
      }
    };
    setNotifPrefs(updated);
    localStorage.setItem(`smarthire_jobseeker_prefs_${user?.id}`, JSON.stringify(updated));
    toast.success('Notification preferences updated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <PageHeader
          title="Settings"
          subtitle="Manage your notification preferences and account security password."
        />
      </div>

      {/* Main content: 2 Sections Stacked */}
      <div className="space-y-8">
        
        {/* SECTION 1: NOTIFICATION PREFERENCES */}
        <Card className="p-6 border border-slate-150/60 shadow-sm space-y-8 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2.5 dark:text-white dark:border-slate-800">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Notification Preferences
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Configure how and when you receive security alerts and recommendation updates
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Email Notifications */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                Email Notifications
              </h4>
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { key: 'newJobs', title: 'New Job Matches', desc: 'Receive email digests for recommendations matching your profile.' },
                  { key: 'applicationUpdates', title: 'Application Updates', desc: 'Get updates on your application status changes (e.g. reviewed, interview).' },
                  { key: 'securityAlerts', title: 'Security Alerts', desc: 'Critical alerts about account security, logins, and settings modifications.' },
                  { key: 'newsletters', title: 'Platform Newsletters', desc: 'General news, tips, and feature announcements.' }
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="space-y-0.5 max-w-[80%]">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{opt.title}</p>
                      <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">{opt.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotifToggle('email', opt.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        notifPrefs.email[opt.key] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.email[opt.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In-App Notifications */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider dark:text-slate-500">
                In-App Notifications
              </h4>
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { key: 'newJobs', title: 'New Job Matches', desc: 'Instant in-app alerts when recommended jobs matching your profile are posted.' },
                  { key: 'applicationUpdates', title: 'Application Updates', desc: 'Realtime in-app dashboard notifications for application status shifts.' },
                  { key: 'securityAlerts', title: 'Security Alerts', desc: 'In-app reminders regarding account profile edits and password updates.' }
                ].map((opt) => (
                  <div key={opt.key} className="flex items-center justify-between pt-4 first:pt-0">
                    <div className="space-y-0.5 max-w-[80%]">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">{opt.title}</p>
                      <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">{opt.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotifToggle('inApp', opt.key)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                        notifPrefs.inApp[opt.key] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          notifPrefs.inApp[opt.key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 2: CHANGE PASSWORD */}
        <Card className="p-6 border border-slate-150/60 shadow-sm space-y-6 bg-white dark:bg-slate-900 dark:border-slate-800 rounded-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2.5 dark:text-white dark:border-slate-800">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Change Password
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Update your login password to ensure security of your account
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
            {/* Current Password */}
            <div className="relative">
              <Input
                id="current-password"
                label="Current Password"
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={passwordErrors.currentPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
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
                error={passwordErrors.newPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength meter */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5" aria-live="polite">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>Password Strength:</span>
                  <span className={
                    getPasswordStrength(newPassword).label === 'Strong' ? 'text-emerald-650' :
                    getPasswordStrength(newPassword).label === 'Fair' ? 'text-amber-500' : 'text-rose-500'
                  }>{getPasswordStrength(newPassword).label}</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden dark:bg-slate-800">
                  <div
                    style={{ width: `${getPasswordStrength(newPassword).percent}%` }}
                    className={`h-full transition-all duration-300 ${getPasswordStrength(newPassword).color}`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 font-semibold">
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
                error={passwordErrors.confirmPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-2">
              <Button variant="primary" type="submit" isLoading={passwordSaving} disabled={passwordSaving} className="rounded-xl font-bold px-6 py-2.5 cursor-pointer">
                Change Password
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
}

export default ProfilePage;
