'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface HistoryItem {
  id: string;
  job_id: string;
  date: string;
  tutor_name: string;
  student_name: string;
  status?: string;
  subject?: string;
  district?: string;
  area?: string;
  duration?: number;
  salary_range?: string;
}

interface FilterOptions {
  search: string;
  district: string;
  subject: string;
  status: string;
  dateRange: string;
}

const HistoryTable = ({ data, type, filteredData }: { data: HistoryItem[], type: string, filteredData: HistoryItem[] }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Job ID</TableHead>
        <TableHead>Date</TableHead>
        <TableHead>Tutor</TableHead>
        <TableHead>Student</TableHead>
        <TableHead>Subject</TableHead>
        <TableHead>Location</TableHead>
        {type === 'demo' && <TableHead>Duration</TableHead>}
        {type === 'assignment' && <TableHead>Status</TableHead>}
        {type === 'pending' && <TableHead>Salary Range</TableHead>}
      </TableRow>
    </TableHeader>
    <TableBody>
      {filteredData.length > 0 ? (
        filteredData.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-mono text-sm">{item.job_id}</TableCell>
            <TableCell>{new Date(item.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</TableCell>
            <TableCell className="font-medium">{item.tutor_name || 'N/A'}</TableCell>
            <TableCell className="font-medium">{item.student_name || 'N/A'}</TableCell>
            <TableCell>{item.subject || 'N/A'}</TableCell>
            <TableCell>{item.district && item.area ? `${item.area}, ${item.district}` : 'N/A'}</TableCell>
            {type === 'demo' && (
              <TableCell>{item.duration ? `${item.duration} min` : 'N/A'}</TableCell>
            )}
            {type === 'assignment' && (
              <TableCell>
                <Badge variant={item.status === 'completed' ? 'default' : item.status === 'cancelled' ? 'destructive' : 'secondary'}>
                  {item.status || 'pending'}
                </Badge>
              </TableCell>
            )}
            {type === 'pending' && (
              <TableCell>{item.salary_range || 'N/A'}</TableCell>
            )}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={type === 'demo' ? 7 : type === 'assignment' ? 7 : 7} className="text-center py-8">
            <div className="text-muted-foreground">
              {data.length === 0 ? `No ${type} data available.` : 'No results match your filters.'}
            </div>
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export function TutoringHistorySection() {
  const [historyData, setHistoryData] = useState<{
    demo: HistoryItem[];
    assignment: HistoryItem[];
    confirmed: HistoryItem[];
    cancelled: HistoryItem[];
    pending: HistoryItem[];
  }>({
    demo: [],
    assignment: [],
    confirmed: [],
    cancelled: [],
    pending: [],
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    district: '',
    subject: '',
    status: '',
    dateRange: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  // Get unique values for filter dropdowns
  const uniqueDistricts = useMemo(() => {
    const allData = [...historyData.demo, ...historyData.assignment, ...historyData.confirmed, ...historyData.cancelled, ...historyData.pending];
    return Array.from(new Set(allData.map(item => item.district).filter(Boolean))).sort();
  }, [historyData]);

  const uniqueSubjects = useMemo(() => {
    const allData = [...historyData.demo, ...historyData.assignment, ...historyData.confirmed, ...historyData.cancelled, ...historyData.pending];
    return Array.from(new Set(allData.map(item => item.subject).filter(Boolean))).sort();
  }, [historyData]);

  const uniqueStatuses = useMemo(() => {
    const allData = [...historyData.demo, ...historyData.assignment, ...historyData.confirmed, ...historyData.cancelled, ...historyData.pending];
    return Array.from(new Set(allData.map(item => item.status).filter(Boolean))).sort();
  }, [historyData]);

  // Filter function
  const filterData = (data: HistoryItem[]) => {
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          item.tutor_name?.toLowerCase().includes(searchLower) ||
          item.student_name?.toLowerCase().includes(searchLower) ||
          item.subject?.toLowerCase().includes(searchLower) ||
          item.district?.toLowerCase().includes(searchLower) ||
          item.area?.toLowerCase().includes(searchLower) ||
          item.job_id?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // District filter
      if (filters.district && item.district !== filters.district) {
        return false;
      }

      // Subject filter
      if (filters.subject && item.subject !== filters.subject) {
        return false;
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.date);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'today':
            if (daysDiff !== 0) return false;
            break;
          case 'week':
            if (daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff > 30) return false;
            break;
          case 'quarter':
            if (daysDiff > 90) return false;
            break;
          case 'year':
            if (daysDiff > 365) return false;
            break;
        }
      }

      return true;
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      district: '',
      subject: '',
      status: '',
      dateRange: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const fetchHistory = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Fetch data directly from database using MySQL queries
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Fetch demo classes
      const demoResponse = await fetch('/api/tutoring-history?type=demo&limit=100', {
        method: 'GET',
        headers,
      });
      const demoData = demoResponse.ok ? await demoResponse.json() : { data: [] };

      // Fetch tutor assignments
      const assignmentResponse = await fetch('/api/tutoring-history?type=assignment&limit=100', {
        method: 'GET',
        headers,
      });
      const assignmentData = assignmentResponse.ok ? await assignmentResponse.json() : { data: [] };

      // Fetch confirmed assignments
      const confirmedResponse = await fetch('/api/tutoring-history?type=confirmed&limit=100', {
        method: 'GET',
        headers,
      });
      const confirmedData = confirmedResponse.ok ? await confirmedResponse.json() : { data: [] };

      // Fetch cancelled assignments
      const cancelledResponse = await fetch('/api/tutoring-history?type=cancelled&limit=100', {
        method: 'GET',
        headers,
      });
      const cancelledData = cancelledResponse.ok ? await cancelledResponse.json() : { data: [] };

      // Fetch pending requests
      const pendingResponse = await fetch('/api/tutoring-history?type=pending&limit=100', {
        method: 'GET',
        headers,
      });
      const pendingData = pendingResponse.ok ? await pendingResponse.json() : { data: [] };

        setHistoryData({
        demo: demoData.data || [],
        assignment: assignmentData.data || [],
        confirmed: confirmedData.data || [],
        cancelled: cancelledData.data || [],
        pending: pendingData.data || [],
      });

      if (isRefresh) {
        toast({
          title: 'Success',
          description: 'History data refreshed successfully',
        });
      }
      } catch (err) {
      console.error('Error fetching history:', err);
        setError('Failed to fetch history data.');
      toast({
        title: 'Error',
        description: 'Failed to load history data',
        variant: 'destructive',
      });
      } finally {
        setLoading(false);
      setRefreshing(false);
      }
    };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-8">
            {error}
            <div className="mt-4">
              <Button onClick={() => fetchHistory()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
        <CardTitle>Tutoring History</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 px-1 py-0 text-xs">
                  {Object.values(filters).filter(v => v !== '').length}
                </Badge>
              )}
            </Button>
            <Button
              onClick={() => fetchHistory(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filter Section */}
        {showFilters && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, subject, location..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* District Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">District</label>
                <Select
                  value={filters.district || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, district: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Districts</SelectItem>
                    {uniqueDistricts.map(district => (
                      <SelectItem key={district} value={district || 'unknown'}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select
                  value={filters.subject || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {uniqueSubjects.map(subject => (
                      <SelectItem key={subject} value={subject || 'unknown'}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map(status => (
                      <SelectItem key={status || 'unknown'} value={status || 'unknown'}>
                        {status || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value === 'all' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                    <SelectItem value="quarter">Last 90 Days</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="demo">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="demo">
              Demo History ({filterData(historyData.demo).length})
            </TabsTrigger>
            <TabsTrigger value="assignment">
              Tutor Assignment ({filterData(historyData.assignment).length})
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirm History ({filterData(historyData.confirmed).length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancel History ({filterData(historyData.cancelled).length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({filterData(historyData.pending).length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="demo" className="mt-4">
            <HistoryTable data={historyData.demo} type="demo" filteredData={filterData(historyData.demo)} />
          </TabsContent>
          <TabsContent value="assignment" className="mt-4">
            <HistoryTable data={historyData.assignment} type="assignment" filteredData={filterData(historyData.assignment)} />
          </TabsContent>
          <TabsContent value="confirmed" className="mt-4">
            <HistoryTable data={historyData.confirmed} type="assignment" filteredData={filterData(historyData.confirmed)} />
          </TabsContent>
          <TabsContent value="cancelled" className="mt-4">
            <HistoryTable data={historyData.cancelled} type="assignment" filteredData={filterData(historyData.cancelled)} />
          </TabsContent>
          <TabsContent value="pending" className="mt-4">
            <HistoryTable data={historyData.pending} type="pending" filteredData={filterData(historyData.pending)} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
