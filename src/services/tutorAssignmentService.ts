import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorAssignment {
  id: string;
  tutor_request_id: string;
  tutor_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_by: string;
  assigned_at: string;
  updated_at: string;
  notes: string | null;
  // Request details
  student_name?: string;
  subject?: string;
  location?: string;
  budget?: string;
  class_level?: string;
}

class TutorAssignmentService {
  private baseUrl = `${API_BASE_URL}/tutor-assignments`;

  private async request<T>(
    endpoint: string = '',
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all assignments for the logged-in tutor
  async getTutorAssignments(): Promise<{ success: boolean; data: TutorAssignment[] }> {
    return this.request<{ success: boolean; data: TutorAssignment[] }>('/');
  }

  // Update assignment status
  async updateAssignmentStatus(
    assignmentId: string,
    status: 'accepted' | 'rejected' | 'completed',
    notes?: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    return this.request<{ success: boolean; message: string; data: any }>(`/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Get assignment details
  async getAssignmentDetails(assignmentId: string): Promise<{ success: boolean; data: TutorAssignment }> {
    return this.request<{ success: boolean; data: TutorAssignment }>(`/${assignmentId}`);
  }
}

export const tutorAssignmentService = new TutorAssignmentService();