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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { MoreHorizontal, Search, Filter, Download, Plus, CreditCard, DollarSign, BarChart2, ArrowUpRight, ArrowDownRight, Wallet, Calendar, CheckCircle, XCircle, Eye, Trash, Edit } from "lucide-react";
import { platformPaymentMethodService, PlatformPaymentMethod } from "@/services/platformPaymentMethodService";
import { analyticsService, PaymentAnalytics } from "@/services/analyticsService";
import { transactionService, Transaction as ApiTransaction } from "@/services/transactionService";
import { RevenueChart } from "./RevenueChart";
import { useRole } from '@/contexts/RoleContext';

// Use the imported interface from the service
type PaymentMethod = PlatformPaymentMethod;

// Use the imported interface from the service
type Transaction = ApiTransaction;

// Use the imported interface from the service

// Mock data for initial display - moved outside component to prevent recreation on every render
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    name: 'Bkash',
    type: 'mobile_banking',
    status: 'active',
    payment_number: '01712345678',
    created_at: '2023-05-15T00:00:00Z',
    updated_at: '2023-05-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Nagad',
    type: 'mobile_banking',
    status: 'active',
    payment_number: '01812345678',
    created_at: '2023-06-20T00:00:00Z',
    updated_at: '2023-06-20T00:00:00Z'
  },
  {
    id: '3',
    name: 'Rocket',
    type: 'mobile_banking',
    status: 'inactive',
    payment_number: '01912345678',
    created_at: '2023-03-25T00:00:00Z',
    updated_at: '2023-03-25T00:00:00Z'
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    studentName: 'Rafiul Islam',
    tutorName: 'Ahmed Khan',
    amount: '৳2,500',
    status: 'completed',
    paymentMethod: 'bKash',
    date: '2023-08-15',
    transactionId: 'TRX123456789',
    type: 'payment'
  },
  {
    id: '2',
    studentName: 'Sadia Rahman',
    tutorName: 'Farhan Ali',
    amount: '৳1,800',
    status: 'pending',
    paymentMethod: 'Nagad',
    date: '2023-08-14',
    transactionId: 'TRX987654321',
    type: 'payment'
  },
  {
    id: '3',
    studentName: 'Karim Ahmed',
    tutorName: 'Nusrat Jahan',
    amount: '৳3,200',
    status: 'failed',
    paymentMethod: 'Visa/Mastercard',
    date: '2023-08-13',
    transactionId: 'TRX456789123',
    type: 'payment'
  },
  {
    id: '4',
    studentName: 'Tahmina Akter',
    tutorName: 'Zubair Hossain',
    amount: '৳1,500',
    status: 'cancelled',
    paymentMethod: 'bKash',
    date: '2023-08-12',
    transactionId: 'TRX789123456',
    type: 'refund'
  },
  {
    id: '5',
    studentName: '',
    tutorName: 'Sabina Yasmin',
    amount: '৳4,500',
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    date: '2023-08-11',
    transactionId: 'TRX321654987',
    type: 'payout'
  },
];

const mockAnalytics: PaymentAnalytics = {
  totalRevenue: '৳125,000',
  monthlyRevenue: '৳28,500',
  processingFees: '৳3,200',
  pendingPayouts: '৳15,800',
  transactionCount: 87,
  successRate: '94.2%'
};

