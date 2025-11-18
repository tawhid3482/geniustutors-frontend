"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, PlayCircle, BookOpen, CheckCircle, Lock, ArrowLeft, Star } from "lucide-react";
import { getCourseBySlug, getCourseProgress, updateLessonProgress, getMyEnrollments, type Course, type CourseProgress, type CourseEnrollment } from "@/services/courseService";
import { API_BASE_URL } from "@/config/api";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext.next";
import { PaymentPendingDialog } from "@/components/course/PaymentPendingDialog";
import Image from "next/image";

interface CourseDetailViewProps {
  courseSlug: string;
  onBack: () => void;
}

export function CourseDetailView({ courseSlug, onBack }: CourseDetailViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingProgress, setUpdatingProgress] = useState<string | null>(null);
  const [showPaymentPendingDialog, setShowPaymentPendingDialog] = useState(false);

  // Helper function to get full thumbnail URL
  const getThumbnailUrl = (thumbnailUrl: string | null | undefined): string | null => {
    if (!thumbnailUrl) return null;
    if (thumbnailUrl.startsWith('http')) return thumbnailUrl;
    return `${API_BASE_URL.replace('/api', '')}${thumbnailUrl}`;
  };

  // Helper function to check if URL is a YouTube video
  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Helper function to check if URL is a Vimeo video
  const isVimeoUrl = (url: string): boolean => {
    return url.includes('vimeo.com');
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    let videoId = '';
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    }
    
    return `https://www.youtube.com/embed/${videoId}`;
  };

  // Helper function to get Vimeo embed URL
  const getVimeoEmbedUrl = (url: string): string => {
    let videoId = '';
    
    if (url.includes('vimeo.com/')) {
      videoId = url.split('vimeo.com/')[1].split('?')[0];
    }
    
    return `https://player.vimeo.com/video/${videoId}`;
  };

  const loadCourseData = async () => {
    if (!courseSlug) return;
    
    try {
      setLoading(true);
      const courseData = await getCourseBySlug(courseSlug);
      setCourse(courseData);
      
      // Load enrollment and progress if user is logged in
      if (user) {
        try {
          // Get user's enrollments to check payment status
          const { enrollments } = await getMyEnrollments();
          const userEnrollment = enrollments.find(e => e.course_id === courseData.id);
          
          if (userEnrollment) {
            setEnrollment(userEnrollment);
            
            // Check payment status - restrict access for non-completed payments
            if (userEnrollment.payment_status !== 'completed') {
              setShowPaymentPendingDialog(true);
              setLoading(false);
              return;
            }
            
            // Load progress only if payment is completed
            try {
              const progressData = await getCourseProgress(courseData.id);
              setProgress(progressData);
            } catch (error) {
              console.log('Error loading progress:', error);
            }
          }
        } catch (error) {
          // User might not be enrolled, which is fine
          console.log('User not enrolled in this course');
        }
      }
    } catch (error) {
      console.error('Error loading course:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseSlug) {
      loadCourseData();
    }
  }, [courseSlug]);

  const handleLessonClick = async (lesson: any) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to access course content',
        variant: 'destructive'
      });
      return;
    }

    if (!enrollment) {
      toast({
        title: 'Not Enrolled',
        description: 'Please enroll in this course to access lessons',
        variant: 'destructive'
      });
      return;
    }

    if (enrollment.payment_status !== 'completed') {
      setShowPaymentPendingDialog(true);
      return;
    }

    if (!progress) {
      toast({
        title: 'Not Enrolled',
        description: 'Please enroll in this course to access lessons',
        variant: 'destructive'
      });
      return;
    }

    // Update progress to mark lesson as started
    try {
      setUpdatingProgress(lesson.id);
      await updateLessonProgress(lesson.id, {
        progress_percentage: 100,
        time_spent_seconds: 0,
        status: 'completed'
      });
      
      // Reload progress
      const updatedProgress = await getCourseProgress(course!.id);
      setProgress(updatedProgress);
      
      toast({
        title: 'Lesson Started',
        description: `Starting lesson: ${lesson.title}`
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to start lesson',
        variant: 'destructive'
      });
    } finally {
      setUpdatingProgress(null);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full space-y-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Not Found</h3>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  // If payment is not completed, show only the payment pending dialog
  if (enrollment && enrollment.payment_status !== 'completed') {
    return (
      <div className="w-full space-y-6">
        {/* Back Button */}
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Courses
          </Button>
        </div>

        {/* Payment Pending Dialog */}
        <PaymentPendingDialog
          isOpen={showPaymentPendingDialog}
          onClose={() => setShowPaymentPendingDialog(false)}
          courseTitle={course.title}
          paymentAmount={enrollment.payment_amount}
          paymentMethod={enrollment.payment_method}
          transactionId={enrollment.transaction_id}
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back Button */}
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Courses
        </Button>
      </div>

      {/* Course Header */}
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div className="h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-t-lg overflow-hidden">
              {course.video_intro_url ? (
                isYouTubeUrl(course.video_intro_url) ? (
                  <iframe
                    className="w-full h-full"
                    src={getYouTubeEmbedUrl(course.video_intro_url)}
                    title={course.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isVimeoUrl(course.video_intro_url) ? (
                  <iframe
                    className="w-full h-full"
                    src={getVimeoEmbedUrl(course.video_intro_url)}
                    title={course.title}
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    className="w-full h-full object-cover"
                    controls
                    preload="metadata"
                    poster={getThumbnailUrl(course.thumbnail_url) || undefined}
                  >
                    <source src={course.video_intro_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )
              ) : getThumbnailUrl(course.thumbnail_url) ? (
                <Image 
                  src={getThumbnailUrl(course.thumbnail_url)!} 
                  alt={course.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-green-600" />
                </div>
              )}
            </div>
            <Badge className="absolute top-4 left-4 bg-green-600">{course.category}</Badge>
            <Badge variant="secondary" className="absolute top-4 right-4">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Course Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-900">{course.title}</CardTitle>
          
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{course.duration_hours}h</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{course.total_lessons} lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{course.enrolled_students || 0} students</span>
            </div>
            {course.featured && (
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Featured</span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Course Short Description */}
          {course.short_description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Overview</h3>
              <p className="text-gray-700 leading-relaxed">{course.short_description}</p>
            </div>
          )}
          
          {/* Course Long Description */}
          {course.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About This Course</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{course.description}</p>
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {course.learning_outcomes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What You'll Learn</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{course.learning_outcomes}</p>
              </div>
            </div>
          )}

          {/* Requirements */}
          {course.requirements && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed">{course.requirements}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Course Content */}
      {course.modules && course.modules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900">Course Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.modules.map((module: any) => (
              <Card key={module.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span>{module.title}</span>
                    <span className="text-sm text-gray-600">
                      {module.lesson_count} lessons • {module.total_duration} min
                    </span>
                  </CardTitle>
                  {module.description && (
                    <p className="text-sm text-gray-600">{module.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {module.lessons?.map((lesson: any) => {
                      const lessonProgress = progress?.lessons.find(l => l.id === lesson.id);
                      const isCompleted = lessonProgress?.progress_status === 'completed';
                      const isAccessible = (enrollment?.payment_status === 'completed' && progress) || lesson.is_free;
                      
                      return (
                        <div 
                          key={lesson.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : isAccessible ? (
                              <PlayCircle className="h-5 w-5 text-gray-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                            <div>
                              <h4 className="font-medium text-sm">{lesson.title}</h4>
                              <p className="text-xs text-gray-600">{lesson.duration_minutes} min</p>
                            </div>
                          </div>
                          
                          {isAccessible ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLessonClick(lesson)}
                              disabled={updatingProgress === lesson.id}
                            >
                              {isCompleted ? 'Review' : 'Start'}
                            </Button>
                          ) : (
                            <Badge variant="secondary">Locked</Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
