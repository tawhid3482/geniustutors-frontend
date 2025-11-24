import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Search,
  Filter,
  Download,
  FileText,
  User,
  Mail,
  Phone,
  Trash2
} from 'lucide-react';
import { 
  getUpgradeApplications,
  getUpgradeApplication,
  updateApplicationStatus,
  deleteUpgradeApplication,
  type UpgradeApplication
} from '@/services/upgradeService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useRole } from "@/contexts/RoleContext";

const UpgradeApplicationsManagement = () => {
  const { toast } = useToast();
  const { canDelete } = useRole();
  const [applications, setApplications] = useState<UpgradeApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<UpgradeApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionStatus, setActionStatus] = useState<'approved' | 'rejected'>('approved');
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      // Convert "all" to undefined for API calls
      const statusParam = statusFilter === 'all' ? undefined : statusFilter;
      const typeParam = typeFilter === 'all' ? undefined : typeFilter;
      const response = await getUpgradeApplications(statusParam, typeParam, currentPage, 10);
      
      if (response.success) {
        setApplications(response.data.applications);
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch applications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (applicationId: string) => {
    try {
      const response = await getUpgradeApplication(applicationId);
      if (response.success) {
        setSelectedApplication(response.data);
        setShowDetailsModal(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch application details',
        variant: 'destructive'
      });
    }
  };

  const handleAction = async () => {
    if (!selectedApplication) return;

    try {
      setSubmitting(true);
      const response = await updateApplicationStatus(
        selectedApplication.id,
        actionStatus,
        adminNote
      );

      if (response.success) {
        toast({
          title: 'Success',
          description: `Application ${actionStatus} successfully`,
        });
        setShowActionModal(false);
        setShowDetailsModal(false);
        setSelectedApplication(null);
        setAdminNote('');
        fetchApplications(); // Refresh the list
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update application status',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;

    try {
      setSubmitting(true);
      const response = await deleteUpgradeApplication(selectedApplication.id);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Application deleted successfully',
        });
        setShowDeleteModal(false);
        setSelectedApplication(null);
        fetchApplications(); // Refresh the list
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete application',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string, packageName?: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Shield className="h-3 w-3 mr-1" />
          Genius
        </Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredApplications = applications.filter(app => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        app.full_name?.toLowerCase().includes(searchLower) ||
        app.email?.toLowerCase().includes(searchLower) ||
        app.package_name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Upgrade Applications Management
          </CardTitle>
          <CardDescription>
            Review and manage tutor upgrade applications for genius and verified status, including legacy genius tutor applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="genius">Genius</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchApplications} className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading applications...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">{application.full_name}</h3>
                            {getTypeBadge(application.application_type, application.package_name)}
                            {getStatusBadge(application.application_status)}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {application.email}
                            </div>
                            {application.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {application.phone}
                              </div>
                            )}
                            {application.phone_number && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                <span className="font-medium">Payment Phone:</span> {application.phone_number}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Shield className="h-3 w-3" />
                              {application.package_name} - ৳{application.payment_amount}
                            </div>
                            <div className="text-xs text-gray-500">
                              Applied: {new Date(application.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(application.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {application.application_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setActionStatus('approved');
                                setShowActionModal(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setActionStatus('rejected');
                                setShowActionModal(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredApplications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No applications found
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalItems)} of {totalItems} applications
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the complete application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              {/* User Information */}
              <div>
                <h3 className="font-medium mb-2">Applicant Information</h3>
                <div className="grid gap-2 text-sm">
                  <div><strong>Name:</strong> {selectedApplication.full_name}</div>
                  <div><strong>Email:</strong> {selectedApplication.email}</div>
                  {selectedApplication.phone && (
                    <div><strong>Phone:</strong> {selectedApplication.phone}</div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Package Information */}
              <div>
                <h3 className="font-medium mb-2">Package Information</h3>
                <div className="grid gap-2 text-sm">
                  <div><strong>Package:</strong> {selectedApplication.package_name}</div>
                  <div><strong>Type:</strong> {getTypeBadge(selectedApplication.application_type, selectedApplication.package_name)}</div>
                  <div><strong>Amount:</strong> ৳{selectedApplication.payment_amount}</div>
                  <div><strong>Payment Method:</strong> {selectedApplication.payment_method}</div>
                  <div><strong>Transaction ID:</strong> {selectedApplication.transaction_id}</div>
                  <div><strong>Payment Phone:</strong> {selectedApplication.phone_number}</div>
                </div>
              </div>

              <Separator />

              {/* KYC Documents */}
              {selectedApplication.application_type === 'verified' && selectedApplication.kyc_documents && (
                <div>
                  <h3 className="font-medium mb-2">KYC Documents</h3>
                  <div className="space-y-2">
                    {Object.entries(selectedApplication.kyc_documents || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="text-gray-600">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Status Information */}
              <div>
                <h3 className="font-medium mb-2">Status Information</h3>
                <div className="grid gap-2 text-sm">
                  <div><strong>Status:</strong> {getStatusBadge(selectedApplication.application_status)}</div>
                  <div><strong>Applied:</strong> {new Date(selectedApplication.created_at).toLocaleString()}</div>
                  {selectedApplication.admin_note && (
                    <div>
                      <strong>Admin Note:</strong>
                      <div className="mt-1 p-2 bg-gray-50 rounded text-gray-700">
                        {selectedApplication.admin_note}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {selectedApplication?.application_status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setActionStatus('rejected');
                    setShowActionModal(true);
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setActionStatus('approved');
                    setShowActionModal(true);
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionStatus === 'approved' ? 'Approve' : 'Reject'} Application
            </DialogTitle>
            <DialogDescription>
              {actionStatus === 'approved' 
                ? 'Are you sure you want to approve this application? The user will receive the upgrade immediately.'
                : 'Are you sure you want to reject this application? Please provide a reason.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {actionStatus === 'rejected' && (
              <div>
                <Label htmlFor="admin-note">Reason for Rejection</Label>
                <Textarea
                  id="admin-note"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            )}
            
            {actionStatus === 'approved' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  This will immediately grant the user access to {selectedApplication?.package_name} features.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              disabled={submitting || (actionStatus === 'rejected' && !adminNote.trim())}
              className={actionStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {submitting ? 'Processing...' : actionStatus === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Application Details:</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Applicant:</strong> {selectedApplication.full_name}</div>
                  <div><strong>Package:</strong> {selectedApplication.package_name}</div>
                  <div><strong>Amount:</strong> ৳{selectedApplication.payment_amount}</div>
                  <div><strong>Status:</strong> {getStatusBadge(selectedApplication.application_status)}</div>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  <strong>Warning:</strong> This will permanently delete the application record. 
                  If the application was approved, the user will retain their upgrade status.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Deleting...' : 'Delete Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpgradeApplicationsManagement;
