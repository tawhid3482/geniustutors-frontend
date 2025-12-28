// 'use client';

// import { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
// import { analyticsService, RevenueTrendsResponse } from '@/services/analyticsService';
// import { TrendingUp, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// interface RevenueChartProps {
//   className?: string;
// }

// const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00'];

// export function RevenueChart({ className }: RevenueChartProps) {
//   const [chartData, setChartData] = useState<RevenueTrendsResponse | null>(null);
//   const [selectedPeriod, setSelectedPeriod] = useState('12');
//   const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const data = await analyticsService.getRevenueTrends(parseInt(selectedPeriod));
//         setChartData(data);
//       } catch (error) {
//         console.error('Error fetching revenue trends:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedPeriod]);

//   const formatCurrency = (value: number) => {
//     return `৳${value.toLocaleString()}`;
//   };

//   const formatMonth = (month: string) => {
//     const date = new Date(month + '-01');
//     return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
//   };

//   const renderLineChart = () => (
//     <ResponsiveContainer width="100%" height={400}>
//       <LineChart data={chartData?.monthlyTrends || []}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis 
//           dataKey="month" 
//           tickFormatter={formatMonth}
//           tick={{ fontSize: 12 }}
//         />
//         <YAxis 
//           tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
//           tick={{ fontSize: 12 }}
//         />
//         <Tooltip 
//           formatter={(value: number, name: string) => [
//             formatCurrency(value), 
//             name === 'revenue' ? 'Revenue' : 'Transactions'
//           ]}
//           labelFormatter={(label) => formatMonth(label)}
//         />
//         <Line 
//           type="monotone" 
//           dataKey="revenue" 
//           stroke="#8884d8" 
//           strokeWidth={3}
//           dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
//           activeDot={{ r: 6 }}
//         />
//         <Line 
//           type="monotone" 
//           dataKey="transactions" 
//           stroke="#82ca9d" 
//           strokeWidth={2}
//           dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
//         />
//       </LineChart>
//     </ResponsiveContainer>
//   );

//   const renderBarChart = () => (
//     <ResponsiveContainer width="100%" height={400}>
//       <BarChart data={chartData?.monthlyTrends || []}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis 
//           dataKey="month" 
//           tickFormatter={formatMonth}
//           tick={{ fontSize: 12 }}
//         />
//         <YAxis 
//           tickFormatter={(value) => `৳${(value / 1000).toFixed(0)}k`}
//           tick={{ fontSize: 12 }}
//         />
//         <Tooltip 
//           formatter={(value: number, name: string) => [
//             formatCurrency(value), 
//             name === 'revenue' ? 'Revenue' : 'Transactions'
//           ]}
//           labelFormatter={(label) => formatMonth(label)}
//         />
//         <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
//         <Bar dataKey="transactions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
//       </BarChart>
//     </ResponsiveContainer>
//   );

//   const renderPieChart = () => (
//     <ResponsiveContainer width="100%" height={400}>
//       <PieChart>
//         <Pie
//           data={chartData?.paymentMethodBreakdown || []}
//           cx="50%"
//           cy="50%"
//           labelLine={false}
//           label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//           outerRadius={120}
//           fill="#8884d8"
//           dataKey="revenue"
//         >
//           {(chartData?.paymentMethodBreakdown || []).map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip formatter={(value: number) => formatCurrency(value)} />
//       </PieChart>
//     </ResponsiveContainer>
//   );

//   const renderChart = () => {
//     if (isLoading) {
//       return (
//         <div className="h-96 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//         </div>
//       );
//     }

//     switch (chartType) {
//       case 'line':
//         return renderLineChart();
//       case 'bar':
//         return renderBarChart();
//       case 'pie':
//         return renderPieChart();
//       default:
//         return renderLineChart();
//     }
//   };

//   return (
//     <Card className={className}>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle className="flex items-center gap-2">
//               <TrendingUp className="h-5 w-5 text-blue-600" />
//               Revenue Trends
//             </CardTitle>
//             <CardDescription>
//               Real-time revenue and transaction analytics
//             </CardDescription>
//           </div>
//           <div className="flex gap-2">
//             <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
//               <SelectTrigger className="w-32">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="3">3 Months</SelectItem>
//                 <SelectItem value="6">6 Months</SelectItem>
//                 <SelectItem value="12">12 Months</SelectItem>
//                 <SelectItem value="24">24 Months</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={chartType} onValueChange={(value: 'line' | 'bar' | 'pie') => setChartType(value)}>
//               <SelectTrigger className="w-32">
//                 <SelectValue />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="line">
//                   <div className="flex items-center gap-2">
//                     <TrendingUp className="h-4 w-4" />
//                     Line
//                   </div>
//                 </SelectItem>
//                 <SelectItem value="bar">
//                   <div className="flex items-center gap-2">
//                     <BarChart3 className="h-4 w-4" />
//                     Bar
//                   </div>
//                 </SelectItem>
//                 <SelectItem value="pie">
//                   <div className="flex items-center gap-2">
//                     <PieChartIcon className="h-4 w-4" />
//                     Pie
//                   </div>
//                 </SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {renderChart()}
        
//         {/* Summary Stats */}
//         {chartData && (
//           <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="text-center p-4 bg-blue-50 rounded-lg">
//               <div className="text-2xl font-bold text-blue-600">
//                 {formatCurrency(
//                   chartData.monthlyTrends.reduce((sum, item) => sum + item.revenue, 0)
//                 )}
//               </div>
//               <div className="text-sm text-gray-600">Total Revenue</div>
//             </div>
//             <div className="text-center p-4 bg-green-50 rounded-lg">
//               <div className="text-2xl font-bold text-green-600">
//                 {chartData.monthlyTrends.reduce((sum, item) => sum + item.transactions, 0)}
//               </div>
//               <div className="text-sm text-gray-600">Total Transactions</div>
//             </div>
//             <div className="text-center p-4 bg-purple-50 rounded-lg">
//               <div className="text-2xl font-bold text-purple-600">
//                 {chartData.paymentMethodBreakdown.length}
//               </div>
//               <div className="text-sm text-gray-600">Payment Methods</div>
//             </div>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
