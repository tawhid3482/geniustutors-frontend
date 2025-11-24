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
import { MessageSquare, Send, Phone, Video, MoreVertical, Megaphone, Users, Search, Plus, UserPlus, Circle, Clock, CheckCheck } from "lucide-react";
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
  participant?: {
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

interface EnhancedSupportChatProps {
  chatContacts: ChatContact[];
  chatMessages: {[key: string]: ChatMessage[]};
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export function EnhancedSupportChat({
  chatContacts,
  chatMessages,
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage,
  handleSendMessage
}: EnhancedSupportChatProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for search functionality
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showUserSearchDialog, setShowUserSearchDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState('all');
  
  // State for broadcast functionality
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  
  // State for real-time messaging
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [realTimeChatContacts, setRealTimeChatContacts] = useState<ChatContact[]>([]);
  const [realTimeChatMessages, setRealTimeChatMessages] = useState<{[key: string]: ChatMessage[]}>({});

  // State for contact filtering
  const [contactSearchTerm, setContactSearchTerm] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat, realTimeChatMessages]);

  // Load real-time chat data on component mount and set up auto-refresh
  useEffect(() => {
    loadSupportChats();
    
    // Set up auto-refresh for chat list every 10 seconds
    const chatListInterval = setInterval(loadSupportChats, 10000);
    
    return () => {
      clearInterval(chatListInterval);
    };
  }, []);

  // Load messages when chat is selected and set up auto-refresh
  useEffect(() => {
    if (selectedChat) {
      loadChatMessages(selectedChat);
      
      // Set up auto-refresh for messages every 3 seconds when chat is active
      const messagesInterval = setInterval(() => {
        loadChatMessages(selectedChat);
      }, 3000);
      
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
      setSearchResults([]);
    }
  }, [searchTerm, roleFilter]);

  // Function to search users
  const searchUsers = async () => {
    try {
      setIsSearching(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: searchTerm,
        ...(roleFilter !== 'all' && { role: roleFilter }),
        limit: '10'
      });

      const response = await fetch(`${API_BASE_URL}/support-messaging/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to start chat with a user
  const startChatWithUser = async (user: User) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          userId: user.id,
          userName: user.full_name || user.email || 'Unknown User',
          userEmail: user.email,
          userRole: user.role || 'user'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedChat(data.data.chatId);
        await loadSupportChats(); // Refresh chat list
        setShowUserSearchDialog(false);
        setSearchTerm('');
        setSearchResults([]);
        
        toast({
          title: "Chat started",
          description: `Started conversation with ${user.full_name || user.email || 'the user'}`,
        });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to load support chats from API
  const loadSupportChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedContacts = data.data.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
          type: chat.type,
          last_message: chat.last_message || 'No messages yet',
          unread_count: chat.unread_count || 0,
          created_at: chat.created_at,
          updated_at: chat.updated_at,
          participant: chat.participant
        }));
        setRealTimeChatContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading support chats:', error);
    }
  };

  // Function to load messages for a specific chat
  const loadChatMessages = async (chatId: string) => {
    try {
      setIsLoadingMessages(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const formattedMessages = data.data.messages.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.sender_name,
          sender_role: msg.sender_role,
          message: msg.message,
          message_type: msg.message_type,
          created_at: msg.created_at,
          is_read: msg.is_read
        }));
        
        setRealTimeChatMessages(prev => ({
          ...prev,
          [chatId]: formattedMessages
        }));
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Function to send message to specific chat
  const handleRealTimeSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${selectedChat}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: newMessage.trim() })
      });

      if (response.ok) {
        setNewMessage('');
        await loadChatMessages(selectedChat); // Reload messages
        await loadSupportChats(); // Update chat list
        
        toast({
          title: "Message sent",
          description: "Your message has been delivered successfully.",
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to send broadcast message
  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message to broadcast.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSendingBroadcast(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/broadcast`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: broadcastMessage.trim() })
      });

      if (response.ok) {
        setBroadcastMessage('');
        setShowBroadcastDialog(false);
        await loadSupportChats(); // Refresh chat list
        
        toast({
          title: "Broadcast sent",
          description: "Your message has been sent to all students successfully.",
        });
      } else {
        throw new Error('Failed to send broadcast');
      }
    } catch (error) {
      console.error('Error sending broadcast:', error);
      toast({
        title: "Error",
        description: "Failed to send broadcast message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // Filter contacts based on search term
  const filteredContacts = (realTimeChatContacts.length > 0 ? realTimeChatContacts : chatContacts)
    .filter(contact => 
      contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      contact.type.toLowerCase().includes(contactSearchTerm.toLowerCase()) ||
      (contact.participant && contact.participant.name.toLowerCase().includes(contactSearchTerm.toLowerCase()))
    );

  // Use real-time data if available, otherwise fallback to props
  const displayContacts = filteredContacts;
  const displayMessages = Object.keys(realTimeChatMessages).length > 0 ? realTimeChatMessages : chatMessages;

  // Get contact display info
  const getContactDisplayInfo = (contact: ChatContact) => {
    if (contact.type === 'direct' && contact.participant) {
      return {
        name: contact.participant.name,
        role: contact.participant.role,
        avatar: contact.participant.avatar || '👤',
        isOnline: contact.participant.status === 'active'
      };
    }
    return {
      name: contact.name,
      role: contact.type,
      avatar: '💬',
      isOnline: true
    };
  };

  return (
    <div className="w-full h-[calc(100vh-160px)] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Support Chat
              <Badge variant="secondary" className="ml-2">
                {displayContacts.length} contacts
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={showUserSearchDialog} onOpenChange={setShowUserSearchDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Start New Chat
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-green-600" />
                      Find Users
                    </DialogTitle>
                    <DialogDescription>
                      Search for students or tutors to start a conversation. Admins can only chat with students and tutors.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="user-search">Search Users</Label>
                      <div className="flex gap-2">
                        <Input
                          id="user-search"
                          placeholder="Search by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="flex-1"
                        />
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="student">Students</SelectItem>
                            <SelectItem value="tutor">Tutors</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <ScrollArea className="h-60">
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                          {searchTerm.length >= 2 ? 'No users found' : 'Type at least 2 characters to search'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {searchResults.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => startChatWithUser(user)}
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                {user.avatar_url ? (
                                  <Image src={user.avatar_url} alt={user.full_name || user.email || 'User'} width={40} height={40} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-green-600 font-medium">
                                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{user.full_name || user.email || 'Unknown User'}</p>
                                <p className="text-xs text-muted-foreground">{user.email || 'No email'}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {user.role || 'user'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUserSearchDialog(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4" />
                    Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-green-600" />
                      Broadcast Message
                    </DialogTitle>
                    <DialogDescription>
                      Send a message to all students at once. This will appear in their chat inbox.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="broadcast-message">Message</Label>
                      <Textarea
                        id="broadcast-message"
                        placeholder="Type your message here..."
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowBroadcastDialog(false)}
                      disabled={isSendingBroadcast}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSendBroadcast}
                      disabled={!broadcastMessage.trim() || isSendingBroadcast}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSendingBroadcast ? 'Sending...' : 'Send Broadcast'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex">
          {/* Chat List Sidebar */}
          <div className="w-80 border-r flex flex-col bg-gray-50">
            <div className="p-4 border-b bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search conversations..." 
                  value={contactSearchTerm}
                  onChange={(e) => setContactSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {displayContacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">Click "Start New Chat" to begin messaging users</p>
                </div>
              ) : (
                displayContacts.map((contact) => {
                  const contactInfo = getContactDisplayInfo(contact);
                  return (
                    <div
                      key={contact.id}
                      onClick={() => setSelectedChat(contact.id)}
                      className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                        selectedChat === contact.id ? 'bg-white border-l-4 border-l-green-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="text-2xl">{contactInfo.avatar}</div>
                          {contactInfo.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{contactInfo.name}</h4>
                            <div className="flex items-center gap-1">
                              {contact.unread_count > 0 && (
                                <Badge className="bg-green-600 text-xs px-1.5 py-0.5">
                                  {contact.unread_count}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {new Date(contact.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <Badge variant="outline" className="text-xs px-1">
                              {contactInfo.role}
                            </Badge>
                            {contactInfo.isOnline ? (
                              <span className="text-green-600 flex items-center gap-1">
                                <Circle className="h-3 w-3 fill-green-600" />
                                Online
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Offline
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">{contact.last_message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col bg-white">
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const contact = displayContacts.find(c => c.id === selectedChat);
                      const contactInfo = contact ? getContactDisplayInfo(contact) : { name: 'Unknown', role: 'Unknown', avatar: '👤', isOnline: false };
                      return (
                        <>
                          <div className="relative">
                            <div className="text-2xl">{contactInfo.avatar}</div>
                            {contactInfo.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{contactInfo.name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {contactInfo.role}
                              </Badge>
                              {contactInfo.isOnline ? (
                                <span className="text-green-600 text-xs">Online</span>
                              ) : (
                                <span className="text-xs">Offline</span>
                              )}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="hover:bg-green-50">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-green-50">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="hover:bg-green-50">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {isLoadingMessages ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
                      </div>
                    ) : displayMessages[selectedChat]?.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No messages yet</p>
                          <p className="text-sm">Start a conversation by sending a message below.</p>
                        </div>
                      </div>
                    ) : (
                      displayMessages[selectedChat]?.map((message, index) => {
                        const isOwn = message.sender_role === 'ADMIN' || message.sender_role === 'SUPER_ADMIN';
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative ${
                                isOwn
                                  ? 'bg-green-600 text-white rounded-br-sm'
                                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                              }`}
                            >
                              {!isOwn && (
                                <p className="text-xs font-medium mb-1 text-gray-600">
                                  {message.sender_name}
                                </p>
                              )}
                              <p className="text-sm">{message.message}</p>
                              <div className={`text-xs mt-1 flex items-center justify-between gap-2 ${
                                isOwn ? 'text-green-100' : 'text-gray-500'
                              }`}>
                                <span>
                                  {new Date(message.created_at).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                                {isOwn && (
                                  <div className="flex items-center">
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-blue-300" />
                                    ) : (
                                      <span className="text-xs">✓</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleRealTimeSendMessage();
                        }
                      }}
                      disabled={isLoadingMessages}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleRealTimeSendMessage}
                      disabled={!newMessage.trim() || isLoadingMessages}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Welcome Screen */
              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Welcome to Support Chat
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Connect with students and tutors.<br />
                    Select a conversation or start a new chat.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 border rounded-lg hover:bg-white transition-colors">
                      <div className="text-3xl mb-2">👨‍🎓</div>
                      <h4 className="font-medium text-sm">Students</h4>
                      <p className="text-xs text-muted-foreground">Help with tuition requests</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg hover:bg-white transition-colors">
                      <div className="text-3xl mb-2">👨‍🏫</div>
                      <h4 className="font-medium text-sm">Tutors</h4>
                      <p className="text-xs text-muted-foreground">Assist with job inquiries</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setShowUserSearchDialog(true)}
                    className="mt-4 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Chat
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
