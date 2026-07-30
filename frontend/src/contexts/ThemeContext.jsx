import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      console.warn("ThemeContext: localStorage read failed:", e);
    }
    // Default to dark theme as our application's main design theme
    return 'dark';
  });

  useEffect(() => {
    try {
      const root = window.document.documentElement;
      const body = window.document.body;
      
      console.log("ThemeContext: Applying theme:", theme);
      
      if (theme === 'dark') {
        root.classList.add('dark');
        if (body) body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        if (body) body.classList.remove('dark');
      }
      
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("ThemeContext: Error applying theme classes:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    console.log("ThemeContext: Toggling theme directly to:", next);
    
    try {
      const root = window.document.documentElement;
      const body = window.document.body;
      if (next === 'dark') {
        root.classList.add('dark');
        if (body) body.classList.add('dark');
      } else {
        root.classList.remove('dark');
        if (body) body.classList.remove('dark');
      }
      localStorage.setItem('theme', next);
    } catch (e) {
      console.error("ThemeContext: Direct toggle DOM update failed:", e);
    }

    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
