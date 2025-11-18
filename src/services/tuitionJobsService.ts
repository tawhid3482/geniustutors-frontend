import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TuitionJob {
  id: string;
  studentName: string;
  studentFullName?: string;
  studentEmail?: string;
  numberOfStudents: number;
  studentGender: 'Male' | 'Female' | 'Mixed';
  district: string;
  area: string;
  postOffice?: string;
  locationDetails: string;
  medium: 'English' | 'Bangla' | 'Both';
  studentClass: string;
  subject: string;
  category?: string;
  tutoringType: 'Home Tutoring' | 'Online Tutoring' | 'Both';
  preferredTeacherGender: 'Male' | 'Female' | 'Any';
  daysPerWeek: number;
  tutoringTime: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  budget?: string;
  experienceRequired?: string;
  availability?: string;
  extraInformation: string;
  adminNote?: string;
  updateNotice?: string;
  status: 'active' | 'inactive' | 'completed' | 'assign';
  urgent?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TuitionJobsResponse {
  success: boolean;
  data: TuitionJob[];
}

class TuitionJobsService {
  private baseUrl = `${API_BASE_URL}/tutor-requests`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };
    
    // Only add authentication if required
    if (requiresAuth) {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401 && requiresAuth) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all tutor requests (for tuition jobs page)
  async getAllTuitionJobs(params?: {
    status?: string;
    subject?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<TuitionJobsResponse & { pagination?: any }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    // Set default limit if not specified
    if (!params?.limit) {
      queryParams.append('limit', '12');
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    // Pass false to indicate authentication is not required
    const response = await this.request<any>(endpoint, {}, false);
    
    // Transform the data to match the expected format
    if (response.success && response.data) {
      const transformedData = response.data.map((job: any) => ({
        id: job.id,
        studentName: job.student_name || job.studentName || 'Anonymous Student',
        studentFullName: job.student_full_name || job.student_name || job.studentName,
        studentEmail: job.student_email || '',
        numberOfStudents: job.number_of_students || job.numberOfStudents || 1,
        studentGender: job.student_gender || job.studentGender || 'Mixed',
        district: job.district || '',
        area: job.area || '',
        postOffice: job.post_office || job.postOffice || '',
        locationDetails: job.location_details || job.locationDetails || '',
        medium: job.medium || 'Both',
        studentClass: job.student_class || job.studentClass || '',
        subject: job.subject || '',
        tutoringType: job.tutoring_type || job.tutoringType || 'Home Tutoring',
        preferredTeacherGender: job.preferred_teacher_gender || job.preferredTeacherGender || 'Any',
        daysPerWeek: job.days_per_week || job.daysPerWeek || 0,
        tutoringTime: job.tutoring_time || job.tutoringTime || 'Flexible',
        salaryRangeMin: parseFloat(job.salary_range_min) || job.salaryRangeMin || 0,
        salaryRangeMax: parseFloat(job.salary_range_max) || job.salaryRangeMax || 0,
        budget: job.budget || '',
        experienceRequired: job.experience_required || job.experienceRequired || '',
        availability: job.availability || '',
        extraInformation: job.extra_information || job.extraInformation || '',
        adminNote: job.admin_note || job.adminNote || '',
        updateNotice: job.update_notice || job.updateNotice || '',
        status: job.status || 'active',
        urgent: job.urgent || false,
        createdAt: job.created_at || job.createdAt,
        updatedAt: job.updated_at || job.updatedAt
      }));
      
      return {
        success: response.success,
        data: transformedData
      };
    }
    
    return response;
  }

  // Get a single tuition job by ID
  async getTuitionJobById(jobId: string): Promise<{ success: boolean; data: TuitionJob; message?: string }> {
    const response = await this.request<any>(`/${jobId}`, {}, false);
    
    if (response.success && response.data) {
      const job = response.data;
      const transformedJob: TuitionJob = {
        id: job.id,
        studentName: job.student_name || job.studentName || 'Anonymous Student',
        studentFullName: job.student_full_name || job.student_name || job.studentName,
        studentEmail: job.student_email || '',
        numberOfStudents: job.number_of_students || job.numberOfStudents || 1,
        studentGender: job.student_gender || job.studentGender || 'Mixed',
        district: job.district || '',
        area: job.area || '',
        postOffice: job.post_office || job.postOffice || '',
        locationDetails: job.location_details || job.locationDetails || '',
        medium: job.medium || 'Both',
        studentClass: job.student_class || job.studentClass || '',
        subject: job.subject || '',
        tutoringType: job.tutoring_type || job.tutoringType || 'Home Tutoring',
        preferredTeacherGender: job.preferred_teacher_gender || job.preferredTeacherGender || 'Any',
        daysPerWeek: job.days_per_week || job.daysPerWeek || 0,
        tutoringTime: job.tutoring_time || job.tutoringTime || 'Flexible',
        salaryRangeMin: parseFloat(job.salary_range_min) || job.salaryRangeMin || 0,
        salaryRangeMax: parseFloat(job.salary_range_max) || job.salaryRangeMax || 0,
        budget: job.budget || '',
        experienceRequired: job.experience_required || job.experienceRequired || '',
        availability: job.availability || '',
        extraInformation: job.extra_information || job.extraInformation || '',
        adminNote: job.admin_note || job.adminNote || '',
        updateNotice: job.update_notice || job.updateNotice || '',
        status: job.status || 'active',
        urgent: job.urgent || false,
        createdAt: job.created_at || job.createdAt,
        updatedAt: job.updated_at || job.updatedAt
      };
      
      return {
        success: response.success,
        data: transformedJob,
        message: response.message
      };
    }
    
    return response;
  }

  // Apply for a tuition job (tutors only)
  async applyForJob(jobId: string, notes?: string): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request(`/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }, true);
  }

  // Get tutor's applications
  async getMyApplications(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: any[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/my-applications${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint, {}, true);
  }

  // Check if tutor has already applied for a specific job
  async checkTutorApplication(jobId: string): Promise<{ success: boolean; data?: any; message?: string }> {
    return this.request(`/${jobId}/check-application`, {}, true);
  }

  // Reset application status to allow re-application
  async resetApplication(jobId: string): Promise<{ success: boolean; message: string; data?: any }> {
    return this.request(`/${jobId}/reset-application`, {
      method: 'POST',
    }, true);
  }
}

export const tuitionJobsService = new TuitionJobsService();