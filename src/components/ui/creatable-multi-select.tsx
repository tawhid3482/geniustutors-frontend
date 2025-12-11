// components/ui/creatable-multi-select.tsx
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface CreatableMultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  options: { value: string; label: string }[];
  maxSelections?: number;
  className?: string;
}

export function CreatableMultiSelect({
  value,
  onValueChange,
  placeholder = "Select items or type to add...",
  options,
  maxSelections,
  className,
}: CreatableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleUnselect = (item: string) => {
    onValueChange(value.filter((i) => i !== item));
  };

  const handleSelect = (selectedValue: string) => {
    if (maxSelections && value.length >= maxSelections) {
      toast.error(`Maximum ${maxSelections} items allowed`);
      return;
    }
    
    if (!value.includes(selectedValue)) {
      onValueChange([...value, selectedValue]);
    }
    setInputValue("");
  };

  const handleCreateNew = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      handleSelect(inputValue.trim());
    }
  };

  const filteredOptions = options.filter(
    (option) =>
      !value.includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCreateOption = inputValue && 
    !filteredOptions.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase()) &&
    !value.some(val => val.toLowerCase() === inputValue.toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-11 justify-between bg-white/80 border-green-200 hover:bg-white/90 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 max-w-full overflow-hidden">
            {value.length > 0 ? (
              value.map((item) => (
                <Badge
                  key={item}
                  variant="secondary"
                  className="mr-1 mb-1 bg-green-100 text-green-800 hover:bg-green-200"
                >
                  {item}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(item);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(item)}
                  >
                    <X className="h-3 w-3 text-green-600 hover:text-green-800" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search or type new..."
            value={inputValue}
            onValueChange={setInputValue}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {showCreateOption && (
              <CommandGroup heading="Add new">
                <CommandItem
                  onSelect={handleCreateNew}
                  className="cursor-pointer"
                >
                  <Check className={cn("mr-2 h-4 w-4")} />
                  Create "{inputValue}"
                </CommandItem>
              </CommandGroup>
            )}
            <CommandGroup heading="Suggestions">
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.value)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}