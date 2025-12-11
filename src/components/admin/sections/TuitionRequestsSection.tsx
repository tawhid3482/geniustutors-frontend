"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  Eye,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  UserPlus,
  Users,
  Trash2,
  MapPin,
  Star,
  Clock,
  BookOpen,
  GraduationCap,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  tutorRequestService,
  TutorAssignment,
  UpdateNoticeHistory,
} from "@/services/tutorRequestService";
import tutorService from "@/services/tutorService";
import { Textarea } from "@/components/ui/textarea";
import { taxonomyService, Category } from "@/services/taxonomyService";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useRole } from "@/contexts/RoleContext";
import {
  useGetAllTutorRequestsQuery,
  useUpdateTutorRequestsMutation,
  useUpdateTutorRequestsStatusMutation,
} from "@/redux/features/tutorRequest/tutorRequestApi";

interface TuitionRequest {
  id: string;
  studentId?: string;
  title?: string;
  studentName: string;
  studentFullName?: string;
  studentPhone?: string;
  studentEmail?: string;
  numberOfStudents?: number;
  studentGender?: string;
  district: string;
  area: string;
  postOffice?: string;
  locationDetails?: string;
  medium?: string;
  subject: string;
  studentClass: string;
  category?: string;
  tutoringType: string;
  preferredTeacherGender?: string;
  daysPerWeek?: number;
  tutoringTime?: string;
  salaryRange: {
    min: number;
    max: number;
  };
  budget?: string;
  experienceRequired?: string;
  availability?: string;
  extraInformation?: string;
  adminNote?: string;
  updateNotice?: string;
  updateNoticeBy?: string;
  updateNoticeByName?: string;
  updateNoticeAt?: string;
  status: "Active" | "Inactive" | "Completed" | "Assign";
  urgent?: boolean;
  createdAt: string;
  updatedAt: string;
  matchedTutors: TutorAssignment[];
  submittedFromTutorId?: string;
  referringTutorName?: string;
  referringTutorEmail?: string;
}

type LocalTutor = import("@/services/tutorService").Tutor;

