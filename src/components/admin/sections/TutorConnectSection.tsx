// 'use client';

// import { useState, useEffect, useRef, useCallback } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Textarea } from "@/components/ui/textarea";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Pencil, Trash2, Phone, Mail, User, Calendar, Clock, AlertCircle, Eye, Filter, Search, CheckCircle, XCircle, MoreHorizontal, UserPlus, Users, MapPin, Star, BookOpen, GraduationCap, RefreshCw } from "lucide-react";
// import { tutorContactRequestsService, TutorContactRequest } from '@/services/tutorContactRequestsService';
// import { tutorContactAssignmentService, TutorContactAssignment, DemoClassData } from '@/services/tutorContactAssignmentService';
// import tutorService from '@/services/tutorService';
// import { formatDistanceToNow } from 'date-fns';
// import { useToast } from "@/components/ui/use-toast";

// // Use the imported Tutor interface from tutorService
// type LocalTutor = import('@/services/tutorService').Tutor;

// interface TutorFilter {
//   subject?: string;
//   district?: string;
//   minRating?: number;
//   maxPrice?: number;
//   gender?: string;
//   education?: string;
//   availability?: string;
//   sortBy?: string;
//   sortOrder?: string;
// }

// interface RealTimeConfig {
//   enabled: boolean;
//   interval: number;
//   lastUpdate: Date;
// }

// export function TutorConnectSection() {
//   const [contactRequests, setContactRequests] = useState<TutorContactRequest[]>([]);
//   const [filteredRequests, setFilteredRequests] = useState<TutorContactRequest[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedRequest, setSelectedRequest] = useState<TutorContactRequest | null>(null);
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [searchQuery, setSearchQuery] = useState('');
  
//   // Tutor assignment states
//   const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
//   const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
//   const [tutors, setTutors] = useState<LocalTutor[]>([]);
//   const [filteredTutors, setFilteredTutors] = useState<LocalTutor[]>([]);
//   const [selectedTutor, setSelectedTutor] = useState<string>('');
//   const [assignmentNotes, setAssignmentNotes] = useState('');
//   const [isAssigning, setIsAssigning] = useState(false);
//   const [createDemoClass, setCreateDemoClass] = useState(false);
//   const [demoDate, setDemoDate] = useState('');
//   const [demoDuration, setDemoDuration] = useState(30);
//   const [demoNotes, setDemoNotes] = useState('');
//   const [assignments, setAssignments] = useState<TutorContactAssignment[]>([]);
  
//   // Real-time functionality
//   const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
//     enabled: true,
//     interval: 30000, // 30 seconds
//     lastUpdate: new Date()
//   });
//   const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
//   // Enhanced tutor assignment
//   const [tutorFilters, setTutorFilters] = useState<TutorFilter>({});
//   const [isLoadingTutors, setIsLoadingTutors] = useState(false);
//   const [selectedTutorDetails, setSelectedTutorDetails] = useState<LocalTutor | null>(null);
//   const [showTutorDetails, setShowTutorDetails] = useState(false);
//   const [assignmentTab, setAssignmentTab] = useState<'all' | 'matched' | 'nearby'>('all');
  
//   const { toast } = useToast();

//   // Fetch contact requests with real-time updates
//   const fetchContactRequests = useCallback(async (isRealTimeUpdate = false) => {
//     try {
//       if (!isRealTimeUpdate) {
//         setLoading(true);
//       }
      
//       const response = await tutorContactRequestsService.getAllContactRequests();
//       if (response.success) {
//         setContactRequests(response.data);
//         setFilteredRequests(response.data);
//         setError(null);
        
//         if (isRealTimeUpdate) {
//           setRealTimeConfig(prev => ({ ...prev, lastUpdate: new Date() }));
//         }
//       } else {
//         if (!isRealTimeUpdate) {
//           setError('Failed to fetch contact requests');
//           toast({
//             variant: "destructive",
//             title: "Error",
//             description: 'Failed to fetch contact requests',
//           });
//         }
//       }
//     } catch (err: any) {
//       if (!isRealTimeUpdate) {
//         setError(err.message || 'Failed to fetch contact requests');
//         toast({
//           variant: "destructive",
//           title: "Error",
//           description: err.message || 'Failed to fetch contact requests',
//         });
//       }
//     } finally {
//       if (!isRealTimeUpdate) {
//         setLoading(false);
//       }
//     }
//   }, [toast]);

//   // Fetch tutors for assignment with advanced filtering
//   const fetchTutors = useCallback(async (filters?: TutorFilter) => {
//     try {
//       setIsLoadingTutors(true);
      
//       const response = await tutorService.getAllTutors(filters);
//       if (response.success && response.data) {
//         // Transform the data to ensure all required fields are present
//         const transformedTutors = response.data.map((tutor: any) => ({
//           id: tutor.id,
//           tutor_id: tutor.tutor_id || '',
//           full_name: tutor.full_name || 'Unknown Tutor',
//           location: tutor.location || '',
//           district: tutor.district || '',
//           avatar_url: tutor.avatar_url || null,
//           created_at: tutor.created_at || new Date().toISOString(),
//           gender: tutor.gender || null,
//           bio: tutor.bio || null,
//           education: tutor.education || null,
//           experience: tutor.experience || null,
//           subjects: tutor.subjects || '',
//           hourly_rate: tutor.hourly_rate ? parseFloat(tutor.hourly_rate) : undefined,
//           rating: tutor.rating ? parseFloat(tutor.rating) : 0,
//           total_reviews: tutor.total_reviews ? parseInt(tutor.total_reviews) : 0,
//           total_views: tutor.total_views || 0,
//           availability: tutor.availability || null,
//           premium: tutor.premium || null,
//           verified: tutor.verified || 0,
//           qualification: tutor.qualification || null,
//           tutoring_experience: tutor.tutoring_experience || null,
//           university_name: tutor.university_name || null,
//           department_name: tutor.department_name || null,
//           expected_salary: tutor.expected_salary ? parseFloat(tutor.expected_salary) : undefined,
//           days_per_week: tutor.days_per_week || null,
//           preferred_tutoring_style: tutor.preferred_tutoring_style || null,
//           educational_qualifications: tutor.educational_qualifications || null,
//           preferred_subjects: tutor.preferred_subjects || null,
//           preferred_class: tutor.preferred_class || null,
//           preferred_medium: tutor.preferred_medium || null,
//           preferred_time: tutor.preferred_time || null,
//           religion: tutor.religion || null,
//           nationality: tutor.nationality || null
//         }));
        
//         setTutors(transformedTutors as LocalTutor[]);
//         setFilteredTutors(transformedTutors as LocalTutor[]);
//       } else {
//         toast({
//           title: "Error",
//           description: "Failed to fetch tutors",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching tutors:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch tutors",
//         variant: "destructive"
//       });
//     } finally {
//       setIsLoadingTutors(false);
//     }
//   }, [toast]);

//   // Fetch data on component mount and set up real-time updates
//   useEffect(() => {
//     const initializeData = async () => {
//       try {
//         await Promise.all([
//           fetchContactRequests(),
//           fetchTutors()
//         ]);
//       } catch (error) {
//         console.error('Error initializing data:', error);
//       }
//     };
    
//     initializeData();
    
//     // Set up real-time updates if enabled
//     if (realTimeConfig.enabled) {
//       realTimeIntervalRef.current = setInterval(() => {
//         fetchContactRequests(true);
//       }, realTimeConfig.interval);
//     }
    
//     return () => {
//       if (realTimeIntervalRef.current) {
//         clearInterval(realTimeIntervalRef.current);
//       }
//     };
//   }, [fetchContactRequests, fetchTutors, realTimeConfig.enabled, realTimeConfig.interval]);

//   // Filter requests based on search term and status
//   useEffect(() => {
//     let filtered = [...contactRequests];
    
