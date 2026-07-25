import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  HardDrive,
  GraduationCap,
  Briefcase,
  Award,
  Plus,
  Edit2,
  Calendar,
  School,
  BookOpen,
  Building2,
  MapPin,
  Brain,
  Sparkles,
  Search,
  MoreVertical,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { resumeService } from '@/services/resume/resumeService';
import { educationService } from '@/services/education/educationService';
import { experienceService } from '@/services/experience/experienceService';
import { skillsService } from '@/services/skills/skillsService';
import { formatDate } from '@/utils/formatDate';
import { extractErrorMessage } from '@/utils/errorParser';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Badge from '@/components/ui/Badge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import SkillChip from '@/components/ui/SkillChip';
import SkeletonProfile from '@/components/common/SkeletonProfile';
import EmptyState from '@/components/common/EmptyState';

// Master skills catalog
const MASTER_SKILLS_CATALOG = [
  { id: 1, skill_name: 'React', category: 'Frontend' },
  { id: 2, skill_name: 'Angular', category: 'Frontend' },
  { id: 3, skill_name: 'Vue.js', category: 'Frontend' },
  { id: 4, skill_name: 'HTML5 & CSS3', category: 'Frontend' },
  { id: 5, skill_name: 'Tailwind CSS', category: 'Frontend' },
  { id: 6, skill_name: 'FastAPI', category: 'Backend' },
  { id: 7, skill_name: 'Node.js', category: 'Backend' },
  { id: 8, skill_name: 'Django', category: 'Backend' },
  { id: 9, skill_name: 'Flask', category: 'Backend' },
  { id: 10, skill_name: 'Express.js', category: 'Backend' },
  { id: 11, skill_name: 'PostgreSQL', category: 'Database' },
  { id: 12, skill_name: 'MongoDB', category: 'Database' },
  { id: 13, skill_name: 'Redis', category: 'Database' },
  { id: 14, skill_name: 'MySQL', category: 'Database' },
  { id: 15, skill_name: 'Docker', category: 'DevOps' },
  { id: 16, skill_name: 'Kubernetes', category: 'DevOps' },
  { id: 17, skill_name: 'AWS', category: 'DevOps' },
  { id: 18, skill_name: 'Git & GitHub', category: 'DevOps' },
];

// ─── TAB DEFINITIONS ──────────────────────────────────────────────────────────
const TABS = [
  { key: 'resume', label: 'Resume', icon: FileText },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'skills', label: 'Skills', icon: Award },
];

