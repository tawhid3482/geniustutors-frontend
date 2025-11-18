import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorContactAssignment {
  id: string;
  contact_request_id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  tutor_avatar: string | null;
  qualification: string | null;
  experience: string | null;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_by: string;
  assigned_at: string;
  updated_at: string;
  notes: string | null;
  demo_class_id?: string;
  demo_date?: string;
  demo_duration?: number;
  demo_notes?: string;
  demo_status?: string;
}

export interface DemoClassData {
  createDemo: boolean;
  requestedDate: string;
  duration: number;
  notes?: string;
  subject?: string;
}

class TutorContactAssignmentService {
  private baseUrl = `${API_BASE_URL}/tutor-contact-requests`;

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
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Assign a tutor to a contact request
  async assignTutor(
    contactRequestId: string,
    tutorId: string,
    notes?: string,
    demoClass?: DemoClassData
  ): Promise<{ success: boolean; message: string; data: any }> {
    return this.request(`/${contactRequestId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ tutorId, notes, demoClass }),
    });
  }

  // Get all tutor assignments for a contact request
  async getContactRequestAssignments(contactRequestId: string): Promise<{ success: boolean; data: TutorContactAssignment[] }> {
    return this.request(`/${contactRequestId}/assignments`);
  }

  // Update assignment status
  async updateAssignmentStatus(
    contactRequestId: string,
    assignmentId: string,
    status: 'pending' | 'accepted' | 'rejected' | 'completed',
    notes?: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/${contactRequestId}/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  // Delete assignment
  async deleteAssignment(
    contactRequestId: string,
    assignmentId: string
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/${contactRequestId}/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }
}

export const tutorContactAssignmentService = new TutorContactAssignmentService();
