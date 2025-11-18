import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock, Eye, Users, Filter, Search, ExternalLink, UserPlus, MapPin, Star, Phone, Mail, AlertCircle, User } from 'lucide-react';
import { API_BASE_URL } from '@/constants/api';
import { tutorApplicationService } from '@/services/tutorApplicationService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import tutorService from '@/services/tutorService';
import { tutorRequestService, TutorAssignment } from '@/services/tutorRequestService';
import { useRole } from "@/contexts/RoleContext";

interface TutorApplication {
  id: string;
  tutor_request_id?: string;
  tutor_id: string;
  applicant_name?: string;
  applicant_phone?: string;
  applicant_email?: string;
  message?: string;
  cover_letter?: string;
  proposed_rate?: number;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'contacted' | 'completed';
  admin_notes: string | null;
  contacted_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  tutor_name: string;
  tutor_email: string;
  tutor_phone: string;
  tutor_avatar: string;
  tutor_district: string;
  qualification?: string;
  experience?: string;
  student_name?: string;
  subject?: string;
  student_class?: string;
  request_district?: string;
  request_area?: string;
  salary_range_min?: number;
  salary_range_max?: number;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
  contacted?: number;
  completed?: number;
}

// Use the imported Tutor interface from tutorService
type LocalTutor = import('@/services/tutorService').Tutor;

interface TutorFilter {
  subject?: string;
  district?: string;
  minRating?: number;
  maxPrice?: number;
  gender?: string;
  education?: string;
  availability?: string;
  sortBy?: string;
  sortOrder?: string;
}

