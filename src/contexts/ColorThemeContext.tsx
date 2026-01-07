'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

interface ColorTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  custom_theme_enabled: boolean;
}

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  loading: boolean;
  applyCustomTheme: () => void;
  resetToDefaultTheme: () => void;
  refreshTheme: () => Promise<void>;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>({
    primary_color: '#16a34a',
    secondary_color: '#64748b',
    accent_color: '#0ea5e9',
    custom_theme_enabled: false
  });
  
  const [loading, setLoading] = useState(true);

  // Convert hex to HSL for better color manipulation
  const hexToHsl = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return { h: 0, s: 0, l: 0 };
    
    const r = parseInt(result[1], 16) / 255;
    const g = parseInt(result[2], 16) / 255;
    const b = parseInt(result[3], 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  // Apply custom theme to the website
  const applyCustomTheme = () => {
    try {
      const root = document.documentElement;
      
      const primaryHsl = hexToHsl(colorTheme.primary_color);
      const secondaryHsl = hexToHsl(colorTheme.secondary_color);
      const accentHsl = hexToHsl(colorTheme.accent_color);

      // Set CSS custom properties
      root.style.setProperty('--primary', `${primaryHsl.h} ${primaryHsl.s}% ${primaryHsl.l}%`);
      root.style.setProperty('--primary-light', `${primaryHsl.h} ${primaryHsl.s}% ${Math.min(primaryHsl.l + 15, 100)}%`);
      root.style.setProperty('--primary-dark', `${primaryHsl.h} ${primaryHsl.s}% ${Math.max(primaryHsl.l - 15, 0)}%`);
      root.style.setProperty('--primary-glow', `${primaryHsl.h} ${primaryHsl.s}% ${Math.min(primaryHsl.l + 25, 100)}%`);
      root.style.setProperty('--primary-variant', `${primaryHsl.h} ${Math.min(primaryHsl.s + 10, 100)}% ${primaryHsl.l}%`);
      
      root.style.setProperty('--secondary', `${secondaryHsl.h} ${secondaryHsl.s}% ${secondaryHsl.l}%`);
      root.style.setProperty('--accent', `${accentHsl.h} ${accentHsl.s}% ${accentHsl.l}%`);
      root.style.setProperty('--accent-glow', `${accentHsl.h} ${accentHsl.s}% ${Math.min(accentHsl.l + 20, 100)}%`);
      
    } catch (error) {
      console.error('Error applying custom theme:', error);
    }
  };

  // Reset to default theme
  const resetToDefaultTheme = () => {
    try {
      const root = document.documentElement;
      
      // Reset to default values from globals.css
      root.style.setProperty('--primary', '142 76% 36%');
      root.style.setProperty('--primary-light', '142 76% 45%');
      root.style.setProperty('--primary-dark', '142 76% 30%');
      root.style.setProperty('--primary-glow', '142 76% 60%');
      root.style.setProperty('--primary-variant', '160 84% 39%');
      root.style.setProperty('--secondary', '210 40% 96.1%');
      root.style.setProperty('--accent', '210 40% 96.1%');
      root.style.setProperty('--accent-glow', '210 40% 96.1%');
      
    } catch (error) {
      console.error('Error applying default theme:', error);
    }
  };

  // Fetch color theme from API
  const fetchColorTheme = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/website-management/color-theme`);
      
      if (response.data.success) {
        const theme = response.data.data;
        setColorTheme(theme);
        
        // Apply theme if enabled
        if (theme.custom_theme_enabled) {
          applyCustomTheme();
        } else {
          resetToDefaultTheme();
        }
        
      }
    } catch (error) {
      console.error('Error fetching color theme:', error);
      // Use default theme on error
      resetToDefaultTheme();
    } finally {
      setLoading(false);
    }
  };

  // Refresh theme from API
  const refreshTheme = async () => {
    await fetchColorTheme();
  };

  useEffect(() => {
    fetchColorTheme();
  }, []);

  useEffect(() => {
    // Apply theme when custom_theme_enabled changes
    if (colorTheme.custom_theme_enabled) {
      applyCustomTheme();
    } else {
      resetToDefaultTheme();
    }
  }, [colorTheme.custom_theme_enabled, colorTheme.primary_color, colorTheme.secondary_color, colorTheme.accent_color]);

  return (
    <ColorThemeContext.Provider value={{
      colorTheme,
      loading,
      applyCustomTheme,
      resetToDefaultTheme,
      refreshTheme
    }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}
