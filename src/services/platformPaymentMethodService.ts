import { API_BASE_URL } from '@/config/api';

export interface PlatformPaymentMethod {
  id: string;
  name: 'Bkash' | 'Nagad' | 'Rocket';
  type: 'mobile_banking';
  payment_number: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentMethodData {
  name: 'Bkash' | 'Nagad' | 'Rocket';
  payment_number: string;
  status?: 'active' | 'inactive';
}

export interface UpdatePaymentMethodData {
  name: 'Bkash' | 'Nagad' | 'Rocket';
  payment_number: string;
  status: 'active' | 'inactive';
}

class PlatformPaymentMethodService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all platform payment methods
  async getPaymentMethods(): Promise<PlatformPaymentMethod[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/platform-payment-methods`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment methods');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  // Add new platform payment method
  async addPaymentMethod(paymentData: CreatePaymentMethodData): Promise<PlatformPaymentMethod> {
    try {
      const response = await fetch(`${API_BASE_URL}/platform-payment-methods`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add payment method');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Update platform payment method
  async updatePaymentMethod(id: string, paymentData: UpdatePaymentMethodData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/platform-payment-methods/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update payment method');
      }
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Delete platform payment method
  async deletePaymentMethod(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/platform-payment-methods/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete payment method');
      }
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }

  // Toggle payment method status
  async togglePaymentMethodStatus(id: string): Promise<{ status: 'active' | 'inactive' }> {
    try {
      const response = await fetch(`${API_BASE_URL}/platform-payment-methods/${id}/toggle-status`, {
        method: 'PATCH',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle payment method status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error toggling payment method status:', error);
      throw error;
    }
  }
}

export const platformPaymentMethodService = new PlatformPaymentMethodService();
