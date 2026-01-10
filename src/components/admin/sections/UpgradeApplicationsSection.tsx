// 'use client';

// import { useState, useEffect } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { CheckCircle2, XCircle, AlertCircle, Eye, Clock, DollarSign, Phone, CreditCard } from "lucide-react";
// import { getUpgradeApplications, updateApplicationStatus, type UpgradeApplication } from "@/services/upgradeService";
// import { useToast } from "@/components/ui/use-toast";

// export function UpgradeApplicationsSection() {
//   const { toast } = useToast();
//   const [applications, setApplications] = useState<UpgradeApplication[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [statusFilter, setStatusFilter] = useState<string>("all");
//   const [typeFilter, setTypeFilter] = useState<string>("all");
//   const [searchQuery, setSearchQuery] = useState<string>("");
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [totalPages, setTotalPages] = useState<number>(1);
//   const [selectedApplication, setSelectedApplication] = useState<UpgradeApplication | null>(null);
//   const [showActionModal, setShowActionModal] = useState(false);
//   const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
//   const [adminNote, setAdminNote] = useState('');
//   const [processing, setProcessing] = useState(false);

//   const itemsPerPage = 10;

//   useEffect(() => {
//     fetchApplications();
//   }, [statusFilter, typeFilter, currentPage]);

//   const fetchApplications = async () => {
//     try {
//       setLoading(true);
//       const response = await getUpgradeApplications(
//         statusFilter === 'all' ? undefined : statusFilter,
//         typeFilter === 'all' ? undefined : typeFilter,
//         currentPage,
//         itemsPerPage
//       );

//       if (response.success) {
//         setApplications(response.data.applications);
//         setTotalPages(response.data.pagination.totalPages);
//       }
//     } catch (error) {
//       console.error('Error fetching applications:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to fetch upgrade applications',
//         variant: 'destructive'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAction = (application: UpgradeApplication, type: 'approve' | 'reject') => {
//     setSelectedApplication(application);
//     setActionType(type);
//     setAdminNote('');
//     setShowActionModal(true);
//   };

//   const submitAction = async () => {
//     if (!selectedApplication) return;

//     try {
//       setProcessing(true);
//       const response = await updateApplicationStatus(
//         selectedApplication.id,
//         actionType === 'approve' ? 'approved' : 'rejected',
//         adminNote.trim() || undefined
//       );

