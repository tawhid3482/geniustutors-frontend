'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Search, Filter, Download, Plus, BookOpen, GraduationCap, BarChart2, ArrowUpRight, ArrowDownRight, Users, Calendar, CheckCircle, XCircle, Eye, Trash, Edit, FileText } from "lucide-react";
import { useRole } from '@/contexts/RoleContext';

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviews: number;
  price: string;
  originalPrice: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  description?: string;
}

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'refunded' | 'expired';
  progress: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
  amount: string;
}

interface CourseAnalytics {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalRevenue: string;
  monthlyRevenue: string;
  averageRating: string;
  popularCategories: { name: string; count: number }[];
}

export function CourseManagementSection() {
  const { toast } = useToast();
  const { canDelete } = useRole();
  
  // State for courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course>>({});
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    status: 'draft',
    level: 'Beginner',
    category: 'General'
  });
  
  // State for enrollments
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>([]);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  
  // State for analytics
  const [analytics, setAnalytics] = useState<CourseAnalytics>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalRevenue: '৳0',
    monthlyRevenue: '৳0',
    averageRating: '0',
    popularCategories: []
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data for initial display
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Complete SSC Mathematics Course',
      instructor: 'Dr. Ahmed Rahman',
      category: 'Mathematics',
      level: 'Intermediate',
      duration: '6 months',
      lessons: 48,
      students: 1250,
      rating: 4.9,
      reviews: 98,
      price: '৳4,999',
      originalPrice: '৳7,999',
      status: 'active',
      createdAt: '2023-05-15'
    },
    {
      id: '2',
      title: 'HSC Physics Complete Guide',
      instructor: 'Prof. Fatima Khan',
      category: 'Physics',
      level: 'Advanced',
      duration: '8 months',
      lessons: 65,
      students: 890,
      rating: 4.8,
      reviews: 76,
      price: '৳6,999',
      originalPrice: '৳9,999',
      status: 'active',
      createdAt: '2023-06-20'
    },
    {
      id: '3',
      title: 'English Language Mastery',
      instructor: 'Sarah Johnson',
      category: 'English',
      level: 'Beginner',
      duration: '3 months',
      lessons: 36,
      students: 2100,
      rating: 4.7,
      reviews: 145,
      price: '৳3,499',
      originalPrice: '৳4,999',
      status: 'active',
      createdAt: '2023-07-10'
    },
    {
      id: '4',
      title: 'Chemistry Fundamentals',
      instructor: 'Dr. Karim Ahmed',
      category: 'Chemistry',
      level: 'Intermediate',
      duration: '4 months',
      lessons: 42,
      students: 760,
      rating: 4.6,
      reviews: 68,
      price: '৳4,499',
      originalPrice: '৳5,999',
      status: 'draft',
      createdAt: '2023-08-05'
    },
    {
      id: '5',
      title: 'IELTS Preparation Masterclass',
      instructor: 'Prof. Elizabeth Taylor',
      category: 'English',
      level: 'Advanced',
      duration: '2 months',
      lessons: 24,
      students: 1850,
      rating: 4.9,
      reviews: 178,
      price: '৳4,499',
      originalPrice: '৳5,999',
      status: 'archived',
      createdAt: '2023-04-12'
    }
  ];
  
  const mockEnrollments: Enrollment[] = [
    {
      id: '1',
      studentName: 'Rahul Khan',
      studentEmail: 'rahul.khan@example.com',
      courseTitle: 'Complete SSC Mathematics Course',
      enrollmentDate: '2023-06-10',
      status: 'active',
      progress: 45,
      paymentStatus: 'paid',
      amount: '৳4,999'
    },
    {
      id: '2',
      studentName: 'Anika Rahman',
      studentEmail: 'anika.rahman@example.com',
      courseTitle: 'HSC Physics Complete Guide',
      enrollmentDate: '2023-07-15',
      status: 'active',
      progress: 30,
      paymentStatus: 'paid',
      amount: '৳6,999'
    },
    {
      id: '3',
      studentName: 'Farhan Ahmed',
      studentEmail: 'farhan.ahmed@example.com',
      courseTitle: 'English Language Mastery',
      enrollmentDate: '2023-05-20',
      status: 'completed',
      progress: 100,
      paymentStatus: 'paid',
      amount: '৳3,499'
    },
    {
      id: '4',
      studentName: 'Nusrat Jahan',
      studentEmail: 'nusrat.jahan@example.com',
      courseTitle: 'Complete SSC Mathematics Course',
      enrollmentDate: '2023-08-05',
      status: 'active',
      progress: 15,
      paymentStatus: 'pending',
      amount: '৳4,999'
    },
    {
      id: '5',
      studentName: 'Imran Hossain',
      studentEmail: 'imran.hossain@example.com',
      courseTitle: 'IELTS Preparation Masterclass',
      enrollmentDate: '2023-04-30',
      status: 'refunded',
      progress: 10,
      paymentStatus: 'failed',
      amount: '৳4,499'
    }
  ];
  
  // Load mock data on component mount
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCourses(mockCourses);
      setFilteredCourses(mockCourses);
      setEnrollments(mockEnrollments);
      setFilteredEnrollments(mockEnrollments);
      
      // Set analytics
      setAnalytics({
        totalCourses: mockCourses.length,
        activeCourses: mockCourses.filter(c => c.status === 'active').length,
        totalStudents: mockCourses.reduce((sum, course) => sum + course.students, 0),
        totalRevenue: '৳1,250,000',
        monthlyRevenue: '৳175,000',
        averageRating: (mockCourses.reduce((sum, course) => sum + course.rating, 0) / mockCourses.length).toFixed(1),
        popularCategories: [
          { name: 'Mathematics', count: 1 },
          { name: 'Physics', count: 1 },
          { name: 'English', count: 2 },
          { name: 'Chemistry', count: 1 }
        ]
      });
      
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter courses based on search query and filters
  useEffect(() => {
    let filtered = [...courses];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(course => course.category === categoryFilter);
    }
    
    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(course => course.level === levelFilter);
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchQuery, statusFilter, categoryFilter, levelFilter]);
  
  // Handle adding a new course
  const handleAddCourse = () => {
    if (!newCourse.title || !newCourse.instructor || !newCourse.price) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    const courseId = Math.random().toString(36).substring(2, 9);
    const course: Course = {
      id: courseId,
      title: newCourse.title || '',
      instructor: newCourse.instructor || '',
      category: newCourse.category || 'General',
      level: newCourse.level || 'Beginner',
      duration: newCourse.duration || '3 months',
      lessons: newCourse.lessons || 0,
      students: 0,
      rating: 0,
      reviews: 0,
      price: newCourse.price || '৳0',
      originalPrice: newCourse.originalPrice || newCourse.price || '৳0',
      status: newCourse.status as 'active' | 'draft' | 'archived' || 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setCourses([course, ...courses]);
    setShowAddCourseModal(false);
    setNewCourse({
      status: 'draft',
      level: 'Beginner',
      category: 'General'
    });
    
    toast({
      title: 'Course Added',
      description: 'The course has been added successfully'
    });
  };
  
  // Handle course status change
  const handleStatusChange = (courseId: string, newStatus: 'active' | 'draft' | 'archived') => {
    setCourses(courses.map(course => 
      course.id === courseId ? { ...course, status: newStatus } : course
    ));
    
    toast({
      title: 'Status Updated',
      description: `Course status changed to ${newStatus}`
    });
  };
  
  // Handle course deletion
  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(course => course.id !== courseId));
    
    toast({
      title: 'Course Deleted',
      description: 'The course has been deleted successfully'
    });
  };

  // Handle course editing
  const handleEditCourse = () => {
    if (!selectedCourse || !editingCourse.title) return;
    
    setCourses(courses.map(course => 
      course.id === selectedCourse.id ? { ...course, ...editingCourse } : course
    ));
    
    setShowEditModal(false);
    setEditingCourse({});
    setSelectedCourse(null);
    
    toast({
      title: 'Course Updated',
      description: 'The course has been updated successfully'
    });
  };

  // Open edit modal
  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setEditingCourse({ ...course });
    setShowEditModal(true);
  };
  
  // Get unique categories for filter
  const categories = ['all', ...Array.from(new Set(courses.map(course => course.category)))];
  
  // Get unique levels for filter
  const levels = ['all', ...Array.from(new Set(courses.map(course => course.level)))];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Course Management</h2>
          <p className="text-muted-foreground">
            Manage your online courses, enrollments, and analytics
          </p>
        </div>
        <Button 
          onClick={() => setShowAddCourseModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>
      
      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Total Courses</p>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.totalCourses}</div>
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+{Math.floor(Math.random() * 10) + 1}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {analytics.activeCourses} active courses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Total Students</p>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.totalStudents.toLocaleString()}</div>
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+{Math.floor(Math.random() * 15) + 5}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {enrollments.filter(e => e.status === 'active').length} active enrollments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Total Revenue</p>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.totalRevenue}</div>
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+{Math.floor(Math.random() * 20) + 10}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              {analytics.monthlyRevenue} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Average Rating</p>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{analytics.averageRating}/5.0</div>
              <div className="text-xs text-green-500 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                <span>+{Math.floor(Math.random() * 5) + 1}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground pt-1">
              Based on {courses.reduce((sum, course) => sum + course.reviews, 0)} reviews
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="courses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>
        
        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search courses..."
                  className="pl-8 w-full md:w-[300px] lg:w-[400px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <div className="p-2 space-y-2">
                    <div>
                      <Label>Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === 'all' ? 'All Categories' : category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Level</Label>
                      <Select value={levelFilter} onValueChange={setLevelFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                          {levels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level === 'all' ? 'All Levels' : level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline" size="sm" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          
          {/* Courses Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">Loading courses...</div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="text-muted-foreground">No courses found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.category}</TableCell>
                        <TableCell>{course.students.toLocaleString()}</TableCell>
                        <TableCell>{course.price}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={course.status === 'active' ? 'default' : 
                                   course.status === 'draft' ? 'outline' : 'secondary'}
                            className={course.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </Badge>
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
                              <DropdownMenuItem onClick={() => {
                                setSelectedCourse(course);
                                setShowCourseModal(true);
                              }}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedCourse(course);
                                setShowEditModal(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Course
                              </DropdownMenuItem>
                              {course.status !== 'active' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'active')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              {course.status !== 'draft' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'draft')}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Set as Draft
                                </DropdownMenuItem>
                              )}
                              {course.status !== 'archived' && (
                                <DropdownMenuItem onClick={() => handleStatusChange(course.id, 'archived')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Archive
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem 
                                  className="text-red-600" 
                                  onClick={() => handleDeleteCourse(course.id)}
                                >
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              )}
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
        </TabsContent>
        
        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search enrollments..."
                className="pl-8 w-full md:w-[300px] lg:w-[400px]"
              />
            </div>
            <Button variant="outline" size="sm" className="h-10">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
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
                    <TableHead>Progress</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex justify-center">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">Loading enrollments...</div>
                      </TableCell>
                    </TableRow>
                  ) : enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="text-muted-foreground">No enrollments found</div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div className="font-medium">{enrollment.studentName}</div>
                          <div className="text-sm text-muted-foreground">{enrollment.studentEmail}</div>
                        </TableCell>
                        <TableCell>{enrollment.courseTitle}</TableCell>
                        <TableCell>{enrollment.enrollmentDate}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={enrollment.status === 'active' ? 'default' : 
                                   enrollment.status === 'completed' ? 'outline' : 
                                   enrollment.status === 'refunded' ? 'destructive' : 'secondary'}
                            className={enrollment.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">{enrollment.progress}%</span>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={enrollment.paymentStatus === 'paid' ? 'default' : 
                                   enrollment.paymentStatus === 'pending' ? 'outline' : 'destructive'}
                            className={enrollment.paymentStatus === 'paid' ? 'bg-green-500 hover:bg-green-600' : ''}
                          >
                            {enrollment.paymentStatus.charAt(0).toUpperCase() + enrollment.paymentStatus.slice(1)}
                          </Badge>
                          <div className="text-xs mt-1">{enrollment.amount}</div>
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
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Enrollment
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="mr-2 h-4 w-4" />
                                Cancel Enrollment
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
        </TabsContent>
      </Tabs>
      
      {/* Add Course Modal */}
      <Dialog open={showAddCourseModal} onOpenChange={setShowAddCourseModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Course</DialogTitle>
            <DialogDescription>
              Create a new course to add to your platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title || ''}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="Enter course title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor || ''}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  placeholder="Enter instructor name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newCourse.category || 'General'}
                  onValueChange={(value) => setNewCourse({...newCourse, category: value})}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select 
                  value={newCourse.level || 'Beginner'}
                  onValueChange={(value) => setNewCourse({...newCourse, level: value})}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={newCourse.duration || ''}
                  onChange={(e) => setNewCourse({...newCourse, duration: e.target.value})}
                  placeholder="e.g. 3 months"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessons">Number of Lessons</Label>
                <Input
                  id="lessons"
                  type="number"
                  value={newCourse.lessons || ''}
                  onChange={(e) => setNewCourse({...newCourse, lessons: parseInt(e.target.value)})}
                  placeholder="e.g. 24"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  value={newCourse.price || ''}
                  onChange={(e) => setNewCourse({...newCourse, price: e.target.value})}
                  placeholder="e.g. ৳4,999"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (Optional)</Label>
                <Input
                  id="originalPrice"
                  value={newCourse.originalPrice || ''}
                  onChange={(e) => setNewCourse({...newCourse, originalPrice: e.target.value})}
                  placeholder="e.g. ৳7,999"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newCourse.status || 'draft'}
                onValueChange={(value) => setNewCourse({...newCourse, status: value as 'active' | 'draft' | 'archived'})}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourse.description || ''}
                onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Enter course description"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCourseModal(false)}>Cancel</Button>
            <Button onClick={handleAddCourse} className="bg-green-600 hover:bg-green-700">Add Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Course Details Modal */}
      {selectedCourse && (
        <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Course Details</DialogTitle>
              <DialogDescription>
                Detailed information about the course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedCourse.title}</h3>
                <p className="text-sm text-muted-foreground">Instructor: {selectedCourse.instructor}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p>{selectedCourse.category}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p>{selectedCourse.level}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Duration</p>
                  <p>{selectedCourse.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Lessons</p>
                  <p>{selectedCourse.lessons}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Students</p>
                  <p>{selectedCourse.students.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Rating</p>
                  <p>{selectedCourse.rating}/5 ({selectedCourse.reviews} reviews)</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p>{selectedCourse.price}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge 
                    variant={selectedCourse.status === 'active' ? 'default' : 
                           selectedCourse.status === 'draft' ? 'outline' : 'secondary'}
                    className={selectedCourse.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {selectedCourse.status.charAt(0).toUpperCase() + selectedCourse.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium">Created On</p>
                <p>{selectedCourse.createdAt}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCourseModal(false)}>Close</Button>
              <Button 
                variant="default" 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  setShowCourseModal(false);
                  openEditModal(selectedCourse);
                }}
              >
                Edit Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Course Modal */}
      {showEditModal && selectedCourse && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course information below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Course Title</Label>
                  <Input
                    id="edit-title"
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, title: e.target.value})}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-instructor">Instructor</Label>
                  <Input
                    id="edit-instructor"
                    value={editingCourse.instructor || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, instructor: e.target.value})}
                    placeholder="Enter instructor name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={editingCourse.category || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, category: e.target.value})}
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-level">Level</Label>
                  <Select 
                    value={editingCourse.level || 'Beginner'} 
                    onValueChange={(value) => setEditingCourse({...editingCourse, level: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration</Label>
                  <Input
                    id="edit-duration"
                    value={editingCourse.duration || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, duration: e.target.value})}
                    placeholder="e.g., 6 months"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price</Label>
                  <Input
                    id="edit-price"
                    value={editingCourse.price || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, price: e.target.value})}
                    placeholder="e.g., ৳4,999"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-original-price">Original Price</Label>
                  <Input
                    id="edit-original-price"
                    value={editingCourse.originalPrice || ''}
                    onChange={(e) => setEditingCourse({...editingCourse, originalPrice: e.target.value})}
                    placeholder="e.g., ৳7,999"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-lessons">Lessons</Label>
                  <Input
                    id="edit-lessons"
                    type="number"
                    value={editingCourse.lessons || 0}
                    onChange={(e) => setEditingCourse({...editingCourse, lessons: parseInt(e.target.value) || 0})}
                    placeholder="Number of lessons"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-students">Students</Label>
                  <Input
                    id="edit-students"
                    type="number"
                    value={editingCourse.students || 0}
                    onChange={(e) => setEditingCourse({...editingCourse, students: parseInt(e.target.value) || 0})}
                    placeholder="Number of students"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingCourse.status || 'draft'} 
                  onValueChange={(value: 'active' | 'draft' | 'archived') => setEditingCourse({...editingCourse, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleEditCourse}
                className="bg-green-600 hover:bg-green-700"
              >
                Update Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}