import {
  useCreateassignTutorMutation,
  useUpdateAssignTutorMutation,
} from "@/redux/features/AssignTutor/AssignTutorApi";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";
import mediumOptions from "@/data/mediumOptions.json";
import { SUBJECT_OPTIONS, CLASS_LEVELS } from "@/data/mockData";

import {
  useCreateTutorRequestsMutation,
  useGetAllTutorRequestsQuery,
  useUpdateTutorRequestsMutation,
  useUpdateTutorRequestsStatusMutation,
} from "@/redux/features/tutorRequest/tutorRequestApi";
import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import {
  Eye,
  Edit2,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  MoreVertical,
  MapPin,
  Phone,
  User,
  GraduationCap,
  RefreshCw,
  Calendar,
  BookOpen,
  Filter,
  Download,
  Search,
  Users,
  ChevronDown,
  X,
  Tag,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

// Define types
interface TutorRequest {
  id: string;
  tutorRequestId: string;
  phoneNumber: string;
  studentGender: string;
  district: string;
  thana: string;
  area: string;
  subject: string;
  selectedSubjects: string[];
  selectedCategories: string[];
  selectedClasses: string[];
  salaryRange: {
    min: number;
    max: number;
  };
  isSalaryNegotiable: boolean;
  tutoringType: string;
  numberOfStudents: number;
  tutoringTime: string;
  tutoringDays: number;
  tutoringDuration: string;
  studentClass: string;
  tutorGenderPreference: string;
  medium: string;
  detailedLocation: string;
  extraInformation: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  adminNote?: string | null;
}

interface District {
  id: string;
  name: string;
  thana: string[];
  area: string[];
  color: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  iconUrl: string;
  color: string;
  icon: string;
  tuitions: number;
}

interface MediumOption {
  value: string;
  label: string;
}

// Chip Component for Selected Items
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-2">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 inline-flex items-center justify-center w-4 h-4 text-blue-800 hover:text-blue-900"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// Multiple Select Component
function MultipleSelect({
  label,
  options,
  selectedValues,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  options: string[] | MediumOption[];
  selectedValues: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder?: string;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredOptions =
    Array.isArray(options) && typeof options[0] === "object"
      ? (options as MediumOption[]).filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : (options as string[]).filter((option) =>
          option.toLowerCase().includes(searchTerm.toLowerCase())
        );

  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      onAdd(value);
    }
    setSearchTerm("");
    setShowDropdown(false);
  };

  const getLabel = (value: string) => {
    if (Array.isArray(options) && typeof options[0] === "object") {
      const option = (options as MediumOption[]).find(
        (opt) => opt.value === value
      );
      return option?.label || value;
    }
    return value;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Selected Chips */}
      <div className="flex flex-wrap mb-2">
        {selectedValues.map((value) => (
          <Chip
            key={value}
            label={getLabel(value)}
            onRemove={() => onRemove(value)}
          />
        ))}
      </div>

      {/* Input and Dropdown */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder || `Add ${label.toLowerCase()}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {showDropdown && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const value =
                    typeof option === "object" ? option.value : option;
                  const label =
                    typeof option === "object" ? option.label : option;
                  const isSelected = selectedValues.includes(value);

                  return (
                    <div
                      key={index}
                      onClick={() => handleSelect(value)}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                        isSelected ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {label}
                      {isSelected && (
                        <span className="ml-2 text-xs text-blue-600">✓</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Type to search and select {label.toLowerCase()}. Click on chip to
        remove.
      </p>
    </div>
  );
}

// DetailsModal Component
function DetailsModal({
  open,
  onOpenChange,
  selectedRequest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: TutorRequest | null;
}) {
  if (!selectedRequest) return null;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div
        className="fixed inset-0 bg-black/50 "
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-40 top-5  h-screen w-full md:w-3/4  bg-white shadow-xl overflow-y-auto ">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-6 h-6" />
                Tuition Request Details
              </h2>
              <p className="text-gray-600">
                Request ID: {selectedRequest.tutorRequestId}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRequest.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : selectedRequest.status === "Completed"
                      ? "bg-blue-100 text-blue-800"
                      : selectedRequest.status === "Cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedRequest.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Created:{" "}
                {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Student Information */}
            <Section title="Student Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Student Name"
                  value={selectedRequest.user.fullName}
                  icon={<User className="w-4 h-4" />}
                />
                <InfoField
                  label="Phone Number"
                  value={selectedRequest.phoneNumber}
                  icon={<Phone className="w-4 h-4" />}
                />
                <InfoField label="Email" value={selectedRequest.user.email} />
                <InfoField
                  label="Student Gender"
                  value={selectedRequest.studentGender}
                />
              </div>
            </Section>

            {/* Location Information */}
            <Section title="Location Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoField
                  label="District"
                  value={selectedRequest.district}
                  icon={<MapPin className="w-4 h-4" />}
                />
                <InfoField label="Thana" value={selectedRequest.thana} />
                <InfoField label="Area" value={selectedRequest.area} />
              </div>
              <InfoField
                label="Detailed Location"
                value={selectedRequest.detailedLocation}
                type="textarea"
              />
            </Section>

            {/* Academic Information */}
            <Section title="Academic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Selected Classes"
                  value={
                    selectedRequest.selectedClasses?.join(", ") ||
                    "Not specified"
                  }
                />

                <InfoField
                  label="Tutoring Type"
                  value={selectedRequest.tutoringType}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Medium
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.selectedCategories?.map((cat, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected Subjects
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedRequest.selectedSubjects?.map((subj, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>
            </Section>

            {/* Tutoring Schedule */}
            <Section title="Tutoring Schedule">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <InfoField
                  label="Tutoring Days"
                  value={`${selectedRequest.tutoringDays} days/week`}
                  icon={<Calendar className="w-4 h-4" />}
                />
                <InfoField
                  label="Tutoring Time"
                  value={selectedRequest.tutoringTime}
                  icon={<Clock className="w-4 h-4" />}
                />
                <InfoField
                  label="Duration per Session"
                  value={selectedRequest.tutoringDuration}
                />
                <InfoField
                  label="Number of Students"
                  value={selectedRequest.numberOfStudents.toString()}
                />
              </div>
            </Section>

            {/* Salary Information */}
            <Section title="Salary Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Salary Range"
                  value={`৳${selectedRequest.salaryRange.min.toLocaleString()} - ৳${selectedRequest.salaryRange.max.toLocaleString()}`}
                />
                <InfoField
                  label="Salary Negotiable"
                  value={selectedRequest.isSalaryNegotiable ? "Yes" : "No"}
                  badge={
                    selectedRequest.isSalaryNegotiable && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Negotiable
                      </span>
                    )
                  }
                />
              </div>
            </Section>

            {/* Preferences */}
            <Section title="Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField
                  label="Preferred Tutor Gender"
                  value={selectedRequest.tutorGenderPreference}
                />
                <InfoField
                  label="Extra Information"
                  value={
                    selectedRequest.extraInformation ||
                    "No additional information provided"
                  }
                  type="textarea"
                />
              </div>
            </Section>

            {/* Admin Notes */}
            <Section title="Admin Notes">
              <InfoField
                label=""
                value={selectedRequest.adminNote || "No admin notes added"}
                type="textarea"
              />
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// EditModal Component with Multiple Select
function EditModal({
  open,
  onOpenChange,
  selectedRequest,
  districts,
  categories,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: TutorRequest | null;
  districts: District[];
  categories: Category[];
  onUpdate: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [manualSubject, setManualSubject] = useState("");

  useEffect(() => {
    if (selectedRequest) {
      const data = {
        phoneNumber: selectedRequest.phoneNumber,
        studentGender: selectedRequest.studentGender,
        district: selectedRequest.district,
        thana: selectedRequest.thana,
        area: selectedRequest.area,
        subject: selectedRequest.subject,
        selectedSubjects: selectedRequest.selectedSubjects || [],
        selectedCategories: selectedRequest.selectedCategories || [],
        selectedClasses: selectedRequest.selectedClasses || [],
        salaryRange: {
          min: selectedRequest.salaryRange.min,
          max: selectedRequest.salaryRange.max,
        },
        isSalaryNegotiable: selectedRequest.isSalaryNegotiable,
        tutoringType: selectedRequest.tutoringType,
        numberOfStudents: selectedRequest.numberOfStudents,
        tutoringTime: selectedRequest.tutoringTime,
        tutoringDays: selectedRequest.tutoringDays,
        tutoringDuration: selectedRequest.tutoringDuration,
        studentClass: selectedRequest.studentClass,
        tutorGenderPreference: selectedRequest.tutorGenderPreference,
        detailedLocation: `${selectedRequest.district}, ${selectedRequest.thana}, ${selectedRequest.area}`,
        extraInformation: selectedRequest.extraInformation,
        adminNote: selectedRequest.adminNote || "",
      };
      setFormData(data);
      setSelectedDistrict(selectedRequest.district);

      // Initialize selected arrays
      setSelectedMediums([selectedRequest.medium].filter(Boolean));
      setSelectedSubjects(selectedRequest.selectedSubjects || []);
      setSelectedClasses(selectedRequest.selectedClasses || []);
      setSelectedCategories(selectedRequest.selectedCategories || []);

      const district = districts.find(
        (d) => d.name === selectedRequest.district
      );
      if (district) {
        setAvailableThanas(district.thana || []);
        setAvailableAreas(district.area || []);
      }
    }
  }, [selectedRequest, districts]);

  useEffect(() => {
    if (selectedDistrict && formData) {
      const district = districts.find((d) => d.name === selectedDistrict);
      if (district) {
        setAvailableThanas(district.thana || []);
        setAvailableAreas(district.area || []);
        setFormData((prev: any) => ({
          ...prev,
          district: selectedDistrict,
          thana: district.thana?.[0] || "",
          area: district.area?.[0] || "",
        }));
      }
    }
  }, [selectedDistrict, districts]);

  // Update formData when arrays change
  useEffect(() => {
    if (formData) {
      setFormData((prev: any) => ({
        ...prev,
        selectedSubjects,
        selectedCategories,
        selectedClasses,
        medium: selectedMediums[0] || "", // Take first medium as primary
      }));
    }
  }, [selectedSubjects, selectedCategories, selectedClasses, selectedMediums]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !selectedRequest) return;

    setIsLoading(true);
    try {
      await onUpdate({
        id: selectedRequest.id,
        ...formData,
        selectedSubjects,
        selectedCategories,
        selectedClasses,
        medium: selectedMediums[0] || "",
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field: "min" | "max", value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev: any) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [field]: numValue,
      },
    }));
  };

  // Helper function to get category names
  const categoryNames = categories.map((cat) => cat.name);

  if (!selectedRequest || !formData) return null;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed  right-40 top-5  h-screen w-full md:w-3/4 bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Edit2 className="w-6 h-6" />
                Edit Tuition Request
              </h2>
              <p className="text-gray-600">
                Request ID: {selectedRequest.tutorRequestId}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Section title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Student Name
                  </label>
                  <input
                    value={selectedRequest.user.fullName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Student Gender
                  </label>
                  <select
                    value={formData.studentGender}
                    onChange={(e) =>
                      handleInputChange("studentGender", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
            </Section>

            {/* Location Information */}
            <Section title="Location Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    District *
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Thana
                  </label>
                  <select
                    value={formData.thana}
                    onChange={(e) => handleInputChange("thana", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {availableThanas.map((thana, index) => (
                      <option key={index} value={thana}>
                        {thana}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Area
                  </label>
                  <select
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {availableAreas.map((area, index) => (
                      <option key={index} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            {/* Academic Information */}
            <Section title="Academic Information">
              {/* Multiple Subjects */}
              <div className="space-y-2 mt-4">
                <MultipleSelect
                  label="Edit Subjects"
                  options={SUBJECT_OPTIONS}
                  selectedValues={selectedSubjects}
                  onAdd={(value) => {
                    if (!selectedSubjects.includes(value)) {
                      setSelectedSubjects([...selectedSubjects, value]);
                    }
                  }}
                  onRemove={(value) => {
                    setSelectedSubjects(
                      selectedSubjects.filter((subj) => subj !== value)
                    );
                  }}
                  placeholder="Select subjects..."
                />

                {/* Manual Add */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    placeholder="Manually add subject"
                    className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      const value = manualSubject.trim();
                      if (value && !selectedSubjects.includes(value)) {
                        setSelectedSubjects([...selectedSubjects, value]);
                        setManualSubject("");
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Classes */}
              <div className="space-y-2 mt-4">
                <MultipleSelect
                  label="Classes"
                  options={CLASS_LEVELS}
                  selectedValues={selectedClasses}
                  onAdd={(value) => {
                    if (!selectedClasses.includes(value)) {
                      setSelectedClasses([...selectedClasses, value]);
                    }
                  }}
                  onRemove={(value) => {
                    setSelectedClasses(
                      selectedClasses.filter((cls) => cls !== value)
                    );
                  }}
                  placeholder="Select classes..."
                />
              </div>

              {/* Categories */}
              <div className="space-y-2 mt-4">
                <MultipleSelect
                  label="Medium"
                  options={categoryNames}
                  selectedValues={selectedCategories}
                  onAdd={(value) => {
                    if (!selectedCategories.includes(value)) {
                      setSelectedCategories([...selectedCategories, value]);
                    }
                  }}
                  onRemove={(value) => {
                    setSelectedCategories(
                      selectedCategories.filter((cat) => cat !== value)
                    );
                  }}
                  placeholder="Select Medium..."
                />
              </div>

              {/* Tutoring Type */}
              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium text-gray-700">
                  Tutoring Type
                </label>
                <select
                  value={formData.tutoringType}
                  onChange={(e) =>
                    handleInputChange("tutoringType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Home Tutoring">Home Tutoring</option>
                  <option value="Online Tutoring">Online Tutoring</option>
                  <option value="Both">Both</option>
                </select>
              </div>
            </Section>

            {/* Tutoring Schedule */}
            <Section title="Tutoring Schedule">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tutoring Days (per week)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={formData.tutoringDays}
                    onChange={(e) =>
                      handleInputChange(
                        "tutoringDays",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tutoring Time
                  </label>
                  <input
                    type="time"
                    value={formData.tutoringTime}
                    onChange={(e) =>
                      handleInputChange("tutoringTime", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Duration per Session
                  </label>
                  <input
                    value={formData.tutoringDuration}
                    onChange={(e) =>
                      handleInputChange("tutoringDuration", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 2 hours"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.numberOfStudents}
                    onChange={(e) =>
                      handleInputChange(
                        "numberOfStudents",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </Section>

            {/* Salary Information */}
            <Section title="Salary Information">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Salary (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryRange.min}
                    onChange={(e) => handleSalaryChange("min", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Salary (৳)
                  </label>
                  <input
                    type="number"
                    value={formData.salaryRange.max}
                    onChange={(e) => handleSalaryChange("max", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="space-y-2 flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isSalaryNegotiable}
                      onChange={(e) =>
                        handleInputChange(
                          "isSalaryNegotiable",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Salary Negotiable
                    </label>
                  </div>
                </div>
              </div>
            </Section>

            {/* Preferences */}
            <Section title="Preferences">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Preferred Tutor Gender
                  </label>
                  <select
                    value={formData.tutorGenderPreference}
                    onChange={(e) =>
                      handleInputChange("tutorGenderPreference", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>
            </Section>

            {/* Additional Information */}
            <Section title="Additional Information">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Extra Information
                </label>
                <textarea
                  value={formData.extraInformation}
                  onChange={(e) =>
                    handleInputChange("extraInformation", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Admin Note
                </label>
                <textarea
                  value={formData.adminNote}
                  onChange={(e) =>
                    handleInputChange("adminNote", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={2}
                />
              </div>
            </Section>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Updating..." : "Update Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// AssignTutorModal Component
function AssignTutorModal({
  open,
  onOpenChange,
  selectedRequest,
  tutors,
  onAssign,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: TutorRequest | null;
  tutors: any[];
  onAssign: (data: any) => Promise<void>;
}) {
  const [formData, setFormData] = useState({
    tutorId: "",
    tutorName: "",
    studentName: "",
    assignmentNote: "",
    assignedSalary: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (selectedRequest) {
      setFormData({
        tutorId: "",
        tutorName: "",
        studentName: selectedRequest.user.fullName,
        assignmentNote: "",
        assignedSalary: "",
      });
    }
  }, [selectedRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !formData.tutorId) return;

    setIsLoading(true);
    try {
      await onAssign({
        tutorRequestId: selectedRequest.id,
        tutorId: formData.tutorId,
        studentName: formData.studentName,
        salary: formData.assignedSalary
          ? parseInt(formData.assignedSalary)
          : undefined,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Assignment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTutorSelect = (tutorId: string) => {
    const selectedTutor = tutors.find((t) => t.id === tutorId);
    if (selectedTutor) {
      setFormData((prev) => ({
        ...prev,
        tutorId,
        tutorName: selectedTutor.fullName || selectedTutor.name || "",
      }));
    }
  };

  if (!selectedRequest) return null;

  return (
    <div className={`fixed inset-0 z-50 ${open ? "block" : "hidden"}`}>
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed right-40 top-5  h-screen w-full md:w-3/4 bg-white shadow-xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Assign Tutor
              </h2>
              <p className="text-gray-600">
                Request ID: {selectedRequest.tutorRequestId}
              </p>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Request Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3 mb-6">
            <h3 className="font-semibold text-gray-900">Request Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">
                  {selectedRequest.user.fullName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{selectedRequest.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">
                  {selectedRequest.district}, {selectedRequest.area}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Days/Week:</span>
                <span className="font-medium">
                  {selectedRequest.tutoringDays}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">
                  {selectedRequest.tutoringTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">
                  {selectedRequest.phoneNumber}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Student Name *
                </label>
                <input
                  value={formData.studentName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      studentName: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Enter Tutor ID*
                </label>
                <input
                  value={formData.tutorId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tutorId: e.target.value,
                    }))
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {formData.tutorId && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Assigned Salary (৳)
                    </label>
                    <input
                      type="number"
                      value={formData.assignedSalary}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          assignedSalary: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Leave empty to use request range"
                    />
                    <p className="text-xs text-gray-500">
                      Original range: ৳{selectedRequest.salaryRange.min} - ৳
                      {selectedRequest.salaryRange.max}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.tutorId}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? "Assigning..." : "Assign Tutor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
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
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

function InfoField({
  label,
  value,
  icon,
  badge,
  type = "text",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  type?: "text" | "textarea";
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm text-gray-600">{label}</label>
      <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
        {type === "textarea" ? (
          <div className="whitespace-pre-wrap text-gray-900">{value}</div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-gray-900">{value}</span>
            </div>
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  // Calculate start and end items
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* Items info */}
      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
        Showing <span className="font-medium">{startItem}</span> to{" "}
        <span className="font-medium">{endItem}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Page controls */}
      <div className="flex items-center space-x-4">
        {/* Page size selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        {/* Pagination buttons */}
        <nav className="flex items-center space-x-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          {/* Page numbers */}
          {generatePageNumbers().map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-md text-sm font-medium ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronsRight className="w-5 h-5 text-gray-600" />
          </button>
        </nav>

        {/* Page info */}
        <div className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span> of{" "}
          <span className="font-medium">{totalPages}</span>
        </div>
      </div>
    </div>
  );
}

// Main Component
const TuitionRequestsSection = () => {
  const { data: districtData } = useGetAllDistrictsQuery(undefined);
  const { data: categoryData } = useGetAllCategoryQuery(undefined);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all data (without pagination from API)
  const { data: jobsData, refetch, isLoading } = useGetAllTutorRequestsQuery(undefined);

  const [updateTuitionRequestStatus] = useUpdateTutorRequestsStatusMutation();
  const [assignTutor] = useCreateassignTutorMutation();
  const [updateTuitionRequest] = useUpdateTutorRequestsMutation();

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<TutorRequest | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState("");

  const districts: District[] = districtData?.data || [];
  const categories: Category[] = categoryData?.data || [];
  const allJobs: TutorRequest[] = jobsData?.data || [];

  // Reset to first page when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter jobs based on search term
  const filteredJobs = useMemo(() => {
    if (!allJobs.length) return [];

    return allJobs.filter(
      (job) =>
        job.tutorRequestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allJobs, searchTerm]);

  // Apply client-side pagination
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, pageSize]);

  // Calculate pagination info
  const totalItems = filteredJobs.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Mock tutors data - you should replace this with actual API call
  const tutors = [
    {
      id: "1",
      fullName: "John Doe",
      subject: "Mathematics",
      specialization: "Math Expert",
    },
    {
      id: "2",
      fullName: "Jane Smith",
      subject: "Physics",
      specialization: "Physics Professor",
    },
    {
      id: "3",
      fullName: "Bob Johnson",
      subject: "Chemistry",
      specialization: "Chemistry Teacher",
    },
  ];

  // Update current time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle status update
  const handleStatusUpdate = async (jobId: string, status: string) => {
    try {
      await updateTuitionRequestStatus({
        id: jobId,
        data: { status },
      }).unwrap();
      toast.success(`Status updated to ${status}`);
      setActiveDropdown(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Handle assign tutor
  const handleAssignTutor = async (data: any) => {
    try {
      const result = await assignTutor({
        jobId: data.tutorRequestId,
        tutorId: data.tutorId,
        studentName: data.studentName,
        salary: data.salary,
      }).unwrap();

      await updateTuitionRequestStatus({
        id: data.tutorRequestId,
        data: { status: "Completed" },
      }).unwrap();
      if (result) {
        toast.success("Tutor assigned successfully");
      }
      refetch();
    } catch (error) {
      toast.error("Failed to assign tutor");
    }
  };

  // Handle update job
  const handleUpdateJob = async (data: any) => {
    const { id, ...updateData } = data;
    try {
      await updateTuitionRequest({
        id: data.id,
        data: updateData,
      }).unwrap();
      toast.success("Job updated successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to update job");
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <Toaster
        position="top-right"
        reverseOrder={false}
        containerStyle={{
          zIndex: 9999,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
            zIndex: 9999,
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10B981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#EF4444",
              secondary: "#fff",
            },
          },
        }}
      />

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tuition Requests</h1>
        <p className="text-gray-600 mt-1">
          Manage tuition requests from students
        </p>

        {/* Real-time updates bar */}
        <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 border border-blue-100 rounded">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-700 font-medium">
              Real-time updates enabled
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {currentTime || "Loading..."}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 my-6"></div>

      {/* Section Title */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          All Tuition Requests
        </h2>
        <p className="text-gray-600 mt-1">
          View and manage tuition requests from students
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, district, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-green-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Loading tuition requests...
                    </div>
                  </td>
                </tr>
              ) : paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm
                        ? "No tuition requests match your search."
                        : "No tuition requests found."}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {job.tutorRequestId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {job.user.fullName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {job.studentGender}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-gray-900">{job.district}</p>
                          <p className="text-gray-900">{job.thana}</p>
                          <p className="text-sm text-gray-500">{job.area}</p>
                          <p className="text-xs text-gray-400">
                            {job.detailedLocation}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{job.subject}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.tutoringType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : job.status === "Completed"
                            ? "bg-blue-100 text-blue-800"
                            : job.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === job.id ? null : job.id
                            )
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>

                        {activeDropdown === job.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveDropdown(null)}
                            />
                            <div className="absolute right-14 -mt-8 min-w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setViewDetailsOpen(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setUpdateModalOpen(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit2 className="w-4 h-4 mr-2" />
                                  Edit Request
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedJob(job);
                                    setAssignModalOpen(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Assign Tutor
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                  onClick={() =>
                                    handleStatusUpdate(job.id, "Active")
                                  }
                                  className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Active
                                </button>

                                <button
                                  onClick={() =>
                                    handleStatusUpdate(job.id, "Inactive")
                                  }
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Mark as Inactive
                                </button>

                                <button
                                  onClick={() =>
                                    handleStatusUpdate(job.id, "Completed")
                                  }
                                  className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Completed
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && paginatedJobs.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>

      {/* Modals */}
      <DetailsModal
        open={viewDetailsOpen}
        onOpenChange={setViewDetailsOpen}
        selectedRequest={selectedJob}
      />

      <EditModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        selectedRequest={selectedJob}
        districts={districts}
        categories={categories}
        onUpdate={handleUpdateJob}
      />

      <AssignTutorModal
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        selectedRequest={selectedJob}
        tutors={tutors}
        onAssign={handleAssignTutor}
      />
    </div>
  );
};

export default TuitionRequestsSection;