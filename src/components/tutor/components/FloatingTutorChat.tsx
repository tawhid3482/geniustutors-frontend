'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Plus, UserPlus, Circle, Clock, CheckCheck, X, Maximize2, Minimize2 } from "lucide-react";
import { API_BASE_URL } from "@/config/api";

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

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  status: string;
  phone?: string;
}

interface FloatingTutorChatProps {
  chatContacts: ChatContact[];
  chatMessages: {[key: string]: ChatMessage[]};
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export function FloatingTutorChat({
  chatContacts,
  chatMessages,
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage,
  handleSendMessage
}: FloatingTutorChatProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for chat widget visibility and size
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserSearchDialog, setShowUserSearchDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // State for real-time messaging
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [realTimeChatContacts, setRealTimeChatContacts] = useState<ChatContact[]>([]);
  const [realTimeChatMessages, setRealTimeChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  
  // State for contact filtering
  const [contactSearchTerm, setContactSearchTerm] = useState('');
  
  // State to track if user is typing
  const [isTyping, setIsTyping] = useState(false);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat, realTimeChatMessages]);

  // Load real-time chat data on component mount and set up auto-refresh
  useEffect(() => {
    loadSupportChats();
    
    // Set up auto-refresh for chat list every 45 seconds
    const chatListInterval = setInterval(loadSupportChats, 45000);
    
    return () => {
      clearInterval(chatListInterval);
    };
  }, []);

  // Load messages when chat is selected and set up auto-refresh
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
      
      // Set up auto-refresh for messages every 30 seconds when chat is active
      const messagesInterval = setInterval(() => {
        loadChatMessages(selectedChat);
      }, 30000);
      
