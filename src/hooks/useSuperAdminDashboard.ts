// Super Admin Dashboard Custom Hook

import { useState, useMemo, useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext.next';
import { ALL_DISTRICTS } from '@/data/bangladeshDistricts';
import { API_BASE_URL } from '@/constants/api';

// Define types for super admin dashboard
interface PendingUser {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'tutor';
  email: string;
  submittedAt: string;
  documents: Array<{ name: string; url: string }>;
}

interface AccountItem {
  id: string;
  name: string;
  role: 'admin' | 'manager' | 'tutor' | 'student';
  email: string;
  status: 'active' | 'suspended' | 'pending';
  lastActive: string;
}

interface JobItem {
  id: string;
  title: string;
  subject: string;
  level: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
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
  type: 'blog' | 'faq' | 'announcement' | 'policy';
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  author: string;
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };
}

interface ReportItem {
  id: string;
  title: string;
  type: 'user' | 'tutor' | 'payment' | 'session' | 'system' | 'security';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  createdAt: string;
  downloadUrl: string;
}

interface ChatContact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

interface DashboardStats {
  title: string;
  value: string | number;
  change: string;
}

interface PlatformSettings {
  commissionRate: number;
  fixedFee: number;
  maintenanceMode: boolean;
  websiteSettings?: {
    name: string;
    logo: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
    googleTagManagerId: string;
    customHeadCode: string;
  };
}

interface TuitionTaxonomy {
  categories: CategoryItem[];
  subjects: CategoryItem[];
  salaryRanges: string[];
  classLevels: CategoryItem[];
}

interface CategoryItem {
  id: number;
  name: string;
}

interface LogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  details: string;
  severity: 'info' | 'warning' | 'error';
}

interface FinanceOverview {
  totalRevenue: string;
  pendingPayouts: string;
  processingFees: string;
  monthlyGrowth: string;
}

