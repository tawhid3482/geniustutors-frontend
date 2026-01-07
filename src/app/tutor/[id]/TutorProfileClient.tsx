"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.next";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MapPin,
  GraduationCap,
  Clock,
  MessageCircle,
  User,
  CheckCircle2,
  BookOpen,
  DollarSign,
  Users,
  Award,
  ShieldCheck,
  Mail,
  Phone,
  Send,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { BANGLADESH_DISTRICTS, BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts"; // Check your import
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGetSingleTutorHubQuery } from "@/redux/features/tutorHub/tutorHubApi";
import {
  useGetAllReviewByRoleQuery,
  useCreateReviewMutation,
  useCreateVideoReviewMutation,
} from "@/redux/features/review/reviewApi";
import { useCreateapplyForTutorMutation } from "@/redux/features/applyForTutor/applyForTutorApi";

interface TutorProfileClientProps {
  tutorId: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  testimonial: string;
  rating: number;
  tutor_id: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  videoUrl: string;
  thumbnail?: string;
  duration: string;
  testimonial: string;
  rating: number;
  tutor_id: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewResponse {
  data: {
    testimonial: Testimonial[];
    videoTestimonial: VideoTestimonial[];
  };
}

export default function TutorProfileClient({
  tutorId,
}: TutorProfileClientProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // RTK Query hooks
  const {
    data: tutorResponse,
    isLoading: tutorLoading,
    error: tutorError,
  } = useGetSingleTutorHubQuery(tutorId);




  const {
    data: reviewResponse,
    isLoading: reviewsLoading,
    error: reviewsError,
    refetch: refetchReviews,
  } = useGetAllReviewByRoleQuery({ id: tutorId });

  // Mutation hooks
  const [createReview, { isLoading: isCreatingReview }] =
    useCreateReviewMutation();
  const [createVideoReview, { isLoading: isCreatingVideoReview }] =
    useCreateVideoReviewMutation();
  const [createApplyForTutor, { isLoading: isSubmittingApplication }] =
    useCreateapplyForTutorMutation();

  // State for reviews
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [videoReviews, setVideoReviews] = useState<VideoTestimonial[]>([]);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);

  // State for review form
  const [reviewForm, setReviewForm] = useState({
    name: user?.fullName || "",
    role: user?.role || "Student",
    location: "Dhaka",
    avatar: user?.avatar || "https://via.placeholder.com/150",
    testimonial: "",
    rating: 5,
  });

  // State for video review form
  const [videoReviewForm, setVideoReviewForm] = useState({
    name: user?.fullName || "",
    role: user?.role || "Student",
    location: "Dhaka",
    avatar: user?.avatar || "https://via.placeholder.com/150",
    videoUrl: "",
    thumbnail: "",
    duration: "",
    testimonial: "",
    rating: 5,
  });

  // State for tuition job posting
  const [isSubmittingTuition, setIsSubmittingTuition] = useState(false);
  const [showTuitionSuccess, setShowTuitionSuccess] = useState(false);
  const [activeReviewTab, setActiveReviewTab] = useState<
    "written" | "video" | "write"
  >("written");

