import axios from 'axios';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface Chat {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

interface ChatListResponse {
  success: boolean;
  data: {
    chats: Chat[];
    metadata: {
      version: string;
      lastUpdated: string;
      totalChats: number;
      totalMessages: number;
    };
  };
}

interface ChatMessagesResponse {
  success: boolean;
  data: {
    chat: Chat & {
      participants: string[];
      messages: ChatMessage[];
    };
    messages: ChatMessage[];
  };
}

interface SendMessageResponse {
  success: boolean;
  data: {
    message: ChatMessage;
    chat: Chat;
  };
}

class TutorChatService {
  private baseUrl = '/api/support-messaging';

  /**
   * Get all available chats for the tutor
   */
  async getChats(): Promise<Chat[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<{success: boolean; data: Chat[]}>(`${this.baseUrl}/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        return response.data.data.map(chat => ({
          id: chat.id,
          name: chat.name,
          role: chat.role,
          avatar: chat.avatar,
          lastMessage: chat.lastMessage || 'No messages yet',
          unreadCount: chat.unreadCount || 0,
          updatedAt: chat.updatedAt || new Date().toISOString()
        }));
      }
      
      throw new Error('Failed to fetch chats');
    } catch (error) {
      console.error('Error fetching chats:', error);
      // Return default chats if API fails
      return [
        {
          id: 'support',
          name: 'Support Team',
          role: 'Customer Support',
          avatar: '🛠️',
          lastMessage: 'Hello! How can we help you today?',
          unreadCount: 0,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'admin',
          name: 'Admin Team',
          role: 'Administrator',
          avatar: '👨‍💼',
          lastMessage: 'Welcome to Tutor Connect!',
          unreadCount: 0,
          updatedAt: new Date().toISOString()
        }
      ];
    }
  }

  /**
   * Get messages for a specific chat
   */
  async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get<{success: boolean; data: {chatId: string; chatName: string; messages: ChatMessage[]}}>(`${this.baseUrl}/chats/${encodeURIComponent(chatId)}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        return response.data.data.messages;
      }
      
      throw new Error('Failed to fetch chat messages');
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      
      // Return empty array if API fails
      return [];
    }
  }

  /**
   * Send a message to a chat
   */
  async sendMessage(chatId: string, message: string): Promise<ChatMessage> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post<{success: boolean; data: ChatMessage; message: string}>(`${this.baseUrl}/chats/${encodeURIComponent(chatId)}/messages`, {
        message
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error('Failed to send message');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in a chat as read
   */
  async markChatAsRead(chatId: string): Promise<void> {
    try {
      const response = await axios.put(this.baseUrl, {
        chatId,
        action: 'markAsRead'
      });
      
      if (!response.data.success) {
        throw new Error('Failed to mark chat as read');
      }
    } catch (error) {
      console.error('Error marking chat as read:', error);
      // Don't throw error for read status updates as it's not critical
    }
  }

  /**
   * Get chat details including participants and full chat info
   */
  async getChatDetails(chatId: string): Promise<Chat & { participants: string[]; messages: ChatMessage[] }> {
    try {
      const response = await axios.get<ChatMessagesResponse>(
        `${this.baseUrl}?chatId=${encodeURIComponent(chatId)}`
      );
      
      if (response.data.success) {
        return response.data.data.chat;
      }
      
      throw new Error('Failed to fetch chat details');
    } catch (error) {
      console.error('Error fetching chat details:', error);
      throw error;
    }
  }

  /**
   * Poll for new messages (used for real-time updates)
   */
  async pollForUpdates(chatId: string, lastMessageId?: string): Promise<ChatMessage[]> {
    try {
      const messages = await this.getChatMessages(chatId);
      
      if (lastMessageId) {
        // Find the index of the last known message
        const lastIndex = messages.findIndex(msg => msg.id === lastMessageId);
        if (lastIndex !== -1) {
          // Return only messages after the last known message
          return messages.slice(lastIndex + 1);
        }
      }
      
      return messages;
    } catch (error) {
      console.error('Error polling for updates:', error);
      return [];
    }
  }

  /**
   * Subscribe to chat updates (basic polling implementation)
   */
  subscribeToChat(chatId: string, callback: (newMessages: ChatMessage[]) => void): () => void {
    let lastMessageId: string | undefined;
    let isPolling = true;
    
    const poll = async () => {
      if (!isPolling) return;
      
      try {
        const messages = await this.getChatMessages(chatId);
        
        if (messages.length > 0) {
          if (!lastMessageId) {
            // First time - set the last message ID but don't trigger callback
            lastMessageId = messages[messages.length - 1].id;
          } else {
            // Check for new messages
            const lastIndex = messages.findIndex(msg => msg.id === lastMessageId);
            if (lastIndex !== -1 && lastIndex < messages.length - 1) {
              const newMessages = messages.slice(lastIndex + 1);
              callback(newMessages);
              lastMessageId = messages[messages.length - 1].id;
            }
          }
        }
      } catch (error) {
        console.error('Error in chat polling:', error);
      }
      
      // Poll every 3 seconds
      if (isPolling) {
        setTimeout(poll, 3000);
      }
    };
    
    // Start polling
    poll();
    
    // Return unsubscribe function
    return () => {
      isPolling = false;
    };
  }
}

export const tutorChatService = new TutorChatService();
