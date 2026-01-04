"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  User,
  Book,
  Clock,
  Award,
  Users,
  Calendar,
  Filter,
  FileText,
  DollarSign,
  BarChart,
  Download,
  Upload,
  X,
  Tag,
  Globe,
  CheckSquare,
  Square,
} from "lucide-react";
import {
  useGetAllCourseQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
} from "@/redux/features/course/courseApi";
import {
  useGetAllEnrollmentQuery,
  useDeleteEnrollmentMutation,
  useUpdateEnrollmentMutation,
} from "@/redux/features/area/enrollments/enrollmentsApi";

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category: string;
  level: string;
  price: string | number;
  original_price: number;
  thumbnail_url: string;
  video_intro_url: string;
  video_url: string;
  duration_hours: number;
  certificate_available: boolean;
  max_students: number;
  language: string;
  tags: string[];
  requirements: string;
  learning_outcomes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
};

type Enrollment = {
  id: string;
  courseId: string;
  userId: string;
  enrolledAt: string;
  course: Course;
  status: string;
  user: {
    fullName: string;
    email: string;
    alternative_number: string | null;
    avatar: string;
    district: string;
    thana: string | null;
    role: string;
    gender: string;
    status: string;
  };
};

export default function CourseManagement() {
  // RTK Queries
  const {
    data: coursesResponse,
    isLoading: coursesLoading,
    refetch: refetchCourses,
  } = useGetAllCourseQuery(undefined);

  const {
    data: enrollmentsResponse,
    isLoading: enrollmentsLoading,
    refetch: refetchEnrollments,
  } = useGetAllEnrollmentQuery(undefined);

  const [createCourseMutation, { isLoading: isCreating }] =
    useCreateCourseMutation();
  const [updateCourseMutation, { isLoading: isUpdating }] =
    useUpdateCourseMutation();
  const [deleteCourseMutation, { isLoading: isDeleting }] =
    useDeleteCourseMutation();

  const [updateEnrollmentStatusMutation] = useUpdateEnrollmentMutation();
  const [deleteEnrollmentMutation] = useDeleteEnrollmentMutation();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Tag input state
  const [tagInput, setTagInput] = useState("");

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollmentSearch, setEnrollmentSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Course Form State - All fields included
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    category: "",
    level: "Beginner",
    price: "",
    original_price: "",
    thumbnail_url: "",
    video_intro_url: "",
    video_url: "",
    duration_hours: "",
    certificate_available: true,
    max_students: "",
    language: "English",
    tags: [] as string[],
    requirements: "",
    learning_outcomes: "",
    status: "draft",
  });

  const uploadImage = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-image`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      const result = await res.json();
      return result.url;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to upload file",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Handle file uploads
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast({
        title: "Uploading...",
        description: "Please wait while we upload your file",
      });

      const url = await uploadImage(file);
      handleInputChange(field, url);

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  // Update courses and enrollments from API response
  useEffect(() => {
    if (coursesResponse?.data) {
      setCourses(coursesResponse.data);
    }
  }, [coursesResponse]);

  useEffect(() => {
    if (enrollmentsResponse?.data) {
      setEnrollments(enrollmentsResponse.data);
    }
  }, [enrollmentsResponse]);

  // Helper Functions
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .trim();
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter Functions
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (
          !course.title.toLowerCase().includes(searchLower) &&
          !course.description.toLowerCase().includes(searchLower) &&
          !course.category.toLowerCase().includes(searchLower) &&
          !course.short_description.toLowerCase().includes(searchLower) &&
          !course.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && course.status !== statusFilter) {
        return false;
      }

      // Category filter
      if (categoryFilter !== "all" && course.category !== categoryFilter) {
        return false;
      }

      // Level filter
      if (levelFilter !== "all" && course.level !== levelFilter) {
        return false;
      }

      return true;
    });
  }, [courses, searchTerm, statusFilter, categoryFilter, levelFilter]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((enrollment) => {
      // Search filter
      if (enrollmentSearch) {
        const searchLower = enrollmentSearch.toLowerCase();
        return (
          enrollment.user.fullName.toLowerCase().includes(searchLower) ||
          enrollment.user.email.toLowerCase().includes(searchLower) ||
          enrollment.course.title.toLowerCase().includes(searchLower) ||
          enrollment.course.category.toLowerCase().includes(searchLower)
        );
      }

      // Status filter
      if (enrollmentStatusFilter !== "all") {
        if (
          enrollmentStatusFilter === "active" &&
          enrollment.user.status !== "active"
        ) {
          return false;
        }
      }

      return true;
    });
  }, [enrollments, enrollmentSearch, enrollmentStatusFilter]);

  // CRUD Operations for Courses
  const handleCreateCourse = async () => {
    try {
      // Validate required fields
      if (!courseForm.title.trim()) {
        toast({
          title: "Error",
          description: "Course title is required",
          variant: "destructive",
        });
        return;
      }

      if (!courseForm.description.trim()) {
        toast({
          title: "Error",
          description: "Course description is required",
          variant: "destructive",
        });
        return;
      }

      if (!courseForm.category.trim()) {
        toast({
          title: "Error",
          description: "Course category is required",
          variant: "destructive",
        });
        return;
      }

      const courseData = {
        ...courseForm,
        price: parseFloat(courseForm.price) || 0,
        original_price: parseFloat(courseForm.original_price) || 0,
        duration_hours: parseFloat(courseForm.duration_hours) || 0,
        max_students: parseInt(courseForm.max_students) || 0,
        tags: courseForm.tags,
      };

      const result = await createCourseMutation(courseData).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Course created successfully",
        });
        setIsCreateDialogOpen(false);
        resetForm();
        refetchCourses();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create course",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create course",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return;

    try {
      // Validate required fields
      if (!courseForm.title.trim()) {
        toast({
          title: "Error",
          description: "Course title is required",
          variant: "destructive",
        });
        return;
      }

      if (!courseForm.description.trim()) {
        toast({
          title: "Error",
          description: "Course description is required",
          variant: "destructive",
        });
        return;
      }

      if (!courseForm.category.trim()) {
        toast({
          title: "Error",
          description: "Course category is required",
          variant: "destructive",
        });
        return;
      }

      const courseData = {
        ...courseForm,
        price: parseFloat(courseForm.price) || 0,
        original_price: parseFloat(courseForm.original_price) || 0,
        duration_hours: parseFloat(courseForm.duration_hours) || 0,
        max_students: parseInt(courseForm.max_students) || 0,
        tags: courseForm.tags,
      };

      const result = await updateCourseMutation({
        id: selectedCourse.id,
        data: courseData,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        });
        setIsEditDialogOpen(false);
        resetForm();
        refetchCourses();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update course",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (course: Course) => {

    try {
      const result = await deleteCourseMutation(course.id).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        });
        refetchCourses();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete course",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  // Enrollment Operations
  const handleUpdateEnrollmentStatus = async (
    enrollmentId: string,
    status: string
  ) => {
    try {
      const result = await updateEnrollmentStatusMutation({
        id: enrollmentId,
        data: { status },
      }).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Enrollment status updated successfully",
        });
        refetchEnrollments();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update enrollment status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error?.data?.message || "Failed to update enrollment status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEnrollment = async (enrollment: Enrollment) => {

    try {
      const result = await deleteEnrollmentMutation(enrollment.id).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Enrollment removed successfully",
        });
        refetchEnrollments();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove enrollment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to remove enrollment",
        variant: "destructive",
      });
    }
  };

  // Form Handlers
  const resetForm = () => {
    setCourseForm({
      title: "",
      slug: "",
      description: "",
      short_description: "",
      category: "",
      level: "Beginner",
      price: "",
      original_price: "",
      thumbnail_url: "",
      video_intro_url: "",
      video_url: "",
      duration_hours: "",
      certificate_available: true,
      max_students: "",
      language: "English",
      tags: [],
      requirements: "",
      learning_outcomes: "",
      status: "draft",
    });
    setTagInput("");
  };

  const handleInputChange = (field: string, value: any) => {
    setCourseForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from title
    if (field === "title") {
      setCourseForm((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }
  };

  // Tag handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !courseForm.tags.includes(tagInput.trim())) {
      handleInputChange("tags", [...courseForm.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    handleInputChange(
      "tags",
      courseForm.tags.filter((tag) => tag !== tagToRemove)
    );
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      short_description: course.short_description,
      category: course.category,
      level: course.level,
      price: course.price.toString(),
      original_price: course.original_price?.toString() || "",
      thumbnail_url: course.thumbnail_url || "",
      video_intro_url: course.video_intro_url || "",
      video_url: course.video_url || "",
      duration_hours: course.duration_hours?.toString() || "",
      certificate_available: course.certificate_available,
      max_students: course.max_students?.toString() || "",
      language: course.language,
      tags: course.tags || [],
      requirements: course.requirements || "",
      learning_outcomes: course.learning_outcomes || "",
      status: course.status,
    });
    setIsEditDialogOpen(true);
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const publishedCourses = courses.filter(
      (c) => c.status === "published"
    ).length;
    const draftCourses = courses.filter((c) => c.status === "draft").length;
    const archivedCourses = courses.filter(
      (c) => c.status === "archived"
    ).length;
    const totalEnrollments = enrollments.length;
    const uniqueCategories = Array.from(
      new Set(courses.map((c) => c.category))
    ).length;
    const totalHours = courses.reduce(
      (sum, c) => sum + (c.duration_hours || 0),
      0
    );
    const activeEnrollments = enrollments.filter(
      (e) => e.status === "active"
    ).length;

    return {
      totalCourses,
      publishedCourses,
      draftCourses,
      archivedCourses,
      totalEnrollments,
      activeEnrollments,
      uniqueCategories,
      totalHours,
    };
  }, [courses, enrollments]);

  if (coursesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Dialog content for course form (Create and Edit)
  const renderCourseForm = (isEdit = false) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Course Title *</Label>
          <Input
            id="title"
            value={courseForm.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="Enter course title"
          />
        </div>
        <div>
          <Label htmlFor="slug">Course Slug</Label>
          <Input
            id="slug"
            value={courseForm.slug}
            onChange={(e) => handleInputChange("slug", e.target.value)}
            placeholder="auto-generated-slug"
            readOnly
          />
        </div>
      </div>

      <div>
        <Label htmlFor="short_description">Short Description *</Label>
        <Textarea
          id="short_description"
          value={courseForm.short_description}
          onChange={(e) =>
            handleInputChange("short_description", e.target.value)
          }
          placeholder="Brief description (2-3 sentences)"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="description">Full Description *</Label>
        <Textarea
          id="description"
          value={courseForm.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          placeholder="Detailed course description"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={courseForm.category}
            onChange={(e) => handleInputChange("category", e.target.value)}
            placeholder="e.g., Web Development, Data Science"
          />
        </div>
        <div>
          <Label htmlFor="level">Level</Label>
          <Select
            value={courseForm.level}
            onValueChange={(value) => handleInputChange("level", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Beginner">Beginner</SelectItem>
              <SelectItem value="Intermediate">Intermediate</SelectItem>
              <SelectItem value="Advanced">Advanced</SelectItem>
              <SelectItem value="All Levels">All Levels</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Current Price (৳) *</Label>
          <Input
            id="price"
            type="number"
            min="0"
            value={courseForm.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="original_price">Original Price (৳)</Label>
          <Input
            id="original_price"
            type="number"
            min="0"
            value={courseForm.original_price}
            onChange={(e) =>
              handleInputChange("original_price", e.target.value)
            }
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration_hours">Duration (hours)</Label>
          <Input
            id="duration_hours"
            type="number"
            step="0.5"
            min="0"
            value={courseForm.duration_hours}
            onChange={(e) =>
              handleInputChange("duration_hours", e.target.value)
            }
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="max_students">Max Students</Label>
          <Input
            id="max_students"
            type="number"
            min="0"
            value={courseForm.max_students}
            onChange={(e) => handleInputChange("max_students", e.target.value)}
            placeholder="0 (unlimited)"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="language">Language</Label>
          <Select
            value={courseForm.language}
            onValueChange={(value) => handleInputChange("language", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Bengali">Bengali</SelectItem>
              <SelectItem value="Hindi">Hindi</SelectItem>
              <SelectItem value="Arabic">Arabic</SelectItem>
              <SelectItem value="Spanish">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={courseForm.status}
            onValueChange={(value) => handleInputChange("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* File Uploads Section */}
      <div className="space-y-4">
        <div>
          <Label>Thumbnail Image</Label>
          <div className="flex items-center gap-4">
            <Input
              type="text"
              value={courseForm.thumbnail_url}
              onChange={(e) =>
                handleInputChange("thumbnail_url", e.target.value)
              }
              placeholder="Image URL or upload file"
              className="flex-1"
            />
            <div className="relative">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "thumbnail_url")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline" className="whitespace-nowrap">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
          {courseForm.thumbnail_url && (
            <div className="mt-2">
              <img
                src={courseForm.thumbnail_url}
                alt="Thumbnail preview"
                className="h-20 w-32 object-cover rounded"
              />
            </div>
          )}
        </div>

        <div>
          <Label>Intro Video URL</Label>
          <Input
            type="text"
            value={courseForm.video_intro_url}
            onChange={(e) => handleInputChange("video_intro_url", e.target.value)}
            placeholder="https://youtube.com/embed/..."
          />
        </div>

        <div>
          <Label>Main Video URL OR Ebook URL</Label>
          <Input
            type="text"
            value={courseForm.video_url}
            onChange={(e) => handleInputChange("video_url", e.target.value)}
            placeholder="https://url.com/..."
          />
        </div>
      </div>

      {/* Tags Section */}
      <div>
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Enter a tag and press Add"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
          />
          <Button type="button" onClick={handleAddTag} variant="outline">
            <Tag className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {courseForm.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="gap-1">
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div>
        <Label htmlFor="requirements">Requirements</Label>
        <Textarea
          id="requirements"
          value={courseForm.requirements}
          onChange={(e) => handleInputChange("requirements", e.target.value)}
          placeholder="What students need to know before taking this course..."
          rows={3}
        />
      </div>

      {/* Learning Outcomes */}
      <div>
        <Label htmlFor="learning_outcomes">Learning Outcomes</Label>
        <Textarea
          id="learning_outcomes"
          value={courseForm.learning_outcomes}
          onChange={(e) => handleInputChange("learning_outcomes", e.target.value)}
          placeholder="What will students learn from this course..."
          rows={3}
        />
      </div>

      {/* Certificate Available */}
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            handleInputChange("certificate_available", !courseForm.certificate_available)
          }
          className="flex items-center gap-2"
        >
          {courseForm.certificate_available ? (
            <CheckSquare className="h-4 w-4 text-green-600" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          Certificate Available
        </Button>
        {courseForm.certificate_available && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Certificate will be provided
          </Badge>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          variant="outline"
          onClick={() => isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdateCourse : handleCreateCourse}
          disabled={isEdit ? isUpdating : isCreating}
        >
          <Save className="h-4 w-4 mr-2" />
          {isEdit ? (isUpdating ? "Updating..." : "Update Course") : (isCreating ? "Creating..." : "Create Course")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              🎓 Course Management
            </h1>
            <p className="text-gray-600">
              Manage your courses and student enrollments
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                refetchCourses();
                refetchEnrollments();
              }}
              disabled={coursesLoading || enrollmentsLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  coursesLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                </DialogHeader>
                {renderCourseForm(false)}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Courses
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalCourses}
                </h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Book className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {stats.publishedCourses} Published
              </Badge>
              <Badge variant="outline">{stats.draftCourses} Drafts</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Enrollments
                </p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalEnrollments}
                </h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {stats.activeEnrollments} active students
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Hours</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.totalHours}h
                </h3>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Average: {stats.totalCourses > 0 ? (stats.totalHours / stats.totalCourses).toFixed(1) : 0}h per
              course
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {stats.uniqueCategories}
                </h3>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              Diverse course offerings
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-md border p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Search Courses
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, description, category, or tags..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <Label
                htmlFor="statusFilter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label
                htmlFor="levelFilter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Level
              </Label>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Actions
              </Label>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setLevelFilter("all");
                  setCategoryFilter("all");
                }}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>

        {/* All Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No courses found
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "No courses match your search criteria."
                  : "No courses available."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-xl transition-shadow duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <Badge
                          variant={
                            course.status === "published"
                              ? "default"
                              : course.status === "draft"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {course.status}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {course.level}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(course)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category:</span>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Duration:</span>
                      <span>{course.duration_hours} hours</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created:</span>
                      <span>{formatDate(course.createdAt)}</span>
                    </div>
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {course.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{course.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Published Courses Tab */}
        <TabsContent value="published" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => course.status === "published")
              .map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="default">Published</Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(course)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Enrolled:</span>
                      <span>
                        {
                          enrollments.filter((e) => e.courseId === course.id)
                            .length
                        }{" "}
                        students
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses
              .filter((course) => course.status === "draft")
              .map((course) => (
                <Card
                  key={course.id}
                  className="hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">Draft</Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(course)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCourse(course)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">
                      {course.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      Last updated: {formatDate(course.updatedAt)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border p-6 mb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Enrollments
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={enrollmentSearch}
                    onChange={(e) => setEnrollmentSearch(e.target.value)}
                    placeholder="Search by student name, email, or course..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </Label>
                <Select
                  value={enrollmentStatusFilter}
                  onValueChange={setEnrollmentStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {enrollmentsLoading ? (
            <div className="flex justify-center items-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No enrollments found
              </h3>
              <p className="text-gray-500">
                {enrollmentSearch
                  ? "No enrollments match your search criteria."
                  : "No enrollments yet."}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                            {enrollment.user.avatar ? (
                              <img
                                src={enrollment.user.avatar}
                                alt={enrollment.user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm font-medium bg-blue-100 text-blue-800">
                                {enrollment.user.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {enrollment.user.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.user.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {enrollment.user.district}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {enrollment.course.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {enrollment.course.category}
                        </div>
                        <div className="text-xs text-gray-400">
                          {formatPrice(enrollment.course.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(enrollment.enrolledAt)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(enrollment.enrolledAt).toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            enrollment.status === "active"
                              ? "default"
                              : enrollment.status === "inactive"
                              ? "secondary"
                              : "destructive"
                          }
                          className={
                            enrollment.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {enrollment.status}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {enrollment.user.gender} • {enrollment.user.role}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {enrollment.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateEnrollmentStatus(
                                    enrollment.id,
                                    "inactive"
                                  )
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Inactivate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateEnrollmentStatus(
                                    enrollment.id,
                                    "active"
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleDeleteEnrollment(enrollment)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Enrollment
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          {renderCourseForm(true)}
        </DialogContent>
      </Dialog>
    </div>
  );
}