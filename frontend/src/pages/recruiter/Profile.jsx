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
      
      // Upload photo (converts to base64 Data URL)
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
      const updated = await userService.updateProfile({
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
    <div className="max-w-3xl mx-auto space-y-6 pb-12 relative animate-in fade-in duration-200">
      {/* Toast notifier */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Recruiter Profile</h1>
        <p className="text-slate-500 text-sm mt-1">Manage credentials, details information, and recruiter settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Uploader Card */}
        <div className="md:col-span-1 space-y-4">
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm flex flex-col items-center">
            <AvatarUploader
              src={profileImage}
              name={name}
              onChange={handleAvatarChange}
              onRemove={handleAvatarRemove}
              isLoading={uploadLoading}
              error={errors.avatar}
            />

            {/* Headline fields */}
            <div className="text-center mt-6 space-y-1.5 border-t border-slate-100 pt-5 w-full">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Role</span>
              <h4 className="font-extrabold text-slate-700 text-xs flex items-center justify-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{jobTitle}</span>
              </h4>
              <p className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg inline-block select-none">
                {department}
              </p>
            </div>
          </Card>
        </div>

        {/* Right Side: Details Form Card */}
        <div className="md:col-span-2">
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Personal Details</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
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
                  className="rounded-xl border-slate-200 focus:border-blue-500 font-semibold text-slate-700 text-xs"
                />
              </div>

              {/* Read-Only Email input */}
              <div className="space-y-1.5">
                <Input
                  id="profile-email-input"
                  label={
                    <span className="flex items-center gap-1">
                      <span>Email Address</span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded uppercase select-none">Read-Only</span>
                    </span>
                  }
                  type="email"
                  value={user?.email || ''}
                  disabled={true}
                  className="rounded-xl border-slate-200 bg-slate-50/70 font-semibold text-slate-400 cursor-not-allowed text-xs"
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
                  className="rounded-xl border-slate-200 focus:border-blue-500 font-semibold text-slate-700 text-xs"
                />
              </div>

              {/* Save Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end w-full sm:w-auto">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={saveLoading || uploadLoading}
                  isLoading={saveLoading}
                  className="w-full sm:w-auto rounded-xl font-bold flex items-center justify-center gap-1.5 py-2.5 px-6 shadow-md shadow-blue-500/10 text-xs"
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
