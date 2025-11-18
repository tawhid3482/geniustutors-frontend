'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Clock, User, BookOpen, MessageSquare, MapPin, Phone, Mail, GraduationCap, Users } from "lucide-react";
import { demoClassService, DemoClass } from '@/services/demoClassService';

interface DemoClassesSectionProps {
  studentId: string;
}

export function DemoClassesSection({ studentId }: DemoClassesSectionProps) {
  const [demoClasses, setDemoClasses] = useState<DemoClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDemoClass, setSelectedDemoClass] = useState<DemoClass | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch demo classes
  const fetchDemoClasses = async () => {
    try {
      setIsLoading(true);
      const data = await demoClassService.getDemoClassesForStudent(studentId);
      setDemoClasses(data);
    } catch (error) {
      console.error('Error fetching demo classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoClasses();
  }, [studentId]);

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
            My Demo Classes
          </CardTitle>
          <CardDescription>
            View your scheduled demo classes with tutors
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
              <p className="text-muted-foreground">No demo classes scheduled yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Demo classes will appear here once assigned by an admin
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {demoClasses.map((demoClass) => (
                <Card key={demoClass.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-4 flex-1">
                        {/* Header with Tutor Info and Status */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">{demoClass.tutor_name}</span>
                          </div>
                          {renderStatusBadge(demoClass.status)}
                        </div>
                        
                        {/* Subject and Class Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Subject:</span>
                            <span>{demoClass.subject}</span>
                          </div>
                          {demoClass.student_class && (
                            <div className="flex items-center gap-2 text-sm">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Class:</span>
                              <span>{demoClass.student_class}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Schedule and Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Date & Time:</span>
                            <span>{formatDate(demoClass.requested_date)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className="font-medium">Duration:</span>
                            <span>{demoClass.duration} minutes</span>
                          </div>
                        </div>
                        
                        {/* Location and Type */}
                        {(demoClass.request_district || demoClass.request_area || demoClass.tutoring_type) && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {(demoClass.request_district || demoClass.request_area) && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">Location:</span>
                                <span>{demoClass.request_district}{demoClass.request_area ? `, ${demoClass.request_area}` : ''}</span>
                              </div>
                            )}
                            {demoClass.tutoring_type && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">Type:</span>
                                <span>{demoClass.tutoring_type}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Medium */}
                        {demoClass.medium && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BookOpen className="h-4 w-4" />
                            <span className="font-medium">Medium:</span>
                            <span>{demoClass.medium}</span>
                          </div>
                        )}
                        
                        {/* Student Notes */}
                        {demoClass.student_notes && (
                          <div className="bg-blue-50 p-3 rounded-md">
                            <div className="text-sm">
                              <span className="font-medium text-blue-800">Your Notes:</span>
                              <p className="text-blue-700 mt-1">{demoClass.student_notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => viewDemoClassDetails(demoClass)}
                          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          View Details
                        </button>
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
          <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Demo Class Details</DialogTitle>
              <DialogDescription>
                Detailed information about your demo class
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 overflow-y-auto flex-1 pr-2">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tutor Name</label>
                  <p className="text-base font-medium">{selectedDemoClass.tutor_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subject</label>
                  <p className="text-base">{selectedDemoClass.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date & Time</label>
                  <p className="text-base">{formatDate(selectedDemoClass.requested_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                  <p className="text-base">{selectedDemoClass.duration} minutes</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{renderStatusBadge(selectedDemoClass.status)}</div>
                </div>
                {selectedDemoClass.student_class && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Class</label>
                    <p className="text-base">{selectedDemoClass.student_class}</p>
                  </div>
                )}
              </div>

              {/* Tutor Contact Information */}
              {(selectedDemoClass.tutor_email || selectedDemoClass.tutor_phone) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Tutor Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDemoClass.tutor_email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedDemoClass.tutor_email}</span>
                      </div>
                    )}
                    {selectedDemoClass.tutor_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedDemoClass.tutor_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Location and Type Information */}
              {(selectedDemoClass.request_district || selectedDemoClass.request_area || selectedDemoClass.tutoring_type || selectedDemoClass.medium) && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Class Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedDemoClass.request_district || selectedDemoClass.request_area) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {selectedDemoClass.request_district}{selectedDemoClass.request_area ? `, ${selectedDemoClass.request_area}` : ''}
                        </span>
                      </div>
                    )}
                    {selectedDemoClass.tutoring_type && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedDemoClass.tutoring_type}</span>
                      </div>
                    )}
                    {selectedDemoClass.medium && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedDemoClass.medium}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Notes and Feedback */}
              <div className="space-y-4">
                {selectedDemoClass.student_notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-muted-foreground">Your Notes</label>
                    <div className="bg-blue-50 p-3 rounded-md mt-2">
                      <p className="text-sm text-blue-800">{selectedDemoClass.student_notes}</p>
                    </div>
                  </div>
                )}
                
                {selectedDemoClass.tutor_notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-muted-foreground">Tutor Notes</label>
                    <div className="bg-green-50 p-3 rounded-md mt-2">
                      <p className="text-sm text-green-800">{selectedDemoClass.tutor_notes}</p>
                    </div>
                  </div>
                )}
                
                {selectedDemoClass.admin_notes && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                    <div className="bg-gray-50 p-3 rounded-md mt-2">
                      <p className="text-sm text-gray-800">{selectedDemoClass.admin_notes}</p>
                    </div>
                  </div>
                )}
                
                {selectedDemoClass.feedback && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-muted-foreground">Feedback</label>
                    <div className="bg-yellow-50 p-3 rounded-md mt-2">
                      <p className="text-sm text-yellow-800">{selectedDemoClass.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
