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
import { taxonomyService, Category } from "@/services/taxonomyService";
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
  useCreateTutorRequestsMutation,
  useGetAllTutorRequestsQuery,
  useUpdateTutorRequestsMutation,
  useUpdateTutorRequestsStatusMutation,
} from "@/redux/features/tutorRequest/tutorRequestApi";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";

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
  area: string;
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

  const { data: DistrictData } = useGetAllDistrictsQuery(undefined);

  const { data: categoryData } = useGetAllCategoryQuery(undefined);

  // RTK Query mutations
  const [updateTutorRequestStatus] = useUpdateTutorRequestsStatusMutation();
  const [updateTutorRequest] = useUpdateTutorRequestsMutation();
  const [createTutorRequest] = useCreateTutorRequestsMutation();

  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TuitionRequest[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<TuitionRequest | null>(
    null
  );

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
  const [editFormData, setEditFormData] = useState<Partial<TuitionRequest>>({});

  // Create new job states
  const [createFormData, setCreateFormData] = useState({
    phoneNumber: "",
    studentGender: "",
    district: "",
    area: "",
    detailedLocation: "",
    selectedCategories: [] as string[],
    selectedSubjects: [] as string[],
    selectedClasses: [] as string[],
    tutorGenderPreference: "",
    isSalaryNegotiable: true,
    salaryRange: { min: 0, max: 0 },
    extraInformation: "",
    medium: "",
    numberOfStudents: 1,
    tutoringDays: 1,
    tutoringTime: "",
    tutoringDuration: "",
    tutoringType: "",
    adminNote: "",
  });

  const [isCreating, setIsCreating] = useState(false);
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [updateNoticeHistory, setUpdateNoticeHistory] = useState<
    UpdateNoticeHistory[]
  >([]);
  const [isLoadingUpdateHistory, setIsLoadingUpdateHistory] = useState(false);

  // Categories and filters
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // District এবং area state
  const [selectedDistrictForEdit, setSelectedDistrictForEdit] =
    useState<string>("");
  const [selectedDistrictForCreate, setSelectedDistrictForCreate] =
    useState<string>("");
  const [availableAreasForEdit, setAvailableAreasForEdit] = useState<string[]>(
    []
  );
  const [availableAreasForCreate, setAvailableAreasForCreate] = useState<
    string[]
  >([]);

  // Taxonomy data states
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);

  // Tutor assignment filters
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

  // Real-time functionality
  const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
    enabled: true,
    interval: 30000,
    lastUpdate: new Date(),
  });
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // District options
  const districtOptions =
    DistrictData?.data?.map((district: District) => ({
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
            studentName: req.studentName || "Anonymous Student",
            studentGender: req.studentGender,
            phoneNumber: req.phoneNumber,
            district: req.district,
            area: req.area,
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
          (request.area && request.area.toLowerCase().includes(term)) ||
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
        data: { status: newStatus.toLowerCase() },
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

  // Edit মডালের জন্য district change handler
  const handleEditDistrictChange = (district: string) => {
    setSelectedDistrictForEdit(district);
    handleEditFormChange("district", district);
    handleEditFormChange("area", ""); // Reset area when district changes
    setAvailableAreasForEdit([]);

    // Load areas for selected district
    if (DistrictData?.data) {
      const selectedDistrictData = DistrictData.data.find(
        (d: District) => d.name === district
      );
      if (selectedDistrictData) {
        const allAreas = [
          ...(selectedDistrictData.area || []),
          ...(selectedDistrictData.thana || []),
        ];
        setAvailableAreasForEdit(allAreas);
      }
    }
  };

  // Create মডালের জন্য district change handler
  const handleCreateDistrictChange = (district: string) => {
    setSelectedDistrictForCreate(district);
    setCreateFormData((prev) => ({
      ...prev,
      district: district,
      area: "",
    }));
    setAvailableAreasForCreate([]);

    // Load areas for selected district
    if (DistrictData?.data) {
      const selectedDistrictData = DistrictData.data.find(
        (d: District) => d.name === district
      );
      if (selectedDistrictData) {
        const allAreas = [
          ...(selectedDistrictData.area || []),
          ...(selectedDistrictData.thana || []),
        ];
        setAvailableAreasForCreate(allAreas);
      }
    }
  };

  // Handle create form change
  const handleCreateFormChange = (field: string, value: any) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle create salary range change
  const handleCreateSalaryRangeChange = (
    type: "min" | "max",
    value: number
  ) => {
    setCreateFormData((prev) => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange,
        [type]: value,
      },
    }));
  };

  // Handle category selection for create form
  const handleCreateCategorySelection = (categoryName: string) => {
    setCreateFormData((prev) => {
      const currentCategories = prev.selectedCategories || [];
      const categories = currentCategories.includes(categoryName)
        ? currentCategories.filter((c) => c !== categoryName)
        : [...currentCategories, categoryName];

      return {
        ...prev,
        selectedCategories: categories,
      };
    });
  };

  // Handle subject selection for create form
  const handleCreateSubjectSelection = (subjectName: string) => {
    setCreateFormData((prev) => {
      const currentSubjects = prev.selectedSubjects || [];
      const subjects = currentSubjects.includes(subjectName)
        ? currentSubjects.filter((s) => s !== subjectName)
        : [...currentSubjects, subjectName];

      return {
        ...prev,
        selectedSubjects: subjects,
      };
    });
  };

  // Handle class selection for create form
  const handleCreateClassSelection = (className: string) => {
    setCreateFormData((prev) => {
      const currentClasses = prev.selectedClasses || [];
      const classes = currentClasses.includes(className)
        ? currentClasses.filter((c) => c !== className)
        : [...currentClasses, className];

      return {
        ...prev,
        selectedClasses: classes,
      };
    });
  };

  // Fetch taxonomy for selected categories
  useEffect(() => {
    const fetchTaxonomy = async () => {
      if (createFormData.selectedCategories.length > 0) {
        setIsLoadingTaxonomy(true);
        try {
          // Here you would fetch subjects and classes based on selected categories
          // For now, we'll use mock data
          setSubjects([
            { id: 1, name: "Mathematics" },
            { id: 2, name: "Physics" },
            { id: 3, name: "Chemistry" },
            { id: 4, name: "Biology" },
            { id: 5, name: "English" },
            { id: 6, name: "Bangla" },
            { id: 7, name: "ICT" },
            { id: 8, name: "Accounting" },
          ]);

          setClassLevels([
            { id: 1, name: "Class 1" },
            { id: 2, name: "Class 2" },
            { id: 3, name: "Class 3" },
            { id: 4, name: "Class 4" },
            { id: 5, name: "Class 5" },
            { id: 6, name: "Class 6" },
            { id: 7, name: "Class 7" },
            { id: 8, name: "Class 8" },
            { id: 9, name: "Class 9" },
            { id: 10, name: "Class 10" },
            { id: 11, name: "Class 11" },
            { id: 12, name: "Class 12" },
            { id: 13, name: "University" },
          ]);
        } catch (error) {
          console.error("Error fetching taxonomy:", error);
        } finally {
          setIsLoadingTaxonomy(false);
        }
      } else {
        setSubjects([]);
        setClassLevels([]);
      }
    };

    fetchTaxonomy();
  }, [createFormData.selectedCategories]);

  // Handle create new job
  const handleCreateRequest = async () => {
    // Validate required fields
    const requiredFields = [
      "phoneNumber",
      "studentGender",
      "district",
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
      if (!createFormData[field as keyof typeof createFormData]) {
        toast({
          title: "Missing Information",
          description: `${field} is required`,
          variant: "destructive",
        });
        return;
      }
    }

    if (createFormData.selectedCategories.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one category",
        variant: "destructive",
      });
      return;
    }

    if (createFormData.selectedSubjects.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one subject",
        variant: "destructive",
      });
      return;
    }

    if (createFormData.selectedClasses.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select at least one class level",
        variant: "destructive",
      });
      return;
    }

    if (!createFormData.salaryRange.min || !createFormData.salaryRange.max) {
      toast({
        title: "Missing Information",
        description: "Please enter salary range",
        variant: "destructive",
      });
      return;
    }

    if (createFormData.salaryRange.min > createFormData.salaryRange.max) {
      toast({
        title: "Invalid Salary Range",
        description: "Minimum salary cannot be greater than maximum salary",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const submitData = {
        phoneNumber: createFormData.phoneNumber,
        studentGender: createFormData.studentGender,
        district: createFormData.district,
        area: createFormData.area,
        detailedLocation: createFormData.detailedLocation,
        selectedCategories: createFormData.selectedCategories,
        selectedSubjects: createFormData.selectedSubjects,
        selectedClasses: createFormData.selectedClasses,
        tutorGenderPreference: createFormData.tutorGenderPreference,
        isSalaryNegotiable: createFormData.isSalaryNegotiable,
        salaryRange: {
          min: createFormData.salaryRange.min,
          max: createFormData.salaryRange.max,
        },
        extraInformation: createFormData.extraInformation,
        medium: createFormData.medium,
        numberOfStudents: createFormData.numberOfStudents,
        tutoringDays: createFormData.tutoringDays,
        tutoringTime: createFormData.tutoringTime,
        tutoringDuration: createFormData.tutoringDuration,
        tutoringType: createFormData.tutoringType,
        adminNote: createFormData.adminNote,
        subject: createFormData.selectedSubjects[0] || "",
        studentClass: createFormData.selectedClasses[0] || "",
        userId: user?.id || null,
      };

      console.log("Submitting data:", submitData);

      const result = await createTutorRequest(submitData);

      if ("data" in result && result.data?.success) {
        toast({
          title: "Success",
          description: "Tuition request created successfully",
        });
        setShowSuccess(true);
        resetCreateForm();
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
    } finally {
      setIsCreating(false);
    }
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateFormData({
      phoneNumber: "",
      studentGender: "",
      district: "",
      area: "",
      detailedLocation: "",
      selectedCategories: [],
      selectedSubjects: [],
      selectedClasses: [],
      tutorGenderPreference: "",
      isSalaryNegotiable: true,
      salaryRange: { min: 0, max: 0 },
      extraInformation: "",
      medium: "",
      numberOfStudents: 1,
      tutoringDays: 1,
      tutoringTime: "",
      tutoringDuration: "",
      tutoringType: "",
      adminNote: "",
    });
    setSelectedDistrictForCreate("");
    setAvailableAreasForCreate([]);
  };

  // Close create modal and reset
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setShowSuccess(false);
    resetCreateForm();
  };

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

  // Open edit modal - district data setup
  const openEditRequestModal = (request: TuitionRequest) => {
    setSelectedRequest(request);

    // Set district for edit
    setSelectedDistrictForEdit(request.district || "");

    // Load areas for the district if available
    if (DistrictData?.data && request.district) {
      const selectedDistrictData = DistrictData.data.find(
        (d: District) => d.name === request.district
      );
      if (selectedDistrictData) {
        const allAreas = [
          ...(selectedDistrictData.area || []),
          ...(selectedDistrictData.thana || []),
        ];
        setAvailableAreasForEdit(allAreas);
      }
    }

    setEditFormData({
      studentName: request.studentName,
      studentGender: request.studentGender,
      phoneNumber: request.phoneNumber,
      district: request.district,
      area: request.area,
      detailedLocation: request.detailedLocation,
      medium: request.medium,
      subject: request.subject,
      studentClass: request.studentClass,
      tutoringType: request.tutoringType,
      numberOfStudents: request.numberOfStudents,
      tutoringDays: request.tutoringDays,
      tutoringTime: request.tutoringTime,
      tutoringDuration: request.tutoringDuration,
      tutorGenderPreference: request.tutorGenderPreference,
      isSalaryNegotiable: request.isSalaryNegotiable,
      salaryRange: request.salaryRange,
      extraInformation: request.extraInformation,
      adminNote: request.adminNote,
      status: request.status,
    });
    setShowEditModal(true);
  };

  // Handle edit form change
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle edit salary range change
  const handleEditSalaryRangeChange = (type: "min" | "max", value: number) => {
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
    if (!selectedRequest) return;

    setIsUpdating(true);
    try {
      const updatePayload = {
        ...editFormData,
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

    // Handle form field changes
    const handleChange = (field: keyof any, value: any) => {
      setCreateFormData((prev:any) => ({
        ...prev,
        [field]: value,
      }));
    };
  

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <School className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-gray-800">Subjects</h3>
                <p className="text-sm text-gray-600">
                  {createFormData.selectedSubjects.join(", ")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-medium text-gray-800">Classes</h3>
                <p className="text-sm text-gray-600">
                  {createFormData.selectedClasses.join(", ")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-medium text-gray-800">Location</h3>
                <p className="text-sm text-gray-600">
                  {createFormData.area}, {createFormData.district}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium text-gray-800">Salary Range</h3>
                <p className="text-sm text-gray-600">
                  ৳{createFormData.salaryRange.min.toLocaleString()} - ৳
                  {createFormData.salaryRange.max.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-medium text-gray-800">Schedule</h3>
                <p className="text-sm text-gray-600">
                  {createFormData.tutoringDays} days/week at{" "}
                  {createFormData.tutoringTime}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <User className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-medium text-gray-800">Students</h3>
                <p className="text-sm text-gray-600">
                  {createFormData.numberOfStudents} student(s)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="font-medium text-gray-800">Medium</h3>
                <p className="text-sm text-gray-600">{createFormData.medium}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                setShowSuccess(false);
                setShowCreateModal(false);
                resetCreateForm();
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Close
            </Button>
            <Button variant="outline" onClick={() => setShowCreateModal(true)}>
              Create Another Request
            </Button>
          </CardFooter>
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

      {/* Create New Job Modal */}
      <Dialog open={showCreateModal} onOpenChange={handleCloseCreateModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tuition Request</DialogTitle>
            <DialogDescription>
              Create a new tuition request for students
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-phoneNumber">Phone Number *</Label>
                  <Input
                    id="create-phoneNumber"
                    value={createFormData.phoneNumber}
                    onChange={(e) =>
                      handleCreateFormChange("phoneNumber", e.target.value)
                    }
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-studentGender">Student Gender *</Label>
                  <Select
                    value={createFormData.studentGender}
                    onValueChange={(value) =>
                      handleCreateFormChange("studentGender", value)
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
              </div>
            </div>

            {/* Location Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-district">District *</Label>
                  <Select
                    value={createFormData.district}
                    onValueChange={(value) => handleCreateDistrictChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {districtOptions.map((district: any) => (
                        <SelectItem key={district.value} value={district.value}>
                          {district.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-area">Area *</Label>
                  {availableAreasForCreate.length > 0 ? (
                    <Select
                      value={createFormData.area}
                      onValueChange={(value) =>
                        handleCreateFormChange("area", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select area" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableAreasForCreate.map((area) => (
                          <SelectItem key={area} value={area}>
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="create-area"
                      value={createFormData.area}
                      onChange={(e) =>
                        handleCreateFormChange("area", e.target.value)
                      }
                      placeholder="Enter area"
                      required
                      disabled={!createFormData.district}
                    />
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="create-detailedLocation">
                    Detailed Location (Optional)
                  </Label>
                  <Input
                    id="create-detailedLocation"
                    value={createFormData.detailedLocation}
                    onChange={(e) =>
                      handleCreateFormChange("detailedLocation", e.target.value)
                    }
                    placeholder="Enter detailed location"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Academic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-medium">Medium *</Label>
                  <Select
                    value={createFormData.medium}
                    onValueChange={(value) =>
                      handleCreateFormChange("medium", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select medium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bangla">Bangla</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutoringType">Tutoring Type *</Label>
                  <Select
                    value={createFormData.tutoringType}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutoringType", value)
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
            </div>

            {/* Category, Subjects, and Classes Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Category, Subjects & Classes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-category">Category *</Label>
                  <Select
                    value=""
                    onValueChange={(value) => {
                      if (
                        value &&
                        !createFormData.selectedCategories.includes(value)
                      ) {
                        handleCreateCategorySelection(value);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {createFormData.selectedCategories.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {createFormData.selectedCategories.map(
                        (category, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            <span>{category}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCreateCategorySelection(category)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-subjects">Subjects *</Label>
                  {isLoadingTaxonomy ? (
                    <div className="text-center py-2 text-sm">
                      Loading subjects...
                    </div>
                  ) : (
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (
                          value &&
                          !createFormData.selectedSubjects.includes(value)
                        ) {
                          handleCreateSubjectSelection(value);
                        }
                      }}
                      disabled={!createFormData.selectedCategories.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subjects" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {createFormData.selectedSubjects.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {createFormData.selectedSubjects.map((subject, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                        >
                          <span>{subject}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCreateSubjectSelection(subject)
                            }
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-classes">Class Levels *</Label>
                  {isLoadingTaxonomy ? (
                    <div className="text-center py-2 text-sm">
                      Loading class levels...
                    </div>
                  ) : (
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (
                          value &&
                          !createFormData.selectedClasses.includes(value)
                        ) {
                          handleCreateClassSelection(value);
                        }
                      }}
                      disabled={!createFormData.selectedCategories.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class levels" />
                      </SelectTrigger>
                      <SelectContent>
                        {classLevels.map((classLevel) => (
                          <SelectItem
                            key={classLevel.id}
                            value={classLevel.name}
                          >
                            {classLevel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {createFormData.selectedClasses.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {createFormData.selectedClasses.map(
                        (className, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-sm"
                          >
                            <span>{className}</span>
                            <button
                              type="button"
                              onClick={() =>
                                handleCreateClassSelection(className)
                              }
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-numberOfStudents">
                    Number of Students *
                  </Label>
                  <Select
                    value={createFormData.numberOfStudents.toString()}
                    onValueChange={(value) =>
                      handleCreateFormChange(
                        "numberOfStudents",
                        parseInt(value)
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Student</SelectItem>
                      <SelectItem value="2">2 Students</SelectItem>
                      <SelectItem value="3">3 Students</SelectItem>
                      <SelectItem value="4">4 Students</SelectItem>
                      <SelectItem value="5">5+ Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Tutoring Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tutoring Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-tutoringDuration">
                    Duration per Session *
                  </Label>
                  <Select
                    value={createFormData.tutoringDuration}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutoringDuration", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                      <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                      <SelectItem value="3 hours">3 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutoringDays">Days per Week *</Label>
                  <Select
                    value={createFormData.tutoringDays.toString()}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutoringDays", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day</SelectItem>
                      <SelectItem value="2">2 Days</SelectItem>
                      <SelectItem value="3">3 Days</SelectItem>
                      <SelectItem value="4">4 Days</SelectItem>
                      <SelectItem value="5">5 Days</SelectItem>
                      <SelectItem value="6">6 Days</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutoringTime">Preferred Time *</Label>
                  <Input
                    id="tutoringTime"
                    type="time"
                    value={createFormData.tutoringTime}
                    onChange={(e) =>
                      handleChange("tutoringTime", e.target.value)
                    }
                    className="w-full h-10 sm:h-11"
                  />
                  <p className="text-xs text-gray-500">Tutoring Time *</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-tutorGenderPreference">
                    Preferred Tutor Gender *
                  </Label>
                  <Select
                    value={createFormData.tutorGenderPreference}
                    onValueChange={(value) =>
                      handleCreateFormChange("tutorGenderPreference", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any">Any</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Salary Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Salary Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="create-salaryMin">Minimum Salary (৳) *</Label>
                  <Input
                    id="create-salaryMin"
                    type="number"
                    min="0"
                    value={createFormData.salaryRange.min}
                    onChange={(e) =>
                      handleCreateSalaryRangeChange(
                        "min",
                        parseInt(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-salaryMax">Maximum Salary (৳) *</Label>
                  <Input
                    id="create-salaryMax"
                    type="number"
                    min="0"
                    value={createFormData.salaryRange.max}
                    onChange={(e) =>
                      handleCreateSalaryRangeChange(
                        "max",
                        parseInt(e.target.value)
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2 flex items-center gap-2">
                  <Checkbox
                    id="create-isSalaryNegotiable"
                    checked={createFormData.isSalaryNegotiable}
                    onCheckedChange={(checked) =>
                      handleCreateFormChange("isSalaryNegotiable", checked)
                    }
                  />
                  <Label
                    htmlFor="create-isSalaryNegotiable"
                    className="cursor-pointer"
                  >
                    Salary is Negotiable
                  </Label>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Additional Information</h3>
              <div className="space-y-2">
                <Label htmlFor="create-extraInformation">
                  Extra Information (Optional)
                </Label>
                <Textarea
                  id="create-extraInformation"
                  value={createFormData.extraInformation}
                  onChange={(e) =>
                    handleCreateFormChange("extraInformation", e.target.value)
                  }
                  placeholder="Any additional information..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-adminNote">Admin Notes (Optional)</Label>
                <Textarea
                  id="create-adminNote"
                  value={createFormData.adminNote}
                  onChange={(e) =>
                    handleCreateFormChange("adminNote", e.target.value)
                  }
                  placeholder="Internal admin notes..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCreateModal}>
              Cancel
            </Button>
            <Button onClick={handleCreateRequest} disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tuition Request</DialogTitle>
            <DialogDescription>
              Update the details of the tuition request
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-studentGender">Student Gender</Label>
                    <Select
                      value={editFormData.studentGender || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("studentGender", value)
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                    <Input
                      id="edit-phoneNumber"
                      value={editFormData.phoneNumber || ""}
                      onChange={(e) =>
                        handleEditFormChange("phoneNumber", e.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-district">District</Label>
                    <Select
                      value={editFormData.district || ""}
                      onValueChange={(value) => handleEditDistrictChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districtOptions.map((district: any) => (
                          <SelectItem
                            key={district.value}
                            value={district.value}
                          >
                            {district.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-area">Area</Label>
                    {availableAreasForEdit.length > 0 ? (
                      <Select
                        value={editFormData.area || ""}
                        onValueChange={(value) =>
                          handleEditFormChange("area", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select area" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableAreasForEdit.map((area) => (
                            <SelectItem key={area} value={area}>
                              {area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id="edit-area"
                        value={editFormData.area || ""}
                        onChange={(e) =>
                          handleEditFormChange("area", e.target.value)
                        }
                        placeholder="Enter area"
                      />
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="edit-detailedLocation">
                      Detailed Location
                    </Label>
                    <Input
                      id="edit-detailedLocation"
                      value={editFormData.detailedLocation || ""}
                      onChange={(e) =>
                        handleEditFormChange("detailedLocation", e.target.value)
                      }
                      placeholder="Enter detailed location"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-medium">Medium</Label>
                    <Select
                      value={editFormData.medium || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("medium", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bangla">Bangla</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Input
                      id="edit-subject"
                      value={editFormData.subject || ""}
                      onChange={(e) =>
                        handleEditFormChange("subject", e.target.value)
                      }
                      placeholder="Enter subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-studentClass">Class Level</Label>
                    <Input
                      id="edit-studentClass"
                      value={editFormData.studentClass || ""}
                      onChange={(e) =>
                        handleEditFormChange("studentClass", e.target.value)
                      }
                      placeholder="Enter class level"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringType">Tutoring Type</Label>
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
              </div>

              {/* Tutoring Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tutoring Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-numberOfStudents">
                      Number of Students
                    </Label>
                    <Input
                      id="edit-numberOfStudents"
                      type="number"
                      min="1"
                      value={editFormData.numberOfStudents || 1}
                      onChange={(e) =>
                        handleEditFormChange(
                          "numberOfStudents",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringDays">Days per Week</Label>
                    <Input
                      id="edit-tutoringDays"
                      type="number"
                      min="1"
                      max="7"
                      value={editFormData.tutoringDays || 1}
                      onChange={(e) =>
                        handleEditFormChange(
                          "tutoringDays",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringTime">Preferred Time</Label>
                    <Input
                      id="edit-tutoringTime"
                      value={editFormData.tutoringTime || ""}
                      onChange={(e) =>
                        handleEditFormChange("tutoringTime", e.target.value)
                      }
                      placeholder="e.g., 4:00 PM - 6:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutoringDuration">
                      Duration per Session
                    </Label>
                    <Select
                      value={editFormData.tutoringDuration || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("tutoringDuration", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                        <SelectItem value="3 hours">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Tutor Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tutor Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-tutorGenderPreference">
                      Preferred Tutor Gender
                    </Label>
                    <Select
                      value={editFormData.tutorGenderPreference || ""}
                      onValueChange={(value) =>
                        handleEditFormChange("tutorGenderPreference", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Any">Any</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaryMin">Minimum Salary (৳)</Label>
                    <Input
                      id="edit-salaryMin"
                      type="number"
                      min="0"
                      value={editFormData.salaryRange?.min || 0}
                      onChange={(e) =>
                        handleEditSalaryRangeChange(
                          "min",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaryMax">Maximum Salary (৳)</Label>
                    <Input
                      id="edit-salaryMax"
                      type="number"
                      min="0"
                      value={editFormData.salaryRange?.max || 0}
                      onChange={(e) =>
                        handleEditSalaryRangeChange(
                          "max",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 flex items-center gap-2 mt-6">
                    <Switch
                      id="edit-isSalaryNegotiable"
                      checked={editFormData.isSalaryNegotiable || false}
                      onCheckedChange={(checked) =>
                        handleEditFormChange("isSalaryNegotiable", checked)
                      }
                    />
                    <Label
                      htmlFor="edit-isSalaryNegotiable"
                      className="cursor-pointer"
                    >
                      Salary is Negotiable
                    </Label>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Additional Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="edit-extraInformation">
                    Extra Information
                  </Label>
                  <Textarea
                    id="edit-extraInformation"
                    value={editFormData.extraInformation || ""}
                    onChange={(e) =>
                      handleEditFormChange("extraInformation", e.target.value)
                    }
                    placeholder="Any additional information..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-adminNote">Admin Notes</Label>
                  <Textarea
                    id="edit-adminNote"
                    value={editFormData.adminNote || ""}
                    onChange={(e) =>
                      handleEditFormChange("adminNote", e.target.value)
                    }
                    placeholder="Internal admin notes..."
                    rows={2}
                  />
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Status</h3>
                <div className="flex gap-2">
                  {(["Active", "Inactive", "Completed", "Assign"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          editFormData.status === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleEditFormChange("status", status)}
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

      {/* Details Modal */}
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
                    {selectedRequest.phoneNumber}
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
                    {selectedRequest.studentGender}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Medium</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.medium}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.subject || "Not specified"}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Class Level</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.studentClass || "Not specified"}
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
                    {selectedRequest.tutorGenderPreference}
                  </div>
                </div>
              </div>

              {/* Tutoring Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Tutoring Days</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedRequest.tutoringDays} days/week
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tutoring Time</Label>
                  <div className="p-2 bg-gray-50 rounded-md flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedRequest.tutoringTime}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Number of Students</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.numberOfStudents}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Duration per Session</Label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {selectedRequest.tutoringDuration}
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
                  {selectedRequest.isSalaryNegotiable && (
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

      {/* Other modals (Assign Tutor, Tutor Details, Assignments) remain the same */}
      {/* ... existing code for these modals ... */}
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
      tutorSubjects.includes(request.subject?.toLowerCase() || "") ||
      tutorPreferredSubjects.includes(request.subject?.toLowerCase() || "")
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
                {tutor.total_reviews! > 0 && (
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
