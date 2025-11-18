import { API_BASE_URL } from '@/config/api';

export interface PaymentAnalytics {
  totalRevenue: string;
  monthlyRevenue: string;
  processingFees: string;
  pendingPayouts: string;
  transactionCount: number;
  successRate: string;
}

export interface RevenueTrendData {
  month: string;
  revenue: number;
  transactions: number;
  pending_revenue: number;
  pending_transactions: number;
}

export interface PaymentMethodBreakdown {
  payment_method: string;
  count: number;
  revenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}

export interface RevenueTrendsResponse {
  monthlyTrends: RevenueTrendData[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  dailyRevenue: DailyRevenue[];
}

class AnalyticsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get payment analytics dashboard data
  async getPaymentAnalytics(): Promise<PaymentAnalytics> {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/analytics`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch payment analytics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching payment analytics:', error);
      throw error;
    }
  }

  // Get revenue trends data for charts
  async getRevenueTrends(period: number = 12): Promise<RevenueTrendsResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/analytics/revenue-trends?period=${period}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch revenue trends');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();

