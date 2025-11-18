'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext.next";
import { api } from "@/config/api";
import { refundPolicyService, RefundPolicy } from '@/services/refundPolicyService';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Wallet, 
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Shield
} from "lucide-react";

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  reference_id: string;
  created_at: string;
  updated_at: string;
}


interface PaymentStats {
  balance: number;
  monthlyEarnings: number;
  totalWithdrawn: number;
  pendingAmount: number;
  totalTransactions: number;
}

// RefundPolicy interface is now imported from the service

export function PaymentSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    balance: 0,
    monthlyEarnings: 0,
    totalWithdrawn: 0,
    pendingAmount: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [refundPolicy, setRefundPolicy] = useState<RefundPolicy | null>(null);

  // Fetch payment data
  const fetchPaymentData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch wallet data (includes transactions and payment methods)
      const walletResponse = await api.get(`/tutor-dashboard/wallet`);
      const walletData = walletResponse.data.data;

      if (walletData) {
        setTransactions(walletData.transactions || []);
        setStats({
          balance: walletData.balance || 0,
          monthlyEarnings: walletData.monthlyEarnings || 0,
          totalWithdrawn: walletData.totalWithdrawn || 0,
          pendingAmount: walletData.transactions?.filter((t: Transaction) => t.status === 'pending' && t.type === 'credit').reduce((sum: number, t: Transaction) => sum + t.amount, 0) || 0,
          totalTransactions: walletData.transactions?.length || 0
        });
      } else {
        setTransactions([]);
        setStats({
          balance: 0,
          monthlyEarnings: 0,
          totalWithdrawn: 0,
          pendingAmount: 0,
          totalTransactions: 0
        });
      }

      // Fetch refund policy
      try {
        const refundPoliciesResponse = await refundPolicyService.getRefundPolicies();
        const activePolicy = refundPoliciesResponse.data?.find(policy => policy.is_active);
        if (activePolicy) {
          setRefundPolicy(activePolicy);
        }
      } catch (error) {
        console.error('Error fetching refund policy:', error);
        // Don't show error toast for refund policy as it's not critical
      }

    } catch (error) {
      console.error('Error fetching payment data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, [user?.id]);

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         transaction.reference_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });


  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
      failed: { variant: 'destructive' as const, icon: XCircle, text: 'Failed' },
      cancelled: { variant: 'outline' as const, icon: XCircle, text: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'debit':
        return <Wallet className="h-4 w-4 text-red-600" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    // A simple implementation for payment method icons
    return <CreditCard className="h-4 w-4" />;
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Payment Section
        </h2>
        <p className="text-muted-foreground">
          Manage your payments, withdrawals, and payment methods
        </p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.balance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.monthlyEarnings)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalWithdrawn)}</p>
              </div>
              <Download className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="flex items-center gap-2" onClick={fetchPaymentData}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="refund-policy" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Refund Policy
          </TabsTrigger>
          <TabsTrigger value="due-history" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Due History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="credit">Credits</SelectItem>
                    <SelectItem value="debit">Debits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transaction History</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchPaymentData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredTransactions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(transaction.type)}
                            <span className="capitalize">{transaction.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <span className={transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(transaction.payment_method)}
                            {transaction.payment_method}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>{formatDate(transaction.created_at)}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {transaction.reference_id}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your filters to see more results'
                      : 'You haven\'t made any transactions yet'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="refund-policy" className="space-y-4">
          {refundPolicy ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {refundPolicy.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{refundPolicy.description}</p>
                
                <div>
                  <h4 className="font-medium mb-2">Refund Conditions:</h4>
                  <ul className="space-y-2">
                    {refundPolicy.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Processing Time</span>
                  </div>
                  <p className="text-blue-800">{refundPolicy.processing_time}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Refund Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No refund policy available</h3>
                  <p className="text-muted-foreground">
                    Please contact support for refund policy information
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="due-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Due History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No due payments</h3>
                <p className="text-muted-foreground">
                  You don't have any outstanding payments at the moment
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
