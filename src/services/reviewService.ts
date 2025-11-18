import { api } from '@/config/api';

export interface Review {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  subject: string;
  response?: string;
  response_created_at?: string;
  created_at: string;
  updated_at: string;
  student_name: string;
  student_email: string;
  tutor_name: string;
  tutor_email: string;
}

export interface TutorReview {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  subject: string;
  response?: string;
  response_created_at?: string;
  created_at: string;
  updated_at: string;
  reviewer_name: string;
  reviewer_avatar?: string;
}

export interface ReviewStats {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  average_rating: number;
  five_star_reviews: number;
  four_star_reviews: number;
  three_star_reviews: number;
  two_star_reviews: number;
  one_star_reviews: number;
}

export interface ReviewFilters {
  search?: string;
  status?: string;
  rating?: string;
}

export interface ReviewResponse {
  id: string;
  review_id: string;
  response: string;
  created_at: string;
}

// Get all reviews
export const getReviews = async (filters?: ReviewFilters): Promise<{ data: Review[]; total: number }> => {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.rating) params.append('rating', filters.rating);

    const response = await api.get(`/reviews?${params.toString()}`);
    console.log('=== REVIEW SERVICE DEBUG: Raw API Response ===');
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Response pagination:', response.pagination);
    
    return {
      data: response.data || [],
      total: response.pagination?.total || 0
    };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Get review by ID
export const getReviewById = async (id: string): Promise<Review> => {
  try {
    const response = await api.get(`/reviews/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching review:', error);
    throw error;
  }
};

// Update review status
export const updateReviewStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<{ message: string; data: { id: string; status: string } }> => {
  try {
    console.log('Updating review status:', { id, status });
    const response = await api.patch(`/reviews/${id}/status`, { status });
    console.log('Review status update response:', response);
    return response.data;
  } catch (error) {
    console.error('Error updating review status:', error);
    throw error;
  }
};

// Update review details
export const updateReviewDetails = async (id: string, details: { rating?: number; comment?: string; subject?: string; status?: string }): Promise<{ message: string; data: { id: string } }> => {
  try {
    console.log('Updating review details:', { id, details });
    const response = await api.patch(`/reviews/${id}/details`, details);
    console.log('Review details update response:', response);
    return response.data;
  } catch (error) {
    console.error('Error updating review details:', error);
    throw error;
  }
};

// Add response to review
export const addReviewResponse = async (id: string, response: string): Promise<{ message: string; data: { id: string; response: string } }> => {
  try {
    console.log('Adding response to review:', { id, response });
    const response_data = await api.patch(`/reviews/${id}/response`, { response });
    console.log('Response API result:', response_data);
    return response_data.data;
  } catch (error) {
    console.error('Error adding review response:', error);
    throw error;
  }
};

// Delete review
export const deleteReview = async (id: string): Promise<{ message: string; data: { id: string } }> => {
  try {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};

// Get review statistics
export const getReviewStats = async (): Promise<ReviewStats> => {
  try {
    const response = await api.get('/reviews/stats/overview');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching review statistics:', error);
    throw error;
  }
};

// Approve review (convenience function)
export const approveReview = async (id: string): Promise<{ message: string; data: { id: string; status: string } }> => {
  return updateReviewStatus(id, 'approved');
};

// Reject review (convenience function)
export const rejectReview = async (id: string): Promise<{ message: string; data: { id: string; status: string } }> => {
  return updateReviewStatus(id, 'rejected');
};

// Submit a new review
export const submitReview = async (tutorId: string, rating: number, comment: string): Promise<TutorReview> => {
  try {
    const response = await api.post('/reviews', {
      reviewed_id: tutorId,
      rating,
      comment,
      subject: 'General Review'
    });
    return response.data.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};

// Get reviews by tutor ID
export const getReviewsByTutorId = async (tutorId: string): Promise<TutorReview[]> => {
  try {
    const response = await api.get(`/tutors/${tutorId}/reviews`);
    
    console.log('=== REVIEW SERVICE DEBUG: getReviewsByTutorId ===');
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    console.log('Response success:', response.success);
    
    // The API client returns the parsed JSON response directly
    // So if backend returns { success: true, data: reviews, pagination: {...} }
    // Then response is that object, and we need response.data
    const reviews = response.data || [];
    
    console.log('Extracted reviews:', reviews);
    console.log('Reviews type:', typeof reviews);
    console.log('Is array:', Array.isArray(reviews));
    
    if (Array.isArray(reviews)) {
      console.log('First review structure:', reviews[0]);
    }
    
    return reviews;
  } catch (error) {
    console.error('Error fetching tutor reviews:', error);
    throw error;
  }
};

// Get review stats by tutor ID
export const getReviewStatsByTutorId = async (tutorId: string): Promise<ReviewStats> => {
  try {
    const response = await api.get(`/tutors/${tutorId}/review-stats`);
    
    console.log('=== REVIEW SERVICE DEBUG: getReviewStatsByTutorId ===');
    console.log('Full response:', response);
    console.log('Response data:', response.data);
    
    // The API client returns the parsed JSON response directly
    // So if backend returns { success: true, data: stats }
    // Then response is that object, and we need response.data
    return response.data || null;
  } catch (error) {
    console.error('Error fetching tutor review stats:', error);
    throw error;
  }
};

// Backward compatibility for existing components
export const reviewService = {
  getReviews,
  getReviewsByTutorId,
  getReviewById,
  updateReviewStatus,
  addReviewResponse,
  deleteReview,
  getReviewStats,
  getReviewStatsByTutorId,
  approveReview,
  rejectReview,
  submitReview,
  
  // Legacy methods for tutor components
  getMyReviews: async (): Promise<Review[]> => {
    try {
      const response = await api.get('/reviews/my-reviews');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error;
    }
  },
  
  getMyReviewStats: async (): Promise<ReviewStats> => {
    try {
      const response = await api.get('/reviews/my-stats');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching my review stats:', error);
      throw error;
    }
  },
  
  respondToReview: async (reviewId: string, response: string): Promise<any> => {
    try {
      const response_data = await api.post(`/reviews/respond/${reviewId}`, { response });
      return response_data.data;
    } catch (error) {
      console.error('Error responding to review:', error);
      throw error;
    }
  },
  
  updateReviewResponse: async (reviewId: string, response: string): Promise<any> => {
    try {
      const response_data = await api.put(`/reviews/respond/${reviewId}`, { response });
      return response_data.data;
    } catch (error) {
      console.error('Error updating review response:', error);
      throw error;
    }
  }
};