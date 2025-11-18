import { api } from '@/config/api';

export interface TutorContactRequest {
  id: string;
  tutor_id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  admin_notes?: string;
  contacted_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  tutor_avatar?: string;
  tutor_district?: string;
}

export interface TutorContactRequestStats {
  total: number;
  pending: number;
  contacted: number;
  completed: number;
  rejected: number;
}

export interface CreateContactRequestData {
  tutorId: string;
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  message: string;
  // Alternative parameter names for compatibility
  fullName?: string;
  phoneNumber?: string;
}

export interface UpdateContactRequestData {
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  adminNotes?: string;
}

// Create a new tutor contact request
export const createTutorContactRequest = async (data: CreateContactRequestData) => {
  try {
    // Send both parameter formats for compatibility
    const requestData = {
      ...data,
      // Include alternative parameter names
      fullName: data.contactName,
      phoneNumber: data.contactPhone,
    };
    
    const response = await api.post('/tutor-contact-requests', requestData);
    return response;
  } catch (error) {
    console.error('Error creating tutor contact request:', error);
    throw error;
  }
};

// Get all tutor contact requests (admin only)
export const getTutorContactRequests = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/tutor-contact-requests?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor contact requests:', error);
    throw error;
  }
};

// Get contact request by ID (admin only)
export const getTutorContactRequestById = async (id: string) => {
  try {
    const response = await api.get(`/tutor-contact-requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor contact request:', error);
    throw error;
  }
};

// Update contact request status (admin only)
export const updateTutorContactRequestStatus = async (id: string, data: UpdateContactRequestData) => {
  try {
    const response = await api.patch(`/tutor-contact-requests/${id}/status`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating tutor contact request status:', error);
    throw error;
  }
};

// Delete contact request (admin only)
export const deleteTutorContactRequest = async (id: string) => {
  try {
    const response = await api.delete(`/tutor-contact-requests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting tutor contact request:', error);
    throw error;
  }
};

// Get contact request statistics (admin only)
export const getTutorContactRequestStats = async () => {
  try {
    const response = await api.get('/tutor-contact-requests/stats/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching tutor contact request stats:', error);
    throw error;
  }
};

// Service object for backward compatibility
export const tutorContactService = {
  createTutorContactRequest,
  getTutorContactRequests,
  getTutorContactRequestById,
  updateTutorContactRequestStatus,
  deleteTutorContactRequest,
  getTutorContactRequestStats,
};
