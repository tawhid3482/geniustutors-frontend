'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import { approvalLetterService, ApprovalLetter } from '@/services/approvalLetterService';
import { useToast } from '@/hooks/use-toast';

interface ConfirmationLetterSectionProps {
  tutorId: string;
}

const ConfirmationLetterSection = ({ tutorId }: ConfirmationLetterSectionProps) => {
  const { toast } = useToast();
  const [confirmationLetters, setConfirmationLetters] = useState<ApprovalLetter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<ApprovalLetter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch confirmation letters for tutor
  const fetchConfirmationLetters = async () => {
    try {
      setIsLoading(true);
      const data = await approvalLetterService.getApprovalLettersForTutor(tutorId);
      // Filter only approved and confirmed letters (these are confirmation letters)
      const confirmedLetters = data.filter(letter => 
        letter.status === 'approved' && letter.student_status === 'confirmed'
      );
      setConfirmationLetters(confirmedLetters);
    } catch (error) {
      console.error('Error fetching confirmation letters:', error);
      toast({
        title: "Error",
        description: "Failed to fetch confirmation letters",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tutorId) {
      fetchConfirmationLetters();
    }
  }, [tutorId]);

  // View confirmation letter details
  const viewConfirmationLetterDetails = (letter: ApprovalLetter) => {
    setSelectedLetter(letter);
    setShowDetailsModal(true);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-300", text: "Confirmed" },
      pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "Pending" },
      rejected: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-300", text: "Rejected" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  // Render student status badge
  const renderStudentStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { variant: "default" as const, className: "bg-green-100 text-green-800 border-green-300", text: "Confirmed" },
      pending: { variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800 border-yellow-300", text: "Pending" },
      rejected: { variant: "destructive" as const, className: "bg-red-100 text-red-800 border-red-300", text: "Rejected" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
              <FileCheck className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-800">Confirmation Letters</h2>
          </div>
          <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading confirmation letters...</p>
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileCheck className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">Confirmation Letters</CardTitle>
              <CardDescription>
                Letters confirming your final assignment as a tutor for students
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {confirmationLetters.length === 0 ? (
            <div className="text-center py-12">
              <FileCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No confirmation letters available</h3>
              <p className="text-gray-500">Your confirmation letters will appear here once students confirm your assignments.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {confirmationLetters.map((letter) => (
                <Card key={letter.id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500 bg-green-50/30">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        {/* Header with Student Info and Status */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <User className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-lg">{letter.student_name}</span>
                            </div>
                            {renderStatusBadge(letter.status)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Student Status:</span>
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
                          <div className="flex items-center gap-2 text-sm">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Class:</span>
                            <span>{letter.student_class || 'Not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Location:</span>
                            <span>{letter.district}, {letter.area}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Type:</span>
                            <span>{letter.tutoring_type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Duration:</span>
                            <span>{letter.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Schedule:</span>
                            <span>{letter.schedule}</span>
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Email:</span>
                            <span>{letter.student_email}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Phone:</span>
                            <span>{letter.student_phone}</span>
                          </div>
                        </div>

                        {/* Admin Notes */}
                        {letter.admin_notes && (
                          <div className="pt-2 border-t">
                            <div className="flex items-start gap-2 text-sm">
                              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="font-medium">Admin Notes:</span>
                                <p className="text-muted-foreground mt-1">{letter.admin_notes}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Confirmation Date */}
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Confirmed on:</span>
                            <span>{formatDate(letter.student_updated_at || letter.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewConfirmationLetterDetails(letter)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-green-600" />
              Confirmation Letter Details
            </DialogTitle>
            <DialogDescription>
              Complete details of the confirmation letter
            </DialogDescription>
          </DialogHeader>
          
          {selectedLetter && (
            <div className="space-y-6">
              {/* Student Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Student Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p>{selectedLetter.student_name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p>{selectedLetter.student_email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span>
                    <p>{selectedLetter.student_phone}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <div className="mt-1">{renderStudentStatusBadge(selectedLetter.student_status || 'pending')}</div>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Assignment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <span className="font-medium">Subject:</span>
                    <p>{selectedLetter.subject}</p>
                  </div>
                  <div>
                    <span className="font-medium">Class:</span>
                    <p>{selectedLetter.student_class || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="font-medium">District:</span>
                    <p>{selectedLetter.district}</p>
                  </div>
                  <div>
                    <span className="font-medium">Area:</span>
                    <p>{selectedLetter.area}</p>
                  </div>
                  <div>
                    <span className="font-medium">Tutoring Type:</span>
                    <p>{selectedLetter.tutoring_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Medium:</span>
                    <p>{selectedLetter.medium}</p>
                  </div>
                  <div>
                    <span className="font-medium">Schedule:</span>
                    <p>{selectedLetter.schedule}</p>
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span>
                    <p>{selectedLetter.duration} minutes</p>
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedLetter.admin_notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Admin Notes
                  </h3>
                  <p className="text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {selectedLetter.admin_notes}
                  </p>
                </div>
              )}

              {/* Student Notes */}
              {selectedLetter.student_notes && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Student Notes
                  </h3>
                  <p className="text-muted-foreground bg-gray-50 p-3 rounded-lg">
                    {selectedLetter.student_notes}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Created:</span>
                    <span>{formatDate(selectedLetter.created_at)}</span>
                  </div>
                  {selectedLetter.approved_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Approved:</span>
                      <span>{formatDate(selectedLetter.approved_at)}</span>
                    </div>
                  )}
                  {selectedLetter.student_updated_at && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Student Confirmed:</span>
                      <span>{formatDate(selectedLetter.student_updated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConfirmationLetterSection;
