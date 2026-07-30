import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Briefcase, 
  Camera, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Globe,
  Settings,
  Lock,
  Bell,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile/profileService';
import { validators } from '@/utils/validators';
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';
import { toast } from 'sonner';

// Reusable UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import SkeletonProfile from '@/components/common/SkeletonProfile';

export function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'account' | 'security' | 'notifications' | 'logout'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };
  
  // Profile state matching the DB schema plus headline (simulated)
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    professional_summary: '',
    profile_photo_url: '',
    headline: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const fileInputRef = useRef(null);

  // Phone number validation regex matching backend
  const PHONE_REGEX = /^\+?[0-9\s\-]{7,20}$/;

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const profile = await profileService.getProfile();
      
      // Load saved headline from localStorage if any, or default to a standard placeholder
      const savedHeadline = localStorage.getItem(`profile_headline_${user?.id}`) || '';

      if (profile) {
        setProfileData({
          full_name: profile.full_name || '',
          phone_number: profile.phone_number || '',
          date_of_birth: profile.date_of_birth || '',
          gender: profile.gender || '',
          address: profile.address || '',
          city: profile.city || '',
          state: profile.state || '',
          country: profile.country || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_url || '',
          professional_summary: profile.professional_summary || '',
          profile_photo_url: profile.profile_photo_url || '',
          headline: savedHeadline,
        });
        if (profile.profile_photo_url) {
          setPhotoPreview(profile.profile_photo_url);
        }
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      // If 404, we assume profile is empty and needs to be created
      if (err.response?.status === 404) {
        setProfileData(prev => ({
          ...prev,
          full_name: user?.name || '',
          headline: localStorage.getItem(`profile_headline_${user?.id}`) || '',
        }));
      } else {
        setError("Failed to load profile details. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfileData(prev => ({ ...prev, [id]: value }));
    // Clear validation error on change
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Required Fields
    const required = [
      'full_name', 
      'phone_number', 
      'date_of_birth', 
      'gender', 
      'country', 
      'state', 
      'city', 
      'address'
    ];
    
    required.forEach(field => {
      if (!profileData[field] || !profileData[field].trim()) {
        errors[field] = 'This field is required';
      }
    });

    // 2. Phone validation
    if (profileData.phone_number && !PHONE_REGEX.test(profileData.phone_number.trim())) {
      errors.phone_number = "Phone number must contain between 7 to 20 digits and can only include '+', '-', or spaces.";
    }

    // 3. Optional URLs check
    const urlFields = ['linkedin_url', 'github_url', 'portfolio_url'];
    urlFields.forEach(field => {
      if (profileData[field] && profileData[field].trim()) {
        const val = profileData[field].trim();
        if (!val.startsWith('http://') && !val.startsWith('https://')) {
          errors[field] = 'Must be a valid HTTP or HTTPS URL';
        }
      }
    });

    // 4. Photo file local validation (type & size)
    if (photoFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(photoFile.type)) {
        errors.photo = 'Only JPEG, PNG, and WebP images are supported';
      }
      if (photoFile.size > 2 * 1024 * 1024) {
        errors.photo = 'Profile photo must be smaller than 2MB';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local validation checks before rendering preview
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFieldErrors(prev => ({ ...prev, photo: 'Only JPEG, PNG, and WebP images are supported' }));
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setFieldErrors(prev => ({ ...prev, photo: 'Profile photo must be smaller than 2MB' }));
      return;
    }

    setFieldErrors(prev => ({ ...prev, photo: null }));
    setPhotoFile(file);

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm() || saving) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      let finalPhotoUrl = profileData.profile_photo_url;

      // 1. Upload photo if selected
      if (photoFile) {
        try {
          const uploadRes = await profileService.uploadPhoto(photoFile);
          finalPhotoUrl = uploadRes.url;
        } catch (uploadErr) {
          setError("Failed to upload profile photo. Please try again.");
          setSaving(false);
          return;
        }
      }

      // 2. Prepare database payload (omitting custom headline field)
      const payload = {
        full_name: profileData.full_name.trim(),
        phone_number: profileData.phone_number.trim(),
        date_of_birth: profileData.date_of_birth,
        gender: profileData.gender,
        address: profileData.address.trim(),
        city: profileData.city.trim(),
        state: profileData.state.trim(),
        country: profileData.country.trim(),
        linkedin_url: profileData.linkedin_url.trim() || null,
        github_url: profileData.github_url.trim() || null,
        portfolio_url: profileData.portfolio_url.trim() || null,
        professional_summary: profileData.professional_summary.trim() || null,
        profile_photo_url: finalPhotoUrl || null,
      };

      // 3. Check if profile exists, update or create accordingly
      let response;
      try {
        await profileService.getProfile();
        response = await profileService.updateProfile(payload);
      } catch (getErr) {
        if (getErr.response?.status === 404) {
          response = await profileService.createProfile(payload);
        } else {
          throw getErr;
        }
      }

      // 4. Save custom headline field locally
      if (profileData.headline) {
        localStorage.setItem(`profile_headline_${user?.id}`, profileData.headline.trim());
      } else {
        localStorage.removeItem(`profile_headline_${user?.id}`);
      }

      setProfileData(prev => ({
        ...prev,
        profile_photo_url: response.profile_photo_url || '',
      }));
      setPhotoFile(null);
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Save profile error:", err);
      const errorsMap = parseFormErrors(err);
      if (errorsMap) {
        setFieldErrors(errorsMap);
        setError("Please correct the validation errors in the form.");
      } else {
        setError(extractErrorMessage(err) || "Failed to save profile changes. Please verify input formats and try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-slate-555 text-sm mt-1">Manage your personal details, location preferences, and account configurations.</p>
        </div>

        {error && activeTab === 'personal' && (
          <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && activeTab === 'personal' && (
          <div className="flex items-center gap-3 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}
      </div>

      {/* Tabs selectors row */}
      <div className="border-b border-slate-100 dark:border-slate-800">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Profile tabs">
          {[
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'account', label: 'Account Settings', icon: Settings },
            { id: 'security', label: 'Change Password', icon: Lock },
            { id: 'notifications', label: 'Notification Preferences', icon: Bell },
            { id: 'logout', label: 'Logout', icon: LogOut }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-4 text-sm font-extrabold transition-all border-b-2 outline-none whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-350'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === 'personal' && (
        <form onSubmit={handleSave} className="space-y-8 animate-fadeIn">
          
          {/* Photo & Basic Details Card */}
          <Card className="p-6 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> Personal Information
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-8 pt-2">
              {/* Profile Photo Uploader */}
              <div className="relative group">
                <Avatar 
                  src={photoPreview} 
                  alt={profileData.full_name || user?.name} 
                  size="xl" 
                  className="ring-4 ring-slate-100 shadow-inner"
                />
                <button
                  type="button"
                  onClick={handleTriggerFileInput}
                  disabled={saving}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Upload Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  id="full_name"
                  value={profileData.full_name}
                  onChange={handleInputChange}
                  error={fieldErrors.full_name}
                  placeholder="Enter full name"
                  disabled={saving}
                  required
                />

                <Input
                  label="Email Address"
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  placeholder="Account email"
                  className="bg-slate-50 border-slate-200 cursor-not-allowed text-slate-500"
                />

                <Input
                  label="Phone Number"
                  id="phone_number"
                  value={profileData.phone_number}
                  onChange={handleInputChange}
                  error={fieldErrors.phone_number}
                  placeholder="+1 234 567 8900"
                  disabled={saving}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Date of Birth"
                    id="date_of_birth"
                    type="date"
                    value={profileData.date_of_birth}
                    onChange={handleInputChange}
                    error={fieldErrors.date_of_birth}
                    disabled={saving}
                    required
                  />

                  <div className="space-y-1.5">
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      value={profileData.gender}
                      onChange={handleInputChange}
                      disabled={saving}
                      className={`block w-full rounded-2xl border ${fieldErrors.gender ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500'} bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400`}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {fieldErrors.gender && (
                      <p className="text-xs font-semibold text-red-500 select-none">{fieldErrors.gender}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {fieldErrors.photo && (
              <p className="text-xs font-semibold text-red-500 text-center">{fieldErrors.photo}</p>
            )}
          </Card>

          {/* Location Preferences */}
          <Card className="p-6 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> Location Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Input
                label="Country"
                id="country"
                value={profileData.country}
                onChange={handleInputChange}
                error={fieldErrors.country}
                placeholder="e.g. United States"
                disabled={saving}
                required
              />
              <Input
                label="State / Province"
                id="state"
                value={profileData.state}
                onChange={handleInputChange}
                error={fieldErrors.state}
                placeholder="e.g. California"
                disabled={saving}
                required
              />
              <Input
                label="City"
                id="city"
                value={profileData.city}
                onChange={handleInputChange}
                error={fieldErrors.city}
                placeholder="e.g. San Francisco"
                disabled={saving}
                required
              />
            </div>

            <Input
              label="Street Address"
              id="address"
              value={profileData.address}
              onChange={handleInputChange}
              error={fieldErrors.address}
              placeholder="e.g. 123 Main St, Apt 4"
              disabled={saving}
              required
            />
          </Card>

          {/* Professional Profile */}
          <Card className="p-6 border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" /> Professional Information
            </h2>

            <Input
              label="Headline"
              id="headline"
              value={profileData.headline}
              onChange={handleInputChange}
              placeholder="e.g. Senior Frontend Engineer | React & Next.js Specialist"
              disabled={saving}
            />

            <Textarea
              label="About Me / Summary"
              id="professional_summary"
              value={profileData.professional_summary}
              onChange={handleInputChange}
              placeholder="Write a brief professional summary about yourself, your career highlights, and major achievements..."
              rows={5}
              disabled={saving}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              <Input
                label="LinkedIn Profile URL"
                id="linkedin_url"
                value={profileData.linkedin_url}
                onChange={handleInputChange}
                error={fieldErrors.linkedin_url}
                placeholder="https://linkedin.com/in/username"
                disabled={saving}
              />
              <Input
                label="GitHub Profile URL"
                id="github_url"
                value={profileData.github_url}
                onChange={handleInputChange}
                error={fieldErrors.github_url}
                placeholder="https://github.com/username"
                disabled={saving}
              />
              <Input
                label="Portfolio URL"
                id="portfolio_url"
                value={profileData.portfolio_url}
                onChange={handleInputChange}
                error={fieldErrors.portfolio_url}
                placeholder="https://username.dev"
                disabled={saving}
              />
            </div>
          </Card>

          {/* Action Button */}
          <div className="flex justify-end pt-4 w-full sm:w-auto">
            <Button
              type="submit"
              isLoading={saving}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile Settings
            </Button>
          </div>

        </form>
      )}

      {activeTab === 'account' && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="p-6 border border-slate-100 shadow-sm space-y-6 bg-white dark:bg-slate-900 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 dark:text-white dark:border-slate-800">
              <Settings className="w-5 h-5 text-blue-600" /> Account Settings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Account Email"
                value={user?.email || ''}
                disabled
                className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed text-xs font-semibold"
              />
              <Input
                label="Security Role"
                value={user?.role?.replace('_', ' ') || 'JOB SEEKER'}
                disabled
                className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed capitalize text-xs font-semibold"
              />
              <Input
                label="Account ID"
                value={user?.id || 'N/A'}
                disabled
                className="bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed text-xs font-semibold"
              />
              <Input
                label="Account Status"
                value="Active"
                disabled
                className="bg-slate-50 border-slate-200 text-slate-555 cursor-not-allowed text-xs font-semibold"
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="p-6 border border-slate-100 shadow-sm space-y-6 bg-white dark:bg-slate-900 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 dark:text-white dark:border-slate-800">
                <Lock className="w-5 h-5 text-blue-600" /> Change Password
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
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
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
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
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
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" isLoading={passwordSaving} disabled={passwordSaving} className="rounded-xl font-bold px-6 py-2.5">
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6 animate-fadeIn">
          <Card className="p-6 border border-slate-100 shadow-sm space-y-8 bg-white dark:bg-slate-900 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2 dark:text-white dark:border-slate-800">
                <Bell className="w-5 h-5 text-blue-600" /> Notification Preferences
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
        </div>
      )}

      {activeTab === 'logout' && (
        <div className="max-w-md mx-auto space-y-6 pt-4 animate-fadeIn">
          <Card className="p-8 text-center space-y-6 border border-rose-100 bg-rose-50/5 shadow-sm dark:bg-slate-900 dark:border-rose-955/20">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto dark:bg-rose-955/20">
              <LogOut className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-850 dark:text-white">
                Sign Out of SmartHire
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Are you sure you want to end your current session? You will need to log back in to access your dashboard, saved jobs, and applications.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('personal')}
                className="w-full sm:w-1/2 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors text-xs"
              >
                Cancel
              </button>
              <Button
                variant="danger"
                onClick={handleLogout}
                className="w-full sm:w-1/2 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 text-xs"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
}

export default ProfilePage;
