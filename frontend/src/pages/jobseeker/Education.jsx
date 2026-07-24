import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  School, 
  Award, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  MoreVertical 
} from 'lucide-react';
import { educationService } from '@/services/education/educationService';
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

export function EducationPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState([]);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({
    degree: '',
    field_of_study: '',
    institution_name: '',
    start_date: '',
    end_date: '',
    currently_studying: false,
    grade: '',
    description: '',
  });
  
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete modal confirmation states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchEducationRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getEducationList();
      setRecords(data);
    } catch (err) {
      console.error("Fetch education error:", err);
      setError("Failed to retrieve education records. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducationRecords();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormFields(prev => ({
      ...prev,
      [id]: val,
      // If currently studying is toggled, clear end_date
      ...(id === 'currently_studying' && val ? { end_date: '' } : {})
    }));

    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    // 1. Required Fields
    const required = ['degree', 'field_of_study', 'institution_name', 'start_date'];
    required.forEach(field => {
      if (!formFields[field] || !formFields[field].trim()) {
        errors[field] = 'This field is required';
      }
    });

    // 2. Character length limits
    if (formFields.degree && formFields.degree.length > 100) {
      errors.degree = 'Degree title cannot exceed 100 characters';
    }
    if (formFields.field_of_study && formFields.field_of_study.length > 100) {
      errors.field_of_study = 'Field of study cannot exceed 100 characters';
    }
    if (formFields.institution_name && formFields.institution_name.length > 150) {
      errors.institution_name = 'Institution name cannot exceed 150 characters';
    }
    if (formFields.grade && formFields.grade.length > 50) {
      errors.grade = 'Grade classification cannot exceed 50 characters';
    }

    // 3. Date boundary validations
    if (formFields.start_date) {
      const sDate = new Date(formFields.start_date);
      
      if (!formFields.currently_studying && formFields.end_date) {
        const eDate = new Date(formFields.end_date);
        if (sDate >= eDate) {
          errors.end_date = 'End Date must be strictly after the Start Date';
        }
      } else if (!formFields.currently_studying && !formFields.end_date) {
        errors.end_date = 'End Date is required if you are not currently studying';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddForm = () => {
    setEditingId(null);
    setFormFields({
      degree: '',
      field_of_study: '',
      institution_name: '',
      start_date: '',
      end_date: '',
      currently_studying: false,
      grade: '',
      description: '',
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (record) => {
    setEditingId(record.id);
    setFormFields({
      degree: record.degree || '',
      field_of_study: record.field_of_study || '',
      institution_name: record.institution_name || '',
      start_date: record.start_date || '',
      end_date: record.end_date || '',
      currently_studying: !record.end_date,
      grade: record.grade || '',
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

      // Map end_date according to study status
      const payload = {
        degree: formFields.degree.trim(),
        field_of_study: formFields.field_of_study.trim(),
        institution_name: formFields.institution_name.trim(),
        start_date: formFields.start_date,
        end_date: formFields.currently_studying ? null : formFields.end_date,
        grade: formFields.grade.trim() || null,
        description: formFields.description.trim() || null,
      };

      if (editingId) {
        await educationService.updateEducation(editingId, payload);
        setSuccess("Education entry updated successfully!");
      } else {
        await educationService.createEducation(payload);
        setSuccess("Education entry added successfully!");
      }

      setIsFormOpen(false);
      await fetchEducationRecords();
    } catch (err) {
      console.error("Save education error:", err);
      setError("Failed to save education entry. Please verify parameters and try again.");
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
      await educationService.deleteEducation(deletingId);
      setSuccess("Education entry deleted successfully.");
      setIsDeleteOpen(false);
      await fetchEducationRecords();
    } catch (err) {
      console.error("Delete education error:", err);
      setError("Failed to delete the education record.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading education history...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Education Credentials</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your academic qualifications, degrees, and study history.</p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAddForm}
          className="rounded-2xl shadow-lg flex items-center gap-2 font-bold shrink-0 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Education
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

      {/* Grid of records */}
      {records.length === 0 ? (
        <EmptyState
          title="No Education Records Found"
          description="Build your profile credentials by adding your school, college, or university degrees."
          icon={<GraduationCap className="w-12 h-12 text-slate-400" />}
          action={
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenAddForm}
              className="rounded-xl font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Academic Degree
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {records.map((record) => (
            <Card 
              key={record.id} 
              className="p-6 border border-slate-100 hover:shadow-xl transition-all duration-200 bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug">
                      {record.degree} in {record.field_of_study}
                    </h3>
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                      <School className="w-4 h-4 text-slate-400" /> {record.institution_name}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(record.start_date)} - {record.end_date ? formatDate(record.end_date) : 'Present (Ongoing)'}
                      </span>
                      {record.grade && (
                        <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 font-semibold text-slate-600">
                          <Award className="w-3.5 h-3.5 text-blue-500" /> Grade: {record.grade}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
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

              {record.description && (
                <div className="mt-4 text-sm text-slate-600 border-t border-slate-50 pt-3 leading-relaxed">
                  <p className="whitespace-pre-line">{record.description}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingId ? 'Edit Academic Entry' : 'Add Academic Entry'}
        className="max-w-2xl"
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              label="Degree / Certificate"
              id="degree"
              value={formFields.degree}
              onChange={handleInputChange}
              error={fieldErrors.degree}
              placeholder="e.g. Bachelor of Science"
              required
            />
            
            <Input
              label="Field of Study"
              id="field_of_study"
              value={formFields.field_of_study}
              onChange={handleInputChange}
              error={fieldErrors.field_of_study}
              placeholder="e.g. Computer Science"
              required
            />
          </div>

          <Input
            label="Institution / University Name"
            id="institution_name"
            value={formFields.institution_name}
            onChange={handleInputChange}
            error={fieldErrors.institution_name}
            placeholder="e.g. Stanford University"
            required
          />

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
                value={formFields.end_date}
                onChange={handleInputChange}
                error={fieldErrors.end_date}
                disabled={formFields.currently_studying}
                className={formFields.currently_studying ? 'bg-slate-50 cursor-not-allowed border-slate-200 opacity-60' : ''}
              />
              
              <Checkbox
                label="I am currently studying here"
                id="currently_studying"
                checked={formFields.currently_studying}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <Input
            label="Grade / CGPA (Optional)"
            id="grade"
            value={formFields.grade}
            onChange={handleInputChange}
            error={fieldErrors.grade}
            placeholder="e.g. 3.92 / 4.0 or First Class"
          />

          <Textarea
            label="Description / Achievements (Optional)"
            id="description"
            value={formFields.description}
            onChange={handleInputChange}
            placeholder="Describe your coursework, honors, major projects, or notable research achievements here..."
            rows={4}
          />

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFormOpen(false)}
              disabled={actionLoading}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              disabled={actionLoading}
              className="rounded-xl font-bold px-6"
            >
              {editingId ? 'Save Changes' : 'Add Entry'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Academic Qualification"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete this education entry? This action is permanent and cannot be undone.
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

export default EducationPage;