//     // Apply search filter
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(request => 
//         request.full_name.toLowerCase().includes(query) ||
//         request.phone_number.includes(query) ||
//         (request.tutor_name && request.tutor_name.toLowerCase().includes(query)) ||
//         (request.details && request.details.toLowerCase().includes(query))
//       );
//     }
    
//     // Apply status filter
//     if (statusFilter !== 'all') {
//       filtered = filtered.filter(request => request.status === statusFilter);
//     }
    
//     setFilteredRequests(filtered);
//   }, [searchQuery, statusFilter, contactRequests]);

//   // Handle status update
//   const handleStatusUpdate = async () => {
//     if (!selectedRequest) return;
    
//     try {
//       await tutorContactRequestsService.updateContactRequestStatus(
//         selectedRequest.id,
//         selectedRequest.status,
//         selectedRequest.details ?? undefined
//       );
      
//       setContactRequests(prevRequests =>
//         prevRequests.map(req =>
//           req.id === selectedRequest.id ? selectedRequest : req
//         )
//       );
      
//       setIsEditDialogOpen(false);
//       toast({
//         title: "Request Updated",
//         description: `Contact request updated successfully`,
//       });
//     } catch (err: any) {
//       toast({
//         variant: "destructive",
//         title: "Update Failed",
//         description: err.message || 'Failed to update request',
//       });
//     }
//   };

//   // Handle delete
//   const handleDelete = async () => {
//     if (!selectedRequest) return;
    
//     try {
//       await tutorContactRequestsService.deleteContactRequest(selectedRequest.id);
      
//       setContactRequests(prevRequests =>
//         prevRequests.filter(req => req.id !== selectedRequest.id)
//       );
      
//       setIsDeleteDialogOpen(false);
//       toast({
//         title: "Request Deleted",
//         description: "Contact request has been deleted successfully",
//       });
//     } catch (err: any) {
//       toast({
//         variant: "destructive",
//         title: "Delete Failed",
//         description: err.message || 'Failed to delete contact request',
//       });
//     }
//   };

//   // Filter tutors based on request requirements
//   const filterTutorsForRequest = useCallback((request: TutorContactRequest) => {
//     const filters: TutorFilter = {
//       sortBy: 'rating',
//       sortOrder: 'desc'
//     };
    
//     return filters;
//   }, []);

//   // Get matched tutors for a specific request
//   const getMatchedTutors = useCallback((request: TutorContactRequest) => {
//     return tutors.filter(tutor => {
//       // Check if tutor has good rating
//       const ratingMatch = tutor.rating && tutor.rating >= 4.0;
      
//       // Check if tutor is verified
//       const verifiedMatch = tutor.verified;
      
//       return ratingMatch && verifiedMatch;
//     });
//   }, [tutors]);

//   // Get nearby tutors (same district if available)
//   const getNearbyTutors = useCallback((request: TutorContactRequest) => {
//     return tutors.filter(tutor => 
//       tutor.district && tutor.district.length > 0
//     );
//   }, [tutors]);

//   // Open assign tutor modal with enhanced features
//   const openAssignTutorModal = async (request: TutorContactRequest) => {
//     setSelectedRequest(request);
//     setSelectedTutor('');
//     setAssignmentNotes('');
//     setCreateDemoClass(false);
//     setDemoDate('');
//     setDemoDuration(30);
//     setDemoNotes('');
//     setAssignmentTab('all');
    
//     // Fetch tutors with filters for this specific request
//     const requestFilters = filterTutorsForRequest(request);
//     try {
//       await fetchTutors(requestFilters);
//     } catch (error) {
//       console.error('Error fetching filtered tutors, trying without filters:', error);
//       // Fallback to fetch all tutors if filtered request fails
//       await fetchTutors();
//     }
    
//     setShowAssignTutorModal(true);
//   };

//   // Handle tutor assignment
//   const handleAssignTutor = async () => {
//     if (!selectedRequest || !selectedTutor) {
//       toast({
//         title: "Error",
//         description: "Please select a tutor",
//         variant: "destructive"
//       });
//       return;
//     }

//     // Validate demo class data if creating one
//     if (createDemoClass && !demoDate) {
//       toast({
//         title: "Error",
//         description: "Please select a demo class date",
//         variant: "destructive"
//       });
//       return;
//     }

//     setIsAssigning(true);
//     try {
//       const demoClassData = createDemoClass ? {
//         createDemo: true,
//         requestedDate: demoDate,
//         duration: demoDuration,
//         notes: demoNotes
//       } : undefined;

//       const response = await tutorContactAssignmentService.assignTutor(
//         selectedRequest.id.toString(),
//         selectedTutor,
//         assignmentNotes,
//         demoClassData
//       );

//       if (response.success) {
//         toast({
//           title: "Success",
//           description: createDemoClass 
//             ? "Tutor assigned successfully with demo class" 
//             : "Tutor assigned successfully",
//         });
//         setShowAssignTutorModal(false);
//         // Refresh the requests to get updated assignments
//         await fetchContactRequests();
//       } else {
//         toast({
//           title: "Error",
//           description: response.message || "Failed to assign tutor",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Error assigning tutor:", error);
//       toast({
//         title: "Error",
//         description: "Failed to assign tutor",
//         variant: "destructive"
//       });
//     } finally {
//       setIsAssigning(false);
//     }
//   };

//   // View tutor assignments
//   const viewAssignments = async (request: TutorContactRequest) => {
//     setSelectedRequest(request);
//     setLoading(true);
//     try {
//       const response = await tutorContactAssignmentService.getContactRequestAssignments(request.id.toString());
//       if (response.success) {
//         setAssignments(response.data);
//       } else {
//         toast({
//           title: "Error",
//           description: "Failed to fetch tutor assignments",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching assignments:", error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch tutor assignments",
//         variant: "destructive"
//       });
//     } finally {
//       setLoading(false);
//       setShowAssignmentsModal(true);
//     }
//   };

//   // Update assignment status
//   const updateAssignmentStatus = async (assignmentId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed') => {
//     if (!selectedRequest) return;
    
//     try {
//       const response = await tutorContactAssignmentService.updateAssignmentStatus(
//         selectedRequest.id.toString(),
//         assignmentId,
//         status
//       );

//       if (response.success) {
//         toast({
//           title: "Success",
//           description: `Assignment status updated to ${status}`,
//         });
//         // Update local state
//         setAssignments(prevAssignments => 
//           prevAssignments.map(assignment => 
//             assignment.id === assignmentId ? { ...assignment, status } : assignment
//           )
//         );
//       } else {
//         toast({
//           title: "Error",
//           description: response.message || "Failed to update assignment status",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Error updating assignment status:", error);
//       toast({
//         title: "Error",
//         description: "Failed to update assignment status",
//         variant: "destructive"
//       });
//     }
//   };

//   // Delete assignment
//   const deleteAssignment = async (assignmentId: string) => {
//     if (!selectedRequest) return;
    
//     if (!confirm("Are you sure you want to delete this assignment?")) return;
    
//     try {
//       const response = await tutorContactAssignmentService.deleteAssignment(
//         selectedRequest.id.toString(),
//         assignmentId
//       );

//       if (response.success) {
//         toast({
//           title: "Success",
//           description: "Assignment deleted successfully",
//         });
//         // Update local state
//         setAssignments(prevAssignments => 
//           prevAssignments.filter(assignment => assignment.id !== assignmentId)
//         );
//       } else {
//         toast({
//           title: "Error",
//           description: response.message || "Failed to delete assignment",
//           variant: "destructive"
//         });
//       }
//     } catch (error) {
//       console.error("Error deleting assignment:", error);
//       toast({
//         title: "Error",
//         description: "Failed to delete assignment",
//         variant: "destructive"
//       });
//     }
//   };

//   // View tutor details
//   const viewTutorDetails = async (tutorId: string) => {
//     try {
//       const response = await tutorService.getTutorById(tutorId);
//       if (response.success) {
//         setSelectedTutorDetails(response.data);
//         setShowTutorDetails(true);
//       }
//     } catch (error) {
//       console.error('Error fetching tutor details:', error);
//       toast({
//         title: "Error",
//         description: "Failed to fetch tutor details",
//         variant: "destructive"
//       });
//     }
//   };

//   // Manual refresh function
//   const handleManualRefresh = async () => {
//     try {
//       await Promise.all([
//         fetchContactRequests(),
//         fetchTutors()
//       ]);
//       toast({
//         title: "Success",
//         description: "Data refreshed successfully",
//       });
//     } catch (error) {
//       console.error('Error refreshing data:', error);
//       toast({
//         title: "Error",
//         description: "Failed to refresh data",
//         variant: "destructive"
//       });
//     }
//   };

//   // Toggle real-time updates
//   const toggleRealTimeUpdates = () => {
//     setRealTimeConfig(prev => {
//       const newConfig = { ...prev, enabled: !prev.enabled };
      
//       if (newConfig.enabled) {
//         realTimeIntervalRef.current = setInterval(() => {
//           fetchContactRequests(true);
//         }, newConfig.interval);
//       } else {
//         if (realTimeIntervalRef.current) {
//           clearInterval(realTimeIntervalRef.current);
//           realTimeIntervalRef.current = null;
//         }
//       }
      
//       return newConfig;
//     });
//   };

//   // Get status badge color
//   const getStatusBadgeColor = (status: string) => {
//     switch (status) {
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
//       case 'contacted':
//         return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
//       case 'completed':
//         return 'bg-green-100 text-green-800 hover:bg-green-200';
//       case 'rejected':
//         return 'bg-red-100 text-red-800 hover:bg-red-200';
//       default:
//         return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
//         <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
//           <div>
//             <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tutor Connect Requests</h2>
//             <p className="text-white/90 mt-1">Manage contact requests from students to tutors</p>
//             {realTimeConfig.enabled && (
//               <div className="flex items-center gap-2 mt-2 text-white/80">
//                 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
//                 <span className="text-sm">Real-time updates enabled</span>
//                 <span className="text-xs">• Last updated: {realTimeConfig.lastUpdate.toLocaleTimeString()}</span>
//               </div>
//             )}
//           </div>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={toggleRealTimeUpdates}
//               className="bg-white/10 border-white/20 text-white hover:bg-white/20"
//             >
//               <RefreshCw className={`h-4 w-4 mr-2 ${realTimeConfig.enabled ? 'animate-spin' : ''}`} />
//               {realTimeConfig.enabled ? 'Disable' : 'Enable'} Real-time
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleManualRefresh}
//               className="bg-white/10 border-white/20 text-white hover:bg-white/20"
//             >
//               <RefreshCw className="h-4 w-4 mr-2" />
//               Refresh
//             </Button>
//           </div>
//         </div>
//       </div>
      
