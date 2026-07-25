import api from './api/axios';
import { profileService } from './profile/profileService';
import { skillsService } from './skills/skillsService';
import { MASTER_SKILLS_CATALOG } from '@/pages/jobseeker/Skills';

export const resumeParserService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/resume-parser/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/resume-parser/history');
    return response.data;
  },

  deleteHistory: async (id) => {
    const response = await api.delete(`/resume-parser/history/${id}`);
    return response.data;
  },

  saveParsedResume: async (data, userId) => {
    // 1. Update Profile (Name, Phone, Location)
    const profilePayload = {
      name: data.personal_info?.name || 'Unknown',
      phone_number: data.personal_info?.phone || '',
      location: data.personal_info?.location || '',
      bio: data.summary || '',
      // Maintain other fields if needed, fallback to placeholder
      skills: []
    };
    try {
      await profileService.updateProfile(profilePayload);
    } catch (e) {
      console.warn("Failed to update profile via profileService:", e);
    }

    // Helper to format dates correctly (e.g. 2022 -> 2022-01-01)
    const formatPayloadDate = (dateStr) => {
      if (!dateStr) return '2020-01-01';
      // Clean string
      const cleaned = dateStr.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;
      if (/^\d{4}-\d{2}$/.test(cleaned)) return `${cleaned}-01`;
      if (/^\d{4}$/.test(cleaned)) return `${cleaned}-01-01`;
      return '2020-01-01'; // Safe fallback
    };

    // 2. Save Education Entries (Avoid duplicates)
    if (data.education && data.education.length > 0) {
      try {
        const existingEducation = await api.get('/profile/education').then(r => r.data).catch(() => []);
        for (const edu of data.education) {
          const instName = edu.institution || 'Unknown School';
          const isDuplicate = existingEducation.some(e => 
            e.institution_name?.toLowerCase() === instName.toLowerCase() &&
            e.degree?.toLowerCase() === edu.degree?.toLowerCase() &&
            e.field_of_study?.toLowerCase() === edu.field_of_study?.toLowerCase()
          );

          if (!isDuplicate) {
            await api.post('/profile/education', {
              institution_name: instName,
              degree: edu.degree || 'Degree',
              field_of_study: edu.field_of_study || 'Field',
              start_date: formatPayloadDate(edu.start_date),
              end_date: edu.end_date ? formatPayloadDate(edu.end_date) : null,
              grade: edu.grade || '',
              description: ''
            });
          }
        }
      } catch (err) {
        console.error("Failed to save education items:", err);
      }
    }

    // 3. Save Experience Entries (Avoid duplicates)
    if (data.experience && data.experience.length > 0) {
      try {
        const existingExperience = await api.get('/profile/experience').then(r => r.data).catch(() => []);
        for (const exp of data.experience) {
          const isDuplicate = existingExperience.some(e => 
            e.company_name?.toLowerCase() === exp.company_name?.toLowerCase() &&
            e.job_title?.toLowerCase() === exp.job_title?.toLowerCase()
          );

          if (!isDuplicate) {
            await api.post('/profile/experience', {
              company_name: exp.company_name || 'Company',
              job_title: exp.job_title || 'Role',
              employment_type: exp.employment_type || 'Full-time',
              start_date: formatPayloadDate(exp.start_date),
              end_date: exp.end_date ? formatPayloadDate(exp.end_date) : null,
              currently_working: exp.current_job || false,
              description: exp.responsibilities || 'Responsibilities described'
            });
          }
        }
      } catch (err) {
        console.error("Failed to save experience items:", err);
      }
    }

    // 4. Save Skills (Avoid duplicates and resolve catalog)
    if (data.skills && data.skills.length > 0 && userId) {
      try {
        const existingSkills = await skillsService.getSkillsList().catch(() => []);
        const existingIds = new Set(existingSkills.map(s => s.id));

        for (const parsedSkillName of data.skills) {
          // Look up skill in MASTER_SKILLS_CATALOG
          const matchedCatalogSkill = MASTER_SKILLS_CATALOG.find(s => 
            s.skill_name?.toLowerCase() === parsedSkillName.trim().toLowerCase()
          );

          if (matchedCatalogSkill && !existingIds.has(matchedCatalogSkill.id)) {
            await skillsService.addSkill(matchedCatalogSkill.id);
            
            // Save details to localStorage to respect the existing skills workflow
            const extraKey = `skill_details_${userId}_${matchedCatalogSkill.id}`;
            localStorage.setItem(extraKey, JSON.stringify({
              proficiency_level: 'Intermediate',
              years_of_experience: 1
            }));
          }
        }
      } catch (err) {
        console.error("Failed to save skills items:", err);
      }
    }
  }
};

export default resumeParserService;
