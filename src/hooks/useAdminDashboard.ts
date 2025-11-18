// Admin Dashboard Custom Hook

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext.next';
import { ALL_DISTRICTS } from '@/data/bangladeshDistricts';
import { userService } from '@/services/userService';
import { getAuthToken } from '@/utils/auth';

// Define types for admin dashboard
export interface PendingUser {
  id: string;
  name: string;
  role: 'manager' | 'tutor';
  email: string;
  submittedAt: string;
  date: string; // Added date property
  documents: Array<{ name: string; url: string }>;
}

export interface AccountItem {
  id: string;
  name: string;
  role: 'manager' | 'tutor';
  email: string;
  status: 'active' | 'suspended' | 'pending';
  lastActive: string;
}

export interface JobItem {
  id: string;
  title: string;
  subject: string;
  level: string;
  status: 'pending' | 'approved' | 'featured' | 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  postedBy: string;
  date: string;
  budget: string;
  assignedManager?: string;
  isSpam?: boolean;
}

interface TicketItem {
  id: string;
  subject: string;
  category: 'No Show' | 'Payment' | 'Platform' | 'Other';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Escalated';
  createdAt: string;
  assignedManager?: string;
}

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'faq' | 'announcement';
  status: 'draft' | 'published';
  createdAt: string;
  author: string;
}

