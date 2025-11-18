import axiosInstance from '@/lib/axios';

export interface VideoTestimonial {
  id: number;
  name: string;
  role: string;
  location: string;
  avatar: string;
  videoUrl: string;
  thumbnail?: string;
  duration: string;
  testimonial: string;
  isActive: boolean;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoTestimonialsResponse {
  success: boolean;
  data: VideoTestimonial[];
  message?: string;
}

// Fetch all active video testimonials (public)
export const getVideoTestimonials = async (): Promise<VideoTestimonial[]> => {
  try {
    const response = await axiosInstance.get('/video-testimonials');
    if (response.data.success) {
      return response.data.data.filter((testimonial: VideoTestimonial) => testimonial.isActive);
    }
    throw new Error(response.data.message || 'Failed to fetch video testimonials');
  } catch (error) {
    console.error('Error fetching video testimonials:', error);
    // Return default video testimonials if API call fails
    return [
      {
        id: 1,
        name: "Sarah Rahman",
        role: "HSC Student",
        location: "Dhanmondi, Dhaka",
        avatar: "/placeholder.svg",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "2:45",
        testimonial: "Tutor Today helped me find the perfect math tutor. My grades improved from 60% to 95% in just 3 months.",
        isActive: true,
        rating: 5,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z"
      }
    ];
  }
};

// Admin: Fetch all video testimonials (including inactive)
export const getAllVideoTestimonials = async (): Promise<VideoTestimonial[]> => {
  try {
    const response = await axiosInstance.get('/admin/video-testimonials');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch video testimonials');
  } catch (error) {
    console.error('Error fetching all video testimonials:', error);
    throw error;
  }
};

// Admin: Create new video testimonial
export const createVideoTestimonial = async (testimonialData: Omit<VideoTestimonial, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoTestimonial> => {
  try {
    const response = await axiosInstance.post('/admin/video-testimonials', testimonialData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create video testimonial');
  } catch (error) {
    console.error('Error creating video testimonial:', error);
    throw error;
  }
};

// Admin: Update video testimonial
export const updateVideoTestimonial = async (id: number, testimonialData: Partial<VideoTestimonial>): Promise<VideoTestimonial> => {
  try {
    const response = await axiosInstance.put(`/admin/video-testimonials/${id}`, testimonialData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to update video testimonial');
  } catch (error) {
    console.error('Error updating video testimonial:', error);
    throw error;
  }
};

// Admin: Delete video testimonial
export const deleteVideoTestimonial = async (id: number): Promise<void> => {
  try {
    const response = await axiosInstance.delete(`/admin/video-testimonials/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete video testimonial');
    }
  } catch (error) {
    console.error('Error deleting video testimonial:', error);
    throw error;
  }
};

// Admin: Toggle video testimonial active status
export const toggleVideoTestimonialStatus = async (id: number): Promise<VideoTestimonial> => {
  try {
    const response = await axiosInstance.patch(`/admin/video-testimonials/${id}/toggle-status`, {});
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to toggle video testimonial status');
  } catch (error) {
    console.error('Error toggling video testimonial status:', error);
    throw error;
  }
};