export function useSuperAdminDashboard() {
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  // Local UI state for navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Stats
  const [stats, setStats] = useState<DashboardStats[]>([
    { title: 'Total Users', value: 3250, change: '+15%' },
    { title: 'Platform Revenue', value: '৳525,000', change: '+12%' },
    { title: 'Active Sessions', value: 148, change: '+18%' },
    { title: 'System Uptime', value: '99.9%', change: '+0.2%' }
  ]);

  // User & Role Management section state
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([
    { id: 'p1', name: 'Rafiul Islam', role: 'admin', email: 'rafiul@example.com', submittedAt: '2025-08-01', documents: [{ name: 'NID.pdf', url: '#' }] },
    { id: 'p2', name: 'Sadia Khan', role: 'manager', email: 'sadia@example.com', submittedAt: '2025-08-03', documents: [{ name: 'Certificate.png', url: '#' }, { name: 'NID.pdf', url: '#' }] },
  ]);
  
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [recentUsers, setRecentUsers] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentUsersLoading, setRecentUsersLoading] = useState(false);

  // Website Information
  const [websiteInfo, setWebsiteInfo] = useState({
    siteName: 'Tutor Connect',
    contactEmail: 'contact@tutorconnect.com',
    contactPhone: '+880 1234567890',
    address: 'Dhaka, Bangladesh',
    socialLinks: {
      facebook: 'https://facebook.com/tutorconnect',
      twitter: 'https://twitter.com/tutorconnect',
      instagram: 'https://instagram.com/tutorconnect'
    }
  });

  const [tuitionTaxonomy, setTuitionTaxonomy] = useState<TuitionTaxonomy>({
    categories: [],
    subjects: [],
    salaryRanges: ['৳500-1000/hr', '৳1000-2000/hr', '৳2000-3000/hr', '৳3000+/hr'],
    classLevels: []
  });

  // Fetch taxonomy data on component mount
  useEffect(() => {
    const fetchTaxonomyData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/website/taxonomy`);
        const result = await response.json();
        
        if (result.success) {
          const categories = result.data.categories.map((cat: any) => ({
            id: cat.id,
            name: cat.name
          }));
          
          const subjects = result.data.categories.flatMap((cat: any) => 
            cat.subjects.map((sub: any) => ({
              id: sub.id,
              name: sub.name
            }))
          );
          
          const classLevels = result.data.categories.flatMap((cat: any) => 
            cat.classLevels.map((level: any) => ({
              id: level.id,
              name: level.name
            }))
          );
          
          setTuitionTaxonomy({
            categories,
            subjects,
            salaryRanges: ['৳500-1000/hr', '৳1000-2000/hr', '৳2000-3000/hr', '৳3000+/hr'],
            classLevels
          });
        }
      } catch (error) {
        console.error('Error fetching taxonomy data:', error);
      }
    };

    fetchTaxonomyData();
  }, []);

  // Logs & Security section state
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 'l1', action: 'User Login', user: 'admin@example.com', timestamp: new Date(Date.now() - 3600000), details: 'Successful login from Dhaka', severity: 'info' },
    { id: 'l2', action: 'Failed Login Attempt', user: 'unknown', timestamp: new Date(Date.now() - 7200000), details: 'Multiple failed attempts from IP 192.168.1.1', severity: 'warning' },
    { id: 'l3', action: 'Database Backup', user: 'system', timestamp: new Date(Date.now() - 86400000), details: 'Automatic daily backup completed', severity: 'info' },
    { id: 'l4', action: 'API Rate Limit Exceeded', user: 'api_user', timestamp: new Date(Date.now() - 43200000), details: 'Rate limit exceeded for /api/users endpoint', severity: 'error' },
  ]);

  // Finance Oversight section state
  const [financeOverview, setFinanceOverview] = useState<FinanceOverview>({
    totalRevenue: '৳1,250,000',
    pendingPayouts: '৳350,000',
    processingFees: '৳75,000',
    monthlyGrowth: '+8.5%'
  });

  // Content Management section state
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { 
      id: 'c1', 
      title: 'How to Find the Perfect Tutor', 
      type: 'blog', 
      status: 'published', 
      createdAt: '2025-08-05', 
      author: 'Admin Team',
      seo: {
        title: 'Finding Your Ideal Tutor | TutorConnect',
        description: 'Learn how to find the perfect tutor for your educational needs with our comprehensive guide.',
        keywords: ['tutor', 'education', 'learning', 'tutoring']
      }
    },
    { 
      id: 'c2', 
      title: 'Platform Maintenance Notice', 
      type: 'announcement', 
      status: 'draft', 
      createdAt: '2025-08-07', 
      author: 'Admin Team' 
    },
    { 
      id: 'c3', 
      title: 'Privacy Policy Update', 
      type: 'policy', 
      status: 'published', 
      createdAt: '2025-08-01', 
      author: 'Legal Team' 
    },
  ]);

  // Reports section state
  const [reports, setReports] = useState<ReportItem[]>([
    { id: 'r1', title: 'Monthly User Growth', type: 'user', period: 'monthly', createdAt: '2025-08-01', downloadUrl: '#' },
    { id: 'r2', title: 'Weekly Payment Summary', type: 'payment', period: 'weekly', createdAt: '2025-08-07', downloadUrl: '#' },
    { id: 'r3', title: 'System Performance Report', type: 'system', period: 'daily', createdAt: '2025-08-08', downloadUrl: '#' },
    { id: 'r4', title: 'Security Audit Log', type: 'security', period: 'quarterly', createdAt: '2025-07-01', downloadUrl: '#' },
  ]);

  // Chat section state
  const [chatContacts, setChatContacts] = useState<ChatContact[]>([
    { id: "admin1", name: "Admin Team", role: "Platform Administrators", avatar: "👨‍💼", lastMessage: "System maintenance scheduled", unread: 0 },
    { id: "admin2", name: "Mamun Admin", role: "Regional Admin", avatar: "👨‍💻", lastMessage: "New escalation request", unread: 2 },
    { id: "manager1", name: "Rafiul Manager", role: "Senior Manager", avatar: "👨‍💼", lastMessage: "Monthly report ready", unread: 1 },
    { id: "support", name: "Support Team", role: "Customer Support", avatar: "🛠️", lastMessage: "Critical issue reported", unread: 3 },
    { id: "tech", name: "Tech Team", role: "Technical Support", avatar: "⚙️", lastMessage: "Server optimization complete", unread: 0 },
  ]);

  const [chatMessages, setChatMessages] = useState<{[key: string]: ChatMessage[]}>({});
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");

  // Initialize chat messages
  useEffect(() => {
    const initialMessages = {
      admin1: [
        { id: "1", sender: "Admin Team", message: "System maintenance scheduled for tonight", timestamp: new Date(Date.now() - 3600000), isOwn: false },
        { id: "2", sender: "You", message: "What's the expected downtime?", timestamp: new Date(Date.now() - 1800000), isOwn: true },
        { id: "3", sender: "Admin Team", message: "Approximately 30 minutes", timestamp: new Date(Date.now() - 900000), isOwn: false },
      ],
      admin2: [
        { id: "1", sender: "Mamun Admin", message: "We have a new escalation request", timestamp: new Date(Date.now() - 7200000), isOwn: false },
        { id: "2", sender: "You", message: "What's the nature of the escalation?", timestamp: new Date(Date.now() - 3600000), isOwn: true },
        { id: "3", sender: "Mamun Admin", message: "Payment dispute with a high-value client", timestamp: new Date(Date.now() - 1800000), isOwn: false },
      ],
      manager1: [
        { id: "1", sender: "Rafiul Manager", message: "Monthly report is ready for review", timestamp: new Date(Date.now() - 5400000), isOwn: false },
        { id: "2", sender: "You", message: "Great, please share the highlights", timestamp: new Date(Date.now() - 2700000), isOwn: true },
        { id: "3", sender: "Rafiul Manager", message: "15% growth in active users, 20% increase in revenue", timestamp: new Date(Date.now() - 900000), isOwn: false },
      ],
      support: [
        { id: "1", sender: "Support Team", message: "Critical issue reported with payment gateway", timestamp: new Date(Date.now() - 3600000), isOwn: false },
        { id: "2", sender: "You", message: "Is the tech team aware?", timestamp: new Date(Date.now() - 1800000), isOwn: true },
        { id: "3", sender: "Support Team", message: "Yes, they're working on it now", timestamp: new Date(Date.now() - 900000), isOwn: false },
      ],
      tech: [
        { id: "1", sender: "Tech Team", message: "Server optimization completed successfully", timestamp: new Date(Date.now() - 3600000), isOwn: false },
        { id: "2", sender: "You", message: "Great! Any performance improvements?", timestamp: new Date(Date.now() - 1800000), isOwn: true },
        { id: "3", sender: "Tech Team", message: "40% faster response times", timestamp: new Date(Date.now() - 900000), isOwn: false },
      ],
    };
    setChatMessages(initialMessages);
  }, []);

  // Load dashboard stats and recent users from API
  useEffect(() => {
    fetchSuperAdminStats();
    fetchRecentUsers();
  }, []);

  const fetchSuperAdminStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/dashboard/super-admin-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching super admin stats:', error);
      toast({ title: 'Error', description: 'Failed to fetch dashboard statistics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentUsers = async () => {
    try {
      setRecentUsersLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-users?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        // Transform the data to match our interface
        const transformedUsers = data.data.map((user: any) => ({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email,
          status: user.status,
          lastActive: user.lastActive,
          roleColor: user.roleColor
        }));
        setRecentUsers(transformedUsers);
        setAccounts(transformedUsers); // Also update accounts for backward compatibility
      }
    } catch (error) {
      console.error('Error fetching recent users:', error);
      toast({ title: 'Error', description: 'Failed to fetch recent users', variant: 'destructive' });
    } finally {
      setRecentUsersLoading(false);
    }
  };

  // User & Role Management functions
  const approveUser = (userId: string) => {
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
    setAccounts(prev => [{
      id: userId,
      name: pendingUsers.find(u => u.id === userId)?.name || 'User',
      role: (pendingUsers.find(u => u.id === userId)?.role || 'admin'),
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
  const suspendAccount = (accountId: string) => {
    setAccounts(prev => prev.map(a => a.id === accountId ? { ...a, status: 'suspended' } : a));
    toast({ title: 'Suspended', description: 'Account has been suspended.' });
  };

  const deleteAccount = (accountId: string) => {
    setAccounts(prev => prev.filter(a => a.id !== accountId));
    toast({ title: 'Deleted', description: 'Account has been deleted.' });
  };

  // Website Information and Tuition Taxonomy functions
  const updateWebsiteInfo = async (info: Partial<typeof websiteInfo>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/website/info', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...info })
      });
      
      if (response.ok) {
        setWebsiteInfo(prev => ({ ...prev, ...info }));
        toast({ title: 'Website Info Updated', description: 'Website information has been updated successfully.' });
      } else {
        toast({ title: 'Update Failed', description: 'Failed to update website information.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating website info:', error);
      toast({ title: 'Error', description: 'An error occurred while updating website information.', variant: 'destructive' });
    }
  };

  const updateTuitionTaxonomy = async (taxonomy: Partial<TuitionTaxonomy>) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/website/taxonomy`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...taxonomy })
      });
      
      if (response.ok) {
        setTuitionTaxonomy(prev => ({ ...prev, ...taxonomy }));
        toast({ title: 'Taxonomy Updated', description: 'Tuition taxonomy has been updated successfully.' });
      } else {
        toast({ title: 'Update Failed', description: 'Failed to update tuition taxonomy.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating tuition taxonomy:', error);
      toast({ title: 'Update Failed', description: 'An error occurred while updating tuition taxonomy.', variant: 'destructive' });
    }
  };

  // Content management functions
  const publishContent = (contentId: string) => {
    setContentItems(prev => prev.map(c => c.id === contentId ? { ...c, status: 'published' } : c));
    toast({ title: 'Published', description: 'Content has been published.' });
  };

  const archiveContent = (contentId: string) => {
    setContentItems(prev => prev.map(c => c.id === contentId ? { ...c, status: 'archived' } : c));
    toast({ title: 'Archived', description: 'Content has been archived.' });
  };

  const deleteContent = (contentId: string) => {
    setContentItems(prev => prev.filter(c => c.id !== contentId));
    toast({ title: 'Deleted', description: 'Content has been deleted.' });
  };

  const updateSEO = (contentId: string, seo: { title: string; description: string; keywords: string[] }) => {
    setContentItems(prev => prev.map(c => c.id === contentId ? { ...c, seo } : c));
    toast({ title: 'SEO Updated', description: 'SEO information has been updated.' });
  };

  // Chat functions
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    
    const message = {
      id: Date.now().toString(),
      sender: "You",
      message: newMessage,
      timestamp: new Date(),
      isOwn: true,
    };
    
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), message],
    }));
    
    setNewMessage("");
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

  // Return the hook's API
  return {
    // State
    activeTab,
    setActiveTab,
    stats,
    loading,
    // User & Role Management
    pendingUsers,
    accounts,
    recentUsers,
    recentUsersLoading,
    approveUser,
    rejectUser,
    suspendAccount,
    deleteAccount,
    // API Functions
    fetchSuperAdminStats,
    fetchRecentUsers,
    // Website Information and Tuition Taxonomy
    websiteInfo,
    tuitionTaxonomy,
    updateWebsiteInfo,
    updateTuitionTaxonomy,
    // Logs & Security
    logs,
    // Finance Oversight
    financeOverview,
    // Content Management
    contentItems,
    publishContent,
    archiveContent,
    deleteContent,
    updateSEO,
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

// Make sure to export the hook
export default useSuperAdminDashboard;