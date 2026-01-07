"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Toggle } from "@/components/ui/toggle";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { toast } from "@/components/ui/use-toast";
import { userService } from "@/services/userService";
import { profileService } from "@/services/profileService";
import { api, API_ENDPOINTS } from "@/config/api";
import {
  BookOpen,
  Calendar,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Filter,
  Heart,
  Home,
  LogOut,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Star,
  User,
  Users,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  CheckCircle,
  Check,
} from "lucide-react";

// Import the modular components
import { StudentOverview } from "./StudentOverview";
import { StudentRequestForm } from "./StudentRequestForm";
import { StudentPostedJobs } from "./StudentPostedJobs";
import { StudentSearch } from "./StudentSearch";
import { StudentProfile } from "./StudentProfile";
import { StudentCourses } from "./StudentCourses";
import { JoinCommunity } from "./JoinCommunity";
import { DemoClassesSection } from "../DemoClassesSection";
import GuardianNotesSection from "../GuardianNotesSection";

// Import services
import { taxonomyService } from "@/services/taxonomyService";
import {
  getLearningDashboard,
  getMyEnrollments,
  type LearningDashboard,
  type CourseEnrollment,
} from "@/services/courseService";
import {
  tutorRequestService,
  type TutorRequest,
} from "@/services/tutorRequestService";
import tutorService, { Tutor } from "@/services/tutorService";

// Import types
import { FilterGender } from "@/types/student";

// Import context
import { useAuth } from "@/contexts/AuthContext.next";

// Import additional components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts";

// Import chat components
import { FloatingStudentChat } from "../components/FloatingStudentChat";
import { useStudentChat } from "@/hooks/useStudentChat";
import { useGetAllTutorRequestsQuery } from "@/redux/features/tutorRequest/tutorRequestApi";
import { useGetAllTutorsQuery } from "@/redux/features/tutorHub/tutorHubApi";
import StudentReviews from "./StudentReviews";
import StudentSettings from "./StudentSettings";
import ApprovalLetterSection from "../ApprovalLetterSection";
import { FloatingTutorChat } from "@/components/tutor/components/FloatingTutorChat";

