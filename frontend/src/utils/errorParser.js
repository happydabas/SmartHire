export const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";

  // If error is just a string
  if (typeof error === 'string') return error;

  // Handle Axios cancel, timeout, or network issues
  if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout') || error.message?.toLowerCase().includes('network error')) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  // A) Network Error - No HTTP response received (error.response is undefined/null)
  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }

  const { status, data } = error.response;

  // D) 500 errors
  if (status >= 500) {
    return "Something went wrong. Please try again later.";
  }

  // B) Backend Error / C) FastAPI validation errors - HTTP response exists
  if (data) {
    // 1. FastAPI validation errors: { "detail": [ { "msg": "..." } ] }
    if (data.detail && Array.isArray(data.detail)) {
      return data.detail.map(err => err.msg || JSON.stringify(err)).join(', ');
    }

    // 2. { "detail": "..." }
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    // 3. Nested error object: { "error": { "message": "...", "details": [...] } }
    if (data.error && typeof data.error === 'object') {
      const errObj = data.error;
      if (errObj.details && Array.isArray(errObj.details) && errObj.details.length > 0) {
        return errObj.details.map(err => {
          const field = err.loc && Array.isArray(err.loc) ? err.loc[err.loc.length - 1] : '';
          return field ? `${field}: ${err.msg}` : (err.msg || JSON.stringify(err));
        }).join('; ');
      }
      if (errObj.message && typeof errObj.message === 'string' && errObj.message !== 'Inbound request validation failed.') {
        return errObj.message;
      }
      if (errObj.detail && typeof errObj.detail === 'string') {
        return errObj.detail;
      }
      if (errObj.msg && typeof errObj.msg === 'string') {
        return errObj.msg;
      }
      if (errObj.message && typeof errObj.message === 'string') {
        return errObj.message;
      }
    }

    // 4. { "message": "..." }
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }

    // 5. { "errors": [...] }
    if (data.errors) {
      if (Array.isArray(data.errors)) {
        return data.errors.map(err => typeof err === 'string' ? err : (err.msg || err.message || JSON.stringify(err))).join(', ');
      }
      if (typeof data.errors === 'string') {
        return data.errors;
      }
    }

    // Fallback to any string property in data
    const stringKeys = Object.keys(data).filter(key => typeof data[key] === 'string');
    if (stringKeys.length > 0) {
      return data[stringKeys[0]];
    }
  }

  // Fallback to standard error message if it is not generic
  if (error.message && !error.message.includes('AxiosError') && !error.message.includes('status code')) {
    return error.message;
  }

  return "An unexpected error occurred.";
};

export const mapRegistrationError = (msg) => {
  if (!msg || typeof msg !== 'string') return "An unexpected error occurred.";
  
  const lowerMsg = msg.toLowerCase();
  if (lowerMsg.includes('already exists') || lowerMsg.includes('already registered') || lowerMsg.includes('email address already exists') || lowerMsg.includes('duplicate')) {
    return "An account with this email already exists.";
  }
  if (lowerMsg.includes('value is not a valid email address') || lowerMsg.includes('invalid email')) {
    return "Please enter a valid email address.";
  }
  return msg;
};

export const mapLoginError = (msg) => {
  if (!msg || typeof msg !== 'string') return "An unexpected error occurred.";
  
  const lowerMsg = msg.toLowerCase();
  if (
    lowerMsg.includes('incorrect email or password') ||
    lowerMsg.includes('invalid credentials') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('password') ||
    lowerMsg.includes('login') ||
    lowerMsg.includes('user not found') ||
    lowerMsg.includes('no account found')
  ) {
    return "Incorrect email or password.";
  }
  if (lowerMsg.includes('expired') || lowerMsg.includes('token') || lowerMsg.includes('session')) {
    return "Your session has expired. Please log in again.";
  }
  if (lowerMsg.includes('inactive') || lowerMsg.includes('disabled')) {
    return "Your account is inactive. Please contact support.";
  }
  return msg;
};

export const parseFormErrors = (error) => {
  if (!error) return null;
  if (error.response?.status === 422) {
    const data = error.response.data;
    const details = data?.detail || data?.error?.details;
    if (Array.isArray(details)) {
      const fieldErrors = {};
      details.forEach((err) => {
        if (err.loc && Array.isArray(err.loc) && err.loc.length > 0) {
          const field = err.loc[err.loc.length - 1];
          fieldErrors[field] = err.msg || 'Invalid value';
        }
      });
      return Object.keys(fieldErrors).length > 0 ? fieldErrors : null;
    }
  }
  return null;
};
