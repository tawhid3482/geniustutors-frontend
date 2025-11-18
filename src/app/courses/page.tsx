'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext.next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, PlayCircle, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { 
  getCourses, 
  enrollInCourse, 
  getMyEnrollments,
  isEnrolledInCourse,
  formatCoursePrice,
  calculateDiscountPercentage,
  type Course,
  type CourseEnrollment
} from "@/services/courseService";
import { API_BASE_URL } from "@/config/api";
import { CourseEnrollmentDialog } from "@/components/course/CourseEnrollmentDialog";
import { LoginDialog } from "@/components/auth/LoginDialog";

// Metadata is exported from page-metadata.ts file

export default function CoursesPage() {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false
  });

  // Helper function to get full thumbnail URL
  const getThumbnailUrl = (thumbnailUrl: string | null | undefined): string | null => {
    if (!thumbnailUrl) return null;
    if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
    return `${API_BASE_URL.replace('/api', '')}${thumbnailUrl}`;
  };

  // Fetch courses and enrollments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [coursesData, enrollmentsData] = await Promise.all([
          getCourses({ page: 1, limit: 12 }),
          user ? getMyEnrollments() : Promise.resolve({enrollments: []})
        ]);
        
        // Check if coursesData has the expected structure
        if (coursesData && coursesData.courses) {
          setCourses(coursesData.courses);
          setPagination(coursesData.pagination || {
            current: 1,
            total: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
          });
        } else {
          // Fallback if the response doesn't have the expected structure
          setCourses([]);
          setPagination({
            current: 1,
            total: 1,
            totalItems: 0,
            hasNext: false,
            hasPrev: false
          });
        }
        
        setEnrollments(enrollmentsData?.enrollments || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback values on error
        setCourses([]);
        setPagination({
          current: 1,
          total: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        });
        setEnrollments([]);
        toast({
          title: 'Error',
          description: 'Failed to load courses',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    try {
      setLoading(true);
      const coursesData = await getCourses({ 
        page: 1, 
        limit: 12, 
        search: value 
      });
      
      // Check if coursesData has the expected structure
      if (coursesData && coursesData.courses) {
        setCourses(coursesData.courses);
        setPagination(coursesData.pagination || {
          current: 1,
          total: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        });
      } else {
        // Fallback if the response doesn't have the expected structure
        setCourses([]);
        setPagination({
          current: 1,
          total: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      // Set fallback values on error
      setCourses([]);
      setPagination({
        current: 1,
        total: 1,
        totalItems: 0,
        hasNext: false,
        hasPrev: false
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSuccess = async () => {
    // Refresh enrollments
    const updatedEnrollments = await getMyEnrollments();
    setEnrollments(updatedEnrollments.enrollments || []);
  };



  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12 overflow-x-hidden w-full">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-3 sm:mb-4">
          Online Courses
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Learn at your own pace with our comprehensive online courses designed by expert educators
        </p>
        {user && user.role !== 'student' && user.role !== 'tutor' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-xs sm:text-sm text-green-800">
              Course enrollment is available for students and tutors only. 
              {user.role === 'admin' || user.role === 'super_admin' ? ' As an administrator, you can manage courses from the admin dashboard.' : ''}
            </p>
          </div>
        )}
        {!user && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
            <p className="text-xs sm:text-sm text-yellow-800">
              Please log in or sign up to enroll in courses.
            </p>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 sm:mb-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="space-y-2">
                <Label htmlFor="courseSearch" className="text-sm font-medium text-purple-800">Search Courses</Label>
                <div className="relative">
                  <Input 
                    id="courseSearch" 
                    placeholder="Search by title, instructor, or category..." 
                    className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500 h-10 sm:h-11"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600" />
                </div>
              </div>


            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Count */}
      <div className="mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-muted-foreground">
          Showing <span className="font-medium text-foreground">{courses.length}</span> courses
          {pagination.totalItems > 0 && (
            <span> of {pagination.totalItems} total</span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-green-600" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <PlayCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-sm sm:text-base text-gray-500">Try adjusting your search criteria or check back later for new courses.</p>
        </div>
      ) : (
      <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-2">
          {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="relative">
              <div className="h-40 sm:h-48 bg-gradient-subtle flex items-center justify-center">
                {getThumbnailUrl(course.thumbnail_url) ? (
                  <Image 
                    src={getThumbnailUrl(course.thumbnail_url)!} 
                    alt={course.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                <PlayCircle className="h-12 w-12 sm:h-16 sm:w-16 text-primary opacity-80" />
                )}
              </div>
              <Badge variant="secondary" className="absolute top-3 sm:top-4 right-3 sm:right-4 text-xs">
                {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
              </Badge>
            </div>
            
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl line-clamp-2">{course.title}</CardTitle>
              <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span>{course.enrolled_students || 0} students</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2">
                {course.short_description || course.description}
              </p>
              
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span>{course.duration_hours}h</span>
              </div>

              <div className="pt-3 sm:pt-4 border-t">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      {formatCoursePrice(course.price)}
                    </span>
                    {course.original_price && (
                      <span className="text-xs sm:text-sm text-muted-foreground line-through">
                        {formatCoursePrice(course.original_price)}
                      </span>
                    )}
                  </div>
                  {course.original_price && (
                  <Badge variant="destructive" className="text-xs">
                      {calculateDiscountPercentage(course.price, course.original_price)}% OFF
                  </Badge>
                  )}
                </div>
                
                                {isEnrolledInCourse(enrollments, course.id) ? (
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base h-10 sm:h-11"
                    onClick={() => {
                      // Redirect to appropriate dashboard based on user role
                      if (user?.role === 'student') {
                        window.location.href = '/student';
                      } else if (user?.role === 'tutor') {
                        window.location.href = '/tutor';
                      } else {
                        // Fallback to student dashboard for other roles
                        window.location.href = '/student';
                      }
                    }}
                  >
                    Continue Learning
                  </Button>
                ) : !user ? (
                  <LoginDialog>
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold py-2 sm:py-3 rounded-lg text-sm sm:text-base h-10 sm:h-11"
                    >
                      Login to Enroll
                    </Button>
                  </LoginDialog>
                ) : user.role !== 'student' && user.role !== 'tutor' ? (
                  <Button 
                    className="w-full bg-gray-400 hover:bg-gray-500 text-white shadow-lg transition-all duration-300 font-bold py-2 sm:py-3 rounded-lg cursor-not-allowed text-sm sm:text-base h-10 sm:h-11"
                    disabled
                  >
                    Log in to Enroll
                  </Button>
                ) : (
                  <CourseEnrollmentDialog 
                    course={course} 
                    onEnrollmentSuccess={handleEnrollmentSuccess}
                  >
                    <Button 
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 font-bold py-2 sm:py-3 rounded-lg text-sm sm:text-base h-10 sm:h-11"
                    >
                      Enroll Now
                    </Button>
                  </CourseEnrollmentDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}