//       <Card>
//         <CardHeader className="pb-3">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div>
//               <CardTitle>All Contact Requests</CardTitle>
//               <CardDescription>View and manage contact requests from students to tutors</CardDescription>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-2">
//               <div className="relative">
//                 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   type="search"
//                   placeholder="Search requests..."
//                   className="pl-8 w-full sm:w-[250px]"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger className="w-full sm:w-[150px]">
//                   <div className="flex items-center gap-2">
//                     <Filter className="h-4 w-4" />
//                     <SelectValue placeholder="Filter by status" />
//                   </div>
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Statuses</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="contacted">Contacted</SelectItem>
//                   <SelectItem value="completed">Completed</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="flex justify-center items-center py-8">
//               <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : error ? (
//             <div className="flex justify-center items-center py-8">
//               <div className="flex items-center gap-2 text-red-500">
//                 <AlertCircle size={20} />
//                 <p>{error}</p>
//               </div>
//             </div>
//           ) : filteredRequests.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-muted-foreground">No contact requests found</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>Student Name</TableHead>
//                     <TableHead>Phone</TableHead>
//                     <TableHead>Tutor</TableHead>
//                     <TableHead>Status</TableHead>
//                     <TableHead>Date</TableHead>
//                     <TableHead>Assignments</TableHead>
//                     <TableHead className="text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredRequests.map((request) => (
//                     <TableRow key={request.id}>
//                       <TableCell className="font-medium">
//                         <div>
//                           <div className="font-semibold">{request.full_name}</div>
//                           {request.details && (
//                             <div className="text-xs text-muted-foreground truncate max-w-[200px]">
//                               {request.details}
//                             </div>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell>{request.phone_number}</TableCell>
//                       <TableCell>{request.tutor_name || 'Unknown'}</TableCell>
//                       <TableCell>
//                         <Badge className={getStatusBadgeColor(request.status)}>
//                           {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
//                       </TableCell>
//                       <TableCell>
//                         <Badge variant="outline" className="flex items-center gap-1">
//                           <Users className="h-3 w-3" />
//                           Assign Tutor
//                         </Badge>
//                       </TableCell>
//                       <TableCell>
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                             <DropdownMenuItem onClick={() => {
//                               setSelectedRequest(request);
//                               setIsEditDialogOpen(true);
//                             }}>
//                               <Pencil className="h-4 w-4 mr-2" />
//                               Edit Request
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => openAssignTutorModal(request)}>
//                               <UserPlus className="h-4 w-4 mr-2" />
//                               Assign Tutor
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => viewAssignments(request)}>
//                               <Users className="h-4 w-4 mr-2" />
//                               View Assignments
//                             </DropdownMenuItem>
//                             <DropdownMenuSeparator />
//                             <DropdownMenuItem 
//                               onClick={() => {
//                                 setSelectedRequest(request);
//                                 setIsDeleteDialogOpen(true);
//                               }}
//                               className="text-destructive focus:text-destructive"
//                             >
//                               <Trash2 className="h-4 w-4 mr-2" />
//                               Delete Request
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Edit Dialog */}
//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent className="sm:max-w-[500px]">
//           <DialogHeader>
//             <DialogTitle>Edit Contact Request</DialogTitle>
//             <DialogDescription>
//               Update the status and details of this contact request.
//             </DialogDescription>
//           </DialogHeader>
//           {selectedRequest && (
//             <div className="space-y-4 py-4">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <User className="h-4 w-4 text-muted-foreground" />
//                     <Label>Student Name</Label>
//                   </div>
//                   <p className="text-sm font-medium">{selectedRequest.full_name}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <Phone className="h-4 w-4 text-muted-foreground" />
//                     <Label>Phone Number</Label>
//                   </div>
//                   <p className="text-sm font-medium">{selectedRequest.phone_number}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <User className="h-4 w-4 text-muted-foreground" />
//                     <Label>Tutor</Label>
//                   </div>
//                   <p className="text-sm font-medium">{selectedRequest.tutor_name || 'Unknown'}</p>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-muted-foreground" />
//                     <Label>Request Date</Label>
//                   </div>
//                   <p className="text-sm font-medium">
//                     {new Date(selectedRequest.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="details">Details</Label>
//                 <Textarea
//                   id="details"
//                   value={selectedRequest.details || ''}
//                   onChange={(e) => {
//                     setSelectedRequest({
//                       ...selectedRequest,
//                       details: e.target.value,
//                     });
//                   }}
//                   className="h-20"
//                   placeholder="Enter request details..."
//                 />
//               </div>
              
