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
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from "lucide-react";

interface TutoringSession {
  id: string;
  student_name: string;
  subject: string;
  start_time: string;
  end_time: string;
  duration: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
}

interface TutorAssignment {
  id: string;
  tutor_request_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  assigned_at: string;
  updated_at: string;
  notes?: string;
  student_name: string;
  subject: string;
  location: string;
  salary_range: string;
}

interface TutoringHistoryStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalHours: number;
  averageRating: number;
  totalAssignments: number;
  activeAssignments: number;
}

export function TutoringHistorySection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<TutoringSession[]>([]);
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [stats, setStats] = useState<TutoringHistoryStats>({
    totalSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    totalHours: 0,
    averageRating: 0,
    totalAssignments: 0,
    activeAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Fetch tutoring history data
  const fetchTutoringHistory = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch tutoring history data
      const historyResponse = await api.get(`/tutoring-history/tutor/${user.id}`);
      const historyData = historyResponse.data.data;

      if (historyData) {
        setSessions(historyData.sessions || []);
        setAssignments(historyData.assignments || []);
        setStats(historyData.stats || {
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          totalHours: 0,
          averageRating: 0,
          totalAssignments: 0,
          activeAssignments: 0
        });
      } else {
        // Handle case where historyData is undefined
        setSessions([]);
        setAssignments([]);
        setStats({
          totalSessions: 0,
          completedSessions: 0,
          cancelledSessions: 0,
          totalHours: 0,
          averageRating: 0,
          totalAssignments: 0,
          activeAssignments: 0
        });
      }

    } catch (error) {
      console.error('Error fetching tutoring history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tutoring history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTutoringHistory();
  }, [user?.id]);

  // Filter sessions based on search and filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const sessionDate = new Date(session.start_time);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          matchesDate = sessionDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = sessionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = sessionDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: 'secondary' as const, icon: Clock, text: 'Scheduled' },
      ongoing: { variant: 'default' as const, icon: AlertCircle, text: 'Ongoing' },
      completed: { variant: 'default' as const, icon: CheckCircle, text: 'Completed' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, text: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tutoring history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <History className="h-8 w-8" />
          Tutoring History
        </h2>
        <p className="text-muted-foreground">
          View your complete tutoring history, sessions, and assignments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedSessions}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-500" />
                  {stats.averageRating}
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                  placeholder="Search by student name or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter} defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter} defaultValue="all">
              <SelectTrigger className="w-full sm:w-48">
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
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Sessions ({filteredSessions.length})
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Assignments ({assignments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tutoring Sessions</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchTutoringHistory}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSessions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {session.student_name}
                          </div>
                        </TableCell>
                        <TableCell>{session.subject}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(session.start_time)}
                          </div>
                        </TableCell>
                        <TableCell>{session.duration} min</TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {session.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sessions found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                      ? 'Try adjusting your filters to see more results'
                      : 'You haven\'t had any tutoring sessions yet'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Salary Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {assignment.student_name}
                          </div>
                        </TableCell>
                        <TableCell>{assignment.subject}</TableCell>
                        <TableCell>{assignment.location}</TableCell>
                        <TableCell>{assignment.salary_range}</TableCell>
                        <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                        <TableCell>{formatDate(assignment.assigned_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                  <p className="text-muted-foreground">
                    You haven't been assigned to any tutoring requests yet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
