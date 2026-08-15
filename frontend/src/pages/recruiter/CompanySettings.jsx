import React, { useState, useEffect } from 'react';
import { Building2, Globe, MapPin, Users, FileCheck, ShieldAlert, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { companyService } from '@/services/company/companyService';

// UI components
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Toast from '@/components/ui/Toast';
import ImageUploader from '@/components/ui/ImageUploader';
import SkeletonProfile from '@/components/common/SkeletonProfile';
import PageHeader from '@/components/ui/PageHeader';
import { parseFormErrors, extractErrorMessage } from '@/utils/errorParser';

// Simple URL validation regex
const URL_REGEX = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

const INDUSTRY_OPTIONS = [
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
  { label: '1 - 10 employees', value: '1-10' },
  { label: '11 - 50 employees', value: '11-50' },
  { label: '51 - 200 employees', value: '51-200' },
  { label: '201 - 500 employees', value: '201-500' },
  { label: '501 - 1000 employees', value: '501-1000' },
  { label: '1000+ employees', value: '1000+' }
];

export function CompanySettings() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Loading states
  const [initLoading, setInitLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Form fields
  const [companyName, setCompanyName] = useState('');
  const [logo, setLogo] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [headquarters, setHeadquarters] = useState('');

  // Validation/feedback states
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // Load company data on mount
  const loadCompanyData = async () => {
    if (!companyId) {
      setInitLoading(false);
      return;
    }

    try {
      setInitLoading(true);
      const data = await companyService.getCompany(companyId);
      
      setCompanyName(data.name || '');
      setLogo(data.logo_url || data.logo || '');
      setDescription(data.description || '');
      setWebsite(data.website || '');
      setIndustry(data.industry || 'Technology');
      setCompanySize(data.company_size || '11-50');
      setHeadquarters(data.location || data.headquarters || '');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to load company details.', 'error');
    } finally {
      setInitLoading(false);
    }
  };

  useEffect(() => {
    loadCompanyData();
  }, [companyId]);

  // Logo upload handlers
  const handleLogoChange = async (file) => {
    try {
      setUploadLoading(true);
      setErrors(prev => ({ ...prev, logo: '' }));
      
      const base64Url = await companyService.uploadLogo(file);
      setLogo(base64Url);
      
      triggerToast('Logo loaded to preview.', 'success');
    } catch (err) {
      console.error(err);
      setErrors(prev => ({ ...prev, logo: err.message }));
      triggerToast('Logo upload failed.', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleLogoRemove = () => {
    setLogo('');
  };

  // Validation check
  const validateForm = () => {
    const newErrors = {};
    
    if (!description.trim()) {
      newErrors.description = 'Company Description is required';
    } else if (description.trim().length < 20) {
      newErrors.description = 'Description should be at least 20 characters long';
    }

    if (website.trim() && !URL_REGEX.test(website.trim())) {
      newErrors.website = 'Website URL format is invalid. Please enter a valid URL (e.g. www.mycompany.com)';
    }

    if (!headquarters.trim()) {
      newErrors.headquarters = 'Headquarters Location is required';
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
      let formattedWebsite = website.trim();
      if (formattedWebsite && !formattedWebsite.startsWith('http://') && !formattedWebsite.startsWith('https://')) {
        formattedWebsite = `https://${formattedWebsite}`;
      }

      await companyService.updateCompany(companyId, {
        name: companyName.trim() || undefined,
        description: description.trim(),
        website: formattedWebsite || null,
        industry,
        company_size: companySize,
        location: headquarters.trim(),
        headquarters: headquarters.trim(),
        logo_url: logo || null,
        logo: logo || null
      });

      triggerToast('Company settings updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      const errorsMap = parseFormErrors(err);
      if (errorsMap) {
        if (errorsMap.location && !errorsMap.headquarters) {
          errorsMap.headquarters = errorsMap.location;
        }
        if (errorsMap.logo_url && !errorsMap.logo) {
          errorsMap.logo = errorsMap.logo_url;
        }
        setErrors(errorsMap);
        const detailedMsg = Object.entries(errorsMap).map(([field, msg]) => `${field}: ${msg}`).join(', ');
        triggerToast(detailedMsg || 'Please correct validation errors on the form.', 'error');
      } else {
        triggerToast(extractErrorMessage(err) || 'Failed to save company settings.', 'error');
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (initLoading) {
    return <SkeletonProfile />;
  }

  const isOwner = Boolean(user?.is_owner || user?.role === 'company_owner');

  if (!isOwner) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white dark:bg-[#0d1017] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg animate-in fade-in duration-200">
        <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Only the Company Owner is authorized to view or modify company settings.
        </p>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white dark:bg-[#0d1017] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-lg animate-in fade-in duration-200">
        <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Your recruiter account is not yet associated with any registered company profile.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative animate-in fade-in duration-200">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* 100% Completely Fixed Title Header */}
      <PageHeader
        title="Company Settings"
        subtitle="Configure company details, logo, size, and headquarters parameters."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Logo Uploader Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm">
            <ImageUploader
              src={logo}
              label="Company Logo"
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
              isLoading={uploadLoading}
              error={errors.logo}
            />
          </Card>
        </div>

        {/* Right Side: Settings Details Form Card */}
        <div className="lg:col-span-2">
          <Card className="p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#15161e] rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white tracking-tight">Company Profile Information</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Read-Only Company Name input */}
              <div className="space-y-1.5">
                <Input
                  id="company-name-input"
                  label={
                    <span className="flex items-center gap-1.5">
                      <span>Company Name</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded uppercase select-none">Read-Only</span>
                    </span>
                  }
                  value={companyName}
                  disabled={true}
                  className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 font-semibold text-slate-400 dark:text-slate-500 cursor-not-allowed text-xs"
                />
              </div>

              {/* Website input */}
              <div className="space-y-1.5">
                <Input
                  id="company-website-input"
                  label="Website URL"
                  placeholder="e.g. www.acmecorporation.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  error={errors.website}
                  disabled={saveLoading}
                  className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 text-xs"
                />
              </div>

              {/* Industry & Size selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Select
                    id="company-industry-select"
                    label="Industry Sector"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    options={INDUSTRY_OPTIONS}
                    disabled={saveLoading}
                    className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 text-xs bg-white dark:bg-[#15161e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Select
                    id="company-size-select"
                    label="Company Size"
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    options={SIZE_OPTIONS}
                    disabled={saveLoading}
                    className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 text-xs bg-white dark:bg-[#15161e]"
                  />
                </div>
              </div>

              {/* Headquarters Location input */}
              <div className="space-y-1.5">
                <Input
                  id="company-hq-input"
                  label="Headquarters Location"
                  placeholder="e.g. Austin, TX, USA"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  error={errors.headquarters}
                  disabled={saveLoading}
                  className="rounded-xl border-slate-200 dark:border-slate-800 focus:border-blue-500 font-semibold text-slate-700 dark:text-slate-200 text-xs"
                />
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <Textarea
                  id="company-desc-input"
                  label="Company Description"
                  placeholder="Describe your company, values, products, and culture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  error={errors.description}
                  disabled={saveLoading}
                  rows={4}
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
                  <span>Save Settings</span>
                </Button>
              </div>

            </form>
          </Card>
        </div>

      </div>
    </div>
  );
}

export default CompanySettings;
