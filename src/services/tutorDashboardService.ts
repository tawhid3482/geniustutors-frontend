import { API_BASE_URL } from '@/config/api';

export interface DashboardStats {
  totalEarnings: number;
  thisMonthEarnings: number;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  averageRating: string;
  totalStudents: number;
  activeJobs: number;
  appliedJobs: number;
  acceptedJobs: number;
  shortlistedJobs: number;
  appointedJobs: number;
  confirmedJobs: number;
  cancelledJobs: number;
  nearbyJobs: number;
  profileCompletion: number;
  isVerified: boolean;
  isGeniusTutor: boolean;
}

export interface Job {
  id: string;
  title: string;
  subject: string;
  description: string;
  location: string;
  budget: string;
  experience_required: string;
  availability: string;
  status: string;
  created_at: string;
  student_name: string;
  applied: number;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: string;
  created_at: string;
  payment_method?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'mobile_banking' | 'card';
  name: string;
  account_number: string;
  is_default: boolean;
}

export interface WalletData {
  balance: number;
  monthlyEarnings: number;
  totalWithdrawn: number;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
}

export interface Activity {
  type: 'session' | 'job' | 'payment' | 'review';
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export interface RecentTuitionJob {
  id: string;
  title: string;
  subject: string;
  student_name: string;
  location: string;
  budget: string;
  status: string;
  created_at: string;
  applied: boolean;
}

export interface RecentAssignment {
  id: string;
  tutor_request_id: string;
  title: string;
  subject: string;
  student_name: string;
  location: string;
  budget: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_at: string;
  notes: string | null;
}

class TutorDashboardService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // If API fails, return default stats
        console.warn('Dashboard stats API failed, using default values');
        return {
          totalEarnings: 0,
          thisMonthEarnings: 0,
          totalSessions: 0,
          completedSessions: 0,
          pendingSessions: 0,
          averageRating: '0.0',
          totalStudents: 0,
          activeJobs: 0,
          appliedJobs: 0,
          acceptedJobs: 0,
          shortlistedJobs: 0,
          appointedJobs: 0,
          confirmedJobs: 0,
          cancelledJobs: 0,
          nearbyJobs: 39,
          profileCompletion: 13,
          isVerified: false,
          isGeniusTutor: false
        };
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if error occurs
      return {
        totalEarnings: 0,
        thisMonthEarnings: 0,
        totalSessions: 0,
        completedSessions: 0,
        pendingSessions: 0,
        averageRating: '0.0',
        totalStudents: 0,
        activeJobs: 0,
        appliedJobs: 0,
        acceptedJobs: 0,
        shortlistedJobs: 0,
        appointedJobs: 0,
        confirmedJobs: 0,
        cancelledJobs: 0,
        nearbyJobs: 39,
        profileCompletion: 13,
        isVerified: false,
        isGeniusTutor: false
      };
    }
  }

  // Get available jobs
  async getJobs(filters?: {
    search?: string;
    subject?: string;
    location?: string;
    experience?: string;
    availability?: string;
  }): Promise<Job[]> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value);
        });
      }

      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/jobs?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Return empty array if API fails
        console.warn('Jobs API failed, returning empty array');
        return [];
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Return empty array if error occurs
      return [];
    }
  }

  // Apply for a job
  async applyForJob(jobId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to apply for job');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  }



  // Request withdrawal
  async requestWithdrawal(amount: number, paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/wallet/withdraw`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          amount,
          paymentMethodId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process withdrawal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  }

  // Add payment method
  async addPaymentMethod(paymentData: {
    type: 'bank' | 'mobile_banking' | 'card';
    name: string;
    accountNumber: string;
    isDefault?: boolean;
  }): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/wallet/payment-methods`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add payment method');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Get recent activities
  async getRecentActivities(): Promise<Activity[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/activities`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Return empty array if API fails
        console.warn('Activities API failed, returning empty array');
        return [];
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Return empty array if error occurs
      return [];
    }
  }

  // Get recent tuition jobs
  async getRecentTuitionJobs(): Promise<RecentTuitionJob[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/recent-jobs`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Return empty array if API fails
        console.warn('Recent jobs API failed, returning empty array');
        return [];
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching recent tuition jobs:', error);
      // Return empty array if error occurs
      return [];
    }
  }

  // Get recent assignments
  async getRecentAssignments(): Promise<RecentAssignment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-assignments`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Return empty array if API fails
        console.warn('Recent assignments API failed, returning empty array');
        return [];
      }

      const data = await response.json();
      return data.data.slice(0, 5); // Return only the 5 most recent assignments
    } catch (error) {
      console.error('Error fetching recent assignments:', error);
      // Return empty array if error occurs
      return [];
    }
  }

  // Get wallet data
  async getWalletData(): Promise<WalletData> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/wallet`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // Return default wallet data if API fails
        console.warn('Wallet API failed, returning default data');
        return {
          balance: 0,
          monthlyEarnings: 0,
          totalWithdrawn: 0,
          transactions: [],
          paymentMethods: []
        };
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      // Return default wallet data if error occurs
      return {
        balance: 0,
        monthlyEarnings: 0,
        totalWithdrawn: 0,
        transactions: [],
        paymentMethods: []
      };
    }
  }

  // Withdraw funds
  async withdrawFunds(amount: number, paymentMethodId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor-dashboard/wallet/withdraw`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ amount, paymentMethodId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process withdrawal');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      throw error;
    }
  }
}

export const tutorDashboardService = new TutorDashboardService(); 