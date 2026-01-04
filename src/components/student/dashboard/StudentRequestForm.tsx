"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  RefreshCw,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  DollarSign,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  AlertCircle,
  Users,
  FileText,
  MessageSquare,
  MapPin as MapPinIcon,
  Clock,
  Users as UsersIcon,
  Share2,
  ChevronDown,
  ChevronUp,
  User as UserIcon,
  Hash,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext.next";
import { useGetMyTutorRequestsQuery } from "@/redux/features/tutorRequest/tutorRequestApi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUpdateStatusApplicationMutation } from "@/redux/features/application/applicationApi";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StudentRequestFormProps {
  onRequestCreated?: () => void;
}

interface TutorRequestData {
  id: string;
  tutorRequestId: string;
  phoneNumber: string;
  studentGender: string;
  district: string;
  area: string;
  detailedLocation: string;
  selectedCategories: string[];
  selectedSubjects: string[];
  selectedClasses: string[];
  tutorGenderPreference: string;
  isSalaryNegotiable: boolean;
  salaryRange: {
    min: number;
    max: number;
  };
  extraInformation: string;
  subject: string | null;
  studentClass: string | null;
  medium: string;
  numberOfStudents: number;
  tutoringDays: number;
  tutoringTime: string;
  tutoringDuration: string;
  tutoringType: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  applications: Array<{
    id: string;
    tutorRequestId: string;
    tutorId: string;
    status: string;
    message: string | null;
    appliedAt: string;
    updatedAt: string;
    tutor: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      alternative_number: string | null;
      Institute_name: string | null;
      department_name: string | null;
      year: string | null;
      preferred_areas: string[];
      religion: string | null;
      nationality: string | null;
      background: string[];
      avatar: string;
      qualification: string | null;
      district: string | null;
      premium: boolean;
      gender: string;
      role: string;
      tutor_id: number;
      studentId: number;
      rating: number | null;
      postOffice: string | null;
      hourly_rate: number;
      subjects: string[];
      availability: string | null;
      education: string | null;
      total_reviews: number;
      experience: number;
      location: string | null;
      bio: string | null;
      createdAt: string;
      verified: boolean;
      genius: boolean;
      tutorStatus: string;
      status: string;
      updatedAt: string;
    };
  }>;
  assignments: any[];
  updateNoticeHistory: any[];
}

