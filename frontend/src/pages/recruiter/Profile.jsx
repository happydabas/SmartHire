import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Award, Briefcase, FileCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { userService } from '@/services/user/userService';

// UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import AvatarUploader from '@/components/ui/AvatarUploader';
import SkeletonProfile from '@/components/common/SkeletonProfile';
import PageHeader from '@/components/ui/PageHeader';

// Simple Phone validation helper
const PHONE_REGEX = /^\+?[0-9\s\-]{7,20}$/;

export function RecruiterProfile() {
  const { user, login } = useAuth();
  
  // Loading states
  const [initLoading, setInitLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');

  // Validation/feedback states
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Load profile details on mount
  const loadProfile = async () => {
    try {
      setInitLoading(true);
      const data = await userService.getProfile();
      
      setName(data.name || '');
      setPhone(data.phone || '');
      setProfileImage(data.profile_image || '');
      setJobTitle(data.job_title || 'Senior Technical Recruiter');
      setDepartment(data.department || 'Talent Acquisition');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load profile details.', 'error');
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Avatar upload handler
  const handleAvatarChange = async (file) => {
    try {
      setUploadLoading(true);
      setErrors(prev => ({ ...prev, avatar: '' }));
      
      const base64Url = await userService.uploadAvatar(file);
      setProfileImage(base64Url);
      
      triggerToast('Photo loaded to preview.', 'success');
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, avatar: err.message }));
      triggerToast('Photo upload failed.', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAvatarRemove = () => {
    setProfileImage('');
  };

  // Validation check on submit
  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Full Name is required';
    }
    
    if (phone.trim() && !PHONE_REGEX.test(phone.trim())) {
      newErrors.phone = 'Phone number format is invalid. Use 7-20 digits (spaces, dashes, or + accepted).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      triggerToast('Please resolve validation errors before saving.', 'error');
      return;
    }

    try {
      setSaveLoading(true);
      await userService.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        profile_image: profileImage
      });

      triggerToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to save profile changes.', 'error');
    } finally {
      setSaveLoading(false);
    }
  };

  if (initLoading) {
    return <SkeletonProfile />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative animate-in fade-in duration-200">
      {/* Toast notifier */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* 100% Completely Fixed Title Header */}
      <PageHeader
        title="Recruiter Profile"
        subtitle="Manage credentials, contact details, and recruiter settings."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Avatar Uploader Card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm flex flex-col items-center">
            <AvatarUploader
              src={profileImage}
              name={name}
              onChange={handleAvatarChange}
              onRemove={handleAvatarRemove}
              isLoading={uploadLoading}
              error={errors.avatar}
            />

            {/* Headline fields */}
            <div className="text-center mt-6 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5 w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Role</span>
              <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center justify-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{jobTitle}</span>
              </h4>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 px-3 py-1 rounded-lg inline-block select-none">
                {department}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side: Details Form Card */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Personal Credentials & Details</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Full Name input */}
              <div className="space-y-1.5">
                <Input
                  id="profile-name-input"
                  label="Full Name"
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  disabled={saveLoading}
                  className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 text-xs"
                />
              </div>

              {/* Read-Only Email input */}
              <div className="space-y-1.5">
                <Input
                  id="profile-email-input"
                  label={
                    <span className="flex items-center gap-1.5">
                      <span>Email Address</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded uppercase select-none">Read-Only</span>
                    </span>
                  }
                  type="email"
                  value={user?.email || ''}
                  disabled={true}
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs"
                />
              </div>

              {/* Phone number input */}
              <div className="space-y-1.5">
                <Input
                  id="profile-phone-input"
                  label="Phone Number"
                  placeholder="e.g. +1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={errors.phone}
                  disabled={saveLoading}
                  className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 text-xs"
                />
              </div>

              {/* Save Controls */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end w-full">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saveLoading || uploadLoading}
                  isLoading={saveLoading}
                  className="w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-1.5 py-3 px-6 shadow-md shadow-blue-500/10 text-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Save Changes</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default RecruiterProfile;
