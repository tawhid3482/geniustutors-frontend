import { API_BASE_URL } from '@/config/api';

export interface Transaction {
  id: string;
  transactionId: string;
  studentName?: string;
  tutorName: string;
  amount: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  paymentMethod: string;
  type: 'payment' | 'refund' | 'payout';
  date: string;
  description?: string;
}

export interface TransactionDetails extends Transaction {
  tutorEmail?: string;
  tutorPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  total_transactions: number;
  completed: number;
  pending: number;
  failed: number;
  cancelled: number;
  total_credits: number;
  total_debits: number;
  this_month: number;
  this_week: number;
}

export interface TransactionFilters {
  search?: string;
  status?: string;
  type?: string;
  dateFilter?: string;
  page?: number;
  limit?: number;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

class TransactionService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // Get all transactions with filters and pagination
  async getTransactions(filters: TransactionFilters = {}): Promise<TransactionResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFilter) params.append('dateFilter', filters.dateFilter);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${API_BASE_URL}/finance/transactions?${params}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transactions');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Get transaction statistics
  async getTransactionStats(): Promise<TransactionStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/transactions/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transaction statistics');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching transaction statistics:', error);
      throw error;
    }
  }

  // Get transaction details by ID
  async getTransactionDetails(id: string): Promise<TransactionDetails> {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/transactions/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch transaction details');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(id: string, status: 'pending' | 'completed' | 'failed' | 'cancelled'): Promise<Transaction> {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/transactions/${id}/status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update transaction status');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  }

  // Delete transaction
  async deleteTransaction(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/finance/transactions/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();
