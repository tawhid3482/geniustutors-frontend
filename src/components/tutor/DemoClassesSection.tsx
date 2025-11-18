'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Calendar, Clock, User, BookOpen, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { demoClassService, DemoClass } from '@/services/demoClassService';

interface DemoClassesSectionProps {
  tutorId: string;
}

export function DemoClassesSection({ tutorId }: DemoClassesSectionProps) {
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDemoClass, setSelectedDemoClass] = useState<DemoClass | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'complete'>('accept');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch demo classes
  const fetchDemoClasses = async () => {
    try {
      setIsLoading(true);
      const data = await demoClassService.getDemoClasses(tutorId);
      setDemoClasses(data);
    } catch (error) {
      console.error('Error fetching demo classes:', error);
      toast({
        title: "Error",
        description: "Failed to load demo classes",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoClasses();
  }, [tutorId]);

  // Handle demo class action
  const handleDemoClassAction = async () => {
    if (!selectedDemoClass) return;

    setIsProcessing(true);
    try {
      switch (actionType) {
        case 'accept':
          await demoClassService.acceptDemoClass(selectedDemoClass.id, notes);
          toast({
            title: "Success",
            description: "Demo class accepted successfully",
          });
          break;
        case 'reject':
          await demoClassService.rejectDemoClass(selectedDemoClass.id, notes);
          toast({
            title: "Success",
            description: "Demo class rejected successfully",
          });
          break;
        case 'complete':
          await demoClassService.completeDemoClass(selectedDemoClass.id, feedback);
          toast({
            title: "Success",
            description: "Demo class completed successfully",
          });
          break;
      }
      
      setShowActionModal(false);
      setNotes('');
      setFeedback('');
      fetchDemoClasses(); // Refresh the list
    } catch (error) {
      console.error('Error processing demo class action:', error);
      toast({
        title: "Error",
        description: "Failed to process action",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Open action modal
  const openActionModal = (demoClass: DemoClass, type: 'accept' | 'reject' | 'complete') => {
    setSelectedDemoClass(demoClass);
    setActionType(type);
    setNotes('');
    setFeedback('');
    setShowActionModal(true);
  };

  // View demo class details
  const viewDemoClassDetails = (demoClass: DemoClass) => {
    setSelectedDemoClass(demoClass);
    setShowDetailsModal(true);
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default" className="bg-green-600">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-600">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Demo Classes
          </CardTitle>
          <CardDescription>
            Manage your demo class requests and sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : demoClasses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No demo classes found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {demoClasses.map((demoClass) => (
                <Card key={demoClass.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{demoClass.student_name}</span>
                          {renderStatusBadge(demoClass.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(demoClass.requested_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {demoClass.duration} minutes
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <span className="font-medium">Subject:</span> {demoClass.subject}
                        </div>
                        
                        {demoClass.student_notes && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Student Notes:</span> {demoClass.student_notes}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDemoClassDetails(demoClass)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        
                        {demoClass.status === 'pending' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => openActionModal(demoClass, 'accept')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => openActionModal(demoClass, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        
                        {demoClass.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => openActionModal(demoClass, 'complete')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Complete
                          </Button>
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

      {/* Demo Class Details Modal */}
      {selectedDemoClass && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Demo Class Details</DialogTitle>
              <DialogDescription>
                Detailed information about the demo class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student</Label>
                  <p className="text-base">{selectedDemoClass.student_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                  <p className="text-base">{selectedDemoClass.subject}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                  <p className="text-base">{formatDate(selectedDemoClass.requested_date)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                  <p className="text-base">{selectedDemoClass.duration} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <div className="mt-1">{renderStatusBadge(selectedDemoClass.status)}</div>
                </div>
              </div>
              
              {/* Student Contact Information */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Student Contact Information</h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedDemoClass.student_email && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-muted-foreground w-16">Email:</Label>
                      <a 
                        href={`mailto:${selectedDemoClass.student_email}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {selectedDemoClass.student_email}
                      </a>
                    </div>
                  )}
                  {selectedDemoClass.student_phone && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-medium text-muted-foreground w-16">Phone:</Label>
                      <a 
                        href={`tel:${selectedDemoClass.student_phone}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {selectedDemoClass.student_phone}
                      </a>
                    </div>
                  )}
                  {!selectedDemoClass.student_email && !selectedDemoClass.student_phone && (
                    <p className="text-sm text-muted-foreground">No contact information available</p>
                  )}
                </div>
              </div>
              
              {selectedDemoClass.student_notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student Notes</Label>
                  <p className="text-base mt-1">{selectedDemoClass.student_notes}</p>
                </div>
              )}
              
              {selectedDemoClass.tutor_notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Your Notes</Label>
                  <p className="text-base mt-1">{selectedDemoClass.tutor_notes}</p>
                </div>
              )}
              
              {selectedDemoClass.feedback && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Feedback</Label>
                  <p className="text-base mt-1">{selectedDemoClass.feedback}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
              {selectedDemoClass.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openActionModal(selectedDemoClass, 'accept');
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Accept
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowDetailsModal(false);
                      openActionModal(selectedDemoClass, 'reject');
                    }}
                  >
                    Reject
                  </Button>
                </div>
              )}
              {selectedDemoClass.status === 'accepted' && (
                <Button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openActionModal(selectedDemoClass, 'complete');
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Mark Complete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'accept' && 'Accept Demo Class'}
              {actionType === 'reject' && 'Reject Demo Class'}
              {actionType === 'complete' && 'Complete Demo Class'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'accept' && 'Add any notes for the student'}
              {actionType === 'reject' && 'Provide a reason for rejection'}
              {actionType === 'complete' && 'Add feedback about the demo class'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedDemoClass && (
              <div className="p-4 border rounded-lg bg-muted/20">
                <p className="font-medium">{selectedDemoClass.student_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedDemoClass.subject} - {formatDate(selectedDemoClass.requested_date)}
                </p>
              </div>
            )}
            
            {(actionType === 'accept' || actionType === 'reject') && (
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder={
                    actionType === 'accept' 
                      ? "Add any notes for the student..." 
                      : "Provide a reason for rejection..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            
            {actionType === 'complete' && (
              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  placeholder="Add feedback about the demo class..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDemoClassAction}
              disabled={isProcessing}
              className={
                actionType === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                actionType === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  {actionType === 'accept' && 'Accept'}
                  {actionType === 'reject' && 'Reject'}
                  {actionType === 'complete' && 'Complete'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
