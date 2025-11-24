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
import { MessageSquare, Send, Trash2, Megaphone, Users, Search, Plus, UserPlus, Circle, Clock, CheckCheck, X, Maximize2, Minimize2 } from "lucide-react";
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

interface FloatingSupportChatProps {
  chatContacts: ChatContact[];
  chatMessages: {[key: string]: ChatMessage[]};
  selectedChat: string | null;
  setSelectedChat: (chatId: string | null) => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

export function FloatingSupportChat({
  chatContacts,
  chatMessages,
  selectedChat,
  setSelectedChat,
  newMessage,
  setNewMessage,
  handleSendMessage
}: FloatingSupportChatProps) {
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
  const [roleFilter, setRoleFilter] = useState('all');
  
  // State for broadcast functionality
  const [showBroadcastDialog, setShowBroadcastDialog] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  
  // State for delete functionality
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  
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
       // Load all users when no search term
       loadAllUsers();
     }
   }, [searchTerm, roleFilter]);

   // Load all users on component mount and when dialog opens
   useEffect(() => {
     if (showUserSearchDialog) {
       loadAllUsers();
     }
   }, [showUserSearchDialog, roleFilter]);

     // Function to load all users
   const loadAllUsers = async () => {
     try {
       setIsSearching(true);
       const token = localStorage.getItem('token');
       const params = new URLSearchParams({
         ...(roleFilter !== 'all' && { role: roleFilter }),
         limit: '50'
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
       console.error('Error loading users:', error);
     } finally {
       setIsSearching(false);
     }
   };

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
         setIsChatOpen(true);
        
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

  // Function to delete conversation
  const handleDeleteConversation = async () => {
    if (!selectedChat) return;

    try {
      setIsDeletingChat(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/support-messaging/chats/${selectedChat}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setSelectedChat(null);
        setShowDeleteConfirmDialog(false);
        await loadSupportChats(); // Refresh chat list
        
        toast({
          title: "Conversation deleted",
          description: "The conversation and all messages have been deleted successfully.",
        });
      } else {
        throw new Error('Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeletingChat(false);
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
      // Construct proper avatar URL if avatar path exists
      let avatarUrl = null;
      if (contact.participant.avatar) {
        // If it's already a full URL or data URL, use as is
        if (contact.participant.avatar.startsWith('http') || contact.participant.avatar.startsWith('data:')) {
          avatarUrl = contact.participant.avatar;
        } else {
          // If it's a relative path, construct full URL
          avatarUrl = `${API_BASE_URL.replace('/api', '')}${contact.participant.avatar}`;
        }
      }
      
      return {
        name: contact.participant.name,
        role: contact.participant.role,
        avatar: avatarUrl || '👤',
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

  // Format last message for display
  const formatLastMessage = (message: string) => {
    if (!message) return 'No messages yet';
    if (message.length > 50) {
      return message.substring(0, 50) + '...';
    }
    return message;
  };

  // Calculate total unread messages
  const totalUnread = displayContacts.reduce((sum, contact) => sum + contact.unread_count, 0);

  return (
    <>
             {/* Floating Chat Button */}
       {!isChatOpen && (
         <div className="fixed bottom-10 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
            size="icon"
          >
            <MessageSquare className="h-7 w-7" />
            {totalUnread > 0 && (
              <Badge className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-red-500 text-xs font-bold border-2 border-white">
                {totalUnread > 99 ? '99+' : totalUnread}
              </Badge>
            )}
          </Button>
          <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            Support Chat
          </div>
        </div>
      )}

      {/* Floating Chat Widget */}
      {isChatOpen && (
        <div className={`fixed z-50 transition-all duration-300 ${
          isExpanded 
            ? 'bottom-10 right-6 w-[calc(100vw-2rem)] sm:w-[600px] h-[calc(100vh-12rem)] max-h-[800px]' 
            : 'bottom-10 right-6 w-[calc(100vw-3rem)] sm:w-[450px] h-[calc(100vh-12rem)] max-h-[700px]'
        } sm:bottom-10 sm:right-6 bottom-8 right-4`}>
          <Card className="h-full shadow-2xl border-0">
            <CardHeader className="bg-green-600 text-white p-4 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white text-base">
                  <MessageSquare className="h-5 w-5" />
                  Support Chat
                  {totalUnread > 0 && (
                    <Badge className="bg-white text-green-600 text-xs">
                      {totalUnread}
                    </Badge>
                  )}
                </CardTitle>
                                 <div className="flex items-center gap-1">
                   <Button
                     size="icon"
                     variant="ghost"
                     className="h-6 w-6 text-white hover:bg-green-700"
                     onClick={() => setIsExpanded(!isExpanded)}
                   >
                     {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                   </Button>
                   <Button
                     size="icon"
                     variant="ghost"
                     className="h-6 w-6 text-white hover:bg-green-700"
                     onClick={() => setIsChatOpen(false)}
                   >
                     <X className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
            </CardHeader>

                         <CardContent className="p-0 flex flex-col h-full">
                <div className="flex flex-1">
                                     {/* Chat List Sidebar */}
                   <div className="w-2/5 border-r flex flex-col bg-gray-50">
                     <div className="p-4 border-b bg-white">
                                               <div className="flex items-center gap-2 mb-3">
                          <Button
                            onClick={() => setShowUserSearchDialog(true)}
                            size="icon"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 w-8"
                            title="Start New Chat"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => setShowBroadcastDialog(true)}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                            title="Broadcast Message"
                          >
                            <Megaphone className="h-4 w-4" />
                          </Button>
                        </div>
                       <div className="relative">
                         <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                         <Input 
                           placeholder="Search conversations..." 
                           value={contactSearchTerm}
                           onChange={(e) => setContactSearchTerm(e.target.value)}
                           className="pl-9 h-9 text-sm"
                         />
                       </div>
                     </div>
                    <ScrollArea className="flex-1">
                      {displayContacts.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">No conversations yet</p>
                          <p className="text-xs mt-1">Start a new chat to begin messaging</p>
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
                                  {contactInfo.avatar && (contactInfo.avatar.startsWith('data:image') || contactInfo.avatar.startsWith('http') || contactInfo.avatar.startsWith('/')) ? (
                                    <Image 
                                      src={contactInfo.avatar} 
                                      alt={contactInfo.name}
                                      width={40}
                                      height={40}
                                      className="w-10 h-10 rounded-full object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.nextElementSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${contactInfo.avatar && (contactInfo.avatar.startsWith('data:image') || contactInfo.avatar.startsWith('http') || contactInfo.avatar.startsWith('/')) ? 'hidden' : ''}`}>
                                    {contactInfo.avatar && !(contactInfo.avatar.startsWith('data:image') || contactInfo.avatar.startsWith('http') || contactInfo.avatar.startsWith('/')) ? contactInfo.avatar : '👤'}
                                  </div>
                                  {contactInfo.isOnline && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="font-medium text-sm truncate">{contactInfo.name}</h4>
                                    {contact.unread_count > 0 && (
                                      <Badge className="bg-green-600 text-xs px-2 py-0.5 h-5">
                                        {contact.unread_count}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">{formatLastMessage(contact.last_message || '')}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(contact.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
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
                        <div className="p-4 border-b flex items-center justify-between bg-white">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const contact = displayContacts.find(c => c.id === selectedChat);
                              const contactInfo = contact ? getContactDisplayInfo(contact) : { name: 'Unknown', role: 'Unknown', avatar: '👤', isOnline: false };
                              return (
                                <>
                                  <div className="relative">
                                    {contactInfo.avatar && (contactInfo.avatar.startsWith('data:image') || contactInfo.avatar.startsWith('http') || contactInfo.avatar.startsWith('/')) ? (
                                      <Image 
                                        src={contactInfo.avatar} 
                                        alt={contactInfo.name}
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.style.display = 'none';
                                          target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                      />
                                    ) : null}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${contactInfo.avatar && (contactInfo.avatar.startsWith('data:image') || contactInfo.avatar.startsWith('http') || contactInfo.avatar.startsWith('/')) ? 'hidden' : ''}`}>
                                      {contactInfo.avatar && !(contactInfo.avatar.startsWith('data:image') || contactInfo.avatar.startsWith('http') || contactInfo.avatar.startsWith('/')) ? contactInfo.avatar : '👤'}
                                    </div>
                                    {contactInfo.isOnline && (
                                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-base">{contactInfo.name}</h3>
                                    <p className="text-sm text-muted-foreground">{contactInfo.role}</p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                                                     <div className="flex items-center gap-2">
                             <Button 
                               size="icon" 
                               variant="ghost" 
                               className="h-8 w-8 hover:bg-red-50 hover:text-red-600"
                               onClick={() => setShowDeleteConfirmDialog(true)}
                               disabled={isDeletingChat}
                             >
                               {isDeletingChat ? (
                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                               ) : (
                                 <Trash2 className="h-4 w-4" />
                               )}
                             </Button>
                           </div>
                        </div>

                                                 {/* Messages */}
                         <ScrollArea className="flex-1 p-4 pb-2">
                          <div className="space-y-3">
                            {isLoadingMessages ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                              </div>
                            ) : displayMessages[selectedChat]?.length === 0 ? (
                              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                <div>
                                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                  <p className="text-sm">No messages yet</p>
                                  <p className="text-xs mt-1">Start the conversation by sending a message</p>
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
                                      className={`max-w-[75%] px-4 py-3 rounded-2xl relative ${
                                        isOwn
                                          ? 'bg-green-600 text-white rounded-br-md'
                                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                                      }`}
                                    >
                                      {!isOwn && (
                                        <p className="text-xs font-medium mb-1 text-gray-600">
                                          {message.sender_name}
                                        </p>
                                      )}
                                      <p className="text-sm leading-relaxed">{message.message}</p>
                                      <div className={`text-xs mt-2 flex items-center justify-between gap-2 ${
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
                                              <CheckCheck className="h-4 w-4 text-blue-300" />
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
                         <div className="p-4 pt-3 pb-12 sm:pb-8 border-t bg-white">
                          <div className="flex items-center gap-3">
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
                               className="flex-1 h-10 text-sm"
                             />
                            <Button
                              onClick={handleRealTimeSendMessage}
                              disabled={!newMessage.trim() || isLoadingMessages}
                              className="bg-green-600 hover:bg-green-700 h-10 w-10"
                              size="icon"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      /* Welcome Screen */
                      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-green-50 to-gray-50">
                        <div className="text-center max-w-sm mx-auto p-6">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            Support Chat
                          </h3>
                          <p className="text-sm text-gray-500 mb-6">
                            Select a conversation from the sidebar or start a new chat to begin messaging with students and tutors.
                          </p>
                          <div className="space-y-3">
                            <Button 
                              onClick={() => setShowUserSearchDialog(true)}
                              className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Start New Chat
                            </Button>
                            <Button 
                              onClick={() => setShowBroadcastDialog(true)}
                              variant="outline"
                              className="w-full h-10 text-sm"
                            >
                              <Megaphone className="h-4 w-4 mr-2" />
                              Broadcast Message
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                                 </div>
               </CardContent>
           </Card>
        </div>
      )}

             {/* User Search Dialog */}
       <Dialog open={showUserSearchDialog} onOpenChange={setShowUserSearchDialog}>
         <DialogContent className="sm:max-w-lg">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <UserPlus className="h-5 w-5 text-green-600" />
               Start New Conversation
             </DialogTitle>
             <DialogDescription>
               Search for students or tutors to start a new conversation. You can filter by role and search by name or email.
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
                         <ScrollArea className="h-80">
               {isSearching ? (
                 <div className="flex items-center justify-center p-4">
                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                 </div>
                               ) : searchResults.length === 0 ? (
                  <div className="text-center p-4 text-muted-foreground">
                    {searchTerm.length >= 2 ? 'No users found' : 'No users available'}
                  </div>
               ) : (
                 <div className="space-y-2">
                   {searchResults.map((user) => (
                     <div
                       key={user.id}
                       onClick={() => startChatWithUser(user)}
                       className="flex items-center gap-3 p-3 rounded-lg border hover:bg-green-50 hover:border-green-200 cursor-pointer transition-colors"
                     >
                       <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center relative">
                         {user.avatar_url ? (
                           <Image 
                             src={user.avatar_url.startsWith('http') || user.avatar_url.startsWith('data:') ? user.avatar_url : `${API_BASE_URL.replace('/api', '')}${user.avatar_url}`} 
                             alt={user.full_name || user.email || 'User'} 
                             width={48}
                             height={48}
                             className="w-full h-full rounded-full object-cover"
                             onError={(e) => {
                               const target = e.target as HTMLImageElement;
                               target.style.display = 'none';
                               target.nextElementSibling?.classList.remove('hidden');
                             }}
                           />
                         ) : null}
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center ${user.avatar_url ? 'hidden' : ''}`}>
                           <span className="text-green-600 font-medium text-lg">
                             {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                           </span>
                         </div>
                       </div>
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-1">
                           <p className="font-medium text-sm truncate">{user.full_name || user.email || 'Unknown User'}</p>
                           <Badge variant="secondary" className="text-xs">
                             {user.role === 'student' ? 'Student' : user.role === 'tutor' ? 'Tutor' : user.role || 'User'}
                           </Badge>
                         </div>
                         <p className="text-xs text-muted-foreground truncate">{user.email || 'No email'}</p>
                         {user.phone && (
                           <p className="text-xs text-muted-foreground truncate">📞 {user.phone}</p>
                         )}
                       </div>
                       <div className="text-green-600">
                         <Plus className="h-4 w-4" />
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

             {/* Broadcast Dialog */}
       <Dialog open={showBroadcastDialog} onOpenChange={setShowBroadcastDialog}>
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
                 className="min-h-[100px] pb-8 sm:pb-4"
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

       {/* Delete Confirmation Dialog */}
       <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
         <DialogContent className="sm:max-w-md">
           <DialogHeader>
             <DialogTitle className="flex items-center gap-2">
               <Trash2 className="h-5 w-5 text-red-600" />
               Delete Conversation
             </DialogTitle>
             <DialogDescription>
               Are you sure you want to delete this conversation? This action cannot be undone and will permanently remove all messages.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter>
             <Button 
               variant="outline" 
               onClick={() => setShowDeleteConfirmDialog(false)}
               disabled={isDeletingChat}
             >
               Cancel
             </Button>
             <Button 
               onClick={handleDeleteConversation}
               disabled={isDeletingChat}
               className="bg-red-600 hover:bg-red-700"
             >
               {isDeletingChat ? 'Deleting...' : 'Delete Conversation'}
             </Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </>
   );
 }