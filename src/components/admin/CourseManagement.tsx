'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  Play,
  Clock,
  Award,
  DollarSign,
  Activity,
  Search,
  MoreHorizontal,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { 
  getAdminCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse,
  generateCourseSlug,
  formatCoursePrice,
  getAllEnrollments,
  updateEnrollmentStatus,
  removeEnrollment,
  uploadCourseThumbnail,
  type Course,
  type CreateCourseData,
  type Enrollment,
  type EnrollmentsResponse
} from '@/services/courseService';
import { API_BASE_URL } from '@/config/api';
import { useCreateCourseMutation, useDeleteCourseMutation, useGetAllCourseQuery, useUpdateCourseMutation } from '@/redux/features/course/courseApi';

export default function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);


  const {data:AllCourse}=useGetAllCourseQuery(undefined);

  console.log('AllCourse:',AllCourse);

  const [createCourse]=useCreateCourseMutation()
  const [updateCourse]=useUpdateCourseMutation()
  const [deleteCourse]= useDeleteCourseMutation()
  
  // Enrollment state
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState('all');
  const [enrollmentPagination, setEnrollmentPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });
  
  const [courseForm, setCourseForm] = useState<CreateCourseData>({
    title: '',
    slug: '',
    description: '',
    short_description: '',
    category: '',
    level: 'beginner',
    price: 0,
    original_price: 0,
    thumbnail_url: '',
    video_intro_url: '',
    video_url: '',
    duration_hours: 0,
    certificate_available: true,
    max_students: 0,
    language: 'English',
    tags: [],
    requirements: '',
    learning_outcomes: '',
    status: 'draft'
  });

  // Fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await getAdminCourses({ limit: 100 });
      setCourses(response.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchEnrollments();
  }, []);

  // Handle enrollment search and filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEnrollments();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [enrollmentSearch, enrollmentStatusFilter]);

  // Fetch enrollments
  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const params: any = {
        page: enrollmentPagination.current,
        limit: 20
      };
      
      if (enrollmentStatusFilter !== 'all') {
        params.status = enrollmentStatusFilter;
      }
      
      if (enrollmentSearch) {
        params.search = enrollmentSearch;
      }
      
      const response = await getAllEnrollments(params);
      setEnrollments(response.enrollments);
      setEnrollmentPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch enrollments',
        variant: 'destructive'
      });
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  // Handle enrollment status change
  const handleEnrollmentStatusChange = async (enrollmentId: string, newStatus: string) => {
    try {
      await updateEnrollmentStatus(enrollmentId, newStatus);
      toast({
        title: 'Success',
        description: 'Enrollment status updated successfully'
      });
      fetchEnrollments(); // Refresh the list
    } catch (error: any) {
      console.error('Error updating enrollment status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update enrollment status',
        variant: 'destructive'
      });
    }
  };

  // Handle enrollment removal
  const handleRemoveEnrollment = async (enrollmentId: string, studentName: string, courseTitle: string) => {
    if (!confirm(`Are you sure you want to remove ${studentName} from "${courseTitle}"? This action cannot be undone.`)) return;

    try {
      await removeEnrollment(enrollmentId);
      toast({
        title: 'Success',
        description: `${studentName} has been removed from "${courseTitle}"`
      });
      fetchEnrollments(); // Refresh the list
    } catch (error: any) {
      console.error('Error removing enrollment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to remove enrollment',
        variant: 'destructive'
      });
    }
  };

  // Handle enrollment filter change
  const handleEnrollmentFilterChange = (status: string) => {
    setEnrollmentStatusFilter(status);
    setEnrollmentPagination(prev => ({ ...prev, current: 1 }));
  };

  // Reset form
  const resetForm = () => {
    setCourseForm({
      title: '',
      slug: '',
      description: '',
      short_description: '',
      category: '',
      level: 'beginner',
      price: 0,
      original_price: 0,
      thumbnail_url: '',
      video_intro_url: '',
      video_url: '',
      duration_hours: 0,
      certificate_available: true,
      max_students: 0,
      language: 'English',
      tags: [],
      requirements: '',
      learning_outcomes: '',
      status: 'draft'
    });
    setThumbnailPreview(null);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof CreateCourseData, value: any) => {
    setCourseForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'title') {
      setCourseForm(prev => ({
        ...prev,
        slug: generateCourseSlug(value)
      }));
    }
  };

  // Validate price comparison
  const validatePriceComparison = (price: number, originalPrice?: number): boolean => {
    if (originalPrice && originalPrice > 0 && price >= originalPrice) {
      return false;
    }
    return true;
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (file: File) => {
    try {
      setUploadingThumbnail(true);
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or GIF file',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be under 2MB',
          variant: 'destructive'
        });
        return;
      }
      
      const result = await uploadCourseThumbnail(file);
      
      // Update form with thumbnail URL
      setCourseForm(prev => ({
        ...prev,
        thumbnail_url: result.fileUrl
      }));
      
      // Set preview with full URL
      const fullThumbnailUrl = result.fileUrl.startsWith('http') 
        ? result.fileUrl 
        : `${API_BASE_URL.replace('/api', '')}${result.fileUrl}`;
      setThumbnailPreview(fullThumbnailUrl);
      
      toast({
        title: 'Success',
        description: 'Thumbnail uploaded successfully'
      });
      
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: 'Upload Failed',
        description: error.response?.data?.error || 'Failed to upload thumbnail',
        variant: 'destructive'
      });
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Create course
  const handleCreateCourse = async () => {
    try {
      setSaving(true);
      
      // Validate price comparison
      if (!validatePriceComparison(courseForm.price, courseForm.original_price)) {
        toast({
          title: 'Validation Error',
          description: 'Price must be smaller than Original Price',
          variant: 'destructive'
        });
        return;
      }
      
      await createCourse(courseForm);
      toast({
        title: 'Success',
        description: 'Course created successfully'
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create course',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Edit course
  const handleEditCourse = async () => {
    if (!selectedCourse) return;

    try {
      setSaving(true);
      
      // Validate price comparison
      if (!validatePriceComparison(courseForm.price, courseForm.original_price)) {
        toast({
          title: 'Validation Error',
          description: 'Price must be smaller than Original Price',
          variant: 'destructive'
        });
        return;
      }
      
      await updateCourse(selectedCourse.id, courseForm);
      toast({
        title: 'Success',
        description: 'Course updated successfully'
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchCourses();
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update course',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete course
  const handleDeleteCourse = async (course: Course) => {
    if (!confirm(`Are you sure you want to delete the course "${course.title}"? This action cannot be undone.`)) return;

    try {
      setLoading(true);
      await deleteCourse(course.id);
      toast({
        title: 'Success',
        description: `Course "${course.title}" deleted successfully`
      });
      fetchCourses();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to delete course';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
    setCourseForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      short_description: course.short_description || '',
      category: course.category,
      level: course.level,
      price: course.price,
      original_price: course.original_price || 0,
      thumbnail_url: course.thumbnail_url || '',
      video_intro_url: course.video_intro_url || '',
      duration_hours: course.duration_hours,
      certificate_available: course.certificate_available,
      max_students: course.max_students || 0,
      language: course.language,
      tags: course.tags || [],
      requirements: course.requirements || '',
      learning_outcomes: course.learning_outcomes || '',
      status: course.status
    });
    // Set thumbnail preview with full URL
    const existingThumbnailUrl = course.thumbnail_url;
    if (existingThumbnailUrl) {
      const fullThumbnailUrl = existingThumbnailUrl.startsWith('http') 
        ? existingThumbnailUrl 
        : `${API_BASE_URL.replace('/api', '')}${existingThumbnailUrl}`;
      setThumbnailPreview(fullThumbnailUrl);
    } else {
      setThumbnailPreview(null);
    }
    setIsEditDialogOpen(true);
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Course Management</h2>
          <p className="text-muted-foreground">
            Create and manage online courses
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchCourses}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={courseForm.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter course title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Course Slug</Label>
                    <Input
                      id="slug"
                      value={courseForm.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="course-slug"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter course description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="short_description">Short Description</Label>
                  <Textarea
                    id="short_description"
                    value={courseForm.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    placeholder="Brief description for course cards"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={courseForm.level} onValueChange={(value) => handleInputChange('level', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price (৳)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) ? "border-red-500" : ""}
                    />
                    {courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) && (
                      <p className="text-sm text-red-500 mt-1">Price must be smaller than Original Price</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="original_price">Original Price (৳)</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={courseForm.original_price}
                      onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className={courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) ? "border-red-500" : ""}
                    />
                    {courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) && (
                      <p className="text-sm text-red-500 mt-1">Original Price must be greater than Price</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration_hours">Duration (hours)</Label>
                    <Input
                      id="duration_hours"
                      type="number"
                      value={courseForm.duration_hours}
                      onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max_students">Max Students</Label>
                    <Input
                      id="max_students"
                      type="number"
                      value={courseForm.max_students}
                      onChange={(e) => handleInputChange('max_students', parseInt(e.target.value) || 0)}
                      placeholder="0 (unlimited)"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={courseForm.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    value={courseForm.video_url}
                    onChange={(e) => handleInputChange('video_url', e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                </div>
                <div>
                  <Label htmlFor="thumbnail">Course Thumbnail</Label>
                  <div className="space-y-2">
                    {thumbnailPreview && (
                      <div className="relative w-full max-w-md">
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setThumbnailPreview(null);
                            setCourseForm(prev => ({ ...prev, thumbnail_url: '' }));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Input
                        id="thumbnail"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleThumbnailUpload(file);
                          }
                        }}
                        disabled={uploadingThumbnail}
                        className="flex-1"
                      />
                      {uploadingThumbnail && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Recommended: 1280x720px (16:9), minimum 640px width, max 2MB. Formats: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      value={courseForm.requirements}
                      onChange={(e) => handleInputChange('requirements', e.target.value)}
                      placeholder="Course prerequisites and requirements"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="learning_outcomes">Learning Outcomes</Label>
                    <Textarea
                      id="learning_outcomes"
                      value={courseForm.learning_outcomes}
                      onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                      placeholder="What students will learn"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCourse} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Creating...' : 'Create Course'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">All Courses</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={course.status === 'published' ? 'default' : course.status === 'draft' ? 'secondary' : 'outline'}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </Badge>
                  </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(course)}
                    title="Edit Course"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCourse(course)}
                    title="Delete Course"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardTitle className="text-lg">{course.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {course.short_description || course.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Level</span>
                <Badge variant="outline" className="capitalize">{course.level}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Price</span>
                <span className="font-medium">{formatCoursePrice(course.price)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className={course.original_price && course.original_price > course.price ? "text-muted-foreground line-through" : "font-medium"}>
                  {course.original_price ? formatCoursePrice(course.original_price) : formatCoursePrice(course.price)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Students</span>
                <span>{course.enrolled_students || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>{course.duration_hours}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Language</span>
                <span>{course.language}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Max Students</span>
                <span>{course.max_students || 'Unlimited'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(course.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.filter(course => course.status === 'draft').map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        Draft
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course)}
                        title="Delete Course"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.short_description || course.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level</span>
                    <Badge variant="outline" className="capitalize">{course.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{formatCoursePrice(course.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className={course.original_price && course.original_price > course.price ? "text-muted-foreground line-through" : "font-medium"}>
                      {course.original_price ? formatCoursePrice(course.original_price) : formatCoursePrice(course.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span>{course.enrolled_students || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Students</span>
                    <span>{course.max_students || 'Unlimited'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {courses.filter(course => course.status === 'draft').length === 0 && (
            <div className="text-center py-10">
              <div className="text-muted-foreground">No draft courses found</div>
            </div>
          )}
        </TabsContent>

        {/* Archived Tab */}
        <TabsContent value="archived" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.filter(course => course.status === 'archived').map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Archived
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                        title="Edit Course"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course)}
                        title="Delete Course"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.short_description || course.description}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Level</span>
                    <Badge variant="outline" className="capitalize">{course.level}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-medium">{formatCoursePrice(course.price)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Original Price</span>
                    <span className={course.original_price && course.original_price > course.price ? "text-muted-foreground line-through" : "font-medium"}>
                      {course.original_price ? formatCoursePrice(course.original_price) : formatCoursePrice(course.price)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span>{course.enrolled_students || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{course.duration_hours}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span>{course.language}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Max Students</span>
                    <span>{course.max_students || 'Unlimited'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(course.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {courses.filter(course => course.status === 'archived').length === 0 && (
            <div className="text-center py-10">
              <div className="text-muted-foreground">No archived courses found</div>
            </div>
          )}
        </TabsContent>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course: {selectedCourse?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={courseForm.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Course Slug</Label>
                <Input
                  id="edit-slug"
                  value={courseForm.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  placeholder="course-slug"
                />
              </div>
            </div>
            <div>
               <Label htmlFor="edit-description">Description</Label>
               <Textarea
                 id="edit-description"
                 value={courseForm.description}
                 onChange={(e) => handleInputChange('description', e.target.value)}
                 placeholder="Enter course description"
                 rows={3}
               />
             </div>
             <div>
               <Label htmlFor="edit-short-description">Short Description</Label>
               <Textarea
                 id="edit-short-description"
                 value={courseForm.short_description}
                 onChange={(e) => handleInputChange('short_description', e.target.value)}
                 placeholder="Brief description for course cards"
                 rows={2}
               />
             </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-level">Level</Label>
                <Select value={courseForm.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">Price (৳)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) ? "border-red-500" : ""}
                />
                {courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) && (
                  <p className="text-sm text-red-500 mt-1">Price must be smaller than Original Price</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-original-price">Original Price (৳)</Label>
                <Input
                  id="edit-original-price"
                  type="number"
                  value={courseForm.original_price}
                  onChange={(e) => handleInputChange('original_price', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className={courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) ? "border-red-500" : ""}
                />
                {courseForm.original_price && courseForm.original_price > 0 && courseForm.price >= (courseForm.original_price || 0) && (
                  <p className="text-sm text-red-500 mt-1">Original Price must be greater than Price</p>
                )}
              </div>
              <div>
                <Label htmlFor="edit-duration-hours">Duration (hours)</Label>
                <Input
                  id="edit-duration-hours"
                  type="number"
                  value={courseForm.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-video-intro-url">Video Intro URL</Label>
              <Input
                id="edit-video-intro-url"
                value={courseForm.video_intro_url}
                onChange={(e) => handleInputChange('video_intro_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            <div>
              <Label htmlFor="edit-max-students">Max Students</Label>
              <Input
                id="edit-max-students"
                type="number"
                value={courseForm.max_students}
                onChange={(e) => handleInputChange('max_students', parseInt(e.target.value) || 0)}
                placeholder="0 (unlimited)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select value={courseForm.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-requirements">Requirements</Label>
                <Textarea
                  id="edit-requirements"
                  value={courseForm.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Course prerequisites and requirements"
                  rows={2}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-learning-outcomes">Learning Outcomes</Label>
              <Textarea
                id="edit-learning-outcomes"
                value={courseForm.learning_outcomes}
                onChange={(e) => handleInputChange('learning_outcomes', e.target.value)}
                placeholder="What students will learn"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-video-url">Video URL</Label>
              <Input
                id="edit-video-url"
                value={courseForm.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
              />
            </div>
            <div>
              <Label htmlFor="edit-thumbnail">Course Thumbnail</Label>
              <div className="space-y-2">
                {thumbnailPreview && (
                  <div className="relative w-full max-w-md">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setThumbnailPreview(null);
                        setCourseForm(prev => ({ ...prev, thumbnail_url: '' }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Input
                    id="edit-thumbnail"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleThumbnailUpload(file);
                      }
                    }}
                    disabled={uploadingThumbnail}
                    className="flex-1"
                  />
                  {uploadingThumbnail && (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended: 1280x720px (16:9), minimum 640px width, max 2MB. Formats: JPG, PNG, GIF
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCourse} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Updating...' : 'Update Course'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>



      {/* Enrollments Tab */}
      <TabsContent value="enrollments" className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-1 items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search enrollments..."
                className="pl-8 w-full md:w-[300px] lg:w-[400px]"
                value={enrollmentSearch}
                onChange={(e) => {
                  setEnrollmentSearch(e.target.value);
                  setEnrollmentPagination(prev => ({ ...prev, current: 1 }));
                }}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={enrollmentStatusFilter} onValueChange={handleEnrollmentFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchEnrollments}>
              <RefreshCw className={`h-4 w-4 mr-2 ${enrollmentsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Enrollments Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Enrollment Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollmentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="flex justify-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-green-600" />
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">Loading enrollments...</div>
                    </TableCell>
                  </TableRow>
                ) : enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <div className="text-muted-foreground">No enrollments found</div>
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {enrollment.student_avatar ? (
                              <img src={enrollment.student_avatar} alt={enrollment.student_name} className="w-8 h-8 rounded-full" />
                            ) : (
                              <span className="text-xs font-medium">{enrollment.student_name?.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{enrollment.student_name}</div>
                            <div className="text-sm text-muted-foreground">{enrollment.student_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{enrollment.course_title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{new Date(enrollment.enrollment_date).toLocaleDateString()}</div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={enrollment.status === 'active' ? 'default' : 
                                 enrollment.status === 'completed' ? 'outline' : 
                                 enrollment.status === 'cancelled' ? 'destructive' : 'secondary'}
                          className={enrollment.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <Badge variant={enrollment.payment_status === 'completed' ? 'default' : 
                                         enrollment.payment_status === 'pending' ? 'secondary' : 'destructive'}>
                            {enrollment.payment_status}
                          </Badge>
                        </div>
                        {enrollment.payment_amount && (
                          <div className="text-xs text-muted-foreground mt-1">
                            ৳{enrollment.payment_amount}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {enrollment.status !== 'active' && (
                              <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(enrollment.id, 'active')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {enrollment.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(enrollment.id, 'completed')}>
                                <Award className="mr-2 h-4 w-4" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {enrollment.status !== 'cancelled' && (
                              <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(enrollment.id, 'cancelled')}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                              </DropdownMenuItem>
                            )}
                            {enrollment.status !== 'expired' && (
                              <DropdownMenuItem onClick={() => handleEnrollmentStatusChange(enrollment.id, 'expired')}>
                                <Clock className="mr-2 h-4 w-4" />
                                Mark Expired
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleRemoveEnrollment(enrollment.id, enrollment.student_name || 'Student', enrollment.course_title || 'Course')}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {enrollmentPagination.total > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {enrollments.length} of {enrollmentPagination.totalItems} enrollments
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEnrollmentPagination(prev => ({ ...prev, current: prev.current - 1 }));
                  fetchEnrollments();
                }}
                disabled={!enrollmentPagination.hasPrev}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {enrollmentPagination.current} of {enrollmentPagination.total}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEnrollmentPagination(prev => ({ ...prev, current: prev.current + 1 }));
                  fetchEnrollments();
                }}
                disabled={!enrollmentPagination.hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </TabsContent>
      </Tabs>
    </div>
  );
}
