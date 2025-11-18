"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, RefreshCw, Clock, Users, Star, Calendar, Play } from "lucide-react";
import { CourseEnrollment } from "@/services/courseService";
import { API_BASE_URL } from "@/config/api";
import { CourseDetailView } from "./CourseDetailView";

interface StudentCoursesProps {
  enrollments: CourseEnrollment[];
  isLoadingEnrollments: boolean;
}

export function StudentCourses({
  enrollments,
  isLoadingEnrollments
}: StudentCoursesProps) {
  const [selectedCourseSlug, setSelectedCourseSlug] = useState<string | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  // Helper function to get full thumbnail URL
  const getThumbnailUrl = (thumbnailUrl: string | null | undefined): string | null => {
    if (!thumbnailUrl) return null;
    if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
    return `${API_BASE_URL.replace('/api', '')}${thumbnailUrl}`;
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'cancelled': return 'bg-red-600';
      case 'expired': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  // Helper function to get payment status color
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'pending': return 'bg-yellow-600';
      case 'failed': return 'bg-red-600';
      case 'refunded': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  // Handle course detail view
  const handleContinueLearning = (slug: string | undefined) => {
    if (slug) {
      setSelectedCourseSlug(slug);
      setShowCourseDetail(true);
    } else {
      // Fallback to courses page if no slug
      window.location.href = '/courses';
    }
  };

  const handleBackToCourses = () => {
    setShowCourseDetail(false);
    setSelectedCourseSlug(null);
  };

  // Show course detail view if a course is selected
  if (showCourseDetail && selectedCourseSlug) {
    return (
      <CourseDetailView 
        courseSlug={selectedCourseSlug} 
        onBack={handleBackToCourses} 
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green-600" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingEnrollments ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your courses...</p>
            </div>
          ) : (enrollments || []).length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">You haven't enrolled in any courses yet.</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700" 
                onClick={() => window.location.href = '/courses'}
              >
                Browse Courses
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {(enrollments || []).map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                      {getThumbnailUrl(enrollment.thumbnail_url) ? (
                        <img 
                          src={getThumbnailUrl(enrollment.thumbnail_url)!} 
                          alt={enrollment.course_title || 'Course'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-16 w-16 text-green-600" />
                      )}
                    </div>
                    <Badge className={`absolute top-4 left-4 ${getStatusColor(enrollment.status)}`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {enrollment.course_title || 'Untitled Course'}
                    </CardTitle>
                    {enrollment.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {enrollment.short_description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled:</span>
                      <span>{new Date(enrollment.enrollment_date).toLocaleDateString()}</span>
                    </div>
                    
                    {enrollment.last_accessed && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last accessed:</span>
                        <span>{new Date(enrollment.last_accessed).toLocaleDateString()}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Payment:</span>
                      <Badge 
                        variant={enrollment.payment_status === 'completed' ? 'default' : 'outline'}
                        className={getPaymentStatusColor(enrollment.payment_status)}
                      >
                        {enrollment.payment_status.charAt(0).toUpperCase() + enrollment.payment_status.slice(1)}
                      </Badge>
                    </div>

                    {enrollment.payment_amount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">${enrollment.payment_amount}</span>
                      </div>
                    )}
                    
                    <div className="pt-3 border-t space-y-2">
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => handleContinueLearning(enrollment.slug)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continue Learning
                      </Button>
                      
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