      return () => {
        clearInterval(messagesInterval);
      };
    }
  }, [selectedChat]);

  // Search users when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchUsers();
    } else {
      // Load all admins when no search term
      loadAllAdmins();
    }
  }, [searchTerm]);

  // Load all admins on component mount and when dialog opens
  useEffect(() => {
    if (showUserSearchDialog) {
      loadAllAdmins();
    }
  }, [showUserSearchDialog]);

  // Function to load all admins
  const loadAllAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/support-messaging/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  // Function to search users
  const searchUsers = async () => {
    if (searchTerm.length < 2) return;
    
    setIsSearching(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/support-messaging/users?search=${encodeURIComponent(searchTerm)}&role=admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSearchResults(data.data);
        }
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to load support chats
  const loadSupportChats = async () => {
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
          setRealTimeChatContacts(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading support chats:', error);
    }
  };

  // Function to load chat messages
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
          setRealTimeChatMessages(prev => ({
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

  // Function to start a new chat with admin
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
          setShowUserSearchDialog(false);
          setSelectedUser(null);
          setSearchTerm('');
          // Reload chats to show the new chat
          loadSupportChats();
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

  // Function to send message
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
          loadSupportChats();
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

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Filter contacts based on search term
  const filteredContacts = realTimeChatContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
    (contact.admin && contact.admin.name.toLowerCase().includes(contactSearchTerm.toLowerCase()))
  );

  // Get current messages for selected chat
  const currentMessages = selectedChat ? (realTimeChatMessages[selectedChat] || []) : [];

  // Get selected contact info
  const selectedContact = realTimeChatContacts.find(contact => contact.id === selectedChat);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
          <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
            size="icon"
          >
          <MessageSquare className="h-6 w-6 text-white" />
          {realTimeChatContacts.some(contact => contact.unread_count > 0) && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs">
              {realTimeChatContacts.reduce((sum, contact) => sum + contact.unread_count, 0)}
              </Badge>
            )}
          </Button>
        </div>

      {/* Chat Widget */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-600 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
              <span className="font-semibold">Support Chat</span>
            </div>
            <div className="flex items-center space-x-1">
                  <Button
                variant="ghost"
                    size="icon"
                    onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 text-white hover:bg-green-700"
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                variant="ghost"
                    size="icon"
                    onClick={() => setIsChatOpen(false)}
                className="h-8 w-8 text-white hover:bg-green-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

          {/* Chat Content */}
          <div className="flex-1 flex flex-col min-h-0">
            {!selectedChat ? (
              // Chat List View
              <div className="flex-1 flex flex-col">
                {/* Search and New Chat */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                      <Input 
                      placeholder="Search chats..."
                        value={contactSearchTerm}
                        onChange={(e) => setContactSearchTerm(e.target.value)}
                      className="flex-1 h-8"
                    />
                    <Dialog open={showUserSearchDialog} onOpenChange={setShowUserSearchDialog}>
                      <DialogTrigger asChild>
                        <Button size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Start New Chat</DialogTitle>
                          <DialogDescription>
                            Search for an admin to start a new support chat.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="search">Search Admins</Label>
                            <Input
                              id="search"
                              placeholder="Type admin name or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                          <ScrollArea className="h-48">
                            <div className="space-y-2">
                              {isSearching ? (
                                <div className="text-center py-4">Searching...</div>
                              ) : searchResults.length > 0 ? (
                                searchResults.map((admin) => (
                                  <div
                                    key={admin.id}
                                    className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                                    onClick={() => setSelectedUser(admin)}
                                  >
                                    <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {admin.full_name.charAt(0)}
                            </span>
                          </div>
                                      <div>
                                        <p className="text-sm font-medium">{admin.full_name}</p>
                                        <p className="text-xs text-gray-500">{admin.email}</p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        startChatWithAdmin(admin.id);
                                      }}
                                    >
                                      Chat
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-4 text-gray-500">
                                  No admins found
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Chat List */}
                  <ScrollArea className="flex-1">
                  <div className="p-2">
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => (
                          <div
                            key={contact.id}
                            onClick={() => setSelectedChat(contact.id)}
                          className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 border-b border-gray-100"
                        >
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-green-600">
                              {contact.admin?.name?.charAt(0) || 'A'}
                            </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                {contact.admin?.name || contact.name}
                                  </p>
                                  {contact.unread_count > 0 && (
                                <Badge className="bg-red-500 text-white text-xs">
                                      {contact.unread_count}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">
                              {contact.last_message || 'No messages yet'}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1">
                            {contact.admin?.status === 'active' ? (
                              <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            ) : (
                              <Clock className="h-2 w-2 text-gray-400" />
                                )}
                              </div>
                            </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>No support chats yet</p>
                        <p className="text-sm">Start a new chat with an admin</p>
                          </div>
                    )}
                  </div>
                  </ScrollArea>
                </div>
            ) : (
              // Chat Messages View
                <div className="flex-1 flex flex-col">
                      {/* Chat Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedChat(null)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {selectedContact?.admin?.name?.charAt(0) || 'A'}
                      </span>
                              </div>
                              <div>
                      <p className="text-sm font-medium">{selectedContact?.admin?.name || 'Admin'}</p>
                      <div className="flex items-center space-x-1">
                        {selectedContact?.admin?.status === 'active' ? (
                          <>
                            <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                            <span className="text-xs text-green-600">Online</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-2 w-2 text-gray-400" />
                            <span className="text-xs text-gray-500">Offline</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                      </div>

                      {/* Messages */}
                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {isLoadingMessages ? (
                      <div className="text-center py-4">Loading messages...</div>
                    ) : currentMessages.length > 0 ? (
                      currentMessages.map((message) => (
                            <div
                              key={message.id}
                          className={`flex ${message.sender_role === 'tutor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.sender_role === 'tutor'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                          >
                                  <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_role === 'tutor' ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                                </div>
                              </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                            </div>
                    )}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Message Input */}
                <div className="p-3 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                          <Input
                      placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                            className="flex-1"
                          />
                          <Button
                      onClick={sendMessage}
                            disabled={!newMessage.trim()}
                      size="icon"
                      className="h-8 w-8"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
        </div>
      )}
    </>
  );
}