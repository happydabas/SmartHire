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
      setLogo(data.logo || '');
      setDescription(data.description || '');
      setWebsite(data.website || '');
      setIndustry(data.industry || 'Technology');
      setCompanySize(data.company_size || '11-50');
      setHeadquarters(data.headquarters || '');
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
      
      // Upload logo (converts to base64 Data URL)
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

    if (!website.trim()) {
      newErrors.website = 'Website URL is required';
    } else if (!URL_REGEX.test(website.trim())) {
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
      await companyService.updateCompany(companyId, {
        description: description.trim(),
        website: website.trim(),
        industry,
        company_size: companySize,
        headquarters: headquarters.trim(),
        logo
      });

      triggerToast('Company settings updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      const errorsMap = parseFormErrors(err);
      if (errorsMap) {
        setErrors(errorsMap);
        triggerToast('Please correct validation errors on the form.', 'error');
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
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Only the Company Owner is authorized to view or modify company settings.
        </p>
      </div>
    );
  }

  // Handle case where recruiter is not linked to any company
  if (!companyId) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-center space-y-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-lg shadow-slate-100/50 animate-in fade-in duration-200">
        <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">Access Restricted</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your recruiter account is not yet associated with any registered company profile. Please check your company invitation settings or contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 relative animate-in fade-in duration-200">
      {/* Toast notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Company Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure company details, logo, size, and headquarters parameters.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Logo Uploader Card */}
        <div className="md:col-span-1">
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm">
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
        <div className="md:col-span-2">
          <Card className="p-6 border border-slate-100 bg-white rounded-3xl shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
              <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Company Information</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Read-Only Company Name input */}
              <div className="space-y-1.5">
                <Input
                  id="company-name-input"
                  label={
                    <span className="flex items-center gap-1">
                      <span>Company Name</span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded uppercase select-none">Read-Only</span>
                    </span>
                  }
                  value={companyName}
                  disabled={true}
                  className="rounded-xl border-slate-200 bg-slate-50/70 font-semibold text-slate-400 cursor-not-allowed text-xs"
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
                  className="rounded-xl border-slate-200 focus:border-blue-500 font-semibold text-slate-700 text-xs"
                />
              </div>

              {/* Industry & Size selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Select
                    id="company-industry-select"
                    label="Industry Sector"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    options={INDUSTRY_OPTIONS}
                    disabled={saveLoading}
                    className="rounded-xl border-slate-200 focus:border-blue-500 font-semibold text-slate-700 text-xs bg-white"
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
                    className="rounded-xl border-slate-200 focus:border-blue-500 font-semibold text-slate-700 text-xs bg-white"
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
                  className="rounded-xl border-slate-200 focus:border-blue-500 font-semibold text-slate-700 text-xs"
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
