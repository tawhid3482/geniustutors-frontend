"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, RefreshCw, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  tutorRequestService,
  type TutorRequest,
} from "@/services/tutorRequestService";
import {
  tutorApplicationService,
  type TutorApplication,
} from "@/services/tutorApplicationService";


interface StudentTutorRequestProps {
  postedRequests?: any[];
  isLoadingRequests?: boolean;
  refreshPostedRequests?: () => void;
}

export function StudentTutorRequest({
  postedRequests: propPostedRequests,
  isLoadingRequests: propIsLoadingRequests,
  refreshPostedRequests: propRefreshPostedRequests,
}: StudentTutorRequestProps) {
  const router = useRouter();
  // Internal state management for applications
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  // Use props if provided, otherwise use internal state
  const currentApplications = applications;
  const currentIsLoadingApplications = isLoadingApplications;
 
  // Filter applications by status
  const pendingApplications = currentApplications.filter(
    (app: TutorApplication) => app.status === "pending"
  );
  const acceptedApplications = currentApplications.filter(
    (app: TutorApplication) => app.status === "accepted"
  );
  const approvedApplications = currentApplications.filter(
    (app: TutorApplication) => app.status === "approved"
  );
  const rejectedApplications = currentApplications.filter(
    (app: TutorApplication) => app.status === "rejected"
  );

  // Fetch student applications
  const fetchApplications = async () => {
    setIsLoadingApplications(true);
    try {
      const response = await tutorApplicationService.getStudentApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description: "Failed to load your applications",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApplications(false);
    }
  };

  // Refresh function
  const refreshApplications = () => {
    fetchApplications();
  };

  // Load data on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  // Handle view tutor profile navigation
  const handleViewTutor = (tutorId: string) => {
    router.push(`/tutor/${tutorId}`);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "withdrawn":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              My Applications ({currentApplications.length})
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshApplications}
              disabled={currentIsLoadingApplications}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  currentIsLoadingApplications ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentIsLoadingApplications ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            </div>
          ) : currentApplications.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No applications found. Apply to tutors to get started!
              </p>
              <Button
                className="mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => (window.location.href = "/tutors")}
              >
                Browse Tutors
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {currentApplications.map((application) => (
                <div
                  key={application.id}
                  className="border rounded-lg p-6 space-y-4"
                >
                  {/* Application Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {application.applicationType === "tutor_request"
                          ? `Application to Tutor (ID: ${application.tutorId})`
                          : application.job?.title || "Job Application"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {application.applicationType === "tutor_request"
                          ? `Direct contact application`
                          : `${application.job?.subject} • ${application.job?.studentClass}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {application.applicationType === "tutor_request"
                          ? `Tutor Application`
                          : `${application.job?.location}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={getStatusBadgeColor(application.status)}
                      >
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Application Type:</span>
                      <span className="ml-2 capitalize">
                        {application.applicationType}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Tutor:</span>
                      <span className="ml-2">
                        Tutor ID: {application.tutorId}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Your Name:</span>
                      <span className="ml-2">{application.applicantName}</span>
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>
                      <span className="ml-2">{application.applicantPhone}</span>
                    </div>
                    {application.job && (
                      <>
                        <div>
                          <span className="font-medium">Subject:</span>
                          <span className="ml-2">
                            {application.job.subject}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Budget:</span>
                          <span className="ml-2">
                            ৳{application.job.salaryRangeMin} - ৳
                            {application.job.salaryRangeMax}
                          </span>
                        </div>
                      </>
                    )}
                    {application.contactedAt && (
                      <div>
                        <span className="font-medium">Contacted:</span>
                        <span className="ml-2">
                          {new Date(
                            application.contactedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {application.completedAt && (
                      <div>
                        <span className="font-medium">Completed:</span>
                        <span className="ml-2">
                          {new Date(
                            application.completedAt
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {application.message && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-sm">Your Message:</span>
                      <p className="text-sm text-gray-700 mt-1">
                        {application.message}
                      </p>
                    </div>
                  )}

                  {application.adminNotes && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <span className="font-medium text-sm">Admin Notes:</span>
                      <p className="text-sm text-gray-700 mt-1">
                        {application.adminNotes}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleViewTutor(application.tutorId)}
                    >
                      <Eye className="h-4 w-4" /> View Tutor Profile
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
