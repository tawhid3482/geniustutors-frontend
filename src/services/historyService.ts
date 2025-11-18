import { API_BASE_URL } from '@/config/api';

export interface HistoryLog {
  id: string;
  entity_type: 'tutor' | 'student' | 'assignment' | 'demo_class' | 'request' | 'payment' | 'review' | 'application' | 'user' | 'auth' | 'notification' | 'upload' | 'category' | 'course' | 'transaction' | 'upgrade' | 'contact' | 'note' | 'website' | 'analytics' | 'support' | 'approval_letter' | 'api_credential' | 'role' | 'phone_verification' | 'hero_data' | 'notice_board' | 'platform_payment';
  entity_id: string;
  action_type: 'created' | 'updated' | 'deleted' | 'assigned' | 'completed' | 'cancelled' | 'approved' | 'rejected' | 'finalized' | 'paid' | 'rated' | 'logged_in' | 'logged_out' | 'registered' | 'verified' | 'uploaded' | 'downloaded' | 'viewed' | 'searched' | 'filtered' | 'exported' | 'imported' | 'activated' | 'deactivated' | 'suspended' | 'restored' | 'contacted' | 'messaged' | 'notified' | 'subscribed' | 'unsubscribed' | 'upgraded' | 'downgraded' | 'refunded' | 'failed' | 'expired' | 'renewed' | 'cancelled' | 'rescheduled' | 'started' | 'ended' | 'paused' | 'resumed';
  action_description: string;
  old_values?: any;
  new_values?: any;
  performed_by: string;
  performed_by_role: 'super_admin' | 'admin' | 'manager' | 'tutor' | 'student' | 'system';
  performed_by_name?: string;
  performed_by_email?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface HistorySummary {
  summary: Array<{
    entity_type: string;
    action_type: string;
    count: number;
  }>;
  recent_activity: HistoryLog[];
  top_performers: Array<{
    performed_by: string;
    full_name: string;
    email: string;
    action_count: number;
  }>;
}

export interface HistoryFilters {
  entity_type?: string;
  entity_id?: string;
  action_type?: string;
  start_date?: string;
  end_date?: string;
  performed_by?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryLog[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    limit: number;
  };
}

export interface SummaryResponse {
  success: boolean;
  data: HistorySummary;
}

class HistoryService {
  private baseUrl = `${API_BASE_URL}/history`;

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get comprehensive history data with filters
  async getHistory(filters: HistoryFilters = {}): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `?${queryString}` : '';
    
    return this.request<HistoryResponse>(endpoint);
  }

  // Get history summary statistics
  async getSummary(startDate?: string, endDate?: string): Promise<SummaryResponse> {
    const queryParams = new URLSearchParams();
    
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/summary?${queryString}` : '/summary';
    
    return this.request<SummaryResponse>(endpoint);
  }

  // Get detailed history for a specific entity
  async getEntityHistory(
    entityType: string, 
    entityId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    return this.request<HistoryResponse>(`/entity/${entityType}/${entityId}?${queryParams}`);
  }

  // Get tutor history
  async getTutorHistory(filters: {
    tutor_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tutors?${queryString}` : '/tutors';
    
    return this.request<HistoryResponse>(endpoint);
  }

