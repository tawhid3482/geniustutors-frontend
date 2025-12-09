'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  BarChart2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Calendar, 
  Eye, 
  Trash, 
  Edit, 
  RefreshCw,
  TrendingUp,
  PieChart
} from "lucide-react";
import { RevenueChart } from "./RevenueChart";
import { useRole } from '@/contexts/RoleContext';
import { 
  useDeleteTransactionMutation, 
  useGetAllTransactionQuery, 
  useUpdateTransactionMutation,
} from '@/redux/features/transaction/transactionApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// Interface for transformed transaction data for UI
interface Transaction {
  id: string;
  studentName: string | null;
  tutorName: string | null;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  date: string;
  transactionId: string;
  type: 'payment' | 'payout' | 'refunded';
  originalData?: any;
}

// Interface for analytics data
interface AnalyticsData {
  totalRevenue: string;
  monthlyRevenue: string;
  processingFees: string;
  pendingPayouts: string;
  transactionCount: number;
  successRate: string;
}

// Interface for chart data
interface ChartData {
  name: string;
  value: number;
  revenue?: number;
  count?: number;
}

// Helper function to transform backend data to UI format
const transformTransactionData = (apiData: any): Transaction => {
  return {
    id: apiData.id,
    studentName: apiData.student || null,
    tutorName: apiData.tutor || null,
    amount: apiData.Amount,
    status: apiData.Status.toLowerCase() as 'completed' | 'pending' | 'failed' | 'refunded',
    paymentMethod: apiData.method || apiData.paymentMethod || 'N/A',
    date: new Date(apiData.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    transactionId: apiData.transactionId,
    type: apiData.type as 'payment' | 'payout' | 'refunded',
    originalData: apiData
  };
};

// Helper function to calculate analytics
const calculateAnalytics = (transactions: Transaction[]): AnalyticsData => {
  const totalRevenue = transactions
    .filter(t => t.status === 'completed' && t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = transactions
    .filter(t => {
      if (t.status !== 'completed' || t.type !== 'payment') return false;
      const transactionDate = new Date(t.originalData?.createdAt || '');
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayouts = transactions
    .filter(t => t.type === 'payout' && t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const completedCount = transactions.filter(t => t.status === 'completed').length;
  const successRate = transactions.length > 0 
    ? `${Math.round((completedCount / transactions.length) * 100)}%`
    : '0%';

  return {
    totalRevenue: `৳${totalRevenue.toLocaleString()}`,
    monthlyRevenue: `৳${monthlyRevenue.toLocaleString()}`,
    processingFees: '৳0',
    pendingPayouts: `৳${pendingPayouts.toLocaleString()}`,
    transactionCount: transactions.length,
    successRate
  };
};

// Helper function to prepare chart data
const prepareChartData = (transactions: Transaction[]) => {
  // Monthly revenue data for line chart
  const monthlyData: ChartData[] = [];
  const monthlyMap = new Map<string, number>();
  
  transactions
    .filter(t => t.status === 'completed' && t.type === 'payment')
    .forEach(t => {
      const date = new Date(t.originalData?.createdAt || '');
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const current = monthlyMap.get(monthYear) || 0;
      monthlyMap.set(monthYear, current + t.amount);
    });
  
  monthlyMap.forEach((value, key) => {
    monthlyData.push({
      name: key, revenue: value,
      value: 0
    });
  });
  
  // Sort by date
  monthlyData.sort((a, b) => {
    const dateA = new Date(`01 ${a.name}`);
    const dateB = new Date(`01 ${b.name}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Status distribution for pie chart
  const statusCounts = {
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0
  };
  
  transactions.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const statusData: ChartData[] = [
    { name: 'Completed', value: statusCounts.completed },
    { name: 'Pending', value: statusCounts.pending },
    { name: 'Failed', value: statusCounts.failed },
    { name: 'Refunded', value: statusCounts.refunded }
  ].filter(item => item.value > 0);

  // Payment method distribution for bar chart
  const methodMap = new Map<string, number>();
  transactions.forEach(t => {
    const current = methodMap.get(t.paymentMethod) || 0;
    methodMap.set(t.paymentMethod, current + 1);
  });

  const methodData: any[] = Array.from(methodMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count || 0) - (a.count || 0));

  return { monthlyData, statusData, methodData };
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  'Completed': '#10b981',
  'Pending': '#f59e0b',
  'Failed': '#ef4444',
  'Refunded': '#3b82f6'
};

export function PaymentManagementSection() {
  const { toast } = useToast();
  const { canDelete } = useRole();

  // RTK Query hooks
  const { 
    data: transactionResponse, 
    isLoading: isTransactionsLoading, 
    isError: isTransactionsError,
    refetch: refetchTransactions 
  } = useGetAllTransactionQuery(undefined);
  
  const [updateTransaction, { isLoading: isUpdating }] = useUpdateTransactionMutation();
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation();
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [newStatus, setNewStatus] = useState<'completed' | 'pending' | 'failed' | 'refunded'>('pending');
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // State for analytics and charts
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: '৳0',
    monthlyRevenue: '৳0',
    processingFees: '৳0',
    pendingPayouts: '৳0',
    transactionCount: 0,
    successRate: '0%'
  });
  
  const [chartData, setChartData] = useState<{
    monthlyData: ChartData[];
    statusData: ChartData[];
    methodData: ChartData[];
  }>({
    monthlyData: [],
    statusData: [],
    methodData: []
  });

  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  
  // Process transaction data from RTK Query
  useEffect(() => {
    if (transactionResponse?.data) {
      const transformedTransactions = transactionResponse.data.map(transformTransactionData);
      setTransactions(transformedTransactions);
      setFilteredTransactions(transformedTransactions);
      
      // Calculate analytics
      const analyticsData = calculateAnalytics(transformedTransactions);
      setAnalytics(analyticsData);
      
      // Prepare chart data
      const charts = prepareChartData(transformedTransactions);
      setChartData(charts);
    }
  }, [transactionResponse]);
  
  // Apply filters when filter state or transactions change
  useEffect(() => {
    let result = transactions;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        (transaction.studentName?.toLowerCase().includes(query) || false) ||
        (transaction.tutorName?.toLowerCase().includes(query) || false) ||
        transaction.transactionId.toLowerCase().includes(query) ||
        transaction.paymentMethod.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(transaction => transaction.status === statusFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(transaction => transaction.type === typeFilter);
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      
      result = result.filter(transaction => {
        const transactionDate = new Date(transaction.originalData?.createdAt || '');
        switch (dateFilter) {
          case 'today':
            return transactionDate >= today;
          case 'week':
            return transactionDate >= weekAgo;
          case 'month':
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }
    
    setFilteredTransactions(result);
  }, [searchQuery, statusFilter, typeFilter, dateFilter, transactions]);

  // Handle refreshing analytics data
  const handleRefreshAnalytics = async () => {
    try {
      setIsRefreshingAnalytics(true);
      await refetchTransactions();
      
      toast({
        title: "Analytics Updated",
        description: "Analytics data has been refreshed.",
      });
    } catch (error: any) {
      console.error('Error refreshing analytics:', error);
      toast({
        title: "Error",
        description: "Failed to refresh analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingAnalytics(false);
    }
  };

  // Handle refreshing transaction data
  const handleRefreshTransactions = async () => {
    try {
      await refetchTransactions();
      
      toast({
        title: "Transactions Updated",
        description: "Transaction data has been refreshed.",
      });
    } catch (error: any) {
      console.error('Error refreshing transactions:', error);
      toast({
        title: "Error",
        description: "Failed to refresh transaction data.",
        variant: "destructive"
      });
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await deleteTransaction(transactionToDelete.id).unwrap();
      
      // Filter out the deleted transaction
      const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id);
      const updatedFilteredTransactions = filteredTransactions.filter(t => t.id !== transactionToDelete.id);
      
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedFilteredTransactions);
      
      // Recalculate analytics and charts
      const analyticsData = calculateAnalytics(updatedTransactions);
      setAnalytics(analyticsData);
      const charts = prepareChartData(updatedTransactions);
      setChartData(charts);
      
      toast({
        title: "Transaction Deleted",
        description: `Transaction ${transactionToDelete.transactionId} has been deleted.`,
      });
      
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction.",
        variant: "destructive"
      });
    }
  };

  // Handle delete button click
  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // Handle edit status button click
  const handleEditStatusClick = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setNewStatus(transaction.status);
    setShowEditStatusModal(true);
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!transactionToEdit || !newStatus) return;

    try {
      await updateTransaction({
        id: transactionToEdit.id,
        data: { Status: newStatus }
      }).unwrap();
      
      // Update local state
      const updatedTransactions = transactions.map(t => 
        t.id === transactionToEdit.id ? { ...t, status: newStatus } : t
      );
      const updatedFilteredTransactions = filteredTransactions.map(t => 
        t.id === transactionToEdit.id ? { ...t, status: newStatus } : t
      );
      
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedFilteredTransactions);
      
      // Recalculate analytics and charts
      const analyticsData = calculateAnalytics(updatedTransactions);
      setAnalytics(analyticsData);
      const charts = prepareChartData(updatedTransactions);
      setChartData(charts);
      
      toast({
        title: "Status Updated",
        description: `Transaction status updated to ${newStatus}.`,
      });
      
      setShowEditStatusModal(false);
      setTransactionToEdit(null);
      setNewStatus('pending');
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Error",
        description: "Failed to update transaction status.",
        variant: "destructive"
      });
    }
  };
  
  // Render status badge for transactions
  const renderTransactionStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refunded</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  // Render type badge for transactions
  const renderTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Payment</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refund</Badge>;
      case 'payout':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Payout</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: pld.color }}>
              {pld.name}: {pld.name === 'revenue' ? `৳${pld.value.toLocaleString()}` : pld.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 w-full overflow-y-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-teal-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Payment Management</h2>
            <p className="text-white/90 mt-1">Manage transactions and financial analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white">
              {transactions.length} Transactions
            </Badge>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Payment Analytics</h3>
              <p className="text-sm text-muted-foreground">Real-time data from database</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshAnalytics}
                disabled={isRefreshingAnalytics || isTransactionsLoading}
              >
                {isRefreshingAnalytics ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isRefreshingAnalytics || isTransactionsLoading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading || isRefreshingAnalytics ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{analytics.totalRevenue}</div>
                    <p className="text-sm text-muted-foreground">Lifetime platform revenue</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-blue-600" />
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading || isRefreshingAnalytics ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{analytics.monthlyRevenue}</div>
                    <p className="text-sm text-muted-foreground">Current month earnings</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-purple-600" />
                  Pending Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading || isRefreshingAnalytics ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{analytics.pendingPayouts}</div>
                    <p className="text-sm text-muted-foreground">Awaiting disbursement to tutors</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                  Success Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading || isRefreshingAnalytics ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{analytics.successRate}</div>
                    <p className="text-sm text-muted-foreground">Transaction completion rate</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading || isRefreshingAnalytics ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{analytics.transactionCount}</div>
                    <p className="text-sm text-muted-foreground">Total processed transactions</p>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ArrowDownRight className="h-5 w-5 text-red-600" />
                  Processing Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading || isRefreshingAnalytics ? (
                  <div className="flex items-center justify-center h-16">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">{analytics.processingFees}</div>
                    <p className="text-sm text-muted-foreground">Total payment processing costs</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Revenue Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Monthly Revenue Trend
                </CardTitle>
                <CardDescription>Revenue over time from completed payments</CardDescription>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : chartData.monthlyData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No revenue data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        tickFormatter={(value) => `৳${value.toLocaleString()}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Revenue"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-green-600" />
                  Transaction Status Distribution
                </CardTitle>
                <CardDescription>Breakdown of transactions by status</CardDescription>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  </div>
                ) : chartData.statusData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No status data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData.statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                      >
                        {chartData.statusData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Count']}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Bar Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-purple-600" />
                  Payment Methods Distribution
                </CardTitle>
                <CardDescription>Number of transactions by payment method</CardDescription>
              </CardHeader>
              <CardContent>
                {isTransactionsLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : chartData.methodData.length === 0 ? (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <p>No payment method data available</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.methodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Number of Transactions" 
                        fill="#8884d8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="refunded">Refund</SelectItem>
                      <SelectItem value="payout">Payout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transactions Table */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Transactions</CardTitle>
                <p className="text-sm text-muted-foreground">Real-time data from database</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="h-8"
                  onClick={handleRefreshTransactions}
                  disabled={isTransactionsLoading}
                >
                  {isTransactionsLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {isTransactionsLoading ? 'Loading...' : 'Refresh'}
                </Button>
                <Button variant="outline" className="h-8">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
                </div>
              ) : isTransactionsError ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Error loading transactions. Please try again.</p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No transactions found matching your filters.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.transactionId}</TableCell>
                          <TableCell>{transaction.studentName || '-'}</TableCell>
                          <TableCell>{transaction.tutorName || '-'}</TableCell>
                          <TableCell>৳{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell>{renderTransactionTypeBadge(transaction.type)}</TableCell>
                          <TableCell>{renderTransactionStatusBadge(transaction.status)}</TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setShowTransactionModal(true);
                                }}
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditStatusClick(transaction)}
                                title="Edit Status"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                disabled={isUpdating}
                              >
                                {isUpdating ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                ) : (
                                  <Edit className="h-4 w-4" />
                                )}
                              </Button>
                              {canDelete && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(transaction)}
                                  title="Delete Transaction"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                  ) : (
                                    <Trash className="h-4 w-4" />
                                  )}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Transaction Detail Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete information about this transaction
            </DialogDescription>
          </DialogHeader>
          
          {selectedTransaction && selectedTransaction.originalData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Transaction ID</h4>
                  <p className="font-mono">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{selectedTransaction.date}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                  <p className="font-semibold">৳{selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div>{renderTransactionStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <div>{renderTransactionTypeBadge(selectedTransaction.type)}</div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Method</h4>
                  <p>{selectedTransaction.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Payment Number</h4>
                  <p>{selectedTransaction.originalData.PaymentNumber || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Method Type</h4>
                  <p>{selectedTransaction.originalData.paymentMethod || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Parties Involved</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTransaction.studentName && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Student</h5>
                      <p>{selectedTransaction.studentName}</p>
                    </div>
                  )}
                  {selectedTransaction.tutorName && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500">Tutor</h5>
                      <p>{selectedTransaction.tutorName}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">System Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">User ID</h5>
                    <p className="font-mono text-xs">{selectedTransaction.originalData.userId}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Created</h5>
                    <p>{new Date(selectedTransaction.originalData.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Updated</h5>
                    <p>{new Date(selectedTransaction.originalData.updatedAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-medium text-gray-500">Active</h5>
                    <p>{selectedTransaction.originalData.is_Active ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTransactionModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash className="h-5 w-5" />
              Delete Transaction
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {transactionToDelete && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <span className="ml-2 font-mono">{transactionToDelete.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-semibold">৳{transactionToDelete.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-2">{transactionToDelete.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2">{renderTransactionStatusBadge(transactionToDelete.status)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Tutor:</span>
                    <span className="ml-2">{transactionToDelete.tutorName || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-red-600 mt-0.5">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Warning</h4>
                    <p className="text-sm text-red-700 mt-1">
                      Deleting this transaction will permanently remove it from the system. 
                      This action will be logged and cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setTransactionToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTransaction}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Transaction
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Status Modal */}
      <Dialog open={showEditStatusModal} onOpenChange={setShowEditStatusModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-blue-600">
              <Edit className="h-5 w-5" />
              Edit Transaction Status
            </DialogTitle>
            <DialogDescription>
              Update the status of this transaction. This action will be logged.
            </DialogDescription>
          </DialogHeader>
          
          {transactionToEdit && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Transaction Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <span className="ml-2 font-mono">{transactionToEdit.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-semibold">৳{transactionToEdit.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Method:</span>
                    <span className="ml-2">{transactionToEdit.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Current Status:</span>
                    <span className="ml-2">{renderTransactionStatusBadge(transactionToEdit.status)}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Tutor:</span>
                    <span className="ml-2">{transactionToEdit.tutorName || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="statusSelect">New Status</Label>
                <Select 
                  value={newStatus} 
                  onValueChange={(value: 'completed' | 'pending' | 'failed' | 'refunded') => setNewStatus(value)}
                >
                  <SelectTrigger id="statusSelect">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newStatus && newStatus !== transactionToEdit.status && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="text-blue-600 mt-0.5">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">Status Change</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Status will be changed from <span className="font-medium">{transactionToEdit.status}</span> to <span className="font-medium">{newStatus}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowEditStatusModal(false);
                setTransactionToEdit(null);
                setNewStatus('pending');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || newStatus === transactionToEdit?.status || isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}