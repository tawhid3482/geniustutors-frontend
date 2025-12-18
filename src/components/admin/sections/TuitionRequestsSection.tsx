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
  PlusCircle,
  Edit,
  CheckCircle2,
  School,
} from "lucide-react";
import {
  tutorRequestService,
  TutorAssignment,
  UpdateNoticeHistory,
} from "@/services/tutorRequestService";
import tutorService from "@/services/tutorService";
import { Textarea } from "@/components/ui/textarea";

import mediumOptions from "@/data/mediumOptions.json";
import { SUBJECT_OPTIONS, CLASS_LEVELS } from "@/data/mockData";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { useRole } from "@/contexts/RoleContext";
import {
  useCreateTutorRequestsMutation,
  useGetAllTutorRequestsQuery,
  useUpdateTutorRequestsMutation,
  useUpdateTutorRequestsStatusMutation,
} from "@/redux/features/tutorRequest/tutorRequestApi";
import { Switch } from "@/components/ui/switch";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";

// ✅ FIXED: Dialog import একই জায়গা থেকে করুন
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import modal components - আলাদা ফাইল থেকে
import { EditRequestModal } from "./EditTutorRequest";
import { DetailsModal } from "./DetailsModal";
import { AssignTutorModal } from "./AssignTutorModal";
import { CreateRequestModal } from "./CreateRequestTutorModal";

// Define types based on your backend response
interface District {
  id: string;
  name: string;
  thana: string[];
  area: string[];
  createdAt: string;
  color?: string;
}

interface TuitionRequest {
  id: string;
  tutorRequestId?: string;
  studentName?: string;
  studentGender: string;
  phoneNumber: string;
  district: string;
  thana: string;
  area: string | string[];
  detailedLocation?: string;
  medium: string;
  subject?: string;
  studentClass?: string;
  selectedCategories?: string[];
  selectedSubjects?: string[];
  selectedClasses?: string[];
  tutoringType: string;
  numberOfStudents: number;
  tutoringDays: number;
  tutoringTime: string;
  tutoringDuration: string;
  tutorGenderPreference: string;
  isSalaryNegotiable: boolean;
  salaryRange: {
    min: number;
    max: number;
  };
  extraInformation?: string;
  adminNote?: string;
  status: "Active" | "Inactive" | "Completed" | "Assign";
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  assignments: TutorAssignment[];
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

