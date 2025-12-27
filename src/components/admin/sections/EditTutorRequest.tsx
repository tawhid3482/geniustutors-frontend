// EditModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Edit2,
  DollarSign,
  Calendar,
  Clock,
  Users,
  BookOpen,
  School,
} from "lucide-react";
import { useState, useEffect } from "react";

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
  adminNote?: string | null;
  user: {
    fullName: string;
  };
}

interface District {
  id: string;
  name: string;
  thana: string[];
  area: string[];
}

interface EditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: TutorRequest | null;
  districts: District[];
  categories: any[];
  onUpdate: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export function EditModal({
  open,
  onOpenChange,
  selectedRequest,
  districts,
  categories,
  onUpdate,
  isLoading = false,
}: EditModalProps) {
  const [formData, setFormData] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  useEffect(() => {
    if (selectedRequest) {
      setFormData({
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
        medium: selectedRequest.medium,
        detailedLocation: selectedRequest.detailedLocation,
        extraInformation: selectedRequest.extraInformation,
        adminNote: selectedRequest.adminNote || "",
      });
      
      setSelectedDistrict(selectedRequest.district);
      
      // Find selected district and set available thanas and areas
      const district = districts.find(d => d.name === selectedRequest.district);
      if (district) {
        setAvailableThanas(district.thana || []);
        setAvailableAreas(district.area || []);
      }
    }
  }, [selectedRequest, districts]);

  useEffect(() => {
    if (selectedDistrict) {
      const district = districts.find(d => d.name === selectedDistrict);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !selectedRequest) return;
    
    await onUpdate({
      id: selectedRequest.id,
      ...formData,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSalaryChange = (field: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData((prev: any) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [field]: numValue,
      },
    }));
  };

  if (!selectedRequest || !formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="w-5 h-5" />
            Edit Tuition Request
          </DialogTitle>
          <DialogDescription>
            Edit details for request: {selectedRequest.tutorRequestId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student Name</Label>
                <Input value={selectedRequest.user.fullName} disabled />
              </div>
              <div className="space-y-2">
                <Label>Phone Number *</Label>
                <Input
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Student Gender</Label>
                <Select
                  value={formData.studentGender}
                  onValueChange={(value) => handleInputChange('studentGender', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Location Information */}
          <Section title="Location Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>District *</Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Thana</Label>
                <Select
                  value={formData.thana}
                  onValueChange={(value) => handleInputChange('thana', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableThanas.map((thana, index) => (
                      <SelectItem key={index} value={thana}>
                        {thana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => handleInputChange('area', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAreas.map((area, index) => (
                      <SelectItem key={index} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Detailed Location</Label>
              <Textarea
                value={formData.detailedLocation}
                onChange={(e) => handleInputChange('detailedLocation', e.target.value)}
                placeholder="House number, street, landmarks..."
              />
            </div>
          </Section>

          {/* Academic Information */}
          <Section title="Academic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject *</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Medium</Label>
                <Input
                  value={formData.medium}
                  onChange={(e) => handleInputChange('medium', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Student Class</Label>
                <Input
                  value={formData.studentClass}
                  onChange={(e) => handleInputChange('studentClass', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tutoring Type</Label>
                <Select
                  value={formData.tutoringType}
                  onValueChange={(value) => handleInputChange('tutoringType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home Tutoring">Home Tutoring</SelectItem>
                    <SelectItem value="Online Tutoring">Online Tutoring</SelectItem>
                    <SelectItem value="Group Tutoring">Group Tutoring</SelectItem>
                    <SelectItem value="Center Based">Center Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Selected Categories</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.selectedCategories.includes(category.name)}
                      onCheckedChange={(checked) => {
                        const newCategories = checked
                          ? [...formData.selectedCategories, category.name]
                          : formData.selectedCategories.filter((c: string) => c !== category.name);
                        handleInputChange('selectedCategories', newCategories);
                      }}
                    />
                    <Label className="text-sm">{category.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          {/* Tutoring Schedule */}
          <Section title="Tutoring Schedule">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Tutoring Days (per week)</Label>
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={formData.tutoringDays}
                  onChange={(e) => handleInputChange('tutoringDays', parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tutoring Time</Label>
                <Input
                  type="time"
                  value={formData.tutoringTime}
                  onChange={(e) => handleInputChange('tutoringTime', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration per Session</Label>
                <Input
                  value={formData.tutoringDuration}
                  onChange={(e) => handleInputChange('tutoringDuration', e.target.value)}
                  placeholder="e.g., 2 hours"
                />
              </div>
              <div className="space-y-2">
                <Label>Number of Students</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.numberOfStudents}
                  onChange={(e) => handleInputChange('numberOfStudents', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </Section>

          {/* Salary Information */}
          <Section title="Salary Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Minimum Salary (৳)</Label>
                <Input
                  type="number"
                  value={formData.salaryRange.min}
                  onChange={(e) => handleSalaryChange('min', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Salary (৳)</Label>
                <Input
                  type="number"
                  value={formData.salaryRange.max}
                  onChange={(e) => handleSalaryChange('max', e.target.value)}
                />
              </div>
              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.isSalaryNegotiable}
                    onCheckedChange={(checked) => 
                      handleInputChange('isSalaryNegotiable', checked)
                    }
                  />
                  <Label>Salary Negotiable</Label>
                </div>
              </div>
            </div>
          </Section>

          {/* Preferences */}
          <Section title="Preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Tutor Gender</Label>
                <Select
                  value={formData.tutorGenderPreference}
                  onValueChange={(value) => handleInputChange('tutorGenderPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Selected Classes</Label>
                <Input
                  value={formData.selectedClasses.join(", ")}
                  onChange={(e) => handleInputChange('selectedClasses', e.target.value.split(", "))}
                  placeholder="Separate with commas"
                />
              </div>
            </div>
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information">
            <div className="space-y-2">
              <Label>Extra Information</Label>
              <Textarea
                value={formData.extraInformation}
                onChange={(e) => handleInputChange('extraInformation', e.target.value)}
                placeholder="Any additional requirements or information..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Note</Label>
              <Textarea
                value={formData.adminNote}
                onChange={(e) => handleInputChange('adminNote', e.target.value)}
                placeholder="Add admin notes here..."
                rows={2}
              />
            </div>
          </Section>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Request"}
            </Button>
          </DialogFooter>
        </form>
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
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {children}
    </div>
  );
}