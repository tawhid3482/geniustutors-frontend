import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Search, Clock, MapPin, DollarSign, User, BookOpen, Eye, X, RotateCcw, RefreshCw } from 'lucide-react';
import { tutorApplicationService, type TutorApplication } from '@/services/tutorApplicationService';
import { useRouter } from 'next/navigation';

const ApplicationSection = () => {
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TutorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0,
  });
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchApplications();
    fetchStats();
    
    // Set up real-time refresh every 30 seconds
    const interval = setInterval(() => {
      fetchApplications(true);
      fetchStats();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const response = await tutorApplicationService.getTutorApplications();
      setApplications(response.data);
      setFilteredApplications(response.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to load applications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await tutorApplicationService.getTutorApplicationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Filter applications based on search term and status
  useEffect(() => {
    let filtered = applications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.studentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, applications]);

  const handleWithdrawApplication = async (applicationId: string) => {
    try {
      await tutorApplicationService.withdrawApplication(applicationId);
      toast({
        title: 'Success',
        description: 'Application withdrawn successfully',
      });
      // Refresh applications and stats
      fetchApplications(true);
      fetchStats();
    } catch (error) {
      console.error('Error withdrawing application:', error);
      toast({
        title: 'Error',
        description: 'Failed to withdraw application',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      withdrawn: { color: 'bg-gray-100 text-gray-800', label: 'Withdrawn' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewJobDetails = (jobId: string, applicationType: string) => {
    // Both job applications and tutor request applications should redirect to tuition job details page
    router.push(`/tuition-jobs/${jobId}`);
  };

  const handleResetApplication = (application: TutorApplication) => {
    // Redirect to the tuition job details page for this application
    router.push(`/tuition-jobs/${application.job.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">My Applications</h1>
            <p className="text-green-100">Track all your job applications and their status</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchApplications(true);
              fetchStats();
            }}
            disabled={refreshing}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Real-time indicator */}
      {refreshing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          <span className="text-sm text-blue-700">Updating applications...</span>
        </div>
      )}

      {/* Last updated timestamp */}
      {lastUpdated && !refreshing && (
        <div className="text-right">
          <p className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accepted</p>
                <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Withdrawn</p>
                <p className="text-2xl font-bold text-gray-600">{stats.withdrawn}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <X className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by job title, subject, location, or student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="withdrawn">Withdrawn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600 mb-4">
                {applications.length === 0 
                  ? "You haven't applied for any jobs yet. Start by browsing available tuition jobs."
                  : "No applications match your current filters."
                }
              </p>
              {applications.length === 0 && (
                <Button onClick={() => router.push('/tuition-jobs')}>
                  Browse Jobs
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredApplications.map((application) => (
            <Card key={application.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {application.job.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {application.job.subject}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.job.location}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(application.status)}
                    </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div>
                         <p className="text-sm text-gray-600 mb-1">Student</p>
                         <p className="font-medium">{application.job.studentName}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-600 mb-1">Applied On</p>
                         <p className="font-medium">{formatDate(application.createdAt)}</p>
                       </div>
                       <div>
                         <p className="text-sm text-gray-600 mb-1">
                           {application.applicationType === 'job' ? 'Job Status' : 'Request Status'}
                         </p>
                         <Badge variant={application.job.status === 'open' || application.job.status === 'active' ? 'default' : 'secondary'}>
                           {application.job.status}
                         </Badge>
                       </div>
                     </div>

                    {application.coverLetter && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">Cover Letter</p>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                          {application.coverLetter.length > 200 
                            ? `${application.coverLetter.substring(0, 200)}...`
                            : application.coverLetter
                          }
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 lg:flex-shrink-0">
                                         <Button
                       variant="outline"
                       onClick={() => handleViewJobDetails(application.job.id, application.applicationType)}
                       className="w-full lg:w-auto"
                     >
                       <Eye className="h-4 w-4 mr-2" />
                       {application.applicationType === 'job' ? 'View Job' : 'View Request'}
                     </Button>
                     
                     
                     
                    {application.status === 'pending' && (
                      <Button
                        variant="outline"
                        onClick={() => handleWithdrawApplication(application.id)}
                        className="w-full lg:w-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationSection;
