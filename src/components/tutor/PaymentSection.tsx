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
  AlertCircle,
  Clock,
  FileText,
  Shield,
  Percent,
  Info,
  CheckSquare
} from "lucide-react";
import { useGetAllPaymentByRoleQuery } from '@/redux/features/payment/paymentApi';

// Type definitions
interface Transaction {
  id: string;
  transactionId: string;
  Amount: number;
  type: 'payment' | 'refunded' | 'payout';
  Status: 'success' | 'pending' | 'failed' | 'cancelled';
  method: string;
  paymentMethod: string;
  student: string;
  tutor: string;
  PaymentNumber: string;
  userId: string;
  is_Active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormattedTransaction {
  id: string;
  type: 'payment' | 'refunded' | 'payout';
  amount: number;
  description: string;
  payment_method: string;
  status: 'success' | 'pending' | 'failed' | 'cancelled';
  created_at: string;
  reference_id: string;
  student?: string;
  tutor?: string;
  payment_number?: string;
}

interface PaymentStats {
  totalCost: number;
  thisMonth: number;
  pending: number;
  totalPaid: number;
  totalRefunded: number;
  totalPayout: number;
}

interface RefundPolicy {
  title: string;
  description: string;
  conditions: string[];
  processing_time: string;
}

interface PaymentApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: Transaction[];
}

type TransactionType = 'payment' | 'refunded' | 'payout';
type TransactionStatus = 'success' | 'pending' | 'failed' | 'cancelled';

