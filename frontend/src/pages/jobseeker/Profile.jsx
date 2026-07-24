import React, { useState, useEffect, useRef } from 'react';
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
  Globe 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profileService } from '@/services/profile/profileService';
import { validators } from '@/utils/validators';

// Reusable UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

export function ProfilePage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
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
      setError("Failed to save profile changes. Please verify input formats and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your personal details, location preferences, and summary credentials.</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-2xl">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        
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
                className="absolute bottom-1 right-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all transform hover:scale-110"
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
                    className={`block w-full rounded-2xl border ${fieldErrors.gender ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500'} bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all`}
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
              required
            />
            <Input
              label="State / Province"
              id="state"
              value={profileData.state}
              onChange={handleInputChange}
              error={fieldErrors.state}
              placeholder="e.g. California"
              required
            />
            <Input
              label="City"
              id="city"
              value={profileData.city}
              onChange={handleInputChange}
              error={fieldErrors.city}
              placeholder="e.g. San Francisco"
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
          />

          <Textarea
            label="About Me / Summary"
            id="professional_summary"
            value={profileData.professional_summary}
            onChange={handleInputChange}
            placeholder="Write a brief professional summary about yourself, your career highlights, and major achievements..."
            rows={5}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <Input
              label="LinkedIn Profile URL"
              id="linkedin_url"
              value={profileData.linkedin_url}
              onChange={handleInputChange}
              error={fieldErrors.linkedin_url}
              placeholder="https://linkedin.com/in/username"
            />
            <Input
              label="GitHub Profile URL"
              id="github_url"
              value={profileData.github_url}
              onChange={handleInputChange}
              error={fieldErrors.github_url}
              placeholder="https://github.com/username"
            />
            <Input
              label="Portfolio URL"
              id="portfolio_url"
              value={profileData.portfolio_url}
              onChange={handleInputChange}
              error={fieldErrors.portfolio_url}
              placeholder="https://username.dev"
            />
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            isLoading={saving}
            disabled={saving}
            className="px-8 py-3 rounded-2xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Profile Settings
          </Button>
        </div>

      </form>
    </div>
  );
}

export default ProfilePage;