//               <div className="space-y-2">
//                 <Label htmlFor="status">Status</Label>
//                 <Select
//                   value={selectedRequest.status}
//                   onValueChange={(value: any) => {
//                     setSelectedRequest({
//                       ...selectedRequest,
//                       status: value,
//                     });
//                   }}
//                 >
//                   <SelectTrigger id="status">
//                     <SelectValue placeholder="Select status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="pending">Pending</SelectItem>
//                     <SelectItem value="contacted">Contacted</SelectItem>
//                     <SelectItem value="completed">Completed</SelectItem>
//                     <SelectItem value="rejected">Rejected</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           )}
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button onClick={handleStatusUpdate}>Save Changes</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//         <DialogContent className="sm:max-w-[425px]">
//           <DialogHeader>
//             <DialogTitle>Confirm Deletion</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete this contact request? This action cannot be undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={handleDelete}>
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Enhanced Assign Tutor Modal */}
//       <Dialog open={showAssignTutorModal} onOpenChange={setShowAssignTutorModal}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Assign Tutor - Advanced Selection</DialogTitle>
//             <DialogDescription>
//               Select the best tutor for this contact request with advanced filtering and matching.
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedRequest && (
//             <div className="space-y-6">
//               {/* Request Summary */}
//               <div className="bg-muted/20 rounded-lg p-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <div>
//                     <h3 className="font-semibold text-lg">{selectedRequest.full_name}</h3>
//                     <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
//                       <Phone className="h-4 w-4" />
//                       <span>{selectedRequest.phone_number}</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
//                   <div>
//                     <span className="text-muted-foreground">Tutor:</span>
//                     <p className="font-medium">{selectedRequest.tutor_name || 'Unknown'}</p>
//                   </div>
//                   <div>
//                     <span className="text-muted-foreground">Status:</span>
//                     <p className="font-medium">{selectedRequest.status}</p>
//                   </div>
//                   <div>
//                     <span className="text-muted-foreground">Date:</span>
//                     <p className="font-medium">{formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}</p>
//                   </div>
//                 </div>
//                 {selectedRequest.details && (
//                   <div className="mt-3">
//                     <span className="text-muted-foreground">Details:</span>
//                     <p className="text-sm mt-1">{selectedRequest.details}</p>
//                   </div>
//                 )}
//               </div>

//               {/* Tutor Selection Tabs */}
//               <Tabs value={assignmentTab} onValueChange={(value) => setAssignmentTab(value as 'all' | 'matched' | 'nearby')}>
//                 <TabsList className="grid w-full grid-cols-3">
//                   <TabsTrigger value="all">All Tutors ({tutors.length})</TabsTrigger>
//                   <TabsTrigger value="matched">Best Matches ({getMatchedTutors(selectedRequest).length})</TabsTrigger>
//                   <TabsTrigger value="nearby">Nearby ({getNearbyTutors(selectedRequest).length})</TabsTrigger>
//                 </TabsList>

//                 <TabsContent value="all" className="space-y-4">
//                   <div className="grid gap-4 max-h-96 overflow-y-auto">
//                     {isLoadingTutors ? (
//                       <div className="flex justify-center py-8">
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                       </div>
//                     ) : tutors.length === 0 ? (
//                       <div className="text-center py-8 text-muted-foreground">
//                         <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
//                         <p>No tutors available</p>
//                       </div>
//                     ) : (
//                       tutors.map((tutor) => (
//                         <TutorCard
//                           key={tutor.id}
//                           tutor={tutor}
//                           isSelected={selectedTutor === tutor.id}
//                           onSelect={() => setSelectedTutor(tutor.id)}
//                           onViewDetails={() => viewTutorDetails(tutor.id)}
//                           request={selectedRequest}
//                         />
//                       ))
//                     )}
//                   </div>
//                 </TabsContent>

//                 <TabsContent value="matched" className="space-y-4">
//                   <div className="grid gap-4 max-h-96 overflow-y-auto">
//                     {getMatchedTutors(selectedRequest).length === 0 ? (
//                       <div className="text-center py-8 text-muted-foreground">
//                         <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
//                         <p>No perfect matches found</p>
//                         <p className="text-sm">Try adjusting the filters or check all tutors</p>
//                       </div>
//                     ) : (
//                       getMatchedTutors(selectedRequest).map((tutor) => (
//                         <TutorCard
//                           key={tutor.id}
//                           tutor={tutor}
//                           isSelected={selectedTutor === tutor.id}
//                           onSelect={() => setSelectedTutor(tutor.id)}
//                           onViewDetails={() => viewTutorDetails(tutor.id)}
//                           request={selectedRequest}
//                           isMatched={true}
//                         />
//                       ))
//                     )}
//                   </div>
//                 </TabsContent>

//                 <TabsContent value="nearby" className="space-y-4">
//                   <div className="grid gap-4 max-h-96 overflow-y-auto">
//                     {getNearbyTutors(selectedRequest).length === 0 ? (
//                       <div className="text-center py-8 text-muted-foreground">
//                         <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
//                         <p>No tutors in this area</p>
//                         <p className="text-sm">Try expanding the search area</p>
//                       </div>
//                     ) : (
//                       getNearbyTutors(selectedRequest).map((tutor) => (
//                         <TutorCard
//                           key={tutor.id}
//                           tutor={tutor}
//                           isSelected={selectedTutor === tutor.id}
//                           onSelect={() => setSelectedTutor(tutor.id)}
//                           onViewDetails={() => viewTutorDetails(tutor.id)}
//                           request={selectedRequest}
//                           isNearby={true}
//                         />
//                       ))
//                     )}
//                   </div>
//                 </TabsContent>
//               </Tabs>

//               {/* Assignment Details */}
//               {selectedTutor && (
//                 <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
//                   <h4 className="font-medium">Assignment Details</h4>
                  
//                   <div className="space-y-2">
//                     <Label htmlFor="notes">Notes (Optional)</Label>
//                     <Textarea
//                       id="notes"
//                       placeholder="Add any notes about this assignment"
//                       value={assignmentNotes}
//                       onChange={(e) => setAssignmentNotes(e.target.value)}
//                       rows={3}
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id="createDemo"
//                         checked={createDemoClass}
//                         onCheckedChange={(checked) => setCreateDemoClass(checked as boolean)}
//                       />
//                       <Label htmlFor="createDemo">Create Demo Class</Label>
//                     </div>
//                   </div>

//                   {createDemoClass && (
//                     <div className="space-y-4 border rounded-lg p-4 bg-background">
//                       <h5 className="font-medium">Demo Class Details</h5>
                      
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div className="space-y-2">
//                           <Label htmlFor="demoDate">Demo Date & Time</Label>
//                           <Input
//                             id="demoDate"
//                             type="datetime-local"
//                             value={demoDate}
//                             onChange={(e) => setDemoDate(e.target.value)}
//                             required
//                           />
//                         </div>

//                         <div className="space-y-2">
//                           <Label htmlFor="demoDuration">Duration (minutes)</Label>
//                           <Select value={demoDuration.toString()} onValueChange={(value) => setDemoDuration(parseInt(value))}>
//                             <SelectTrigger>
//                               <SelectValue />
//                             </SelectTrigger>
//                             <SelectContent>
//                               <SelectItem value="15">15 minutes</SelectItem>
//                               <SelectItem value="30">30 minutes</SelectItem>
//                               <SelectItem value="45">45 minutes</SelectItem>
//                               <SelectItem value="60">1 hour</SelectItem>
//                             </SelectContent>
//                           </Select>
//                         </div>
//                       </div>

//                       <div className="space-y-2">
//                         <Label htmlFor="demoNotes">Demo Class Notes (Optional)</Label>
//                         <Textarea
//                           id="demoNotes"
//                           placeholder="Add any notes for the demo class"
//                           value={demoNotes}
//                           onChange={(e) => setDemoNotes(e.target.value)}
//                           rows={2}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
          
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowAssignTutorModal(false)}>
//               Cancel
//             </Button>
//             <Button 
//               onClick={handleAssignTutor} 
//               disabled={!selectedTutor || isAssigning}
//             >
//               {isAssigning ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                   Assigning...
//                 </>
//               ) : (
//                 'Assign Tutor'
//               )}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* View Assignments Modal */}
//       <Dialog open={showAssignmentsModal} onOpenChange={setShowAssignmentsModal}>
//         <DialogContent className="max-w-3xl">
//           <DialogHeader>
//             <DialogTitle>Tutor Assignments</DialogTitle>
//             <DialogDescription>
//               View and manage tutors assigned to this contact request.
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedRequest && (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold">{selectedRequest.full_name}</h3>
//                 <p className="text-sm text-muted-foreground">
//                   {selectedRequest.tutor_name || 'Unknown'} - {selectedRequest.status}
//                 </p>
//               </div>
              
//               {loading ? (
//                 <div className="flex justify-center py-8">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//                 </div>
//               ) : assignments.length === 0 ? (
//                 <div className="text-center py-8 border rounded-md bg-muted/20">
//                   <p className="text-muted-foreground">No tutors assigned yet</p>
//                   <Button 
//                     variant="outline" 
//                     className="mt-4" 
//                     onClick={() => {
//                       setShowAssignmentsModal(false);
//                       openAssignTutorModal(selectedRequest);
//                     }}
//                   >
//                     <UserPlus className="h-4 w-4 mr-2" />
//                     Assign Tutor
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="border rounded-md overflow-hidden">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Tutor</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Demo Class</TableHead>
//                         <TableHead>Assigned At</TableHead>
//                         <TableHead>Notes</TableHead>
//                         <TableHead className="text-right">Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {assignments.map((assignment) => (
//                         <TableRow key={assignment.id}>
//                           <TableCell>
//                             <div className="font-medium">{assignment.tutor_name}</div>
//                             <div className="text-xs text-muted-foreground">{assignment.tutor_email}</div>
//                           </TableCell>
//                           <TableCell>
//                             <Badge
//                               variant={assignment.status === 'pending' ? 'outline' : 
//                                       assignment.status === 'accepted' ? 'default' : 
//                                       assignment.status === 'rejected' ? 'destructive' : 
//                                       'success'}
//                             >
//                               {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
//                             </Badge>
//                           </TableCell>
//                           <TableCell>
//                             {assignment.demo_class_id ? (
//                               <div className="space-y-1">
//                                 <Badge variant="outline" className="text-xs">
//                                   {assignment.demo_date ? new Date(assignment.demo_date).toLocaleDateString() : 'Scheduled'}
//                                 </Badge>
//                                 {assignment.demo_duration && (
//                                   <div className="text-xs text-muted-foreground">
//                                     {assignment.demo_duration} min
//                                   </div>
//                                 )}
//                                 {assignment.demo_status && (
//                                   <Badge 
//                                     variant={assignment.demo_status === 'pending' ? 'outline' : 
//                                             assignment.demo_status === 'accepted' ? 'default' : 
//                                             assignment.demo_status === 'rejected' ? 'destructive' : 
//                                             'success'}
//                                     className="text-xs"
//                                   >
//                                     {assignment.demo_status.charAt(0).toUpperCase() + assignment.demo_status.slice(1)}
//                                   </Badge>
//                                 )}
//                               </div>
//                             ) : (
//                               <span className="text-muted-foreground text-sm">No demo</span>
//                             )}
//                           </TableCell>
//                           <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
//                           <TableCell>{assignment.notes || '-'}</TableCell>
//                           <TableCell className="text-right">
//                             <DropdownMenu>
//                               <DropdownMenuTrigger asChild>
//                                 <Button variant="ghost" className="h-8 w-8 p-0">
//                                   <span className="sr-only">Open menu</span>
//                                   <MoreHorizontal className="h-4 w-4" />
//                                 </Button>
//                               </DropdownMenuTrigger>
//                               <DropdownMenuContent align="end">
//                                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                                 <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'accepted')}>
//                                   <CheckCircle className="mr-2 h-4 w-4" />
//                                   Mark Accepted
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'rejected')}>
//                                   <XCircle className="mr-2 h-4 w-4" />
//                                   Mark Rejected
//                                 </DropdownMenuItem>
//                                 <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'completed')}>
//                                   <CheckCircle className="mr-2 h-4 w-4" />
//                                   Mark Completed
//                                 </DropdownMenuItem>
//                                 <DropdownMenuSeparator />
//                                 <DropdownMenuItem 
//                                   onClick={() => deleteAssignment(assignment.id)}
//                                   className="text-destructive focus:text-destructive"
//                                 >
//                                   <Trash2 className="mr-2 h-4 w-4" />
//                                   Delete Assignment
//                                 </DropdownMenuItem>
//                               </DropdownMenuContent>
//                             </DropdownMenu>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </div>
//           )}
          
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowAssignmentsModal(false)}>
//               Close
//             </Button>
//             {!loading && assignments.length > 0 && (
//               <Button 
//                 onClick={() => {
//                   setShowAssignmentsModal(false);
//                   openAssignTutorModal(selectedRequest!);
//                 }}
//               >
//                 <UserPlus className="h-4 w-4 mr-2" />
//                 Assign Another Tutor
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Tutor Details Modal */}
//       <Dialog open={showTutorDetails} onOpenChange={setShowTutorDetails}>
//         <DialogContent className="max-w-2xl">
//           <DialogHeader>
//             <DialogTitle>Tutor Details</DialogTitle>
//             <DialogDescription>
//               Detailed information about the selected tutor
//             </DialogDescription>
//           </DialogHeader>
          
