'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
}

const PRESET_COLORS = [
  '#16a34a', '#059669', '#0d9488', '#0891b2', '#0ea5e9', '#3b82f6',
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#ef4444',
  '#f97316', '#eab308', '#84cc16', '#22c55e', '#64748b', '#475569'
];

export function ColorPicker({ value, onChange, label, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleColorChange = (color: string) => {
    onChange(color);
    setInputValue(color);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Validate hex color format
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (colorRegex.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    // Reset to valid value if input is invalid
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(inputValue)) {
      setInputValue(value);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label className="text-sm font-medium">{label}</Label>}
      <div className="flex items-center gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-10 p-0 border-2 border-gray-200 hover:border-gray-300"
              style={{ backgroundColor: value }}
            >
              <Palette className="h-4 w-4 text-white drop-shadow-sm" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preset Colors</Label>
                <div className="grid grid-cols-6 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      className={cn(
                        'w-8 h-8 rounded-md border-2 transition-all hover:scale-110',
                        value === color ? 'border-gray-800 scale-110' : 'border-gray-200 hover:border-gray-400'
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorChange(color)}
                    >
                      {value === color && <Check className="h-4 w-4 text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium">Custom Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder="#16a34a"
                    className="flex-1"
                  />
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-10 h-10 rounded border-2 border-gray-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="#16a34a"
          className="flex-1"
        />
      </div>
    </div>
  );
}
