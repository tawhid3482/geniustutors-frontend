import axios from 'axios';
import { getAuthToken } from '@/utils/auth';
import { API_BASE_URL } from '@/constants/api';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  testimonial: string;
  isActive: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialsResponse {
  success: boolean;
  data: Testimonial[];
  message?: string;
}

// Fetch all active testimonials (public)
export const getTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await axios.get('/api/testimonials');
    if (response.data.success) {
      return response.data.data.filter((testimonial: Testimonial) => testimonial.isActive);
    }
    throw new Error(response.data.message || 'Failed to fetch testimonials');
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return default testimonials if API call fails
    return [
      {
        id: 1,
        name: "Afsana Akter Rupa",
        role: "Service Holder",
        location: "Shahjadpur, Dhaka",
        avatar: "/placeholder.svg",
        testimonial: "My experience with Caretutors has always been very good. Through this platform I found good tutors according to my needs. Thanks to Caretutors.",
        isActive: true,
        rating: 5,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      }
    ];
  }
};

// Admin: Fetch all testimonials (including inactive)
export const getAllTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const token = getAuthToken();
    const response = await axios.get('/api/admin/testimonials/admin', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch testimonials');
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    throw error;
  }
};

// Admin: Create new testimonial
export const createTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<Testimonial> => {
  try {
    const token = getAuthToken();
    const response = await axios.post('/api/admin/testimonials', testimonialData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create testimonial');
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

// Admin: Update testimonial
export const updateTestimonial = async (id: number, testimonialData: Partial<Testimonial>): Promise<Testimonial> => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`/api/admin/testimonials/${id}`, testimonialData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update testimonial');
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
};

// Admin: Delete testimonial
export const deleteTestimonial = async (id: number): Promise<void> => {
  try {
    const token = getAuthToken();
    const response = await axios.delete(`/api/admin/testimonials/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete testimonial');
    }
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

// Admin: Toggle testimonial active status
export const toggleTestimonialStatus = async (id: number): Promise<Testimonial> => {
  try {
    const token = getAuthToken();
    const response = await axios.patch(`/api/admin/testimonials/${id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to toggle testimonial status');
  } catch (error) {
    console.error('Error toggling testimonial status:', error);
    throw error;
  }
};