  // ✅ সবচেয়ে প্রথমে mount state যোগ করুন
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // RTK Query hooks
  const {
    data: tutorRequestsData,
    isLoading: rtkLoading,
    error: rtkError,
    refetch: refetchRTK,
    isFetching: rtkFetching,
  } = useGetAllTutorRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true,
    pollingInterval: 30000,
  });

  const { data: DistrictData, isLoading: isDistrictLoading } = useGetAllDistrictsQuery(undefined);

  const { data: categoryData } = useGetAllCategoryQuery(undefined);

  // RTK Query mutations
  const [updateTutorRequestStatus] = useUpdateTutorRequestsStatusMutation();
  const [updateTutorRequest] = useUpdateTutorRequestsMutation();
  const [createTutorRequest, { isLoading: isCreating }] = useCreateTutorRequestsMutation();

  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TuitionRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<TuitionRequest | null>(null);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Tutor assignment states
  const [tutors, setTutors] = useState<LocalTutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<LocalTutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>("");
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [createDemoClass, setCreateDemoClass] = useState(false);
  const [demoDate, setDemoDate] = useState("");
  const [demoDuration, setDemoDuration] = useState(30);
  const [demoNotes, setDemoNotes] = useState("");

  // Edit states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<any>>({});

  // Create new job states
  const [categories, setCategories] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);

  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [updateNoticeHistory, setUpdateNoticeHistory] = useState<UpdateNoticeHistory[]>([]);
  const [isLoadingUpdateHistory, setIsLoadingUpdateHistory] = useState(false);

  // Tutor assignment filters
  const [tutorFilters, setTutorFilters] = useState<TutorFilter>({});
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<LocalTutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<"all" | "matched" | "nearby">("all");
  const [tutorSearchTerm, setTutorSearchTerm] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [sendSMSNotification, setSendSMSNotification] = useState(true);

  // Real-time functionality
  const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
    enabled: true,
    interval: 30000,
    lastUpdate: new Date(),
  });
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // District options
  const districtOptions = isDistrictLoading 
    ? [] 
    : DistrictData?.data?.map((district: District) => ({
        value: district.name,
        label: district.name,
      })) || [];

  // Check if current user can delete requests
  const canDeleteRequests = () => {
    return user?.role === "admin";
  };

  // Format requests from API
  useEffect(() => {
    if (tutorRequestsData) {
      if (tutorRequestsData.success && Array.isArray(tutorRequestsData.data)) {
        const formattedRequests: TuitionRequest[] = tutorRequestsData.data.map(
          (req: any) => ({
            id: req.id,
            tutorRequestId: req.tutorRequestId,
            studentName: req.user?.fullName || "Anonymous Student",
            studentGender: req.studentGender,
            phoneNumber: req.phoneNumber,
            district: req.district,
            area: Array.isArray(req.area) ? req.area.join(", ") : req.area,
            detailedLocation: req.detailedLocation,
            medium: req.medium,
            subject:
              req.subject ||
              (Array.isArray(req.selectedSubjects)
                ? req.selectedSubjects.join(", ")
                : "Not specified"),
            studentClass:
              req.studentClass ||
              (Array.isArray(req.selectedClasses)
                ? req.selectedClasses.join(", ")
                : "Not specified"),
            selectedCategories: req.selectedCategories || [],
            selectedSubjects: req.selectedSubjects || [],
            selectedClasses: req.selectedClasses || [],
            tutoringType: req.tutoringType,
            numberOfStudents: req.numberOfStudents,
            tutoringDays: req.tutoringDays,
            tutoringTime: req.tutoringTime,
            tutoringDuration: req.tutoringDuration,
            tutorGenderPreference: req.tutorGenderPreference,
            isSalaryNegotiable: req.isSalaryNegotiable || false,
            salaryRange: req.salaryRange || { min: 0, max: 0 },
            extraInformation: req.extraInformation,
            adminNote: req.adminNote,
            status: req.status,
            createdAt: req.createdAt,
            updatedAt: req.updatedAt,
            user: req.user,
            assignments: req.assignments || [],
          })
        );

        setRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
      }
    }
  }, [tutorRequestsData]);

  // Filter requests
  useEffect(() => {
    let filtered = [...requests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          (request.tutorRequestId &&
            request.tutorRequestId.toLowerCase().includes(term)) ||
          (request.phoneNumber &&
            request.phoneNumber.toLowerCase().includes(term)) ||
          (request.district && request.district.toLowerCase().includes(term)) ||
          (request.area && (Array.isArray(request.area) ? request.area.join(", ") : request.area).toLowerCase().includes(term)) ||
          (request.subject && request.subject.toLowerCase().includes(term)) ||
          (request.studentName &&
            request.studentName.toLowerCase().includes(term))
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (request) => request.status.toLowerCase() === statusFilter
      );
    }

    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, requests]);

  // Handle status change
  const handleStatusChange = async (
    requestId: string,
    newStatus: "Active" | "Inactive" | "Completed" | "Assign"
  ) => {
    try {
      const response = await updateTutorRequestStatus({
        id: requestId,
        data: { status: newStatus },
      }).unwrap();

      if (response.success) {
        toast({
          title: "Status Updated",
          description: `Request status has been updated to ${newStatus}`,
        });
        await refetchRTK();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Load categories
  useEffect(() => {
    if (categoryData?.data && Array.isArray(categoryData.data)) {
      const processedCategories = categoryData.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        subjects: category.subjects || [],
        classLevels: category.classLevels || [],
      }));
      setCategories(processedCategories);
    }
  }, [categoryData]);

  // Fetch update notice history
  const fetchUpdateNoticeHistory = useCallback(async (requestId: string) => {
    try {
      setIsLoadingUpdateHistory(true);
      const response = await tutorRequestService.getUpdateNoticeHistory(
        requestId
      );
      if (response.success) {
        setUpdateNoticeHistory(response.data);
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
    fetchUpdateNoticeHistory(request.id);
  };

  // Open edit request modal
  const openEditRequestModal = (request: TuitionRequest) => {
    try {
      setSelectedRequest(request);
      
      // Initialize edit form data
      const initialEditFormData = {
        studentName: request.studentName || "",
        studentGender: request.studentGender || "",
        phoneNumber: request.phoneNumber || "",
        district: request.district || "",
        thana: request.thana || "",
        area: request.area || "",
        detailedLocation: request.detailedLocation || "",
        medium: request.medium || "",
        subject: request.subject || "",
        studentClass: request.studentClass || "",
        tutoringType: request.tutoringType || "",
        numberOfStudents: request.numberOfStudents || 1,
        tutoringDays: request.tutoringDays || 1,
        tutoringTime: request.tutoringTime || "",
        tutoringDuration: request.tutoringDuration || "",
        tutorGenderPreference: request.tutorGenderPreference || "",
        isSalaryNegotiable: request.isSalaryNegotiable || false,
        salaryRange: request.salaryRange || { min: 0, max: 0 },
        extraInformation: request.extraInformation || "",
        adminNote: request.adminNote || "",
        status: request.status || "Active",
      };

      setEditFormData(initialEditFormData);
      setShowEditModal(true);
    } catch (error) {
      console.error("Error opening edit modal:", error);
      toast({
        title: "Error",
        description: "Failed to open edit modal",
        variant: "destructive",
      });
    }
  };

  // Handle update request
  const handleUpdateRequest = async (formData: any) => {
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      const updatePayload = {
        ...formData,
        selectedCategories: selectedRequest.selectedCategories,
        selectedSubjects: selectedRequest.selectedSubjects,
        selectedClasses: selectedRequest.selectedClasses,
      };

      const response = await updateTutorRequest({
        id: selectedRequest.id,
        data: updatePayload,
      }).unwrap();

      if (response.success) {
        toast({
          title: "Success",
          description: "Tuition request updated successfully",
        });
        await refetchRTK();
        setShowEditModal(false);
      }
    } catch (error: any) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update request",
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
        description: "Only administrators can delete requests",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this tuition request?"))
      return;

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
        await refetchRTK();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete request",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch tutors
  const fetchTutors = useCallback(
    async (filters?: TutorFilter) => {
      try {
        setIsLoadingTutors(true);
        const response = await tutorService.getAllTutors(filters);
        if (response.success && response.data) {
          setTutors(response.data as LocalTutor[]);
          setFilteredTutors(response.data as LocalTutor[]);
        }
      } catch (error) {
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

  // Open assign tutor modal
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
      toast({
        title: "Error",
        description: "Failed to load tutors",
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

      if (response.success) {
        toast({
          title: "Success",
          description: "Tutor assigned successfully",
        });
        setShowAssignTutorModal(false);
        await refetchRTK();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to assign tutor",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // View assignments
  const viewAssignments = async (request: TuitionRequest) => {
    setSelectedRequest(request);
    try {
      const response = await tutorRequestService.getTutorAssignments(
        request.id
      );
      if (response.success) {
        setAssignments(response.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch assignments",
        variant: "destructive",
      });
    } finally {
      setShowAssignmentsModal(true);
    }
  };

  // Handle create new job
  const handleCreateRequest = async (formData: any) => {
    // Validate required fields
    const requiredFields = [
      "phoneNumber",
      "studentGender",
      "district",
      "thana",
      "area",
      "medium",
      "tutoringType",
      "tutoringDuration",
      "tutoringDays",
      "tutoringTime",
      "numberOfStudents",
      "tutorGenderPreference",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast({
          title: "Missing Information",
          description: `${field} is required`,
          variant: "destructive",
        });
        return;
      }
    }

    if (formData.selectedCategories.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    if (formData.selectedSubjects.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one subject",
        variant: "destructive",
      });
      return;
    }

    if (formData.selectedClasses.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one class level",
        variant: "destructive",
      });
      return;
    }

    if (!formData.salaryRange.min || !formData.salaryRange.max) {
      toast({
        title: "Missing Information",
        description: "Please enter salary range",
        variant: "destructive",
      });
      return;
    }

    if (formData.salaryRange.min > formData.salaryRange.max) {
      toast({
        title: "Invalid Salary Range",
        description: "Minimum salary cannot be greater than maximum salary",
        variant: "destructive",
      });
      return;
    }

    try {
      const submitData = {
        phoneNumber: formData.phoneNumber,
        studentGender: formData.studentGender,
        district: formData.district,
        thana: formData.thana,
        area: formData.area,
        detailedLocation: formData.detailedLocation,
        selectedCategories: formData.selectedCategories,
        selectedSubjects: formData.selectedSubjects,
        selectedClasses: formData.selectedClasses,
        tutorGenderPreference: formData.tutorGenderPreference,
        isSalaryNegotiable: formData.isSalaryNegotiable,
        salaryRange: {
          min: formData.salaryRange.min,
          max: formData.salaryRange.max,
        },
        extraInformation: formData.extraInformation,
        medium: formData.medium,
        numberOfStudents: formData.numberOfStudents,
        tutoringDays: formData.tutoringDays,
        tutoringTime: formData.tutoringTime,
        tutoringDuration: formData.tutoringDuration,
        tutoringType: formData.tutoringType,
        adminNote: formData.adminNote,
        subject: formData.selectedSubjects[0] || "",
        studentClass: formData.selectedClasses[0] || "",
        userId: user?.id || null,
      };

      const result = await createTutorRequest(submitData);

      if ("data" in result && result.data?.success) {
        toast({
          title: "Success",
          description: "Tuition request created successfully",
        });
        setShowSuccess(true);
        setShowCreateModal(false);
        await refetchRTK();
      } else {
        const errorData = (result.error as any)?.data;
        const errorMessage =
          errorData?.message ||
          errorData?.error?.message ||
          "Failed to create tutor request";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error creating tutor request:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create tutor request",
        variant: "destructive",
      });
    }
  };

  // Close create modal and reset
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setShowSuccess(false);
  };

  // View tutor details
  const viewTutorDetails = (tutorId: string) => {
    const tutor = tutors.find((t) => t.id === tutorId);
    if (tutor) {
      setSelectedTutorDetails(tutor);
      setShowTutorDetails(true);
    }
  };

  // Manual refresh
  const handleManualRefresh = async () => {
    try {
      await refetchRTK();
      setRealTimeConfig((prev) => ({ ...prev, lastUpdate: new Date() }));
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data",
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
        return <Badge>{status}</Badge>;
    }
  };

  // Real-time updates
  useEffect(() => {
    if (realTimeConfig.enabled) {
      realTimeIntervalRef.current = setInterval(() => {
        refetchRTK();
        setRealTimeConfig((prev) => ({ ...prev, lastUpdate: new Date() }));
      }, realTimeConfig.interval);
    }

    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [realTimeConfig.enabled, realTimeConfig.interval, refetchRTK]);

  const isLoading = rtkLoading || rtkFetching;

  // ✅ FIX: Page load করার আগে check করুন
  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Tuition Requests
              </h2>
              <p className="text-white/90 mt-1">
                Loading...
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // Success view
  if (showSuccess) {
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
            </div>
          </div>
        </div>

        <Card className="w-full bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">
              Thank you for submitting tutor request!
            </CardTitle>
            <CardDescription className="text-lg text-green-700 mt-2">
              Your tutor request has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Our team will review your request and match you with suitable
              tutors. You will receive notifications when tutors respond to your
              request.
            </p>
            <div className="flex flex-col items-center justify-center">
              <Button
                onClick={() => {
                  setShowSuccess(false);
                  setShowCreateModal(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                Back to Tuition Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
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
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-white text-green-600 hover:bg-white/90"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
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
                  placeholder="Search by ID, Phone, Location, Name..."
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
                    <TableHead>Student</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div className="text-sm">
                          {request.tutorRequestId || request.id.slice(-8)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{request.studentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.studentGender}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {request.phoneNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        {request.district}
                        {request.area ? `, ${request.area}` : ""}
                      </TableCell>
                      <TableCell>
                        {request.subject || "Not specified"}
                      </TableCell>
                      <TableCell>{request.tutoringType}</TableCell>
                      <TableCell>
                        {request.salaryRange.min === request.salaryRange.max
                          ? `৳${request.salaryRange.min}`
                          : `৳${request.salaryRange.min} - ৳${request.salaryRange.max}`}
                      </TableCell>
                      <TableCell>{renderStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </TableCell>
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
                              <Edit className="h-4 w-4 mr-2" />
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

      {/* Modal Components */}
      <CreateRequestModal
        open={showCreateModal}
        onOpenChange={handleCloseCreateModal}
        onCreate={handleCreateRequest}
        isCreating={isCreating}
        categories={categories}
        districtOptions={districtOptions}
        DistrictData={DistrictData}
        isDistrictLoading={isDistrictLoading}
      />

      <EditRequestModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onUpdate={handleUpdateRequest}
        isUpdating={isUpdating}
        selectedRequest={selectedRequest}
        districtOptions={districtOptions}
        DistrictData={DistrictData}
        isDistrictLoading={isDistrictLoading}
      />

      <DetailsModal
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
        selectedRequest={selectedRequest}
        updateNoticeHistory={updateNoticeHistory}
        isLoadingUpdateHistory={isLoadingUpdateHistory}
      />

      <AssignTutorModal
        open={showAssignTutorModal}
        onOpenChange={setShowAssignTutorModal}
        selectedRequest={selectedRequest}
        tutors={tutors}
        filteredTutors={filteredTutors}
        selectedTutor={selectedTutor}
        onSelectTutor={setSelectedTutor}
        assignmentNotes={assignmentNotes}
        onNotesChange={setAssignmentNotes}
        onAssign={handleAssignTutor}
        isAssigning={isAssigning}
        isLoadingTutors={isLoadingTutors}
      />

      {/* Assignments Modal */}
      {/* {showAssignmentsModal && (
        <Dialog open={showAssignmentsModal} onOpenChange={setShowAssignmentsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tutor Assignments</DialogTitle>
              <DialogDescription>
                View all tutor assignments for this request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {assignments.length === 0 ? (
                <p className="text-muted-foreground">No assignments found</p>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{assignment.tutorName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {assignment.tutorEmail}
                        </p>
                      </div>
                      <Badge>{assignment.status}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
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
      )} */}

      {/* Tutor Details Modal */}
      {showTutorDetails && (
        <Dialog open={showTutorDetails} onOpenChange={setShowTutorDetails}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tutor Details</DialogTitle>
              <DialogDescription>
                Detailed information about the tutor
              </DialogDescription>
            </DialogHeader>
            {selectedTutorDetails && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    {selectedTutorDetails.avatar_url ? (
                      <img
                        src={selectedTutorDetails.avatar_url}
                        alt={selectedTutorDetails.full_name}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedTutorDetails.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedTutorDetails.rating || 0}</span>
                      <span className="text-muted-foreground">
                        ({selectedTutorDetails.total_reviews || 0} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                {/* More details... */}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTutorDetails(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}