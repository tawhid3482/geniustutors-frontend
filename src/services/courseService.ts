import { api, API_BASE_URL } from '@/config/api';

// ==================== INTERFACES ====================

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  instructor_id: string;
  instructor_name: string;
  instructor_avatar?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  original_price?: number;
  thumbnail_url?: string;
  video_intro_url?: string;
  duration_hours: number;
  total_lessons: number;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  certificate_available: boolean;
  max_students?: number;
  language: string;
  tags?: string[];
  requirements?: string;
  learning_outcomes?: string;
  enrolled_students?: number;
  avg_progress?: number;
  total_modules?: number;
  modules?: CourseModule[];
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  duration_hours: number;
  total_lessons: number;
  is_free: boolean;
  lesson_count?: number;
  total_duration?: number;
  lessons?: CourseLesson[];
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content_type: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  video_provider?: 'youtube' | 'vimeo' | 'custom' | 'file';
  video_id?: string;
  attachments?: any[];
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  completion_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  progress_percentage: number;
  last_accessed?: string;
  certificate_issued: boolean;
  certificate_url?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount?: number;
  payment_method?: string;
  transaction_id?: string;
  course_title?: string;
  short_description?: string;
  thumbnail_url?: string;
  slug?: string;
  instructor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseProgress {
  enrollment: CourseEnrollment;
  lessons: Array<CourseLesson & {
    module_title: string;
    progress_status?: 'not_started' | 'in_progress' | 'completed';
    progress_percentage?: number;
    time_spent_seconds?: number;
    completed_at?: string;
  }>;
}

export interface CreateCourseData {
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  original_price?: number;
  thumbnail_url?: string;
  video_intro_url?: string;
  video_url?: string;
  duration_hours: number;
  certificate_available: boolean;
  max_students?: number;
  language: string;
  tags?: string[];
  requirements?: string;
  learning_outcomes?: string;
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  total_lessons?: number;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
}

export interface CreateModuleData {
  title: string;
  description?: string;
  order_index?: number;
  is_free?: boolean;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  content_type?: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index?: number;
  is_free?: boolean;
  video_provider?: 'youtube' | 'vimeo' | 'custom' | 'file';
  video_id?: string;
  attachments?: any[];
}

export interface CoursesResponse {
  courses: Course[];
  pagination: {
    current: number;
    total: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==================== API FUNCTIONS ====================

// Get all courses (public)
export const getCourses = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  level?: string;
  search?: string;
  featured?: boolean;
}): Promise<CoursesResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/courses?${searchParams.toString()}`);
    console.log('Courses API response:', response); // Debug log
    return response;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Get all courses for admin management (admin only)
export const getAdminCourses = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<CoursesResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/courses/admin/all?${searchParams.toString()}`);
    console.log('Admin courses API response:', response); // Debug log
    return response;
  } catch (error) {
    console.error('Error fetching admin courses:', error);
    throw error;
  }
};

// Get tutor's own courses (tutor only)
export const getMyCourses = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<CoursesResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/courses/my-courses?${searchParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching my courses:', error);
    throw error;
  }
};

// Get course by slug (public)
export const getCourseBySlug = async (slug: string): Promise<Course> => {
  try {
    const response = await api.get(`/courses/${slug}`);
    return response;
  } catch (error) {
    console.error('Error fetching course:', error);
    throw error;
  }
};

// Get course details by ID (for enrollment dialog)
export const getCourseDetails = async (courseId: string): Promise<Course> => {
  try {
    const response = await api.get(`/courses/details/${courseId}`);
    return response;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw error;
  }
};

