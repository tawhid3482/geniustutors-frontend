
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SUBJECT_OPTIONS, CLASS_LEVELS } from "@/data/mockData";
import mediumOptions from "@/data/mediumOptions.json";
import { X } from "lucide-react";

interface EditRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (data: any) => Promise<void>;
  isUpdating: boolean;
  selectedRequest: any;
  districtOptions: any[];
  DistrictData: any;
  isDistrictLoading: boolean;
}

export function EditRequestModal({
  open,
  onOpenChange,
  onUpdate,
  isUpdating,
  selectedRequest,
  districtOptions,
  DistrictData,
  isDistrictLoading,
}: EditRequestModalProps) {
  const [editFormData, setEditFormData] = useState<any>({});
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  // Initialize form data
  useEffect(() => {
    if (selectedRequest) {
      const initialData = {
        studentName: selectedRequest.studentName || "",
        studentGender: selectedRequest.studentGender || "",
        phoneNumber: selectedRequest.phoneNumber || "",
        district: selectedRequest.district || "",
        thana: selectedRequest.thana || "",
        area: selectedRequest.area || "",
        detailedLocation: selectedRequest.detailedLocation || "",
        medium: selectedRequest.medium || "",
        subject: selectedRequest.subject || "",
        studentClass: selectedRequest.studentClass || "",
        tutoringType: selectedRequest.tutoringType || "",
        numberOfStudents: selectedRequest.numberOfStudents || 1,
        tutoringDays: selectedRequest.tutoringDays || 1,
        tutoringTime: selectedRequest.tutoringTime || "",
        tutoringDuration: selectedRequest.tutoringDuration || "",
        tutorGenderPreference: selectedRequest.tutorGenderPreference || "",
        isSalaryNegotiable: selectedRequest.isSalaryNegotiable || false,
        salaryRange: selectedRequest.salaryRange || { min: 0, max: 0 },
        extraInformation: selectedRequest.extraInformation || "",
        adminNote: selectedRequest.adminNote || "",
        status: selectedRequest.status || "Active",
      };

      setEditFormData(initialData);
      setSelectedDistrict(selectedRequest.district || "");

      // Parse areas if they exist
      if (selectedRequest.area) {
        const areasArray = typeof selectedRequest.area === 'string'
          ? selectedRequest.area.split(',').map((a: string) => a.trim()).filter(Boolean)
          : selectedRequest.area;
        setSelectedAreas(Array.isArray(areasArray) ? areasArray : []);
      }

      // Load thanas and areas for the district
      if (DistrictData?.data && selectedRequest.district) {
        const selectedDistrictData = DistrictData.data.find(
          (d: any) => d.name === selectedRequest.district
        );
        if (selectedDistrictData) {
          setAvailableThanas(selectedDistrictData.thana || []);
          setAvailableAreas(selectedDistrictData.area || []);
        }
      }
    }
  }, [selectedRequest, DistrictData]);

  // District change handler
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    handleFormChange("district", district);
    handleFormChange("thana", "");
    handleFormChange("area", "");
    setAvailableThanas([]);
    setAvailableAreas([]);
    setSelectedAreas([]);

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
    handleFormChange("thana", thana);
    handleFormChange("area", "");
    setAvailableAreas([]);
    setSelectedAreas([]);

    if (DistrictData?.data && editFormData.district) {
      const selectedDistrictData = DistrictData.data.find(
        (d: any) => d.name === editFormData.district
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
    handleFormChange("area", newSelectedAreas.join(", "));
  };

  // Handle form field changes
  const handleFormChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle salary range change
  const handleSalaryRangeChange = (type: "min" | "max", value: number) => {
    setEditFormData((prev: any) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: value,
      },
    }));
  };

  // Handle status change
  const handleStatusChange = (status: string) => {
    handleFormChange("status", status);
  };

  // Handle update
  const handleUpdate = async () => {
    await onUpdate(editFormData);
  };

  if (!selectedRequest) return null;

  return (
    
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Tuition Request</DialogTitle>
          <DialogDescription>
            Update the details of the tuition request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information */}
          <Section title="Student Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Student Gender">
                <Select
                  value={editFormData.studentGender || ""}
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
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Phone Number">
                <Input
                  value={editFormData.phoneNumber || ""}
                  onChange={(e) =>
                    handleFormChange("phoneNumber", e.target.value)
                  }
                  placeholder="Enter phone number"
                />
              </FormField>
            </div>
          </Section>

          {/* Location Information */}
          <Section title="Location Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="District">
                {isDistrictLoading ? (
                  <Input value={editFormData.district || ""} disabled />
                ) : (
                  <Select
                    value={editFormData.district || ""}
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

              <FormField label="Thana/Upazila">
                {!editFormData.district ? (
                  <Input value={editFormData.thana || ""} disabled />
                ) : availableThanas.length > 0 ? (
                  <Select
                    value={editFormData.thana || ""}
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
                    value={editFormData.thana || ""}
                    onChange={(e) => handleFormChange("thana", e.target.value)}
                    placeholder="Enter thana/upazila"
                  />
                )}
              </FormField>

              <div className="md:col-span-3 space-y-2">
                <Label>Area</Label>
                {!editFormData.thana ? (
                  <Input value={editFormData.area || ""} disabled />
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
                    value={editFormData.area || ""}
                    onChange={(e) => handleFormChange("area", e.target.value)}
                    placeholder="Enter area"
                  />
                )}
              </div>

              <div className="md:col-span-3 space-y-2">
                <Label>Detailed Location</Label>
                <Input
                  value={editFormData.detailedLocation || ""}
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
              <FormField label="Medium">
                <Select
                  value={editFormData.medium || ""}
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

              <FormField label="Subject">
                <Select
                  value={editFormData.subject || ""}
                  onValueChange={(value) => handleFormChange("subject", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select subject</SelectItem>
                    {SUBJECT_OPTIONS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Class Level">
                <Select
                  value={editFormData.studentClass || ""}
                  onValueChange={(value) =>
                    handleFormChange("studentClass", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Select class level</SelectItem>
                    {CLASS_LEVELS.map((classLevel) => (
                      <SelectItem key={classLevel} value={classLevel}>
                        {classLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Tutoring Type">
                <Select
                  value={editFormData.tutoringType || ""}
                  onValueChange={(value) =>
                    handleFormChange("tutoringType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tutoring type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Home Tutoring">Home Tutoring</SelectItem>
                    <SelectItem value="Online Tutoring">Online Tutoring</SelectItem>
                    <SelectItem value="Both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </Section>

          {/* Tutoring Details */}
          <Section title="Tutoring Details">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Number of Students">
                <Input
                  type="number"
                  min="1"
                  value={editFormData.numberOfStudents || 1}
                  onChange={(e) =>
                    handleFormChange(
                      "numberOfStudents",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </FormField>

              <FormField label="Days per Week">
                <Input
                  type="number"
                  min="1"
                  max="7"
                  value={editFormData.tutoringDays || 1}
                  onChange={(e) =>
                    handleFormChange(
                      "tutoringDays",
                      parseInt(e.target.value) || 1
                    )
                  }
                />
              </FormField>

              <FormField label="Preferred Time">
                <Input
                  value={editFormData.tutoringTime || ""}
                  onChange={(e) =>
                    handleFormChange("tutoringTime", e.target.value)
                  }
                  placeholder="e.g., 4:00 PM - 6:00 PM"
                />
              </FormField>

              <FormField label="Duration per Session">
                <Select
                  value={editFormData.tutoringDuration || ""}
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
            </div>
          </Section>

          {/* Tutor Preferences */}
          <Section title="Tutor Preferences">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Preferred Tutor Gender">
                <Select
                  value={editFormData.tutorGenderPreference || ""}
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

              <FormField label="Minimum Salary (৳)">
                <Input
                  type="number"
                  min="0"
                  value={editFormData.salaryRange?.min || 0}
                  onChange={(e) =>
                    handleSalaryRangeChange("min", parseInt(e.target.value))
                  }
                />
              </FormField>

              <FormField label="Maximum Salary (৳)">
                <Input
                  type="number"
                  min="0"
                  value={editFormData.salaryRange?.max || 0}
                  onChange={(e) =>
                    handleSalaryRangeChange("max", parseInt(e.target.value))
                  }
                />
              </FormField>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editFormData.isSalaryNegotiable || false}
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
              <FormField label="Extra Information">
                <Textarea
                  value={editFormData.extraInformation || ""}
                  onChange={(e) =>
                    handleFormChange("extraInformation", e.target.value)
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </FormField>

              <FormField label="Admin Notes">
                <Textarea
                  value={editFormData.adminNote || ""}
                  onChange={(e) => handleFormChange("adminNote", e.target.value)}
                  placeholder="Internal admin notes..."
                  rows={2}
                />
              </FormField>
            </div>
          </Section>

          {/* Status Update */}
          <Section title="Status">
            <div className="flex gap-2">
              {(["Active", "Inactive", "Completed", "Assign"] as const).map(
                (status) => (
                  <Button
                    key={status}
                    variant={
                      editFormData.status === status ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleStatusChange(status)}
                  >
                    {status}
                  </Button>
                )
              )}
            </div>
          </Section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reuse helper components from CreateRequestModal
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