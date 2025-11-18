import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface TutorContactRequest {
  id: number;
  tutor_id: number;
  tutor_name?: string;
  full_name: string;
  phone_number: string;
  details: string | null;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TutorContactRequestFormData {
  tutorId: string | number;
  fullName: string;
  phoneNumber: string;
  details?: string;
}

class TutorContactRequestsService {
  private baseUrl = `${API_BASE_URL}/tutor-contact-requests`;

  private async request<T>(
    endpoint: string = '',
    options: RequestInit = {}
  ): Promise<T> {
    const token = getAuthToken();
    
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

  // Submit a new tutor contact request
  async submitContactRequest(data: TutorContactRequestFormData): Promise<{ success: boolean; message: string; data: any }> {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get all contact requests for a specific tutor
  async getTutorContactRequests(tutorId: string | number): Promise<{ success: boolean; data: TutorContactRequest[] }> {
    return this.request(`/tutor/${tutorId}`);
  }

  // Get all contact requests (admin only)
  async getAllContactRequests(): Promise<{ success: boolean; data: TutorContactRequest[] }> {
    return this.request('');
  }

  // Update contact request status and details
  async updateContactRequestStatus(id: string | number, status: TutorContactRequest['status'], details?: string): Promise<{ success: boolean; message: string }> {
    const body: any = { status };
    if (details !== undefined) {
      body.details = details;
    }
    
    return this.request(`/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // Delete a contact request (admin only)
  async deleteContactRequest(id: string | number): Promise<{ success: boolean; message: string }> {
    return this.request(`/${id}`, {
      method: 'DELETE',
    });
  }
}

export const tutorContactRequestsService = new TutorContactRequestsService();