import React, { useState } from 'react';
import { Building2, Globe, MapPin, Users, Briefcase, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { companyService } from '@/services/company/companyService';
import { storage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/storageKeys';

// UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';

const INDUSTRY_OPTIONS = [
  { label: 'Select Industry Sector', value: '' },
  { label: 'Technology / Software', value: 'Technology' },
  { label: 'Healthcare / Medical', value: 'Healthcare' },
  { label: 'Finance / Fintech', value: 'Finance' },
  { label: 'Education / Edtech', value: 'Education' },
  { label: 'E-commerce / Retail', value: 'E-commerce' },
  { label: 'Entertainment / Media', value: 'Entertainment' },
  { label: 'Manufacturing / Logistics', value: 'Manufacturing' },
  { label: 'Other Industry', value: 'Other' }
];

const SIZE_OPTIONS = [
  { label: 'Select Company Size', value: '' },
  { label: '1 - 10 employees', value: '1-10' },
  { label: '11 - 50 employees', value: '11-50' },
  { label: '51 - 200 employees', value: '51-200' },
  { label: '201 - 500 employees', value: '201-500' },
  { label: '501 - 1000 employees', value: '501-1000' },
  { label: '1000+ employees', value: '1000+' }
];

export function CreateCompanyOnboarding({ onCompanyCreated }) {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('error');

  const triggerToast = (msg, type = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const validateForm = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Company Name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!industry) errs.industry = 'Industry Sector is required';
    if (!companySize) errs.company_size = 'Company Size is required';
    if (!location.trim()) errs.location = 'Location is required';

    if (website.trim() && !website.startsWith('http://') && !website.startsWith('https://')) {
      errs.website = "Website URL must start with 'http://' or 'https://'";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const company = await companyService.createCompany({
        name: name.trim(),
        description: description.trim(),
        industry,
        website: website.trim() || undefined,
        company_size: companySize,
        location: location.trim()
      });

      // Update stored user object to reflect new company_id and owner status
      const updatedUser = {
        ...user,
        company_id: company.id,
        is_owner: true
      };
      storage.setItem(STORAGE_KEYS.USER, updatedUser);

      triggerToast('Company profile created successfully!', 'success');
      
      setTimeout(() => {
        if (onCompanyCreated) {
          onCompanyCreated(company);
        } else {
          window.location.reload();
        }
      }, 500);

    } catch (err) {
      console.error('Failed to create company:', err);
      const errorsMap = parseFormErrors(err);
      if (errorsMap) {
        setErrors(errorsMap);
      } else {
        triggerToast(extractErrorMessage(err) || 'Failed to create company profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 animate-fadeIn">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 pointer-events-none flex items-center justify-center pr-8">
          <Building2 className="w-64 h-64 text-blue-300" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Onboarding Setup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Create Your Company</h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-lg leading-relaxed font-medium">
            Welcome to SmartHire! Set up your company profile to start posting jobs, reviewing top talent, and managing your recruiter team.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="p-6 sm:p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0d1017] rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Company Details</h2>
            <p className="text-xs text-slate-400">Fill in your organization information to complete setup.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company Name */}
          <Input
            id="create-company-name"
            label="Company Name *"
            placeholder="e.g. Acme Corporation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={loading}
            className="rounded-xl font-semibold text-xs"
          />

          {/* Industry & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              id="create-company-industry"
              label="Industry Sector *"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              options={INDUSTRY_OPTIONS}
              error={errors.industry}
              disabled={loading}
              className="rounded-xl font-semibold text-xs bg-white dark:bg-[#090a0f]"
            />

            <Select
              id="create-company-size"
              label="Company Size *"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              options={SIZE_OPTIONS}
              error={errors.company_size}
              disabled={loading}
              className="rounded-xl font-semibold text-xs bg-white dark:bg-[#090a0f]"
            />
          </div>

          {/* Website & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="create-company-website"
              label="Website URL"
              placeholder="https://www.example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              error={errors.website}
              disabled={loading}
              className="rounded-xl font-semibold text-xs"
            />

            <Input
              id="create-company-location"
              label="Primary Location *"
              placeholder="e.g. Austin, TX, USA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              error={errors.location}
              disabled={loading}
              className="rounded-xl font-semibold text-xs"
            />
          </div>

          {/* Description */}
          <Textarea
            id="create-company-description"
            label="Company Description *"
            placeholder="Tell candidates about your company mission, products, and culture..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            disabled={loading}
            rows={4}
            className="rounded-xl font-semibold text-xs"
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>You will become the Company Owner</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={loading}
              className="rounded-xl px-8 font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20 text-sm"
            >
              <span>Create Company</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default CreateCompanyOnboarding;
