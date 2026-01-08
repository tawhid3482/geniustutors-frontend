"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext.next";
import {
  MessageSquare,
  Send,
  X,
  Maximize2,
  Minimize2,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Image as ImageIcon,
  Clock,
  CheckCheck,
  UserPlus,
  Trash2,
  Edit,
  Check,
  X as XIcon,
  AlertCircle,
  ChevronLeft,
  Phone,
  Video,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";

// RTK Query Hooks
import {
  useGetUserConversationsQuery,
  useGetOrCreateConversationQuery,
  useGetAllMessagesQuery,
  useCreateMessageMutation,
  useUpdateMessageMutation,
  useDeleteMessageMutation,
} from "@/redux/features/chat/chatApi";
import { User, Conversation, Message } from "@/types/common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function FloatingTutorChat() {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const userId = user?.id;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken =
        localStorage.getItem("token") || localStorage.getItem("authToken");
      setToken(storedToken);
    }
  }, []);

  // RTK Query for conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useGetUserConversationsQuery(userId!, {
    skip: !userId,
    pollingInterval: 30000,
  });

  const conversations: Conversation[] = conversationsData?.data || [];

  // States
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showUsersList, setShowUsersList] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [showConversationList, setShowConversationList] = useState(true);
  const [lastSeenTimes, setLastSeenTimes] = useState<Map<string, string>>(
    new Map()
  );

  // Track sent message IDs to prevent duplicates
  const sentMessageIds = useRef<Set<string>>(new Set());
  const pendingMessages = useRef<
    Map<string, { tempId: string; timestamp: number }>
  >(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Check mobile device
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get messages for selected conversation
  const {
    data: messagesData,
    refetch: refetchMessages,
    isLoading: messagesLoading,
  } = useGetAllMessagesQuery(selectedConversation?.id!, {
    skip: !selectedConversation?.id,
    refetchOnMountOrArgChange: true,
  });

  // Mutations
  const [sendMessage] = useCreateMessageMutation();
  const [updateMessage] = useUpdateMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  // Filter users based on role
  const getAllUsers = useCallback(async (): Promise<User[]> => {
    if (!token || !user) {
      return [];
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const allUsers = data.data
          .filter((u: any) => u.id !== user?.id)
          .map((u: any) => ({
            id: u.id,
            fullName: u.fullName || "Unknown User",
            avatar: u.avatar || undefined,
            role: u.role || "USER",
            phone: u.phone || "",
          }));

        // Role-based filtering
        let filteredUsersList: User[] = [];

        if (user?.role === "ADMIN") {
          // ADMIN can see all users
          filteredUsersList = allUsers;
        } else if (
          user?.role === "TUTOR" ||
          user?.role === "STUDENT_GUARDIAN"
        ) {
          // TUTOR and STUDENT_GUARDIAN can only see ADMIN users
          const adminUsers = allUsers.filter((u: User) => u.role === "ADMIN");

          // Get conversation users from existing conversations
          const conversationUserIds = new Set<string>();
          conversations.forEach((conv) => {
            conv.users.forEach((convUser) => {
              if (convUser.id !== user.id) {
                conversationUserIds.add(convUser.id);
              }
            });
          });

          // Get users from conversations
          const existingChatUsers = allUsers.filter((u: User) =>
            conversationUserIds.has(u.id)
          );

          // Combine both and remove duplicates
          const combinedUsers = [...adminUsers, ...existingChatUsers];
          const uniqueUsers = Array.from(
            new Map(combinedUsers.map((user) => [user.id, user])).values()
          );

          filteredUsersList = uniqueUsers;
        }

        return filteredUsersList;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    }
    return [];
  }, [token, user, conversations, toast]);

  // Load users on component mount and when conversations change
  useEffect(() => {
    const loadUsers = async () => {
      if (user && token) {
        setIsFetchingUsers(true);
        try {
          const users = await getAllUsers();
          setFilteredUsers(users);
        } catch (error) {
        } finally {
          setIsFetchingUsers(false);
        }
      }
    };
    loadUsers();
  }, [user, token, getAllUsers]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conversation) => {
    if (!searchQuery) return true;

    const otherUser = conversation.users.find((u) => u.id !== userId);
    if (!otherUser) return false;

    const fullNameMatch =
      otherUser.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;
    const roleMatch =
      otherUser.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    return fullNameMatch || roleMatch;
  });

  // Socket connection with improved online/offline tracking
  useEffect(() => {
    if (!user || !token || !isChatOpen) return;

    const socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      query: {
        userId: user.id,
        token: token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      setSocketConnected(true);

      // Join user room and register as online
      socketInstance.emit("joinUser", user.id);

      // Request initial online users list
      socketInstance.emit("requestOnlineUsers");

      // If there's a selected conversation, join it
      if (selectedConversation) {
        socketInstance.emit("joinConversation", selectedConversation.id);
      }
    });

    socketInstance.on("disconnect", (reason) => {
      setSocketConnected(false);
      setOnlineUsers(new Set()); // Clear online users on disconnect
    });

    socketInstance.on("connect_error", (error) => {
      setSocketConnected(false);
      toast({
        title: "Connection Error",
        description: "Unable to connect to chat server",
        variant: "destructive",
      });
    });

    socketInstance.on("reconnect", (attemptNumber) => {
      setSocketConnected(true);

      // Rejoin rooms after reconnection
      socketInstance.emit("joinUser", user.id);
      socketInstance.emit("requestOnlineUsers");

      if (selectedConversation) {
        socketInstance.emit("joinConversation", selectedConversation.id);
      }
    });

    // Receive initial online users list from server
    socketInstance.on("onlineUsersList", (userIds: string[]) => {
      setOnlineUsers(new Set(userIds.filter((id) => id !== user.id))); // Exclude self
    });

    // Another user came online
    socketInstance.on(
      "userOnline",
      (data: { userId: string; userInfo?: any }) => {
        if (data.userId === user.id) return; // Skip self

        setOnlineUsers((prev) => new Set([...Array.from(prev), data.userId]));

        // Update last seen time to now (since they're online)
        setLastSeenTimes((prev) => {
          const newMap = new Map(prev);
          newMap.set(data.userId, new Date().toISOString());
          return newMap;
        });

        // Show notification if it's the user we're chatting with
        if (selectedConversation) {
          const otherUser = getOtherUser(selectedConversation);
        }
      }
    );

    // Another user went offline
    socketInstance.on("userOffline", (userId: string) => {
      if (userId === user.id) return; // Skip self

      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      // Record the time they went offline
      setLastSeenTimes((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, new Date().toISOString());
        return newMap;
      });

      // Show notification if it's the user we're chatting with
      if (selectedConversation) {
        const otherUser = getOtherUser(selectedConversation);
      }
    });

    // Handle incoming messages from OTHER users only
    socketInstance.on("receiveMessage", (message: Message) => {
      // Skip if this is my own message
      if (message.senderId === user.id) {
        return;
      }

      const isViewingThisConversation =
        selectedConversation?.id === message.conversationId;

      if (isViewingThisConversation) {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m.id === message.id);
          if (exists) {
            return prev.map((m) => (m.id === message.id ? message : m));
          } else {
            return [...prev, message];
          }
        });
        scrollToBottom();
      }

      // Always update conversations list
      refetchConversations();
    });

    // Handle confirmation of sent messages (MY messages)
    socketInstance.on(
      "messageSent",
      ({ tempId, realMessage }: { tempId: string; realMessage: Message }) => {
        setIsSending(false);

        // Mark this message as sent
        sentMessageIds.current.add(realMessage.id);

        // Remove from pending messages
        pendingMessages.current.delete(tempId);

        // Replace temp message with real message
        setMessages((prev) => {
          const newMessages = prev.map((msg) => {
            if (msg.id === tempId) {
              return realMessage;
            }
            return msg;
          });

          // If temp message not found (edge case), add the real message
          if (!prev.some((msg) => msg.id === tempId)) {
            return [...prev, realMessage];
          }

          return newMessages;
        });

        // Update conversations
        refetchConversations();
      }
    );

    socketInstance.on(
      "messageError",
      ({ error, tempId }: { error: string; tempId: string }) => {
        setIsSending(false);

        // Remove from pending messages
        pendingMessages.current.delete(tempId);

        // Remove temp message
        setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
        toast({
          title: "Error",
          description: `Failed to send message: ${error}`,
          variant: "destructive",
        });
      }
    );

    socketInstance.on(
      "userTyping",
      (data: { userId: string; conversationId: string; isTyping: boolean }) => {
        if (
          data.conversationId !== selectedConversation?.id ||
          data.userId === user.id
        )
          return;

        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      }
    );

    socketInstance.on("messageUpdated", (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg))
      );
      refetchConversations();
    });

    socketInstance.on(
      "messageDeleted",
      ({ messageId }: { messageId: string }) => {
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        refetchConversations();
      }
    );

    setSocket(socketInstance);

    // Set up heartbeat interval
    heartbeatIntervalRef.current = setInterval(() => {
      if (socketInstance.connected && user) {
        // Send heartbeat to keep connection alive and show we're online
        socketInstance.emit("heartbeat", {
          userId: user.id,
          timestamp: Date.now(),
        });

        // Request updated online users list every 30 seconds
        socketInstance.emit("requestOnlineUsers");
      }
    }, 30000);

    return () => {
      // Clear heartbeat interval
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }

      if (socketInstance.connected) {
        // Notify server that user is disconnecting
        socketInstance.emit("userDisconnecting", user.id);
        socketInstance.disconnect();
      }
    };
  }, [
    user,
    token,
    isChatOpen,
    selectedConversation?.id,
    refetchConversations,
    toast,
  ]);

  // Clean up old pending messages
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const thirtySecondsAgo = now - 30000;

      pendingMessages.current.forEach((data, tempId) => {
        if (data.timestamp < thirtySecondsAgo) {
          pendingMessages.current.delete(tempId);

          // Also remove from UI if still there
          setMessages((prev) =>
            prev.filter(
              (msg) => !msg.id.startsWith("temp-") || msg.id !== tempId
            )
          );
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation && messagesData?.data) {
      // Filter out any temp messages for this conversation
      const filteredMessages = messagesData.data.filter(
        (msg: any) =>
          !msg.id.startsWith("temp-") ||
          (msg.id.startsWith("temp-") && !pendingMessages.current.has(msg.id))
      );

      setMessages(filteredMessages);
      scrollToBottom();

      // On mobile, show chat window when conversation is selected
      if (isMobile) {
        setShowConversationList(false);
      }
    }
  }, [messagesData, selectedConversation, isMobile]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!socket || !selectedConversation || !user) return;

    // Emit typing event
    socket.emit("typing", {
      conversationId: selectedConversation.id,
      userId: user.id,
      isTyping: true,
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing", {
        conversationId: selectedConversation.id,
        userId: user.id,
        isTyping: false,
      });
    }, 2000);
  }, [socket, selectedConversation, user]);

  // Start new chat
  const handleStartNewChat = async (targetUser: User) => {
    if (!user || !token) {
      toast({
        title: "Error",
        description: "Please login to start chat",
        variant: "destructive",
      });
      return;
    }

    try {
      // Use get-or-create endpoint
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/get-or-create/${user.id}/${targetUser.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const conversation = data.data;

        // Leave previous conversation room if any
        if (socket && selectedConversation) {
          socket.emit("leaveConversation", selectedConversation.id);
        }

        // Join new conversation room
        if (socket) {
          socket.emit("joinConversation", conversation.id);
        }

        // Set conversation with messages
        setSelectedConversation(conversation);
        setMessages(conversation.messages || []);
        setShowUsersList(false);

        // Add user to filteredUsers if not already there
        setFilteredUsers((prev) => {
          const exists = prev.some((u) => u.id === targetUser.id);
          return exists ? prev : [...prev, targetUser];
        });

        refetchConversations();
        scrollToBottom();

        toast({
          title: "Success",
          description: `Started chat with ${targetUser.fullName}`,
        });
      } else {
        throw new Error(data.message || "Failed to create conversation");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to start chat: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Select conversation
  const handleSelectConversation = async (conversation: Conversation) => {
    if (!socket) {
      toast({
        title: "Warning",
        description: "Connecting to chat server...",
        variant: "default",
      });
    }

    // Leave previous conversation room if any
    if (socket && selectedConversation) {
      socket.emit("leaveConversation", selectedConversation.id);
    }

    // Join new conversation room
    if (socket) {
      socket.emit("joinConversation", conversation.id);
    }

    // Set conversation
    setSelectedConversation(conversation);
    setShowUsersList(false);
    setEditingMessageId(null);

    // On mobile, hide conversation list
    if (isMobile) {
      setShowConversationList(false);
    }

    // Fetch messages for this conversation
    refetchMessages();
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation || !user || isSending) {
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    try {
      // Create temp message
      const tempMessage: Message = {
        id: tempId,
        text: messageText,
        senderId: user.id,
        conversationId: selectedConversation.id,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          fullName: user.fullName || "You",
          avatar: user.avatar || "",
          role: user.role,
        },
      };

      // Add temp message to UI immediately
      setMessages((prev) => [...prev, tempMessage]);
      setNewMessage("");
      setIsSending(true);

      // Track as pending message
      pendingMessages.current.set(tempId, {
        tempId,
        timestamp: Date.now(),
      });

      scrollToBottom();

      // Send typing stopped event
      if (socket) {
        socket.emit("typing", {
          conversationId: selectedConversation.id,
          userId: user.id,
          isTyping: false,
        });
      }

      // Send via socket
      if (socket) {
        socket.emit("sendMessage", {
          conversationId: selectedConversation.id,
          senderId: user.id,
          text: messageText,
          tempId: tempId,
        });
      } else {
        // Fallback: Send via RTK Query if socket not connected
        const result = await sendMessage({
          conversationId: selectedConversation.id,
          senderId: user.id,
          text: messageText,
        }).unwrap();

        if (result.success) {
          // Replace temp message with real message
          setMessages((prev) =>
            prev.map((msg) => (msg.id === tempId ? result.data : msg))
          );
          sentMessageIds.current.add(result.data.id);
          pendingMessages.current.delete(tempId);

          // Update conversations list
          refetchConversations();
        }
      }
    } catch (error: any) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      pendingMessages.current.delete(tempId);

      toast({
        title: "Error",
        description: `Failed to send message: ${error.message}`,
        variant: "destructive",
      });
      setIsSending(false);
    }
  };

  // Update message
  const handleUpdateMessage = async (messageId: string) => {
    if (!editingText.trim() || !selectedConversation || !user) return;

    try {
      const result = await updateMessage({
        id: messageId,
        data: { text: editingText.trim(), senderId: user.id },
      }).unwrap();

      if (result.success) {
        // Update local state
        setMessages((prev) =>
          prev.map((msg) => (msg.id === messageId ? result.data : msg))
        );

        // Send via socket for real-time update
        if (socket) {
          socket.emit("updateMessage", {
            messageId,
            text: editingText.trim(),
            conversationId: selectedConversation.id,
            senderId: user.id,
          });
        }

        setEditingMessageId(null);
        setEditingText("");

        toast({
          title: "Success",
          description: "Message updated",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to update message: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const result = await deleteMessage({
        id: messageId,
        data: { senderId: user?.id },
      }).unwrap();

      if (result.success) {
        // Update local state
        setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

        // Send via socket for real-time update
        if (socket && selectedConversation) {
          socket.emit("deleteMessage", {
            messageId,
            conversationId: selectedConversation.id,
            senderId: user?.id,
          });
        }

        setShowDeleteDialog(false);
        setMessageToDelete(null);

        toast({
          title: "Success",
          description: "Message deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to delete message: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Start editing message
  const startEditingMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingText(message.text);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  // Clear chat
  const handleClearChat = async () => {
    if (!selectedConversation || !user) return;

    const confirm = window.confirm(
      "Are you sure you want to clear all messages in this chat?"
    );
    if (!confirm) return;

    try {
      // Get all message IDs
      const messageIds = messages.map((msg) => msg.id);

      // Delete all messages one by one
      for (const messageId of messageIds) {
        try {
          await deleteMessage({
            id: messageId,
            data: { senderId: user.id },
          }).unwrap();
        } catch (error) {}
      }

      // Clear local state
      setMessages([]);
      refetchConversations();

      toast({
        title: "Success",
        description: "Chat cleared",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to clear chat: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Format time
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "";
    }
  };

  // Get other user from conversation
  const getOtherUser = (conversation: Conversation): User | undefined => {
    return conversation.users.find((u) => u.id !== userId);
  };

  // Check if user is online - FIXED VERSION
  const isUserOnline = (userId: string) => {
    // Always return false for self
    if (userId === user?.id) return false;

    return onlineUsers.has(userId);
  };

  // Get user's last seen time
  const getUserLastSeen = (userId: string): string | null => {
    if (isUserOnline(userId)) {
      return null; // User is online, no last seen needed
    }
    return lastSeenTimes.get(userId) || null;
  };

  // Get online status component - IMPROVED
  const getOnlineStatus = (otherUser?: User) => {
    if (!otherUser) return null;

    const isOnline = isUserOnline(otherUser.id);
    const lastSeen = getUserLastSeen(otherUser.id);

    if (isOnline) {
      return (
        <div className="flex items-center text-green-500 text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
          Online now
        </div>
      );
    } else if (lastSeen) {
      return (
        <div className="flex items-center text-gray-500 text-xs">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
          Last seen{" "}
          {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500 text-xs">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
          Offline
        </div>
      );
    }
  };

  // Get typing status text
  const getTypingStatus = () => {
    const typingArray = Array.from(typingUsers);
    if (typingArray.length === 0) return null;

    const otherUser = selectedConversation
      ? getOtherUser(selectedConversation)
      : null;
    if (otherUser && typingUsers.has(otherUser.id)) {
      return `${otherUser.fullName} is typing...`;
    }
    return null;
  };

  // Handle back button on mobile
  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setShowConversationList(true);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-14 w-14 rounded-full bg-green-600 hover:bg-green-700 shadow-lg relative"
          size="icon"
        >
          <MessageSquare className="h-6 w-6 text-white" />
          {conversations.some(
            (conv) => conv.unreadCount && conv.unreadCount > 0
          ) && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
              {conversations.reduce(
                (total, conv) => total + (conv.unreadCount || 0),
                0
              )}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Widget */}
      {isChatOpen && (
        <div
          className={`
          fixed z-50 shadow-2xl rounded-lg overflow-hidden border border-gray-200
          ${isFullScreen ? "inset-0" : ""}
          ${
            !isFullScreen && !isMobile ? "bottom-24 right-6 w-96 h-[600px]" : ""
          }
          ${!isFullScreen && isMobile ? "bottom-20 inset-x-4 h-[500px]" : ""}
          ${isFullScreen ? "w-full h-screen" : ""}
        `}
        >
          <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <MessageSquare className="h-6 w-6" />
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      socketConnected ? "bg-green-400" : "bg-red-400"
                    }`}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Messages</h3>
                  <p className="text-xs opacity-75">
                    {socketConnected ? "Connected" : "Connecting..."}
                    {pendingMessages.current.size > 0 &&
                      ` • ${pendingMessages.current.size} pending`}
                    {onlineUsers.size > 0 && ` • ${onlineUsers.size} online`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {conversations.some(
                  (conv) => conv.unreadCount && conv.unreadCount > 0
                ) && (
                  <Badge
                    variant="secondary"
                    className="bg-white text-green-600"
                  >
                    {conversations.reduce(
                      (total, conv) => total + (conv.unreadCount || 0),
                      0
                    )}{" "}
                    new
                  </Badge>
                )}
                {!isMobile && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-white hover:bg-green-700"
                    onClick={() => setIsFullScreen(!isFullScreen)}
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-green-700"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Conversation List - Show on mobile when no conversation selected */}
              {!selectedConversation || (isMobile && showConversationList) ? (
                <div className="flex-1 overflow-hidden flex flex-col w-full">
                  {/* Search Bar */}
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="p-3 border-b flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-gray-600">
                      Recent Conversations
                    </h4>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowUsersList(true)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      disabled={isFetchingUsers}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      New Chat
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    {conversationsLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : filteredConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                        <MessageSquare className="h-12 w-12 text-gray-300 mb-3" />
                        <h4 className="font-semibold text-gray-500 mb-1">
                          No conversations yet
                        </h4>
                        <p className="text-sm text-gray-400 mb-4">
                          Start a new chat to connect
                        </p>
                        <Button
                          onClick={() => setShowUsersList(true)}
                          disabled={isFetchingUsers}
                        >
                          {isFetchingUsers ? "Loading..." : "Start New Chat"}
                        </Button>
                      </div>
                    ) : (
                      filteredConversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation);
                        const isOnline = otherUser
                          ? isUserOnline(otherUser.id)
                          : false;
                        const lastSeen = otherUser
                          ? getUserLastSeen(otherUser.id)
                          : null;
                        const unreadCount = conversation.unreadCount || 0;

                        return (
                          <div
                            key={conversation.id}
                            className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={otherUser?.avatar} />
                                  <AvatarFallback>
                                    {otherUser?.fullName
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center">
                                    <h4 className="font-semibold text-sm truncate">
                                      {otherUser?.fullName || "Unknown User"}
                                    </h4>
                                    {unreadCount > 0 && (
                                      <Badge className="ml-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center p-0">
                                        {unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                  {conversation.updatedAt && (
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                      {formatRelativeTime(
                                        conversation.updatedAt
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {conversation.lastMessage?.text ||
                                    "No messages yet"}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-xs text-gray-400">
                                    {otherUser?.role || "USER"}
                                  </span>
                                  {isOnline ? (
                                    <span className="text-xs text-green-500 flex items-center">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                                      Online
                                    </span>
                                  ) : lastSeen ? (
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                      {formatDistanceToNow(new Date(lastSeen), {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-gray-400 flex items-center">
                                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
                                      Offline
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </ScrollArea>
                </div>
              ) : (
                /* Chat Window */
                <div className="flex-1 flex flex-col w-full">
                  {/* Chat Header - FIXED */}
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleBackToConversations}
                        className="mr-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      {(() => {
                        const otherUser = getOtherUser(selectedConversation);
                        const isOnline = otherUser
                          ? isUserOnline(otherUser.id)
                          : false;

                        return (
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={otherUser?.avatar} />
                                <AvatarFallback>
                                  {otherUser?.fullName
                                    ?.charAt(0)
                                    .toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                              {isOnline && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold">
                                {otherUser?.fullName || "Unknown User"}
                              </h4>
                              <div className="flex items-center">
                                {getOnlineStatus(otherUser)}
                                {typingUsers.has(otherUser?.id || "") && (
                                  <span className="ml-2 text-xs text-gray-500 italic">
                                    typing...
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
                        <h4 className="font-semibold text-gray-500 mb-2">
                          No messages yet
                        </h4>
                        <p className="text-sm text-gray-400">
                          Send your first message to start the conversation
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          const isOwn = message.senderId === userId;
                          const isTemp = message.id.startsWith("temp-");
                          const isPending =
                            isTemp && pendingMessages.current.has(message.id);

                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isOwn ? "justify-end" : "justify-start"
                              } group`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md rounded-2xl p-3 relative ${
                                  isOwn
                                    ? "bg-green-500 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                } ${
                                  isPending ? "opacity-70 animate-pulse" : ""
                                }`}
                              >
                                {!isOwn && message.sender?.fullName && (
                                  <p className="text-xs font-semibold mb-1">
                                    {message.sender.fullName}
                                  </p>
                                )}

                                {editingMessageId === message.id ? (
                                  <div className="flex flex-col space-y-2">
                                    <Textarea
                                      value={editingText}
                                      onChange={(e) =>
                                        setEditingText(e.target.value)
                                      }
                                      className="bg-transparent border border-white/30 text-white"
                                      autoFocus
                                    />
                                    <div className="flex justify-end space-x-2">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={cancelEditing}
                                        className="h-6 px-2 text-xs"
                                      >
                                        Cancel
                                      </Button>
                                      <button
                                        onClick={() =>
                                          handleUpdateMessage(message.id)
                                        }
                                        className="h-6 px-2 text-xs bg-yellow-300  rounded text-black"
                                      >
                                        Update
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <p className="mb-1 break-words">
                                      {message.text}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <span
                                        className={`text-xs ${
                                          isOwn
                                            ? "text-green-200"
                                            : "text-gray-500"
                                        }`}
                                      >
                                        {formatTime(message.createdAt)}
                                        {!isOwn && message.sender?.fullName && (
                                          <span className="ml-1">
                                            • {message.sender.fullName}
                                          </span>
                                        )}
                                        {isPending && (
                                          <span className="ml-1 text-yellow-300">
                                            (Sending...)
                                          </span>
                                        )}
                                      </span>
                                      {isOwn && (
                                        <div className="flex items-center space-x-1">
                                          {isPending ? (
                                            <Clock className="h-3 w-3 text-yellow-300 animate-pulse" />
                                          ) : (
                                            <>
                                              <CheckCheck className="h-3 w-3 text-green-200" />
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-5 w-5 text-green-200 hover:text-white hover:bg-green-600"
                                                onClick={() =>
                                                  startEditingMessage(message)
                                                }
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-5 w-5 text-green-200 hover:text-white hover:bg-green-600"
                                                onClick={() => {
                                                  setMessageToDelete(
                                                    message.id
                                                  );
                                                  setShowDeleteDialog(true);
                                                }}
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Typing Indicator */}
                  {getTypingStatus() && (
                    <div className="px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 italic">
                          {getTypingStatus()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 flex items-end space-x-2">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                          }}
                          placeholder="Type a message..."
                          className="min-h-[40px] max-h-[120px] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          disabled={isSending || editingMessageId !== null}
                        />
                      </div>
                      <Button
                        type="submit"
                        size="icon"
                        disabled={
                          !newMessage.trim() ||
                          isSending ||
                          editingMessageId !== null
                        }
                        className="bg-green-500 hover:bg-green-600"
                      >
                        {isSending ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex justify-between">
                      <span>
                        {socketConnected ? "🟢 Connected" : "🟡 Connecting..."}
                        {pendingMessages.current.size > 0 &&
                          ` • ${pendingMessages.current.size} pending`}
                        {onlineUsers.size > 0 &&
                          ` • ${onlineUsers.size} online`}
                      </span>
                      <span>{messages.length} messages</span>
                    </div>
                  </form>
                </div>
              )}

              {/* Users List for New Chat */}
              {showUsersList && (
                <div className="absolute inset-0 bg-white z-10 flex flex-col">
                  <div className="p-3 border-b flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Start New Chat</h4>
                      <p className="text-xs text-gray-500">
                        {user?.role === "ADMIN"
                          ? "You can chat with all users"
                          : "You can only chat with ADMIN users"}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowUsersList(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search users by name or role..."
                        className="pl-10"
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          setSearchQuery(e.target.value);
                          // Filter users locally
                          getAllUsers().then((users) => {
                            const filtered = users.filter(
                              (user) =>
                                user.fullName?.toLowerCase().includes(value) ||
                                user.role?.toLowerCase().includes(value)
                            );
                            setFilteredUsers(filtered);
                          });
                        }}
                      />
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    {isFetchingUsers ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8">
                        <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
                        <h4 className="font-semibold text-gray-500 mb-2">
                          No users found
                        </h4>
                        <p className="text-sm text-gray-400">
                          {user?.role === "ADMIN"
                            ? "No other users available to chat with"
                            : "No ADMIN users available to chat with"}
                        </p>
                      </div>
                    ) : (
                      filteredUsers.map((userItem) => {
                        const isOnline = isUserOnline(userItem.id);
                        const lastSeen = getUserLastSeen(userItem.id);

                        return (
                          <div
                            key={userItem.id}
                            className="p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => handleStartNewChat(userItem)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={userItem.avatar} />
                                  <AvatarFallback>
                                    {userItem.fullName
                                      ?.charAt(0)
                                      .toUpperCase() || "?"}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold">
                                  {userItem.fullName}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {userItem.role}
                                </p>
                              </div>
                              {isOnline ? (
                                <div className="flex flex-col items-end">
                                  <div className="w-2 h-2 bg-green-500 rounded-full mb-1 animate-pulse"></div>
                                  <span className="text-xs text-green-500">
                                    Online
                                  </span>
                                </div>
                              ) : lastSeen ? (
                                <div className="flex flex-col items-end">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
                                  <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(lastSeen), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-col items-end">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full mb-1"></div>
                                  <span className="text-xs text-gray-400">
                                    Offline
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setMessageToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                messageToDelete && handleDeleteMessage(messageToDelete)
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
