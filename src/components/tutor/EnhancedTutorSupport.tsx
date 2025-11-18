'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send, Phone, Video, MoreVertical, Search, Plus, UserPlus, Circle, Clock, CheckCheck, ChevronLeft, RefreshCw } from "lucide-react";
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
}

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  avatar_url?: string;
  status: string;
  created_at: string;
}

interface EnhancedTutorSupportProps {
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
}

export function EnhancedTutorSupport({
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage
}: EnhancedTutorSupportProps) {
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State for admin search functionality
  const [showAdminSearchDialog, setShowAdminSearchDialog] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState<AdminUser[]>([]);
  const [isSearchingAdmins, setIsSearchingAdmins] = useState(false);
  
  // State for messaging
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [allAdmins, setAllAdmins] = useState<AdminUser[]>([]);

  // State for contact filtering
  const [contactSearchTerm, setContactSearchTerm] = useState('');

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, selectedChat]);

  // Load chats on component mount and set up auto-refresh
  useEffect(() => {
    loadTutorChats();
    loadAllAdmins();
    
    // Set up auto-refresh for chat list every 10 seconds
    const chatListInterval = setInterval(() => {
      loadTutorChats();
      loadAllAdmins();
    }, 10000);
    
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

  // Search admins when search term changes
  useEffect(() => {
    if (adminSearchTerm.length >= 2) {
      searchAdmins();
    } else {
      setAdminSearchResults([]);
    }
  }, [adminSearchTerm]);

  // Function to load all admin users
  const loadAllAdmins = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAllAdmins(data.data || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    }
  };

  // Function to load tutor chats
  const loadTutorChats = async () => {
    try {
      setIsChatLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const formattedContacts = data.data?.map((chat: any) => ({
          id: chat.id,
          name: chat.name,
          type: chat.type,
          last_message: chat.last_message || 'No messages yet',
          unread_count: chat.unread_count || 0,
          created_at: chat.created_at,
          updated_at: chat.updated_at
        })) || [];
        
        setChatContacts(formattedContacts);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsChatLoading(false);
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
        const formattedMessages = data.data?.messages?.map((msg: any) => ({
          id: msg.id,
          sender_id: msg.sender_id,
          sender_name: msg.sender_name,
          sender_role: msg.sender_role,
          message: msg.message,
          message_type: msg.message_type,
          created_at: msg.created_at,
          is_read: msg.is_read
        })) || [];
        
        setChatMessages(prev => ({
          ...prev,
          [chatId]: formattedMessages
        }));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Function to search admins
  const searchAdmins = async () => {
    try {
      setIsSearchingAdmins(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        search: adminSearchTerm,
        limit: '10'
      });

      const response = await fetch(`${API_BASE_URL}/support-messaging/admins?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminSearchResults(data.data || []);
      }
    } catch (error) {
      console.error('Error searching admins:', error);
    } finally {
      setIsSearchingAdmins(false);
    }
  };

  // Function to start chat with an admin
  const startChatWithAdmin = async (admin: AdminUser) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/start-with-admin`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminId: admin.id
        })
      });

      if (response.ok) {
        const data = await response.json();
        const newChatId = data.data.chatId;
        
        // Add to chat contacts
        const newContact: ChatContact = {
          id: newChatId,
          name: `Chat with ${admin.full_name}`,
          type: 'direct',
          last_message: 'Chat started',
          unread_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setChatContacts(prev => {
          const exists = prev.find(c => c.id === newChatId);
          if (exists) {
            return prev;
          }
          return [...prev, newContact];
        });
        
        // Initialize empty messages
        setChatMessages(prev => ({
          ...prev,
          [newChatId]: []
        }));
        
        // Select the new chat
        setSelectedChat(newChatId);
        setShowAdminSearchDialog(false);
        setAdminSearchTerm('');
        setAdminSearchResults([]);
        
        toast({
          title: "Chat started",
          description: `Started conversation with ${admin.full_name}`,
        });
      } else {
        throw new Error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat with admin:', error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Function to send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistically add the message to UI
    const tempMessage: ChatMessage = {
      id: `temp_${Date.now()}`,
      sender_id: 'current_user',
      sender_name: 'You',
      sender_role: 'tutor',
      message: messageText,
      message_type: 'text',
      created_at: new Date().toISOString(),
      is_read: false
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), tempMessage]
    }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${selectedChat}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Replace temporary message with the actual sent message
        setChatMessages(prev => ({
          ...prev,
          [selectedChat]: prev[selectedChat]?.map(msg => 
            msg.id === tempMessage.id 
              ? data.data
              : msg
          ) || []
        }));
        
        // Update contact's last message
        setChatContacts(prev => prev.map(contact => 
          contact.id === selectedChat 
            ? { ...contact, last_message: messageText, updated_at: new Date().toISOString() }
            : contact
        ));
        
        // Refresh chat list to get updated timestamps
        await loadTutorChats();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temporary message on error
      setChatMessages(prev => ({
        ...prev,
        [selectedChat]: prev[selectedChat]?.filter(msg => msg.id !== tempMessage.id) || []
      }));
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Filter contacts based on search term
  const filteredContacts = chatContacts.filter(contact => 
    contact.name.toLowerCase().includes(contactSearchTerm.toLowerCase())
  );

  // Get contact avatar based on type
  const getContactAvatar = (contact: ChatContact) => {
    switch (contact.type) {
      case 'direct':
        return '👤';
      default:
        return '💬';
    }
  };

  // Get contact role display
  const getContactRole = (contact: ChatContact) => {
    switch (contact.type) {
      case 'direct':
        return 'Direct Chat';
      default:
        return 'Chat';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-120px)] flex flex-col">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b bg-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Support Chat
              <Badge variant="secondary" className="ml-2">
                {filteredContacts.length} contacts
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={showAdminSearchDialog} onOpenChange={setShowAdminSearchDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Find Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5 text-green-600" />
                      Find Administrator
                    </DialogTitle>
                    <DialogDescription>
                      Search for administrators to start a direct conversation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-search">Search Administrators</Label>
                      <Input
                        id="admin-search"
                        placeholder="Search by name or email..."
                        value={adminSearchTerm}
                        onChange={(e) => setAdminSearchTerm(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-60">
                      {isSearchingAdmins ? (
                        <div className="flex items-center justify-center p-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        </div>
                      ) : adminSearchResults.length === 0 ? (
                        <div className="text-center p-4 text-muted-foreground">
                          {adminSearchTerm.length >= 2 ? 'No administrators found' : 'Type at least 2 characters to search'}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {adminSearchResults.map((admin) => (
                            <div
                              key={admin.id}
                              onClick={() => startChatWithAdmin(admin)}
                              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                {admin.avatar_url ? (
                                  <img src={admin.avatar_url} alt={admin.full_name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-green-600 font-medium">
                                    {admin.full_name.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm">{admin.full_name}</p>
                                <p className="text-xs text-muted-foreground">{admin.email}</p>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {admin.role}
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
                      onClick={() => setShowAdminSearchDialog(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex">
          {/* Chat List Sidebar */}
          <div className={`${selectedChat ? 'hidden lg:flex' : 'flex'} w-full lg:w-80 border-r flex-col bg-gray-50`}>
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
              {isChatLoading ? (
                <div className="p-4 text-center">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-green-600" />
                  <p className="text-sm text-muted-foreground">Loading chats...</p>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No conversations</p>
                  <p className="text-xs">Click "Find Admin" to start messaging</p>
                </div>
              ) : (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                      selectedChat === contact.id ? 'bg-white border-l-4 border-l-green-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="text-2xl">{getContactAvatar(contact)}</div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm truncate">{contact.name}</h4>
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
                            {getContactRole(contact)}
                          </Badge>
                          <span className="text-green-600 flex items-center gap-1">
                            <Circle className="h-3 w-3 fill-green-600" />
                            Online
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">{contact.last_message}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Window */}
          <div className={`${selectedChat ? 'flex' : 'hidden lg:flex'} flex-1 flex-col bg-white`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    {/* Mobile back button */}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="lg:hidden p-1 h-8 w-8"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <div className="text-2xl">
                        {getContactAvatar(filteredContacts.find(c => c.id === selectedChat)!)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {filteredContacts.find(c => c.id === selectedChat)?.name}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getContactRole(filteredContacts.find(c => c.id === selectedChat)!)}
                        </Badge>
                        <span className="text-green-600 text-xs">Online</span>
                      </p>
                    </div>
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
                    ) : chatMessages[selectedChat]?.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                        <div>
                          <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-lg font-medium">No messages yet</p>
                          <p className="text-sm">Start a conversation by sending a message below.</p>
                        </div>
                      </div>
                    ) : (
                      chatMessages[selectedChat]?.map((message) => {
                        const isOwn = message.sender_id === 'current_user' || message.sender_role === 'tutor';
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
                          handleSendMessage();
                        }
                      }}
                      disabled={isLoadingMessages}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
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
                    Connect with our administrators for support.<br />
                    Messages sync in real-time for instant communication.
                  </p>
                  <div className="text-center p-6 border rounded-lg bg-white mb-6">
                    <div className="text-3xl mb-3">👨‍💼</div>
                    <h4 className="font-medium text-lg mb-2">General Administrators</h4>
                    <p className="text-sm text-muted-foreground">Get help with any issues, account problems, billing, and general questions</p>
                  </div>
                  <Button 
                    onClick={() => setShowAdminSearchDialog(true)}
                    className="bg-green-600 hover:bg-green-700 px-8 py-3"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Find Administrator
                  </Button>
                  <p className="text-xs text-gray-400 mt-3">
                    💬 Real-time messaging • Auto-refresh every 3 seconds
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
