import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

export interface User {
  id: string;
  tutor_id?: string;
  full_name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'tutor' | 'student';
  phone?: string;
  avatar_url?: string;
  location?: string;
  gender?: 'male' | 'female' | 'other';
  status: 'active' | 'suspended' | 'pending';
  email_verified?: boolean;
  verified?: boolean;
  created_at: string;
  updated_at?: string;
  district?: string;
  total_views?: number;
  
  // Profile fields
  profile_id?: string;
  bio?: string;
  education?: string;
  experience?: string;
  subjects?: string;
  hourly_rate?: number;
  availability?: string;
  rating?: number;
  total_reviews?: number;
  premium?: 'yes' | 'no';
  profile_created_at?: string;
  profile_updated_at?: string;
}

export interface NewUser {
  full_name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'manager' | 'tutor' | 'student';
  phone?: string;
  district?: string;
  gender?: 'male' | 'female' | 'other';
}

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: NewUser): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createAdminUser(userData: NewUser): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin user');
      }

      const data = await response.json();
      return data.data.user;
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  async updateUserStatus(userId: string, status: 'active' | 'suspended' | 'pending'): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }


}

export const userService = new UserService();