interface TutorFilter {
  subject?: string;
  district?: string;
  minRating?: number;
  maxPrice?: number;
  gender?: string;
  education?: string;
  availability?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface RealTimeConfig {
  enabled: boolean;
  interval: number;
  lastUpdate: Date;
}

export function TuitionRequestsSection() {
  const { toast } = useToast();
  const { user } = useRole();

  // RTK Query ব্যবহার করুন
  const {
    data: tutorRequestsData,
    isLoading: rtkLoading,
    error: rtkError,
    refetch: refetchRTK,
    isFetching: rtkFetching,
  } = useGetAllTutorRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000, // 30 seconds auto refresh
  });

  // RTK Query mutation for status update
  const [updateTutorRequestStatus] = useUpdateTutorRequestsStatusMutation();
  const [updateTutorRequest] = useUpdateTutorRequestsMutation();

  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TuitionRequest[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [referralFilter, setReferralFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<TuitionRequest | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tutors, setTutors] = useState<LocalTutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<LocalTutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [createDemoClass, setCreateDemoClass] = useState(false);
  const [demoDate, setDemoDate] = useState("");
  const [demoDuration, setDemoDuration] = useState(30);
  const [demoNotes, setDemoNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignerNames, setAssignerNames] = useState<Record<string, string>>(
    {}
  );
  const [showAssignerDialog, setShowAssignerDialog] = useState(false);
  const [assignerDetails, setAssignerDetails] = useState<any | null>(null);
  const [updateNoticeAuthorName, setUpdateNoticeAuthorName] = useState<
    string | null
  >(null);
  const [updateNoticeHistory, setUpdateNoticeHistory] = useState<
    UpdateNoticeHistory[]
  >([]);
  const [isLoadingUpdateHistory, setIsLoadingUpdateHistory] = useState(false);
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [editFormData, setEditFormData] = useState<Partial<TuitionRequest>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  // Real-time functionality
  const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
    enabled: true,
    interval: 30000,
    lastUpdate: new Date(),
  });
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced tutor assignment
  const [tutorFilters, setTutorFilters] = useState<TutorFilter>({});
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [selectedTutorDetails, setSelectedTutorDetails] =
    useState<LocalTutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<
    "all" | "matched" | "nearby"
  >("all");
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [sendSMSNotification, setSendSMSNotification] = useState(true);

  // Check if current user can delete requests (only admins can delete)
  const canDeleteRequests = () => {
    return user?.role === "admin";
  };

  useEffect(() => {
    if (tutorRequestsData) {
      if (tutorRequestsData.success && Array.isArray(tutorRequestsData.data)) {
        const formattedRequests: TuitionRequest[] = tutorRequestsData.data.map(
          (req: any) => {
            const studentName = "Anonymous Student";
            const studentFullName = "Anonymous Student";
            const studentPhone = req.phoneNumber || "";
            const district = req.district || "";
            const area = req.area || "";

            // selectedSubjects এবং selectedClasses array থেকে string তৈরি করুন
            const subject = req.selectedSubjects
              ? req.selectedSubjects.join(", ")
              : "Not specified";
            const studentClass = req.selectedClasses
              ? req.selectedClasses.join(", ")
              : "Not specified";
            const category = req.selectedCategories
              ? req.selectedCategories.join(", ")
              : "Not specified";

            const tutoringType = req.tutoringType || "Home Tutoring";
            const salaryMin = req.salaryRange?.min || 0;
            const salaryMax = req.salaryRange?.max || 0;

            const status = req.status || "active";
            const formattedStatus =
              status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

            const createdAt = req.createdAt
              ? new Date(req.createdAt).toLocaleDateString()
              : new Date().toLocaleDateString();
            const updatedAt = req.updatedAt
              ? new Date(req.updatedAt).toLocaleDateString()
              : "";

            return {
              id: req.id,
              studentId: req.userId || "",
              title: req.tutorRequestId || "Tutor Request",
              studentName,
              studentFullName,
              studentPhone,
              studentEmail: "",
              numberOfStudents: req.numberOfStudents || 1,
              studentGender: req.studentGender || "",
              district,
              area,
              postOffice: "",
              locationDetails: req.detailedLocation || "",
              medium: req.medium || "",
              subject,
              studentClass,
              category,
              tutoringType,
              preferredTeacherGender: req.tutorGenderPreference || "",
              daysPerWeek: req.tutoringDays || 0,
              tutoringTime: req.tutoringTime || "",
              salaryRange: {
                min: salaryMin,
                max: salaryMax,
              },
              budget: "",
              experienceRequired: "",
              availability: "",
              extraInformation: req.extraInformation || "",
              adminNote: "",
              updateNotice: "",
              updateNoticeBy: undefined,
              updateNoticeByName: undefined,
              updateNoticeAt: undefined,
              status: formattedStatus as
                | "Active"
                | "Inactive"
                | "Completed"
                | "Assign",
              urgent: req.isSalaryNegotiable || false,
              createdAt,
              updatedAt,
              matchedTutors: req.assignments || [],
              submittedFromTutorId: "",
              referringTutorName: "",
              referringTutorEmail: "",
            };
          }
        );

        console.log("Formatted requests:", formattedRequests);
        setRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      } else {
        console.error("Invalid data structure from RTK Query");
      }
    } else if (rtkError) {
      console.error("RTK Query error:", rtkError);
      toast({
        title: "Error",
        description: "Failed to fetch tuition requests",
        variant: "destructive",
      });
    }
  }, [tutorRequestsData, rtkError, toast]);

  // Manual refresh function - RTK Query ব্যবহার করে
  const handleManualRefresh = async () => {
    try {
      await refetchRTK(); // RTK Query এর refetch ব্যবহার করুন
      setRealTimeConfig((prev) => ({ ...prev, lastUpdate: new Date() }));
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive",
      });
    }
  };

  // Real-time updates এর জন্য useEffect
  useEffect(() => {
    if (realTimeConfig.enabled) {
      realTimeIntervalRef.current = setInterval(() => {
        refetchRTK(); // RTK Query এর refetch ব্যবহার করুন
        setRealTimeConfig((prev) => ({ ...prev, lastUpdate: new Date() }));
      }, realTimeConfig.interval);
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [realTimeConfig.enabled, realTimeConfig.interval, refetchRTK]);

  // Filter requests based on search term, status, and referral type
  useEffect(() => {
    let filtered = [...requests];

    // Apply search filter - ID, Phone, Location, Category, Subject, Type এর উপর search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          (request.title && request.title.toLowerCase().includes(term)) || // ID search
          (request.studentPhone &&
            request.studentPhone.toLowerCase().includes(term)) || // Phone search
          (request.district && request.district.toLowerCase().includes(term)) || // Location search
          (request.area && request.area.toLowerCase().includes(term)) || // Location search
          (request.category && request.category.toLowerCase().includes(term)) || // Category search
          (request.subject && request.subject.toLowerCase().includes(term)) || // Subject search
          (request.tutoringType &&
            request.tutoringType.toLowerCase().includes(term)) // Type search
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.status.toLowerCase() === statusFilter
      );
    }

    // Apply referral filter
    if (referralFilter !== "all") {
      if (referralFilter === "referred") {
        filtered = filtered.filter((request) => request.submittedFromTutorId);
      } else if (referralFilter === "direct") {
        filtered = filtered.filter((request) => !request.submittedFromTutorId);
      }
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, referralFilter, requests]);

  // Handle status change using RTK Query mutation
  const handleStatusChange = async (
    requestId: string,
    newStatus: "Active" | "Inactive" | "Completed" | "Assign"
  ) => {
    try {
      // RTK Query mutation ব্যবহার করে status update করুন
      const response = await updateTutorRequestStatus({
        id: requestId,
        data: { status: newStatus.toLowerCase() },
      }).unwrap();

      if (response.success) {
        toast({
          title: "Status Updated",
          description: `Request status has been updated to ${newStatus}`,
        });

        // Refresh data using RTK Query
        await refetchRTK();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Fetch update notice history
  const fetchUpdateNoticeHistory = useCallback(async (requestId: string) => {
    try {
      console.log("=== FETCHING UPDATE NOTICE HISTORY ===");
      console.log("Request ID:", requestId);

      setIsLoadingUpdateHistory(true);
      const response = await tutorRequestService.getUpdateNoticeHistory(
        requestId
      );
      console.log("Update notice history response:", response);

      if (response.success) {
        console.log("Setting update notice history:", response.data);
        setUpdateNoticeHistory(response.data);
      } else {
        console.error(
          "Failed to fetch update notice history:",
          response.message
        );
        setUpdateNoticeHistory([]);
      }
    } catch (error) {
      console.error("Error fetching update notice history:", error);
      setUpdateNoticeHistory([]);
    } finally {
      setIsLoadingUpdateHistory(false);
    }
  }, []);

  // View request details
  const viewRequestDetails = (request: TuitionRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    // Fetch update notice history when viewing details
    fetchUpdateNoticeHistory(request.id);
  };

  // Open edit request modal
  const openEditRequestModal = (request: TuitionRequest) => {
    setSelectedRequest(request);

    // Initialize selected arrays from comma-separated strings
    const categories = request.category
      ? request.category
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c)
      : [];
    const subjects = request.subject
      ? request.subject
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];
    const classes = request.studentClass
      ? request.studentClass
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c)
      : [];

    setSelectedCategories(categories);
    setSelectedSubjects(subjects);
    setSelectedClasses(classes);

    const formData = {
      studentName: request.studentName,
      district: request.district,
      area: request.area,
      subject: request.subject,
      studentClass: request.studentClass,
      category: request.category || "",
      tutoringType: request.tutoringType || "Home Tutoring",
      salaryRange: {
        min: request.salaryRange.min,
        max: request.salaryRange.max,
      },
      adminNote: request.adminNote || "",
      updateNotice: request.updateNotice || "",
      updateNoticeBy: request.updateNoticeBy,
      updateNoticeByName: request.updateNoticeByName,
      updateNoticeAt: request.updateNoticeAt,
      status: request.status,
    };

    console.log("Initializing edit form with data:", formData);
    setEditFormData(formData);
    setShowEditModal(true);
  };

  // Handle form field changes
  const handleEditFormChange = (field: string, value: any) => {
    console.log(
      "Form field changed:",
      field,
      "Value:",
      value,
      "Type:",
      typeof value
    );
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle salary range changes
  const handleSalaryRangeChange = (type: "min" | "max", value: number) => {
    setEditFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange!,
        [type]: value,
      },
    }));
  };

  // Handle update request
  const handleUpdateRequest = async () => {
    if (!selectedRequest || !editFormData) return;

    setIsUpdating(true);
    try {
      const updatePayload = {
        studentName: editFormData.studentName,
        district: editFormData.district,
        area: editFormData.area,
        subject: editFormData.subject,
        studentClass: editFormData.studentClass,
        category: editFormData.category,
        tutoringType: editFormData.tutoringType as
          | "Home Tutoring"
          | "Online Tutoring"
          | "Both"
          | undefined,
        salaryRange: editFormData.salaryRange,
        adminNote: editFormData.adminNote,
        updateNotice: editFormData.updateNotice,
      };

      console.log("Updating tuition request with payload:", updatePayload);

      const response = await tutorRequestService.updateTutorRequest(
        selectedRequest.id,
        {
          ...updatePayload,
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Tuition request updated successfully",
        });

        // Refresh data using RTK Query
        await refetchRTK();

        // Refresh update notice history if we're viewing the details
        if (showDetailsModal && selectedRequest) {
          await fetchUpdateNoticeHistory(selectedRequest.id);
        }

        setShowEditModal(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update tutor request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating tuition request:", error);
      toast({
        title: "Error",
        description: "Failed to update tuition request",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId: string) => {
    if (!canDeleteRequests()) {
      toast({
        title: "Access Denied",
        description:
          "You don't have permission to delete tuition requests. Only administrators can delete requests.",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete this tuition request? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await tutorRequestService.deleteTutorRequestAdmin(
        requestId
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Tuition request deleted successfully",
        });

        // Refresh data using RTK Query
        await refetchRTK();

        // Close modals if the deleted request was selected
        if (selectedRequest?.id === requestId) {
          setShowDetailsModal(false);
          setShowEditModal(false);
          setShowAssignTutorModal(false);
          setSelectedRequest(null);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete tutor request",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting tuition request:", error);
      toast({
        title: "Error",
        description: "Failed to delete tuition request",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch tutors for assignment with advanced filtering
  const fetchTutors = useCallback(
    async (filters?: TutorFilter) => {
      try {
        setIsLoadingTutors(true);

        const response = await tutorService.getAllTutors(filters);

        if (response.success && response.data) {
          // Transform the data to ensure all required fields are present
          const transformedTutors = response.data.map((tutor: any) => ({
            id: tutor.id,
            tutor_id: tutor.tutor_id || "",
            full_name: tutor.full_name || "Unknown Tutor",
            location: tutor.location || "",
            district: tutor.district || "",
            avatar_url: tutor.avatar_url || null,
            created_at: tutor.created_at || new Date().toISOString(),
            gender: tutor.gender || null,
            bio: tutor.bio || null,
            education: tutor.education || null,
            experience: tutor.experience || null,
            subjects: tutor.subjects || "",
            hourly_rate: tutor.hourly_rate
              ? parseFloat(tutor.hourly_rate)
              : undefined,
            rating: tutor.rating ? parseFloat(tutor.rating) : 0,
            total_reviews: tutor.total_reviews
              ? parseInt(tutor.total_reviews)
              : 0,
            total_views: tutor.total_views || 0,
            availability: tutor.availability || null,
            premium: tutor.premium || null,
            verified: tutor.verified || 0,
            qualification: tutor.qualification || null,
            tutoring_experience: tutor.tutoring_experience || null,
            university_name: tutor.university_name || null,
            department_name: tutor.department_name || null,
            expected_salary: tutor.expected_salary
              ? parseFloat(tutor.expected_salary)
              : undefined,
            days_per_week: tutor.days_per_week || null,
            preferred_tutoring_style: tutor.preferred_tutoring_style || null,
            educational_qualifications:
              tutor.educational_qualifications || null,
            preferred_subjects: tutor.preferred_subjects || null,
            preferred_class: tutor.preferred_class || null,
            preferred_medium: tutor.preferred_medium || null,
            preferred_time: tutor.preferred_time || null,
            religion: tutor.religion || null,
            nationality: tutor.nationality || null,
          }));

          setTutors(transformedTutors as LocalTutor[]);
          setFilteredTutors(transformedTutors as LocalTutor[]);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch tutors",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching tutors:", error);
        toast({
          title: "Error",
          description: "Failed to fetch tutors",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTutors(false);
      }
    },
    [toast]
  );

  // Get matched tutors for a specific request
  const getMatchedTutors = useCallback(
    (request: TuitionRequest) => {
      if (!request || !tutors.length) {
        return [];
      }

      // Filter out already assigned tutors
      let availableTutors = tutors;
      if (assignments.length > 0) {
        const assignedTutorIds = assignments.map(
          (assignment) => assignment.tutor_id
        );
        availableTutors = tutors.filter(
          (tutor) => !assignedTutorIds.includes(tutor.id)
        );
      }

      let matchedTutors = availableTutors.filter((tutor) => {
        // Apply search filter if search term exists
        if (tutorSearchTerm) {
          const searchTerm = tutorSearchTerm.toLowerCase();
          const tutorName = (tutor.full_name || "").toLowerCase();
          const tutorId = (tutor.id || "").toString().toLowerCase();

          if (
            !tutorName.includes(searchTerm) &&
            !tutorId.includes(searchTerm)
          ) {
            return false;
          }
        }

        // Check if tutor teaches the required subject
        const tutorSubjects = Array.isArray(tutor.subjects)
          ? tutor.subjects.join(",").toLowerCase()
          : (tutor.subjects || "").toLowerCase();
        const tutorPreferredSubjects = Array.isArray(tutor.preferred_subjects)
          ? tutor.preferred_subjects.join(",").toLowerCase()
          : (tutor.preferred_subjects || "").toLowerCase();
        const requestSubject = request.subject.toLowerCase();

        const teachesSubject =
          tutorSubjects.includes(requestSubject) ||
          tutorPreferredSubjects.includes(requestSubject) ||
          tutorSubjects.includes("all") ||
          tutorPreferredSubjects.includes("all");

        // Check if tutor is in the same district or nearby
        const tutorDistrict = (tutor.district || "").toLowerCase();
        const tutorLocation = (tutor.location || "").toLowerCase();
        const requestDistrict = request.district.toLowerCase();

        const locationMatch =
          tutorDistrict === requestDistrict ||
          tutorLocation.includes(requestDistrict) ||
          requestDistrict.includes(tutorDistrict);

        // Check if tutor's expected salary is within range (if salary range is specified)
        const salaryMatch =
          !request.salaryRange.max ||
          !tutor.expected_salary ||
          (tutor.expected_salary >= request.salaryRange.min &&
            tutor.expected_salary <= request.salaryRange.max);

        return teachesSubject && locationMatch && salaryMatch;
      });

      return matchedTutors;
    },
    [tutors, tutorSearchTerm, assignments]
  );

  // Get nearby tutors (same district)
  const getNearbyTutors = useCallback(
    (request: TuitionRequest) => {
      if (!request || !tutors.length) {
        return [];
      }

      // Filter out already assigned tutors
      let availableTutors = tutors;
      if (assignments.length > 0) {
        const assignedTutorIds = assignments.map(
          (assignment) => assignment.tutor_id
        );
        availableTutors = tutors.filter(
          (tutor) => !assignedTutorIds.includes(tutor.id)
        );
      }

      return availableTutors.filter((tutor) => {
        // Apply search filter if search term exists
        if (tutorSearchTerm) {
          const searchTerm = tutorSearchTerm.toLowerCase();
          const tutorName = (tutor.full_name || "").toLowerCase();
          const tutorId = (tutor.id || "").toString().toLowerCase();

          if (
            !tutorName.includes(searchTerm) &&
            !tutorId.includes(searchTerm)
          ) {
            return false;
          }
        }

        const tutorDistrict = (tutor.district || "").toLowerCase();
        const tutorLocation = (tutor.location || "").toLowerCase();
        const requestDistrict = request.district.toLowerCase();

        return (
          tutorDistrict === requestDistrict ||
          tutorLocation.includes(requestDistrict) ||
          requestDistrict.includes(tutorDistrict)
        );
      });
    },
    [tutors, tutorSearchTerm, assignments]
  );

  // Get all tutors filtered by search term and excluding already assigned tutors
  const getAllTutors = useCallback(() => {
    if (!tutors.length) {
      return [];
    }

    // Filter out already assigned tutors
    let availableTutors = tutors;
    if (selectedRequest && assignments.length > 0) {
      const assignedTutorIds = assignments.map(
        (assignment) => assignment.tutor_id
      );
      availableTutors = tutors.filter(
        (tutor) => !assignedTutorIds.includes(tutor.id)
      );
    }

    if (!tutorSearchTerm) {
      return availableTutors;
    }

    const searchTerm = tutorSearchTerm.toLowerCase();
    return availableTutors.filter((tutor) => {
      const tutorName = (tutor.full_name || "").toLowerCase();
      const tutorId = (tutor.id || "").toString().toLowerCase();

      return tutorName.includes(searchTerm) || tutorId.includes(searchTerm);
    });
  }, [tutors, tutorSearchTerm, selectedRequest, assignments]);

  // Open assign tutor modal with enhanced features
  const openAssignTutorModal = async (request: TuitionRequest) => {
    setSelectedRequest(request);
    setSelectedTutor("");
    setAssignmentNotes("");
    setCreateDemoClass(false);
    setDemoDate("");
    setDemoDuration(30);
    setDemoNotes("");
    setAssignmentTab("all");
    setTutorSearchTerm("");
    setSendEmailNotification(true);
    setSendSMSNotification(true);

    // Always fetch all tutors and assignments first to ensure we have the complete list
    try {
      await Promise.all([
        fetchTutors(),
        tutorRequestService.getTutorAssignments(request.id).then((response) => {
          if (response.success) {
            setAssignments(response.data);
          }
        }),
      ]);

      setShowAssignTutorModal(true);
    } catch (error) {
      console.error(
        "Error fetching tutors or assignments for assignment modal:",
        error
      );
      toast({
        title: "Error",
        description: "Failed to load tutors or assignments. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle tutor assignment
  const handleAssignTutor = async () => {
    if (!selectedRequest || !selectedTutor) {
      toast({
        title: "Error",
        description: "Please select a tutor",
        variant: "destructive",
      });
      return;
    }

    // Validate demo class data if creating one
    if (createDemoClass) {
      if (!demoDate) {
        toast({
          title: "Error",
          description: "Please select a demo class date",
          variant: "destructive",
        });
        return;
      }

      // Validate that the demo date is in the future
      const selectedDate = new Date(demoDate);
      const now = new Date();

      // Check if the date is valid
      if (isNaN(selectedDate.getTime())) {
        toast({
          title: "Error",
          description: "Invalid demo class date format",
          variant: "destructive",
        });
        return;
      }

      if (selectedDate <= now) {
        toast({
          title: "Error",
          description: "Demo class date must be in the future",
          variant: "destructive",
        });
        return;
      }

      // Validate duration
      if (demoDuration < 15 || demoDuration > 180) {
        toast({
          title: "Error",
          description: "Demo class duration must be between 15 and 180 minutes",
          variant: "destructive",
        });
        return;
      }
    }

    setIsAssigning(true);
    try {
      const demoClassData = createDemoClass
        ? {
            createDemo: true,
            requestedDate: new Date(demoDate).toISOString(),
            duration: demoDuration,
            notes: demoNotes,
          }
        : undefined;

      console.log("=== FRONTEND DEBUG: Tutor Assignment ===");
      console.log("Request ID:", selectedRequest.id);
      console.log("Tutor ID:", selectedTutor);
      console.log("Assignment Notes:", assignmentNotes);
      console.log("Demo Class Data:", demoClassData);
      console.log("Notification Options:", {
        sendEmailNotification,
        sendSMSNotification,
      });

      const response = await tutorRequestService.assignTutor(
        selectedRequest.id,
        selectedTutor,
        assignmentNotes,
        demoClassData,
        {
          sendEmailNotification,
          sendSMSNotification,
        }
      );

      console.log("Assignment response:", response);

      if (response.success) {
        const successMessage = createDemoClass
          ? `Tutor assigned successfully with demo class scheduled for ${new Date(
              demoDate
            ).toLocaleDateString()} at ${new Date(demoDate).toLocaleTimeString(
              [],
              { hour: "2-digit", minute: "2-digit" }
            )}`
          : "Tutor assigned successfully";

        // Add notification status to success message
        const notificationStatus = [];
        if (sendEmailNotification)
          notificationStatus.push("Email notification sent");
        if (sendSMSNotification)
          notificationStatus.push("SMS notification sent");

        const finalMessage =
          notificationStatus.length > 0
            ? `${successMessage}. ${notificationStatus.join(", ")}.`
            : successMessage;

        toast({
          title: "Success",
          description: finalMessage,
        });
        setShowAssignTutorModal(false);
        // Refresh data using RTK Query
        await refetchRTK();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign tutor",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning tutor:", error);
      toast({
        title: "Error",
        description: "Failed to assign tutor",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // View tutor assignments
  const viewAssignments = async (request: TuitionRequest) => {
    setSelectedRequest(request);
    try {
      const response = await tutorRequestService.getTutorAssignments(
        request.id
      );
      if (response.success) {
        setAssignments(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tutor assignments",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tutor assignments",
        variant: "destructive",
      });
    } finally {
      setShowAssignmentsModal(true);
    }
  };

  // Update assignment status
  const updateAssignmentStatus = async (
    assignmentId: string,
    status: "pending" | "accepted" | "rejected" | "completed"
  ) => {
    if (!selectedRequest) return;

    try {
      const response = await tutorRequestService.updateAssignmentStatus(
        selectedRequest.id,
        assignmentId,
        status
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Assignment status updated to ${status}`,
        });
        // Refresh data using RTK Query
        await refetchRTK();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update assignment status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating assignment status:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive",
      });
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId: string) => {
    if (!selectedRequest) return;

    // Check if user has permission to delete
    if (!canDeleteRequests()) {
      toast({
        title: "Access Denied",
        description:
          "You don't have permission to delete assignments. Only administrators can delete assignments.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const response = await tutorRequestService.deleteAssignment(
        selectedRequest.id,
        assignmentId
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully",
        });
        // Refresh data using RTK Query
        await refetchRTK();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete assignment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  // View tutor details
  const viewTutorDetails = async (tutorId: string) => {
    try {
      const response = await tutorService.getTutorById(tutorId);
      if (response.success) {
        setSelectedTutorDetails(response.data);
        setShowTutorDetails(true);
      }
    } catch (error) {
      console.error("Error fetching tutor details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tutor details",
        variant: "destructive",
      });
    }
  };

  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    setRealTimeConfig((prev) => {
      const newConfig = { ...prev, enabled: !prev.enabled };

      if (newConfig.enabled) {
        realTimeIntervalRef.current = setInterval(() => {
          refetchRTK();
          setRealTimeConfig((prev) => ({ ...prev, lastUpdate: new Date() }));
        }, newConfig.interval);
      } else {
        if (realTimeIntervalRef.current) {
          clearInterval(realTimeIntervalRef.current);
          realTimeIntervalRef.current = null;
        }
      }

      return newConfig;
    });
  };

  // Render status badge
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
        const displayStatus =
          status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        return <Badge>{displayStatus}</Badge>;
    }
  };

  // Combined loading state
  const isLoading = rtkLoading || rtkFetching;
  const isRefreshing = rtkFetching;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Tuition Requests
            </h2>
            <p className="text-white/90 mt-1">
              Manage tuition requests from students
            </p>
            {realTimeConfig.enabled && (
              <div className="flex items-center gap-2 mt-2 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Real-time updates enabled</span>
                <span className="text-xs">
                  • Last updated:{" "}
                  {realTimeConfig.lastUpdate.toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRealTimeUpdates}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  realTimeConfig.enabled ? "animate-spin" : ""
                }`}
              />
              {realTimeConfig.enabled ? "Disable" : "Enable"} Real-time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Tuition Requests</CardTitle>
              <CardDescription>
                View and manage tuition requests from students
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID, Phone, Location, Category, Subject, Type..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="assign">Assign</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={referralFilter} onValueChange={setReferralFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <SelectValue placeholder="Filter by referral" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="referred">Referred by Tutor</SelectItem>
                  <SelectItem value="direct">Direct Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tuition requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div className="text-sm">{request.title}</div>
                      </TableCell>
                      <TableCell>
                        {request.studentPhone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {request.studentPhone}
                          </div>
                        ) : (
                          "No phone"
                        )}
                      </TableCell>
                      <TableCell>
                        {request.district}
                        {request.area ? `, ${request.area}` : ""}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs p-4">
                          {request.category || "Not specified"}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.subject}</TableCell>
                      <TableCell>{request.tutoringType}</TableCell>
                      <TableCell>
                        {request.salaryRange.min === request.salaryRange.max
                          ? `৳${request.salaryRange.min}`
                          : `৳${request.salaryRange.min} - ৳${request.salaryRange.max}`}
                      </TableCell>
                      <TableCell>{renderStatusBadge(request.status)}</TableCell>
                      <TableCell>{request.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => viewRequestDetails(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openEditRequestModal(request)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Edit Request
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openAssignTutorModal(request)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Tutor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => viewAssignments(request)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View Assignments
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(request.id, "Active")
                              }
                              disabled={
                                request.status.toLowerCase() === "active"
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Mark as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(request.id, "Inactive")
                              }
                              disabled={
                                request.status.toLowerCase() === "inactive"
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                              Mark as Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(request.id, "Assign")
                              }
                              disabled={
                                request.status.toLowerCase() === "assign"
                              }
                            >
                              <UserPlus className="h-4 w-4 mr-2 text-orange-600" />
                              Mark as Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(request.id, "Completed")
                              }
                              disabled={
                                request.status.toLowerCase() === "completed"
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                              Mark as Completed
                            </DropdownMenuItem>
                            {canDeleteRequests() && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteRequest(request.id)
                                  }
                                  className="text-destructive focus:text-destructive"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isDeleting
                                    ? "Deleting..."
                                    : "Delete Request"}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tuition Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Student Name</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentName}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {selectedRequest.studentPhone || "Not provided"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {selectedRequest.district}, {selectedRequest.area}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Student Gender</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentGender || "Not specified"}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.medium || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.category || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.subject}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Class Levels</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentClass}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutoring Type</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.tutoringType}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Preferred Tutor Gender</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.preferredTeacherGender || "Any"}
                  </div>
                </div>
              </div>

              {/* Tutoring Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tutoring Days</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.daysPerWeek} days/week
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutoring Time</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedRequest.tutoringTime || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of Students</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.numberOfStudents || 1}
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="space-y-2">
                <Label>Salary Range</Label>
                <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />৳
                  {selectedRequest.salaryRange.min.toLocaleString()} - ৳
                  {selectedRequest.salaryRange.max.toLocaleString()}
                  {selectedRequest.urgent && (
                    <Badge className="ml-2 bg-red-500">Negotiable</Badge>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label>Additional Information</Label>
                <div className="p-2 bg-gray-50 rounded-md min-h-[60px]">
                  {selectedRequest.extraInformation ||
                    "No additional information"}
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <div className="p-2 bg-gray-50 rounded-md min-h-[60px]">
                  {selectedRequest.adminNote || "No admin notes"}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedRequest.status)}
                  </div>
                </div>
                <div>
                  <Label>Created At</Label>
                  <div className="mt-1">{selectedRequest.createdAt}</div>
                </div>
                <div>
                  <Label>Last Updated</Label>
                  <div className="mt-1">
                    {selectedRequest.updatedAt || "N/A"}
                  </div>
                </div>
              </div>

              {/* Update Notice History */}
              {updateNoticeHistory.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Update Notice History
                  </Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {updateNoticeHistory.map((notice, index) => (
                      <div
                        key={index}
                        className="p-3 bg-blue-50 rounded-md border border-blue-100"
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-medium">
                            {notice.updateNotice}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(notice.updatedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tuition Request</DialogTitle>
            <DialogDescription>
              Update the details of the tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && editFormData && (
            <div className="space-y-4">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    value={editFormData.studentName || ""}
                    onChange={(e) =>
                      handleEditFormChange("studentName", e.target.value)
                    }
                    placeholder="Enter student name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    value={editFormData.district || ""}
                    onChange={(e) =>
                      handleEditFormChange("district", e.target.value)
                    }
                    placeholder="Enter district"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area *</Label>
                  <Input
                    id="area"
                    value={editFormData.area || ""}
                    onChange={(e) =>
                      handleEditFormChange("area", e.target.value)
                    }
                    placeholder="Enter area"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tutoringType">Tutoring Type *</Label>
                  <Select
                    value={editFormData.tutoringType || ""}
                    onValueChange={(value) =>
                      handleEditFormChange("tutoringType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tutoring type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home Tutoring">
                        Home Tutoring
                      </SelectItem>
                      <SelectItem value="Online Tutoring">
                        Online Tutoring
                      </SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={editFormData.subject || ""}
                    onChange={(e) =>
                      handleEditFormChange("subject", e.target.value)
                    }
                    placeholder="Enter subject(s)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentClass">Class Level *</Label>
                  <Input
                    id="studentClass"
                    value={editFormData.studentClass || ""}
                    onChange={(e) =>
                      handleEditFormChange("studentClass", e.target.value)
                    }
                    placeholder="Enter class level(s)"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editFormData.category || ""}
                    onChange={(e) =>
                      handleEditFormChange("category", e.target.value)
                    }
                    placeholder="Enter category"
                  />
                </div>
              </div>

              {/* Salary Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Minimum Salary *</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={editFormData.salaryRange?.min || 0}
                    onChange={(e) =>
                      handleSalaryRangeChange("min", parseInt(e.target.value))
                    }
                    placeholder="Enter minimum salary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">Maximum Salary *</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={editFormData.salaryRange?.max || 0}
                    onChange={(e) =>
                      handleSalaryRangeChange("max", parseInt(e.target.value))
                    }
                    placeholder="Enter maximum salary"
                  />
                </div>
              </div>

              {/* Admin Notes and Update Notice */}
              <div className="space-y-2">
                <Label htmlFor="adminNote">Admin Notes</Label>
                <Textarea
                  id="adminNote"
                  value={editFormData.adminNote || ""}
                  onChange={(e) =>
                    handleEditFormChange("adminNote", e.target.value)
                  }
                  placeholder="Add admin notes..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="updateNotice">Update Notice</Label>
                <Textarea
                  id="updateNotice"
                  value={editFormData.updateNotice || ""}
                  onChange={(e) =>
                    handleEditFormChange("updateNotice", e.target.value)
                  }
                  placeholder="Add an update notice..."
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  This notice will be visible in the update history
                </p>
              </div>

              {/* Status Update */}
              <div className="space-y-2">
                <Label>Update Status</Label>
                <div className="flex gap-2">
                  {(["Active", "Inactive", "Assign", "Completed"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          editFormData.status === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleEditFormChange("status", status)}
                        className="flex-1"
                      >
                        {status}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRequest} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Tutor Modal */}
      <Dialog
        open={showAssignTutorModal}
        onOpenChange={setShowAssignTutorModal}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Tutor to Request</DialogTitle>
            <DialogDescription>
              Select a tutor to assign to this tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Summary */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {selectedRequest.subject}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.district}, {selectedRequest.area} •{" "}
                        {selectedRequest.studentClass}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ৳{selectedRequest.salaryRange.min.toLocaleString()} - ৳
                        {selectedRequest.salaryRange.max.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedRequest.tutoringType}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tutor Selection Tabs */}
              <Tabs
                value={assignmentTab}
                onValueChange={(value) => setAssignmentTab(value as any)}
              >
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="all">All Tutors</TabsTrigger>
                  <TabsTrigger value="matched">Best Matches</TabsTrigger>
                  <TabsTrigger value="nearby">Nearby Tutors</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tutors by name or ID..."
                      value={tutorSearchTerm}
                      onChange={(e) => setTutorSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {isLoadingTutors ? (
                      <div className="text-center py-8">
                        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : getAllTutors().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No tutors found
                      </div>
                    ) : (
                      getAllTutors().map((tutor) => (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isSelected={selectedTutor === tutor.id}
                          onSelect={() => setSelectedTutor(tutor.id)}
                          onViewDetails={() => viewTutorDetails(tutor.id)}
                          request={selectedRequest}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="matched" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search matched tutors..."
                      value={tutorSearchTerm}
                      onChange={(e) => setTutorSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {isLoadingTutors ? (
                      <div className="text-center py-8">
                        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : getMatchedTutors(selectedRequest).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No matching tutors found
                      </div>
                    ) : (
                      getMatchedTutors(selectedRequest).map((tutor) => (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isSelected={selectedTutor === tutor.id}
                          onSelect={() => setSelectedTutor(tutor.id)}
                          onViewDetails={() => viewTutorDetails(tutor.id)}
                          request={selectedRequest}
                          isMatched={true}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="nearby" className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search nearby tutors..."
                      value={tutorSearchTerm}
                      onChange={(e) => setTutorSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {isLoadingTutors ? (
                      <div className="text-center py-8">
                        <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    ) : getNearbyTutors(selectedRequest).length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No nearby tutors found
                      </div>
                    ) : (
                      getNearbyTutors(selectedRequest).map((tutor) => (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isSelected={selectedTutor === tutor.id}
                          onSelect={() => setSelectedTutor(tutor.id)}
                          onViewDetails={() => viewTutorDetails(tutor.id)}
                          request={selectedRequest}
                          isNearby={true}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Demo Class Options */}
              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="createDemoClass"
                    checked={createDemoClass}
                    onCheckedChange={(checked) =>
                      setCreateDemoClass(checked as boolean)
                    }
                  />
                  <Label htmlFor="createDemoClass" className="font-semibold">
                    Schedule a Demo Class
                  </Label>
                </div>

                {createDemoClass && (
                  <div className="space-y-4 pl-6 border-l-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="demoDate">Demo Date *</Label>
                        <Input
                          id="demoDate"
                          type="datetime-local"
                          value={demoDate}
                          onChange={(e) => setDemoDate(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="demoDuration">
                          Duration (minutes) *
                        </Label>
                        <Select
                          value={demoDuration.toString()}
                          onValueChange={(value) =>
                            setDemoDuration(parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                            <SelectItem value="120">120 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="demoNotes">Demo Notes</Label>
                      <Textarea
                        id="demoNotes"
                        value={demoNotes}
                        onChange={(e) => setDemoNotes(e.target.value)}
                        placeholder="Add any special instructions for the demo class..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Assignment Notes */}
              <div className="space-y-2">
                <Label htmlFor="assignmentNotes">Assignment Notes</Label>
                <Textarea
                  id="assignmentNotes"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  placeholder="Add notes for the tutor regarding this assignment..."
                  rows={3}
                />
              </div>

              {/* Notification Options */}
              <div className="space-y-3 border rounded-lg p-4">
                <Label className="font-semibold">Notification Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sendEmailNotification"
                      checked={sendEmailNotification}
                      onCheckedChange={(checked) =>
                        setSendEmailNotification(checked as boolean)
                      }
                    />
                    <Label htmlFor="sendEmailNotification">
                      Send Email Notification to Tutor
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="sendSMSNotification"
                      checked={sendSMSNotification}
                      onCheckedChange={(checked) =>
                        setSendSMSNotification(checked as boolean)
                      }
                    />
                    <Label htmlFor="sendSMSNotification">
                      Send SMS Notification to Tutor
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAssignTutorModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignTutor}
              disabled={isAssigning || !selectedTutor}
              className="w-full sm:w-auto"
            >
              {isAssigning ? "Assigning..." : "Assign Tutor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutor Details Modal */}
      <Dialog open={showTutorDetails} onOpenChange={setShowTutorDetails}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Complete information about the tutor
            </DialogDescription>
          </DialogHeader>

          {selectedTutorDetails && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                  {selectedTutorDetails.avatar_url ? (
                    <img
                      src={selectedTutorDetails.avatar_url}
                      alt={selectedTutorDetails.full_name}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">
                    {selectedTutorDetails.full_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        selectedTutorDetails.verified ? "default" : "outline"
                      }
                    >
                      {selectedTutorDetails.verified
                        ? "Verified"
                        : "Unverified"}
                    </Badge>
                    {selectedTutorDetails.premium && (
                      <Badge className="bg-yellow-500">Premium</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {selectedTutorDetails.district ||
                          selectedTutorDetails.location ||
                          "Location N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>
                        {selectedTutorDetails.rating || 0} (
                        {selectedTutorDetails.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Education</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedTutorDetails.education || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Experience</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedTutorDetails.experience || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subjects</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedTutorDetails.subjects ||
                      selectedTutorDetails.preferred_subjects ||
                      "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expected Salary</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedTutorDetails.expected_salary
                      ? `৳${selectedTutorDetails.expected_salary}`
                      : "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Availability</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedTutorDetails.availability || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutoring Style</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedTutorDetails.preferred_tutoring_style ||
                      "Not specified"}
                  </div>
                </div>
              </div>

              {/* Bio and Additional Info */}
              <div className="space-y-2">
                <Label>Bio</Label>
                <div className="p-2 bg-gray-50 rounded-md min-h-[80px]">
                  {selectedTutorDetails.bio || "No bio available"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Qualification</Label>
                <div className="p-2 bg-gray-50 rounded-md">
                  {selectedTutorDetails.qualification ||
                    selectedTutorDetails.educational_qualifications ||
                    "Not specified"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTutorDetails(false)}
            >
              Close
            </Button>
            {selectedTutorDetails && (
              <Button
                onClick={() => {
                  setSelectedTutor(selectedTutorDetails.id);
                  setShowTutorDetails(false);
                }}
              >
                Select This Tutor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignments Modal */}
      <Dialog
        open={showAssignmentsModal}
        onOpenChange={setShowAssignmentsModal}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Tutor Assignments</DialogTitle>
            <DialogDescription>
              Manage tutor assignments for this tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No assignments yet
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <Card key={assignment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">
                                {assignment.tutor_name || "Unknown Tutor"}
                              </h4>
                              <Badge
                                variant={
                                  assignment.status === "accepted"
                                    ? "default"
                                    : assignment.status === "rejected"
                                    ? "destructive"
                                    : assignment.status === "completed"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {assignment.status.charAt(0).toUpperCase() +
                                  assignment.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              {assignment.tutor_email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {assignment.tutor_email}
                                </div>
                              )}
                              {assignment.tutor_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {assignment.tutor_phone}
                                </div>
                              )}
                              {assignment.notes && (
                                <div className="mt-2 p-2 bg-gray-50 rounded">
                                  <span className="font-medium">Notes:</span>{" "}
                                  {assignment.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1">
                            {canDeleteRequests() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Status Update Buttons */}
                        <div className="flex gap-2 mt-3">
                          {assignment.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateAssignmentStatus(
                                    assignment.id,
                                    "accepted"
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateAssignmentStatus(
                                    assignment.id,
                                    "rejected"
                                  )
                                }
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {assignment.status === "accepted" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateAssignmentStatus(
                                  assignment.id,
                                  "completed"
                                )
                              }
                            >
                              Mark as Completed
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignmentsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// TutorCard Component
interface TutorCardProps {
  tutor: LocalTutor;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  request: TuitionRequest;
  isMatched?: boolean;
  isNearby?: boolean;
}

function TutorCard({
  tutor,
  isSelected,
  onSelect,
  onViewDetails,
  request,
  isMatched,
  isNearby,
}: TutorCardProps) {
  const getMatchScore = () => {
    let score = 0;

    // Subject match (40 points)
    const tutorSubjects = Array.isArray(tutor.subjects)
      ? tutor.subjects.join(",").toLowerCase()
      : (tutor.subjects || "").toLowerCase();
    const tutorPreferredSubjects = Array.isArray(tutor.preferred_subjects)
      ? tutor.preferred_subjects.join(",").toLowerCase()
      : (tutor.preferred_subjects || "").toLowerCase();

    if (
      tutorSubjects.includes(request.subject.toLowerCase()) ||
      tutorPreferredSubjects.includes(request.subject.toLowerCase())
    ) {
      score += 40;
    }

    // Location match (30 points)
    if (tutor.district === request.district) {
      score += 30;
    } else if (
      (tutor.location?.toLowerCase() || "").includes(
        request.district.toLowerCase()
      )
    ) {
      score += 20;
    }

    // Salary match (20 points)
    if (
      tutor.expected_salary &&
      tutor.expected_salary >= request.salaryRange.min &&
      tutor.expected_salary <= request.salaryRange.max
    ) {
      score += 20;
    }

    // Rating bonus (10 points)
    if (tutor.rating && tutor.rating >= 4.5) {
      score += 10;
    }

    return score;
  };

  const matchScore = getMatchScore();

  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? "border-green-500 bg-green-50"
          : "border-border hover:border-primary/50 hover:bg-muted/20"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
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

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{tutor.full_name}</h4>
              {tutor.verified ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600 text-xs"
                >
                  Verified
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-yellow-600 border-yellow-600 text-xs"
                >
                  Unverified
                </Badge>
              )}
              {(isMatched || isNearby) && (
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600 text-xs"
                >
                  {isMatched ? "Best Match" : "Nearby"}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{tutor.rating || 0}</span>
                {tutor.total_reviews > 0 && (
                  <span className="text-xs">
                    ({tutor.total_reviews} reviews)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {tutor.district || tutor.location || "Location N/A"}
                </span>
              </div>
              {tutor.hourly_rate && (
                <div className="flex items-center gap-1">
                  <span>৳{tutor.hourly_rate}/hr</span>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="truncate">
                  {tutor.subjects || tutor.preferred_subjects || "Subjects N/A"}
                </span>
              </div>
              {tutor.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="truncate">{tutor.education}</span>
                </div>
              )}
              {tutor.experience && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="truncate">{tutor.experience}</span>
                </div>
              )}
              {tutor.tutor_id && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-mono">
                    ID: {tutor.tutor_id}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {matchScore > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Match Score</div>
              <div className="text-lg font-semibold text-green-600">
                {matchScore}%
              </div>
            </div>
          )}

          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
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
      </div>
    </div>
  );
}