// ─── ALERT HELPER ─────────────────────────────────────────────────────────────
function AlertBanner({ type, message }) {
  if (!message) return null;
  const isError = type === 'error';
  return (
    <div
      className={`flex items-center gap-3 p-4 text-sm font-medium rounded-2xl animate-fadeIn ${
        isError
          ? 'text-red-700 bg-red-50 border border-red-200'
          : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
      )}
      <span>{message}</span>
    </div>
  );
}

// ─── RESUME TAB ───────────────────────────────────────────────────────────────
function ResumeTab() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [resumeTitle] = useState('Primary Curriculum Vitae');
  const [resumeSummary] = useState(
    'Professional CV for general job applications in engineering, product management, and business operations.'
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchResumeMetadata = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await resumeService.getResumeMetadata();
      setMetadata(data);
    } catch (err) {
      if (err.response?.status === 404) setMetadata(null);
      else setError(extractErrorMessage(err) || 'Failed to fetch resume status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResumeMetadata(); }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds 5MB limit.');
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      let data;
      if (metadata) {
        data = await resumeService.updateResume(selectedFile);
        setSuccess('Resume replaced successfully!');
      } else {
        data = await resumeService.uploadResume(selectedFile);
        setSuccess('Resume uploaded successfully!');
      }
      setMetadata(data);
      setSelectedFile(null);
    } catch (err) {
      setError(extractErrorMessage(err) || 'Failed to upload the resume file. Please verify parameters and try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!metadata || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      await resumeService.downloadResume(metadata.file_name || 'resume.pdf');
      setSuccess('Download started!');
    } catch (err) {
      setError(extractErrorMessage(err) || 'Failed to download the resume.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      await resumeService.deleteResume();
      setMetadata(null);
      setSuccess('Resume deleted successfully.');
      setIsDeleteModalOpen(false);
    } catch (err) {
      setError(extractErrorMessage(err) || 'Failed to delete the resume.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return <SkeletonProfile />;
  }

  return (
    <div className="space-y-6">
      <AlertBanner type="error" message={error} />
      <AlertBanner type="success" message={success} />

      {!metadata ? (
        <div>
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
          {!selectedFile ? (
            <EmptyState
              title="No resume uploaded."
              description="Upload a PDF copy of your CV to start applying for jobs."
              icon={FileText}
              primaryButton={{
                label: "Upload Resume",
                onClick: () => fileInputRef.current?.click()
              }}
              className="bg-white border border-slate-100 shadow-sm w-full py-16"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 border border-slate-200 bg-white p-5 rounded-2xl shadow-sm max-w-sm mx-auto animate-fadeIn">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 truncate max-w-[200px]" title={selectedFile.name}>{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex gap-2 w-full mt-2">
                <Button variant="secondary" size="sm" onClick={() => setSelectedFile(null)} className="flex-1 rounded-xl" disabled={actionLoading}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleUpload} isLoading={actionLoading} disabled={actionLoading} className="flex-grow rounded-xl">Upload Now</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6 border border-slate-100 shadow-sm space-y-6 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 leading-snug">{resumeTitle}</h2>
                  <p className="text-sm text-slate-500">{resumeSummary}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" size="sm" onClick={handleDownload} disabled={actionLoading} className="rounded-xl flex items-center gap-2 border border-slate-200 font-bold">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(true)} disabled={actionLoading} className="rounded-xl flex items-center gap-2 border border-red-100 text-red-600 hover:bg-red-50 font-bold">
                  <Trash2 className="w-4 h-4 text-red-500" /> Delete Resume
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Uploaded Date</p>
                  <p className="text-sm font-bold text-slate-700">{formatDate(metadata.uploaded_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">File Name</p>
                  <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={metadata.file_name}>{metadata.file_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HardDrive className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">File Size</p>
                  <p className="text-sm font-bold text-slate-700">{formatFileSize(metadata.file_size)}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-slate-100 shadow-sm bg-slate-50/50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-800">Replace your Resume</h3>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">Choose a new PDF document to upload. This will immediately override the currently active CV.</p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
              {!selectedFile ? (
                <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl border border-slate-200 font-bold bg-white">Choose New PDF</Button>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-700 max-w-[150px] truncate" title={selectedFile.name}>{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-400">{formatFileSize(selectedFile.size)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => setSelectedFile(null)} className="rounded-xl" disabled={actionLoading}>Clear</Button>
                    <Button variant="primary" size="sm" onClick={handleUpload} isLoading={actionLoading} disabled={actionLoading} className="rounded-xl shadow-sm font-bold">Replace Now</Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">Are you absolutely sure you want to delete your active resume file? This action is permanent and cannot be undone.</p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteModalOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDelete} isLoading={actionLoading} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── EDUCATION TAB ────────────────────────────────────────────────────────────
function EducationTab() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({ degree: '', field_of_study: '', institution_name: '', start_date: '', end_date: '', currently_studying: false, grade: '', description: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationService.getEducationList();
      setRecords(data);
    } catch {
      setError('Failed to retrieve education records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormFields(prev => ({ ...prev, [id]: val, ...(id === 'currently_studying' && val ? { end_date: '' } : {}) }));
    if (fieldErrors[id]) setFieldErrors(prev => ({ ...prev, [id]: null }));
  };

  const validateForm = () => {
    const errors = {};
    ['degree', 'field_of_study', 'institution_name', 'start_date'].forEach(f => {
      if (!formFields[f]?.trim()) errors[f] = 'This field is required';
    });
    if (formFields.degree?.length > 100) errors.degree = 'Cannot exceed 100 characters';
    if (formFields.field_of_study?.length > 100) errors.field_of_study = 'Cannot exceed 100 characters';
    if (formFields.institution_name?.length > 150) errors.institution_name = 'Cannot exceed 150 characters';
    if (formFields.start_date) {
      const sDate = new Date(formFields.start_date);
      if (!formFields.currently_studying && formFields.end_date) {
        if (sDate >= new Date(formFields.end_date)) errors.end_date = 'End Date must be after Start Date';
      } else if (!formFields.currently_studying && !formFields.end_date) {
        errors.end_date = 'End Date is required if not currently studying';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormFields({ degree: '', field_of_study: '', institution_name: '', start_date: '', end_date: '', currently_studying: false, grade: '', description: '' });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id);
    setFormFields({ degree: record.degree || '', field_of_study: record.field_of_study || '', institution_name: record.institution_name || '', start_date: record.start_date || '', end_date: record.end_date || '', currently_studying: !record.end_date, grade: record.grade || '', description: record.description || '' });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const payload = { degree: formFields.degree.trim(), field_of_study: formFields.field_of_study.trim(), institution_name: formFields.institution_name.trim(), start_date: formFields.start_date, end_date: formFields.currently_studying ? null : formFields.end_date, grade: formFields.grade.trim() || null, description: formFields.description.trim() || null };
      if (editingId) { await educationService.updateEducation(editingId, payload); setSuccess('Education entry updated successfully!'); }
      else { await educationService.createEducation(payload); setSuccess('Education entry added successfully!'); }
      setIsFormOpen(false);
      await fetchRecords();
    } catch { setError('Failed to save education entry. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      await educationService.deleteEducation(deletingId);
      setSuccess('Education entry deleted successfully.');
      setIsDeleteOpen(false);
      await fetchRecords();
    } catch { setError('Failed to delete the education record.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <SkeletonProfile />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Education Credentials</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your academic qualifications, degrees, and study history.</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="rounded-2xl shadow-lg flex items-center gap-2 font-bold shrink-0 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Education
        </Button>
      </div>

      <AlertBanner type="error" message={error} />
      <AlertBanner type="success" message={success} />

      {records.length === 0 ? (
        <EmptyState title="No Education Records Found" description="Build your profile credentials by adding your school, college, or university degrees." icon={<GraduationCap className="w-12 h-12 text-slate-400" />}
          action={<Button variant="primary" size="md" onClick={handleOpenAdd} className="rounded-xl font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Academic Degree</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {records.map(record => (
            <Card key={record.id} className="p-6 border border-slate-100 hover:shadow-xl transition-all duration-200 bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800 leading-snug">{record.degree} in {record.field_of_study}</h3>
                    <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5"><School className="w-4 h-4 text-slate-400" /> {record.institution_name}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(record.start_date)} — {record.end_date ? formatDate(record.end_date) : 'Present'}</span>
                      {record.grade && <span className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 font-semibold text-slate-600"><Award className="w-3.5 h-3.5 text-blue-500" /> Grade: {record.grade}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleOpenEdit(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => { setDeletingId(record.id); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {record.description && <div className="mt-4 text-sm text-slate-600 border-t border-slate-50 pt-3 leading-relaxed whitespace-pre-line">{record.description}</div>}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Academic Entry' : 'Add Academic Entry'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Degree / Certificate" id="degree" value={formFields.degree} onChange={handleInputChange} error={fieldErrors.degree} placeholder="e.g. Bachelor of Science" disabled={actionLoading} required />
            <Input label="Field of Study" id="field_of_study" value={formFields.field_of_study} onChange={handleInputChange} error={fieldErrors.field_of_study} placeholder="e.g. Computer Science" disabled={actionLoading} required />
          </div>
          <Input label="Institution / University Name" id="institution_name" value={formFields.institution_name} onChange={handleInputChange} error={fieldErrors.institution_name} placeholder="e.g. Stanford University" disabled={actionLoading} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input label="Start Date" id="start_date" type="date" value={formFields.start_date} onChange={handleInputChange} error={fieldErrors.start_date} disabled={actionLoading} required />
            <div className="space-y-4">
              <Input label="End Date" id="end_date" type="date" value={formFields.end_date} onChange={handleInputChange} error={fieldErrors.end_date} disabled={formFields.currently_studying || actionLoading} className={formFields.currently_studying ? 'bg-slate-50 cursor-not-allowed border-slate-200 opacity-60' : ''} />
              <Checkbox label="I am currently studying here" id="currently_studying" checked={formFields.currently_studying} onChange={handleInputChange} disabled={actionLoading} />
            </div>
          </div>
          <Input label="Grade / CGPA (Optional)" id="grade" value={formFields.grade} onChange={handleInputChange} error={fieldErrors.grade} placeholder="e.g. 3.92 / 4.0 or First Class" disabled={actionLoading} />
          <Textarea label="Description / Achievements (Optional)" id="description" value={formFields.description} onChange={handleInputChange} placeholder="Describe coursework, honors, or major achievements..." rows={4} disabled={actionLoading} />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">{editingId ? 'Save Changes' : 'Add Entry'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Academic Qualification">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">Are you sure you want to delete this education entry? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDeleteConfirm} isLoading={actionLoading} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── EXPERIENCE TAB ───────────────────────────────────────────────────────────
function ExperienceTab() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formFields, setFormFields] = useState({ job_title: '', company_name: '', employment_type: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await experienceService.getExperienceList();
      const sorted = (data || []).sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      setRecords(sorted);
    } catch {
      setError('Failed to retrieve experience records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormFields(prev => ({ ...prev, [id]: val, ...(id === 'currently_working' && val ? { end_date: '' } : {}) }));
    if (fieldErrors[id]) setFieldErrors(prev => ({ ...prev, [id]: null }));
  };

  const validateForm = () => {
    const errors = {};
    ['job_title', 'company_name', 'start_date', 'description'].forEach(f => {
      if (!formFields[f]?.toString().trim()) errors[f] = 'This field is required';
    });
    if (formFields.start_date) {
      if (!formFields.currently_working && formFields.end_date) {
        if (new Date(formFields.start_date) >= new Date(formFields.end_date)) errors.end_date = 'End Date must be after Start Date';
      } else if (!formFields.currently_working && !formFields.end_date) {
        errors.end_date = 'End Date is required if not currently working here';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormFields({ job_title: '', company_name: '', employment_type: '', location: '', start_date: '', end_date: '', currently_working: false, description: '' });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (record) => {
    setEditingId(record.id);
    setFormFields({ job_title: record.job_title || '', company_name: record.company_name || '', employment_type: record.employment_type || '', location: record.location || '', start_date: record.start_date || '', end_date: record.end_date || '', currently_working: record.currently_working || false, description: record.description || '' });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const payload = { job_title: formFields.job_title.trim(), company_name: formFields.company_name.trim(), employment_type: formFields.employment_type.trim() || null, location: formFields.location.trim() || null, start_date: formFields.start_date, end_date: formFields.currently_working ? null : formFields.end_date, currently_working: formFields.currently_working, description: formFields.description.trim() };
      if (editingId) { await experienceService.updateExperience(editingId, payload); setSuccess('Experience entry updated successfully!'); }
      else { await experienceService.createExperience(payload); setSuccess('Experience entry added successfully!'); }
      setIsFormOpen(false);
      await fetchRecords();
    } catch { setError('Failed to save experience entry. Please try again.'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      await experienceService.deleteExperience(deletingId);
      setSuccess('Experience entry deleted successfully.');
      setIsDeleteOpen(false);
      await fetchRecords();
    } catch { setError('Failed to delete the experience record.'); }
    finally { setActionLoading(false); }
  };

  if (loading) return <SkeletonProfile />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Work Experience</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your employment history, career milestones, and professional roles.</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="rounded-2xl shadow-lg flex items-center gap-2 font-bold shrink-0 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </div>

      <AlertBanner type="error" message={error} />
      <AlertBanner type="success" message={success} />

      {records.length === 0 ? (
        <EmptyState title="No Experience Records Found" description="Build your professional history by adding past or current employment roles." icon={<Briefcase className="w-12 h-12 text-slate-400" />}
          action={<Button variant="primary" size="md" onClick={handleOpenAdd} className="rounded-xl font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Work History</Button>}
        />
      ) : (
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 pl-6 md:pl-8 space-y-8">
          {records.map(record => (
            <div key={record.id} className="relative">
              <span className="absolute -left-[35px] md:-left-[43px] mt-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-blue-500 shadow-sm shrink-0">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              </span>
              <Card className="p-6 border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-200 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">{record.job_title}</h3>
                      <p className="text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-slate-400" /> {record.company_name}
                        {record.employment_type && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 font-bold ml-1">{record.employment_type}</span>}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDate(record.start_date)} — {record.currently_working ? 'Present' : formatDate(record.end_date)}</span>
                      {record.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{record.location}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 self-start sm:self-auto">
                    <button onClick={() => handleOpenEdit(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Edit"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => { setDeletingId(record.id); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600 border-t border-slate-50 pt-3 leading-relaxed whitespace-pre-line">{record.description}</div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? 'Edit Work Experience' : 'Add Work Experience'} className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Job Title" id="job_title" value={formFields.job_title} onChange={handleInputChange} error={fieldErrors.job_title} placeholder="e.g. Senior Software Engineer" disabled={actionLoading} required />
            <Input label="Company Name" id="company_name" value={formFields.company_name} onChange={handleInputChange} error={fieldErrors.company_name} placeholder="e.g. Google LLC" disabled={actionLoading} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="employment_type" className="block text-sm font-semibold text-slate-700">Employment Type</label>
              <select id="employment_type" value={formFields.employment_type} onChange={handleInputChange} disabled={actionLoading} className="block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400">
                <option value="">Select Employment Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
            <Input label="Location" id="location" value={formFields.location} onChange={handleInputChange} error={fieldErrors.location} placeholder="e.g. Mountain View, CA or Remote" disabled={actionLoading} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            <Input label="Start Date" id="start_date" type="date" value={formFields.start_date} onChange={handleInputChange} error={fieldErrors.start_date} disabled={actionLoading} required />
            <div className="space-y-4">
              <Input label="End Date" id="end_date" type="date" value={formFields.currently_working ? '' : formFields.end_date} onChange={handleInputChange} error={fieldErrors.end_date} disabled={formFields.currently_working || actionLoading} className={formFields.currently_working ? 'bg-slate-50 cursor-not-allowed border-slate-200 opacity-60' : ''} />
              <Checkbox label="I am currently working in this role" id="currently_working" checked={formFields.currently_working} onChange={handleInputChange} disabled={actionLoading} />
            </div>
          </div>
          <Textarea label="Description / Key Responsibilities" id="description" value={formFields.description} onChange={handleInputChange} error={fieldErrors.description} placeholder="Outline your primary duties, technical stack used, key projects, and accomplishments..." rows={5} disabled={actionLoading} required />
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="rounded-xl font-bold px-6">{editingId ? 'Save Changes' : 'Add Role'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Delete Work Experience Entry">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">Are you sure you want to delete this work experience entry? This action cannot be undone.</p>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={actionLoading} className="rounded-xl font-bold">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDeleteConfirm} isLoading={actionLoading} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── SKILLS TAB ───────────────────────────────────────────────────────────────
function SkillsTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formFields, setFormFields] = useState({ skill_id: '', proficiency_level: '', years_of_experience: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const associated = await skillsService.getSkillsList();
      const loaded = (associated || []).map(skill => {
        const key = `skill_details_${user?.id}_${skill.id}`;
        const saved = localStorage.getItem(key);
        const parsed = saved ? JSON.parse(saved) : { proficiency_level: 'Intermediate', years_of_experience: 1 };
        return { ...skill, ...parsed };
      });
      setSkills(loaded);
    } catch { setError('Failed to load your profile skills. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(); }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormFields(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) setFieldErrors(prev => ({ ...prev, [id]: null }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formFields.skill_id) errors.skill_id = 'Please select a skill';
    if (!editingSkill && formFields.skill_id && skills.some(s => s.id === Number(formFields.skill_id))) errors.skill_id = 'This skill is already in your profile';
    if (!formFields.proficiency_level) errors.proficiency_level = 'Please select a proficiency level';
    if (formFields.years_of_experience === '' || isNaN(formFields.years_of_experience)) errors.years_of_experience = 'Please enter years of experience';
    else if (Number(formFields.years_of_experience) < 0) errors.years_of_experience = 'Cannot be negative';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAdd = () => {
    setEditingSkill(null);
    setFormFields({ skill_id: '', proficiency_level: '', years_of_experience: '' });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEdit = (skill) => {
    setEditingSkill(skill);
    setFormFields({ skill_id: skill.id, proficiency_level: skill.proficiency_level, years_of_experience: skill.years_of_experience });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || actionLoading) return;
    try {
      setActionLoading(true);
      setError(null);
      setSuccess(null);
      const skillId = Number(formFields.skill_id);
      if (!editingSkill) await skillsService.addSkill(skillId);
      localStorage.setItem(`skill_details_${user?.id}_${skillId}`, JSON.stringify({ proficiency_level: formFields.proficiency_level, years_of_experience: Number(formFields.years_of_experience) }));
      setSuccess(editingSkill ? 'Skill details updated successfully!' : 'Skill associated successfully!');
      setIsFormOpen(false);
      await fetchSkills();
    } catch { setError('Failed to save skill details.'); }
    finally { setActionLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId || actionLoading) return;
    try {
      setActionLoading(true);
      await skillsService.deleteSkill(deletingId);
      localStorage.removeItem(`skill_details_${user?.id}_${deletingId}`);
      setSuccess('Skill removed from your profile.');
      setIsDeleteOpen(false);
      await fetchSkills();
    } catch { setError('Failed to remove the skill.'); }
    finally { setActionLoading(false); }
  };

  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  if (loading) return <SkeletonProfile />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Skillset Credentials</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your technical skills, proficiency levels, and experience metrics.</p>
        </div>
        <Button variant="primary" size="md" onClick={handleOpenAdd} className="rounded-2xl shadow-lg flex items-center gap-2 font-bold shrink-0 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Add Skill
        </Button>
      </div>

      <AlertBanner type="error" message={error} />
      <AlertBanner type="success" message={success} />

      {/* AI Match Banner */}
      <Card className="p-5 border border-blue-100 bg-gradient-to-r from-blue-50/20 via-indigo-50/10 to-transparent flex items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0 shadow-inner"><Brain className="w-6 h-6 text-blue-600" /></div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">AI Match Score</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">Coming Soon</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">Once you add all your skills, our smart job portal matcher will rank open postings against your skills catalog.</p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-blue-400 shrink-0 hidden md:block animate-pulse" />
      </Card>

      {skills.length === 0 ? (
        <EmptyState title="No Skills Registered" description="Build your profile search metrics by adding your core engineering capabilities." icon={<Award className="w-12 h-12 text-slate-400" />}
          action={<Button variant="primary" size="md" onClick={handleOpenAdd} className="rounded-xl font-bold flex items-center gap-2"><Plus className="w-4 h-4" /> Add Profile Skill</Button>}
        />
      ) : (
        <div className="space-y-8">
          {Object.keys(skillsByCategory).map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider pl-1">{category} ({skillsByCategory[category].length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {skillsByCategory[category].map(skill => (
                  <SkillChip key={skill.id} skill={skill} onEdit={handleOpenEdit} onDelete={(id) => { setDeletingId(id); setIsDeleteOpen(true); }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingSkill ? 'Edit Skill Details' : 'Add Catalog Skill'} className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {editingSkill ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-400">Selected Skill</label>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-600 font-bold">{editingSkill.skill_name} ({editingSkill.category})</div>
            </div>
          ) : (
            <SearchableSelect label="Select Skill" id="skill_id" options={MASTER_SKILLS_CATALOG} value={formFields.skill_id} onChange={handleInputChange} error={fieldErrors.skill_id} placeholder="Search or select catalog skill..." disabled={actionLoading} required />
          )}
          <div className="space-y-1.5">
            <label htmlFor="proficiency_level" className="block text-sm font-semibold text-slate-700">Proficiency Level</label>
            <select id="proficiency_level" value={formFields.proficiency_level} onChange={handleInputChange} disabled={actionLoading} className={`block w-full rounded-2xl border ${fieldErrors.proficiency_level ? 'border-red-500' : 'border-slate-200'} bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400`}>
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            {fieldErrors.proficiency_level && <p className="text-xs font-semibold text-red-500">{fieldErrors.proficiency_level}</p>}
          </div>
          <Input label="Years of Experience" id="years_of_experience" type="number" value={formFields.years_of_experience} onChange={handleInputChange} error={fieldErrors.years_of_experience} placeholder="e.g. 3" min="0" disabled={actionLoading} required />
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsFormOpen(false)} disabled={actionLoading} className="w-full sm:w-auto rounded-xl font-bold">Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={actionLoading} className="w-full sm:w-auto rounded-xl font-bold px-6">{editingSkill ? 'Save Changes' : 'Associate Skill'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} title="Remove Catalog Skill">
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">Are you sure you want to remove this skill from your profile?</p>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-slate-100 pt-4">
            <Button variant="secondary" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={actionLoading} className="w-full sm:w-auto rounded-xl font-bold">Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleDeleteConfirm} isLoading={actionLoading} disabled={actionLoading} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500 rounded-xl font-bold">Confirm Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export function ResumePage() {
  const [activeTab, setActiveTab] = useState('resume');

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Resume</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your resume file, education, experience, and skills all in one place.</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto sm:inline-flex">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex-1 sm:flex-none justify-center ${
              activeTab === key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'resume' && <ResumeTab />}
        {activeTab === 'education' && <EducationTab />}
        {activeTab === 'experience' && <ExperienceTab />}
        {activeTab === 'skills' && <SkillsTab />}
      </div>
    </div>
  );
}

export default ResumePage;
