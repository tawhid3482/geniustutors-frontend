"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext.next";

interface Message {
  id: string;
  text: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  sender?: {
    id: string;
    fullName: string;
    avatar: string;
    role: string;
  };
}

interface Conversation {
  id: string;
  members: string[];
  messages: Message[];
  users: Array<{
    id: string;
    fullName: string;
    avatar: string;
    role: string;
    phone: string;
  }>;
  updatedAt: string;
  lastMessage?: Message | null;
  unreadCount?: number;
}

interface User {
  id: string;
  fullName: string;
  avatar?: string;
  role: string;
  phone: string;
}

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token") || localStorage.getItem("authToken");
      setToken(storedToken);
      console.log("Token found:", storedToken ? "Yes" : "No");
    }
  }, []);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);

  const fetchAllUsers = useCallback(async () => {
    if (!token || !user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const filteredUsers = data.data
          .filter((u: any) => u.id !== user.id)
          .map((u: any) => ({
            id: u.id,
            fullName: u.fullName,
            avatar: u.avatar || null,
            role: u.role,
            phone: u.phone,
          }));
        setUsers(filteredUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [token, user]);

  // কনভারসেশন ফেচ
  const fetchConversations = useCallback(async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/conversations/${user.id}`,
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
        console.log("Fetched conversations:", data.data.length);
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  // মেসেজ ফেচ
  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!token) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/messages/${conversationId}`,
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
        console.log("Fetched messages:", data.data.length);
        setMessages(data.data);
        scrollToBottom();
        
        // আনরিড কাউন্ট রিসেট
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, [token]);

  // নতুন চ্যাট শুরু করুন
  const handleStartNewChat = async (targetUser: User) => {
    if (!user || !token || !socket) return;

    try {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const conversation = data.data;

        // পূর্ববর্তী রুম ছাড়ুন
        if (selectedConversation && socket) {
          socket.emit("leaveConversation", selectedConversation.id);
        }

        // নতুন রুমে যোগ দিন
        socket.emit("joinConversation", conversation.id);

        setSelectedConversation(conversation);
        setSelectedUser(targetUser);
        setMessages(conversation.messages || []);

        // লিস্ট রিফ্রেশ
        await fetchConversations();
        
        scrollToBottom();
      }
    } catch (error: any) {
      console.error("Error starting conversation:", error);
      alert(`Failed: ${error.message}`);
    }
  };

  // কনভারসেশন সিলেক্ট করুন
  const handleSelectConversation = async (conversation: Conversation) => {
    if (!socket) return;

    // পূর্ববর্তী রুম ছাড়ুন
    if (selectedConversation && socket) {
      socket.emit("leaveConversation", selectedConversation.id);
    }

    // নতুন রুমে যোগ দিন
    socket.emit("joinConversation", conversation.id);
    console.log(`Joined conversation: ${conversation.id}`);

    setSelectedConversation(conversation);
    
    const otherUser = conversation.users.find(u => u.id !== user?.id);
    setSelectedUser(otherUser || null);

    // নতুন মেসেজ ফেচ করার আগে রিসেট করুন
    setMessages([]);
    await fetchMessages(conversation.id);
  };

  // মেসেজ পাঠান
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !selectedConversation || !user || !socket || isSending) {
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}`;

    // টেম্প মেসেজ ক্রিয়েট করুন
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

    // টেম্প মেসেজ UI-তে যোগ করুন
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    setIsSending(true);
    scrollToBottom();

    // সকেট দিয়ে পাঠান
    socket.emit("sendMessage", {
      conversationId: selectedConversation.id,
      senderId: user.id,
      text: messageText,
      tempId: tempId
    });

    console.log("Message sent via socket with tempId:", tempId);
  };

  // স্ক্রোল টু বটম
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // টাইম ফরম্যাট
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

  // কনভারসেশন ডেট ফরম্যাট
  const formatConversationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Yesterday";
      if (diffDays > 1) return date.toLocaleDateString();
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  // সকেট কানেকশন - FIXED VERSION
  useEffect(() => {
    if (!user || !token) {
      console.log("Waiting for user/token...");
      return;
    }

    console.log("🔄 Setting up socket connection...");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const socketInstance = io("http://160.25.7.224:5008", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      query: {
        userId: user.id,
        token: token
      }
    });

    // বেসিক ইভেন্ট হ্যান্ডলার
    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      setSocketConnected(true);
      
      // ইউজার রুমে যোগ দিন
      socketInstance.emit("joinUser", user.id);
      console.log(`👤 User ${user.id} joined their room`);
      
      // ইতিমধ্যে সিলেক্ট করা কনভারসেশন থাকলে তার রুমেও যোগ দিন
      if (selectedConversation) {
        socketInstance.emit("joinConversation", selectedConversation.id);
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setSocketConnected(false);
    });

    // সবচেয়ে গুরুত্বপূর্ণ - ইনকামিং মেসেজ হ্যান্ডেল
    socketInstance.on("receiveMessage", (message: Message) => {
      console.log("📩 Received real-time message via receiveMessage:", {
        id: message.id,
        text: message.text,
        senderId: message.senderId,
        conversationId: message.conversationId
      });

      // চেক করুন আমরা এই কনভারসেশন ভিউ করছি কিনা
      const isViewingThisConversation = selectedConversation?.id === message.conversationId;
      const isMyMessage = message.senderId === user.id;
      
      // মেসেজ কারেন্ট কনভারসেশনের জন্য হলে যোগ করুন
      if (isViewingThisConversation) {
        console.log("Adding message to current chat");
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          return !exists ? [...prev, message] : prev;
        });
        scrollToBottom();
      }
      
      // সবসময় কনভারসেশন লিস্ট আপডেট করুন
      setConversations(prev => {
        const conversationExists = prev.some(conv => conv.id === message.conversationId);
        
        if (conversationExists) {
          // কনভারসেশন আপডেট করুন
          return prev.map(conv => {
            if (conv.id === message.conversationId) {
              // আপনার নিজের মেসেজের জন্য আনরিড কাউন্ট না বাড়ানো
              const shouldIncrementUnread = !isViewingThisConversation && !isMyMessage;
              
              return {
                ...conv,
                lastMessage: message,
                updatedAt: new Date().toISOString(),
                unreadCount: shouldIncrementUnread 
                  ? (conv.unreadCount || 0) + 1 
                  : (conv.unreadCount || 0)
              };
            }
            return conv;
          });
        } else {
          // নতুন কনভারসেশন, ফেচ করে নিন
          console.log("New conversation detected, fetching...");
          fetchConversations();
          return prev;
        }
      });
    });

    // মেসেজ সেন্ট কনফার্মেশন
    socketInstance.on("messageSent", ({ tempId, realMessage }: { tempId: string; realMessage: Message }) => {
      console.log("✅ Message confirmed:", tempId, "->", realMessage.id);
      setIsSending(false);
      
      // টেম্প মেসেজ রিয়েল মেসেজ দিয়ে রিপ্লেস করুন
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempId ? realMessage : msg
        )
      );
      
      // কনভারসেশন লিস্টে লাস্ট মেসেজ আপডেট করুন
      setConversations(prev => 
        prev.map(conv => {
          if (conv.id === realMessage.conversationId) {
            return {
              ...conv,
              lastMessage: realMessage,
              updatedAt: new Date().toISOString()
            };
          }
          return conv;
        })
      );
    });

    // মেসেজ এরর
    socketInstance.on("messageError", ({ error, tempId }: { error: string; tempId: string }) => {
      console.error("Message error:", error);
      setIsSending(false);
      
      // টেম্প মেসেজ রিমুভ করুন
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      alert(`Failed to send: ${error}`);
    });

    // নোটিফিকেশন (যখন অন্য কনভারসেশনে মেসেজ আসে) - FIXED
    socketInstance.on("newMessageNotification", (data) => {
      console.log("🔔 New message notification:", data);
      
      // নোটিফিকেশন ডেটা থেকে মেসেজ এক্সট্রাক্ট করুন
      const message = data.message;
      
      // যদি আপনি এই কনভারসেশন ভিউ না করছেন
      if (selectedConversation?.id !== data.conversationId) {
        console.log("You have a new message in another conversation");
        
        // কনভারসেশন লিস্টে আনরিড কাউন্ট আপডেট করুন
        setConversations(prev => 
          prev.map(conv => {
            if (conv.id === data.conversationId) {
              return {
                ...conv,
                lastMessage: message,
                updatedAt: new Date().toISOString(),
                unreadCount: (conv.unreadCount || 0) + 1
              };
            }
            return conv;
          })
        );
      } else {
        // যদি আপনি এই কনভারসেশন ভিউ করছেন, তাহলে মেসেজ যোগ করুন
        console.log("Adding message from notification to current chat:", message);
        setMessages(prev => {
          const exists = prev.some(m => m.id === message.id);
          return !exists ? [...prev, message] : prev;
        });
        scrollToBottom();
      }
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    return () => {
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
    };
  }, [user, token, selectedConversation?.id, fetchConversations]); // fetchConversations যোগ করুন

  // ইনিশিয়াল লোড
  useEffect(() => {
    if (user && token) {
      fetchAllUsers();
      fetchConversations();
    }
  }, [user, token, fetchAllUsers, fetchConversations]);

  // অটো-স্ক্রোল
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // ডিবাগিং: সকেট স্ট্যাটাস লগ করুন
  useEffect(() => {
    console.log("Socket connection status:", socketConnected ? "Connected" : "Disconnected");
    console.log("Selected conversation:", selectedConversation?.id);
    console.log("Messages count:", messages.length);
    console.log("Conversations count:", conversations.length);
  }, [socketConnected, selectedConversation, messages, conversations]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold mb-2">Please login</h3>
          <p className="text-gray-500">You need to be logged in to use chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* সাইডবার */}
      <div className="w-1/3 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Messages</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-xs text-gray-500">
                {socketConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">Start New Chat</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map((userItem) => (
                <button
                  key={userItem.id}
                  onClick={() => handleStartNewChat(userItem)}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    {userItem.avatar ? (
                      <img
                        src={userItem.avatar}
                        alt={userItem.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {userItem.fullName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold truncate">{userItem.fullName}</p>
                    <p className="text-sm text-gray-500 truncate">{userItem.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <h3 className="text-sm font-semibold text-gray-500 mb-2 px-2">Recent Chats</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">💬</div>
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherUser = conversation.users.find(u => u.id !== user.id);
                const showUnread = conversation.unreadCount && conversation.unreadCount > 0;
                
                return (
                  <div
                    key={conversation.id}
                    className={`p-3 rounded-lg cursor-pointer mb-2 hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center relative">
                        {otherUser?.avatar ? (
                          <img
                            src={otherUser.avatar}
                            alt={otherUser.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold text-lg">
                            {otherUser?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                        {showUnread && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <p className="font-semibold truncate">{otherUser?.fullName}</p>
                            {showUnread && (
                              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                {conversation.unreadCount} new
                              </span>
                            )}
                          </div>
                          {conversation.updatedAt && (
                            <span className="text-xs text-gray-500">
                              {formatConversationDate(conversation.updatedAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage?.text || "No messages yet"}
                        </p>
                        {showUnread && conversation.unreadCount && (
                          <p className="text-xs text-blue-500 mt-1">
                            Tap to view {conversation.unreadCount} new message{conversation.unreadCount > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* মেইন চ্যাট */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation && selectedUser ? (
          <>
            <div className="p-4 border-b bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center relative">
                  {selectedUser.avatar ? (
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 font-semibold text-lg">
                      {selectedUser.fullName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {/* অনলাইন স্ট্যাটাস */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.fullName}</h3>
                  <p className="text-sm text-gray-500">{selectedUser.role}</p>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${socketConnected ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="text-xs text-gray-500">
                    {socketConnected ? "Live" : "Offline"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold mb-2">Start a conversation</h3>
                  <p className="text-gray-500">Send your first message to {selectedUser.fullName}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-2xl p-4 ${
                          message.senderId === user.id
                            ? "bg-blue-500 text-white rounded-br-none"
                            : "bg-white text-gray-800 shadow rounded-bl-none"
                        } ${message.id.startsWith("temp-") ? "opacity-80 animate-pulse" : ""}`}
                      >
                        <p className="mb-1 break-words">{message.text}</p>
                        <div className="flex justify-between items-center mt-2">
                          <p className={`text-xs ${message.senderId === user.id ? "text-blue-200" : "text-gray-500"}`}>
                            {formatTime(message.createdAt)}
                            {message.senderId !== user.id && message.sender?.fullName && (
                              <span className="ml-1">• {message.sender.fullName}</span>
                            )}
                          </p>
                          {message.id.startsWith("temp-") && (
                            <span className="text-xs text-yellow-300 ml-2">⏳ Sending...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!socketConnected || isSending}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || !socketConnected || isSending}
                  className="bg-blue-500 text-white px-8 py-3 rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : "Send"}
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-2 text-center flex justify-between">
                <span>
                  {socketConnected ? "Connected to chat server" : "Disconnected - reconnecting..."}
                </span>
                <span>
                  Messages: {messages.length}
                </span>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center max-w-md">
              <div className="text-8xl mb-6">💬</div>
              <h3 className="text-2xl font-bold mb-4">Welcome to Chat</h3>
              <p className="text-gray-600 mb-8">
                {socketConnected
                  ? "Select a conversation or start a new chat"
                  : "Connecting to chat server..."}
              </p>
              <div className={`w-4 h-4 rounded-full mx-auto mb-4 ${socketConnected ? "bg-green-500" : "bg-red-500 animate-pulse"}`}></div>
              <div className="text-sm text-gray-500">
                Status: {socketConnected ? "Connected" : "Connecting..."}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;