  // Get student history
  async getStudentHistory(filters: {
    student_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/students?${queryString}` : '/students';
    
    return this.request<HistoryResponse>(endpoint);
  }

  // Get assignment history
  async getAssignmentHistory(filters: {
    assignment_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/assignments?${queryString}` : '/assignments';
    
    return this.request<HistoryResponse>(endpoint);
  }

  // Get demo class history
  async getDemoClassHistory(filters: {
    demo_class_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<HistoryResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/demo-classes?${queryString}` : '/demo-classes';
    
    return this.request<HistoryResponse>(endpoint);
  }

  // Export history data
  async exportHistory(filters: {
    entity_type?: string;
    start_date?: string;
    end_date?: string;
    format?: 'json' | 'csv';
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/export?${queryString}` : '/export';
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    if (filters.format === 'csv') {
      const blob = await response.blob();
      return blob;
    } else {
      return response.json();
    }
  }

  // Helper method to format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Helper method to get action type display name
  getActionTypeDisplayName(actionType: string): string {
    const actionNames: Record<string, string> = {
      created: 'Created',
      updated: 'Updated',
      deleted: 'Deleted',
      assigned: 'Assigned',
      completed: 'Completed',
      cancelled: 'Cancelled',
      approved: 'Approved',
      rejected: 'Rejected',
      finalized: 'Finalized',
      paid: 'Paid',
      rated: 'Rated',
      logged_in: 'Logged In',
      logged_out: 'Logged Out',
      registered: 'Registered',
      verified: 'Verified',
      uploaded: 'Uploaded',
      downloaded: 'Downloaded',
      viewed: 'Viewed',
      searched: 'Searched',
      filtered: 'Filtered',
      exported: 'Exported',
      imported: 'Imported',
      activated: 'Activated',
      deactivated: 'Deactivated',
      suspended: 'Suspended',
      restored: 'Restored',
      contacted: 'Contacted',
      messaged: 'Messaged',
      notified: 'Notified',
      subscribed: 'Subscribed',
      unsubscribed: 'Unsubscribed',
      upgraded: 'Upgraded',
      downgraded: 'Downgraded',
      refunded: 'Refunded',
      failed: 'Failed',
      expired: 'Expired',
      renewed: 'Renewed',
      rescheduled: 'Rescheduled',
      started: 'Started',
      ended: 'Ended',
      paused: 'Paused',
      resumed: 'Resumed'
    };
    
    return actionNames[actionType] || actionType;
  }

  // Helper method to get entity type display name
  getEntityTypeDisplayName(entityType: string): string {
    const entityNames: Record<string, string> = {
      tutor: 'Tutor',
      student: 'Student',
      assignment: 'Assignment',
      demo_class: 'Demo Class',
      request: 'Request',
      payment: 'Payment',
      review: 'Review',
      application: 'Application',
      user: 'User',
      auth: 'Authentication',
      notification: 'Notification',
      upload: 'File Upload',
      category: 'Category',
      course: 'Course',
      transaction: 'Transaction',
      upgrade: 'Upgrade',
      contact: 'Contact',
      note: 'Note',
      website: 'Website',
      analytics: 'Analytics',
      support: 'Support',
      approval_letter: 'Approval Letter',
      api_credential: 'API Credential',
      role: 'Role',
      phone_verification: 'Phone Verification',
      hero_data: 'Hero Data',
      notice_board: 'Notice Board',
      platform_payment: 'Platform Payment'
    };
    
    return entityNames[entityType] || entityType;
  }

  // Helper method to get status badge variant
  getActionTypeBadgeVariant(actionType: string): string {
    const variants: Record<string, string> = {
      created: 'default',
      updated: 'secondary',
      deleted: 'destructive',
      assigned: 'default',
      completed: 'default',
      cancelled: 'destructive',
      approved: 'default',
      rejected: 'destructive',
      finalized: 'default',
      paid: 'default',
      rated: 'secondary',
      logged_in: 'default',
      logged_out: 'secondary',
      registered: 'default',
      verified: 'default',
      uploaded: 'secondary',
      downloaded: 'secondary',
      viewed: 'outline',
      searched: 'outline',
      filtered: 'outline',
      exported: 'secondary',
      imported: 'secondary',
      activated: 'default',
      deactivated: 'secondary',
      suspended: 'destructive',
      restored: 'default',
      contacted: 'default',
      messaged: 'secondary',
      notified: 'secondary',
      subscribed: 'default',
      unsubscribed: 'secondary',
      upgraded: 'default',
      downgraded: 'secondary',
      refunded: 'secondary',
      failed: 'destructive',
      expired: 'destructive',
      renewed: 'default',
      rescheduled: 'secondary',
      started: 'default',
      ended: 'secondary',
      paused: 'secondary',
      resumed: 'default'
    };
    
    return variants[actionType] || 'outline';
  }
}

const historyService = new HistoryService();
export default historyService;
