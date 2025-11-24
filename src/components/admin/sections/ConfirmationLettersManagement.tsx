'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, RefreshCw, Eye, FileCheck, User, Calendar, MapPin, BookOpen, Clock, CheckCircle, GraduationCap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { approvalLetterService, ApprovalLetter } from '@/services/approvalLetterService';

interface ConfirmationLettersManagementProps {
  // No props needed for admin view
}

export function ConfirmationLettersManagement({}: ConfirmationLettersManagementProps) {
  const { toast } = useToast();
  const [confirmationLetters, setConfirmationLetters] = useState<ApprovalLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<ApprovalLetter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch all confirmation letters (approved letters with student confirmed)
  const fetchConfirmationLetters = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const result = await approvalLetterService.getAllApprovalLetters();
      if (result.success) {
        // Filter for confirmation letters (approved and student confirmed)
        const confirmedLetters = result.data.filter(letter => 
          letter.status === 'approved' && letter.student_status === 'confirmed'
        );
        setConfirmationLetters(confirmedLetters);
        if (isRefresh) {
          toast({
            title: 'Success',
            description: 'Confirmation letters refreshed successfully',
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
      console.error('Error fetching confirmation letters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch confirmation letters',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConfirmationLetters();
  }, []);

  // View letter details
  const viewLetterDetails = (letter: ApprovalLetter) => {
    setSelectedLetter(letter);
    setShowDetailsModal(true);
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

  // Filter letters by student status
  const confirmedLetters = confirmationLetters.filter(letter => letter.student_status === 'confirmed');
  const pendingStudentResponse = confirmationLetters.filter(letter => letter.student_status === 'pending');
  const rejectedByStudent = confirmationLetters.filter(letter => letter.student_status === 'rejected');

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
          <TableHead>Student Status</TableHead>
          <TableHead>Confirmed Date</TableHead>
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
              <TableCell>{renderStudentStatusBadge(letter.student_status)}</TableCell>
              <TableCell>
                {letter.student_updated_at ? (
                  new Date(letter.student_updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => viewLetterDetails(letter)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8">
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
              <FileCheck className="w-5 h-5 mr-2" />
              Confirmation Letters Management
            </CardTitle>
            <Button
              onClick={() => fetchConfirmationLetters(true)}
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
          <Tabs defaultValue="confirmed">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="confirmed">
                Confirmed ({confirmedLetters.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending Student Response ({pendingStudentResponse.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected by Student ({rejectedByStudent.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="confirmed" className="mt-4">
              {renderLetterTable(confirmedLetters, 'confirmed')}
            </TabsContent>
            <TabsContent value="pending" className="mt-4">
              {renderLetterTable(pendingStudentResponse, 'pending student response')}
            </TabsContent>
            <TabsContent value="rejected" className="mt-4">
              {renderLetterTable(rejectedByStudent, 'rejected by student')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Letter Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileCheck className="w-5 h-5 mr-2" />
              Confirmation Letter Details
            </DialogTitle>
            <DialogDescription>
              Complete information about the confirmation letter
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
                    <div><strong>Admin Status:</strong> <Badge variant="default">Approved</Badge></div>
                    <div><strong>Student Status:</strong> {renderStudentStatusBadge(selectedLetter.student_status)}</div>
                  </div>
                  <div><strong>Approved:</strong> {new Date(selectedLetter.approved_at || selectedLetter.created_at).toLocaleString()}</div>
                  {selectedLetter.approved_by_name && (
                    <div><strong>Approved By:</strong> {selectedLetter.approved_by_name}</div>
                  )}
                  {selectedLetter.student_updated_at && (
                    <div><strong>Student Response:</strong> {new Date(selectedLetter.student_updated_at).toLocaleString()}</div>
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

              {/* Confirmation Summary */}
              {selectedLetter.student_status === 'confirmed' && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center text-green-800">
                      <GraduationCap className="w-5 h-5 mr-2" />
                      Confirmation Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-green-700">
                      <p className="font-medium">This tutoring arrangement has been confirmed!</p>
                      <p className="text-sm mt-2">
                        The student has accepted the approval letter and confirmed their participation in the tutoring program.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
