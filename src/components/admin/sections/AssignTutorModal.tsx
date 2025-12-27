// AssignTutorModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  UserPlus,
  User,
  BookOpen,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
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
  salaryRange: {
    min: number;
    max: number;
  };
  tutoringType: string;
  numberOfStudents: number;
  tutoringTime: string;
  tutoringDays: number;
  tutoringDuration: string;
  studentClass: string;
  tutorGenderPreference: string;
  medium: string;
  detailedLocation: string;
  user: {
    fullName: string;
  };
}

interface AssignTutorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: TutorRequest | null;
  tutors: any[]; // You'll need to fetch tutors list
  onAssign: (data: {
    tutorRequestId: string;
    tutorId: string;
    tutorName: string;
    studentName: string;
    assignmentNote?: string;
    assignedSalary?: number;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AssignTutorModal({
  open,
  onOpenChange,
  selectedRequest,
  tutors,
  onAssign,
  isLoading = false,
}: AssignTutorModalProps) {
  const [formData, setFormData] = useState({
    tutorId: "",
    tutorName: "",
    studentName: "",
    assignmentNote: "",
    assignedSalary: "",
  });

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
    if (!selectedRequest || !formData.tutorId || !formData.tutorName) return;
    
    await onAssign({
      tutorRequestId: selectedRequest.id,
      tutorId: formData.tutorId,
      tutorName: formData.tutorName,
      studentName: formData.studentName,
      assignmentNote: formData.assignmentNote,
      assignedSalary: formData.assignedSalary ? parseInt(formData.assignedSalary) : undefined,
    });
    
    onOpenChange(false);
  };

  const handleTutorSelect = (tutorId: string) => {
    const selectedTutor = tutors.find(t => t.id === tutorId);
    if (selectedTutor) {
      setFormData(prev => ({
        ...prev,
        tutorId,
        tutorName: selectedTutor.fullName || selectedTutor.name || "",
      }));
    }
  };

  if (!selectedRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Assign Tutor
          </DialogTitle>
          <DialogDescription>
            Assign a tutor for request: {selectedRequest.tutorRequestId}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-gray-900">Request Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">{selectedRequest.user.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Subject:</span>
                <span className="font-medium">{selectedRequest.subject}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{selectedRequest.district}, {selectedRequest.area}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Days/Week:</span>
                <span className="font-medium">{selectedRequest.tutoringDays}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{selectedRequest.tutoringTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Salary Range:</span>
                <span className="font-medium">৳{selectedRequest.salaryRange.min} - ৳{selectedRequest.salaryRange.max}</span>
              </div>
            </div>
          </div>

          {/* Assignment Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tutor">Select Tutor *</Label>
                <Select
                  value={formData.tutorId}
                  onValueChange={handleTutorSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a tutor" />
                  </SelectTrigger>
                  <SelectContent>
                    {tutors.map((tutor) => (
                      <SelectItem key={tutor.id} value={tutor.id}>
                        {tutor.fullName || tutor.name} - {tutor.subject || tutor.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.tutorId && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="tutorName">Tutor Name *</Label>
                    <Input
                      id="tutorName"
                      value={formData.tutorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, tutorName: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedSalary">Assigned Salary (৳)</Label>
                    <Input
                      id="assignedSalary"
                      type="number"
                      value={formData.assignedSalary}
                      onChange={(e) => setFormData(prev => ({ ...prev, assignedSalary: e.target.value }))}
                      placeholder="Leave empty to use request range"
                      min={selectedRequest.salaryRange.min}
                      max={selectedRequest.salaryRange.max}
                    />
                    <p className="text-xs text-gray-500">
                      Original range: ৳{selectedRequest.salaryRange.min} - ৳{selectedRequest.salaryRange.max}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignmentNote">Assignment Notes</Label>
              <Textarea
                id="assignmentNote"
                value={formData.assignmentNote}
                onChange={(e) => setFormData(prev => ({ ...prev, assignmentNote: e.target.value }))}
                placeholder="Any special instructions or notes for this assignment..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.tutorId || !formData.tutorName}
            >
              {isLoading ? "Assigning..." : "Assign Tutor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}