import { api } from '@/config/api';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read_status: boolean;
  created_at: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  message?: string;
}

class NotificationService {
  private baseUrl = '/notifications';

  // Get all notifications for the current user
  async getNotifications(): Promise<NotificationResponse> {
    return this.request(this.baseUrl, {
      method: 'GET',
    });
  }

  // Mark a notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`${this.baseUrl}/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    return this.request(`${this.baseUrl}/mark-all-read`, {
      method: 'PATCH',
    });
  }

  // Get unread notification count
  async getUnreadCount(): Promise<{ success: boolean; count: number }> {
    return this.request(`${this.baseUrl}/unread-count`, {
      method: 'GET',
    });
  }

  // Delete a notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    return this.request(`${this.baseUrl}/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Create a notification for upgrade application status change
  async createUpgradeStatusNotification(
    userId: string, 
    status: 'approved' | 'rejected', 
    packageName: string,
    adminNote?: string
  ): Promise<{ success: boolean; message: string }> {
    const title = `Upgrade Application ${status === 'approved' ? 'Approved' : 'Rejected'}`;
    const message = status === 'approved' 
      ? `Your ${packageName} upgrade application has been approved! Your package is now active.`
      : `Your ${packageName} upgrade application has been rejected. ${adminNote ? `Reason: ${adminNote}` : ''}`;

    return this.request(`${this.baseUrl}/create`, {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        title,
        message,
        type: status === 'approved' ? 'success' : 'error'
      }),
    });
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const method = options.method || 'GET';
      const response = method === 'GET' 
        ? await api.get(endpoint, options)
        : method === 'POST'
        ? await api.post(endpoint, options.body ? JSON.parse(options.body as string) : undefined, options)
        : method === 'PATCH'
        ? await api.patch(endpoint, options.body ? JSON.parse(options.body as string) : undefined, options)
        : method === 'DELETE'
        ? await api.delete(endpoint, options)
        : await api.get(endpoint, options);

      return response;
    } catch (error) {
      console.error('Notification service error:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();