export function StudentDashboardMain() {
  const { user, signOut, updateUserProfile } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Initialize chat functionality
  const {
    chatContacts,
    chatMessages,
    selectedChat,
    newMessage,
    setSelectedChat,
    setNewMessage,
    sendMessage,
  } = useStudentChat();

  // Dashboard state
  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  // Posted Jobs State
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Tutor Search State
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedPostOffice, setSelectedPostOffice] = useState<string>("all");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedEducation, setSelectedEducation] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] =
    useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [geniusTutorOnly, setGeniusTutorOnly] = useState(false);
  const [verifiedTutorOnly, setVerifiedTutorOnly] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorLoading, setTutorLoading] = useState<boolean>(true);
  const [tutorError, setTutorError] = useState<string | null>(null);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availablePostOffices, setAvailablePostOffices] = useState<
    Array<{ name: string; postcode: string }>
  >([]);
  const [tutorCurrentPage, setTutorCurrentPage] = useState<number>(1);
  const [tutorTotalPages, setTutorTotalPages] = useState<number>(1);
  const [tutorTotalCount, setTutorTotalCount] = useState<number>(0);
  const [postedJobs, setPostedJobs] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Taxonomy state for tutor request form
  const [categories, setCategories] = useState<
    Array<{ id: number; name: string }>
  >([]);
  const [subjects, setSubjects] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [locations, setLocations] = useState<
    Array<{ id: number; name: string }>
  >([]);

  // Tutor request form state
  const [requestFormData, setRequestFormData] = useState({
    title: "",
    description: "",
    category: "",
    subject: "",
    location: "",
    budget: "",
    schedule: "",
    requirements: "",
  });

  // Bookings state
  const [bookings, setBookings] = useState<
    Array<{
      id: string;
      tutorName: string;
      subject: string;
      date: string;
      time: string;
      status: string;
      amount: number;
    }>
  >([]);

  // Profile state
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    location: "",
    avatar: "",
    preferences: {
      notifications: true,
      emailUpdates: true,
      smsUpdates: false,
    },
  });

  // Courses state
  const [enrolledCourses, setEnrolledCourses] = useState<CourseEnrollment[]>(
    []
  );
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Search state
  const [filterSubject, setFilterSubject] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterGender, setFilterGender] = useState<FilterGender>("any");
  const [filterRating, setFilterRating] = useState(0);

  // RTK Query hooks
  const { data: AllJobs, isLoading: jobsLoading } =
    useGetAllTutorRequestsQuery(undefined);
  const { data: allTutor, isLoading: tutorsLoading } =
    useGetAllTutorsQuery(undefined);



  // Transform AllJobs data for recentPlatformJobs
  const recentPlatformJobs = useMemo(() => {
    if (!AllJobs?.success || !AllJobs?.data) return [];

    return AllJobs.data
      .map((job: any) => ({
        id: job.id,
        tutorRequestId: job.tutorRequestId,
        phoneNumber: job.phoneNumber,
        studentGender: job.studentGender,
        district: job.district,
        area: job.area,
        detailedLocation: job.detailedLocation,
        category: job.category,
        selectedCategories: job.selectedCategories,
        selectedSubjects: job.selectedSubjects,
        selectedClasses: job.selectedClasses,
        tutorGenderPreference: job.tutorGenderPreference,
        salary: job.salaryRange
          ? `${job.salaryRange.min} - ${job.salaryRange.max}`
          : "",
        isSalaryNegotiable: job.isSalaryNegotiable,
        salaryRange: job.salaryRange || { min: 0, max: 0 },
        extraInformation: job.extraInformation,
        subject: job.subject || job.selectedSubjects?.[0] || "General",
        studentClass: job.studentClass,
        medium: job.medium,
        numberOfStudents: job.numberOfStudents,
        tutoringDays: job.tutoringDays,
        tutoringTime: job.tutoringTime,
        tutoringDuration: job.tutoringDuration,
        tutoringType: job.tutoringType,
        status: job.status || "Active",
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        matchedTutors: job.matchedTutors || [],
      }))
      .sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [AllJobs]);

  // Transform allTutor data for topRatedTutors
  const topRatedTutors = useMemo(() => {
    if (!allTutor?.success || !allTutor?.data) return [];

    return allTutor.data
      .filter((tutor: any) => tutor.rating >= 4.0)
      .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((tutor: any) => ({
        id: tutor.id,
        full_name: tutor.fullName,
        name: tutor.fullName,
        email: tutor.email,
        phone: tutor.phone,
        district: tutor.district,
        area: tutor.area,
        subjects: tutor.subjects || [],
        rating: tutor.rating || 0,
        experience: tutor.experience || 0,
        avatar: tutor.avatar,
        gender: tutor.gender,
        tutor_id: tutor.tutor_id,
        hourly_rate: tutor.hourly_rate,
        verified: tutor.verified,
        premium: tutor.premium,
        tutorStatus: tutor.tutorStatus,
      }));
  }, [allTutor]);

  // Authentication and routing
  useEffect(() => {
    if (!user) {
      // router.push('/');
      return;
    }

    // Check if user has student role
    if (user.role && user.role !== "STUDENT_GUARDIAN") {
      // Redirect users to their specific dashboards
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "MANAGER") {
        router.push("/manager/dashboard");
      } else if (user.role === "SUPER_ADMIN") {
        router.push("/super-admin/dashboard");
      } else if (user.role === "TUTOR") {
        router.push("/dashboard");
      }
      return;
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      // router.push('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Dashboard functions
  // const fetchDashboard = async () => {
  //   try {
  //     setDataLoading(true);
  //     const data = await getLearningDashboard();
  //     setDashboard(data);
  //   } catch (error) {
  //     console.error("Error fetching dashboard:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to load learning dashboard",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setDataLoading(false);
  //   }
  // };

  // Fetch posted jobs
  const fetchPostedJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tutorRequestService.getStudentTutorRequests();

      if (response && response.success) {
        const jobsData = response.data || [];
        setPostedJobs(jobsData);
        const count = jobsData.length;
        setTotalCount(count);
      } else {
        setPostedJobs([]);
        setTotalCount(0);
      }
    } catch (error: any) {
      setPostedJobs([]);
      setTotalCount(0);

      toast({
        title: "Error",
        description: "Failed to load posted jobs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch all tutors for search page
  const fetchAllTutors = useCallback(async () => {
    try {
      // Fetch all tutors without pagination for search page
      const params = {
        limit: 1000, // Fetch a large number to get all tutors
      };

      const response = await tutorService.getAllTutors(params);

      if (response.success) {
        setTutors(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching all tutors:", error);
      // Don't show error toast for this as it's not critical
    }
  }, []);

  // Fetch tutors
  const fetchTutors = useCallback(async () => {
    setTutorLoading(true);
    setTutorError(null);
    try {
      const params: any = {};

      if (selectedSubject !== "all") {
        params.subject = selectedSubject;
      }

      if (selectedDistrict !== "all") {
        params.district = selectedDistrict;
      }

      if (selectedArea !== "all") {
        params.area = selectedArea;
      }

      if (selectedPostOffice !== "all") {
        params.postOffice = selectedPostOffice;
      }

      if (ratingFilter > 0) {
        params.minRating = ratingFilter;
      }

      if (minExperience > 0) {
        params.minExperience = minExperience;
      }

      if (selectedGender !== "all") {
        params.gender = selectedGender;
      }

      if (selectedEducation !== "all") {
        params.education = selectedEducation;
      }

      if (selectedAvailability !== "all") {
        params.availability = selectedAvailability;
      }

      if (maxPrice) {
        params.maxPrice = maxPrice;
      }

      if (geniusTutorOnly) {
        params.premium = "yes";
      }

      if (verifiedTutorOnly) {
        params.verified = 1;
      }

      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }

      params.page = tutorCurrentPage;
      params.limit = 6;

      const response = await tutorService.getAllTutors(params);

      if (response.success) {
        setTutors(response.data);

        if (response.pagination) {
          setTutorTotalPages(response.pagination.pages);
          setTutorTotalCount(response.pagination.total);
        } else {
          const expectedTotal = 30;
          const limit = 6;
          const calculatedPages = Math.ceil(expectedTotal / limit);
          setTutorTotalPages(calculatedPages);
          setTutorTotalCount(expectedTotal);
        }
      } else {
        setTutorError("Failed to fetch tutors");
        setTutors([]);
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      setTutorError("Failed to fetch tutors. Please try again later.");
      setTutors([]);
    } finally {
      setTutorLoading(false);
    }
  }, [
    selectedSubject,
    selectedDistrict,
    selectedArea,
    selectedPostOffice,
    ratingFilter,
    minExperience,
    selectedGender,
    selectedEducation,
    selectedAvailability,
    maxPrice,
    sortBy,
    sortOrder,
    geniusTutorOnly,
    verifiedTutorOnly,
    tutorCurrentPage,
  ]);

  const loadTaxonomyData = async () => {
    try {
      const taxonomyData = await taxonomyService.getTaxonomyData();
      // setCategories(taxonomyData.categories);

      // // Extract all subjects and locations from categories
      // const allSubjects = taxonomyData.categories.flatMap(cat => cat.subjects);
      // const allLocations = taxonomyData.categories.flatMap(cat => cat.classLevels);

      // setSubjects(allSubjects);
      // setLocations(allLocations);
    } catch (error) {
      console.error("Error loading taxonomy data:", error);
    }
  };

  const loadBookings = async () => {
    // Mock data - replace with actual API call
    setBookings([
      {
        id: "1",
        tutorName: "Ahmed Khan",
        subject: "Mathematics",
        date: "2024-01-20",
        time: "14:00",
        status: "Confirmed",
        amount: 25,
      },
      {
        id: "2",
        tutorName: "Fatima Rahman",
        subject: "English",
        date: "2024-01-22",
        time: "16:00",
        status: "Pending",
        amount: 20,
      },
    ]);
  };

  const loadProfileData = async () => {
    if (!user) return;

    try {
      // First try to load fresh data from API
      try {
        const response = await profileService.getProfile(user.id);
        if (response.success && response.data) {
          setProfileData({
            name: response.data.fullName || response.data.name || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            district: response.data.district || "",
            location: response.data.location || "",
            avatar: response.data.avatar_url || "",
            preferences: {
              notifications: true,
              emailUpdates: true,
              smsUpdates: false,
            },
          });
          return;
        }
      } catch (apiError) {
        // console.warn(
        //   "Failed to load profile from API, falling back to user context:",
        //   apiError
        // );
      }

      // Fallback to user context data
      setProfileData({
        name: user.full_name || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        district: user.district || "",
        location: user.location || "",
        avatar: user.avatar_url || "",
        preferences: {
          notifications: true,
          emailUpdates: true,
          smsUpdates: false,
        },
      });
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  // Profile update function
  const handleProfileUpdate = async (updatedProfile: any) => {
    if (!user) return;

    try {
      const profileData = {
        full_name: updatedProfile.name,
        email: updatedProfile.email,
        phone: updatedProfile.phone,
        district: updatedProfile.district,
        location: updatedProfile.location,
        avatar_url: updatedProfile.avatar,
      };

      const response = await profileService.updateProfile(user.id, profileData);

      if (response.success) {
        // Reload profile data to ensure we have the latest from the database
        await loadProfileData();

        // Update user context
        if (updateUserProfile) {
          updateUserProfile({
            ...user,
            full_name: updatedProfile.name,
            email: updatedProfile.email,
            phone: updatedProfile.phone,
            district: updatedProfile.district,
            location: updatedProfile.location,
            avatar_url: updatedProfile.avatar,
          });
        }

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Password change function
  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      // Validate passwords
      if (newPassword !== confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "New password and confirm password do not match.",
          variant: "destructive",
        });
        return false;
      }

      if (newPassword.length < 6) {
        toast({
          title: "Password Too Short",
          description: "Password must be at least 6 characters long.",
          variant: "destructive",
        });
        return false;
      }

      const response = await profileService.changePassword(user.id, {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        });
        return true;
      } else {
        throw new Error(response.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Password Change Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to change password. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // const loadEnrolledCourses = async () => {
  //   if (!user?.id) return;

  //   try {
  //     setIsLoadingCourses(true);
  //     const response = await getMyEnrollments();
  //     setEnrolledCourses(response.enrollments || []);
  //   } catch (error) {
  //     // console.error("Error loading enrolled courses:", error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to load your courses. Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsLoadingCourses(false);
  //   }
  // };

  // Load initial data
  useEffect(() => {
    if (user) {
      // fetchDashboard();
      loadTaxonomyData();
      // fetchPostedJobs();
      loadBookings();
      loadProfileData();
      // loadEnrolledCourses();
    }
  }, [user]);

  // Fetch jobs when request tab is active
  useEffect(() => {
    if (activeTab === "request") {
      fetchPostedJobs();
    }
  }, [activeTab, fetchPostedJobs]);

  // Fetch tutors when search tab is active
  useEffect(() => {
    if (activeTab === "search") {
      fetchAllTutors();
    }
  }, [activeTab, fetchAllTutors]);

  // Load courses when courses tab is active
  useEffect(() => {
    if (activeTab === "courses") {
      // loadEnrolledCourses();
    }
  }, [activeTab]);

  // Update available areas when district changes
  useEffect(() => {
    if (selectedDistrict !== "all") {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(
        (d) => d.id === selectedDistrict
      );
      if (district) {
        setAvailableAreas(district.areas.map((area) => area.name));
        // Reset area and post office when district changes
        setSelectedArea("all");
        setSelectedPostOffice("all");
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
      setSelectedArea("all");
      setSelectedPostOffice("all");
    }
  }, [selectedDistrict]);

  // Update available post offices when area changes
  useEffect(() => {
    if (selectedDistrict !== "all" && selectedArea !== "all") {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(
        (d) => d.id === selectedDistrict
      );
      if (district) {
        const area = district.areas.find((a) => a.name === selectedArea);
        if (area) {
          setAvailablePostOffices(area.postOffices);
          // Reset post office when area changes
          setSelectedPostOffice("all");
        } else {
          setAvailablePostOffices([]);
        }
      }
    } else {
      setAvailablePostOffices([]);
      setSelectedPostOffice("all");
    }
  }, [selectedDistrict, selectedArea]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setTutorCurrentPage(1);
  }, [
    selectedSubject,
    selectedDistrict,
    selectedArea,
    selectedPostOffice,
    ratingFilter,
    minExperience,
    selectedGender,
    selectedEducation,
    selectedAvailability,
    maxPrice,
    sortBy,
    sortOrder,
    geniusTutorOnly,
    verifiedTutorOnly,
  ]);

  // Helper functions
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Reset to first page when searching
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  // Filter jobs based on search query
  const filteredJobs = postedJobs.filter((job) => {
    const matchesSearch =
      (job.subject &&
        job.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.extraInformation &&
        job.extraInformation
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (job.district &&
        job.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.area && job.area.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  // Calculate pagination for filtered jobs
  const jobsPerPage = 6;
  const totalFilteredPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

  // Filter tutors based on search query
  const filteredTutors =
    tutors?.filter((tutor) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        tutor.full_name?.toLowerCase().includes(query) ||
        (typeof tutor.subjects === "string"
          ? tutor.subjects.toLowerCase().includes(query)
          : Array.isArray(tutor.subjects) &&
            (tutor.subjects as string[]).some((subject) =>
              subject.toLowerCase().includes(query)
            ))
      );
    }) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 w-full student-dashboard">
      {/* Sticky Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-80 md:fixed md:inset-y-0 md:z-50 bg-white border-r border-gray-200 shadow-lg">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sidebar Header - Connected to Navbar */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Student Dashboard
              </span>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto">
            <DashboardSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onLogout={handleLogout}
              role="STUDENT_GUARDIAN"
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="md:pl-64 lg:pl-80 flex flex-col flex-1 min-w-0 w-full">
        {/* Sticky Navbar */}
        <DashboardNavbar
          user={{
            fullName: user?.fullName || user?.name || "Student",
            email: user?.email || "",
            role: user?.role || "STUDENT_GUARDIAN",
            avatar: user?.avatar,
          }}
          onLogout={handleLogout}
          onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
          showMobileSidebar={showMobileSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 w-full main-content">
          <div className="w-full max-w-none content-container">
            {activeTab === "dashboard" && (
              <StudentOverview
                profile={{ name: user?.fullName || "Student" }}
                requestsPostedCount={postedJobs.length}
                tutorRequestedCount={0}
                tutorAssignedCount={0}
                paymentsProcessedCount={0}
                postedRequests={postedJobs}
                recentPlatformJobs={recentPlatformJobs}
                topRatedTutors={topRatedTutors}
                setActiveTab={setActiveTab}
                inviteDemo={() => {}}
              />
            )}
            {activeTab === "request" && (
              <StudentPostedJobs
                postedRequests={postedJobs}
                isLoadingRequests={isLoading}
                refreshPostedRequests={fetchPostedJobs}
              />
            )}
            {activeTab === "posted-jobs" && (
              <StudentRequestForm onRequestCreated={fetchPostedJobs} />
            )}
            {activeTab === "search" && (
              <StudentSearch
              // searchQuery={searchQuery}
              // setSearchQuery={setSearchQuery}
              // filterSubject={selectedSubject}
              // setFilterSubject={setSelectedSubject}
              // filterArea={selectedDistrict}
              // setFilterArea={setSelectedDistrict}
              // filterGender={selectedGender as FilterGender}
              // setFilterGender={setSelectedGender}
              // filterRating={ratingFilter}
              // setFilterRating={setRatingFilter}
              // viewMode={viewMode}
              // setViewMode={(mode: string) =>
              //   setViewMode(mode as "grid" | "list")
              // }
              // filteredTutors={tutors}
              // inviteDemo={() => {}}
              />
            )}
            {activeTab === "profile" && (
              <StudentProfile
              // paymentMethods={[]}
              // isLoadingPaymentMethods={false}
              // handleProfileUpdate={handleProfileUpdate}
              // handlePasswordChange={handlePasswordChange}
              // handleAddPaymentMethod={async () => false}
              // handleUpdatePaymentMethod={async () => false}
              // handleDeletePaymentMethod={async () => false}
              // handleSetDefaultPaymentMethod={async () => false}
              />
            )}
            {activeTab === "courses" && <StudentCourses />}
            {activeTab === "join-community" && <JoinCommunity />}
            {activeTab === "demo-classes" && user?.id && (
              <DemoClassesSection studentId={user.id} />
            )}
            {activeTab === "approval-letter" && user?.id && (
              <ApprovalLetterSection />
            )}
            {activeTab === "reviews" && <StudentReviews />}
            {activeTab === "settings" && <StudentSettings />}
            {activeTab === "note" && <GuardianNotesSection />}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        >
          <aside
            className="mobile-sidebar fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200 relative z-10">
              <h2 className="text-lg font-semibold text-gray-900">
                Student Menu
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSidebar(false)}
                className="h-8 w-8 relative z-20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-full pb-20 p-4">
              <DashboardSidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setShowMobileSidebar(false);
                }}
                onLogout={handleLogout}
                role="STUDENT_GUARDIAN"
              />
            </div>
          </aside>
        </div>
      )}

      {/* Floating  Chat Widget */}
      <FloatingTutorChat />
    </div>
  );
}
