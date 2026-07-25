import React, { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatDate } from '@/utils';
import { toast } from 'sonner';
import { Camera } from 'lucide-react';

export function ProfileTab({ profile, onUpdate }) {
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Full Name is required';
    if (!phone.trim()) {
      nextErrors.phone = 'Phone Number is required';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      nextErrors.phone = 'Invalid phone number format';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      await onUpdate({ name, phone });
      toast.success('Profile details updated successfully');
    } catch (err) {
      toast.error('Failed to update profile details');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = () => {
    toast.info('Avatar uploading is handled by backend services');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-8">
      {/* Profile Header Picture Block */}
      <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="relative group">
          <Avatar name={name} size="lg" className="w-20 h-20 text-2xl font-black" />
          <button
            onClick={handleAvatarChange}
            className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full border-2 border-white shadow-md hover:bg-blue-700 transition-colors dark:border-slate-900"
            aria-label="Upload profile image"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="space-y-1.5 text-center sm:text-left">
          <h4 className="text-lg font-black text-slate-900 dark:text-white">{profile?.name}</h4>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            System Administrator
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Account created {formatDate(profile?.created_at)}
          </p>
        </div>
      </div>

      {/* Editing Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="profile-name"
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            required
          />
          <Input
            id="profile-phone"
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="profile-email"
            label="Email Address (Read Only)"
            value={profile?.email || ''}
            disabled
            className="bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600"
          />
          <Input
            id="profile-role"
            label="Security Role (Read Only)"
            value={profile?.role || 'ADMIN'}
            disabled
            className="bg-slate-50 text-slate-400 dark:bg-slate-950 dark:text-slate-600"
          />
        </div>

        <div className="pt-4">
          <Button variant="primary" type="submit" disabled={saving} className="rounded-xl font-black px-6 py-2.5">
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProfileTab;