interface ReportItem {
  id: string;
  title: string;
  type: 'user' | 'tutor' | 'payment' | 'session';
  period: 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  downloadUrl: string;
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


export function useAdminDashboard() {
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  // Local UI state for navigation
  const [activeTab, setActiveTab] = useState<string>('approvals');


  // Approvals section state
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    { id: 'p1', name: 'Rafiul Islam', role: 'manager', email: 'rafiul@example.com', submittedAt: '2025-08-01', date: '2 days ago', documents: [{ name: 'NID.pdf', url: '#' }] },
    { id: 'p2', name: 'Sadia Khan', role: 'tutor', email: 'sadia@example.com', submittedAt: '2025-08-03', date: '4 hours ago', documents: [{ name: 'Certificate.png', url: '#' }, { name: 'NID.pdf', url: '#' }] },
  ]);
  
  const [accounts, setAccounts] = useState<AccountItem[]>([
    { id: 'a1', name: 'Mamun Manager', role: 'manager', email: 'mamun@example.com', status: 'active', lastActive: '2h ago' },
    { id: 'a2', name: 'Ayesha Tutor', role: 'tutor', email: 'ayesha@example.com', status: 'active', lastActive: '5h ago' },
  ]);

  // Jobs section state
  const [jobs, setJobs] = useState<JobItem[]>([
    { id: 'j1', title: 'Physics (HSC)', subject: 'Physics', level: 'higher_secondary', status: 'pending', createdAt: '2025-08-07', postedBy: 'Rafiul Islam', date: '2 days ago', budget: '৳2000-3000/month' },
    { id: 'j2', title: 'English Grammar', subject: 'English', level: 'secondary', status: 'approved', createdAt: '2025-08-06', postedBy: 'Sadia Khan', date: '3 days ago', budget: '৳1500-2500/month', assignedManager: 'Mamun Manager' },
    { id: 'j3', title: 'Mathematics (SSC)', subject: 'Mathematics', level: 'secondary', status: 'featured', createdAt: '2025-08-05', postedBy: 'Ahmed Tutor', date: '4 days ago', budget: '৳2500-3500/month' },
  ]);
  
  // User management state
  const [showAddUserModal, setShowAddUserModal] = useState<boolean>(false);
  const [newUser, setNewUser] = useState<any>({});
  const [showEditUserModal, setShowEditUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  // Tickets section state
  const [tickets, setTickets] = useState<TicketItem[]>([
    { id: 't1', subject: 'Tutor missed class', category: 'No Show', priority: 'Medium', status: 'Open', createdAt: '2025-08-08' },
    { id: 't2', subject: 'Payment not received', category: 'Payment', priority: 'High', status: 'Open', createdAt: '2025-08-07', assignedManager: 'Mamun Manager' },
  ]);

  // Content section state
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { id: 'c1', title: 'How to Find the Perfect Tutor', type: 'blog', status: 'published', createdAt: '2025-08-05', author: 'Admin Team' },
    { id: 'c2', title: 'Platform Maintenance Notice', type: 'announcement', status: 'draft', createdAt: '2025-08-07', author: 'Admin Team' },
  ]);

  // Reports section state
  const [reports, setReports] = useState<ReportItem[]>([
    { id: 'r1', title: 'Monthly User Growth', type: 'user', period: 'monthly', createdAt: '2025-08-01', downloadUrl: '#' },
    { id: 'r2', title: 'Weekly Payment Summary', type: 'payment', period: 'weekly', createdAt: '2025-08-07', downloadUrl: '#' },
  ]);

  // Chat section state - will be populated from real-time API
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([]);
  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Load dashboard stats from API

  // Approval functions
  const approveUser = (userId: string) => {
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
    setAccounts(prev => [{
      id: userId,
      name: pendingUsers.find(u => u.id === userId)?.name || 'User',
      role: (pendingUsers.find(u => u.id === userId)?.role || 'tutor'),
      email: pendingUsers.find(u => u.id === userId)?.email || '',
      status: 'active',
      lastActive: 'Just now',
    }, ...prev]);
    toast({ title: 'Approved', description: 'Account has been approved.' });
  };

  const rejectUser = (userId: string) => {
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: 'Rejected', description: 'Account request was rejected.' });
  };

  // Account management functions
  const suspendAccount = async (accountId: string) => {
    try {
      // Use userService to update user status
      await userService.updateUserStatus(accountId, 'suspended');
      
      // Update local state
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: 'suspended' } : a));
      toast({ title: 'Suspended', description: 'Account has been suspended.' });
    } catch (error) {
      console.error('Error suspending account:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to suspend account. Please try again.', 
        variant: 'destructive' 
      });
    }
  };
  
  // Alias functions for AdminDashboard.tsx
  const handleApproveUser = approveUser;
  const handleRejectUser = rejectUser;
  const handleSuspendUser = suspendAccount;
  
  const handleActivateUser = async (accountId: string) => {
    try {
      // Use userService to update user status
      await userService.updateUserStatus(accountId, 'active');
      
      // Update local state
      setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: 'active' } : a));
      toast({ title: 'Activated', description: 'Account has been activated.' });
    } catch (error) {
      console.error('Error activating account:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to activate account. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      // Use userService to delete user
      await userService.deleteUser(accountId);
      
      // Update local state
      setAccounts(prev => prev.filter(a => a.id !== accountId));
      toast({ title: 'Deleted', description: 'Account has been deleted.' });
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to delete account. Please try again.', 
        variant: 'destructive' 
      });
    }
  };
  
  const handleDeleteUser = deleteAccount;
  
  // User management functions
  const handleCreateUser = async (userData: any) => {
    try {
      // Use userService to create a new user
      await userService.createUser(userData);
      toast({ title: 'Created', description: 'New user has been created.' });
      setShowAddUserModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to create user. Please try again.', 
        variant: 'destructive' 
      });
    }
  };
  
  const handleUpdateUser = async (userData: any) => {
    try {
      // Implementation would connect to backend API
      // This would be implemented when we have an update user endpoint
      toast({ title: 'Updated', description: 'User has been updated.' });
      setShowEditUserModal(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to update user. Please try again.', 
        variant: 'destructive' 
      });
    }
  };

  // Job management functions
  const toggleSpam = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, isSpam: !j.isSpam } : j));
    toast({ title: 'Updated', description: 'Job spam status updated.' });
  };
  
  const handleApproveJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'approved' } : j));
    toast({ title: 'Approved', description: 'Job has been approved.' });
  };
  
  const handleRejectJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    toast({ title: 'Rejected', description: 'Job has been rejected.' });
  };
  
  const handleFeatureJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'featured' } : j));
    toast({ title: 'Featured', description: 'Job has been featured.' });
  };
  
  const handleUnfeatureJob = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'approved' } : j));
    toast({ title: 'Unfeatured', description: 'Job has been unfeatured.' });
  };
  
  const handleDeleteJob = (jobId: string) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
    toast({ title: 'Deleted', description: 'Job has been deleted.' });
  };

  const assignJob = (jobId: string, managerName: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, assignedManager: managerName } : j));
    toast({ title: 'Assigned', description: `Job assigned to ${managerName}.` });
  };

  const reassignJob = (jobId: string, managerName: string) => {
    assignJob(jobId, managerName);
  };

  // Ticket management functions
  const reassignTicket = (ticketId: string, managerName: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, assignedManager: managerName, status: 'In Progress' } : t));
    toast({ title: 'Ticket reassigned', description: `Ticket sent to ${managerName}.` });
  };

  const escalateTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Escalated' } : t));
    toast({ title: 'Escalated', description: 'Ticket escalated to Super Admin.' });
  };

  // Content management functions
  const publishContent = (contentId: string) => {
    setContentItems(prev => prev.map(c => c.id === contentId ? { ...c, status: 'published' } : c));
    toast({ title: 'Published', description: 'Content has been published.' });
  };

  const deleteContent = (contentId: string) => {
    setContentItems(prev => prev.filter(c => c.id !== contentId));
    toast({ title: 'Deleted', description: 'Content has been deleted.' });
  };

  // Chat functions - will be handled by the EnhancedSupportChat component
  const handleSendMessage = () => {
    // This function is now handled by the EnhancedSupportChat component
    // which uses the real-time API endpoints
  };


  // Auth functions
  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to logout. Please try again.', variant: 'destructive' });
    }
  };

  return {
    // State
    activeTab,
    setActiveTab,
    // Approvals
    pendingUsers,
    accounts,
    approveUser,
    rejectUser,
    suspendAccount,
    deleteAccount,
    // User Management
    showAddUserModal,
    setShowAddUserModal,
    newUser,
    setNewUser,
    handleCreateUser,
    showEditUserModal,
    setShowEditUserModal,
    editingUser,
    setEditingUser,
    handleUpdateUser,
    handleApproveUser,
    handleRejectUser,
    handleSuspendUser,
    handleActivateUser,
    handleDeleteUser,
    // Jobs
    jobs,
    toggleSpam,
    assignJob,
    reassignJob,
    handleApproveJob,
    handleRejectJob,
    handleFeatureJob,
    handleUnfeatureJob,
    handleDeleteJob,
    // Tickets
    tickets,
    reassignTicket,
    escalateTicket,
    // Content
    contentItems,
    publishContent,
    deleteContent,
    // Reports
    reports,
    // Chat
    chatContacts,
    chatMessages,
    selectedChat,
    setSelectedChat,
    newMessage,
    setNewMessage,
    handleSendMessage,
    // Auth
    handleLogout,
  };
}