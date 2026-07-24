export const validators = {
  email: (val) => {
    if (!val) return false;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(val).toLowerCase());
  },

  phone: (val) => {
    if (!val) return false;
    // Basic phone validation accepting optional +, country code, spaces, dashes
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(String(val).replace(/[\s()-]/g, ''));
  },

  url: (val) => {
    if (!val) return false;
    try {
      new URL(val);
      return true;
    } catch (_) {
      return false;
    }
  },
};
