import { API_BASE_URL } from '@/config/api';
import { getAuthHeaders, handleAuthError } from '@/utils/auth';

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  bio?: string;
  education?: string;
  experience?: string;
  subjects?: string;
  hourly_rate?: number;
  email?: string;
  district?: string;
  area?: string;
  other_skills?: string[];
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

export interface PaymentMethodData {
  type: 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank';
  accountNumber: string;
  accountHolderName: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  account_number: string;
  account_holder_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
}

class ProfileService {
  async updateProfile(userId: string, profileData: ProfileUpdateData): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(profileData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to update profile');
      }

      return result;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  async changePassword(userId: string, passwordData: PasswordChangeData): Promise<{ success: boolean; message: string }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/password/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(passwordData),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to change password');
      }

      return result;
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  async getPaymentMethods(userId: string): Promise<{ success: boolean; data: PaymentMethod[] }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods`, {
        method: 'GET',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to fetch payment methods');
      }

      return result;
    } catch (error) {
      console.error('Get payment methods error:', error);
      throw error;
    }
  }

  async addPaymentMethod(userId: string, paymentData: PaymentMethodData): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: paymentData.type,
          accountNumber: paymentData.accountNumber,
          accountHolderName: paymentData.accountHolderName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to add payment method');
      }

      return result;
    } catch (error) {
      console.error('Add payment method error:', error);
      throw error;
    }
  }

  async updatePaymentMethod(userId: string, methodId: string, paymentData: PaymentMethodData): Promise<{ success: boolean; message: string }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods/${methodId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          type: paymentData.type,
          accountNumber: paymentData.accountNumber,
          accountHolderName: paymentData.accountHolderName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to update payment method');
      }

      return result;
    } catch (error) {
      console.error('Update payment method error:', error);
      throw error;
    }
  }

  async deletePaymentMethod(userId: string, methodId: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to delete payment method');
      }

      return result;
    } catch (error) {
      console.error('Delete payment method error:', error);
      throw error;
    }
  }

  async setDefaultPaymentMethod(userId: string, methodId: string): Promise<{ success: boolean; message: string }> {
    try {
      const headers = getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/payment-methods/${methodId}/default`, {
        method: 'PUT',
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to set default payment method');
      }

      return result;
    } catch (error) {
      console.error('Set default payment method error:', error);
      throw error;
    }
  }

  async getProfile(userId: string): Promise<{ success: boolean; data: any }> {
    try {
      const headers = getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers,
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        }
        throw new Error(result.error || 'Failed to fetch profile');
      }
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService(); 