'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use a simple initial state for server-side rendering to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>('light');
  
  // Move the theme detection logic to useEffect to ensure it only runs client-side
  useEffect(() => {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Only use stored theme if available, otherwise keep light theme as default
    // Removed the system preference check to always default to light theme
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Update localStorage when theme changes
      localStorage.setItem('theme', theme);
      
      // Update document class for Tailwind dark mode
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}