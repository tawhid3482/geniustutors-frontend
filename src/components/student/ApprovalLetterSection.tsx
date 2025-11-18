'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileCheck, 
  User, 
  Calendar, 
  MapPin, 
  BookOpen, 
  Clock, 
  Download,
  Eye,
  CheckCircle,
  GraduationCap,
  Users,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  MessageSquare
} from "lucide-react";
import { approvalLetterService, ApprovalLetter, StudentStatusUpdateData } from '@/services/approvalLetterService';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

interface ApprovalLetterSectionProps {
  studentId: string;
}

export function ApprovalLetterSection({ studentId }: ApprovalLetterSectionProps) {
  const { toast } = useToast();
  const [approvalLetters, setApprovalLetters] = useState<ApprovalLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<ApprovalLetter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<StudentStatusUpdateData>({
    student_status: 'confirmed',
    student_notes: ''
  });

  // Fetch approval letters
  const fetchApprovalLetters = async () => {
    try {
      setIsLoading(true);
      const data = await approvalLetterService.getApprovalLettersForStudent(studentId);
      setApprovalLetters(data);
    } catch (error) {
      console.error('Error fetching approval letters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovalLetters();
  }, [studentId]);

  // View approval letter details
  const viewApprovalLetterDetails = (letter: ApprovalLetter) => {
    setSelectedLetter(letter);
    setShowDetailsModal(true);
  };

  // Open status update modal
  const openStatusUpdateModal = (letter: ApprovalLetter, status: 'confirmed' | 'rejected') => {
    setSelectedLetter(letter);
    setStatusUpdateData({
      student_status: status,
      student_notes: ''
    });
    setShowStatusUpdateModal(true);
  };

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!selectedLetter) return;

    try {
      setIsUpdatingStatus(true);
      console.log('Updating status for letter:', selectedLetter.id, 'with data:', statusUpdateData);
      
      const response = await approvalLetterService.updateStudentStatus(selectedLetter.id, statusUpdateData);
      console.log('Response from service:', response);
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message,
        });
        setShowStatusUpdateModal(false);
        fetchApprovalLetters(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: response.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update approval letter status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Download approval letter
  const downloadApprovalLetter = (letter: ApprovalLetter) => {
    // Create a downloadable PDF or document
    const content = generateApprovalLetterContent(letter);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `approval-letter-${letter.tutor_name}-${new Date(letter.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate approval letter content
  const generateApprovalLetterContent = (letter: ApprovalLetter) => {
    return `
GENIUS TUTOR - TUTOR ASSIGNMENT APPROVAL LETTER

Date: ${new Date(letter.created_at).toLocaleDateString()}
Approval Letter ID: ${letter.id}

Dear ${letter.student_name},

We are pleased to inform you that your tutor assignment has been officially approved and confirmed.

ASSIGNMENT DETAILS:
- Tutor Name: ${letter.tutor_name}
- Subject: ${letter.subject}
- Class: ${letter.student_class || 'N/A'}
- Location: ${letter.district}, ${letter.area}
- Tutoring Type: ${letter.tutoring_type}
- Medium: ${letter.medium}
- Schedule: ${letter.schedule}
- Duration: ${letter.duration} minutes per session

TUTOR CONTACT INFORMATION:
- Email: ${letter.tutor_email}
- Phone: ${letter.tutor_phone}

ASSIGNMENT STATUS: APPROVED
Approval Date: ${letter.approved_at ? new Date(letter.approved_at).toLocaleDateString() : 'N/A'}
Approved By: ${letter.approved_by_name} (Admin)

TERMS AND CONDITIONS:
1. This approval is valid for the duration specified in your original request.
2. Please maintain regular communication with your assigned tutor.
3. Any changes to the schedule must be communicated in advance.
4. Payment terms are as agreed upon in your original request.

${letter.admin_notes ? `ADMIN NOTES:\n${letter.admin_notes}\n` : ''}

Congratulations on your successful tutor assignment! We wish you the best in your learning journey.

Best regards,
Genius Tutor Administration Team

---
This is an official approval letter from Genius Tutor Platform.
For any queries, please contact our support team.
    `.trim();
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Render student status badge
  const renderStudentStatusBadge = (studentStatus: string) => {
    switch (studentStatus) {
      case 'confirmed':
        return <Badge variant="default" className="bg-blue-600">Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            Tutor Assignment Approval Letters
          </CardTitle>
          <CardDescription>
            Official approval letters for your confirmed tutor assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : approvalLetters.length === 0 ? (
            <div className="text-center py-8">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No approval letters available yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Approval letters will appear here once your tutor assignments are confirmed by admin
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {approvalLetters.map((letter) => (
                <Card key={letter.id} className={`hover:shadow-md transition-shadow border-l-4 ${
                  letter.status === 'approved' && (!letter.student_status || letter.student_status === 'pending')
                    ? 'border-l-blue-500 bg-blue-50/30'
                    : 'border-l-green-500'
                }`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        {/* Header with Tutor Info and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-lg">{letter.tutor_name}</span>
                              {letter.status === 'approved' && (!letter.student_status || letter.student_status === 'pending') && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 animate-pulse">
                                  Action Required
                                </Badge>
                              )}
                            </div>
                            {renderStatusBadge(letter.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Your Status:</span>
                            {renderStudentStatusBadge(letter.student_status || 'pending')}
                          </div>
                        </div>
                        
                        {/* Assignment Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Subject:</span>
                            <span>{letter.subject}</span>
                          </div>
                          {letter.student_class && (
                            <div className="flex items-center gap-2 text-sm">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Class:</span>
                              <span>{letter.student_class}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Location and Schedule */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="font-medium">Location:</span>
                            <span>{letter.district}, {letter.area}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Schedule:</span>
                            <span>{letter.schedule}</span>
                          </div>
                        </div>
                        
                        {/* Approval Information */}
                        <div className="bg-green-50 p-3 rounded-md">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-800">Approved on:</span>
                            <span className="text-green-700">{formatDate(letter.approved_at)}</span>
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            Approved by: {letter.approved_by_name}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewApprovalLetterDetails(letter)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Letter
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => downloadApprovalLetter(letter)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        
                        {/* Status Update Buttons - Only show if admin approved and student hasn't responded */}
                        {letter.status === 'approved' && (!letter.student_status || letter.student_status === 'pending') && (
                          <>
                            <div className="text-xs text-center text-muted-foreground mb-1">
                              Action Required
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openStatusUpdateModal(letter, 'confirmed')}
                              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Confirm
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openStatusUpdateModal(letter, 'rejected')}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                        
                        {/* Show message when admin hasn't approved yet */}
                        {letter.status === 'pending' && (
                          <div className="text-xs text-center text-muted-foreground">
                            Waiting for admin approval
                          </div>
                        )}
                        
                        {/* Show message when student has already responded */}
                        {letter.status === 'approved' && letter.student_status && letter.student_status !== 'pending' && (
                          <div className="text-xs text-center text-muted-foreground">
                            You have responded
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Letter Details Modal */}
      {selectedLetter && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Tutor Assignment Approval Letter
              </DialogTitle>
              <DialogDescription>
                Official approval letter for your tutor assignment
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Letter Header */}
              <div className="text-center border-b pb-4">
                <h2 className="text-2xl font-bold text-green-600">GENIUS TUTOR</h2>
                <p className="text-lg font-semibold">Tutor Assignment Approval Letter</p>
                <p className="text-sm text-muted-foreground">
                  Date: {formatDate(selectedLetter.created_at)} | ID: {selectedLetter.id}
                </p>
              </div>

              {/* Student Information */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-blue-800 mb-2">Student Information</h3>
                <p className="text-blue-700">Dear {selectedLetter.student_name},</p>
                <p className="text-blue-700 mt-2">
                  We are pleased to inform you that your tutor assignment has been officially approved and confirmed.
                </p>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tutor Name</label>
                  <p className="text-base font-medium">{selectedLetter.tutor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <p className="text-base">{selectedLetter.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Class</label>
                  <p className="text-base">{selectedLetter.student_class || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p className="text-base">{selectedLetter.district}, {selectedLetter.area}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tutoring Type</label>
                  <p className="text-base">{selectedLetter.tutoring_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medium</label>
                  <p className="text-base">{selectedLetter.medium}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Schedule</label>
                  <p className="text-base">{selectedLetter.schedule}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-base">{selectedLetter.duration} minutes per session</p>
                </div>
              </div>

              {/* Tutor Contact Information */}
              {(selectedLetter.tutor_email || selectedLetter.tutor_phone) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Tutor Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLetter.tutor_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLetter.tutor_email}</span>
                      </div>
                    )}
                    {selectedLetter.tutor_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedLetter.tutor_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Approval Information */}
              <div className="bg-green-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-green-800 mb-2">Approval Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Status</label>
                    <div className="mt-1">{renderStatusBadge(selectedLetter.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Approved Date</label>
                    <p className="text-sm text-green-600">{formatDate(selectedLetter.approved_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Approved By</label>
                    <p className="text-sm text-green-600">{selectedLetter.approved_by_name}</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedLetter.admin_notes && (
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                  <div className="bg-gray-50 p-3 rounded-md mt-2">
                    <p className="text-sm text-gray-800">{selectedLetter.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Terms and Conditions */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Terms and Conditions</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>1. This approval is valid for the duration specified in your original request.</p>
                  <p>2. Please maintain regular communication with your assigned tutor.</p>
                  <p>3. Any changes to the schedule must be communicated in advance.</p>
                  <p>4. Payment terms are as agreed upon in your original request.</p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Congratulations on your successful tutor assignment! We wish you the best in your learning journey.
                </p>
                <p className="text-sm font-medium mt-2">Best regards,</p>
                <p className="text-sm font-medium">Genius Tutor Administration Team</p>
                <p className="text-xs text-muted-foreground mt-4">
                  This is an official approval letter from Genius Tutor Platform.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Update Modal */}
      {selectedLetter && (
        <Dialog open={showStatusUpdateModal} onOpenChange={setShowStatusUpdateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {statusUpdateData.student_status === 'confirmed' ? (
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                {statusUpdateData.student_status === 'confirmed' ? 'Confirm' : 'Reject'} Tutor Assignment
              </DialogTitle>
              <DialogDescription>
                {statusUpdateData.student_status === 'confirmed' 
                  ? 'Confirm that you accept this tutor assignment'
                  : 'Reject this tutor assignment and provide a reason'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Tutor Information */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-2">Tutor Assignment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Tutor:</span> {selectedLetter.tutor_name}
                  </div>
                  <div>
                    <span className="font-medium">Subject:</span> {selectedLetter.subject}
                  </div>
                  <div>
                    <span className="font-medium">Location:</span> {selectedLetter.district}, {selectedLetter.area}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {selectedLetter.duration} minutes
                  </div>
                </div>
              </div>

              {/* Student Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {statusUpdateData.student_status === 'confirmed' ? 'Additional Notes (Optional)' : 'Reason for Rejection *'}
                </label>
                <Textarea
                  value={statusUpdateData.student_notes || ''}
                  onChange={(e) => setStatusUpdateData(prev => ({
                    ...prev,
                    student_notes: e.target.value
                  }))}
                  placeholder={
                    statusUpdateData.student_status === 'confirmed' 
                      ? 'Add any additional notes or comments...'
                      : 'Please provide a reason for rejecting this tutor assignment...'
                  }
                  rows={4}
                  className="resize-none"
                />
                {statusUpdateData.student_status === 'rejected' && (
                  <p className="text-xs text-red-600">
                    Please provide a reason for rejecting this assignment.
                  </p>
                )}
              </div>

              {/* Confirmation Message */}
              <div className={`p-4 rounded-md ${
                statusUpdateData.student_status === 'confirmed' 
                  ? 'bg-blue-50 border border-blue-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${
                  statusUpdateData.student_status === 'confirmed' ? 'text-blue-800' : 'text-red-800'
                }`}>
                  {statusUpdateData.student_status === 'confirmed' 
                    ? 'By confirming, you agree to proceed with this tutor assignment as outlined in the approval letter.'
                    : 'By rejecting, you decline this tutor assignment. This action cannot be undone.'
                  }
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowStatusUpdateModal(false)}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleStatusUpdate}
                disabled={isUpdatingStatus || (statusUpdateData.student_status === 'rejected' && !statusUpdateData.student_notes?.trim())}
                className={
                  statusUpdateData.student_status === 'confirmed' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {statusUpdateData.student_status === 'confirmed' ? 'Confirming...' : 'Rejecting...'}
                  </>
                ) : (
                  <>
                    {statusUpdateData.student_status === 'confirmed' ? (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    {statusUpdateData.student_status === 'confirmed' ? 'Confirm Assignment' : 'Reject Assignment'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
