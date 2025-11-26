// import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Badge } from '@/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { useToast } from '@/components/ui/use-toast';
// import { 
//   CheckCircle, 
//   XCircle, 
//   Clock, 
//   Eye, 
//   Users, 
//   Filter, 
//   Search, 
//   MessageCircle,
//   Phone,
//   Mail,
//   MapPin,
//   Calendar,
//   Trash2
// } from 'lucide-react';
// import { 
//   tutorContactService, 
//   TutorContactRequest, 
//   TutorContactRequestStats 
// } from '@/services/tutorContactService';

// const TutorContactRequestsManagement = () => {
//   const { toast } = useToast();
//   const [contactRequests, setContactRequests] = useState<TutorContactRequest[]>([]);
//   const [stats, setStats] = useState<TutorContactRequestStats | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('all');
//   const [selectedRequest, setSelectedRequest] = useState<TutorContactRequest | null>(null);
//   const [adminNotes, setAdminNotes] = useState('');
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');

//   useEffect(() => {
//     fetchContactRequests();
//     fetchStats();
//   }, [activeTab, statusFilter]);

//   const fetchContactRequests = async () => {
//     try {
//       setLoading(true);
//       const response = await tutorContactService.getTutorContactRequests({
//         status: activeTab === 'all' ? undefined : activeTab,
//         search: searchTerm || undefined,
//         limit: 50
//       });
      
//       if (response.success) {
//         setContactRequests(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching contact requests:', error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch contact requests",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await tutorContactService.getTutorContactRequestStats();
//       if (response.success) {
//         setStats(response.data);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const handleStatusUpdate = async (requestId: string, newStatus: string) => {
//     try {
//       setIsProcessing(true);
//       const response = await tutorContactService.updateTutorContactRequestStatus(requestId, {
//         status: newStatus as any,
//         adminNotes: adminNotes
//       });

