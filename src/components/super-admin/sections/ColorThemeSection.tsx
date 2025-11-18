import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ColorPicker } from '@/components/ui/color-picker';
import { toast } from '@/components/ui/use-toast';
import { Palette, Save, RotateCcw, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { useColorTheme } from '@/contexts/ColorThemeContext';

interface ColorTheme {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  custom_theme_enabled: boolean;
}

export default function ColorThemeSection() {
  const { colorTheme: contextTheme, loading: contextLoading, refreshTheme } = useColorTheme();
  const [colorTheme, setColorTheme] = useState<ColorTheme>(contextTheme);
  
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Update local state when context changes
  useEffect(() => {
    setColorTheme(contextTheme);
  }, [contextTheme]);

  // Save color theme settings
  const saveColorTheme = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/website-management/color-theme`, colorTheme, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Color theme updated successfully',
        });
        
        // Refresh the context to apply changes
        await refreshTheme();
      }
    } catch (error) {
      console.error('Error saving color theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to save color theme settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Apply custom theme to the website (for preview)
  const applyCustomTheme = () => {
    try {
      const root = document.documentElement;
      
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
      
      console.log('Preview theme applied successfully');
    } catch (error) {
      console.error('Error applying preview theme:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply preview theme',
        variant: 'destructive'
      });
    }
  };

  // Reset to default theme (for preview)
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
      
      console.log('Preview default theme applied successfully');
    } catch (error) {
      console.error('Error applying preview default theme:', error);
    }
  };

  // Preview theme changes
  const togglePreview = () => {
    try {
      if (previewMode) {
        resetToDefaultTheme();
        setPreviewMode(false);
        toast({
          title: 'Preview Disabled',
          description: 'Default theme restored',
        });
      } else {
        applyCustomTheme();
        setPreviewMode(true);
        toast({
          title: 'Preview Enabled',
          description: 'Custom theme applied for preview',
        });
      }
    } catch (error) {
      console.error('Error toggling preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle preview mode',
        variant: 'destructive'
      });
    }
  };

  // Reset to default colors
  const resetToDefaults = () => {
    setColorTheme({
      primary_color: '#16a34a',
      secondary_color: '#64748b',
      accent_color: '#0ea5e9',
      custom_theme_enabled: false
    });
    
    toast({
      title: 'Reset',
      description: 'Colors reset to defaults',
    });
  };

  useEffect(() => {
    // Apply theme when custom_theme_enabled changes (for preview)
    if (previewMode) {
      if (colorTheme.custom_theme_enabled) {
        applyCustomTheme();
      } else {
        resetToDefaultTheme();
      }
    }
  }, [colorTheme.custom_theme_enabled, colorTheme.primary_color, colorTheme.secondary_color, colorTheme.accent_color, previewMode]);

  if (contextLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading color theme settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Color Theme Management</h2>
        <p className="text-muted-foreground">
          Customize the website's color scheme to match your brand identity
        </p>
      </div>

      <div className="grid gap-6">
        {/* Theme Toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Custom Theme
            </CardTitle>
            <CardDescription>
              Enable custom color theme to override the default website colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="custom-theme"
                checked={colorTheme.custom_theme_enabled}
                onCheckedChange={(checked) => 
                  setColorTheme(prev => ({ ...prev, custom_theme_enabled: checked }))
                }
              />
              <Label htmlFor="custom-theme">
                {colorTheme.custom_theme_enabled ? 'Custom theme enabled' : 'Default theme active'}
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Color Pickers */}
        <Card>
          <CardHeader>
            <CardTitle>Color Configuration</CardTitle>
            <CardDescription>
              Choose your primary, secondary, and accent colors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <ColorPicker
              label="Primary Color"
              value={colorTheme.primary_color}
              onChange={(color) => setColorTheme(prev => ({ ...prev, primary_color: color }))}
            />
            
            <ColorPicker
              label="Secondary Color"
              value={colorTheme.secondary_color}
              onChange={(color) => setColorTheme(prev => ({ ...prev, secondary_color: color }))}
            />
            
            <ColorPicker
              label="Accent Color"
              value={colorTheme.accent_color}
              onChange={(color) => setColorTheme(prev => ({ ...prev, accent_color: color }))}
            />
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Preview</CardTitle>
            <CardDescription>
              See how your color choices will look on the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: colorTheme.primary_color }}
                >
                  Primary Color
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {colorTheme.primary_color}
                </p>
              </div>
              
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: colorTheme.secondary_color }}
                >
                  Secondary Color
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {colorTheme.secondary_color}
                </p>
              </div>
              
              <div className="space-y-2">
                <div 
                  className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: colorTheme.accent_color }}
                >
                  Accent Color
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {colorTheme.accent_color}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={togglePreview}
                className="flex items-center gap-2"
              >
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewMode ? 'Hide Preview' : 'Show Preview'}
              </Button>
              
              {previewMode && (
                <p className="text-sm text-muted-foreground">
                  Preview mode active - colors are applied to the current page
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={saveColorTheme}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Theme'}
              </Button>
              
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
