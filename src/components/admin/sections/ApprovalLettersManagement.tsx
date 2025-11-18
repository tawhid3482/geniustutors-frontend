'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, FileText, User, Calendar, MapPin, BookOpen, Clock, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { approvalLetterService, ApprovalLetter } from '@/services/approvalLetterService';

interface ApprovalLettersManagementProps {
  // No props needed for admin view
}

export function ApprovalLettersManagement({}: ApprovalLettersManagementProps) {
  const { toast } = useToast();
  const [approvalLetters, setApprovalLetters] = useState<ApprovalLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<ApprovalLetter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all approval letters
  const fetchApprovalLetters = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const result = await approvalLetterService.getAllApprovalLetters();
      if (result.success) {
        setApprovalLetters(result.data);
        if (isRefresh) {
          toast({
            title: 'Success',
            description: 'Approval letters refreshed successfully',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching approval letters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch approval letters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApprovalLetters();
  }, []);

  // View letter details
  const viewLetterDetails = (letter: ApprovalLetter) => {
    setSelectedLetter(letter);
    setShowDetailsModal(true);
  };

  // Open action modal (approve/reject)
  const openActionModal = (letter: ApprovalLetter, action: 'approve' | 'reject') => {
    setSelectedLetter(letter);
    setActionType(action);
    setAdminNotes('');
    setShowActionModal(true);
  };

  // Handle approve/reject action
  const handleAction = async () => {
    if (!selectedLetter || !actionType) return;

    try {
      setIsProcessing(true);
      const adminId = localStorage.getItem('userId') || 'admin';
      
      let result;
      if (actionType === 'approve') {
        result = await approvalLetterService.approveLetter(selectedLetter.id, adminId, adminNotes);
      } else {
        result = await approvalLetterService.rejectLetter(selectedLetter.id, adminId, adminNotes);
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        setShowActionModal(false);
        fetchApprovalLetters(true);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error processing action:', error);
      toast({
        title: 'Error',
        description: 'Failed to process action',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Render student status badge
  const renderStudentStatusBadge = (status?: string) => {
    if (!status) return <Badge variant="secondary">Pending</Badge>;
    
    const variants = {
      pending: 'secondary',
      confirmed: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Filter letters by status
  const pendingLetters = approvalLetters.filter(letter => letter.status === 'pending');
  const approvedLetters = approvalLetters.filter(letter => letter.status === 'approved');
  const rejectedLetters = approvalLetters.filter(letter => letter.status === 'rejected');

  // Render letter table
  const renderLetterTable = (letters: ApprovalLetter[], type: string) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Tutor</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Schedule</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Student Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {letters.length > 0 ? (
          letters.map((letter) => (
            <TableRow key={letter.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{letter.student_name || 'N/A'}</span>
                  <span className="text-sm text-gray-500">{letter.student_email || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{letter.tutor_name || 'N/A'}</span>
                  <span className="text-sm text-gray-500">{letter.tutor_email || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{letter.subject}</span>
                  <span className="text-sm text-gray-500">{letter.student_class || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{letter.area}</span>
                  <span className="text-sm text-gray-500">{letter.district}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{letter.schedule}</span>
                  <span className="text-sm text-gray-500">{letter.duration} min</span>
                </div>
              </TableCell>
              <TableCell>{renderStatusBadge(letter.status)}</TableCell>
              <TableCell>{renderStudentStatusBadge(letter.student_status)}</TableCell>
              <TableCell>
                {new Date(letter.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewLetterDetails(letter)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  {letter.status === 'pending' && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => openActionModal(letter, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openActionModal(letter, 'reject')}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8">
              <div className="text-muted-foreground">
                No {type} letters available.
              </div>
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Approval Letters Management
            </CardTitle>
            <Button
              onClick={() => fetchApprovalLetters(true)}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Pending ({pendingLetters.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedLetters.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedLetters.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-4">
              {renderLetterTable(pendingLetters, 'pending')}
            </TabsContent>
            <TabsContent value="approved" className="mt-4">
              {renderLetterTable(approvedLetters, 'approved')}
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              {renderLetterTable(rejectedLetters, 'rejected')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Letter Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Approval Letter Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the approval letter
            </DialogDescription>
          </DialogHeader>
          
          {selectedLetter && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Student Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedLetter.student_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedLetter.student_email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedLetter.student_phone || 'N/A'}</div>
                    <div><strong>Class:</strong> {selectedLetter.student_class || 'N/A'}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Tutor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div><strong>Name:</strong> {selectedLetter.tutor_name || 'N/A'}</div>
                    <div><strong>Email:</strong> {selectedLetter.tutor_email || 'N/A'}</div>
                    <div><strong>Phone:</strong> {selectedLetter.tutor_phone || 'N/A'}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tutoring Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Tutoring Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><strong>Subject:</strong> {selectedLetter.subject}</div>
                    <div><strong>Class:</strong> {selectedLetter.student_class || 'N/A'}</div>
                    <div><strong>Tutoring Type:</strong> {selectedLetter.tutoring_type}</div>
                    <div><strong>Medium:</strong> {selectedLetter.medium}</div>
                    <div><strong>Schedule:</strong> {selectedLetter.schedule}</div>
                    <div><strong>Duration:</strong> {selectedLetter.duration} minutes</div>
                  </div>
                  <div className="mt-4">
                    <strong>Location:</strong> {selectedLetter.area}, {selectedLetter.district}
                  </div>
                </CardContent>
              </Card>

              {/* Status Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Status Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-4">
                    <div><strong>Admin Status:</strong> {renderStatusBadge(selectedLetter.status)}</div>
                    <div><strong>Student Status:</strong> {renderStudentStatusBadge(selectedLetter.student_status)}</div>
                  </div>
                  <div><strong>Created:</strong> {new Date(selectedLetter.created_at).toLocaleString()}</div>
                  {selectedLetter.approved_at && (
                    <div><strong>Processed:</strong> {new Date(selectedLetter.approved_at).toLocaleString()}</div>
                  )}
                  {selectedLetter.approved_by_name && (
                    <div><strong>Processed By:</strong> {selectedLetter.approved_by_name}</div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {(selectedLetter.admin_notes || selectedLetter.student_notes) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedLetter.admin_notes && (
                      <div>
                        <strong>Admin Notes:</strong>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{selectedLetter.admin_notes}</p>
                      </div>
                    )}
                    {selectedLetter.student_notes && (
                      <div>
                        <strong>Student Notes:</strong>
                        <p className="mt-1 p-2 bg-gray-50 rounded">{selectedLetter.student_notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Letter Content */}
              {selectedLetter.letter_content && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Letter Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">
                      {selectedLetter.letter_content}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Modal (Approve/Reject) */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {actionType === 'approve' ? (
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'} Approval Letter
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Are you sure you want to approve this approval letter?' 
                : 'Are you sure you want to reject this approval letter?'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedLetter && (
              <div className="p-4 bg-gray-50 rounded">
                <div><strong>Student:</strong> {selectedLetter.student_name}</div>
                <div><strong>Tutor:</strong> {selectedLetter.tutor_name}</div>
                <div><strong>Subject:</strong> {selectedLetter.subject}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Admin Notes (Optional)</Label>
              <Textarea
                id="adminNotes"
                placeholder="Add any notes about this decision..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowActionModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : actionType === 'approve' ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {actionType === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
