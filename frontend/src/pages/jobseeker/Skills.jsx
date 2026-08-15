import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertCircle,
  Brain,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { skillsService } from '@/services/skills/skillsService';

// Reusable UI components
import Card from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import SearchableSelect from '@/components/ui/SearchableSelect';
import PageHeader from '@/components/ui/PageHeader';
import SkillChip from '@/components/ui/SkillChip';

// Define the static master catalog matching exactly what was seeded in the DB
export const MASTER_SKILLS_CATALOG = [
  // Frontend
  { id: 1, skill_name: "React", category: "Frontend" },
  { id: 2, skill_name: "Angular", category: "Frontend" },
  { id: 3, skill_name: "Vue.js", category: "Frontend" },
  { id: 4, skill_name: "HTML5 & CSS3", category: "Frontend" },
  { id: 5, skill_name: "Tailwind CSS", category: "Frontend" },
  { id: 19, skill_name: "TypeScript", category: "Frontend" },
  { id: 20, skill_name: "Next.js", category: "Frontend" },

  // Backend
  { id: 6, skill_name: "FastAPI", category: "Backend" },
  { id: 7, skill_name: "Node.js", category: "Backend" },
  { id: 8, skill_name: "Django", category: "Backend" },
  { id: 9, skill_name: "Flask", category: "Backend" },
  { id: 10, skill_name: "Express.js", category: "Backend" },
  { id: 21, skill_name: "Python", category: "Backend" },
  { id: 22, skill_name: "Java", category: "Backend" },
  { id: 23, skill_name: "Go", category: "Backend" },
  { id: 25, skill_name: "GraphQL", category: "Backend" },
  { id: 26, skill_name: "Rust", category: "Backend" },
  { id: 27, skill_name: "C++", category: "Backend" },

  // Database
  { id: 11, skill_name: "PostgreSQL", category: "Database" },
  { id: 12, skill_name: "MongoDB", category: "Database" },
  { id: 13, skill_name: "Redis", category: "Database" },
  { id: 14, skill_name: "MySQL", category: "Database" },
  { id: 24, skill_name: "SQLite", category: "Database" },

  // DevOps & Cloud
  { id: 15, skill_name: "Docker", category: "DevOps" },
  { id: 16, skill_name: "Kubernetes", category: "DevOps" },
  { id: 17, skill_name: "AWS", category: "DevOps" },
  { id: 18, skill_name: "Git & GitHub", category: "DevOps" }
];

