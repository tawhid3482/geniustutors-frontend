import { API_BASE_URL } from '@/config/api';

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  type: string;
  last_message?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  participant?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: string;
    lastSeen?: string;
  };
  admin?: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    status: string;
    lastSeen?: string;
  };
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  status: string;
  created_at: string;
}

class SupportChatService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all support chats
  async getChats(): Promise<ChatContact[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw error;
    }
  }

  // Get messages for a specific chat
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${chatId}/messages`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return data.data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(chatId: string, message: string): Promise<ChatMessage> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${chatId}/messages`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get all admin users
  async getAdmins(): Promise<User[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/admins`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching admins:', error);
      throw error;
    }
  }

  // Get all users (for admin)
  async getUsers(search?: string, role?: string, limit?: number): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (role && role !== 'all') params.append('role', role);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE_URL}/support-messaging/users?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  // Start chat with admin (for students/tutors)
  async startChatWithAdmin(adminId: string): Promise<{ chatId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/start-with-admin`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ adminId })
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error starting chat with admin:', error);
      throw error;
    }
  }

  // Start chat with user (for admins)
  async startChatWithUser(userId: string, userName?: string, userEmail?: string, userRole?: string): Promise<{ chatId: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ 
          userId,
          userName,
          userEmail,
          userRole
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start chat');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error starting chat with user:', error);
      throw error;
    }
  }

  // Send broadcast message (for admins)
  async sendBroadcast(message: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/broadcast`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Failed to send broadcast');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      throw error;
    }
  }

  // Get unread message count
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/unread-count`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to fetch unread count');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      throw error;
    }
  }

  // Initialize default chats (for admins)
  async initializeDefaultChats(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/support-messaging/initialize-default-chats`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to initialize default chats');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initializing default chats:', error);
      throw error;
    }
  }
}

export const supportChatService = new SupportChatService();
