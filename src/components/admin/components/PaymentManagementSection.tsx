'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  DollarSign, 
  BarChart2, 
  ArrowUpRight, 
  Wallet, 
  RefreshCw,
  TrendingUp,
  PieChart
} from "lucide-react";
import { useGetAllTransactionQuery } from '@/redux/features/transaction/transactionApi';
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
  status: 'success' | 'pending' | 'rejected' | 'refunded';
  paymentMethod: string;
  date: string;
  transactionId: string;
  type: 'payment' | 'due' | 'refunded';
  originalData?: any;
}

// Interface for analytics data
interface AnalyticsData {
  totalRevenue: string;
  monthlyRevenue: string;
  pendingTransactions: string;
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
    status: apiData.Status.toLowerCase() as 'success' | 'pending' | 'rejected' | 'refunded',
    paymentMethod: apiData.method || apiData.paymentMethod || 'N/A',
    date: new Date(apiData.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    transactionId: apiData.transactionId,
    type: apiData.type as 'payment' | 'due' | 'refunded',
    originalData: apiData
  };
};

// Helper function to calculate analytics
const calculateAnalytics = (transactions: Transaction[]): AnalyticsData => {
  // Total revenue from completed payments
  const totalRevenue = transactions
    .filter(t => t.status === 'success' && t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  // Current month revenue
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = transactions
    .filter(t => {
      if (t.status !== 'success' || t.type !== 'payment') return false;
      const transactionDate = new Date(t.originalData?.createdAt || '');
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  // Pending transactions amount
  const pendingTransactions = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Success rate
  const successCount = transactions.filter(t => t.status === 'success').length;
  const totalCount = transactions.length;
  const successRate = totalCount > 0 
    ? `${Math.round((successCount / totalCount) * 100)}%`
    : '0%';

  return {
    totalRevenue: `৳${totalRevenue.toLocaleString()}`,
    monthlyRevenue: `৳${monthlyRevenue.toLocaleString()}`,
    pendingTransactions: `৳${pendingTransactions.toLocaleString()}`,
    successRate
  };
};

// Helper function to prepare chart data
const prepareChartData = (transactions: Transaction[]) => {
  // Monthly revenue data for line chart
  const monthlyData: ChartData[] = [];
  const monthlyMap = new Map<string, number>();
  
  transactions
    .filter(t => t.status === 'success' && t.type === 'payment')
    .forEach(t => {
      const date = new Date(t.originalData?.createdAt || '');
      // মাসের সংক্ষিপ্ত নাম (3 অক্ষর)
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
      const current = monthlyMap.get(monthYear) || 0;
      monthlyMap.set(monthYear, current + t.amount);
    });
  
  monthlyMap.forEach((value, key) => {
    monthlyData.push({
      name: key, 
      revenue: value,
      value: 0
    });
  });
  
  // Sort by date
  monthlyData.sort((a, b) => {
    const monthNames: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const [monthA, yearA] = a.name.split(' ');
    const [monthB, yearB] = b.name.split(' ');
    
    const dateA = new Date(parseInt(yearA), monthNames[monthA]);
    const dateB = new Date(parseInt(yearB), monthNames[monthB]);
    
    return dateA.getTime() - dateB.getTime();
  });

  // Status distribution for pie chart
  const statusCounts = {
    success: 0,
    pending: 0,
    rejected: 0,
    refunded: 0
  };
  
  transactions.forEach(t => {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  });

  const statusData: ChartData[] = [
    { name: 'Success', value: statusCounts.success },
    { name: 'Pending', value: statusCounts.pending },
    { name: 'Rejected', value: statusCounts.rejected },
    { name: 'Refunded', value: statusCounts.refunded }
  ].filter(item => item.value > 0);

  // Payment method distribution for bar chart
  const methodMap = new Map<string, number>();
  transactions.forEach(t => {
    const method = t.paymentMethod || 'Unknown';
    const current = methodMap.get(method) || 0;
    methodMap.set(method, current + 1);
  });

  const methodData: any[] = Array.from(methodMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => (b.count || 0) - (a.count || 0));

  return { monthlyData, statusData, methodData };
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const STATUS_COLORS = {
  'Success': '#10b981',
  'Pending': '#f59e0b',
  'Rejected': '#ef4444',
  'Refunded': '#3b82f6'
};

export function PaymentManagementSection() {
  const { toast } = useToast();

  // RTK Query hooks
  const { 
    data: transactionResponse, 
    isLoading: isTransactionsLoading, 
    isError: isTransactionsError,
    refetch: refetchTransactions 
  } = useGetAllTransactionQuery(undefined);
  
  // State for transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // State for analytics and charts
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalRevenue: '৳0',
    monthlyRevenue: '৳0',
    pendingTransactions: '৳0',
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
      console.log('Raw API Data:', transactionResponse.data);
      
      const transformedTransactions = transactionResponse.data.map(transformTransactionData);
      console.log('Transformed Transactions:', transformedTransactions);
      
      setTransactions(transformedTransactions);
      
      // Calculate analytics
      const analyticsData = calculateAnalytics(transformedTransactions);
      console.log('Calculated Analytics:', analyticsData);
      setAnalytics(analyticsData);
      
      // Prepare chart data
      const charts = prepareChartData(transformedTransactions);
      console.log('Chart Data:', charts);
      setChartData(charts);
    } else {
      console.log('No transaction data received');
    }
  }, [transactionResponse]);

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

  return (
    <div className="space-y-6 w-full overflow-y-auto">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-teal-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Payment Analytics</h2>
            <p className="text-white/90 mt-1">Financial analytics and transaction insights</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm font-medium">
              {transactions.length} Total Transactions
            </div>
          </div>
        </div>
      </div>
      
      {/* Analytics Content */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Real-time Analytics</h3>
            <p className="text-sm text-muted-foreground">Live data from database transactions</p>
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
        
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue Card */}
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
                  <p className="text-sm text-muted-foreground">Lifetime successful payments</p>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Monthly Revenue Card */}
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
          
          {/* Pending Transactions Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-yellow-600" />
                Pending Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading || isRefreshingAnalytics ? (
                <div className="flex items-center justify-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-600"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics.pendingTransactions}</div>
                  <p className="text-sm text-muted-foreground">Awaiting processing</p>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Success Rate Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowUpRight className="h-5 w-5 text-purple-600" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading || isRefreshingAnalytics ? (
                <div className="flex items-center justify-center h-16">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{analytics.successRate}</div>
                  <p className="text-sm text-muted-foreground">Transaction success rate</p>
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
              <CardDescription>Revenue over time from successful payments</CardDescription>
            </CardHeader>
            <CardContent>
              {isTransactionsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : isTransactionsError ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Error loading revenue data</p>
                </div>
              ) : chartData.monthlyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>No revenue data available</p>
                  <p className="text-sm mt-2">Complete transactions will appear here</p>
                </div>
              ) : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval={0}
                      />
                      <YAxis 
                        tickFormatter={(value) => `৳${value.toLocaleString()}`}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`৳${Number(value).toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => {
                          // ফুল মাসের নাম দেখান tooltip-এ
                          const monthNames: {[key: string]: string} = {
                            'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
                            'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
                            'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
                          };
                          const [month, year] = label.split(' ');
                          return `${monthNames[month] || month} ${year}`;
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Revenue (৳)"
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
              ) : isTransactionsError ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Error loading status data</p>
                </div>
              ) : chartData.statusData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>No transaction data available</p>
                  <p className="text-sm mt-2">Transactions will appear here</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
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
                </div>
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
              ) : isTransactionsError ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <p>Error loading payment method data</p>
                </div>
              ) : chartData.methodData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>No payment method data available</p>
                  <p className="text-sm mt-2">Transaction methods will appear here</p>
                </div>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.methodData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                      />
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Transaction Summary Table - Simplified */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-blue-600" />
              Recent Transaction Summary
            </CardTitle>
            <CardDescription>Latest transactions from your system</CardDescription>
          </CardHeader>
          <CardContent>
            {isTransactionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
              </div>
            ) : isTransactionsError ? (
              <div className="text-center py-8 text-gray-500">
                <p>Error loading transaction summary</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No transactions found in the system</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Total Transactions</h4>
                    <p className="text-2xl font-bold">{transactions.length}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Successful</h4>
                    <p className="text-2xl font-bold text-green-600">
                      {transactions.filter(t => t.status === 'success').length}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-500">Pending</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      {transactions.filter(t => t.status === 'pending').length}
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-2">Transaction Types</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span className="text-sm">Payment: {transactions.filter(t => t.type === 'payment').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Due: {transactions.filter(t => t.type === 'due').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Refunded: {transactions.filter(t => t.type === 'refunded').length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-sm">Total Amount: ৳{
                        transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()
                      }</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}