//           {selectedTutorDetails && (
//             <div className="space-y-6">
//               <div className="flex items-start gap-4">
//                 <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
//                   {selectedTutorDetails.avatar_url ? (
//                     <img 
//                       src={selectedTutorDetails.avatar_url} 
//                       alt={selectedTutorDetails.full_name}
//                       className="h-16 w-16 rounded-full object-cover"
//                     />
//                   ) : (
//                     <User className="h-8 w-8 text-muted-foreground" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <h3 className="text-xl font-semibold">{selectedTutorDetails.full_name}</h3>
//                   <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
//                     <div className="flex items-center gap-1">
//                       <Star className="h-4 w-4 text-yellow-500" />
//                       <span>{selectedTutorDetails.rating || 0} ({selectedTutorDetails.total_reviews || 0} reviews)</span>
//                     </div>
//                     {selectedTutorDetails.verified ? (
//                       <Badge variant="outline" className="text-green-600 border-green-600">
//                         Verified
//                       </Badge>
//                     ) : (
//                       <Badge variant="outline" className="text-yellow-600 border-yellow-600">
//                         Unverified
//                       </Badge>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-medium mb-2">Location Information</h4>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex items-center gap-2">
//                         <MapPin className="h-4 w-4 text-muted-foreground" />
//                         <span>{selectedTutorDetails.location || 'Location not specified'}</span>
//                       </div>
//                       {selectedTutorDetails.district && (
//                         <div className="flex items-center gap-2">
//                           <MapPin className="h-4 w-4 text-muted-foreground" />
//                           <span>District: {selectedTutorDetails.district}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div>
//                     <h4 className="font-medium mb-2">Education & Experience</h4>
//                     <div className="space-y-2 text-sm">
//                       {selectedTutorDetails.education && (
//                         <div>
//                           <span className="text-muted-foreground">Education:</span>
//                           <p>{selectedTutorDetails.education}</p>
//                         </div>
//                       )}
//                       {selectedTutorDetails.experience && (
//                         <div>
//                           <span className="text-muted-foreground">Experience:</span>
//                           <p>{selectedTutorDetails.experience}</p>
//                         </div>
//                       )}
//                       {selectedTutorDetails.qualification && (
//                         <div>
//                           <span className="text-muted-foreground">Qualification:</span>
//                           <p>{selectedTutorDetails.qualification}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-4">
//                   <div>
//                     <h4 className="font-medium mb-2">Teaching Details</h4>
//                     <div className="space-y-2 text-sm">
//                       {selectedTutorDetails.subjects && (
//                         <div>
//                           <span className="text-muted-foreground">Subjects:</span>
//                           <p>{selectedTutorDetails.subjects}</p>
//                         </div>
//                       )}
//                       {selectedTutorDetails.hourly_rate && (
//                         <div>
//                           <span className="text-muted-foreground">Hourly Rate:</span>
//                           <p>৳{selectedTutorDetails.hourly_rate}</p>
//                         </div>
//                       )}
//                       {selectedTutorDetails.availability && (
//                         <div>
//                           <span className="text-muted-foreground">Availability:</span>
//                           <p>{selectedTutorDetails.availability}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {selectedTutorDetails.bio && (
//                     <div>
//                       <h4 className="font-medium mb-2">Bio</h4>
//                       <p className="text-sm text-muted-foreground">{selectedTutorDetails.bio}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowTutorDetails(false)}>
//               Close
//             </Button>
//             {selectedTutorDetails && (
//               <Button 
//                 onClick={() => {
//                   setSelectedTutor(selectedTutorDetails.id);
//                   setShowTutorDetails(false);
//                   setShowAssignTutorModal(true);
//                 }}
//               >
//                 Select This Tutor
//               </Button>
//             )}
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }

// // TutorCard Component
// interface TutorCardProps {
//   tutor: LocalTutor;
//   isSelected: boolean;
//   onSelect: () => void;
//   onViewDetails: () => void;
//   request: TutorContactRequest;
//   isMatched?: boolean;
//   isNearby?: boolean;
// }

// function TutorCard({ tutor, isSelected, onSelect, onViewDetails, request, isMatched, isNearby }: TutorCardProps) {
//   const getMatchScore = () => {
//     let score = 0;
    
//     // Rating bonus (40 points)
//     if (tutor.rating && tutor.rating >= 4.5) {
//       score += 40;
//     } else if (tutor.rating && tutor.rating >= 4.0) {
//       score += 30;
//     } else if (tutor.rating && tutor.rating >= 3.5) {
//       score += 20;
//     }
    
//     // Verification bonus (30 points)
//     if (tutor.verified) {
//       score += 30;
//     }
    
//     // Experience bonus (20 points)
//     if (tutor.experience && tutor.experience.length > 0) {
//       score += 20;
//     }
    
//     // Education bonus (10 points)
//     if (tutor.education && tutor.education.length > 0) {
//       score += 10;
//     }
    
//     return score;
//   };

//   const matchScore = getMatchScore();

//   return (
//     <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
//       isSelected 
//         ? 'border-blue-500 bg-blue-50' 
//         : 'border-border hover:border-primary/50 hover:bg-muted/20'
//     }`}>
//       <div className="flex items-start justify-between">
//         <div className="flex items-start gap-3 flex-1">
//           <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
//             {tutor.avatar_url ? (
//               <img 
//                 src={tutor.avatar_url} 
//                 alt={tutor.full_name}
//                 className="h-12 w-12 rounded-full object-cover"
//               />
//             ) : (
//               <User className="h-6 w-6 text-muted-foreground" />
//             )}
//           </div>
          
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2 mb-1">
//               <h4 className="font-medium truncate">{tutor.full_name}</h4>
//               {tutor.verified ? (
//                 <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
//                   Verified
//                 </Badge>
//               ) : (
//                 <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
//                   Unverified
//                 </Badge>
//               )}
//               {(isMatched || isNearby) && (
//                 <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
//                   {isMatched ? 'Best Match' : 'Nearby'}
//                 </Badge>
//               )}
//             </div>
            
//             <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
//               <div className="flex items-center gap-1">
//                 <Star className="h-4 w-4 text-yellow-500" />
//                 <span>{tutor.rating || 0}</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <MapPin className="h-4 w-4" />
//                 <span>{tutor.location || tutor.district || 'Location N/A'}</span>
//               </div>
//               {tutor.hourly_rate && (
//                 <div className="flex items-center gap-1">
//                   <span>৳{tutor.hourly_rate}/hr</span>
//                 </div>
//               )}
//             </div>
            
//             <div className="text-sm text-muted-foreground">
//               <div className="flex items-center gap-2 mb-1">
//                 <BookOpen className="h-4 w-4" />
//                 <span className="truncate">{tutor.subjects || tutor.preferred_subjects || 'Subjects N/A'}</span>
//               </div>
//               {tutor.education && (
//                 <div className="flex items-center gap-2">
//                   <GraduationCap className="h-4 w-4" />
//                   <span className="truncate">{tutor.education}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
        
//         <div className="flex flex-col items-end gap-2">
//           {matchScore > 0 && (
//             <div className="text-right">
//               <div className="text-xs text-muted-foreground">Match Score</div>
//               <div className="text-lg font-semibold text-blue-600">{matchScore}%</div>
//             </div>
//           )}
          
//           <div className="flex gap-1">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onViewDetails();
//               }}
//             >
//               <Eye className="h-4 w-4" />
//             </Button>
//             <Button
//               variant={isSelected ? "default" : "outline"}
//               size="sm"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onSelect();
//               }}
//             >
//               {isSelected ? 'Selected' : 'Select'}
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, Phone, Mail, User, Calendar, Clock, AlertCircle, Eye, Filter, Search, CheckCircle, XCircle, MoreHorizontal, UserPlus, Users, MapPin, Star, BookOpen, GraduationCap, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/components/ui/use-toast";

// Demo data types
interface TutorContactRequest {
  id: string;
  full_name: string;
  phone_number: string;
  tutor_name: string;
  details?: string;
  status: 'pending' | 'contacted' | 'completed' | 'rejected';
  created_at: string;
}

interface TutorContactAssignment {
  id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  notes?: string;
  assigned_at: string;
  demo_class_id?: string;
  demo_date?: string;
  demo_duration?: number;
  demo_status?: 'pending' | 'accepted' | 'rejected' | 'completed';
}

interface LocalTutor {
  id: string;
  tutor_id: string;
  full_name: string;
  location: string;
  district: string;
  avatar_url: string | null;
  created_at: string;
  gender: string | null;
  bio: string | null;
  education: string | null;
  experience: string | null;
  subjects: string;
  hourly_rate: number | undefined;
  rating: number;
  total_reviews: number;
  total_views: number;
  availability: string | null;
  premium: boolean | null;
  verified: number;
  qualification: string | null;
  tutoring_experience: string | null;
  university_name: string | null;
  department_name: string | null;
  expected_salary: number | undefined;
  days_per_week: string | null;
  preferred_tutoring_style: string | null;
  educational_qualifications: string | null;
  preferred_subjects: string | null;
  preferred_class: string | null;
  preferred_medium: string | null;
  preferred_time: string | null;
  religion: string | null;
  nationality: string | null;
}

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

interface RealTimeConfig {
  enabled: boolean;
  interval: number;
  lastUpdate: Date;
}

