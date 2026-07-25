import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  MapPin, 
  Building2, 
  Clock, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { experienceService } from '@/services/experience/experienceService';
import { formatDate } from '@/utils/formatDate';

// Reusable UI components
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';

export function ExperiencePage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState([]);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({
    job_title: '',
    company_name: '',
    employment_type: '',
    location: '',
    start_date: '',
    end_date: '',
    currently_working: false,
    description: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete modal confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchExperienceRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experienceService.getExperienceList();
      
      // Sort: Most Recent Experience First (sort start_date descending)
      const sortedData = (data || []).sort((a, b) => {
        const dateA = new Date(a.start_date);
        const dateB = new Date(b.start_date);
        return dateB - dateA;
      });

      setRecords(sortedData);
    } catch (err) {
      console.error("Fetch experience error:", err);
      setError("Failed to retrieve experience records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperienceRecords();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormFields(prev => ({
      ...prev,
      [id]: val,
      // If currently working is toggled, clear end_date
      ...(id === 'currently_working' && val ? { end_date: '' } : {})
    }));

    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Required Fields
    const required = ['job_title', 'company_name', 'start_date', 'description'];
    required.forEach(field => {
      if (!formFields[field] || !formFields[field].toString().trim()) {
        errors[field] = 'This field is required';
      }
    });

    // 2. Character length limits
    if (formFields.job_title && formFields.job_title.length > 100) {
      errors.job_title = 'Job title cannot exceed 100 characters';
    }
    if (formFields.company_name && formFields.company_name.length > 150) {
      errors.company_name = 'Company name cannot exceed 150 characters';
    }
    if (formFields.employment_type && formFields.employment_type.length > 100) {
      errors.employment_type = 'Employment type cannot exceed 100 characters';
    }
    if (formFields.location && formFields.location.length > 100) {
      errors.location = 'Location description cannot exceed 100 characters';
    }

    // 3. Date boundary validations
    if (formFields.start_date) {
      const sDate = new Date(formFields.start_date);
      
      if (!formFields.currently_working && formFields.end_date) {
        const eDate = new Date(formFields.end_date);
        if (sDate >= eDate) {
          errors.end_date = 'End Date must be strictly after the Start Date';
        }
      } else if (!formFields.currently_working && !formFields.end_date) {
        errors.end_date = 'End Date is required if you are not currently working here';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormFields({
      job_title: '',
      company_name: '',
      employment_type: '',
      location: '',
      start_date: '',
      end_date: '',
      currently_working: false,
      description: '',
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (record) => {
    setEditingId(record.id);
    setFormFields({
      job_title: record.job_title || '',
      company_name: record.company_name || '',
      employment_type: record.employment_type || '',
      location: record.location || '',
      start_date: record.start_date || '',
      end_date: record.end_date || '',
      currently_working: record.currently_working || false,
      description: record.description || '',
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || actionLoading) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);

      // Construct clean payload (force end_date to null if currently working)
      const payload = {
        job_title: formFields.job_title.trim(),
        company_name: formFields.company_name.trim(),
        employment_type: formFields.employment_type.trim() || null,
        location: formFields.location.trim() || null,
        start_date: formFields.start_date,
        end_date: formFields.currently_working ? null : formFields.end_date,
        currently_working: formFields.currently_working,
        description: formFields.description.trim(),
      };

      if (editingId) {
        await experienceService.updateExperience(editingId, payload);
        setSuccess("Experience entry updated successfully!");
      } else {
        await experienceService.createExperience(payload);
        setSuccess("Experience entry added successfully!");
      }

      setIsFormOpen(false);
      await fetchExperienceRecords();
    } catch (err) {
      console.error("Save experience error:", err);
      setError("Failed to save experience entry. Please verify details and try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerDelete = (id) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId || actionLoading) return;

    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await experienceService.deleteExperience(deletingId);
      setSuccess("Experience entry deleted successfully.");
      setIsDeleteOpen(false);
      await fetchExperienceRecords();
    } catch (err) {
      console.error("Delete experience error:", err);
      setError("Failed to delete the experience record.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading experience timeline...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Work Experience</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your employment history, career milestones, and professional roles.</p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddForm}
          className="rounded-2xl shadow-lg flex items-center gap-2 font-bold shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-2xl animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{success}</span>
        </div>
      )}

      {/* Timeline Layout */}
      {records.length === 0 ? (
        <EmptyState
          title="No Experience Records Found"
          description="Build your professional profile history by adding your past or current employment roles."
          icon={<Briefcase className="w-12 h-12 text-slate-400" />}
          action={
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenAddForm}
              className="rounded-xl font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Work History
            </Button>
          }
        />
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
          {records.map((record) => (
            <div key={record.id} className="relative">
              {/* Timeline dot */}
              <span className="absolute -left-[35px] md:-left-[43px] mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-blue-500 shadow-sm shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>

              {/* Timeline Card */}
              <Card className="p-6 border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-200 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">
                        {record.job_title}
                      </h3>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" /> {record.company_name}
                        {record.employment_type && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-bold ml-1 tracking-wide">
                            {record.employment_type}
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(record.start_date)} - {record.currently_working ? 'Present' : formatDate(record.end_date)}
                      </span>
                      {record.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> {record.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        Currently Working: <span className="font-bold text-slate-600">{record.currently_working ? 'Yes' : 'No'}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleOpenEditForm(record)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="Edit Record"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTriggerDelete(record.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-600 border-t border-slate-50 pt-3 leading-relaxed whitespace-pre-line">
                  {record.description}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Work Experience' : 'Add Work Experience'}
        className="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Job Title"
              id="job_title"
              value={formFields.job_title}
              onChange={handleInputChange}
              error={fieldErrors.job_title}
              placeholder="e.g. Senior Software Engineer"
              required
            />
            
            <Input
              label="Company Name"
              id="company_name"
              value={formFields.company_name}
              onChange={handleInputChange}
              error={fieldErrors.company_name}
              placeholder="e.g. Google LLC"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="employment_type" className="block text-sm font-semibold text-slate-700">
                Employment Type
              </label>
              <select
                id="employment_type"
                value={formFields.employment_type}
                onChange={handleInputChange}
                className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              >
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <Input
              label="Location"
              id="location"
              value={formFields.location}
              onChange={handleInputChange}
              error={fieldErrors.location}
              placeholder="e.g. Mountain View, CA or Remote"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input
              label="Start Date"
              id="start_date"
              type="date"
              value={formFields.start_date}
              onChange={handleInputChange}
              error={fieldErrors.start_date}
              required
            />

            <div className="space-y-4">
              <Input
                label="End Date"
                id="end_date"
                type="date"
                value={formFields.currently_working ? '' : formFields.end_date}
                onChange={handleInputChange}
                error={fieldErrors.end_date}
                disabled={formFields.currently_working}
                className={formFields.currently_working ? 'bg-slate-50 cursor-not-allowed border-slate-200 opacity-60' : ''}
              />
              
              <Checkbox
                label="I am currently working in this role"
                id="currently_working"
                checked={formFields.currently_working}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Textarea
            label="Description / Key Responsibilities"
            id="description"
            value={formFields.description}
            onChange={handleInputChange}
            error={fieldErrors.description}
            placeholder="Outline your primary duties, technical stack used, key projects, and accomplishments achieved during this role..."
            rows={5}
            required
          />

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={actionLoading}
              className="w-full sm:w-auto rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              disabled={actionLoading}
              className="w-full sm:w-auto rounded-xl font-bold px-6"
            >
              {editingId ? 'Save Changes' : 'Add Role'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Work Experience Entry"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete this work experience entry? This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              disabled={actionLoading}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={actionLoading}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ExperiencePage;
