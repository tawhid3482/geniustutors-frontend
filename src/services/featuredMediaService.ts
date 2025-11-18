import axiosInstance from '@/lib/axios';
import { getAuthToken } from '@/utils/auth';

export interface FeaturedMediaOutlet {
  id: string;
  name: string;
  logo_url: string;
  alt_text?: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateFeaturedMediaOutlet {
  name: string;
  logo_url: string;
  alt_text?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateFeaturedMediaOutlet {
  name: string;
  logo_url: string;
  alt_text?: string;
  display_order?: number;
  is_active?: boolean;
}

// Get all featured media outlets (public)
export const getFeaturedMediaOutlets = async (): Promise<FeaturedMediaOutlet[]> => {
  try {
    const response = await axiosInstance.get('/website-management/featured-media/public');
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch featured media outlets');
  } catch (error) {
    console.error('Error fetching featured media outlets:', error);
    return [];
  }
};

// Get all featured media outlets (admin)
export const getAdminFeaturedMediaOutlets = async (): Promise<FeaturedMediaOutlet[]> => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.get('/website-management/featured-media', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch featured media outlets');
  } catch (error) {
    console.error('Error fetching featured media outlets:', error);
    return [];
  }
};

// Create new featured media outlet
export const createFeaturedMediaOutlet = async (data: CreateFeaturedMediaOutlet): Promise<{ id: string }> => {
  try {
    const token = getAuthToken();
    
    const response = await axiosInstance.post('/website-management/featured-media', data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create featured media outlet');
  } catch (error) {
    console.error('Error creating featured media outlet:', error);
    throw error;
  }
};

// Update featured media outlet
export const updateFeaturedMediaOutlet = async (id: string, data: UpdateFeaturedMediaOutlet): Promise<void> => {
  try {
    const token = getAuthToken();
    
    const response = await axiosInstance.put(`/website-management/featured-media/${id}`, data, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (response.data.success) {
      return;
    }
    throw new Error(response.data.message || 'Failed to update featured media outlet');
  } catch (error) {
    console.error('Error updating featured media outlet:', error);
    throw error;
  }
};

// Delete featured media outlet
export const deleteFeaturedMediaOutlet = async (id: string): Promise<void> => {
  try {
    const token = getAuthToken();
    const response = await axiosInstance.delete(`/website-management/featured-media/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.success) {
      return;
    }
    throw new Error(response.data.message || 'Failed to delete featured media outlet');
  } catch (error) {
    console.error('Error deleting featured media outlet:', error);
    throw error;
  }
};