// Create course (admin/tutor only)
export const createCourse = async (courseData: CreateCourseData): Promise<{ message: string; courseId: string }> => {
  try {
    const response = await api.post('/courses', courseData);
    return response;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update course (admin/tutor only)
export const updateCourse = async (courseId: string, courseData: UpdateCourseData): Promise<{ message: string }> => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete course (admin/tutor only)
export const deleteCourse = async (courseId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/courses/${courseId}`);
    return response;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Get modules for a course
export const getCourseModules = async (courseId: string): Promise<CourseModule[]> => {
  try {
    const response = await api.get(`/courses/${courseId}/modules`);
    return response;
  } catch (error) {
    console.error('Error fetching course modules:', error);
    throw error;
  }
};

// Create module
export const createModule = async (courseId: string, moduleData: CreateModuleData): Promise<{ message: string; moduleId: string }> => {
  try {
    const response = await api.post(`/courses/${courseId}/modules`, moduleData);
    return response;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

// Get lessons for a module
export const getModuleLessons = async (moduleId: string): Promise<CourseLesson[]> => {
  try {
    const response = await api.get(`/courses/modules/${moduleId}/lessons`);
    return response;
  } catch (error) {
    console.error('Error fetching module lessons:', error);
    throw error;
  }
};

// Create lesson
export const createLesson = async (moduleId: string, lessonData: CreateLessonData): Promise<{ message: string; lessonId: string }> => {
  try {
    const response = await api.post(`/courses/modules/${moduleId}/lessons`, lessonData);
    return response;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

// Enroll in a course
export const enrollInCourse = async (courseId: string, paymentData?: {
  payment_method?: string;
  transaction_id?: string;
}): Promise<{ message: string; enrollmentId: string }> => {
  try {
    const response = await api.post(`/courses/${courseId}/enroll`, paymentData || {});
    return response;
  } catch (error) {
    console.error('Error enrolling in course:', error);
    throw error;
  }
};

// Get user enrollments
export const getMyEnrollments = async (): Promise<{enrollments: CourseEnrollment[]}> => {
  try {
    const response = await api.get('/courses/enrollments/my');
    // The backend returns the enrollments directly as an array
    const enrollments = Array.isArray(response) ? response : [];
    return { enrollments };
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    // Return empty array on error instead of throwing
    return { enrollments: [] };
  }
};


// Update lesson progress
export const updateLessonProgress = async (lessonId: string, progressData: {
  progress_percentage: number;
  time_spent_seconds: number;
  status: 'not_started' | 'in_progress' | 'completed';
}): Promise<{ message: string }> => {
  try {
    const response = await api.post(`/courses/lessons/${lessonId}/progress`, progressData);
    return response;
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};

// Get course progress
export const getCourseProgress = async (courseId: string): Promise<CourseProgress> => {
  try {
    const response = await api.get(`/courses/${courseId}/progress`);
    return response;
  } catch (error) {
    console.error('Error fetching course progress:', error);
    throw error;
  }
};

// ==================== UTILITY FUNCTIONS ====================

// Generate course slug from title
export const generateCourseSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Format course duration
export const formatCourseDuration = (hours: number): string => {
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours === 1) {
    return '1 hour';
  } else {
    return `${hours} hours`;
  }
};

// Format course price
export const formatCoursePrice = (price: number, currency: string = '৳'): string => {
  return `${currency}${price.toLocaleString()}`;
};

// Calculate course discount percentage
export const calculateDiscountPercentage = (price: number, originalPrice: number): number => {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

// Check if user is enrolled in course
export const isEnrolledInCourse = (enrollments: CourseEnrollment[], courseId: string): boolean => {
  return enrollments.some(enrollment => 
    enrollment.course_id === courseId && enrollment.status === 'active'
  );
};

// Get course progress percentage
export const getCourseProgressPercentage = (enrollments: CourseEnrollment[], courseId: string): number => {
  const enrollment = enrollments.find(e => e.course_id === courseId);
  return enrollment?.progress_percentage || 0;
};

// ==================== COURSE ANALYTICS ====================

export interface CourseAnalytics {
  course: {
    id: string;
    title: string;
    instructor_id: string;
  };
  period: string;
  stats: {
    total_enrollments: number;
    active_enrollments: number;
    completed_enrollments: number;
    avg_progress: number;
    total_revenue: number;
  };
  dailyEnrollments: Array<{
    date: string;
    enrollments: number;
    revenue: number;
  }>;
  lessonStats: Array<{
    lesson_title: string;
    lesson_id: string;
    total_attempts: number;
    completed_attempts: number;
    avg_progress: number;
  }>;
  studentDemographics: Array<{
    gender: string;
    count: number;
  }>;
}

// Get course analytics
export const getCourseAnalytics = async (courseId: string, period: string = '30d'): Promise<CourseAnalytics> => {
  try {
    const response = await api.get(`/courses/${courseId}/analytics?period=${period}`);
    return response;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

// ==================== STUDENT MANAGEMENT ====================

export interface CourseStudent {
  id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  completion_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  progress_percentage: number;
  last_accessed?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount?: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  gender?: string;
  joined_date: string;
}

export interface StudentsResponse {
  students: CourseStudent[];
  pagination: {
    current: number;
    total: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Get course students
export const getCourseStudents = async (
  courseId: string,
  params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }
): Promise<StudentsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/courses/${courseId}/students?${searchParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching course students:', error);
    throw error;
  }
};

// ==================== ENROLLMENT MANAGEMENT ====================

export interface Enrollment {
  id: string;
  course_id: string;
  student_id: string;
  enrollment_date: string;
  completion_date?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  progress_percentage: number;
  last_accessed?: string;
  certificate_issued: boolean;
  certificate_url?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_amount?: number;
  payment_method?: string;
  transaction_id?: string;
  course_title?: string;
  thumbnail_url?: string;
  slug?: string;
  student_name?: string;
  student_email?: string;
  student_avatar?: string;
  instructor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface EnrollmentsResponse {
  enrollments: Enrollment[];
  pagination: {
    current: number;
    total: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Get all enrollments (admin only)
export const getAllEnrollments = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  course_id?: string;
}): Promise<EnrollmentsResponse> => {
  try {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/courses/enrollments/all?${searchParams.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    throw error;
  }
};

// Update enrollment status (admin only)
export const updateEnrollmentStatus = async (enrollmentId: string, status: string): Promise<{ message: string }> => {
  try {
    const response = await api.put(`/courses/enrollments/${enrollmentId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    throw error;
  }
};

// Remove enrollment (admin only)
export const removeEnrollment = async (enrollmentId: string): Promise<{ message: string }> => {
  try {
    const response = await api.delete(`/courses/enrollments/${enrollmentId}`);
    return response;
  } catch (error) {
    console.error('Error removing enrollment:', error);
    throw error;
  }
};

// ==================== STUDENT DASHBOARD ====================

export interface LearningDashboard {
  enrolledCourses: Array<CourseEnrollment & {
    title: string;
    thumbnail_url?: string;
    slug: string;
    duration_hours: number;
    instructor_name: string;
    total_modules: number;
    total_lessons: number;
  }>;
  recentActivity: Array<{
    id: string;
    enrollment_id: string;
    lesson_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage: number;
    time_spent_seconds: number;
    completed_at?: string;
    lesson_title: string;
    module_title: string;
    course_title: string;
    course_slug: string;
    updated_at: string;
  }>;
  certificates: Array<{
    id: string;
    enrollment_id: string;
    certificate_number: string;
    issued_date: string;
    certificate_url?: string;
    course_title: string;
    course_slug: string;
  }>;
  stats: {
    total_courses: number;
    completed_courses: number;
    avg_progress: number;
    total_hours_learned: number;
  };
}

// Get student learning dashboard
export const getLearningDashboard = async (): Promise<LearningDashboard> => {
  try {
    const response = await api.get('/courses/dashboard/learning');
    return response;
  } catch (error) {
    console.error('Error fetching learning dashboard:', error);
    throw error;
  }
};

// ==================== COURSE CONTENT MANAGEMENT ====================

export interface CreateModuleData {
  title: string;
  description?: string;
  order_index?: number;
  is_free?: boolean;
}

export interface CreateLessonData {
  title: string;
  description?: string;
  content_type?: 'video' | 'text' | 'pdf' | 'quiz' | 'assignment';
  content_url?: string;
  content_text?: string;
  duration_minutes?: number;
  order_index?: number;
  is_free?: boolean;
  video_provider?: 'youtube' | 'vimeo' | 'custom' | 'file';
  video_id?: string;
  attachments?: any[];
}

// Create course module
export const createCourseModule = async (courseId: string, data: CreateModuleData): Promise<CourseModule> => {
  try {
    const response = await api.post(`/courses/${courseId}/modules`, data);
    return response;
  } catch (error) {
    console.error('Error creating module:', error);
    throw error;
  }
};

// Create course lesson
export const createCourseLesson = async (moduleId: string, data: CreateLessonData): Promise<CourseLesson> => {
  try {
    const response = await api.post(`/modules/${moduleId}/lessons`, data);
    return response;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
};

// ==================== ASSIGNMENT MANAGEMENT ====================

export interface CourseAssignment {
  id: string;
  lesson_id: string;
  title: string;
  description?: string;
  assignment_type: 'quiz' | 'essay' | 'project' | 'presentation';
  due_date?: string;
  max_score: number;
  instructions?: string;
  rubric?: any;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  submission_files?: any[];
  score?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  graded_by?: string;
  status: 'submitted' | 'graded' | 'late';
  student_name: string;
  student_email: string;
  student_avatar?: string;
}

export interface CreateAssignmentData {
  title: string;
  description?: string;
  assignment_type?: 'quiz' | 'essay' | 'project' | 'presentation';
  due_date?: string;
  max_score?: number;
  instructions?: string;
  rubric?: any;
}

// Create assignment
export const createAssignment = async (lessonId: string, data: CreateAssignmentData): Promise<CourseAssignment> => {
  try {
    const response = await api.post(`/lessons/${lessonId}/assignments`, data);
    return response;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Get assignment submissions
export const getAssignmentSubmissions = async (assignmentId: string): Promise<AssignmentSubmission[]> => {
  try {
    const response = await api.get(`/assignments/${assignmentId}/submissions`);
    return response;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

// Grade assignment submission
export const gradeSubmission = async (submissionId: string, data: { score: number; feedback?: string }): Promise<void> => {
  try {
    await api.put(`/submissions/${submissionId}/grade`, data);
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

// Upload course thumbnail
export const uploadCourseThumbnail = async (file: File): Promise<{ fileUrl: string; dimensions: { width: number; height: number; aspectRatio: number } }> => {
  try {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await api.upload('/uploads/course-thumbnail', formData);
    return response;
  } catch (error) {
    console.error('Error uploading course thumbnail:', error);
    throw error;
  }
};

