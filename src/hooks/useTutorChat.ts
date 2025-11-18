// Tutor Chat Custom Hook

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext.next';
import { API_BASE_URL } from '@/config/api';

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message: string;
  message_type: string;
  created_at: string;
  is_read: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  type: string;
  last_message?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
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

export function useTutorChat() {
  const { toast } = useToast();
  const { user } = useAuth();

  // Chat state
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Load chat contacts
  const loadChatContacts = async () => {
    if (!user) return;
    
    setIsLoadingChats(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/support-messaging/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatContacts(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading chat contacts:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Load messages for a specific chat
  const loadChatMessages = async (chatId: string) => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChatMessages(prev => ({
            ...prev,
            [chatId]: data.data.messages
          }));
        }
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${selectedChat}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNewMessage('');
          // Reload messages to show the new message
          loadChatMessages(selectedChat);
          // Reload chats to update last message
          loadChatContacts();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive',
      });
    }
  };

  // Start new chat with admin
  const startChatWithAdmin = async (adminId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/start-with-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast({
            title: 'Chat Started',
            description: 'Chat with admin has been started successfully.',
          });
          // Reload chats to show the new chat
          loadChatContacts();
          return data.data.chatId;
        }
      }
    } catch (error) {
      console.error('Error starting chat with admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat with admin.',
        variant: 'destructive',
      });
    }
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      loadChatContacts();
    }
  }, [user]);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
    }
  }, [selectedChat]);

  // Set up auto-refresh for chat list
  useEffect(() => {
    if (!user) return;

    const chatListInterval = setInterval(loadChatContacts, 45000); // Every 45 seconds
    
    return () => {
      clearInterval(chatListInterval);
    };
  }, [user]);

  // Set up auto-refresh for messages when chat is active
  useEffect(() => {
    if (!selectedChat) return;

    const messagesInterval = setInterval(() => {
      loadChatMessages(selectedChat);
    }, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(messagesInterval);
    };
  }, [selectedChat]);

  return {
    // State
    chatContacts,
    chatMessages,
    selectedChat,
    newMessage,
    isLoadingChats,
    isLoadingMessages,
    
    // Actions
    setSelectedChat,
    setNewMessage,
    sendMessage,
    startChatWithAdmin,
    loadChatContacts,
    loadChatMessages,
  };
}
