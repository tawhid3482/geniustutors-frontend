"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Star,
  User,
  Phone,
  Mail,
  School,
  DollarSign,
} from "lucide-react";

interface AssignTutorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: any;
  tutors: any[];
  filteredTutors: any[];
  selectedTutor: string;
  onSelectTutor: (tutorId: string) => void;
  assignmentNotes: string;
  onNotesChange: (notes: string) => void;
  onAssign: () => Promise<void>;
  isAssigning: boolean;
  isLoadingTutors: boolean;
}

export function AssignTutorModal({
  open,
  onOpenChange,
  selectedRequest,
  tutors,
  filteredTutors,
  selectedTutor,
  onSelectTutor,
  assignmentNotes,
  onNotesChange,
  onAssign,
  isAssigning,
  isLoadingTutors,
}: AssignTutorModalProps) {
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<any>(null);

  const handleTutorSelect = (tutorId: string) => {
    onSelectTutor(tutorId);
    const tutor = tutors.find((t) => t.id === tutorId);
    setSelectedTutorDetails(tutor);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Tutor to Request</DialogTitle>
          <DialogDescription>
            Select a tutor to assign to this tuition request
          </DialogDescription>
        </DialogHeader>

        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Request Details</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <DetailItem
                    label="Subject"
                    value={selectedRequest.subject || "Not specified"}
                  />
                  <DetailItem
                    label="Class"
                    value={selectedRequest.studentClass || "Not specified"}
                  />
                  <DetailItem
                    label="Location"
                    value={`${selectedRequest.area}, ${selectedRequest.district}`}
                  />
                  <DetailItem
                    label="Salary Range"
                    value={`৳${selectedRequest.salaryRange.min} - ৳${selectedRequest.salaryRange.max}`}
                  />
                  <DetailItem
                    label="Tutoring Type"
                    value={selectedRequest.tutoringType}
                  />
                </div>
              </div>

              {/* Assignment Notes */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Assignment Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="assignmentNotes">Assignment Notes</Label>
                  <Textarea
                    id="assignmentNotes"
                    value={assignmentNotes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Add notes about this assignment..."
                    rows={5}
                  />
                </div>
              </div>
            </div>

            {/* Available Tutors */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Available Tutors</h3>
                <div className="relative w-64">
                  <Input
                    placeholder="Search tutors..."
                    value={tutorSearchTerm}
                    onChange={(e) => setTutorSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              {isLoadingTutors ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredTutors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tutors found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto p-2">
                  {filteredTutors
                    .filter((tutor) =>
                      tutor.full_name
                        .toLowerCase()
                        .includes(tutorSearchTerm.toLowerCase())
                    )
                    .map((tutor) => (
                      <TutorCard
                        key={tutor.id}
                        tutor={tutor}
                        isSelected={selectedTutor === tutor.id}
                        onSelect={() => handleTutorSelect(tutor.id)}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Selected Tutor Details */}
            {selectedTutorDetails && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-3">
                  Selected Tutor Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <DetailItem
                    label="Name"
                    value={selectedTutorDetails.full_name}
                    icon={<User className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Location"
                    value={selectedTutorDetails.district}
                    icon={<MapPin className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Rating"
                    value={`${selectedTutorDetails.rating || 0} ⭐ (${
                      selectedTutorDetails.total_reviews || 0
                    } reviews)`}
                    icon={<Star className="h-4 w-4 text-yellow-500" />}
                  />
                  <DetailItem
                    label="Subjects"
                    value={selectedTutorDetails.subjects}
                    icon={<School className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Hourly Rate"
                    value={`৳${selectedTutorDetails.hourly_rate}`}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <DetailItem
                    label="Experience"
                    value={selectedTutorDetails.experience || "N/A"}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onAssign} disabled={isAssigning || !selectedTutor}>
            {isAssigning ? "Assigning..." : "Assign Tutor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
function TutorCard({
  tutor,
  isSelected,
  onSelect,
}: {
  tutor: any;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-green-500 bg-green-50"
          : "border-border hover:border-primary/50 hover:bg-muted/20"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {tutor.avatar_url ? (
              <img
                src={tutor.avatar_url}
                alt={tutor.full_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h4 className="font-medium">{tutor.full_name}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{tutor.district}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-yellow-500" />
                <span>{tutor.rating || 0}</span>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-green-600 font-medium">
                ৳{tutor.hourly_rate}/hour
              </span>
            </div>
          </div>
        </div>
        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <p className="flex items-center gap-2">
        {icon}
        <span>{value}</span>
      </p>
    </div>
  );
}