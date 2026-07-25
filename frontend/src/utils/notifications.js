import { toast } from 'sonner';
import { extractErrorMessage } from './errorParser';

/**
 * Show a success notification toast.
 * @param {string|object} message 
 */
export const showSuccess = (message) => {
  let msg = message;
  if (message && typeof message === 'object') {
    msg = extractErrorMessage(message);
  }
  toast.success(msg || 'Action completed successfully.');
};

/**
 * Show a user-friendly error notification toast.
 * @param {string|object} message 
 */
export const showError = (message) => {
  let errorMsg = message;
  if (message && typeof message === 'object') {
    errorMsg = extractErrorMessage(message);
  }
  
  // Map generic or empty messages to standard user-friendly text
  if (!errorMsg || errorMsg === 'An unexpected error occurred.') {
    errorMsg = 'Something went wrong.';
  }
  toast.error(errorMsg);
};

/**
 * Show a warning notification toast.
 * @param {string|object} message 
 */
export const showWarning = (message) => {
  let msg = message;
  if (message && typeof message === 'object') {
    msg = extractErrorMessage(message);
  }
  toast.warning(msg || 'Warning: Action requires attention.');
};

/**
 * Show an information notification toast.
 * @param {string|object} message 
 */
export const showInfo = (message) => {
  let msg = message;
  if (message && typeof message === 'object') {
    msg = extractErrorMessage(message);
  }
  toast.info(msg || 'Information notification.');
};