  // State for application form - Prisma schema অনুযায়ী
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: user?.fullName || "",
    phone: "",
    message: "",
    location: "",
    subject: "", // Single string, not array
    preferredTime: "",
    dayPerWeek: "",
    salary: "",
    class: "", // studentGrade
    gender: "", // studentGender
  });

  // Extract tutor data
  const tutor = tutorResponse?.data;

  // Parse educational qualifications
  const educationalQualifications = tutor?.educational_qualifications
    ? JSON.parse(tutor.educational_qualifications)
    : [];

  // Handle review data from API
  useEffect(() => {
    if (reviewResponse?.data) {
      const reviewData = reviewResponse.data as ReviewResponse["data"];
      setReviews(reviewData.testimonial || []);
      setVideoReviews(reviewData.videoTestimonial || []);
    }
  }, [reviewResponse]);

  // Check if user has already reviewed
  useEffect(() => {
    if (user && reviews.length > 0) {
      const userReview = reviews.find(
        (review) => review.name === user.fullName
      );
      setHasUserReviewed(!!userReview);
    }
  }, [user, reviews]);

  // Update review form when user changes
  useEffect(() => {
    if (user) {
      setReviewForm((prev) => ({
        ...prev,
        name: user.fullName || "",
        role: formatRole(user.role || "Student"),
        avatar: user.avatar || "https://via.placeholder.com/150",
      }));

      setVideoReviewForm((prev) => ({
        ...prev,
        name: user.fullName || "",
        role: formatRole(user.role || "Student"),
        avatar: user.avatar || "https://via.placeholder.com/150",
      }));

      // Update application form with user data
      setApplicationForm((prev) => ({
        ...prev,
        name: user.fullName || "",
      }));
    }
  }, [user]);

  // Format user role for display
  const formatRole = (role: string) => {
    if (!role) return "Student";
    const formatted = role.toLowerCase().replace(/_/g, " ");
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  // Handle written review submission
  const handleSubmitReview = async () => {
    if (!reviewForm.testimonial.trim()) {
      toast({
        title: "Error",
        description: "Please enter your testimonial",
        variant: "destructive",
      });
      return;
    }

    if (!reviewForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    try {
      await createReview({
        ...reviewForm,
        userId: user?.id || "",
        tutor_id: tutorId,
        isActive: true,
      }).unwrap();

      toast({
        title: "Success",
        description: "Your review has been submitted successfully",
      });

      setReviewForm({
        ...reviewForm,
        testimonial: "",
      });

      refetchReviews();
      setActiveReviewTab("written");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  // Handle video review submission
  const handleSubmitVideoReview = async () => {
    if (
      !videoReviewForm.videoUrl.trim() ||
      !videoReviewForm.testimonial.trim()
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createVideoReview({
        ...videoReviewForm,
        userId: user?.id || "",
        tutor_id: tutorId,
        isActive: true,
      }).unwrap();

      toast({
        title: "Success",
        description: "Your video testimonial has been submitted successfully",
      });

      setVideoReviewForm({
        ...videoReviewForm,
        videoUrl: "",
        testimonial: "",
        thumbnail: "",
        duration: "",
      });

      refetchReviews();
      setActiveReviewTab("video");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit video testimonial",
        variant: "destructive",
      });
    }
  };

  // Handle tuition job posting
  const handleTuitionSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to post a tuition job",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingTuition(true);
    try {
      // Simulate API call for posting tuition job
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description:
          "Tuition job posted successfully! The tutor will contact you soon.",
      });

      setShowTuitionSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setShowTuitionSuccess(false);
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post tuition job",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingTuition(false);
    }
  };

  // Handle open application form
  const handleOpenApplicationForm = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to apply for tutor",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "STUDENT_GUARDIAN") {
      toast({
        title: "Access Denied",
        description: "Only student guardians can apply for tutors",
        variant: "destructive",
      });
      return;
    }

    setShowApplicationForm(true);
  };

  // Handle application form submission - Prisma schema অনুযায়ী
  const handleSubmitApplication = async () => {
    if (!applicationForm.phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    if (!applicationForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!applicationForm.location.trim()) {
      toast({
        title: "Error",
        description: "Please select your location",
        variant: "destructive",
      });
      return;
    }

    try {
      await createApplyForTutor({
        tutor_id: tutorId,
        phone: applicationForm.phone,
        name: applicationForm.name,
        userId: user?.id || "",
        Status: "pending",
        // Prisma schema অনুযায়ী fields
        location: applicationForm.location,
        class: applicationForm.class,
        gender: applicationForm.gender,
        subject: applicationForm.subject,
        preferredTime: applicationForm.preferredTime,
        dayPerWeek: applicationForm.dayPerWeek,
        salary: applicationForm.salary,
        message: applicationForm.message,
      }).unwrap();

      toast({
        title: "Success",
        description: "Your application has been submitted successfully",
      });

      // Reset form
      setApplicationForm({
        name: user?.fullName || "",
        phone: "",
        message: "",
        location: "",
        subject: "",
        preferredTime: "",
        dayPerWeek: "",
        salary: "",
        class: "",
        gender: "",
      });

      setShowApplicationForm(false);

    } catch (error: any) {
      console.error("Application submission error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Get tutor's full name with fallback
  const getTutorFullName = () => {
    if (!tutor?.fullName) return "Tutor";
    return tutor.fullName
      .split(" ")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get tutor's subjects with fallback
  const getTutorSubjects = () => {
    if (!tutor?.subjects || !Array.isArray(tutor.subjects))
      return ["Not specified"];
    return tutor.subjects;
  };

  // Calculate average rating
  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  };

  // Available subjects for selection
  const availableSubjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "ICT",
    "Accounting",
    "Bangla",
    "General Science",
    "Higher Math",
    "Economics",
    "Business Studies"
  ];

  // Loading state
  if (tutorLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column skeleton */}
          <div className="lg:col-span-3">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          {/* Middle column skeleton */}
          <div className="lg:col-span-6">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
          {/* Right column skeleton */}
          <div className="lg:col-span-3">
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (tutorError || !tutor) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tutor Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The tutor profile you're looking for doesn't exist or has been
            removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Section - Personal Profile Card */}
          <div className="lg:col-span-3">
            <Card className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <CardContent className="p-6">
                {/* Tutor Image */}
                <div className="flex justify-center mb-6 relative">
                  <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage
                      src={tutor.avatar || "https://via.placeholder.com/150"}
                      alt={tutor.fullName}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-green-100 to-emerald-100 text-green-800">
                      {tutor.fullName
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2) || "TU"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Verified and Premium Badges */}
                  <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                    {tutor.verified && (
                      <div
                        className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                        title="Verified Tutor"
                      >
                        <ShieldCheck className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {tutor.genius && (
                      <div
                        className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                        title="Premium Tutor"
                      >
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    )}
                   
                  </div>
                </div>

                {/* Tutor Name */}
                <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                  {getTutorFullName()}
                </h1>

                {/* Rating */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    {renderStars(Math.round(calculateAverageRating()))}
                    <span className="text-sm font-medium text-gray-700">
                      {calculateAverageRating().toFixed(1)} ({reviews.length}{" "}
                      reviews)
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Tutor ID: {tutor.tutor_id || "N/A"}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="flex justify-center mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tutor.tutorStatus === "approved"
                        ? "bg-green-100 text-green-800"
                        : tutor.tutorStatus === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {tutor.tutorStatus?.charAt(0).toUpperCase() +
                      tutor.tutorStatus?.slice(1) || "Unknown"}
                  </span>
                </div>

                {/* Personal Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Education: </span>
                      <span className="font-semibold">
                        {tutor.education || tutor.qualification || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Institute: </span>
                      <span className="font-semibold">
                        {tutor.Institute_name || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Gender: </span>
                      <span className="font-semibold capitalize">
                        {tutor.gender || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Location: </span>
                      <span className="font-semibold">
                        {tutor.district?.charAt(0).toUpperCase() +
                          tutor.district?.slice(1) || "Not specified"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Hourly Rate: </span>
                      <span className="font-semibold">
                        ৳{tutor.hourly_rate || "Negotiable"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Experience: </span>
                      <span className="font-semibold">
                        {tutor.experience || 0} years
                      </span>
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span className="font-semibold">{tutor.phone || "N/A"}</span>
                    </div>
                  </div> */}

                  {/* <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="font-semibold">{tutor.email || "N/A"}</span>
                    </div>
                  </div> */}
                </div>

                {/* Member Since */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg -mx-6 -mb-6 border-t border-gray-100">
                  <p className="text-sm text-gray-600 text-center">
                    Member since {formatDate(tutor.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Section - Detailed Information */}
          <div className="lg:col-span-6">
            <Card className="bg-white rounded-lg shadow-lg border border-gray-200">
              <CardContent className="p-0">
                <Tabs defaultValue="personal-info" className="w-full">
                  <TabsList className="flex w-full rounded-t-lg border-b bg-gray-50">
                    <TabsTrigger
                      value="personal-info"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Personal Info
                    </TabsTrigger>
                    <TabsTrigger
                      value="education"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Education
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviews"
                      className="flex-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      Reviews ({reviews.length + videoReviews.length})
                    </TabsTrigger>
                  </TabsList>

                  {/* Personal Info Tab */}
                  <TabsContent value="personal-info" className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Personal Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{getTutorFullName()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-medium capitalize">
                              {tutor.gender || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Religion</p>
                            <p className="font-medium">{tutor.religion || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Blood Group</p>
                            <p className="font-medium">
                              {tutor.blood_group || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Nationality</p>
                            <p className="font-medium">{tutor.nationality || "N/A"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location Details
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-gray-500">District</p>
                            <p className="font-medium capitalize">
                              {tutor.district || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Present Location
                            </p>
                            <p className="font-medium">
                              {tutor.present_location || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Preferred Areas
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(tutor.preferred_areas || [])
                                ?.slice(0, 3)
                                .map((area: any, index: any) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="bg-green-50 text-green-700 hover:bg-green-50 text-xs"
                                  >
                                    {area}
                                  </Badge>
                                ))}
                              {(tutor.preferred_areas || [])?.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-gray-600 text-xs"
                                >
                                  +{(tutor.preferred_areas || []).length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tutoring Details */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Tutoring Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Subjects</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getTutorSubjects().map(
                              (subject: any, index: any) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-blue-50 text-blue-700 hover:bg-blue-50"
                                >
                                  {subject}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Availability</p>
                          <p className="font-medium">
                            {tutor.availability || "Flexible"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Preferred Time
                          </p>
                          <p className="font-medium">
                            {Array.isArray(tutor.preferred_time) 
                              ? tutor.preferred_time.join(", ") 
                              : tutor.preferred_time || "Flexible"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Tutoring Style
                          </p>
                          <p className="font-medium">
                            {Array.isArray(tutor.preferred_tutoring_style)
                              ? tutor.preferred_tutoring_style.join(", ")
                              : tutor.preferred_tutoring_style || "Standard"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Expected Salary
                          </p>
                          <p className="font-medium">
                            {tutor.expected_salary || "Negotiable"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Days per Week</p>
                          <p className="font-medium">
                            {tutor.days_per_week || "Flexible"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    {/* {tutor.bio && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-gray-900">Bio</h3>
                        <p className="text-gray-700">{tutor.bio}</p>
                      </div>
                    )} */}

                    {/* Additional Info */}
                    {tutor.other_skills && tutor.other_skills.length > 0 && (
                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="font-semibold text-gray-900">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                          {tutor.other_skills.map((skill: any, index: any) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="bg-gray-50"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Education Tab */}
                  <TabsContent value="education" className="p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Educational Qualifications
                      </h3>
                      {educationalQualifications.length > 0 ? (
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="font-medium">
                                  Exam
                                </TableHead>
                                <TableHead className="font-medium">
                                  Institute
                                </TableHead>
                                <TableHead className="font-medium">
                                  Board
                                </TableHead>
                                <TableHead className="font-medium">
                                  Group
                                </TableHead>
                                <TableHead className="font-medium">
                                  Year
                                </TableHead>
                                <TableHead className="font-medium">
                                  GPA/CGPA
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {educationalQualifications.map(
                                (edu: any, index: number) => (
                                  <TableRow
                                    key={index}
                                    className={
                                      index % 2 === 0
                                        ? "bg-white"
                                        : "bg-gray-50"
                                    }
                                  >
                                    <TableCell className="font-medium">
                                      {edu.examTitle || "N/A"}
                                    </TableCell>
                                    <TableCell>{edu.institute || "N/A"}</TableCell>
                                    <TableCell>{edu.board || "N/A"}</TableCell>
                                    <TableCell>{edu.group || "N/A"}</TableCell>
                                    <TableCell>{edu.year || "N/A"}</TableCell>
                                    <TableCell className="font-semibold">
                                      {edu.gpa || "N/A"}
                                    </TableCell>
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-8">
                          No educational qualifications provided
                        </p>
                      )}

                      {/* Additional Education Info */}
                      {(tutor.Institute_name ||
                        tutor.department_name ||
                        tutor.year) && (
                        <div className="pt-6 border-t">
                          <h4 className="font-semibold text-gray-900 mb-3">
                            Current Education
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tutor.Institute_name && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  Institute
                                </p>
                                <p className="font-medium">
                                  {tutor.Institute_name}
                                </p>
                              </div>
                            )}
                            {tutor.department_name && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  Department
                                </p>
                                <p className="font-medium">
                                  {tutor.department_name}
                                </p>
                              </div>
                            )}
                            {tutor.year && (
                              <div>
                                <p className="text-sm text-gray-500">
                                  Year/Semester
                                </p>
                                <p className="font-medium">{tutor.year}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Reviews Tab */}
                  <TabsContent value="reviews" className="p-6">
                    <div className="space-y-6">
                      {/* Review Stats */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              Review Summary
                            </h3>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                                <span className="ml-2 text-2xl font-bold text-gray-900">
                                  {calculateAverageRating().toFixed(1)}
                                </span>
                              </div>
                              <span className="text-gray-600">
                                out of 5 ({reviews.length + videoReviews.length}{" "}
                                total reviews)
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {reviews.length}
                              </div>
                              <div className="text-sm text-gray-600">
                                Written Reviews
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {videoReviews.length}
                              </div>
                              <div className="text-sm text-gray-600">
                                Video Reviews
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Review Tabs */}
                      <div>
                        <div className="flex space-x-4 border-b mb-6">
                          <button
                            onClick={() => setActiveReviewTab("written")}
                            className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                              activeReviewTab === "written"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Written Reviews
                          </button>
                          <button
                            onClick={() => setActiveReviewTab("video")}
                            className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                              activeReviewTab === "video"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            Video Reviews
                          </button>
                          <button
                            onClick={() => setActiveReviewTab("write")}
                            className={`pb-3 px-2 font-medium text-sm border-b-2 transition-colors ${
                              activeReviewTab === "write"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-600 hover:text-gray-900"
                            }`}
                          >
                            {hasUserReviewed ? "Update Review" : "Write Review"}
                          </button>
                        </div>

                        {/* Written Reviews Content */}
                        {activeReviewTab === "written" && (
                          <div className="space-y-4">
                            {reviewsLoading ? (
                              <div className="space-y-4">
                                {[1, 2].map((i) => (
                                  <Skeleton key={i} className="h-32 w-full" />
                                ))}
                              </div>
                            ) : reviews.length > 0 ? (
                              <div className="space-y-4">
                                {reviews.map((review) => (
                                  <Card
                                    key={review.id}
                                    className="border border-gray-200"
                                  >
                                    <CardContent className="p-4">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="h-10 w-10">
                                            <AvatarImage
                                              src={review.avatar}
                                              alt={review.name}
                                            />
                                            <AvatarFallback>
                                              {review.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h4 className="font-medium text-gray-900">
                                              {review.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                              {review.role} • {review.location}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {renderStars(review.rating)}
                                          <span className="text-sm text-gray-500">
                                            {formatDate(review.createdAt)}
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-gray-700">
                                        {review.testimonial}
                                      </p>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                  No written reviews yet
                                </h4>
                                <p className="text-gray-600">
                                  Be the first to share your experience with
                                  this tutor
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Video Reviews Content */}
                        {activeReviewTab === "video" && (
                          <div className="space-y-4">
                            {reviewsLoading ? (
                              <div className="space-y-4">
                                {[1, 2].map((i) => (
                                  <Skeleton key={i} className="h-48 w-full" />
                                ))}
                              </div>
                            ) : videoReviews.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {videoReviews.map((review) => (
                                  <Card
                                    key={review.id}
                                    className="border border-gray-200"
                                  >
                                    <CardContent className="p-4">
                                      <div className="mb-3">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-3">
                                          {review.thumbnail ? (
                                            <img
                                              src={review.thumbnail}
                                              alt={review.name}
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                              <div className="text-center">
                                                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">
                                                  Video testimonial
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h4 className="font-medium text-gray-900">
                                              {review.name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                              {review.role} • {review.duration}
                                            </p>
                                          </div>
                                          {renderStars(review.rating)}
                                        </div>
                                      </div>
                                      <p className="text-gray-700 text-sm line-clamp-2">
                                        {review.testimonial}
                                      </p>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-3"
                                        onClick={() =>
                                          window.open(
                                            review.videoUrl,
                                            "_blank"
                                          )
                                        }
                                      >
                                        Watch Video
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <MessageCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <h4 className="text-lg font-medium text-gray-900 mb-2">
                                  No video reviews yet
                                </h4>
                                <p className="text-gray-600">
                                  Be the first to share a video testimonial
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Write Review Content */}
                        {activeReviewTab === "write" && (
                          <div className="space-y-6">
                            {/* Written Review Form */}
                            <Card className="border border-gray-200">
                              <CardContent className="p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">
                                  Write a Review
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="rating">Rating</Label>
                                    <div className="flex items-center gap-2 mt-2">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                          key={star}
                                          type="button"
                                          onClick={() =>
                                            setReviewForm({
                                              ...reviewForm,
                                              rating: star,
                                            })
                                          }
                                          className="p-1"
                                        >
                                          <Star
                                            className={`h-6 w-6 ${
                                              star <= reviewForm.rating
                                                ? "text-yellow-400 fill-yellow-400"
                                                : "text-gray-300"
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="testimonial">
                                      Your Testimonial *
                                    </Label>
                                    <Textarea
                                      id="testimonial"
                                      placeholder="Share your experience with this tutor..."
                                      value={reviewForm.testimonial}
                                      onChange={(e) =>
                                        setReviewForm({
                                          ...reviewForm,
                                          testimonial: e.target.value,
                                        })
                                      }
                                      className="mt-2 min-h-[120px]"
                                    />
                                  </div>
                                  <Button
                                    onClick={handleSubmitReview}
                                    disabled={
                                      isCreatingReview ||
                                      !reviewForm.testimonial
                                    }
                                    className="w-full"
                                  >
                                    {isCreatingReview
                                      ? "Submitting..."
                                      : "Submit Review"}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Video Review Form */}
                            <Card className="border border-gray-200">
                              <CardContent className="p-6">
                                <h4 className="font-semibold text-gray-900 mb-4">
                                  Share Video Testimonial
                                </h4>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="thumbnailUrl">
                                      Thumbnail URL *
                                    </Label>
                                    <Input
                                      id="thumbnail"
                                      placeholder="https://imageurl.com/thumbnail.jpg"
                                      value={videoReviewForm.thumbnail}
                                      onChange={(e) =>
                                        setVideoReviewForm({
                                          ...videoReviewForm,
                                          thumbnail: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="videoUrl">
                                      Video URL *
                                    </Label>
                                    <Input
                                      id="videoUrl"
                                      placeholder="https://youtube.com/..."
                                      value={videoReviewForm.videoUrl}
                                      onChange={(e) =>
                                        setVideoReviewForm({
                                          ...videoReviewForm,
                                          videoUrl: e.target.value,
                                        })
                                      }
                                      className="mt-2"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="videoTestimonial">
                                      Video Description *
                                    </Label>
                                    <Textarea
                                      id="videoTestimonial"
                                      placeholder="Describe what you shared in the video..."
                                      value={videoReviewForm.testimonial}
                                      onChange={(e) =>
                                        setVideoReviewForm({
                                          ...videoReviewForm,
                                          testimonial: e.target.value,
                                        })
                                      }
                                      className="mt-2 min-h-[100px]"
                                    />
                                  </div>
                                  <Button
                                    onClick={handleSubmitVideoReview}
                                    disabled={
                                      isCreatingVideoReview ||
                                      !videoReviewForm.videoUrl ||
                                      !videoReviewForm.testimonial
                                    }
                                    className="w-full"
                                  >
                                    {isCreatingVideoReview
                                      ? "Submitting..."
                                      : "Submit Video Testimonial"}
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Section - Apply for Tutor / Tuition Job Posting */}
          <div className="lg:col-span-3">
            <Card className="bg-white rounded-lg shadow-lg border border-gray-200">
              <CardContent className="p-6">
                {/* Conditional rendering based on user role */}
                {user?.role === "STUDENT_GUARDIAN" ? (
                  // STUDENT_GUARDIAN এর জন্য Apply for Tutor সেকশন
                  showApplicationForm ? (
                    // Application Form - Prisma schema অনুযায়ী
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Apply for This Tutor
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setShowApplicationForm(false)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="name">Full Name *</Label>
                          <Input
                            id="name"
                            value={applicationForm.name}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                name: e.target.value,
                              })
                            }
                            placeholder="Enter your full name"
                            className="mt-1"
                          />
                        </div>

                        {/* <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={applicationForm.phone}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                phone: e.target.value,
                              })
                            }
                            placeholder="Enter your phone number"
                            className="mt-1"
                          />
                        </div> */}

                        <div>
                          <Label htmlFor="location">Location *</Label>
                          <Select
                            value={applicationForm.location}
                            onValueChange={(value) =>
                              setApplicationForm({
                                ...applicationForm,
                                location: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your location" />
                            </SelectTrigger>
                             <SelectContent>
                              {BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district:any) => (
                                <SelectItem key={district.name} value={district.name}>
                                  {district.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="class">Student Grade/Class *</Label>
                          <Select
                            value={applicationForm.class}
                            onValueChange={(value) =>
                              setApplicationForm({
                                ...applicationForm,
                                class: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Play Group">Play Group</SelectItem>
                              <SelectItem value="Nursery">Nursery</SelectItem>
                              <SelectItem value="KG">KG</SelectItem>
                              <SelectItem value="Class 1">Class 1</SelectItem>
                              <SelectItem value="Class 2">Class 2</SelectItem>
                              <SelectItem value="Class 3">Class 3</SelectItem>
                              <SelectItem value="Class 4">Class 4</SelectItem>
                              <SelectItem value="Class 5">Class 5</SelectItem>
                              <SelectItem value="Class 6">Class 6</SelectItem>
                              <SelectItem value="Class 7">Class 7</SelectItem>
                              <SelectItem value="Class 8">Class 8</SelectItem>
                              <SelectItem value="Class 9">Class 9</SelectItem>
                              <SelectItem value="Class 10">Class 10</SelectItem>
                              <SelectItem value="SSC">SSC</SelectItem>
                              <SelectItem value="HSC">HSC</SelectItem>
                              <SelectItem value="University">University</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="gender">Student Gender *</Label>
                          <Select
                            value={applicationForm.gender}
                            onValueChange={(value) =>
                              setApplicationForm({
                                ...applicationForm,
                                gender: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Male">Male</SelectItem>
                              <SelectItem value="Female">Female</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="subject">Required Subject *</Label>
                          <Select
                            value={applicationForm.subject}
                            onValueChange={(value) =>
                              setApplicationForm({
                                ...applicationForm,
                                subject: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select subject" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableSubjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="preferredTime">Preferred Time *</Label>
                          <Select
                            value={applicationForm.preferredTime}
                            onValueChange={(value) =>
                              setApplicationForm({
                                ...applicationForm,
                                preferredTime: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select time preference" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Morning (8AM-12PM)">Morning (8AM-12PM)</SelectItem>
                              <SelectItem value="Afternoon (2PM-6PM)">Afternoon (2PM-6PM)</SelectItem>
                              <SelectItem value="Evening (6PM-9PM)">Evening (6PM-9PM)</SelectItem>
                              <SelectItem value="Flexible">Flexible</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="dayPerWeek">Days per Week *</Label>
                          <Select
                            value={applicationForm.dayPerWeek}
                            onValueChange={(value) =>
                              setApplicationForm({
                                ...applicationForm,
                                dayPerWeek: value,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select days" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2 days/week">2 days/week</SelectItem>
                              <SelectItem value="3 days/week">3 days/week</SelectItem>
                              <SelectItem value="5 days/week">5 days/week</SelectItem>
                              <SelectItem value="6 days/week">6 days/week</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="salary">Salary Expectation *</Label>
                          <Input
                            id="salary"
                            value={applicationForm.salary}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                salary: e.target.value,
                              })
                            }
                            placeholder="e.g., 5000/month"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="message">Additional Message (Optional)</Label>
                          <Textarea
                            id="message"
                            value={applicationForm.message}
                            onChange={(e) =>
                              setApplicationForm({
                                ...applicationForm,
                                message: e.target.value,
                              })
                            }
                            placeholder="Any additional information or requirements..."
                            className="mt-1 min-h-[80px]"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={handleSubmitApplication}
                            disabled={
                              isSubmittingApplication || 
                              !applicationForm.name ||
                              !applicationForm.location ||
                              !applicationForm.class ||
                              !applicationForm.gender ||
                              !applicationForm.subject ||
                              !applicationForm.preferredTime ||
                              !applicationForm.dayPerWeek ||
                              !applicationForm.salary
                            }
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {isSubmittingApplication ? (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submitting...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Submit Application
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => setShowApplicationForm(false)}
                            variant="outline"
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Apply Button (শুরুতে)
                    <div className="flex flex-col items-center justify-center py-12">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                        Want this tutor for your child?
                      </h3>
                      <p className="text-gray-600 text-center mb-8">
                        Apply directly to this tutor and discuss your requirements
                      </p>
                      <Button
                        onClick={handleOpenApplicationForm}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-6 text-lg rounded-lg transition-all duration-300 hover:shadow-lg"
                        size="lg"
                      >
                        <Send className="h-5 w-5 mr-2" />
                        Apply for This Tutor
                      </Button>
                      <div className="mt-4 space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Direct communication with tutor</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Customize your requirements</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>No middleman or commission</span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  // অন্যান্য ইউজারদের জন্য Tuition Job Posting বাটন
                  showTuitionSuccess ? (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Tuition Job Posted Successfully!
                      </h3>
                      <p className="text-gray-600">
                        The tutor will contact you shortly.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                        Interested in this tutor?
                      </h3>
                      <p className="text-gray-600 text-center mb-8">
                        Post a tuition job and let the tutor contact you directly.
                      </p>
                      <Button
                        onClick={handleTuitionSubmit}
                        disabled={isSubmittingTuition}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-6 text-lg rounded-lg transition-all duration-300 hover:shadow-lg"
                        size="lg"
                      >
                        {isSubmittingTuition
                          ? "Posting Tuition Job..."
                          : "Post a Tuition Job"}
                      </Button>
                      <p className="text-sm text-gray-500 text-center mt-4">
                        One click to connect with this tutor
                      </p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}