const ContactRequests = () => {
  const { toast } = useToast();
  const { canDelete } = useRole();
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    district: ''
  });

  // Assignment system state variables
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [tutors, setTutors] = useState<LocalTutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<LocalTutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [createDemoClass, setCreateDemoClass] = useState(false);
  const [demoDate, setDemoDate] = useState('');
  const [demoDuration, setDemoDuration] = useState(30);
  const [demoNotes, setDemoNotes] = useState('');
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [tutorFilters, setTutorFilters] = useState<TutorFilter>({});
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<LocalTutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<'all' | 'matched' | 'nearby'>('all');
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [sendSMSNotification, setSendSMSNotification] = useState(true);

  useEffect(() => {
    fetchContactRequests();
    fetchContactStats();
  }, [filters]);


  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let url = `${API_BASE_URL}/tutor-applications`;
      const params = new URLSearchParams();
      
      // Only fetch contact requests (those without tutor_request_id)
      params.append('contact_only', 'true');
      
      if (filters.subject) {
        params.append('subject', filters.subject);
      }
      
      if (filters.district) {
        params.append('district', filters.district);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact requests');
      }

      const data = await response.json();
      setApplications(data.data);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load contact requests. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchContactStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tutor-applications/stats?contact_only=true`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  // Assignment system functions
  const fetchTutors = async (filters?: TutorFilter) => {
    try {
      setIsLoadingTutors(true);
      
      const response = await tutorService.getAllTutors(filters);
      if (response.success) {
        const transformedTutors = response.data.map((tutor: any) => ({
          id: tutor.id,
          tutor_id: tutor.tutor_id || '',
          full_name: tutor.full_name || 'Unknown Tutor',
          location: tutor.location || '',
          district: tutor.district || '',
          area: tutor.area || '',
          post_office: tutor.post_office || '',
          avatar_url: tutor.avatar_url || tutor.avatar || null,
          created_at: tutor.created_at || '',
          gender: tutor.gender || null,
          bio: tutor.bio || null,
          education: tutor.education || null,
          experience: tutor.experience || null,
          subjects: tutor.subjects || null,
          hourly_rate: tutor.hourly_rate || null,
          rating: tutor.rating || 0,
          total_reviews: tutor.total_reviews || 0,
          total_views: tutor.total_views || 0,
          availability: tutor.availability || null,
          premium: tutor.premium || '',
          verified: tutor.verified || 0,
          qualification: tutor.qualification || '',
          tutoring_experience: tutor.tutoring_experience || '',
          university_name: tutor.university_name || '',
          department_name: tutor.department_name || '',
          expected_salary: tutor.expected_salary || 0,
          days_per_week: tutor.days_per_week || 0,
          preferred_tutoring_style: tutor.preferred_tutoring_style || '',
          educational_qualifications: tutor.educational_qualifications || '',
          preferred_subjects: tutor.preferred_subjects || '',
          preferred_class: tutor.preferred_class || '',
          preferred_medium: tutor.preferred_medium || '',
          preferred_time: tutor.preferred_time || '',
          religion: tutor.religion || '',
          nationality: tutor.nationality || ''
        }));
        
        setTutors(transformedTutors);
        setFilteredTutors(transformedTutors);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tutors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTutors(false);
    }
  };

  const handleViewApplication = (application: TutorApplication) => {
    setSelectedApplication(application);
    setAdminNotes(application.admin_notes || '');
    setIsDialogOpen(true);
  };

  // Assignment system functions
  const openAssignTutorModal = async (application: TutorApplication) => {
    setSelectedApplication(application);
    setSelectedTutor('');
    setAssignmentNotes('');
    setCreateDemoClass(false);
    setDemoDate('');
    setDemoNotes('');
    setAssignmentTab('all');
    setTutorSearchTerm('');
    setSendEmailNotification(true);
    setSendSMSNotification(true);
    
    try {
      await fetchTutors();
      // For contact requests, we don't need to fetch existing assignments
      // since they don't have the same assignment system as tuition requests
      setAssignments([]);
      
      setShowAssignTutorModal(true);
    } catch (error) {
      console.error('Error opening assign tutor modal:', error);
      toast({
        title: 'Error',
        description: 'Failed to load assignment data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const openAssignmentsModal = async (application: TutorApplication) => {
    setSelectedApplication(application);
    
    try {
      // Fetch assignments for this contact request
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tutor-applications/${application.id}/assignments`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setAssignments(result.data || []);
      } else {
        setAssignments([]);
      }
      
      setShowAssignmentsModal(true);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setAssignments([]);
      setShowAssignmentsModal(true);
    }
  };

  const handleAssignTutor = async () => {
    if (!selectedApplication || !selectedTutor) {
      toast({
        title: "Error",
        description: "Please select a tutor",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAssigning(true);
      
      // For contact requests, we'll create a simple assignment record
      // Since contact requests don't have tutor_request_id, we'll use a different approach
      const assignmentData = {
        contactApplicationId: selectedApplication.id,
        tutorId: selectedTutor,
        notes: assignmentNotes,
        createDemoClass: createDemoClass,
        demoDate: createDemoClass ? demoDate : undefined,
        demoDuration: createDemoClass ? demoDuration : undefined,
        demoNotes: createDemoClass ? demoNotes : undefined,
        sendEmailNotification,
        sendSMSNotification
      };

      // Call a custom API endpoint for contact request assignments
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tutor-applications/${selectedApplication.id}/assign-tutor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignmentData)
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Tutor assigned successfully",
        });

        setShowAssignTutorModal(false);
        fetchContactRequests();
        fetchContactStats();
      } else {
        throw new Error(result.message || 'Failed to assign tutor');
      }
    } catch (error) {
      console.error('Error assigning tutor:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign tutor. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const getMatchedTutors = (application: TutorApplication) => {
    if (!application || !tutors.length) {
      return [];
    }
    
    // For contact requests, we don't filter out assigned tutors
    // since they don't have the same assignment system as tuition requests
    let availableTutors = tutors;
    
    let matchedTutors = availableTutors.filter(tutor => {
      // Apply search filter if search term exists
      if (tutorSearchTerm) {
        const searchTerm = tutorSearchTerm.toLowerCase();
        const tutorName = (tutor.full_name || '').toLowerCase();
        const tutorId = (tutor.id || '').toString().toLowerCase();
        
        if (!tutorName.includes(searchTerm) && !tutorId.includes(searchTerm)) {
          return false;
        }
      }
      
      // Check if tutor teaches the required subject (if available)
      if (application.subject) {
        const tutorSubjects = Array.isArray(tutor.subjects) 
          ? tutor.subjects.join(',').toLowerCase() 
          : (tutor.subjects || '').toLowerCase();
        const tutorPreferredSubjects = Array.isArray(tutor.preferred_subjects) 
          ? tutor.preferred_subjects.join(',').toLowerCase() 
          : (tutor.preferred_subjects || '').toLowerCase();
        const requestSubject = application.subject.toLowerCase();
        
        const teachesSubject = tutorSubjects.includes(requestSubject) ||
                             tutorPreferredSubjects.includes(requestSubject) ||
                             tutorSubjects.includes('all') ||
                             tutorPreferredSubjects.includes('all');
        
        if (!teachesSubject) {
          return false;
        }
      }
      
      // Check if tutor is in the same district or nearby
      if (application.tutor_district) {
        const tutorDistrict = (tutor.district || '').toLowerCase();
        const tutorLocation = (tutor.location || '').toLowerCase();
        const requestDistrict = application.tutor_district.toLowerCase();
        
        const locationMatch = tutorDistrict === requestDistrict ||
                             tutorLocation.includes(requestDistrict) ||
                             requestDistrict.includes(tutorDistrict);
        
        if (!locationMatch) {
          return false;
        }
      }
      
      return true;
    });
    
    return matchedTutors;
  };

  const getNearbyTutors = (application: TutorApplication) => {
    if (!application || !tutors.length) {
      return [];
    }
    
    // For contact requests, we don't filter out assigned tutors
    // since they don't have the same assignment system as tuition requests
    let availableTutors = tutors;
    
    return availableTutors.filter(tutor => {
      // Apply search filter if search term exists
      if (tutorSearchTerm) {
        const searchTerm = tutorSearchTerm.toLowerCase();
        const tutorName = (tutor.full_name || '').toLowerCase();
        const tutorId = (tutor.id || '').toString().toLowerCase();
        
        if (!tutorName.includes(searchTerm) && !tutorId.includes(searchTerm)) {
          return false;
        }
      }
      
      // Check if tutor is in the same district
      if (application.tutor_district) {
        const tutorDistrict = (tutor.district || '').toLowerCase();
        const requestDistrict = application.tutor_district.toLowerCase();
        
        return tutorDistrict === requestDistrict;
      }
      
      return true;
    });
  };

  const getAllTutors = () => {
    if (!tutors.length) {
      return [];
    }
    
    // For contact requests, we don't filter out assigned tutors
    // since they don't have the same assignment system as tuition requests
    let availableTutors = tutors;
    
    return availableTutors.filter(tutor => {
      // Apply search filter if search term exists
      if (tutorSearchTerm) {
        const searchTerm = tutorSearchTerm.toLowerCase();
        const tutorName = (tutor.full_name || '').toLowerCase();
        const tutorId = (tutor.id || '').toString().toLowerCase();
        
        return tutorName.includes(searchTerm) || tutorId.includes(searchTerm);
      }
      
      return true;
    });
  };

  const viewTutorDetails = async (tutorId: string) => {
    try {
      const response = await tutorService.getTutorById(tutorId);
      if (response.success) {
        setSelectedTutorDetails(response.data);
        setShowTutorDetails(true);
      }
    } catch (error) {
      console.error('Error fetching tutor details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tutor details.',
        variant: 'destructive',
      });
    }
  };



  const handleUpdateContactApplicationStatus = async (status: 'contacted' | 'completed' | 'rejected') => {
    if (!selectedApplication) return;

    if (status === 'rejected' && !adminNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Admin notes are required for rejection',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      const response = await tutorApplicationService.updateContactApplicationStatus(
        selectedApplication.id,
        {
          status,
          adminNotes: adminNotes.trim() || undefined
        }
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Application status updated successfully',
        });

        setIsDialogOpen(false);
        fetchContactRequests();
        fetchContactStats();
      } else {
        throw new Error(response.message || 'Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteContactApplication = async () => {
    if (!selectedApplication) return;

    try {
      setIsProcessing(true);
      
      const response = await tutorApplicationService.deleteContactApplication(selectedApplication.id);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Application deleted successfully',
        });

        setIsDialogOpen(false);
        fetchContactRequests();
        fetchContactStats();
      } else {
        throw new Error(response.message || 'Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      withdrawn: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      contacted: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    // Only show contact requests (those without tutor_request_id)
    return (
      app.tutor_name?.toLowerCase().includes(searchLower) ||
      app.applicant_name?.toLowerCase().includes(searchLower) ||
      app.applicant_phone?.toLowerCase().includes(searchLower) ||
      app.id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <CardTitle>Contact Requests</CardTitle>
        </div>
        <CardDescription>
          Review and manage contact requests from tutor applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Requests</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">{stats.contacted || 0}</div>
                  <div className="text-sm text-gray-600">Contacted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
                  <div className="text-sm text-gray-600">Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex gap-2">
              <div className="w-48">
                <Input 
                  placeholder="Search contact requests..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setFilters({ subject: '', district: '' })}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label htmlFor="subject-filter" className="text-sm font-medium">Subject</Label>
              <Input
                id="subject-filter"
                placeholder="Filter by subject..."
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="district-filter" className="text-sm font-medium">District</Label>
              <Input
                id="district-filter"
                placeholder="Filter by district..."
                value={filters.district}
                onChange={(e) => setFilters(prev => ({ ...prev, district: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Contact Requests Content */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Loading contact requests...</div>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.applicant_name}</div>
                          <div className="text-sm text-gray-500">{application.applicant_phone}</div>
                          <div className="text-xs text-gray-400">{application.applicant_email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.tutor_name}</div>
                          <div className="text-sm text-gray-500">{application.tutor_email}</div>
                          <div className="text-xs text-gray-400">{application.tutor_district}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate text-sm">
                          {application.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(application.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewApplication(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No contact requests found
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Contact Request Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Request Details</DialogTitle>
            <DialogDescription>
              Review contact request and manage status
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Contact Information</Label>
                  <div className="mt-1 space-y-1">
                    <div><strong>Name:</strong> {selectedApplication.applicant_name}</div>
                    <div><strong>Phone:</strong> {selectedApplication.applicant_phone}</div>
                    <div><strong>Email:</strong> {selectedApplication.applicant_email || 'Not provided'}</div>
                    <div><strong>Submitted:</strong> {new Date(selectedApplication.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">Tutor Information</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/tutor/${selectedApplication.tutor_id}`, '_blank')}
                      className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Profile
                    </Button>
                  </div>
                  <div className="mt-1 space-y-1">
                    <div><strong>Name:</strong> {selectedApplication.tutor_name}</div>
                    <div><strong>Email:</strong> {selectedApplication.tutor_email}</div>
                    <div><strong>Phone:</strong> {selectedApplication.tutor_phone}</div>
                    <div><strong>District:</strong> {selectedApplication.tutor_district}</div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedApplication.message}
                </div>
              </div>

              {selectedApplication.admin_notes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <div className="mt-1 p-3 bg-blue-50 rounded-md text-sm">
                    {selectedApplication.admin_notes}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="admin-notes" className="text-sm font-medium">
                  Admin Notes {selectedApplication.status === 'pending' && '(Required for rejection)'}
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add your notes here..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col space-y-4">
            {selectedApplication ? (
              <div className="flex flex-col space-y-3 w-full">
                {/* Primary Actions Row */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button 
                    variant="outline" 
                    onClick={() => openAssignTutorModal(selectedApplication)}
                    className="flex items-center gap-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign Tutor
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => openAssignmentsModal(selectedApplication)}
                    className="flex items-center gap-1 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    <Users className="h-4 w-4" />
                    View Assignments
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleUpdateContactApplicationStatus('contacted')}
                    disabled={isProcessing || selectedApplication.status === 'contacted'}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isProcessing ? 'Updating...' : 'Mark Contacted'}
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => handleUpdateContactApplicationStatus('completed')}
                    disabled={isProcessing || selectedApplication.status === 'completed'}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isProcessing ? 'Updating...' : 'Mark Completed'}
                  </Button>
                </div>
                
                {/* Secondary Actions Row */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button 
                    variant="destructive" 
                    onClick={() => handleUpdateContactApplicationStatus('rejected')}
                    disabled={isProcessing || selectedApplication.status === 'rejected'}
                    className="flex items-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    {isProcessing ? 'Updating...' : 'Reject'}
                  </Button>
                  {canDelete && (
                    <Button 
                      variant="destructive" 
                      onClick={() => handleDeleteContactApplication()}
                      disabled={isProcessing}
                      className="flex items-center gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      {isProcessing ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Assign Tutor Modal */}
      <Dialog open={showAssignTutorModal} onOpenChange={setShowAssignTutorModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Tutor - Advanced Selection</DialogTitle>
            <DialogDescription>
              Select the best tutor for this contact request with advanced filtering and matching.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedApplication.applicant_name}</h3>
                    {selectedApplication.applicant_phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedApplication.applicant_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="font-medium">{selectedApplication.subject || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Class:</span>
                    <p className="font-medium">{selectedApplication.student_class || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{selectedApplication.tutor_district}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tutor:</span>
                    <p className="font-medium">{selectedApplication.tutor_name}</p>
                  </div>
                </div>
              </div>

              {/* Tutor Selection Tabs */}
              <Tabs value={assignmentTab} onValueChange={(value) => setAssignmentTab(value as 'all' | 'matched' | 'nearby')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    All Tutors ({getAllTutors().length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="matched">
                    Best Matches ({selectedApplication ? getMatchedTutors(selectedApplication).length : 0})
                  </TabsTrigger>
                  <TabsTrigger value="nearby">
                    Nearby ({selectedApplication ? getNearbyTutors(selectedApplication).length : 0})
                  </TabsTrigger>
                </TabsList>

                {/* Search Field */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tutors by name or ID..."
                    value={tutorSearchTerm}
                    onChange={(e) => setTutorSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <TabsContent value="all" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {isLoadingTutors ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : getAllTutors().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>{tutorSearchTerm ? 'No tutors found matching your search' : 'No tutors available'}</p>
                        <p className="text-sm text-gray-500">
                          {tutorSearchTerm ? `Search term: "${tutorSearchTerm}"` : `Tutors loaded: ${tutors.length}`}
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Showing {getAllTutors().length} of {tutors.length} tutors
                          {tutorSearchTerm && ` for "${tutorSearchTerm}"`}
                        </div>
                        {getAllTutors().map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            isSelected={selectedTutor === tutor.id}
                            onSelect={() => setSelectedTutor(tutor.id)}
                            onViewDetails={() => viewTutorDetails(tutor.id)}
                            application={selectedApplication}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="matched" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {!selectedApplication ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No request selected</p>
                      </div>
                    ) : getMatchedTutors(selectedApplication).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No perfect matches found</p>
                        <p className="text-sm">Try adjusting the filters or check all tutors</p>
                        <p className="text-xs text-gray-500">Request subject: {selectedApplication.subject}, District: {selectedApplication.tutor_district}</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Found {getMatchedTutors(selectedApplication).length} matched tutors
                        </div>
                        {getMatchedTutors(selectedApplication).map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            isSelected={selectedTutor === tutor.id}
                            onSelect={() => setSelectedTutor(tutor.id)}
                            onViewDetails={() => viewTutorDetails(tutor.id)}
                            application={selectedApplication}
                            isMatched={true}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="nearby" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {!selectedApplication ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No request selected</p>
                      </div>
                    ) : getNearbyTutors(selectedApplication).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No tutors in this area</p>
                        <p className="text-sm">Try expanding the search area</p>
                        <p className="text-xs text-gray-500">Request district: {selectedApplication.tutor_district}</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Found {getNearbyTutors(selectedApplication).length} nearby tutors
                        </div>
                        {getNearbyTutors(selectedApplication).map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            isSelected={selectedTutor === tutor.id}
                            onSelect={() => setSelectedTutor(tutor.id)}
                            onViewDetails={() => viewTutorDetails(tutor.id)}
                            application={selectedApplication}
                            isNearby={true}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Assignment Details */}
              {selectedTutor && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-medium">Assignment Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this assignment"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createDemo"
                        checked={createDemoClass}
                        onCheckedChange={(checked) => setCreateDemoClass(checked as boolean)}
                      />
                      <Label htmlFor="createDemo">Create Demo Class</Label>
                    </div>
                  </div>

                  {createDemoClass && (
                    <div className="space-y-4 border rounded-lg p-4 bg-background">
                      <h5 className="font-medium">Demo Class Details</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="demoDate">Demo Date & Time</Label>
                          <Input
                            id="demoDate"
                            type="datetime-local"
                            value={demoDate}
                            onChange={(e) => setDemoDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="demoDuration">Duration (minutes)</Label>
                          <Select value={demoDuration.toString()} onValueChange={(value) => setDemoDuration(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="demoNotes">Demo Class Notes (Optional)</Label>
                        <Textarea
                          id="demoNotes"
                          placeholder="Add any notes for the demo class"
                          value={demoNotes}
                          onChange={(e) => setDemoNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <div className="flex flex-col space-y-4 w-full">
              {/* Notification Options */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailNotification"
                    checked={sendEmailNotification}
                    onCheckedChange={(checked) => setSendEmailNotification(checked as boolean)}
                  />
                  <Label htmlFor="emailNotification">Send Email Notification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smsNotification"
                    checked={sendSMSNotification}
                    onCheckedChange={(checked) => setSendSMSNotification(checked as boolean)}
                  />
                  <Label htmlFor="smsNotification">Send SMS Notification</Label>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAssignTutorModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignTutor} 
                  disabled={!selectedTutor || isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Tutor'
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignments Modal */}
      <Dialog open={showAssignmentsModal} onOpenChange={setShowAssignmentsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Request Assignments</DialogTitle>
            <DialogDescription>
              View all tutors assigned to this contact request
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              {/* Request Summary */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedApplication.applicant_name}</h3>
                    {selectedApplication.applicant_phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedApplication.applicant_phone}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {assignments.length} Assignment{assignments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="font-medium">{selectedApplication.subject || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Class:</span>
                    <p className="font-medium">{selectedApplication.student_class || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{selectedApplication.tutor_district}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{selectedApplication.status}</p>
                  </div>
                </div>
              </div>

              {/* Assignments List */}
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>No tutors assigned yet</p>
                    <p className="text-sm">Use the "Assign Tutor" button to assign tutors to this contact request</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-medium text-lg">Assigned Tutors</h4>
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="border rounded-lg p-4 bg-background">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-semibold text-lg">{assignment.tutor_name}</h5>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  assignment.status === 'pending' ? 'text-yellow-600 border-yellow-600' :
                                  assignment.status === 'accepted' ? 'text-green-600 border-green-600' :
                                  assignment.status === 'rejected' ? 'text-red-600 border-red-600' :
                                  'text-blue-600 border-blue-600'
                                }`}
                              >
                                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{assignment.tutor_email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{assignment.tutor_phone}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>Assigned: {new Date(assignment.assigned_at).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Updated: {new Date(assignment.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            {assignment.notes && (
                              <div className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">Notes:</span>
                                <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{assignment.notes}</p>
                              </div>
                            )}
                            
                            {assignment.demo_class_id && (
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">Demo Class:</span>
                                <p className="mt-1 p-2 bg-blue-50 rounded text-sm">
                                  Demo class scheduled (ID: {assignment.demo_class_id})
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/tutor/${assignment.tutor_id}`, '_blank')}
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// TutorCard component for displaying tutor information in assignment modal
interface TutorCardProps {
  tutor: LocalTutor;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  application: TutorApplication;
  isMatched?: boolean;
  isNearby?: boolean;
}

function TutorCard({ tutor, isSelected, onSelect, onViewDetails, application, isMatched, isNearby }: TutorCardProps) {
  const getMatchScore = () => {
    let score = 0;
    
    // Subject match (40 points)
    if (application.subject) {
      const tutorSubjects = Array.isArray(tutor.subjects) 
        ? tutor.subjects.join(',').toLowerCase() 
        : (tutor.subjects || '').toLowerCase();
      const tutorPreferredSubjects = Array.isArray(tutor.preferred_subjects) 
        ? tutor.preferred_subjects.join(',').toLowerCase() 
        : (tutor.preferred_subjects || '').toLowerCase();
      
      if (tutorSubjects.includes(application.subject.toLowerCase()) ||
          tutorPreferredSubjects.includes(application.subject.toLowerCase())) {
        score += 40;
      }
    }
    
    // Location match (30 points)
    if (tutor.district === application.tutor_district) {
      score += 30;
    } else if ((tutor.location?.toLowerCase() || '').includes(application.tutor_district.toLowerCase())) {
      score += 20;
    }
    
    // Rating bonus (20 points)
    if (tutor.rating && tutor.rating >= 4.5) {
      score += 20;
    }
    
    // Experience bonus (10 points)
    if (tutor.experience && tutor.experience.includes('year')) {
      score += 10;
    }
    
    return score;
  };

  const matchScore = getMatchScore();

  return (
    <div className={`border rounded-lg p-4 cursor-pointer transition-all 
      ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
      ${isMatched ? 'border-green-200 bg-green-50/50' : ''}
      ${isNearby ? 'border-blue-200 bg-blue-50/50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-lg">{tutor.full_name}</h4>
            {tutor.verified ? (
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                Verified
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                Not Verified
              </Badge>
            )}
            {tutor.premium === 'genius' && (
              <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs">
                Genius
              </Badge>
            )}
            {isMatched && (
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                Best Match
              </Badge>
            )}
            {isNearby && (
              <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                Nearby
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{tutor.district || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>
                {tutor.verified ? (
                  tutor.rating ? `${tutor.rating}/5 (${tutor.total_reviews || 0} reviews)` : 'No rating'
                ) : (
                  'Not Verified'
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{tutor.education || 'Not specified'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">Experience:</span>
              <span>{tutor.experience || 'Not specified'}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Subjects:</span>
            <span className="ml-1">
              {Array.isArray(tutor.subjects) 
                ? tutor.subjects.join(', ') 
                : tutor.subjects || 'Not specified'}
            </span>
          </div>
          
          {tutor.hourly_rate && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Rate:</span>
              <span className="ml-1">৳{tutor.hourly_rate}/hr</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {matchScore > 0 && (
            <div className="text-xs text-gray-500">
              Match: {matchScore}%
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ContactRequests;