export function PaymentManagementSection() {
  const { toast } = useToast();
  const { canDelete } = useRole();
  
  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState<Partial<PaymentMethod>>({
    type: 'mobile_banking',
    status: 'active',
    payment_number: ''
  });
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled' | ''>('');
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // State for analytics
  const [analytics, setAnalytics] = useState<PaymentAnalytics>({
    totalRevenue: '৳0',
    monthlyRevenue: '৳0',
    processingFees: '৳0',
    pendingPayouts: '৳0',
    transactionCount: 0,
    successRate: '0%'
  });
  
  // State for loading
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingAnalytics, setIsRefreshingAnalytics] = useState(false);
  const [isRefreshingTransactions, setIsRefreshingTransactions] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch payment methods from API
        const paymentMethodsData = await platformPaymentMethodService.getPaymentMethods();
        setPaymentMethods(paymentMethodsData);
        
        // Fetch real analytics data from API
        const analyticsData = await analyticsService.getPaymentAnalytics();
        setAnalytics(analyticsData);
        
        // Fetch real transaction data from API
        const transactionData = await transactionService.getTransactions({ limit: 50 });
        setTransactions(transactionData.transactions);
        setFilteredTransactions(transactionData.transactions);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load data. Using mock data.",
          variant: "destructive"
        });
        // Fallback to mock data
        setPaymentMethods(mockPaymentMethods);
        setTransactions(mockTransactions);
        setFilteredTransactions(mockTransactions);
        setAnalytics(mockAnalytics);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);
  
  // Apply filters when filter state changes
  useEffect(() => {
    let result = transactions;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        (transaction.studentName?.toLowerCase().includes(query) || false) ||
        transaction.tutorName.toLowerCase().includes(query) ||
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
    
    // Apply date filter (simplified for mock data)
    if (dateFilter === 'today') {
      result = result.filter(transaction => transaction.date === '2023-08-15');
    } else if (dateFilter === 'week') {
      result = result.filter(transaction => ['2023-08-15', '2023-08-14', '2023-08-13', '2023-08-12', '2023-08-11', '2023-08-10', '2023-08-09'].includes(transaction.date));
    } else if (dateFilter === 'month') {
      // All transactions in our mock data are from August 2023
      result = result;
    }
    
    setFilteredTransactions(result);
  }, [searchQuery, statusFilter, typeFilter, dateFilter, transactions]);
  
  // Handle adding a new payment method
  const handleAddPaymentMethod = async () => {
    console.log('Adding payment method:', newPaymentMethod);
    
    if (!newPaymentMethod.name) {
      toast({
        title: "Missing Information",
        description: "Please select a payment method.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newPaymentMethod.payment_number) {
      toast({
        title: "Missing Information",
        description: "Please enter a payment number.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Call the API to add payment method
      const newMethod = await platformPaymentMethodService.addPaymentMethod({
        name: newPaymentMethod.name as 'Bkash' | 'Nagad' | 'Rocket',
        payment_number: newPaymentMethod.payment_number,
        status: newPaymentMethod.status as 'active' | 'inactive'
      });
      
      // Update local state
      setPaymentMethods(prev => [...prev, newMethod]);
      setShowAddMethodModal(false);
      setNewPaymentMethod({
        type: 'mobile_banking',
        status: 'active',
        payment_number: ''
      });
      
      toast({
        title: "Payment Method Added",
        description: `${newMethod.name} has been added as a payment method.`,
      });
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method.",
        variant: "destructive"
      });
    }
  };
  
  // Handle toggling payment method status
  const handleToggleMethodStatus = async (id: string) => {
    try {
      const result = await platformPaymentMethodService.togglePaymentMethodStatus(id);
      
      // Update local state
      setPaymentMethods(prev => prev.map(method => 
        method.id === id ? { ...method, status: result.status } : method
      ));
      
      const method = paymentMethods.find(m => m.id === id);
      
      toast({
        title: `Payment Method ${result.status === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `${method?.name} is now ${result.status}.`,
      });
    } catch (error: any) {
      console.error('Error toggling payment method status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to toggle payment method status.",
        variant: "destructive"
      });
    }
  };
  
  // Handle deleting a payment method
  const handleDeletePaymentMethod = async (id: string) => {
    console.log('Deleting payment method with id:', id);
    console.log('Current payment methods:', paymentMethods);
    
    try {
      await platformPaymentMethodService.deletePaymentMethod(id);
      
      // Update local state
      setPaymentMethods(prev => prev.filter(method => method.id !== id));
      
      toast({
        title: "Payment Method Deleted",
        description: "The payment method has been removed from the system.",
      });
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment method.",
        variant: "destructive"
      });
    }
  };

  // Handle refreshing analytics data
  const handleRefreshAnalytics = async () => {
    try {
      setIsRefreshingAnalytics(true);
      const analyticsData = await analyticsService.getPaymentAnalytics();
      setAnalytics(analyticsData);
      
      toast({
        title: "Analytics Updated",
        description: "Analytics data has been refreshed with the latest information.",
      });
    } catch (error: any) {
      console.error('Error refreshing analytics:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh analytics data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingAnalytics(false);
    }
  };

  // Handle refreshing transaction data
  const handleRefreshTransactions = async () => {
    try {
      setIsRefreshingTransactions(true);
      const transactionData = await transactionService.getTransactions({ 
        limit: 50,
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        dateFilter: dateFilter
      });
      setTransactions(transactionData.transactions);
      setFilteredTransactions(transactionData.transactions);
      
      toast({
        title: "Transactions Updated",
        description: "Transaction data has been refreshed with the latest information.",
      });
    } catch (error: any) {
      console.error('Error refreshing transactions:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh transaction data.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshingTransactions(false);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async () => {
    if (!transactionToDelete) return;

    try {
      await transactionService.deleteTransaction(transactionToDelete.id);
      
      // Remove transaction from local state
      const updatedTransactions = transactions.filter(t => t.id !== transactionToDelete.id);
      const updatedFilteredTransactions = filteredTransactions.filter(t => t.id !== transactionToDelete.id);
      
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedFilteredTransactions);
      
      toast({
        title: "Transaction Deleted",
        description: `Transaction ${transactionToDelete.transactionId} has been deleted successfully.`,
      });
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete transaction.",
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

  // Handle status change
  const handleStatusChange = (value: string) => {
    setNewStatus(value as 'pending' | 'completed' | 'failed' | 'cancelled');
  };

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!transactionToEdit || !newStatus) return;

    try {
      const updatedTransaction = await transactionService.updateTransactionStatus(
        transactionToEdit.id, 
        newStatus as 'pending' | 'completed' | 'failed' | 'cancelled'
      );
      
      // Update local state
      const updatedTransactions = transactions.map(t => 
        t.id === transactionToEdit.id ? { ...t, status: newStatus } : t
      );
      const updatedFilteredTransactions = filteredTransactions.map(t => 
        t.id === transactionToEdit.id ? { ...t, status: newStatus } : t
      );
      
      setTransactions(updatedTransactions);
      setFilteredTransactions(updatedFilteredTransactions);
      
      toast({
        title: "Status Updated",
        description: `Transaction ${transactionToEdit.transactionId} status has been updated to ${newStatus}.`,
      });
      
      // Close modal and reset state
      setShowEditStatusModal(false);
      setTransactionToEdit(null);
      setNewStatus('');
    } catch (error: any) {
      console.error('Error updating transaction status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update transaction status.",
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
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  // Render type badge for transactions
  const renderTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Payment</Badge>;
      case 'refund':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Refund</Badge>;
      case 'payout':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">Payout</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  // Render status badge for payment methods
  const renderMethodStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };
  
  return (
    <div className="space-y-6 w-full overflow-y-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-teal-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Payment Management</h2>
            <p className="text-white/90 mt-1">Manage payment methods, transactions, and financial analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white">
              {transactions.length} Transactions
            </Badge>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
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
                disabled={isRefreshingAnalytics}
              >
                {isRefreshingAnalytics ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isRefreshingAnalytics ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
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
                {isRefreshingAnalytics ? (
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
                {isRefreshingAnalytics ? (
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
                {isRefreshingAnalytics ? (
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
                {isRefreshingAnalytics ? (
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
                {isRefreshingAnalytics ? (
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
                {isRefreshingAnalytics ? (
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
          
          <RevenueChart />
        </TabsContent>
        
        {/* Payment Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Available Payment Methods</h3>
            <Dialog open={showAddMethodModal} onOpenChange={setShowAddMethodModal}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>
                    Add a new payment method to the platform
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="methodName">Payment Method</Label>
                    <Select 
                      value={newPaymentMethod.name} 
                      onValueChange={(value) => setNewPaymentMethod({...newPaymentMethod, name: value as 'Bkash' | 'Nagad' | 'Rocket'})}
                    >
                      <SelectTrigger id="methodName">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bkash">Bkash</SelectItem>
                        <SelectItem value="Nagad">Nagad</SelectItem>
                        <SelectItem value="Rocket">Rocket</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="hidden">
                    <Label htmlFor="methodType">Method Type</Label>
                    <Input
                      id="methodType"
                      value="mobile_banking"
                      readOnly
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="paymentNumber">Payment Number</Label>
                    <Input
                      id="paymentNumber"
                      type="tel"
                      placeholder="e.g., 01712345678"
                      value={newPaymentMethod.payment_number || ''}
                      onChange={(e) => setNewPaymentMethod({...newPaymentMethod, payment_number: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="methodStatus">Initial Status</Label>
                    <Select 
                      value={newPaymentMethod.status} 
                      onValueChange={(value) => setNewPaymentMethod({...newPaymentMethod, status: value as any})}
                    >
                      <SelectTrigger id="methodStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddMethodModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddPaymentMethod} className="bg-green-600 hover:bg-green-700">
                    Add Method
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Payment Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>
                        Mobile Banking
                      </TableCell>
                      <TableCell>{method.payment_number}</TableCell>
                      <TableCell>{renderMethodStatusBadge(method.status)}</TableCell>
                      <TableCell>{new Date(method.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleMethodStatus(method.id)}>
                              {method.status === 'active' ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            {canDelete && (
                              <DropdownMenuItem 
                                onClick={() => handleDeletePaymentMethod(method.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
                      <SelectItem value="refund">Refund</SelectItem>
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
                  disabled={isRefreshingTransactions}
                >
                  {isRefreshingTransactions ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isRefreshingTransactions ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Button variant="outline" className="h-8">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
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
                          <TableCell>{transaction.tutorName}</TableCell>
                          <TableCell>{transaction.amount}</TableCell>
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
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {canDelete && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleDeleteClick(transaction)}
                                  title="Delete Transaction"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="h-4 w-4" />
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
          
          {selectedTransaction && (
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
                  <p className="font-semibold">{selectedTransaction.amount}</p>
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
                    <span className="ml-2 font-semibold">{transactionToDelete.amount}</span>
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
                    <span className="ml-2">{transactionToDelete.tutorName}</span>
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
            >
              <Trash className="mr-2 h-4 w-4" />
              Delete Transaction
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
                    <span className="ml-2 font-semibold">{transactionToEdit.amount}</span>
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
                    <span className="ml-2">{transactionToEdit.tutorName}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="statusSelect">New Status</Label>
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger id="statusSelect">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
                setNewStatus('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={!newStatus || newStatus === transactionToEdit?.status}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="mr-2 h-4 w-4" />
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}