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
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  User,
  BookOpen,
  GraduationCap,
  School,
  AlertCircle,
} from "lucide-react";

interface DetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: any;
  updateNoticeHistory: any[];
  isLoadingUpdateHistory: boolean;
}

export function DetailsModal({
  open,
  onOpenChange,
  selectedRequest,
  updateNoticeHistory,
  isLoadingUpdateHistory,
}: DetailsModalProps) {
  const renderStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case "assign":
        return <Badge className="bg-orange-500">Assign</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (!selectedRequest) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tuition Request Details</DialogTitle>
          <DialogDescription>
            Detailed information about the tuition request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Section title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField
                label="Student Name"
                value={selectedRequest.studentName}
                icon={<User className="h-4 w-4" />}
              />
              <InfoField
                label="Phone Number"
                value={selectedRequest.phoneNumber}
                icon={<Phone className="h-4 w-4" />}
              />
              <InfoField
                label="Location"
                value={`${selectedRequest.district}, ${selectedRequest.area}`}
                icon={<MapPin className="h-4 w-4" />}
              />
              <InfoField
                label="Student Gender"
                value={selectedRequest.studentGender}
              />
            </div>
          </Section>

          {/* Academic Information */}
          <Section title="Academic Information">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField
                label="Medium"
                value={selectedRequest.medium}
                icon={<BookOpen className="h-4 w-4" />}
              />
              <InfoField
                label="Subject"
                value={selectedRequest.subject || "Not specified"}
                icon={<School className="h-4 w-4" />}
              />
              <InfoField
                label="Class Level"
                value={selectedRequest.studentClass || "Not specified"}
                icon={<GraduationCap className="h-4 w-4" />}
              />
              <InfoField
                label="Tutoring Type"
                value={selectedRequest.tutoringType}
              />
              <InfoField
                label="Preferred Tutor Gender"
                value={selectedRequest.tutorGenderPreference}
              />
            </div>
          </Section>

          {/* Tutoring Schedule */}
          <Section title="Tutoring Schedule">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoField
                label="Tutoring Days"
                value={`${selectedRequest.tutoringDays} days/week`}
                icon={<Calendar className="h-4 w-4" />}
              />
              <InfoField
                label="Tutoring Time"
                value={selectedRequest.tutoringTime}
                icon={<Clock className="h-4 w-4" />}
              />
              <InfoField
                label="Number of Students"
                value={selectedRequest.numberOfStudents.toString()}
              />
              <InfoField
                label="Duration per Session"
                value={selectedRequest.tutoringDuration}
              />
            </div>
          </Section>

          {/* Salary Information */}
          <Section title="Salary Information">
            <InfoField
              label="Salary Range"
              value={`৳${selectedRequest.salaryRange.min.toLocaleString()} - ৳${selectedRequest.salaryRange.max.toLocaleString()}`}
              icon={<DollarSign className="h-4 w-4" />}
              badge={
                selectedRequest.isSalaryNegotiable && (
                  <Badge className="ml-2 bg-red-500">Negotiable</Badge>
                )
              }
            />
          </Section>

          {/* Additional Information */}
          <Section title="Additional Information">
            <InfoField
              label="Extra Information"
              value={selectedRequest.extraInformation || "No additional information"}
              type="textarea"
            />
          </Section>

          {/* Admin Notes */}
          <Section title="Admin Notes">
            <InfoField
              label="Admin Notes"
              value={selectedRequest.adminNote || "No admin notes"}
              type="textarea"
            />
          </Section>

          {/* Status & Dates */}
          <Section title="Status & Dates">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  {renderStatusBadge(selectedRequest.status)}
                </div>
              </div>
              <div>
                <Label>Created At</Label>
                <div className="mt-1">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <Label>Last Updated</Label>
                <div className="mt-1">
                  {selectedRequest.updatedAt
                    ? new Date(selectedRequest.updatedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </Section>

          {/* Update Notice History */}
          {updateNoticeHistory.length > 0 && (
            <Section title="Update Notice History">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {updateNoticeHistory.map((notice, index) => (
                  <div
                    key={index}
                    className="p-3 bg-blue-50 rounded-md border border-blue-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {notice.updateNotice}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(notice.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
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
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="p-2 bg-gray-50 rounded-md min-h-[44px]">
        {type === "textarea" ? (
          <div className="whitespace-pre-wrap">{value}</div>
        ) : (
          <div className="flex items-center gap-2">
            {icon}
            <span>{value}</span>
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}