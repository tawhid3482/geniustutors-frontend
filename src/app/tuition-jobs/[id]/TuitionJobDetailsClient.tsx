"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Clock,
  Users,
  Share2,
  Map,
  AlertCircle,
  Building,
  GraduationCap,
  Compass,
  Copy,
  MessageCircle,
  Facebook,
  Twitter,
} from "lucide-react";
import { tuitionJobsService, TuitionJob } from "@/services/tuitionJobsService";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useApplyForTutorRequestsMutation, useGetSingleTutorRequestQuery } from "@/redux/features/tutorRequest/tutorRequestApi";

interface TuitionJobDetailsClientProps {
  jobId: string;
}

// Define the type for the API response data based on your Postman response
interface TutorRequestData {
  id: string;
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
  userId: string | null;
  user: any | null;
  assignments: any[];
  updateNoticeHistory: any[];
  studentName: string;
  locationDetails: string;
  salaryRangeMin: any;
  salaryRangeMax: any;
  tutorExperience: any;
}

export default function TuitionJobDetailsClient({
  jobId,
}: TuitionJobDetailsClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

  // Use the RTK Query hook with the jobId

  console.log(jobId)

  const {
    data: singleJobResponse,
    isLoading: rtkLoading,
    error: rtkError,
  } = useGetSingleTutorRequestQuery(jobId);

const [applyForTutorRequest, { isLoading: applyingForJob }] =useApplyForTutorRequestsMutation()

  // Rest of your existing state
  const [job, setJob] = useState<TuitionJob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [checkingApplication, setCheckingApplication] = useState(false);
  const [resettingApplication, setResettingApplication] = useState(false);

  // Transform RTK Query data to match your existing TuitionJob interface
  useEffect(() => {
    if (singleJobResponse?.data) {
      const apiData: TutorRequestData = singleJobResponse?.data;

      // Transform the API data to match your TuitionJob interface
      const transformedJob: TuitionJob = {
        id: apiData.id,
        subject:
          apiData.subject ||
          apiData.selectedSubjects?.[0] ||
          "Multiple Subjects",
        studentClass:
          apiData.studentClass ||
          apiData.selectedClasses?.[0] ||
          "Multiple Classes",
        district: apiData.district,
        area: apiData.area,
        postOffice: apiData.detailedLocation,
        studentGender: apiData.studentGender,
        preferredTeacherGender: apiData.tutorGenderPreference,
        daysPerWeek: apiData.tutoringDays,
        tutoringTime: apiData.tutoringTime,
        numberOfStudents: apiData.numberOfStudents,
        extraInformation: apiData.extraInformation,
        tutoringType: apiData.tutoringType,
        createdAt: apiData.createdAt,
        updatedAt: apiData.updatedAt,
        adminNote: null,
        studentName: apiData.studentName || "N/A",
        locationDetails: apiData.locationDetails || "",
        medium: apiData.medium || "Bangla",
        salaryRangeMin: apiData.salaryRangeMin || 0,
        salaryRangeMax: apiData.salaryRangeMax || 0, 
        tutorExperience: apiData.tutorExperience || "Not specified",
        status:apiData.status
      };

      setJob(transformedJob);
      setIsLoading(false);
    } else if (rtkError) {
      setError("Failed to fetch job details from server");
      setIsLoading(false);
    } else if (!rtkLoading && !singleJobResponse?.success) {
      setError("Job not found");
      setIsLoading(false);
    }
  }, [singleJobResponse, rtkLoading, rtkError]);

  const checkExistingApplication = useCallback(
    async (jobId: string) => {
      if (!user || user.role !== "TUTOR") return;

      setCheckingApplication(true);
      try {
        const response = await tuitionJobsService.checkTutorApplication(jobId);
        if (response.success && response.data) {
          setExistingApplication(response.data);
        } else {
          setExistingApplication(null);
        }
      } catch (error) {
        console.error("Error checking application:", error);
        setExistingApplication(null);
      } finally {
        setCheckingApplication(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (user && user.role === "TUTOR" && job) {
      checkExistingApplication(job.id);
    }
  }, [user, job, checkExistingApplication]);

  // Share functionality
  const getShareUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const getShareText = () => {
    if (!job) return "";
    return `Tutor Needed For ${job.subject} - ${job.district}, ${job.area}. Apply now!`;
  };

  const handleWhatsAppShare = () => {
    const url = getShareUrl();
    const text = getShareText();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
      text + " " + url
    )}`;
    window.open(whatsappUrl, "_blank");
    toast({
      title: "Shared on WhatsApp",
      description: "Job posting shared successfully on WhatsApp!",
    });
  };

  const handleFacebookShare = () => {
    const url = getShareUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, "_blank", "width=600,height=400");
    toast({
      title: "Shared on Facebook",
      description: "Job posting shared successfully on Facebook!",
    });
  };

  const handleTwitterShare = () => {
    const url = getShareUrl();
    const text = getShareText();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    toast({
      title: "Shared on Twitter",
      description: "Job posting shared successfully on Twitter!",
    });
  };

  const handleCopyLink = async () => {
    try {
      const url = getShareUrl();
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied",
        description: "Job posting link copied to clipboard!",
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = getShareUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast({
        title: "Link Copied",
        description: "Job posting link copied to clipboard!",
      });
    }
  };

  // Location and Directions functionality
  const getLocationQuery = () => {
    if (!job) return "";
    return `${job.district}, ${job.area}${
      job.postOffice ? `, ${job.postOffice}` : ""
    }, Bangladesh`;
  };

  const handleDirections = () => {
    const location = getLocationQuery();
    const encodedLocation = encodeURIComponent(location);

    // Try to get user's current location for better directions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}&travelmode=driving`;
          window.open(directionsUrl, "_blank");
        },
        () => {
          // Fallback if geolocation fails
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}&travelmode=driving`;
          window.open(directionsUrl, "_blank");
        }
      );
    } else {
      // Fallback for browsers that don't support geolocation
      const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedLocation}&travelmode=driving`;
      window.open(directionsUrl, "_blank");
    }
  };

  const handleLocation = () => {
    setShowMap(true);
  };

 const handleApplyForJob = async () => {
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "Please log in to apply for tuition jobs.",
      variant: "destructive",
    });
    return;
  }

  if (user.role !== "TUTOR") {
    toast({
      title: "Access Denied",
      description: "Only tutors can apply for tuition jobs.",
      variant: "destructive",
    });
    return;
  }

  try {
    const result = await applyForTutorRequest({ 
      jobId, 
      userId: user.id 
    }).unwrap();
    console.log("Apply for job result:", result);
    if (result) {
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      });
      checkExistingApplication(jobId);
    }
  } catch (error: any) {
    console.error("Error applying for job:", error);
    
    const errorMessage = error?.data?.message || error?.message || "Failed to submit application";
    
    toast({
      title: "Application Failed",
      description: errorMessage,
      variant: "destructive",
    });
  }
};

  const handleResetApplication = async () => {
    if (!user || user.role !== "TUTOR") return;

    setResettingApplication(true);
    try {
      const response = await tuitionJobsService.resetApplication(jobId);
      if (response.success) {
        toast({
          title: "Application Reset",
          description: "Your application has been reset successfully.",
        });
        setExistingApplication(null);
      } else {
        toast({
          title: "Reset Failed",
          description:
            response.message ||
            "Failed to reset application. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting application:", error);
      toast({
        title: "Reset Error",
        description: "An error occurred while resetting your application.",
        variant: "destructive",
      });
    } finally {
      setResettingApplication(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Job Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The tuition job you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Tutor Needed For {job.subject}
              </h1>
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                <span className="text-green-500 font-bold">Job ID: {job.id.slice(0, 8)}</span>
                <span className="text-green-500 font-bold"> 
                  Posted at: {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Location with Map Pin */}
              <div className="flex flex-col items-center mb-8">
                <MapPin className="h-8 w-8 text-red-500 mb-2" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {job.district.charAt(0).toUpperCase() + job.district.slice(1)}
                  , {job.area.charAt(0).toUpperCase() + job.area.slice(1)}
                </h2>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Job Details */}
              <div className="lg:col-span-2">
                {/* Job Specification Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Row 1 */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Building className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Medium</p>
                      <p className="font-semibold text-gray-800">
                        {job.tutoringType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Class</p>
                      <p className="font-semibold text-gray-800">
                        {job.studentClass}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Student Gender</p>
                      <p className="font-semibold text-gray-800">
                        {job.studentGender}
                      </p>
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Preferred Tutor</p>
                      <p className="font-semibold text-gray-800">
                        {job.preferredTeacherGender}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tutoring Days</p>
                      <p className="font-semibold text-gray-800">
                        {job.daysPerWeek} Days/Week
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tutoring Time</p>
                      <p className="font-semibold text-gray-800">
                        {job.tutoringTime || "Negotiable"}
                      </p>
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">No of Student</p>
                      <p className="font-semibold text-gray-800">
                        {job.numberOfStudents || 1}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Subject</p>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        {job.subject}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Other Requirements */}
                <div className="mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">
                        Other Requirements:
                      </p>
                      <p className="text-gray-700 leading-relaxed">
                        {job.extraInformation ||
                          "Highly experienced tutors are requested to apply. Loc: " +
                            job.district +
                            ", " +
                            job.area}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Admin Note Section */}
                {job.adminNote && (
                  <div className="mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-blue-900 mb-2">
                            Administrator Note
                          </h4>
                          <p className="text-sm text-blue-800 whitespace-pre-wrap leading-relaxed">
                            {job.adminNote}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Apply Button */}
                <div className="mb-8">
                  {user && user.role === "TUTOR" ? (
                    checkingApplication ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">
                          Checking...
                        </p>
                      </div>
                    ) : existingApplication &&
                      existingApplication.status !== "withdrawn" ? (
                      <div className="space-y-3">
                        <Badge
                          variant={
                            existingApplication.status === "accepted"
                              ? "default"
                              : "secondary"
                          }
                          className="bg-green-100 text-green-800"
                        >
                          {existingApplication.status}
                        </Badge>
                        <p className="text-sm text-gray-600">
                          Applied on{" "}
                          {new Date(
                            existingApplication.created_at
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleApplyForJob}
                        disabled={applying}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        {applying ? "Applying..." : "Apply"}
                      </Button>
                    )
                  ) : (
                    <LoginDialog defaultRole="TUTOR">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold">
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Login then apply this job
                      </Button>
                    </LoginDialog>
                  )}
                </div>
              </div>

              {/* Right Column - Actions and Sharing */}
              <div className="lg:col-span-1 space-y-6">
                {/* Navigation Buttons */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 transition-colors"
                    onClick={handleDirections}
                    title="Get directions to this location"
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Directions
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full bg-green-50 hover:bg-green-100 text-green-700 border-green-200 transition-colors"
                    onClick={handleLocation}
                    title="View location on map"
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Location
                  </Button>
                </div>

                {/* Share Post Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Share this post:
                  </h3>
                  <div className="flex space-x-3">
                    <Button
                      size="sm"
                      className="w-10 h-10 p-0 bg-green-500 hover:bg-green-600 transition-colors"
                      onClick={handleWhatsAppShare}
                      title="Share on WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      className="w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 transition-colors"
                      onClick={handleFacebookShare}
                      title="Share on Facebook"
                    >
                      <Facebook className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      className="w-10 h-10 p-0 bg-sky-500 hover:bg-sky-600 transition-colors"
                      onClick={handleTwitterShare}
                      title="Share on Twitter"
                    >
                      <Twitter className="h-4 w-4 text-white" />
                    </Button>
                    <Button
                      size="sm"
                      className="w-10 h-10 p-0 bg-red-500 hover:bg-red-600 transition-colors"
                      onClick={handleCopyLink}
                      title="Copy Link"
                    >
                      <Copy className="h-4 w-4 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Map Modal */}
        {showMap && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-[80vw] h-[70vh] max-w-5xl overflow-hidden relative">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMap(false)}
                className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full w-8 h-8 p-0 bg-white shadow-md"
              >
                ×
              </Button>

              {/* Google Maps Embed */}
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  getLocationQuery()
                )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