//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Contact request status updated successfully",
//         });
//         fetchContactRequests();
//         fetchStats();
//         setIsDialogOpen(false);
//         setAdminNotes('');
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//       toast({
//         title: "Error",
//         description: "Failed to update contact request status",
//         variant: "destructive"
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleDelete = async (requestId: string) => {
//     if (!confirm('Are you sure you want to delete this contact request?')) {
//       return;
//     }

//     try {
//       const response = await tutorContactService.deleteTutorContactRequest(requestId);
//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Contact request deleted successfully",
//         });
//         fetchContactRequests();
//         fetchStats();
//       }
//     } catch (error) {
//       console.error('Error deleting contact request:', error);
//       toast({
//         title: "Error",
//         description: "Failed to delete contact request",
//         variant: "destructive"
//       });
//     }
//   };

//   const openDetailsDialog = (request: TutorContactRequest) => {
//     setSelectedRequest(request);
//     setAdminNotes(request.admin_notes || '');
//     setIsDialogOpen(true);
//   };

//   const getStatusBadge = (status: string) => {
//     const statusConfig = {
//       pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
//       contacted: { color: 'bg-blue-100 text-blue-800', icon: Phone },
//       completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
//       rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
//     };

//     const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
//     const Icon = config.icon;

//     return (
//       <Badge className={`${config.color} border-0`}>
//         <Icon className="h-3 w-3 mr-1" />
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </Badge>
//     );
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const filteredRequests = contactRequests.filter(request => {
//     if (searchTerm) {
//       const searchLower = searchTerm.toLowerCase();
//       return (
//         request.contact_name.toLowerCase().includes(searchLower) ||
//         request.contact_phone.includes(searchLower) ||
//         request.tutor_name?.toLowerCase().includes(searchLower) ||
//         request.message.toLowerCase().includes(searchLower)
//       );
//     }
//     return true;
//   });

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <div className="flex items-center gap-3">
//           <MessageCircle className="h-6 w-6 text-blue-600" />
//           <CardTitle>Tutor Contact Requests Management</CardTitle>
//         </div>
//         <CardDescription>
//           Manage and track contact requests from students to tutors
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {/* Stats Cards */}
//           {stats && (
//             <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="text-2xl font-bold">{stats.total}</div>
//                   <div className="text-sm text-gray-600">Total</div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
//                   <div className="text-sm text-gray-600">Pending</div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
//                   <div className="text-sm text-gray-600">Contacted</div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
//                   <div className="text-sm text-gray-600">Completed</div>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardContent className="p-4">
//                   <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
//                   <div className="text-sm text-gray-600">Rejected</div>
//                 </CardContent>
//               </Card>
//             </div>
//           )}

//           {/* Filters */}
//           <div className="flex flex-col sm:flex-row gap-4 mb-6">
//             <div className="flex-1">
//               <div className="relative">
//                 <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                 <Input
//                   placeholder="Search by name, phone, tutor, or message..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <div className="w-full sm:w-48">
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="contacted">Contacted</SelectItem>
//                   <SelectItem value="completed">Completed</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <Button onClick={fetchContactRequests} variant="outline">
//               <Filter className="h-4 w-4 mr-2" />
//               Refresh
//             </Button>
//           </div>

//           {/* Tabs */}
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-5">
//               <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
//               <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
//               <TabsTrigger value="contacted">Contacted ({stats?.contacted || 0})</TabsTrigger>
//               <TabsTrigger value="completed">Completed ({stats?.completed || 0})</TabsTrigger>
//               <TabsTrigger value="rejected">Rejected ({stats?.rejected || 0})</TabsTrigger>
//             </TabsList>

//             <TabsContent value={activeTab} className="mt-6">
//               {loading ? (
//                 <div className="flex justify-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                 </div>
//               ) : filteredRequests.length === 0 ? (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
//                   <p>No contact requests found</p>
//                 </div>
//               ) : (
//                 <div className="border rounded-lg">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Contact Info</TableHead>
//                         <TableHead>Tutor</TableHead>
//                         <TableHead>Message</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Date</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {filteredRequests.map((request) => (
//                         <TableRow key={request.id}>
//                           <TableCell>
//                             <div className="space-y-1">
//                               <div className="font-medium">{request.contact_name}</div>
//                               <div className="flex items-center gap-1 text-sm text-gray-600">
//                                 <Phone className="h-3 w-3" />
//                                 {request.contact_phone}
//                               </div>
//                               {request.contact_email && (
//                                 <div className="flex items-center gap-1 text-sm text-gray-600">
//                                   <Mail className="h-3 w-3" />
//                                   {request.contact_email}
//                                 </div>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="space-y-1">
//                               <div className="font-medium">{request.tutor_name || 'Unknown'}</div>
//                               {request.tutor_district && (
//                                 <div className="flex items-center gap-1 text-sm text-gray-600">
//                                   <MapPin className="h-3 w-3" />
//                                   {request.tutor_district}
//                                 </div>
//                               )}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="max-w-xs">
//                               <p className="text-sm line-clamp-2">{request.message}</p>
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             {getStatusBadge(request.status)}
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-1 text-sm text-gray-600">
//                               <Calendar className="h-3 w-3" />
//                               {formatDate(request.created_at)}
//                             </div>
//                           </TableCell>
//                           <TableCell>
//                             <div className="flex items-center gap-2">
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => openDetailsDialog(request)}
//                               >
//                                 <Eye className="h-4 w-4" />
//                               </Button>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => handleDelete(request.id)}
//                                 className="text-red-600 hover:text-red-700"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </Button>
//                             </div>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </div>

//         {/* Details Dialog */}
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogContent className="max-w-2xl">
//             <DialogHeader>
//               <DialogTitle>Contact Request Details</DialogTitle>
//               <DialogDescription>
//                 Review and manage this contact request
//               </DialogDescription>
//             </DialogHeader>
            
//             {selectedRequest && (
//               <div className="space-y-6">
//                 {/* Contact Information */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Contact Name</h4>
//                     <p className="text-base">{selectedRequest.contact_name}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Phone</h4>
//                     <p className="text-base">{selectedRequest.contact_phone}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Email</h4>
//                     <p className="text-base">{selectedRequest.contact_email || 'Not provided'}</p>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-500">Status</h4>
//                     <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
//                   </div>
//                 </div>

//                 {/* Tutor Information */}
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500 mb-2">Tutor Information</h4>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <h5 className="font-medium">{selectedRequest.tutor_name || 'Unknown'}</h5>
//                         <p className="text-sm text-gray-600">{selectedRequest.tutor_district || 'Location not specified'}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-gray-600">{selectedRequest.tutor_email || 'Email not available'}</p>
//                         <p className="text-sm text-gray-600">{selectedRequest.tutor_phone || 'Phone not available'}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Message */}
//                 <div>
//                   <h4 className="text-sm font-medium text-gray-500 mb-2">Message</h4>
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <p className="text-sm">{selectedRequest.message}</p>
//                   </div>
//                 </div>

//                 {/* Admin Notes */}
//                 <div>
//                   <Label htmlFor="adminNotes">Admin Notes</Label>
//                   <Textarea
//                     id="adminNotes"
//                     value={adminNotes}
//                     onChange={(e) => setAdminNotes(e.target.value)}
//                     placeholder="Add notes about this contact request..."
//                     className="mt-1"
//                     rows={3}
//                   />
//                 </div>

//                 {/* Status Update */}
//                 <div>
//                   <Label>Update Status</Label>
//                   <div className="flex gap-2 mt-2">
//                     <Button
//                       variant={selectedRequest.status === 'contacted' ? 'default' : 'outline'}
//                       size="sm"
//                       onClick={() => handleStatusUpdate(selectedRequest.id, 'contacted')}
//                       disabled={isProcessing}
//                     >
//                       Mark as Contacted
//                     </Button>
//                     <Button
//                       variant={selectedRequest.status === 'completed' ? 'default' : 'outline'}
//                       size="sm"
//                       onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
//                       disabled={isProcessing}
//                     >
//                       Mark as Completed
//                     </Button>
//                     <Button
//                       variant={selectedRequest.status === 'rejected' ? 'default' : 'outline'}
//                       size="sm"
//                       onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
//                       disabled={isProcessing}
//                     >
//                       Reject
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
//                 Close
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </CardContent>
//     </Card>
//   );
// };

// export default TutorContactRequestsManagement;



import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Users, 
  Filter, 
  Search, 
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Trash2
} from 'lucide-react';

// Demo data types
interface TutorContactRequest {
  id: string;
  contact_name: string;
  contact_phone: string;
  contact_email?: string;
  tutor_name: string;
  tutor_email?: string;
  tutor_phone?: string;
  tutor_district?: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

interface TutorContactRequestStats {
  total: number;
  pending: number;
  contacted: number;
  completed: number;
  rejected: number;
}

const TutorContactRequestsManagement = () => {
  const { toast } = useToast();
  
  // Demo data
  const demoContactRequests: TutorContactRequest[] = [
    {
      id: '1',
      contact_name: 'John Smith',
      contact_phone: '+8801712345678',
      contact_email: 'john.smith@email.com',
      tutor_name: 'Dr. Sarah Johnson',
      tutor_email: 'sarah.johnson@tutor.com',
      tutor_phone: '+8801812345678',
      tutor_district: 'Dhaka',
      message: 'I need help with advanced mathematics for my university entrance exam. Looking for weekly sessions.',
      status: 'pending',
      admin_notes: 'New request - needs immediate attention',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      contact_name: 'Emma Wilson',
      contact_phone: '+8801723456789',
      contact_email: 'emma.wilson@email.com',
      tutor_name: 'Prof. Michael Brown',
      tutor_email: 'michael.brown@tutor.com',
      tutor_phone: '+8801823456789',
      tutor_district: 'Chittagong',
      message: 'Looking for physics tutoring for my son who is in grade 11. Prefer weekend sessions.',
      status: 'contacted',
      admin_notes: 'Contacted parent, waiting for confirmation',
      created_at: '2024-01-14T14:45:00Z'
    },
    {
      id: '3',
      contact_name: 'Alex Chen',
      contact_phone: '+8801734567890',
      tutor_name: 'Dr. Lisa Anderson',
      tutor_email: 'lisa.anderson@tutor.com',
      tutor_district: 'Sylhet',
      message: 'Need chemistry tutoring for O-level exams. Available evenings only.',
      status: 'completed',
      admin_notes: 'Successfully connected with tutor',
      created_at: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      contact_name: 'Maria Garcia',
      contact_phone: '+8801745678901',
      contact_email: 'maria.garcia@email.com',
      tutor_name: 'Dr. Robert Williams',
      tutor_email: 'robert.williams@tutor.com',
      tutor_district: 'Rajshahi',
      message: 'Looking for English literature tutoring for A-levels. Need help with essay writing.',
      status: 'rejected',
      admin_notes: 'Tutor not available in requested location',
      created_at: '2024-01-12T16:20:00Z'
    },
    {
      id: '5',
      contact_name: 'David Lee',
      contact_phone: '+8801756789012',
      tutor_name: 'Prof. Michael Brown',
      tutor_district: 'Dhaka',
      message: 'Need help with calculus and advanced mathematics for engineering entrance exam.',
      status: 'pending',
      created_at: '2024-01-11T11:00:00Z'
    },
    {
      id: '6',
      contact_name: 'Sophia Martinez',
      contact_phone: '+8801767890123',
      contact_email: 'sophia.martinez@email.com',
      tutor_name: 'Dr. Sarah Johnson',
      tutor_district: 'Khulna',
      message: 'Looking for biology tutoring for medical school entrance. Need comprehensive coverage.',
      status: 'contacted',
      admin_notes: 'Scheduled call for tomorrow',
      created_at: '2024-01-10T13:45:00Z'
    },
    {
      id: '7',
      contact_name: 'James Wilson',
      contact_phone: '+8801778901234',
      tutor_name: 'Dr. Lisa Anderson',
      tutor_district: 'Barisal',
      message: 'Computer science tutoring needed for university students. Focus on programming.',
      status: 'completed',
      created_at: '2024-01-09T15:30:00Z'
    },
    {
      id: '8',
      contact_name: 'Olivia Taylor',
      contact_phone: '+8801789012345',
      contact_email: 'olivia.taylor@email.com',
      tutor_name: 'Dr. Robert Williams',
      tutor_district: 'Rangpur',
      message: 'Mathematics tutoring for grade 9 student. Struggling with algebra and geometry.',
      status: 'pending',
      created_at: '2024-01-08T10:15:00Z'
    }
  ];

  const demoStats: TutorContactRequestStats = {
    total: 8,
    pending: 3,
    contacted: 2,
    completed: 2,
    rejected: 1
  };

  // State
  const [contactRequests, setContactRequests] = useState<TutorContactRequest[]>(demoContactRequests);
  const [stats, setStats] = useState<TutorContactRequestStats>(demoStats);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<TutorContactRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simulate API calls
  const fetchContactRequests = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContactRequests(demoContactRequests);
      setStats(demoStats);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch contact requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(demoStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      setIsProcessing(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Update local state
      setContactRequests(prev => 
        prev.map(request => 
          request.id === requestId 
            ? { 
                ...request, 
                status: newStatus as any,
                admin_notes: adminNotes 
              }
            : request
        )
      );

      // Update stats
      setStats(prev => {
        if (!prev) return prev;
        const oldStatus = selectedRequest?.status;
        const newStats = { ...prev };
        
        // Decrement old status count
        if (oldStatus && newStats[oldStatus as keyof TutorContactRequestStats] > 0) {
          newStats[oldStatus as keyof TutorContactRequestStats]--;
        }
        
        // Increment new status count
        if (newStats[newStatus as keyof TutorContactRequestStats] !== undefined) {
          newStats[newStatus as keyof TutorContactRequestStats]++;
        }
        
        return newStats;
      });

      toast({
        title: "Success",
        description: "Contact request status updated successfully",
      });
      setIsDialogOpen(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update contact request status",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this contact request?')) {
      return;
    }

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update local state
      const deletedRequest = contactRequests.find(req => req.id === requestId);
      setContactRequests(prev => prev.filter(request => request.id !== requestId));

      // Update stats
      if (deletedRequest && stats) {
        setStats(prev => ({
          ...prev!,
          total: prev!.total - 1,
          [deletedRequest.status]: prev![deletedRequest.status as keyof TutorContactRequestStats] - 1
        }));
      }

      toast({
        title: "Success",
        description: "Contact request deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting contact request:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact request",
        variant: "destructive"
      });
    }
  };

  const openDetailsDialog = (request: TutorContactRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || '');
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      contacted: { color: 'bg-blue-100 text-blue-800', icon: Phone },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
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

  // Filter requests based on active tab and search term
  const filteredRequests = contactRequests.filter(request => {
    // Tab filter
    if (activeTab !== 'all' && request.status !== activeTab) {
      return false;
    }
    
    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.contact_name.toLowerCase().includes(searchLower) ||
        request.contact_phone.includes(searchLower) ||
        request.tutor_name?.toLowerCase().includes(searchLower) ||
        request.message.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  useEffect(() => {
    fetchContactRequests();
    fetchStats();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-blue-600" />
          <CardTitle>Tutor Contact Requests Management</CardTitle>
        </div>
        <CardDescription>
          Manage and track contact requests from students to tutors
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
                  <div className="text-sm text-gray-600">Total</div>
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
                  <div className="text-2xl font-bold text-blue-600">{stats.contacted}</div>
                  <div className="text-sm text-gray-600">Contacted</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, tutor, or message..."
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
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={fetchContactRequests} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({stats?.total || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats?.pending || 0})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({stats?.contacted || 0})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({stats?.completed || 0})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats?.rejected || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No contact requests found</p>
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
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{request.contact_name}</div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Phone className="h-3 w-3" />
                                {request.contact_phone}
                              </div>
                              {request.contact_email && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Mail className="h-3 w-3" />
                                  {request.contact_email}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{request.tutor_name || 'Unknown'}</div>
                              {request.tutor_district && (
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <MapPin className="h-3 w-3" />
                                  {request.tutor_district}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm line-clamp-2">{request.message}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              {formatDate(request.created_at)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetailsDialog(request)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(request.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Contact Request Details</DialogTitle>
              <DialogDescription>
                Review and manage this contact request
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contact Name</h4>
                    <p className="text-base font-medium">{selectedRequest.contact_name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="text-base">{selectedRequest.contact_phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="text-base">{selectedRequest.contact_email || 'Not provided'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </div>

                {/* Tutor Information */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Tutor Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium">{selectedRequest.tutor_name || 'Unknown'}</h5>
                        <p className="text-sm text-gray-600">{selectedRequest.tutor_district || 'Location not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{selectedRequest.tutor_email || 'Email not available'}</p>
                        <p className="text-sm text-gray-600">{selectedRequest.tutor_phone || 'Phone not available'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed">{selectedRequest.message}</p>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <Label htmlFor="adminNotes">Admin Notes</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add notes about this contact request..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {/* Status Update */}
                <div>
                  <Label>Update Status</Label>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      variant={selectedRequest.status === 'contacted' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'contacted')}
                      disabled={isProcessing}
                    >
                      Mark as Contacted
                    </Button>
                    <Button
                      variant={selectedRequest.status === 'completed' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'completed')}
                      disabled={isProcessing}
                    >
                      Mark as Completed
                    </Button>
                    <Button
                      variant={selectedRequest.status === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStatusUpdate(selectedRequest.id, 'rejected')}
                      disabled={isProcessing}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default TutorContactRequestsManagement;