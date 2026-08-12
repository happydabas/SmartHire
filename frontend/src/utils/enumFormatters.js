/**
 * Format backend enum values into human-readable labels.
 * Maps DB enum values like 'FULL_TIME' to display labels like 'Full-time'.
 */

const JOB_TYPE_LABELS = {
  'FULL_TIME': 'Full-time',
  'PART_TIME': 'Part-time',
  'CONTRACT': 'Contract',
  'INTERNSHIP': 'Internship',
  // Legacy values (in case old data exists)
  'Full-time': 'Full-time',
  'Part-time': 'Part-time',
};

const EXPERIENCE_LABELS = {
  'FRESHER': 'Fresher',
  'ENTRY': 'Entry',
  'MID': 'Mid',
  'SENIOR': 'Senior',
  // Legacy values
  'Fresher': 'Fresher',
  'Entry': 'Entry',
  'Mid': 'Mid',
  'Senior': 'Senior',
};

const WORK_MODE_LABELS = {
  'REMOTE': 'Remote',
  'HYBRID': 'Hybrid',
  'ONSITE': 'Onsite',
  // Legacy values
  'Remote': 'Remote',
  'Hybrid': 'Hybrid',
  'Onsite': 'Onsite',
};

const STATUS_LABELS = {
  'DRAFT': 'Draft',
  'OPEN': 'Open',
  'closed': 'Closed',
  // Legacy values
  'draft': 'Draft',
  'open': 'Open',
};

/**
 * Format a job type enum value for display.
 * @param {string} value - The raw enum value from the API
 * @returns {string} Human-readable label
 */
export const formatJobType = (value) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value : (value?.value || String(value));
  return JOB_TYPE_LABELS[str] || str.replace(/_/g, '-').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Format an experience level enum value for display.
 */
export const formatExperienceLevel = (value) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value : (value?.value || String(value));
  return EXPERIENCE_LABELS[str] || str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Format a work mode enum value for display.
 */
export const formatWorkMode = (value) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value : (value?.value || String(value));
  return WORK_MODE_LABELS[str] || str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

/**
 * Format a job status enum value for display.
 */
export const formatJobStatus = (value) => {
  if (!value) return '';
  const str = typeof value === 'string' ? value : (value?.value || String(value));
  return STATUS_LABELS[str] || str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};