export function SkillsPage() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add/Edit Modal Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [formFields, setFormFields] = useState({
    skill_id: '',
    proficiency_level: '',
    years_of_experience: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSkillsList = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const associatedSkills = await skillsService.getSkillsList();
      
      // Load details (proficiency, years of experience) from localStorage
      const fullyLoadedSkills = (associatedSkills || []).map(skill => {
        const extraKey = `skill_details_${user?.id}_${skill.id}`;
        const savedData = localStorage.getItem(extraKey);
        const parsed = savedData ? JSON.parse(savedData) : { proficiency_level: 'Intermediate', years_of_experience: 1 };
        
        return {
          ...skill,
          proficiency_level: parsed.proficiency_level,
          years_of_experience: parsed.years_of_experience
        };
      });

      setSkills(fullyLoadedSkills);
    } catch (err) {
      console.error("Fetch skills error:", err);
      setError("Failed to load your profile skills. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillsList();
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormFields(prev => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formFields.skill_id) {
      errors.skill_id = 'Please select a skill from the catalog';
    }

    // Check for duplicates (only for new skills)
    if (!editingSkill && formFields.skill_id) {
      const isDuplicate = skills.some(s => s.id === Number(formFields.skill_id));
      if (isDuplicate) {
        errors.skill_id = 'This skill has already been associated with your profile';
      }
    }

    if (!formFields.proficiency_level) {
      errors.proficiency_level = 'Please select a proficiency level';
    }

    if (formFields.years_of_experience === '' || isNaN(formFields.years_of_experience)) {
      errors.years_of_experience = 'Please enter years of experience';
    } else if (Number(formFields.years_of_experience) < 0) {
      errors.years_of_experience = 'Years of experience cannot be negative';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddForm = () => {
    setEditingSkill(null);
    setFormFields({
      skill_id: '',
      proficiency_level: '',
      years_of_experience: '',
    });
    setFieldErrors({});
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (skill) => {
    setEditingSkill(skill);
    setFormFields({
      skill_id: skill.id,
      proficiency_level: skill.proficiency_level,
      years_of_experience: skill.years_of_experience,
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

      const skillId = Number(formFields.skill_id);

      if (!editingSkill) {
        // Create association in the backend
        await skillsService.addSkill(skillId);
      }

      // Save custom details in localStorage
      const extraKey = `skill_details_${user?.id}_${skillId}`;
      localStorage.setItem(extraKey, JSON.stringify({
        proficiency_level: formFields.proficiency_level,
        years_of_experience: Number(formFields.years_of_experience)
      }));

      setSuccess(editingSkill ? "Skill details updated successfully!" : "Skill associated successfully!");
      setIsFormOpen(false);
      await fetchSkillsList();
    } catch (err) {
      console.error("Save skill error:", err);
      setError("Failed to save skill details. Please verify your connection.");
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

      // Delete association in the backend
      await skillsService.deleteSkill(deletingId);

      // Clean up localStorage details
      const extraKey = `skill_details_${user?.id}_${deletingId}`;
      localStorage.removeItem(extraKey);

      setSuccess("Skill removed from your profile.");
      setIsDeleteOpen(false);
      await fetchSkillsList();
    } catch (err) {
      console.error("Delete skill error:", err);
      setError("Failed to delete the skill association.");
    } finally {
      setActionLoading(false);
    }
  };

  // Group associated skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-500 animate-pulse">Loading skillset credentials...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header and alerts */}
      <PageHeader
        title="Skillset Credentials"
        subtitle="Manage your cataloged technical skills, proficiency levels, and experience metrics."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenAddForm}
            className="rounded-2xl shadow-lg flex items-center gap-2 font-bold shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Skill
          </Button>
        }
      />

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

      {/* AI Smart Match Indicator (AI Match Score Mockup) */}
      <Card className="p-5 border border-blue-100 bg-gradient-to-r from-blue-50/20 via-indigo-50/10 to-transparent flex items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0 shadow-inner">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 tracking-tight">AI Match Score</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 uppercase">Coming Soon</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Once you add all your skills, our smart job portal matcher will rank open postings against your skills catalog to calculate a customized suitability match score.
            </p>
          </div>
        </div>
        <Sparkles className="w-6 h-6 text-blue-400 shrink-0 hidden md:block animate-pulse" />
      </Card>

      {/* Grouped Skills Displays */}
      {skills.length === 0 ? (
        <EmptyState
          title="No Skills Registered"
          description="Build your profile search metrics by adding your core engineering capabilities and years of experience."
          icon={<Award className="w-12 h-12 text-slate-400" />}
          action={
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenAddForm}
              className="rounded-xl font-bold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Profile Skill
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Object.keys(skillsByCategory).map(category => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-wider pl-1">
                {category} ({skillsByCategory[category].length})
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {skillsByCategory[category].map(skill => (
                  <SkillChip
                    key={skill.id}
                    skill={skill}
                    onEdit={handleOpenEditForm}
                    onDelete={handleTriggerDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Skill Overlay Dialog */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingSkill ? 'Edit Skill Details' : 'Add Catalog Skill'}
        className="max-w-md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-5">
          
          {editingSkill ? (
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-400">Selected Skill</label>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-600 font-bold">
                {editingSkill.skill_name} ({editingSkill.category})
              </div>
            </div>
          ) : (
            <SearchableSelect
              label="Select Skill"
              id="skill_id"
              options={MASTER_SKILLS_CATALOG}
              value={formFields.skill_id}
              onChange={handleInputChange}
              error={fieldErrors.skill_id}
              placeholder="Search or select catalog skill..."
              required
            />
          )}

          <div className="space-y-1.5">
            <label htmlFor="proficiency_level" className="block text-sm font-semibold text-slate-700">
              Proficiency Level
            </label>
            <select
              id="proficiency_level"
              value={formFields.proficiency_level}
              onChange={handleInputChange}
              className={`block w-full rounded-2xl border ${fieldErrors.proficiency_level ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:border-blue-500'} bg-white px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all`}
            >
              <option value="">Select Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            {fieldErrors.proficiency_level && (
              <p className="text-xs font-semibold text-red-500 select-none">{fieldErrors.proficiency_level}</p>
            )}
          </div>

          <Input
            label="Years of Experience"
            id="years_of_experience"
            type="number"
            value={formFields.years_of_experience}
            onChange={handleInputChange}
            error={fieldErrors.years_of_experience}
            placeholder="e.g. 3"
            min="0"
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
              {editingSkill ? 'Save Changes' : 'Associate Skill'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Remove Catalog Skill"
      >
        <div className="space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to remove this skill from your profile? This association will be deleted from your resume.
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

export default SkillsPage;
