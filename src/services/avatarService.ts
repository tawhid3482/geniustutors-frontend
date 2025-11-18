import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  data?: {
    fileUrl: string;
    filename: string;
  };
  error?: string;
}

class AvatarService {
  /**
   * Upload an avatar image
   * @param file The avatar image file to upload
   * @returns Promise with the upload result
   */
  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    try {
      const token = getAuthToken();
      if (!token) {
        return { success: false, message: 'Authentication required' };
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/uploads/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, message: data.error || 'Failed to upload avatar' };
      }

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return { success: false, message: 'An error occurred while uploading the avatar' };
    }
  }
}

export const avatarService = new AvatarService();
