export const extractErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";

  // If error is just a string
  if (typeof error === 'string') return error;

  // A) Network Error - No HTTP response received (error.response is undefined/null)
  if (!error.response) {
    return "Unable to connect to the server. Please check your internet connection.";
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

    // 3. Nested error object: { "error": { "message": "..." } }
    if (data.error && typeof data.error === 'object') {
      const errObj = data.error;
      if (errObj.message && typeof errObj.message === 'string') {
        return errObj.message;
      }
      if (errObj.detail && typeof errObj.detail === 'string') {
        return errObj.detail;
      }
      if (errObj.msg && typeof errObj.msg === 'string') {
        return errObj.msg;
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
  
  if (msg.includes('already exists') || msg.includes('already registered') || msg.includes('email address already exists')) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (msg.includes('value is not a valid email address') || msg.includes('invalid email')) {
    return "Please enter a valid email address.";
  }
  return msg;
};

export const mapLoginError = (msg) => {
  if (!msg || typeof msg !== 'string') return "An unexpected error occurred.";
  
  if (msg.includes('Incorrect email or password') || msg.includes('Invalid credentials') || msg.includes('Unauthorized')) {
    return "Invalid email or password.";
  }
  if (msg.includes('user does not exist') || msg.includes('No account found') || msg.includes('user not found')) {
    return "No account found with this email.";
  }
  if (msg.toLowerCase().includes('inactive') || msg.toLowerCase().includes('disabled')) {
    return "Your account is inactive. Please contact support.";
  }
  return msg;
};
