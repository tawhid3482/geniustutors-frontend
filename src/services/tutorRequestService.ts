import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorRequestFormData {
  phoneNumber: string;
  studentGender: 'male' | 'female' | 'both';
  district: string;
  area: string;
  thana:string;
  detailedLocation: string;
  selectedCategories: string[];
  selectedSubjects: string[];
  selectedClasses: string[];
  tutorGenderPreference: 'male' | 'female' | 'any';
  isSalaryNegotiable: boolean;
  salaryRange: {
    min: number | string;
    max: number | string;
  };
  extraInformation: string;
  subject?: string;
  studentClass?: string;
  userId:string;
  // New fields
  medium: 'Bangla Medium' | 'English Version' | 'English Medium' | 'Religious Studies' | 'Admission Test' | 'Professional Skill Development' | 'Arts' | 'Special Skill Development' | 'Uni Help' | 'Language Learning' | 'Test Preparation' | 'Madrasa Medium' | 'Special Child Education';
  numberOfStudents: number;
  tutoringDays: number;
  tutoringTime: string;
  tutoringDuration: string;
  tutoringType: 'Home Tutoring' | 'Online Tutoring' | 'Both';
}

export interface TutorAssignment {
  id: string;
  tutor_request_id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  tutor_avatar: string | null;
  qualification: string | null;
  experience: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_by: string;
  assigned_by_name?: string;
  assigned_at: string;
  updated_at: string;
  notes: string | null;
  demo_class_id?: string;
  demo_date?: string;
  demo_duration?: number;
  demo_status?: string;
  demo_notes?: string;
}

export interface UpdateNoticeHistory {
  id: string;
  updateNotice: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: string;
  createdAt: string;
}

export interface TutorRequest extends TutorRequestFormData {
  id: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'Assign';
  createdAt: string;
  updatedAt: string;
  matchedTutors: TutorAssignment[];
}

class TutorRequestService {
  private baseUrl = `${API_BASE_URL.replace('/api', '')}/api/tutor-requests`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
 
    
    let config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Only add authentication if required
    if (requireAuth) {
      const token = getAuthToken();
      
      if (!token) {
        console.error('No authentication token found');
        throw new Error('No authentication token found. Please log in again.');
      }
      
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }



    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
    
  

    if (!response.ok) {
      console.error('Response not OK, parsing error data...');
      const errorData = await response.json().catch(() => ({}));
      
      console.error('Error data:', errorData);
      
      if (response.status === 401 && requireAuth) {
        console.error('Authentication failed');
        throw new Error('Authentication failed. Please log in again.');
      }
      
      // Log the error for debugging
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        endpoint,
        errorData
      });
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
 
    
    return data;
  }

  // Create a new tutor request (authenticated)
  async createTutorRequest(data: TutorRequestFormData): Promise<{ success: boolean; message: string; data: any }> {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }
  
  // Create a new tutor request (unauthenticated)
  async createPublicTutorRequest(data: TutorRequestFormData): Promise<{ success: boolean; message: string; data: any }> {
    return this.request('/public', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Create a new tutor request from tutor profile (unauthenticated)
  async createPublicTutorRequestFromTutor(tutorId: string, data: TutorRequestFormData): Promise<{ success: boolean; message: string; data: any }> {
    return this.request(`/public/from-tutor/${tutorId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Get all tutor requests for the current student
  async getStudentTutorRequests(): Promise<{ success: boolean; data: TutorRequest[] }> {
 
    try {
      const result = await this.request('/student') as { success: boolean; data: TutorRequest[] };
      return result;
    } catch (error) {
      console.error('Service request failed:', error);
      throw error;
    }
  }

  // Delete a tutor request by the current student
  async deleteTutorRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/student/${requestId}`, {
      method: 'DELETE',
    });
  }

  // Get all tutor requests (for admin/tutor view)
  async getAllTutorRequests(params?: {
    status?: string;
    subject?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: TutorRequest[] }> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request(endpoint);
  }

  // Get a specific tutor request by ID
  async getTutorRequestById(id: string): Promise<{ success: boolean; data: TutorRequest }> {
    return this.request(`/${id}`);
  }

  // Update tutor request status
  async updateTutorRequestStatus(id: string, status: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Update tutor request
  async updateTutorRequest(
    id: string,
    data: Partial<TutorRequestFormData> & { adminNote?: string; updateNotice?: string; updateNoticeBy?: string; updateNoticeByName?: string }
  ): Promise<{ success: boolean; message: string; data: any }> {

    
    return this.request(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete a tutor request (admin only)
  async deleteTutorRequestAdmin(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get all tutor assignments for a tuition request
  async getTutorAssignments(requestId: string): Promise<{ success: boolean; data: TutorAssignment[] }> {
    return this.request(`/${requestId}/assignments`);
  }

  // Assign a tutor to a tuition request
  async assignTutor(
    requestId: string, 
    tutorId: string, 
    notes?: string, 
    demoClass?: {
      createDemo: boolean;
      requestedDate: string;
      duration?: number;
      notes?: string;
    },
    notificationOptions?: {
      sendEmailNotification?: boolean;
      sendSMSNotification?: boolean;
    }
  ): Promise<{ success: boolean; message: string; data: any }> {
    const token = getAuthToken();
    const requestBody = { 
      tutorId, 
      notes, 
      demoClass,
      // Backend will extract assigner from token; include optional display name if available in local storage profile
      assignedByName: (() => {
        try {
          const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
          if (!raw) return undefined;
          const u = JSON.parse(raw);
          return u?.name || u?.full_name || u?.email || undefined;
        } catch {
          return undefined;
        }
      })(),
      sendEmailNotification: notificationOptions?.sendEmailNotification !== undefined ? notificationOptions.sendEmailNotification : true,
      sendSMSNotification: notificationOptions?.sendSMSNotification !== undefined ? notificationOptions.sendSMSNotification : true
    };
    
 
    
    return this.request(`/${requestId}/assign`, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  // Update assignment status
  async updateAssignmentStatus(
    requestId: string, 
    assignmentId: string, 
    status: 'pending' | 'accepted' | 'rejected' | 'completed',
    notes?: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    return this.request(`/${requestId}/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Delete an assignment
  async deleteAssignment(requestId: string, assignmentId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/${requestId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // Get update notice history for a tuition request
  async getUpdateNoticeHistory(requestId: string): Promise<{ success: boolean; data: UpdateNoticeHistory[]; message?: string }> {
    return this.request(`/${requestId}/update-notice-history`, {
      method: 'GET',
    });
  }
}

export const tutorRequestService = new TutorRequestService();