// Demo data
const demoContactRequests: TutorContactRequest[] = [
  {
    id: '1',
    full_name: 'John Smith',
    phone_number: '+8801712345678',
    tutor_name: 'Dr. Sarah Johnson',
    details: 'Need help with advanced mathematics for university entrance exam. Looking for weekly sessions.',
    status: 'pending',
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    full_name: 'Emma Wilson',
    phone_number: '+8801723456789',
    tutor_name: 'Prof. Michael Brown',
    details: 'Looking for physics tutoring for my son who is in grade 11. Prefer weekend sessions.',
    status: 'contacted',
    created_at: '2024-01-14T14:45:00Z'
  },
  {
    id: '3',
    full_name: 'Alex Chen',
    phone_number: '+8801734567890',
    tutor_name: 'Dr. Lisa Anderson',
    details: 'Need chemistry tutoring for O-level exams. Available evenings only.',
    status: 'completed',
    created_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    full_name: 'Maria Garcia',
    phone_number: '+8801745678901',
    tutor_name: 'Dr. Robert Williams',
    details: 'Looking for English literature tutoring for A-levels. Need help with essay writing.',
    status: 'rejected',
    created_at: '2024-01-12T16:20:00Z'
  },
  {
    id: '5',
    full_name: 'David Lee',
    phone_number: '+8801756789012',
    tutor_name: 'Prof. Michael Brown',
    details: 'Need help with calculus and advanced mathematics for engineering entrance exam.',
    status: 'pending',
    created_at: '2024-01-11T11:00:00Z'
  },
  {
    id: '6',
    full_name: 'Sophia Martinez',
    phone_number: '+8801767890123',
    tutor_name: 'Dr. Sarah Johnson',
    details: 'Looking for biology tutoring for medical school entrance. Need comprehensive coverage.',
    status: 'contacted',
    created_at: '2024-01-10T13:45:00Z'
  }
];

const demoTutors: LocalTutor[] = [
  {
    id: '1',
    tutor_id: 'T001',
    full_name: 'Dr. Sarah Johnson',
    location: 'Dhaka',
    district: 'Gulshan',
    avatar_url: null,
    created_at: '2023-01-15T10:30:00Z',
    gender: 'female',
    bio: 'Experienced mathematics tutor with 8+ years of teaching experience. Specialized in advanced mathematics and calculus.',
    education: 'PhD in Mathematics, University of Dhaka',
    experience: '8 years',
    subjects: 'Mathematics, Calculus, Advanced Math',
    hourly_rate: 800,
    rating: 4.8,
    total_reviews: 127,
    total_views: 1500,
    availability: 'Weekdays: 4 PM - 8 PM, Weekends: 9 AM - 6 PM',
    premium: true,
    verified: 1,
    qualification: 'PhD in Mathematics',
    tutoring_experience: '8+ years',
    university_name: 'University of Dhaka',
    department_name: 'Mathematics',
    expected_salary: 800,
    days_per_week: '5 days',
    preferred_tutoring_style: 'Interactive and practical',
    educational_qualifications: 'PhD, M.Sc, B.Sc in Mathematics',
    preferred_subjects: 'Mathematics, Calculus, Statistics',
    preferred_class: 'University, College',
    preferred_medium: 'English',
    preferred_time: 'Evening',
    religion: 'Islam',
    nationality: 'Bangladeshi'
  },
  {
    id: '2',
    tutor_id: 'T002',
    full_name: 'Prof. Michael Brown',
    location: 'Chittagong',
    district: 'Agrabad',
    avatar_url: null,
    created_at: '2023-02-20T14:45:00Z',
    gender: 'male',
    bio: 'Physics expert with industrial experience. Makes complex concepts easy to understand.',
    education: 'M.Sc in Physics, BUET',
    experience: '6 years',
    subjects: 'Physics, Advanced Physics, Mechanics',
    hourly_rate: 700,
    rating: 4.6,
    total_reviews: 89,
    total_views: 1200,
    availability: 'Monday to Saturday: 3 PM - 9 PM',
    premium: true,
    verified: 1,
    qualification: 'M.Sc in Physics',
    tutoring_experience: '6 years',
    university_name: 'BUET',
    department_name: 'Physics',
    expected_salary: 700,
    days_per_week: '6 days',
    preferred_tutoring_style: 'Conceptual and practical',
    educational_qualifications: 'M.Sc, B.Sc in Physics',
    preferred_subjects: 'Physics, Mathematics',
    preferred_class: 'College, University',
    preferred_medium: 'English, Bengali',
    preferred_time: 'Afternoon, Evening',
    religion: 'Christian',
    nationality: 'Bangladeshi'
  },
  {
    id: '3',
    tutor_id: 'T003',
    full_name: 'Dr. Lisa Anderson',
    location: 'Sylhet',
    district: 'Sylhet City',
    avatar_url: null,
    created_at: '2023-03-10T09:15:00Z',
    gender: 'female',
    bio: 'Chemistry specialist with research background. Focuses on practical applications.',
    education: 'PhD in Chemistry, SUST',
    experience: '7 years',
    subjects: 'Chemistry, Organic Chemistry, Biochemistry',
    hourly_rate: 750,
    rating: 4.7,
    total_reviews: 95,
    total_views: 1100,
    availability: 'Weekdays: 5 PM - 9 PM, Weekends: 10 AM - 4 PM',
    premium: true,
    verified: 1,
    qualification: 'PhD in Chemistry',
    tutoring_experience: '7 years',
    university_name: 'SUST',
    department_name: 'Chemistry',
    expected_salary: 750,
    days_per_week: '5 days',
    preferred_tutoring_style: 'Experimental and interactive',
    educational_qualifications: 'PhD, M.Sc in Chemistry',
    preferred_subjects: 'Chemistry, Biology',
    preferred_class: 'College, University',
    preferred_medium: 'English',
    preferred_time: 'Evening',
    religion: 'Hindu',
    nationality: 'Bangladeshi'
  },
  {
    id: '4',
    tutor_id: 'T004',
    full_name: 'Dr. Robert Williams',
    location: 'Rajshahi',
    district: 'Rajshahi City',
    avatar_url: null,
    created_at: '2023-01-05T11:20:00Z',
    gender: 'male',
    bio: 'English literature expert with published research papers.',
    education: 'MA in English Literature, University of Rajshahi',
    experience: '5 years',
    subjects: 'English Literature, Essay Writing, Grammar',
    hourly_rate: 600,
    rating: 4.5,
    total_reviews: 78,
    total_views: 900,
    availability: 'Monday to Friday: 4 PM - 8 PM',
    premium: false,
    verified: 1,
    qualification: 'MA in English Literature',
    tutoring_experience: '5 years',
    university_name: 'University of Rajshahi',
    department_name: 'English',
    expected_salary: 600,
    days_per_week: '5 days',
    preferred_tutoring_style: 'Discussion based',
    educational_qualifications: 'MA, BA in English Literature',
    preferred_subjects: 'English, Literature',
    preferred_class: 'School, College',
    preferred_medium: 'English',
    preferred_time: 'Evening',
    religion: 'Christian',
    nationality: 'Bangladeshi'
  },
  {
    id: '5',
    tutor_id: 'T005',
    full_name: 'Ms. Fatima Rahman',
    location: 'Dhaka',
    district: 'Dhanmondi',
    avatar_url: null,
    created_at: '2023-04-15T16:30:00Z',
    gender: 'female',
    bio: 'Biology teacher with medical background. Specialized in human anatomy.',
    education: 'MBBS, Dhaka Medical College',
    experience: '4 years',
    subjects: 'Biology, Human Anatomy, Medical Science',
    hourly_rate: 850,
    rating: 4.9,
    total_reviews: 45,
    total_views: 600,
    availability: 'Weekends: 9 AM - 5 PM',
    premium: true,
    verified: 1,
    qualification: 'MBBS',
    tutoring_experience: '4 years',
    university_name: 'Dhaka Medical College',
    department_name: 'Medicine',
    expected_salary: 850,
    days_per_week: '2 days',
    preferred_tutoring_style: 'Medical practical approach',
    educational_qualifications: 'MBBS',
    preferred_subjects: 'Biology, Chemistry',
    preferred_class: 'College, Medical',
    preferred_medium: 'English, Bengali',
    preferred_time: 'Weekend Daytime',
    religion: 'Islam',
    nationality: 'Bangladeshi'
  }
];

const demoAssignments: TutorContactAssignment[] = [
  {
    id: 'A1',
    tutor_id: '1',
    tutor_name: 'Dr. Sarah Johnson',
    tutor_email: 'sarah.johnson@tutor.com',
    status: 'pending',
    notes: 'Student needs help with advanced calculus',
    assigned_at: '2024-01-15T11:00:00Z',
    demo_class_id: 'D1',
    demo_date: '2024-01-20T16:00:00Z',
    demo_duration: 60,
    demo_status: 'pending'
  },
  {
    id: 'A2',
    tutor_id: '2',
    tutor_name: 'Prof. Michael Brown',
    tutor_email: 'michael.brown@tutor.com',
    status: 'accepted',
    notes: 'Physics tutoring for grade 11 student',
    assigned_at: '2024-01-14T15:30:00Z'
  }
];

// TutorCard Component
interface TutorCardProps {
  tutor: LocalTutor;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  request: TutorContactRequest;
  isMatched?: boolean;
  isNearby?: boolean;
}

