import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MultiSelectProps {
  value: string[]
  onValueChange: (value: string[]) => void
  placeholder: string
  options: { value: string; label: string }[]
  disabled?: boolean
  className?: string
  maxSelections?: number
}

export function MultiSelect({
  value,
  onValueChange,
  placeholder,
  options,
  disabled = false,
  className,
  maxSelections
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onValueChange(value.filter(item => item !== optionValue))
    } else {
      if (maxSelections && value.length >= maxSelections) {
        return
      }
      onValueChange([...value, optionValue])
    }
  }

  const handleRemove = (optionValue: string) => {
    onValueChange(value.filter(item => item !== optionValue))
  }

  const selectedOptions = options.filter(option => value.includes(option.value))

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between h-10 sm:h-11 border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              !value.length && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            {value.length > 0 
              ? `${value.length} area${value.length > 1 ? 's' : ''} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search.. " />
            <CommandList className="max-h-[200px]">
              <CommandEmpty>No {placeholder.toLowerCase()} found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                    {maxSelections && value.length >= maxSelections && !value.includes(option.value) && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        Max {maxSelections} selections
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected items display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge
              key={option.value}
              variant="secondary"
              className="text-xs px-2 py-1"
            >
              {option.label}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => handleRemove(option.value)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
