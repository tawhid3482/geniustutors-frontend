"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import mediumOptions from "@/data/mediumOptions.json";
import { CLASS_LEVELS, SUBJECT_OPTIONS } from "@/data/mockData";

import { Checkbox } from "@/components/ui/checkbox";
import {
  MapPin,
  Clock,
  DollarSign,
  BookOpen,
  Search,
  LayoutGrid,
  List,
  Filter,
  RefreshCw,
  User,
  Users,
  Home,
  Monitor,
  Globe,
  AlertTriangle,
  Wifi,
  Sparkles,
  GraduationCap,
  BookType,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";
import { tuitionJobsService, TuitionJob } from "@/services/tuitionJobsService";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams, useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";
import { useGetAllAreaQuery } from "@/redux/features/area/areaApi";
import { useGetAllTutorRequestsForPublicQuery } from "@/redux/features/tutorRequest/tutorRequestApi";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";

// Helper function to convert area string to array
const parseAreaString = (areaString: string): string[] => {
  if (!areaString || typeof areaString !== "string") return [];
  // Split by comma and trim whitespace
  return areaString
    .split(",")
    .map((area) => area.trim())
    .filter((area) => area.length > 0);
};

// Helper function to check if area array contains selected area
const doesAreaContainSelection = (
  jobArea: string,
  selectedArea: string
): boolean => {
  if (selectedArea === "all") return true;
  if (!jobArea) return false;

  const areas = parseAreaString(jobArea);
  return areas.some(
    (area) => area.toLowerCase() === selectedArea.toLowerCase()
  );
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function TuitionJobs() {
  const { user } = useAuth();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [selectedMedium, setSelectedMedium] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedThana, setSelectedThana] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedJobType, setSelectedJobType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Date filter states
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateFilterType, setDateFilterType] = useState<
    "none" | "specific" | "range" | "relative"
  >("none");
  const [relativeDateFilter, setRelativeDateFilter] = useState<string>("all");

  // Available thanas and areas based on selected district
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

  const [salaryRange, setSalaryRange] = useState<[number, number]>([
    0, 1000000,
  ]);
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [newListingsOnly, setNewListingsOnly] = useState(false);
  const [jobs, setJobs] = useState<TuitionJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Extract medium options from JSON
  const mediumOptionsList = mediumOptions.mediums;

  // Redux data fetching
  const { data: districtData, isLoading: districtLoading } =
    useGetAllDistrictsQuery(undefined);

  const { data: areaData, isLoading: areaLoading } =
    useGetAllAreaQuery(undefined);
  const {
    data: jobsData,
    isLoading: jobsLoading,
    refetch: refetchJobs,
  } = useGetAllTutorRequestsForPublicQuery(undefined);

  const { data: categoryData, isLoading: categoryLoading } =
    useGetAllCategoryQuery(undefined);

  // Process jobs data from Redux
  useEffect(() => {
    if (jobsData?.data) {
      setJobs(jobsData?.data);
      setIsLoading(false);

      // Set pagination if available
      if (jobsData?.pagination) {
        setTotalPages(jobsData?.pagination.pages || 1);
        setTotalCount(jobsData?.pagination.total || jobsData?.data?.length);
      } else {
        setTotalPages(1);
        setTotalCount(jobsData?.data?.length);
      }
    } else if (jobsLoading) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [jobsData, jobsLoading]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedSubject,
    selectedClass,
    selectedMedium,
    selectedDistrict,
    selectedThana,
    selectedArea,
    selectedJobType,
    selectedCategory,
    dateFilterType,
    selectedDate,
    startDate,
    endDate,
    relativeDateFilter,
  ]);

  // Handle URL parameters
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    const districtFromUrl = searchParams.get("district");
    const classFromUrl = searchParams.get("class");
    const mediumFromUrl = searchParams.get("medium");

    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }

    if (districtFromUrl) {
      setSelectedDistrict(districtFromUrl);
    }

    if (classFromUrl) {
      setSelectedClass(classFromUrl);
    }

    if (mediumFromUrl) {
      setSelectedMedium(mediumFromUrl);
    }
  }, [searchParams]);

  // Update available thanas and areas when district is selected
  useEffect(() => {
    if (selectedDistrict !== "all" && districtData?.data) {
      // Find the selected district from district data
      const district = districtData.data.find(
        (d: any) => d.name === selectedDistrict
      );

      if (district) {
        // Set thanas for the selected district
        setAvailableThanas(district.thana || []);
        setAvailableAreas(district.area || []);
      } else {
        setAvailableThanas([]);
        setAvailableAreas([]);
      }
    } else {
      // If 'all' is selected or no district data, reset the lists
      setAvailableThanas([]);
      setAvailableAreas([]);
    }

    // Reset thana and area when district changes
    setSelectedThana("all");
    setSelectedArea("all");
  }, [selectedDistrict, districtData]);

  // Get all unique areas from all jobs for dropdown when "all" districts is selected
  const allUniqueAreasFromJobs = useMemo(() => {
    const areas = new Set<string>();

    if (jobs.length > 0) {
      jobs.forEach((job: any) => {
        if (job.area) {
          const parsedAreas = parseAreaString(job.area);
          parsedAreas.forEach((area) => areas.add(area));
        }
      });
    }

    return Array.from(areas).sort();
  }, [jobs]);

  // Get areas for dropdown based on selection
  const areasForDropdown = useMemo(() => {
    if (selectedDistrict === "all") {
      return allUniqueAreasFromJobs;
    } else {
      return availableAreas;
    }
  }, [selectedDistrict, availableAreas, allUniqueAreasFromJobs]);

  // Extract districts from district data
  const districts =
    districtData?.data?.map((district: any) => district.name) || [];

  // Extract categories from category data
  const categories = categoryData?.data || [];

  // Filter jobs based on search query and selected filters
  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch =
      (job.subject &&
        job.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.studentClass &&
        job.studentClass.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.medium &&
        job.medium.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.district &&
        job.district.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.area &&
        job.area.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.detailedLocation &&
        job.detailedLocation
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (job.user?.fullName &&
        job.user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.tutorRequestId &&
        job.tutorRequestId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (job.selectedSubjects &&
        job.selectedSubjects.some((subject: string) =>
          subject.toLowerCase().includes(searchQuery.toLowerCase())
        )) ||
      (job.phoneNumber && job.phoneNumber.includes(searchQuery));

    const matchesSubject =
      selectedSubject === "all" ||
      job.subject === selectedSubject ||
      (job.selectedSubjects && job.selectedSubjects.includes(selectedSubject));

    const matchesClass =
      selectedClass === "all" ||
      job.studentClass === selectedClass ||
      (job.selectedClasses && job.selectedClasses.includes(selectedClass));

    const matchesMedium =
      selectedMedium === "all" ||
      job.medium === selectedMedium ||
      (job.selectedCategories &&
        job.selectedCategories.includes(selectedMedium));

    const matchesDistrict =
      selectedDistrict === "all" || job.district === selectedDistrict;

    const matchesThana = selectedThana === "all" || job.thana === selectedThana;

    const matchesArea = doesAreaContainSelection(job.area, selectedArea);

    const matchesCategory =
      selectedCategory === "all" ||
      (job.selectedCategories &&
        job.selectedCategories.includes(selectedCategory));

    const matchesJobType =
      selectedJobType === "all" || job.tutoringType === selectedJobType;

    // Salary filtering
    const jobMinSalary = job.salaryRange?.min || 0;
    const jobMaxSalary = job.salaryRange?.max || 0;

    const salaryOverlap =
      jobMinSalary <= salaryRange[1] && jobMaxSalary >= salaryRange[0];
    const extremeSalary = jobMinSalary > 1000000 || jobMaxSalary > 1000000;
    const matchesSalary = salaryOverlap || extremeSalary;

    const matchesUrgent = !urgentOnly;
    const matchesRemote =
      !remoteOnly ||
      job.tutoringType === "Online Tutoring" ||
      job.tutoringType === "Both";
    const matchesNew =
      !newListingsOnly ||
      new Date().getTime() - new Date(job.createdAt).getTime() <
        7 * 24 * 60 * 60 * 1000;

    // Date filtering
    const jobDate = new Date(job.createdAt);
    const today = new Date();

    let matchesDate = true;

    if (dateFilterType === "specific" && selectedDate) {
      const selected = new Date(selectedDate);
      matchesDate =
        jobDate.getDate() === selected.getDate() &&
        jobDate.getMonth() === selected.getMonth() &&
        jobDate.getFullYear() === selected.getFullYear();
    }

    if (dateFilterType === "range" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      // Set end date to end of day
      end.setHours(23, 59, 59, 999);
      matchesDate = jobDate >= start && jobDate <= end;
    }

    if (dateFilterType === "relative") {
      const oneDay = 24 * 60 * 60 * 1000;

      switch (relativeDateFilter) {
        case "today":
          const todayStart = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          );
          const todayEnd = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            23,
            59,
            59,
            999
          );
          matchesDate = jobDate >= todayStart && jobDate <= todayEnd;
          break;
        case "yesterday":
          const yesterday = new Date(today.getTime() - oneDay);
          const yesterdayStart = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate()
          );
          const yesterdayEnd = new Date(
            yesterday.getFullYear(),
            yesterday.getMonth(),
            yesterday.getDate(),
            23,
            59,
            59,
            999
          );
          matchesDate = jobDate >= yesterdayStart && jobDate <= yesterdayEnd;
          break;
        case "last7days":
          const sevenDaysAgo = new Date(today.getTime() - 7 * oneDay);
          matchesDate = jobDate >= sevenDaysAgo;
          break;
        case "last30days":
          const thirtyDaysAgo = new Date(today.getTime() - 30 * oneDay);
          matchesDate = jobDate >= thirtyDaysAgo;
          break;
        case "last90days":
          const ninetyDaysAgo = new Date(today.getTime() - 90 * oneDay);
          matchesDate = jobDate >= ninetyDaysAgo;
          break;
        case "thisMonth":
          const firstDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          const lastDayOfMonth = new Date(
            today.getFullYear(),
            today.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          );
          matchesDate = jobDate >= firstDayOfMonth && jobDate <= lastDayOfMonth;
          break;
        case "lastMonth":
          const firstDayOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          const lastDayOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0,
            23,
            59,
            59,
            999
          );
          matchesDate =
            jobDate >= firstDayOfLastMonth && jobDate <= lastDayOfLastMonth;
          break;
        default:
          matchesDate = true;
      }
    }

    return (
      matchesSearch &&
      matchesSubject &&
      matchesClass &&
      matchesMedium &&
      matchesDistrict &&
      matchesThana &&
      matchesArea &&
      matchesCategory &&
      matchesJobType &&
      matchesSalary &&
      matchesUrgent &&
      matchesRemote &&
      matchesNew &&
      matchesDate
    );
  });

  // Handle search
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedSubject("all");
    setSelectedClass("all");
    setSelectedMedium("all");
    setSelectedDistrict("all");
    setSelectedThana("all");
    setSelectedArea("all");
    setSelectedJobType("all");
    setSelectedCategory("all");
    setSalaryRange([0, 1000000]);
    setSearchQuery("");
    setUrgentOnly(false);
    setRemoteOnly(false);
    setNewListingsOnly(false);

    // Reset date filters
    setSelectedDate("");
    setStartDate("");
    setEndDate("");
    setDateFilterType("none");
    setRelativeDateFilter("all");
  };

  // Handle job application
  const handleApplyForJob = async (jobId: string, jobTitle: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for tuition jobs.",
        variant: "destructive",
      });
      return;
    }

    if (user.role !== "tutor") {
      toast({
        title: "Access Denied",
        description: "Only tutors can apply for tuition jobs.",
        variant: "destructive",
      });
      return;
    }

    try {
      setApplying(jobId);
      const response = await tuitionJobsService.applyForJob(
        jobId,
        `I am interested in teaching ${jobTitle}.`
      );

      if (response.success) {
        toast({
          title: "Application Submitted",
          description:
            response.message ||
            "Your application has been submitted successfully!",
        });
      } else {
        toast({
          title: "Application Failed",
          description: response.message || "Failed to submit application",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Application Error",
        description:
          error.message || "An error occurred while applying for the job.",
        variant: "destructive",
      });
    } finally {
      setApplying(null);
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      {/* Page Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Tuition Jobs</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Find the perfect tutoring opportunity
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* Filters Section */}
        <div className="order-1 lg:w-80 lg:order-1">
          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Class Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="class"
                  className="text-sm font-bold text-green-600"
                >
                  Class Level
                </Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger id="class" className="h-10 sm:h-11 font-bold">
                    <div className="flex items-center">
                      <GraduationCap className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Classes" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      All Classes
                    </SelectItem>
                    {CLASS_LEVELS.map((classLevel) => (
                      <SelectItem
                        key={classLevel}
                        value={classLevel}
                        className="font-bold"
                      >
                        {classLevel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Medium Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="medium"
                  className="text-sm font-bold text-green-600"
                >
                  Medium
                </Label>
                <Select
                  value={selectedMedium}
                  onValueChange={setSelectedMedium}
                >
                  <SelectTrigger id="medium" className="h-10 sm:h-11 font-bold">
                    <div className="flex items-center">
                      <BookType className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Mediums" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      All Mediums
                    </SelectItem>
                    {mediumOptionsList.map((medium) => (
                      <SelectItem
                        key={medium.value}
                        value={medium.value}
                        className="font-bold"
                      >
                        {medium.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-sm font-bold text-green-600"
                >
                  Subject
                </Label>
                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}
                >
                  <SelectTrigger
                    id="subject"
                    className="h-10 sm:h-11 font-bold"
                  >
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="All Subjects" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      All Subjects
                    </SelectItem>
                    {SUBJECT_OPTIONS.filter(
                      (subject) => subject !== "All Subjects"
                    ).map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        className="font-bold"
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="district"
                  className="text-sm font-bold text-green-600"
                >
                  District
                </Label>
                <Select
                  value={selectedDistrict}
                  onValueChange={setSelectedDistrict}
                >
                  <SelectTrigger
                    id="district"
                    className="h-10 sm:h-11 font-bold"
                  >
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      All Districts
                    </SelectItem>
                    {districts.map((district: string) => (
                      <SelectItem
                        key={district}
                        value={district}
                        className="font-bold"
                      >
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Thana Filter - Only shows when district is selected */}
              <div className="space-y-2">
                <Label
                  htmlFor="thana"
                  className="text-sm font-bold text-green-600"
                >
                  Thana
                </Label>
                <Select
                  value={selectedThana}
                  onValueChange={setSelectedThana}
                  disabled={
                    selectedDistrict === "all" || availableThanas.length === 0
                  }
                >
                  <SelectTrigger id="thana" className="h-10 sm:h-11 font-bold">
                    <SelectValue
                      placeholder={
                        selectedDistrict === "all"
                          ? "Select district first"
                          : availableThanas.length === 0
                          ? "No thanas available"
                          : "All Thanas"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      All Thanas
                    </SelectItem>
                    {availableThanas.map((thana: string) => (
                      <SelectItem
                        key={thana}
                        value={thana}
                        className="font-bold"
                      >
                        {thana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Area Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="area"
                  className="text-sm font-bold text-green-600"
                >
                  Area
                </Label>
                <Select
                  value={selectedArea}
                  onValueChange={setSelectedArea}
                  disabled={areasForDropdown.length === 0}
                >
                  <SelectTrigger id="area" className="h-10 sm:h-11 font-bold">
                    <SelectValue
                      placeholder={
                        areasForDropdown.length === 0
                          ? selectedDistrict === "all"
                            ? "No areas in current jobs"
                            : "No areas available"
                          : "Select Area"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      All Areas
                    </SelectItem>
                    {areasForDropdown.map((area: string) => (
                      <SelectItem key={area} value={area} className="font-bold">
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedDistrict === "all" && areasForDropdown.length > 0 && (
                  <p className="text-xs text-blue-600">
                    Showing areas from all districts
                  </p>
                )}
              </div>

              {/* Tutoring Type Filter */}
              <div className="space-y-2">
                <Label
                  htmlFor="jobType"
                  className="text-sm font-bold text-green-600"
                >
                  Tutoring Type
                </Label>
                <Select
                  value={selectedJobType}
                  onValueChange={setSelectedJobType}
                >
                  <SelectTrigger
                    id="jobType"
                    className="h-10 sm:h-11 font-bold"
                  >
                    <div className="flex items-center">
                      <SelectValue placeholder="All Types" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="font-bold">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        All Types
                      </div>
                    </SelectItem>
                    <SelectItem value="Home Tutoring" className="font-bold">
                      <div className="flex items-center">
                        <Home className="mr-2 h-4 w-4 text-blue-500" />
                        Home Tutoring
                      </div>
                    </SelectItem>
                    <SelectItem value="Online Tutoring" className="font-bold">
                      <div className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4 text-green-500" />
                        Online Tutoring
                      </div>
                    </SelectItem>
                    <SelectItem value="Both" className="font-bold">
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-purple-500" />
                        Both
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter Section */}
              <div className="space-y-3">
                <Label className="text-sm font-bold text-green-600">
                  Search By Date
                </Label>

                <Select
                  value={dateFilterType}
                  onValueChange={(
                    value: "none" | "specific" | "range" | "relative"
                  ) => setDateFilterType(value)}
                >
                  <SelectTrigger className="h-10 sm:h-11 font-bold">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="তারিখ ফিল্টার টাইপ" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="font-bold">
                      NO filter by date
                    </SelectItem>
                    <SelectItem value="specific" className="font-bold">
                      Fixed date
                    </SelectItem>
                    <SelectItem value="range" className="font-bold">
                      Date range
                    </SelectItem>
                    <SelectItem value="relative" className="font-bold">
                      Relative date
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* নির্দিষ্ট তারিখ */}
                {dateFilterType === "specific" && (
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-10 sm:h-11 font-bold"
                    />
                  </div>
                )}

                {/* তারিখ রেঞ্জ */}
                {dateFilterType === "range" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-black">
                       Start Date
                      </Label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-10 sm:h-11 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-black">
                       Last Date
                      </Label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-10 sm:h-11 font-bold"
                      />
                    </div>
                  </div>
                )}

                {/* আপেক্ষিক তারিখ */}
                {dateFilterType === "relative" && (
                  <div className="space-y-2">
                    <Select
                      value={relativeDateFilter}
                      onValueChange={setRelativeDateFilter}
                    >
                      <SelectTrigger className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="সময়কাল নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today" className="font-bold">
                          Today
                        </SelectItem>
                        <SelectItem value="yesterday" className="font-bold">
                          Yesterday
                        </SelectItem>
                        <SelectItem value="last7days" className="font-bold">
                         Last 7 day
                        </SelectItem>
                        <SelectItem value="last30days" className="font-bold">
                          Last 30 day
                        </SelectItem>
                        <SelectItem value="last90days" className="font-bold">
                          Last 90 day
                        </SelectItem>
                        <SelectItem value="thisMonth" className="font-bold">
                          This month
                        </SelectItem>
                        <SelectItem value="lastMonth" className="font-bold">
                         last month
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Salary Range */}
              <div className="space-y-2">
                <Label className="text-sm font-bold text-green-600">
                  Salary Range (BDT)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={salaryRange[0]}
                    onChange={(e) =>
                      setSalaryRange([
                        parseInt(e.target.value) || 0,
                        salaryRange[1],
                      ])
                    }
                    className="h-10 sm:h-11 text-sm font-bold"
                  />
                  <span className="text-sm font-bold">to</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={salaryRange[1]}
                    onChange={(e) =>
                      setSalaryRange([
                        salaryRange[0],
                        parseInt(e.target.value) || 0,
                      ])
                    }
                    className="h-10 sm:h-11 text-sm font-bold"
                  />
                </div>
                {jobs.filter((job: any) => {
                  const jobMinSalary = job.salaryRange?.min || 0;
                  const jobMaxSalary = job.salaryRange?.max || 0;
                  return jobMinSalary > 1000000 || jobMaxSalary > 1000000;
                }).length > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200 font-bold">
                    💡 <strong>Note:</strong> There are{" "}
                    {
                      jobs.filter((job: any) => {
                        const jobMinSalary = job.salaryRange?.min || 0;
                        const jobMaxSalary = job.salaryRange?.max || 0;
                        return jobMinSalary > 1000000 || jobMaxSalary > 1000000;
                      }).length
                    }{" "}
                    job(s) with salaries above ৳1M that are always visible.
                  </p>
                )}
              </div>

              {/* Checkbox Filters */}
              <div className="hidden sm:block space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="urgent"
                    checked={urgentOnly}
                    onCheckedChange={(checked) =>
                      setUrgentOnly(checked === true)
                    }
                  />
                  <Label
                    htmlFor="urgent"
                    className="text-sm font-bold text-green-600 flex items-center"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                    Urgent Positions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remote"
                    checked={remoteOnly}
                    onCheckedChange={(checked) =>
                      setRemoteOnly(checked === true)
                    }
                  />
                  <Label
                    htmlFor="remote"
                    className="text-sm font-bold text-green-600 flex items-center"
                  >
                    <Wifi className="mr-2 h-4 w-4 text-blue-500" />
                    Remote Available
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="newListings"
                    checked={newListingsOnly}
                    onCheckedChange={(checked) =>
                      setNewListingsOnly(checked === true)
                    }
                  />
                  <Label
                    htmlFor="newListings"
                    className="text-sm font-bold text-green-600 flex items-center"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-green-500" />
                    New Listings
                  </Label>
                </div>
              </div>

              {/* Reset Filters Button */}
              <Button
                className="w-full h-10 sm:h-11 font-bold"
                variant="outline"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4 sm:space-y-6 order-2 lg:order-2">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {isLoading ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-3 w-3 mr-2 animate-spin" /> Loading
                    jobs...
                  </span>
                ) : (
                  <>
                    Showing{" "}
                    <span className="font-medium">{filteredJobs.length}</span>{" "}
                    of <span className="font-medium">{totalCount}</span> jobs
                  </>
                )}
              </p>

              {/* Filter Badges */}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {selectedClass !== "all" && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Class: {selectedClass}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedClass("all")}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {selectedMedium !== "all" && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Medium: {selectedMedium}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMedium("all")}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {selectedCategory !== "all" && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Category: {selectedCategory}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory("all")}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {selectedJobType !== "all" && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Type: {selectedJobType}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedJobType("all")}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {selectedArea !== "all" && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Area: {selectedArea}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedArea("all")}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {/* Date Filter Badges */}
                {dateFilterType === "specific" && selectedDate && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Date: {new Date(selectedDate).toLocaleDateString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDate("");
                        setDateFilterType("none");
                      }}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {dateFilterType === "range" && startDate && endDate && (
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    Date Range: {new Date(startDate).toLocaleDateString()} -{" "}
                    {new Date(endDate).toLocaleDateString()}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setStartDate("");
                        setEndDate("");
                        setDateFilterType("none");
                      }}
                      className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                    >
                      ×
                    </Button>
                  </Badge>
                )}

                {dateFilterType === "relative" &&
                  relativeDateFilter !== "all" && (
                    <Badge variant="secondary" className="text-xs sm:text-sm">
                      {relativeDateFilter === "today" && "Today"}
                      {relativeDateFilter === "yesterday" && "Yesterday"}
                      {relativeDateFilter === "last7days" && "Last 7 Days"}
                      {relativeDateFilter === "last30days" && "Last 30 Days"}
                      {relativeDateFilter === "last90days" && "Last 90 Days"}
                      {relativeDateFilter === "thisMonth" && "This Month"}
                      {relativeDateFilter === "lastMonth" && "Last Month"}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRelativeDateFilter("all");
                          setDateFilterType("none");
                        }}
                        className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                      >
                        ×
                      </Button>
                    </Badge>
                  )}

                {(selectedClass !== "all" ||
                  selectedMedium !== "all" ||
                  selectedCategory !== "all" ||
                  selectedJobType !== "all" ||
                  selectedArea !== "all" ||
                  dateFilterType !== "none") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetFilters}
                    className="h-6 px-2 text-xs"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="flex items-center gap-1 flex-1 sm:flex-none"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Grid</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="flex items-center gap-1 flex-1 sm:flex-none"
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchJobs()}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search  ID, or phone number..."
              className="pl-10 h-11 font-bold border-2 border-green-600"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Job Listings */}
          <div className="space-y-4 sm:space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4 sm:p-6">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                      <div className="bg-muted p-4 flex justify-between">
                        <Skeleton className="h-10 w-20" />
                        <Skeleton className="h-10 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No jobs found</h3>
                <p className="mt-1 text-muted-foreground text-sm sm:text-base">
                  Try adjusting your filters or search terms
                </p>
                {jobs.length > 0 && (
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg max-w-md mx-auto">
                    <p className="text-sm text-orange-800">
                      <strong>Tip:</strong> There are {jobs.length} total jobs
                      available.
                      {jobs.filter((job: any) => {
                        const jobMinSalary = job.salaryRange?.min || 0;
                        const jobMaxSalary = job.salaryRange?.max || 0;
                        return jobMinSalary > 1000000 || jobMaxSalary > 1000000;
                      }).length > 0 && (
                        <span>
                          {" "}
                          {
                            jobs.filter((job: any) => {
                              const jobMinSalary = job.salaryRange?.min || 0;
                              const jobMaxSalary = job.salaryRange?.max || 0;
                              return (
                                jobMinSalary > 1000000 || jobMaxSalary > 1000000
                              );
                            }).length
                          }{" "}
                          of them have high salaries and are always visible.
                        </span>
                      )}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={resetFilters}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
                    : "space-y-4"
                }
              >
                {filteredJobs.map((job: any) => (
                  <Card
                    key={job.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                  >
                    <CardHeader className="pb-2 p-4 sm:p-6">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg sm:text-xl font-bold text-black">
                          Tuition Request #{job.tutorRequestId}
                        </CardTitle>
                        <Badge variant="outline" className="text-xs text-black">
                          {job.tutoringType || "Tutoring Request"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {job.medium && (
                          <Badge variant="secondary" className="text-xs">
                            <BookType className="mr-1 h-3 w-3" />
                            {job.medium}
                          </Badge>
                        )}
                        {job.studentClass && (
                          <Badge variant="secondary" className="text-xs">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            {job.studentClass}
                          </Badge>
                        )}
                        <span className="text-xs sm:text-sm font-bold text-black">
                          Phone: {job.phoneNumber}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow p-4 sm:p-6">
                      <div className="space-y-2 flex-grow">
                        <div className="space-y-2">
                          {/* Subjects */}
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <BookOpen className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-black">
                              {job.subject ||
                                (job.selectedSubjects &&
                                  job.selectedSubjects.join(", ")) ||
                                "Multiple Subjects"}
                            </span>
                          </div>

                          {/* Location */}
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-green-600">
                              {job.district && `${job.district}`}
                              {job.thana && `, ${job.thana}`}
                              {job.area && ` • ${job.area}`}
                              {job.detailedLocation &&
                                ` (${job.detailedLocation})`}
                            </span>
                          </div>

                          {/* Student Info */}
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <Users className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-black">
                              {job.numberOfStudents
                                ? `${job.numberOfStudents} student(s)`
                                : "1 student"}{" "}
                              •{job.studentGender && ` ${job.studentGender}`}
                            </span>
                          </div>

                          {/* Tutor Preference */}
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <User className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-green-600">
                              Preferred: {job.tutorGenderPreference || "Any"}{" "}
                              teacher
                            </span>
                          </div>

                          {/* Salary */}
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <DollarSign className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-green-600">
                              ৳{(job.salaryRange?.min || 0).toLocaleString()} -
                              ৳{(job.salaryRange?.max || 0).toLocaleString()}
                              {job.isSalaryNegotiable && " (Negotiable)"}
                            </span>
                          </div>

                          {/* Schedule */}
                          {(job.tutoringDays || job.tutoringTime) && (
                            <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                              <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="font-bold text-green-600">
                                {job.tutoringDays &&
                                  `${job.tutoringDays} days/week`}
                                {job.tutoringTime && ` • ${job.tutoringTime}`}
                              </span>
                            </div>
                          )}

                          {/* Posted Date */}
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="font-bold text-black">
                              Posted:{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Categories */}
                        {job.selectedCategories &&
                          job.selectedCategories.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-bold text-black mb-1">
                                Categories:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {job.selectedCategories.map(
                                  (category: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {category}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Extra Information */}
                        {job.extraInformation && (
                          <div className="mt-2">
                            <p className="text-xs sm:text-sm font-bold text-black">
                              Additional Information:
                            </p>
                            <p className="text-xs sm:text-sm font-bold text-black">
                              {job.extraInformation}
                            </p>
                          </div>
                        )}

                        {/* Admin Note */}
                        {job.adminNote && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs sm:text-sm font-bold text-blue-800">
                              Admin Note:
                            </p>
                            <p className="text-xs sm:text-sm text-blue-700">
                              {job.adminNote}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center pt-2 mt-4">
                        <div className="text-xs font-bold text-black">
                          Posted: {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          {((job.salaryRange?.min || 0) > 1000000 ||
                            (job.salaryRange?.max || 0) > 1000000) && (
                            <Badge variant="destructive" className="text-xs">
                              High Salary
                            </Badge>
                          )}
                          <Badge
                            variant={
                              job.status === "Active" ? "default" : "secondary"
                            }
                            className="text-xs"
                          >
                            {job.status || "Active"}
                          </Badge>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm mt-4"
                        onClick={() => router.push(`/tuition-jobs/${job.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading &&
              !error &&
              filteredJobs.length > 0 &&
              totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