function TutorCard({ tutor, isSelected, onSelect, onViewDetails, request, isMatched, isNearby }: TutorCardProps) {
  const getMatchScore = () => {
    let score = 0;
    
    // Rating bonus (40 points)
    if (tutor.rating && tutor.rating >= 4.5) {
      score += 40;
    } else if (tutor.rating && tutor.rating >= 4.0) {
      score += 30;
    } else if (tutor.rating && tutor.rating >= 3.5) {
      score += 20;
    }
    
    // Verification bonus (30 points)
    if (tutor.verified) {
      score += 30;
    }
    
    // Experience bonus (20 points)
    if (tutor.experience && tutor.experience.length > 0) {
      score += 20;
    }
    
    // Education bonus (10 points)
    if (tutor.education && tutor.education.length > 0) {
      score += 10;
    }
    
    return score;
  };

  const matchScore = getMatchScore();

  return (
    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
      isSelected 
        ? 'border-blue-500 bg-blue-50' 
        : 'border-border hover:border-primary/50 hover:bg-muted/20'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {tutor.avatar_url ? (
              <img 
                src={tutor.avatar_url} 
                alt={tutor.full_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{tutor.full_name}</h4>
              {tutor.verified ? (
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                  Unverified
                </Badge>
              )}
              {(isMatched || isNearby) && (
                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                  {isMatched ? 'Best Match' : 'Nearby'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{tutor.rating || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{tutor.location || tutor.district || 'Location N/A'}</span>
              </div>
              {tutor.hourly_rate && (
                <div className="flex items-center gap-1">
                  <span>৳{tutor.hourly_rate}/hr</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4" />
                <span className="truncate">{tutor.subjects || tutor.preferred_subjects || 'Subjects N/A'}</span>
              </div>
              {tutor.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="truncate">{tutor.education}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {matchScore > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Match Score</div>
              <div className="text-lg font-semibold text-blue-600">{matchScore}%</div>
            </div>
          )}
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TutorConnectSection() {
  const [contactRequests, setContactRequests] = useState<TutorContactRequest[]>(demoContactRequests);
  const [filteredRequests, setFilteredRequests] = useState<TutorContactRequest[]>(demoContactRequests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<TutorContactRequest | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tutor assignment states
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [tutors, setTutors] = useState<LocalTutor[]>(demoTutors);
  const [filteredTutors, setFilteredTutors] = useState<LocalTutor[]>(demoTutors);
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [createDemoClass, setCreateDemoClass] = useState(false);
  const [demoDate, setDemoDate] = useState('');
  const [demoDuration, setDemoDuration] = useState(30);
  const [demoNotes, setDemoNotes] = useState('');
  const [assignments, setAssignments] = useState<TutorContactAssignment[]>(demoAssignments);
  
  // Real-time functionality
  const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
    enabled: true,
    interval: 30000,
    lastUpdate: new Date()
  });
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced tutor assignment
  const [tutorFilters, setTutorFilters] = useState<TutorFilter>({});
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<LocalTutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<'all' | 'matched' | 'nearby'>('all');
  
  const { toast } = useToast();

  // Simulate API calls with demo data
  const fetchContactRequests = useCallback(async (isRealTimeUpdate = false) => {
    try {
      if (!isRealTimeUpdate) {
        setLoading(true);
      }
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setContactRequests(demoContactRequests);
      setFilteredRequests(demoContactRequests);
      setError(null);
      
      if (isRealTimeUpdate) {
        setRealTimeConfig(prev => ({ ...prev, lastUpdate: new Date() }));
      }
    } catch (err: any) {
      if (!isRealTimeUpdate) {
        setError('Failed to fetch contact requests');
        toast({
          variant: "destructive",
          title: "Error",
          description: 'Failed to fetch contact requests',
        });
      }
    } finally {
      if (!isRealTimeUpdate) {
        setLoading(false);
      }
    }
  }, [toast]);

  const fetchTutors = useCallback(async (filters?: TutorFilter) => {
    try {
      setIsLoadingTutors(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setTutors(demoTutors);
      setFilteredTutors(demoTutors);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tutors",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTutors(false);
    }
  }, [toast]);

  // Fetch data on component mount and set up real-time updates
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchContactRequests(),
          fetchTutors()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initializeData();
    
    // Set up real-time updates if enabled
    if (realTimeConfig.enabled) {
      realTimeIntervalRef.current = setInterval(() => {
        fetchContactRequests(true);
      }, realTimeConfig.interval);
    }
    
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [fetchContactRequests, fetchTutors, realTimeConfig.enabled, realTimeConfig.interval]);

  // Filter requests based on search term and status
  useEffect(() => {
    let filtered = [...contactRequests];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(request => 
        request.full_name.toLowerCase().includes(query) ||
        request.phone_number.includes(query) ||
        (request.tutor_name && request.tutor_name.toLowerCase().includes(query)) ||
        (request.details && request.details.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(filtered);
  }, [searchQuery, statusFilter, contactRequests]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedRequest) return;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContactRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === selectedRequest.id ? selectedRequest : req
        )
      );
      
      setIsEditDialogOpen(false);
      toast({
        title: "Request Updated",
        description: `Contact request updated successfully`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message || 'Failed to update request',
      });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedRequest) return;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setContactRequests(prevRequests =>
        prevRequests.filter(req => req.id !== selectedRequest.id)
      );
      
      setIsDeleteDialogOpen(false);
      toast({
        title: "Request Deleted",
        description: "Contact request has been deleted successfully",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: err.message || 'Failed to delete contact request',
      });
    }
  };

  // Filter tutors based on request requirements
  const filterTutorsForRequest = useCallback((request: TutorContactRequest) => {
    const filters: TutorFilter = {
      sortBy: 'rating',
      sortOrder: 'desc'
    };
    
    return filters;
  }, []);

  // Get matched tutors for a specific request
  const getMatchedTutors = useCallback((request: TutorContactRequest) => {
    return tutors.filter(tutor => {
      // Check if tutor has good rating
      const ratingMatch = tutor.rating && tutor.rating >= 4.0;
      
      // Check if tutor is verified
      const verifiedMatch = tutor.verified;
      
      return ratingMatch && verifiedMatch;
    });
  }, [tutors]);

  // Get nearby tutors (same district if available)
  const getNearbyTutors = useCallback((request: TutorContactRequest) => {
    return tutors.filter(tutor => 
      tutor.district && tutor.district.length > 0
    );
  }, [tutors]);

  // Open assign tutor modal with enhanced features
  const openAssignTutorModal = async (request: TutorContactRequest) => {
    setSelectedRequest(request);
    setSelectedTutor('');
    setAssignmentNotes('');
    setCreateDemoClass(false);
    setDemoDate('');
    setDemoDuration(30);
    setDemoNotes('');
    setAssignmentTab('all');
    
    // Fetch tutors with filters for this specific request
    const requestFilters = filterTutorsForRequest(request);
    try {
      await fetchTutors(requestFilters);
    } catch (error) {
      console.error('Error fetching filtered tutors, trying without filters:', error);
      // Fallback to fetch all tutors if filtered request fails
      await fetchTutors();
    }
    
    setShowAssignTutorModal(true);
  };

  // Handle tutor assignment
  const handleAssignTutor = async () => {
    if (!selectedRequest || !selectedTutor) {
      toast({
        title: "Error",
        description: "Please select a tutor",
        variant: "destructive"
      });
      return;
    }

    // Validate demo class data if creating one
    if (createDemoClass && !demoDate) {
      toast({
        title: "Error",
        description: "Please select a demo class date",
        variant: "destructive"
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Success",
        description: createDemoClass 
          ? "Tutor assigned successfully with demo class" 
          : "Tutor assigned successfully",
      });
      setShowAssignTutorModal(false);
      // Refresh the requests to get updated assignments
      await fetchContactRequests();
    } catch (error) {
      console.error("Error assigning tutor:", error);
      toast({
        title: "Error",
        description: "Failed to assign tutor",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // View tutor assignments
  const viewAssignments = async (request: TutorContactRequest) => {
    setSelectedRequest(request);
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      setAssignments(demoAssignments);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tutor assignments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowAssignmentsModal(true);
    }
  };

  // Update assignment status
  const updateAssignmentStatus = async (assignmentId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed') => {
    if (!selectedRequest) return;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: `Assignment status updated to ${status}`,
      });
      // Update local state
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          assignment.id === assignmentId ? { ...assignment, status } : assignment
        )
      );
    } catch (error) {
      console.error("Error updating assignment status:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId: string) => {
    if (!selectedRequest) return;
    
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      // Update local state
      setAssignments(prevAssignments => 
        prevAssignments.filter(assignment => assignment.id !== assignmentId)
      );
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  // View tutor details
  const viewTutorDetails = async (tutorId: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const tutor = demoTutors.find(t => t.id === tutorId);
      if (tutor) {
        setSelectedTutorDetails(tutor);
        setShowTutorDetails(true);
      }
    } catch (error) {
      console.error('Error fetching tutor details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tutor details",
        variant: "destructive"
      });
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      await Promise.all([
        fetchContactRequests(),
        fetchTutors()
      ]);
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    }
  };

  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    setRealTimeConfig(prev => {
      const newConfig = { ...prev, enabled: !prev.enabled };
      
      if (newConfig.enabled) {
        realTimeIntervalRef.current = setInterval(() => {
          fetchContactRequests(true);
        }, newConfig.interval);
      } else {
        if (realTimeIntervalRef.current) {
          clearInterval(realTimeIntervalRef.current);
          realTimeIntervalRef.current = null;
        }
      }
      
      return newConfig;
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'contacted':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tutor Connect Requests</h2>
            <p className="text-white/90 mt-1">Manage contact requests from students to tutors</p>
            {realTimeConfig.enabled && (
              <div className="flex items-center gap-2 mt-2 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Real-time updates enabled</span>
                <span className="text-xs">• Last updated: {realTimeConfig.lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRealTimeUpdates}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${realTimeConfig.enabled ? 'animate-spin' : ''}`} />
              {realTimeConfig.enabled ? 'Disable' : 'Enable'} Real-time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Contact Requests</CardTitle>
              <CardDescription>View and manage contact requests from students to tutors</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex items-center gap-2 text-red-500">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No contact requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Tutor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{request.full_name}</div>
                          {request.details && (
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {request.details}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{request.phone_number}</TableCell>
                      <TableCell>{request.tutor_name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(request.status)}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Assign Tutor
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => {
                              setSelectedRequest(request);
                              setIsEditDialogOpen(true);
                            }}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Request
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignTutorModal(request)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Tutor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => viewAssignments(request)}>
                              <Users className="h-4 w-4 mr-2" />
                              View Assignments
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Request
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact Request</DialogTitle>
            <DialogDescription>
              Update the status and details of this contact request.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label>Student Name</Label>
                  </div>
                  <p className="text-sm font-medium">{selectedRequest.full_name}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Label>Phone Number</Label>
                  </div>
                  <p className="text-sm font-medium">{selectedRequest.phone_number}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Label>Tutor</Label>
                  </div>
                  <p className="text-sm font-medium">{selectedRequest.tutor_name || 'Unknown'}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <Label>Request Date</Label>
                  </div>
                  <p className="text-sm font-medium">
                    {new Date(selectedRequest.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="details">Details</Label>
                <Textarea
                  id="details"
                  value={selectedRequest.details || ''}
                  onChange={(e) => {
                    setSelectedRequest({
                      ...selectedRequest,
                      details: e.target.value,
                    });
                  }}
                  className="h-20"
                  placeholder="Enter request details..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={selectedRequest.status}
                  onValueChange={(value: any) => {
                    setSelectedRequest({
                      ...selectedRequest,
                      status: value,
                    });
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
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
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRequest.full_name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{selectedRequest.phone_number}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tutor:</span>
                    <p className="font-medium">{selectedRequest.tutor_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">{selectedRequest.status}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">{formatDistanceToNow(new Date(selectedRequest.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
                {selectedRequest.details && (
                  <div className="mt-3">
                    <span className="text-muted-foreground">Details:</span>
                    <p className="text-sm mt-1">{selectedRequest.details}</p>
                  </div>
                )}
              </div>

              {/* Tutor Selection Tabs */}
              <Tabs value={assignmentTab} onValueChange={(value) => setAssignmentTab(value as 'all' | 'matched' | 'nearby')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All Tutors ({tutors.length})</TabsTrigger>
                  <TabsTrigger value="matched">Best Matches ({getMatchedTutors(selectedRequest).length})</TabsTrigger>
                  <TabsTrigger value="nearby">Nearby ({getNearbyTutors(selectedRequest).length})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {isLoadingTutors ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : tutors.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No tutors available</p>
                      </div>
                    ) : (
                      tutors.map((tutor) => (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isSelected={selectedTutor === tutor.id}
                          onSelect={() => setSelectedTutor(tutor.id)}
                          onViewDetails={() => viewTutorDetails(tutor.id)}
                          request={selectedRequest}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="matched" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {getMatchedTutors(selectedRequest).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No perfect matches found</p>
                        <p className="text-sm">Try adjusting the filters or check all tutors</p>
                      </div>
                    ) : (
                      getMatchedTutors(selectedRequest).map((tutor) => (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isSelected={selectedTutor === tutor.id}
                          onSelect={() => setSelectedTutor(tutor.id)}
                          onViewDetails={() => viewTutorDetails(tutor.id)}
                          request={selectedRequest}
                          isMatched={true}
                        />
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="nearby" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {getNearbyTutors(selectedRequest).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No tutors in this area</p>
                        <p className="text-sm">Try expanding the search area</p>
                      </div>
                    ) : (
                      getNearbyTutors(selectedRequest).map((tutor) => (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isSelected={selectedTutor === tutor.id}
                          onSelect={() => setSelectedTutor(tutor.id)}
                          onViewDetails={() => viewTutorDetails(tutor.id)}
                          request={selectedRequest}
                          isNearby={true}
                        />
                      ))
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignments Modal */}
      <Dialog open={showAssignmentsModal} onOpenChange={setShowAssignmentsModal}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Tutor Assignments</DialogTitle>
            <DialogDescription>
              View and manage tutors assigned to this contact request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedRequest.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.tutor_name || 'Unknown'} - {selectedRequest.status}
                </p>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No tutors assigned yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      setShowAssignmentsModal(false);
                      openAssignTutorModal(selectedRequest);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Tutor
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Demo Class</TableHead>
                        <TableHead>Assigned At</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="font-medium">{assignment.tutor_name}</div>
                            <div className="text-xs text-muted-foreground">{assignment.tutor_email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={assignment.status === 'pending' ? 'outline' : 
                                      assignment.status === 'accepted' ? 'default' : 
                                      assignment.status === 'rejected' ? 'destructive' : 
                                      'success'}
                            >
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignment.demo_class_id ? (
                              <div className="space-y-1">
                                <Badge variant="outline" className="text-xs">
                                  {assignment.demo_date ? new Date(assignment.demo_date).toLocaleDateString() : 'Scheduled'}
                                </Badge>
                                {assignment.demo_duration && (
                                  <div className="text-xs text-muted-foreground">
                                    {assignment.demo_duration} min
                                  </div>
                                )}
                                {assignment.demo_status && (
                                  <Badge 
                                    variant={assignment.demo_status === 'pending' ? 'outline' : 
                                            assignment.demo_status === 'accepted' ? 'default' : 
                                            assignment.demo_status === 'rejected' ? 'destructive' : 
                                            'success'}
                                    className="text-xs"
                                  >
                                    {assignment.demo_status.charAt(0).toUpperCase() + assignment.demo_status.slice(1)}
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">No demo</span>
                            )}
                          </TableCell>
                          <TableCell>{new Date(assignment.assigned_at).toLocaleDateString()}</TableCell>
                          <TableCell>{assignment.notes || '-'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'accepted')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Accepted
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'rejected')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark Rejected
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'completed')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Completed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => deleteAssignment(assignment.id)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentsModal(false)}>
              Close
            </Button>
            {!loading && assignments.length > 0 && (
              <Button 
                onClick={() => {
                  setShowAssignmentsModal(false);
                  openAssignTutorModal(selectedRequest!);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Another Tutor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutor Details Modal */}
      <Dialog open={showTutorDetails} onOpenChange={setShowTutorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected tutor
            </DialogDescription>
          </DialogHeader>
          
          {selectedTutorDetails && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  {selectedTutorDetails.avatar_url ? (
                    <img 
                      src={selectedTutorDetails.avatar_url} 
                      alt={selectedTutorDetails.full_name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedTutorDetails.full_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedTutorDetails.rating || 0} ({selectedTutorDetails.total_reviews || 0} reviews)</span>
                    </div>
                    {selectedTutorDetails.verified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Location Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedTutorDetails.location || 'Location not specified'}</span>
                      </div>
                      {selectedTutorDetails.district && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>District: {selectedTutorDetails.district}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Education & Experience</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTutorDetails.education && (
                        <div>
                          <span className="text-muted-foreground">Education:</span>
                          <p>{selectedTutorDetails.education}</p>
                        </div>
                      )}
                      {selectedTutorDetails.experience && (
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <p>{selectedTutorDetails.experience}</p>
                        </div>
                      )}
                      {selectedTutorDetails.qualification && (
                        <div>
                          <span className="text-muted-foreground">Qualification:</span>
                          <p>{selectedTutorDetails.qualification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Teaching Details</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTutorDetails.subjects && (
                        <div>
                          <span className="text-muted-foreground">Subjects:</span>
                          <p>{selectedTutorDetails.subjects}</p>
                        </div>
                      )}
                      {selectedTutorDetails.hourly_rate && (
                        <div>
                          <span className="text-muted-foreground">Hourly Rate:</span>
                          <p>৳{selectedTutorDetails.hourly_rate}</p>
                        </div>
                      )}
                      {selectedTutorDetails.availability && (
                        <div>
                          <span className="text-muted-foreground">Availability:</span>
                          <p>{selectedTutorDetails.availability}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTutorDetails.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">{selectedTutorDetails.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTutorDetails(false)}>
              Close
            </Button>
            {selectedTutorDetails && (
              <Button 
                onClick={() => {
                  setSelectedTutor(selectedTutorDetails.id);
                  setShowTutorDetails(false);
                  setShowAssignTutorModal(true);
                }}
              >
                Select This Tutor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}