export function StudentRequestForm({
  onRequestCreated,
}: StudentRequestFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: myTutorRequestsResponse,
    isLoading,
    error,
    refetch,
  } = useGetMyTutorRequestsQuery(user?.id || "", {
    skip: !user,
  });

  const [updateApplicationStatus, { isLoading: isUpdatingStatus }] =
    useUpdateStatusApplicationMutation();

  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(
    null
  );

  const tutorRequests = myTutorRequestsResponse?.data || [];
  const hasData = tutorRequests.length > 0;

  const handleViewTutor = (tutorId: string) => {
    router.push(`/tutor/${tutorId}`);
  };

  const handleViewRequest = (requestId: string) => {
    router.push(`/tuition-jobs/${requestId}`);
  };

  const refreshApplications = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Your tutor requests have been refreshed",
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "UNDER_REVIEW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ACCEPTED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return <ClockIcon className="h-4 w-4" />;
      case "UNDER_REVIEW":
        return <AlertCircle className="h-4 w-4" />;
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Handle status update
  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    setUpdatingAppId(applicationId);
    try {
      const result = await updateApplicationStatus({
        id: applicationId,
        status: newStatus,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Application status updated to ${newStatus}`,
        });
        refetch();
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description:
          error?.data?.message || "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setUpdatingAppId(null);
      setShowStatusDialog(false);
      setSelectedApplication(null);
      setSelectedStatus("");
    }
  };

  // Open status dialog
  const openStatusDialog = (application: any, status: string) => {
    setSelectedApplication(application);
    setSelectedStatus(status);
    setShowStatusDialog(true);
  };

  const getStatusOptions = () => {
    return [
      {
        value: "PENDING",
        label: "Pending",
        icon: <ClockIcon className="h-4 w-4" />,
      },
      {
        value: "UNDER_REVIEW",
        label: "Under Review",
        icon: <AlertCircle className="h-4 w-4" />,
      },
      {
        value: "ACCEPTED",
        label: "Accepted",
        icon: <CheckCircle className="h-4 w-4" />,
      },
      {
        value: "REJECTED",
        label: "Rejected",
        icon: <XCircle className="h-4 w-4" />,
      },
    ];
  };

  const getTotalApplications = () => {
    return tutorRequests.reduce(
      (total: number, request: TutorRequestData) =>
        total + (request.applications?.length || 0),
      0
    );
  };

  const toggleApplicationDetails = (applicationId: string) => {
    if (expandedApplication === applicationId) {
      setExpandedApplication(null);
    } else {
      setExpandedApplication(applicationId);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Error Loading Tutor Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Failed to load your tutor requests. Please try again.
            </p>
            <Button onClick={refreshApplications} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                My Tutor Requests
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push("/tutor-request")}
              >
                Create New Request
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Tutor Requests Found
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't created any tutor requests yet. Create your first
              request to find the perfect tutor.
            </p>
            <Button
              className="bg-green-600 hover:bg-green-700 px-8"
              onClick={() => router.push("/tutor-request")}
            >
              Create Your First Request
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalApplications = getTotalApplications();

  return (
    <div className="w-full space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                My Tutor Requests
              </CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                {tutorRequests.length} request
                {tutorRequests.length !== 1 ? "s" : ""} • {totalApplications}{" "}
                application{totalApplications !== 1 ? "s" : ""} received
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshApplications}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => router.push("/tutor-request")}
              >
                Create New Request
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tutor Requests List */}
      <div className="space-y-6">
        {tutorRequests.map((request: TutorRequestData) => {
          const hasApplications =
            request.applications && request.applications.length > 0;

          return (
            <Card key={request.id} className="overflow-hidden">
              {/* Request Header */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 border-b">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-white">
                        Request #{request.tutorRequestId}
                      </Badge>
                      <Badge
                        className={
                          request.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {request.subject ||
                        request.selectedSubjects?.[0] ||
                        "Multiple Subjects"}{" "}
                      Tutoring Needed
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3 w-3" />
                        {request.studentClass ||
                          request.selectedClasses?.[0] ||
                          "Not specified"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {request.district}, {request.area}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <UsersIcon className="h-3 w-3" />
                        {request.numberOfStudents} student
                        {request.numberOfStudents !== 1 ? "s" : ""}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {request.tutoringDays} days/week
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewRequest(request.id)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Salary Range</div>
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />৳
                      {request.salaryRange.min} - ৳{request.salaryRange.max}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Tutoring Time</div>
                    <div className="font-semibold text-gray-800 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {request.tutoringTime || "Flexible"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Tutoring Type</div>
                    <div className="font-semibold text-gray-800">
                      {request.tutoringType}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="font-semibold text-gray-800">
                      {formatDate(request.createdAt)}
                    </div>
                  </div>
                </div>

                {request.extraInformation && (
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Additional Information:
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                      {request.extraInformation}
                    </div>
                  </div>
                )}

                {/* Applications Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-800">
                        Applications ({request.applications?.length || 0})
                      </h4>
                    </div>
                    {!hasApplications && (
                      <Badge variant="outline" className="bg-gray-50">
                        Waiting for applications
                      </Badge>
                    )}
                  </div>

                  {hasApplications ? (
                    <div className="space-y-3">
                      {request.applications.map((application: any) => (
                        <div
                          key={application.id}
                          className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          {/* Application Header with Expand Button */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border">
                                <AvatarImage
                                  src={application.tutor.avatar}
                                  alt={application.tutor.fullName}
                                />
                                <AvatarFallback>
                                  {application.tutor.fullName?.charAt(0) || "T"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-semibold text-gray-800">
                                    {application.tutor.fullName}
                                  </h5>
                                  {application.tutor.verified && (
                                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(application.appliedAt)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getStatusBadgeColor(
                                  application.status
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(application.status)}
                                  <span className="text-xs">
                                    {application.status}
                                  </span>
                                </div>
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  toggleApplicationDetails(application.id)
                                }
                                className="h-8 w-8 p-0"
                              >
                                {expandedApplication === application.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Dropdown Content - Tutor Basic Info */}
                          {expandedApplication === application.id && (
                            <div className="mt-3 space-y-4 border-t pt-4">
                              {/* Basic Tutor Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <UserIcon className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <div className="text-xs text-gray-500">
                                        Full Name
                                      </div>
                                      <div className="font-medium">
                                        {application.tutor.fullName}
                                      </div>
                                    </div>
                                  </div>
                             
                                </div>
                                <div className="space-y-3">
                              
                                  <div className="flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-gray-500" />
                                    <div>
                                      <div className="text-xs text-gray-500">
                                        Tutor ID
                                      </div>
                                      <div className="font-medium">
                                        {application.tutor.tutor_id}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Additional Tutor Info */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-500">
                                    Gender
                                  </div>
                                  <div className="font-medium">
                                    {application.tutor.gender}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-xs text-gray-500">
                                    Experience
                                  </div>
                                  <div className="font-medium">
                                    {application.tutor.experience || 0} years
                                  </div>
                                </div>
                                {application.tutor.district && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">
                                      District
                                    </div>
                                    <div className="font-medium">
                                      {application.tutor.district}
                                    </div>
                                  </div>
                                )}
                                {application.tutor.education && (
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">
                                      Education
                                    </div>
                                    <div className="font-medium">
                                      {application.tutor.education}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Application Message */}
                              {application.message && (
                                <div className="mt-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Application Message:
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
                                    {application.message}
                                  </div>
                                </div>
                              )}

                              {/* Action Buttons */}
                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleViewTutor(
                                        application.tutor.tutor_id
                                      )
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    View Full Profile
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>
                                        Update Status
                                      </DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      {getStatusOptions().map((option) => (
                                        <DropdownMenuItem
                                          key={option.value}
                                          onClick={() =>
                                            openStatusDialog(
                                              application,
                                              option.value
                                            )
                                          }
                                          disabled={
                                            application.status ===
                                              option.value ||
                                            updatingAppId === application.id
                                          }
                                          className="flex items-center gap-2"
                                        >
                                          {option.icon}
                                          <span>{option.label}</span>
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Applied:{" "}
                                  {formatDateTime(application.appliedAt)}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Collapsed View - Quick Info */}
                          {expandedApplication !== application.id && (
                            <div className="mt-2">
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-gray-400" />
                                  <span>{application.tutor.gender}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3 text-gray-400" />
                                  <span>
                                    {application.tutor.experience || 0} yrs exp
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3 text-gray-400" />
                                  <span>ID: {application.tutor.tutor_id}</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    handleViewTutor(application.tutor.tutor_id)
                                  }
                                  className="text-xs h-7"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Profile
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    toggleApplicationDetails(application.id)
                                  }
                                  className="text-xs h-7"
                                >
                                  Show Details
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-gray-50">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h5 className="font-medium text-gray-700 mb-2">
                        No Applications Yet
                      </h5>
                      <p className="text-sm text-gray-600 max-w-md mx-auto mb-4">
                        This request is active and waiting for tutors to apply.
                        Share your request to attract more tutors.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewRequest(request.id)}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share This Request
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Status Update Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Application Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the status of{" "}
              <span className="font-semibold">
                {selectedApplication?.tutor?.fullName}'s
              </span>{" "}
              application to{" "}
              <span className="font-semibold">
                {selectedStatus.replace("_", " ")}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                handleStatusUpdate(selectedApplication?.id, selectedStatus)
              }
              disabled={
                isUpdatingStatus || updatingAppId === selectedApplication?.id
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isUpdatingStatus || updatingAppId === selectedApplication?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