export function PaymentSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user.id;
  const { data: paymentData, refetch } = useGetAllPaymentByRoleQuery(userId) as {
    data: PaymentApiResponse;
    refetch: () => void;
  };

  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);

  // Calculate statistics from transaction data
  const calculateStats = (): PaymentStats => {
    if (!transactions.length) {
      return {
        totalCost: 0,
        thisMonth: 0,
        pending: 0,
        totalPaid: 0,
        totalRefunded: 0,
        totalPayout: 0
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const stats = transactions.reduce((acc: PaymentStats, transaction: FormattedTransaction) => {
      const transDate = new Date(transaction.created_at);
      const isCurrentMonth = transDate.getMonth() === currentMonth && 
                            transDate.getFullYear() === currentYear;

      switch (transaction.type) {
        case 'payment':
          if (transaction.status === 'success') {
            acc.totalPaid += transaction.amount;
          } else if (transaction.status === 'pending') {
            acc.pending += transaction.amount;
          }
          
          if (isCurrentMonth) {
            acc.thisMonth += transaction.amount;
          }
          break;
          
        case 'refunded':
          if (transaction.status === 'success') {
            acc.totalRefunded += transaction.amount;
          }
          break;
          
        case 'payout':
          if (transaction.status === 'success') {
            acc.totalPayout += transaction.amount;
          }
          break;
      }

      // Total cost includes all successful payments
      if (transaction.type === 'payment' && transaction.status === 'success') {
        acc.totalCost += transaction.amount;
      }

      return acc;
    }, {
      totalCost: 0,
      thisMonth: 0,
      pending: 0,
      totalPaid: 0,
      totalRefunded: 0,
      totalPayout: 0
    });

    return stats;
  };

  const stats: PaymentStats = calculateStats();

  // Refund policy data
  const refundPolicy: RefundPolicy = {
    title: "Refund & Platform Charge Policy",
    description: "Our policies for platform charges and refunds",
    conditions: [
      "Refunds are only applicable for cancellations within one month",
      "25% platform fee applies for refunds within one month",
      "Original 55% platform fee applies during initial transaction",
      "Refunds are processed within 7-14 business days",
      "Bank transfer fees may apply for refund processing"
    ],
    processing_time: "Refunds are typically processed within 7-14 business days from the date of cancellation approval."
  };

  // Filtered transactions
  const filteredTransactions: FormattedTransaction[] = transactions.filter(transaction => {
    const matchesSearch = searchQuery === '' || 
      transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.reference_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const fetchPaymentData = () => {
    refetch();
    toast({
      title: "Refreshing data",
      description: "Fetching latest payment information...",
    });
  };

  const formatCurrency = (amount: number): string => {
    return `৳${amount?.toLocaleString() || '0'}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: TransactionType) => {
    switch (type) {
      case 'refunded':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      case 'payout':
        return <Wallet className="h-4 w-4 text-purple-600" />;
      case 'payment':
        return <CreditCard className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTypeText = (type: TransactionType): string => {
    switch (type) {
      case 'payment': return 'Payment';
      case 'refunded': return 'Refund';
      case 'payout': return 'Payout';
      default: return type;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    const methodLower = method?.toLowerCase();
    switch (methodLower) {
      case 'bank': return <CreditCard className="h-4 w-4" />;
      case 'bkash':
      case 'nogod':
      case 'mobile banking': return <Wallet className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  useEffect(() => {
    // Load initial data
    if (paymentData?.data) {
      const formattedTransactions: FormattedTransaction[] = paymentData.data.map((item: Transaction) => ({
        id: item.id,
        type: item.type,
        amount: item.Amount,
        description: `${getTypeText(item.type)} - ${item.transactionId}`,
        payment_method: item.method || item.paymentMethod,
        status: item.Status,
        created_at: item.createdAt,
        reference_id: item.transactionId,
        student: item.student,
        tutor: item.tutor,
        payment_number: item.PaymentNumber
      }));
      setTransactions(formattedTransactions);
    }
  }, [paymentData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-8 w-8" />
          Payment Section
        </h2>
        <p className="text-muted-foreground text-lg">
        Once a tuition job is confirmed successfully, tutors must pay a one-time platform fee for each job. <br /> The charge is 55% for both Home Tutoring and Online Tutoring.
        </p>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Platform Cost</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalCost)}</p>
              </div>
              <Percent className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.thisMonth)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pending)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.totalRefunded)}</p>
              </div>
              <Download className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payout</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalPayout)}</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-600" />
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
          <TabsTrigger value="platform-charge" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Platform Charge
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
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="payment">Payments</SelectItem>
                    <SelectItem value="refunded">Refunds</SelectItem>
                    <SelectItem value="payout">Payouts</SelectItem>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(transaction.type)}
                              <span className="font-medium">{getTypeText(transaction.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <span className={
                              transaction.type === 'refunded' ? 'text-blue-600' :
                              transaction.type === 'payout' ? 'text-purple-600' : 'text-red-600'
                            }>
                              {formatCurrency(transaction.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p>{transaction.description}</p>
                              {transaction.tutor && (
                                <p className="text-xs text-muted-foreground">Tutor: {transaction.tutor}</p>
                              )}
                              {transaction.student && (
                                <p className="text-xs text-muted-foreground">Student: {transaction.student}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(transaction.payment_method)}
                              <div>
                                <p>{transaction.payment_method}</p>
                                {transaction.payment_number && (
                                  <p className="text-xs text-muted-foreground">{transaction.payment_number}</p>
                                )}
                              </div>
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
                </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {refundPolicy.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Refund Policy Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-5 w-5 text-gray-600" />
                  <h4 className="font-bold text-gray-900">Refund Policy</h4>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  In case the tuition job is cancelled within one month due to any reason, 25% of the payable salary for the conducted classes will be charged as a platform fee, and the remaining amount will be refunded accordingly.
                </p>
                
                <h4 className="font-medium mb-2 text-gray-800">Refund Conditions:</h4>
                <ul className="space-y-2">
                  {refundPolicy.conditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Example Calculation */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Refund Calculation Example</span>
                </div>
                <p className="text-green-800 text-sm">
                  For a transaction of 1500 BDT refunded within one month:
                  <br />
                  <strong>Platform Fee (25%):</strong> 375 BDT
                  <br />
                  <strong>Refund Amount:</strong> 1125 BDT
                </p>
                <p className="text-green-800 text-sm mt-2 text-xs">
                  Note: The 55% platform fee applies during initial transaction, while 25% applies for refunds within one month of cancellation.
                </p>
              </div>

              {/* Processing Time */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Processing Time</span>
                </div>
                <p className="text-blue-800">{refundPolicy.processing_time}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform-charge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                Platform Charge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Platform Charge Section */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <Percent className="h-5 w-5 text-blue-600" />
                  <h4 className="font-bold text-blue-900">Platform Charge</h4>
                </div>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Once a tuition job is confirmed successfully, tutors must pay a one-time platform fee for each job. The charge is 55% for both Home Tutoring and Online Tutoring.
                </p>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="font-medium mb-3 text-gray-800">Key Points:</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">One-time fee per confirmed tuition job</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">55% fee applies to both Home and Online Tutoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Fee is calculated based on the total job value</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Fee is charged only once per job confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">No additional platform fees for extended job durations</span>
                  </li>
                </ul>
              </div>

              {/* Example Calculation */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Platform Charge Example</span>
                </div>
                <p className="text-green-800 text-sm">
                  For a tuition job valued at 10,000 BDT:
                  <br />
                  <strong>Platform Fee (55%):</strong> 5,500 BDT
                  <br />
                  <strong>Tutor Receives:</strong> 4,500 BDT
                </p>
                <p className="text-green-800 text-sm mt-2 text-xs">
                  Note: This is a one-time fee charged when the job is confirmed. No additional platform fees for the duration of the job.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}