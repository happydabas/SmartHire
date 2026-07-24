export const storage = {
  setItem: (key, value) => {
    try {
      const stringifiedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, stringifiedValue);
    } catch (error) {
      console.error('Error setting local storage item:', error);
    }
  },

  getItem: (key) => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;
      // Simple parse check
      if (value.startsWith('{') || value.startsWith('[')) {
        return JSON.parse(value);
      }
      return value;
    } catch (error) {
      console.error('Error getting local storage item:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing local storage item:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing local storage:', error);
    }
  },
};
