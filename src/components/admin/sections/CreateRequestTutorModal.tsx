"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { SUBJECT_OPTIONS, CLASS_LEVELS } from "@/data/mockData";
import mediumOptions from "@/data/mediumOptions.json";
import { PlusCircle, X } from "lucide-react";

interface CreateRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (data: any) => Promise<void>;
  isCreating: boolean;
  categories: any[];
  districtOptions: any[];
  DistrictData: any;
  isDistrictLoading: boolean;
}

export function CreateRequestModal({
  open,
  onOpenChange,
  onCreate,
  isCreating,
  categories,
  districtOptions,
  DistrictData,
  isDistrictLoading,
}: CreateRequestModalProps) {
  const [createFormData, setCreateFormData] = useState({
    phoneNumber: "",
    studentGender: "",
    district: "",
    thana: "",
    area: "",
    detailedLocation: "",
    selectedCategories: [] as string[],
    selectedSubjects: [] as string[],
    selectedClasses: [] as string[],
    tutorGenderPreference: "",
    isSalaryNegotiable: true,
    salaryRange: { min: 0, max: 0 },
    extraInformation: "",
    medium: "",
    numberOfStudents: 1,
    tutoringDays: 1,
    tutoringTime: "",
    tutoringDuration: "",
    tutoringType: "",
    adminNote: "",
  });

  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // District change handler
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setCreateFormData((prev) => ({
      ...prev,
      district,
      thana: "",
      area: "",
    }));
    setAvailableThanas([]);
    setAvailableAreas([]);
    setSelectedAreas([]);

    // Load thanas for selected district
    if (DistrictData?.data && district) {
      const selectedDistrictData = DistrictData.data.find(
        (d: any) => d.name === district
      );
      if (selectedDistrictData) {
        setAvailableThanas(selectedDistrictData.thana || []);
      }
    }
  };

  // Thana change handler
  const handleThanaChange = (thana: string) => {
    setCreateFormData((prev) => ({
      ...prev,
      thana,
      area: "",
    }));
    setAvailableAreas([]);
    setSelectedAreas([]);

    // Load areas for selected district and thana
    if (DistrictData?.data && createFormData.district) {
      const selectedDistrictData = DistrictData.data.find(
        (d: any) => d.name === createFormData.district
      );
      if (selectedDistrictData) {
        setAvailableAreas(selectedDistrictData.area || []);
      }
    }
  };

  // Area selection handler
  const handleAreaSelection = (area: string) => {
    const newSelectedAreas = selectedAreas.includes(area)
      ? selectedAreas.filter((a) => a !== area)
      : [...selectedAreas, area];

    setSelectedAreas(newSelectedAreas);
    setCreateFormData((prev) => ({
      ...prev,
      area: newSelectedAreas.join(", "),
    }));
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle salary range change
  const handleSalaryRangeChange = (type: "min" | "max", value: number) => {
    setCreateFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: value,
      },
    }));
  };

  // Handle category selection
  const handleCategorySelection = (categoryName: string) => {
    setCreateFormData((prev) => {
      const currentCategories = prev.selectedCategories;
      const categories = currentCategories.includes(categoryName)
        ? currentCategories.filter((c) => c !== categoryName)
        : [...currentCategories, categoryName];

      return {
        ...prev,
        selectedCategories: categories,
      };
    });
  };

  // Handle subject selection
  const handleSubjectSelection = (subjectName: string) => {
    setCreateFormData((prev) => {
      const currentSubjects = prev.selectedSubjects;
      const subjects = currentSubjects.includes(subjectName)
        ? currentSubjects.filter((s) => s !== subjectName)
        : [...currentSubjects, subjectName];

      return {
        ...prev,
        selectedSubjects: subjects,
      };
    });
  };

  // Handle class selection
  const handleClassSelection = (className: string) => {
    setCreateFormData((prev) => {
      const currentClasses = prev.selectedClasses;
      const classes = currentClasses.includes(className)
        ? currentClasses.filter((c) => c !== className)
        : [...currentClasses, className];

      return {
        ...prev,
        selectedClasses: classes,
      };
    });
  };

  // Reset form
  const resetForm = () => {
    setCreateFormData({
      phoneNumber: "",
      studentGender: "",
      district: "",
      thana: "",
      area: "",
      detailedLocation: "",
      selectedCategories: [],
      selectedSubjects: [],
      selectedClasses: [],
      tutorGenderPreference: "",
      isSalaryNegotiable: true,
      salaryRange: { min: 0, max: 0 },
      extraInformation: "",
      medium: "",
      numberOfStudents: 1,
      tutoringDays: 1,
      tutoringTime: "",
      tutoringDuration: "",
      tutoringType: "",
      adminNote: "",
    });
    setSelectedDistrict("");
    setAvailableThanas([]);
    setAvailableAreas([]);
    setSelectedAreas([]);
  };

  // Handle modal close
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Handle create request
  const handleCreate = async () => {
    // Validate required fields
    const requiredFields = [
      "phoneNumber",
      "studentGender",
      "district",
      "thana",
      "area",
      "medium",
      "tutoringType",
      "tutoringDuration",
      "tutoringDays",
      "tutoringTime",
      "numberOfStudents",
      "tutorGenderPreference",
    ];

    for (const field of requiredFields) {
      if (!createFormData[field as keyof typeof createFormData]) {
        toast({
          title: "Missing Information",
          description: `${field} is required`,
          variant: "destructive",
        });
        return;
      }
    }

    if (createFormData.selectedCategories.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    if (createFormData.selectedSubjects.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one subject",
        variant: "destructive",
      });
      return;
    }

    if (createFormData.selectedClasses.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one class level",
        variant: "destructive",
      });
      return;
    }

    if (!createFormData.salaryRange.min || !createFormData.salaryRange.max) {
      toast({
        title: "Missing Information",
        description: "Please enter salary range",
        variant: "destructive",
      });
      return;
    }

    if (createFormData.salaryRange.min > createFormData.salaryRange.max) {
      toast({
        title: "Invalid Salary Range",
        description: "Minimum salary cannot be greater than maximum salary",
        variant: "destructive",
      });
      return;
    }

    await onCreate(createFormData);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Tuition Request</DialogTitle>
          <DialogDescription>
            Create a new tuition request for students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Section title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Phone Number *">
                <Input
                  value={createFormData.phoneNumber}
                  onChange={(e) =>
                    handleFormChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter phone number"
                  required
                />
              </FormField>

              <FormField label="Student Gender *">
                <Select
                  value={createFormData.studentGender}
                  onValueChange={(value) =>
                    handleFormChange("studentGender", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </Section>

          {/* Location Information */}
          <Section title="Location Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="District *">
                {isDistrictLoading ? (
                  <Input placeholder="Loading districts..." disabled />
                ) : (
                  <Select
                    value={createFormData.district}
                    onValueChange={handleDistrictChange}
                    disabled={isDistrictLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          isDistrictLoading ? "Loading..." : "Select district"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((district: any) => (
                        <SelectItem key={district.value} value={district.value}>
                          {district.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField label="Thana/Upazila *">
                {!createFormData.district ? (
                  <Input placeholder="Please select district first" disabled />
                ) : availableThanas.length > 0 ? (
                  <Select
                    value={createFormData.thana}
                    onValueChange={handleThanaChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select thana/upazila" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableThanas.map((thana) => (
                        <SelectItem key={thana} value={thana}>
                          {thana}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={createFormData.thana}
                    onChange={(e) => handleFormChange("thana", e.target.value)}
                    placeholder="Enter thana/upazila"
                    required
                  />
                )}
              </FormField>

              <div className="md:col-span-3 space-y-2">
                <Label>Area *</Label>
                {!createFormData.thana ? (
                  <Input placeholder="Please select thana first" disabled />
                ) : availableAreas.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {availableAreas.map((area) => (
                        <AreaChip
                          key={area}
                          area={area}
                          selected={selectedAreas.includes(area)}
                          onSelect={() => handleAreaSelection(area)}
                        />
                      ))}
                    </div>
                    {selectedAreas.length > 0 && (
                      <SelectedItemsDisplay
                        items={selectedAreas}
                        onRemove={handleAreaSelection}
                      />
                    )}
                  </div>
                ) : (
                  <Input
                    value={createFormData.area}
                    onChange={(e) => handleFormChange("area", e.target.value)}
                    placeholder="Enter area"
                    required
                  />
                )}
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="detailedLocation">
                  Detailed Location (Optional)
                </Label>
                <Input
                  value={createFormData.detailedLocation}
                  onChange={(e) =>
                    handleFormChange("detailedLocation", e.target.value)
                  }
                  placeholder="Enter detailed location"
                />
              </div>
            </div>
          </Section>

          {/* Academic Information */}
          <Section title="Academic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Medium *">
                <Select
                  value={createFormData.medium}
                  onValueChange={(value) => handleFormChange("medium", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select medium" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediumOptions.mediums.map((medium) => (
                      <SelectItem key={medium.value} value={medium.value}>
                        {medium.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tutoring Type *">
                <Select
                  value={createFormData.tutoringType}
                  onValueChange={(value) =>
                    handleFormChange("tutoringType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tutoring type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home Tutoring">Home Tutoring</SelectItem>
                    <SelectItem value="Online Tutoring">
                      Online Tutoring
                    </SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </Section>

          {/* Category, Subjects & Classes */}
          <Section title="Category, Subjects & Classes">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectableField
                label="Category *"
                placeholder="Select category"
                items={categories.map((c) => c.name)}
                selectedItems={createFormData.selectedCategories}
                onSelect={handleCategorySelection}
              />

              <SelectableField
                label="Subjects *"
                placeholder="Select subjects"
                items={SUBJECT_OPTIONS}
                selectedItems={createFormData.selectedSubjects}
                onSelect={handleSubjectSelection}
                disabled={createFormData.selectedCategories.length === 0}
              />

              <SelectableField
                label="Class Levels *"
                placeholder="Select class levels"
                items={CLASS_LEVELS}
                selectedItems={createFormData.selectedClasses}
                onSelect={handleClassSelection}
                disabled={createFormData.selectedCategories.length === 0}
              />

              <FormField label="Number of Students *">
                <Input
                  type="number"
                  min="1"
                  value={createFormData.numberOfStudents}
                  onChange={(e) =>
                    handleFormChange(
                      "numberOfStudents",
                      parseInt(e.target.value) || 1
                    )
                  }
                  placeholder="Enter number of students"
                  required
                />
              </FormField>
            </div>
          </Section>

          {/* Tutoring Details */}
          <Section title="Tutoring Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Duration per Session *">
                <Select
                  value={createFormData.tutoringDuration}
                  onValueChange={(value) =>
                    handleFormChange("tutoringDuration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 minutes">30 minutes</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                    <SelectItem value="3 hours">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Days per Week *">
                <Select
                  value={createFormData.tutoringDays.toString()}
                  onValueChange={(value) =>
                    handleFormChange("tutoringDays", parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <SelectItem key={day} value={day.toString()}>
                        {day} {day === 1 ? "Day" : "Days"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Preferred Time *">
                <Input
                  type="time"
                  value={createFormData.tutoringTime}
                  onChange={(e) =>
                    handleFormChange("tutoringTime", e.target.value)
                  }
                  className="w-full"
                />
              </FormField>

              <FormField label="Preferred Tutor Gender *">
                <Select
                  value={createFormData.tutorGenderPreference}
                  onValueChange={(value) =>
                    handleFormChange("tutorGenderPreference", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </Section>

          {/* Salary Information */}
          <Section title="Salary Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Minimum Salary (৳) *">
                <Input
                  type="number"
                  min="0"
                  value={createFormData.salaryRange.min}
                  onChange={(e) =>
                    handleSalaryRangeChange("min", parseInt(e.target.value))
                  }
                  required
                />
              </FormField>

              <FormField label="Maximum Salary (৳) *">
                <Input
                  type="number"
                  min="0"
                  value={createFormData.salaryRange.max}
                  onChange={(e) =>
                    handleSalaryRangeChange("max", parseInt(e.target.value))
                  }
                  required
                />
              </FormField>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={createFormData.isSalaryNegotiable}
                  onCheckedChange={(checked) =>
                    handleFormChange("isSalaryNegotiable", checked)
                  }
                />
                <Label className="cursor-pointer">Salary is Negotiable</Label>
              </div>
            </div>
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information">
            <div className="space-y-4">
              <FormField label="Extra Information (Optional)">
                <Textarea
                  value={createFormData.extraInformation}
                  onChange={(e) =>
                    handleFormChange("extraInformation", e.target.value)
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </FormField>

              <FormField label="Admin Notes (Optional)">
                <Textarea
                  value={createFormData.adminNote}
                  onChange={(e) => handleFormChange("adminNote", e.target.value)}
                  placeholder="Internal admin notes..."
                  rows={2}
                />
              </FormField>
            </div>
          </Section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function AreaChip({
  area,
  selected,
  onSelect,
}: {
  area: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer border ${
        selected
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-gray-100 text-gray-800 border-gray-300"
      }`}
      onClick={onSelect}
    >
      <span>{area}</span>
      {selected && <span className="text-xs">✓</span>}
    </div>
  );
}

function SelectedItemsDisplay({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (item: string) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">Selected:</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded text-sm"
          >
            <span>{item}</span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-red-500 hover:text-red-700 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectableField({
  label,
  placeholder,
  items,
  selectedItems,
  onSelect,
  disabled = false,
}: {
  label: string;
  placeholder: string;
  items: string[];
  selectedItems: string[];
  onSelect: (item: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        value=""
        onValueChange={(value) => {
          if (value && !selectedItems.includes(value)) {
            onSelect(value);
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item} value={item}>
              {item}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedItems.length > 0 && (
        <div className="mt-2 space-y-1">
          <p className="text-sm font-medium">Selected:</p>
          {selectedItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => onSelect(item)}
                className="text-red-500 hover:text-red-700 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}