//       if (response.success) {
//         toast({
//           title: 'Success',
//           description: `Application ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`,
//         });
//         setShowActionModal(false);
//         fetchApplications();
//       }
//     } catch (error) {
//       console.error('Error updating application:', error);
//       toast({
//         title: 'Error',
//         description: 'Failed to update application status',
//         variant: 'destructive'
//       });
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const filteredApplications = applications.filter(app => {
//     const matchesSearch = 
//       app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       app.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       app.transaction_id.toLowerCase().includes(searchQuery.toLowerCase());
//     return matchesSearch;
//   });

//   const getStatusBadge = (status: string) => {
//     switch (status) {
//       case 'pending':
//         return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
//       case 'approved':
//         return <Badge variant="outline" className="text-green-600 border-green-600">Approved</Badge>;
//       case 'rejected':
//         return <Badge variant="outline" className="text-red-600 border-red-600">Rejected</Badge>;
//       default:
//         return <Badge variant="outline">{status}</Badge>;
//     }
//   };

//   const getTypeBadge = (type: string) => {
//     switch (type) {
//       case 'premium':
//         return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Genius</Badge>;
//       case 'verified':
//         return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Verified</Badge>;
//       default:
//         return <Badge variant="secondary">{type}</Badge>;
//     }
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

//   return (
//     <div className="space-y-6 w-full">
//       <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white p-6 shadow-lg">
//         <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tutor Upgrade Applications</h2>
//         <p className="text-white/90 mt-1">Review and manage tutor upgrade requests for genius and verified packages.</p>
//       </div>

//       {/* Filters and Search */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Filters & Search</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <Label htmlFor="status-filter">Status</Label>
//               <Select value={statusFilter} onValueChange={setStatusFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Statuses</SelectItem>
//                   <SelectItem value="pending">Pending</SelectItem>
//                   <SelectItem value="approved">Approved</SelectItem>
//                   <SelectItem value="rejected">Rejected</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="type-filter">Type</Label>
//               <Select value={typeFilter} onValueChange={setTypeFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Filter by type" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="genius">Genius</SelectItem>
//                   <SelectItem value="verified">Verified</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//             <div>
//               <Label htmlFor="search">Search</Label>
//               <Input
//                 id="search"
//                 placeholder="Search by name, email, or transaction ID"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <div className="flex items-end">
//               <Button onClick={fetchApplications} variant="outline" className="w-full">
//                 Refresh
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Applications Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <span>Upgrade Applications</span>
//             <Badge variant="outline" className="ml-2">{filteredApplications.length}</Badge>
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           {loading ? (
//             <div className="text-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
//               <p className="mt-2 text-muted-foreground">Loading applications...</p>
//             </div>
//           ) : filteredApplications.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               <AlertCircle className="mx-auto h-8 w-8 mb-2" />
//               <p>No upgrade applications found.</p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {filteredApplications.map((application) => (
//                 <Card key={application.id} className="p-4">
//                   <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
//                     <div className="flex-1 space-y-3">
//                       <div className="flex items-center gap-4">
//                         <div>
//                           <h3 className="font-semibold text-lg">{application.full_name}</h3>
//                           <p className="text-sm text-muted-foreground">{application.email}</p>
//                         </div>
//                         {getStatusBadge(application.application_status)}
//                         {getTypeBadge(application.application_type)}
//                       </div>
                      
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                         <div className="flex items-center gap-2">
//                           <DollarSign className="h-4 w-4 text-green-600" />
//                           <span>৳{application.payment_amount}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <CreditCard className="h-4 w-4 text-blue-600" />
//                           <span>{application.payment_method}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Phone className="h-4 w-4 text-purple-600" />
//                           <span>{application.phone_number}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <Clock className="h-4 w-4 text-gray-600" />
//                           <span>{formatDate(application.created_at)}</span>
//                         </div>
//                       </div>

//                       <div className="text-sm">
//                         <span className="font-medium">Transaction ID:</span> {application.transaction_id}
//                       </div>

//                       {application.admin_note && (
//                         <div className="text-sm bg-gray-50 p-2 rounded">
//                           <span className="font-medium">Admin Note:</span> {application.admin_note}
//                         </div>
//                       )}
//                     </div>

//                     <div className="flex flex-col gap-2">
//                       {application.application_status === 'pending' && (
//                         <>
//                           <Button
//                             size="sm"
//                             className="bg-green-600 hover:bg-green-700"
//                             onClick={() => handleAction(application, 'approve')}
//                           >
//                             <CheckCircle2 className="h-4 w-4 mr-1" />
//                             Approve
//                           </Button>
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => handleAction(application, 'reject')}
//                           >
//                             <XCircle className="h-4 w-4 mr-1" />
//                             Reject
//                           </Button>
//                         </>
//                       )}
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         onClick={() => {
//                           setSelectedApplication(application);
//                           setShowActionModal(true);
//                         }}
//                       >
//                         <Eye className="h-4 w-4 mr-1" />
//                         View Details
//                       </Button>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center justify-between">
//               <div className="text-sm text-muted-foreground">
//                 Page {currentPage} of {totalPages}
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                   disabled={currentPage === 1}
//                 >
//                   Previous
//                 </Button>
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
//                   disabled={currentPage === totalPages}
//                 >
//                   Next
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Action Modal */}
//       <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>
//               {actionType === 'approve' ? 'Approve' : 'Reject'} Application
//             </DialogTitle>
//             <DialogDescription>
//               {actionType === 'approve' 
//                 ? 'This will approve the upgrade application and activate the package for the tutor.'
//                 : 'This will reject the upgrade application. Please provide a reason for rejection.'
//               }
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             {selectedApplication && (
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <h4 className="font-medium mb-2">Application Details</h4>
//                 <div className="text-sm space-y-1">
//                   <p><span className="font-medium">Tutor:</span> {selectedApplication.full_name}</p>
//                   <p><span className="font-medium">Package:</span> {selectedApplication.package_name}</p>
//                   <p><span className="font-medium">Amount:</span> ৳{selectedApplication.payment_amount}</p>
//                   <p><span className="font-medium">Payment Method:</span> {selectedApplication.payment_method}</p>
//                   <p><span className="font-medium">Transaction ID:</span> {selectedApplication.transaction_id}</p>
//                   <p><span className="font-medium">Phone:</span> {selectedApplication.phone_number}</p>
//                 </div>
//               </div>
//             )}

//             {actionType === 'reject' && (
//               <div>
//                 <Label htmlFor="admin-note">Reason for Rejection</Label>
//                 <Textarea
//                   id="admin-note"
//                   placeholder="Please provide a reason for rejecting this application..."
//                   value={adminNote}
//                   onChange={(e) => setAdminNote(e.target.value)}
//                   rows={3}
//                 />
//               </div>
//             )}
//           </div>

//           <DialogFooter>
//             <Button variant="outline" onClick={() => setShowActionModal(false)}>
//               Cancel
//             </Button>
//             <Button
//               onClick={submitAction}
//               disabled={processing || (actionType === 'reject' && !adminNote.trim())}
//               className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
//             >
//               {processing ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }
