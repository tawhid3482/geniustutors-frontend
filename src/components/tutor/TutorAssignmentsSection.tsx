import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle2, 
  X as CancelIcon, 
  Info as InfoIcon,
  ClipboardList as AssignmentIcon,
  Loader2 as LoaderIcon
} from 'lucide-react';
import { tutorAssignmentService, TutorAssignment } from '@/services/tutorAssignmentService';
import { formatDate } from '@/utils/dateUtils';

const statusColors = {
  pending: 'yellow',
  accepted: 'green',
  rejected: 'red',
  completed: 'blue',
};

const TutorAssignmentsSection: React.FC = () => {
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<TutorAssignment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<'accepted' | 'rejected' | 'completed'>('accepted');
  const [notes, setNotes] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tutorAssignmentService.getTutorAssignments();
      if (response.success) {
        setAssignments(response.data || []);
      } else {
        setError('Failed to fetch assignments');
      }
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (assignment: TutorAssignment) => {
    setSelectedAssignment(assignment);
    setDetailsOpen(true);
  };

  const handleUpdateStatus = (assignment: TutorAssignment) => {
    setSelectedAssignment(assignment);
    setNewStatus('accepted');
    setNotes(assignment.notes || '');
    setStatusUpdateOpen(true);
  };

  const handleStatusSubmit = async () => {
    if (!selectedAssignment) return;
    
    try {
      setUpdating(true);
      await tutorAssignmentService.updateAssignmentStatus(
        selectedAssignment.id,
        newStatus,
        notes
      );
      
      // Update the local state
      setAssignments(assignments.map(assignment => 
        assignment.id === selectedAssignment.id 
          ? { ...assignment, status: newStatus, notes: notes } 
          : assignment
      ));
      
      setStatusUpdateOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const color = statusColors[status as keyof typeof statusColors] || 'gray';
    const variant = status === 'pending' ? 'outline' : 'default';
    
    const badgeClasses = {
      yellow: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
      green: 'bg-green-100 text-green-800 hover:bg-green-100',
      red: 'bg-red-100 text-red-800 hover:bg-red-100',
      blue: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      gray: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    };
    
    return (
      <Badge 
        className={badgeClasses[color as keyof typeof badgeClasses]}
        variant={variant as any}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AssignmentIcon className="h-5 w-5 text-green-600" />
            Your Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <LoaderIcon className="h-8 w-8 animate-spin text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">Loading assignments...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AssignmentIcon className="h-5 w-5 text-green-600" />
            Your Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-red-50 text-red-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Error Loading Assignments</h3>
            <p className="mb-4">{error}</p>
            <Button onClick={fetchAssignments} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AssignmentIcon className="h-5 w-5 text-green-600" />
            Your Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <AssignmentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Assignments Yet</h3>
              <p className="text-gray-500 mb-4">
                You don't have any tutor assignments at the moment. 
                Check back later or browse available jobs in the Jobs section.
              </p>
              <Button variant="outline" onClick={() => window.location.href = '/dashboard?tab=jobs'}>
                Browse Available Jobs
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Assigned On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.student_name || 'N/A'}</TableCell>
                      <TableCell>{assignment.subject ? assignment.subject.charAt(0).toUpperCase() + assignment.subject.slice(1) : 'N/A'}</TableCell>
                      <TableCell>{assignment.location || 'N/A'}</TableCell>
                      <TableCell>{formatDate(assignment.assigned_at)}</TableCell>
                      <TableCell>{getStatusBadge(assignment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleViewDetails(assignment)}
                            title="View Details"
                          >
                            <InfoIcon className="h-4 w-4" />
                          </Button>
                          {assignment.status === 'pending' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleUpdateStatus(assignment)}
                              title="Update Status"
                              className="text-green-600"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={(open) => setDetailsOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Student</h4>
                <p className="mb-2">{selectedAssignment.student_name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Subject</h4>
                <p className="mb-2">
                  {selectedAssignment.subject ? selectedAssignment.subject.charAt(0).toUpperCase() + selectedAssignment.subject.slice(1) : 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p className="mb-2">{selectedAssignment.location || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Budget</h4>
                <p className="mb-2">
                  {selectedAssignment.budget ? `৳${selectedAssignment.budget}` : 'Not specified'}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Class Level</h4>
                <p className="mb-2">{selectedAssignment.class_level || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Status</h4>
                <p className="mb-2">{getStatusBadge(selectedAssignment.status)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Assigned On</h4>
                <p className="mb-2">{formatDate(selectedAssignment.assigned_at)}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                <p className="mb-2">{formatDate(selectedAssignment.updated_at)}</p>
              </div>
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="mb-2">{selectedAssignment.notes || 'No notes'}</p>
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>Close</Button>
            {selectedAssignment && selectedAssignment.status === 'pending' && (
              <Button 
                onClick={() => {
                  setDetailsOpen(false);
                  handleUpdateStatus(selectedAssignment);
                }}
              >
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={statusUpdateOpen} onOpenChange={(open) => setStatusUpdateOpen(open)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Assignment Status</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-sm font-medium mb-2">
                  Change status for assignment with {selectedAssignment.student_name || 'N/A'} ({selectedAssignment.subject ? selectedAssignment.subject.charAt(0).toUpperCase() + selectedAssignment.subject.slice(1) : 'N/A'})
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    variant={newStatus === 'accepted' ? 'default' : 'outline'}
                    className={newStatus === 'accepted' ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setNewStatus('accepted')}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Accept
                  </Button>
                  <Button 
                    variant={newStatus === 'rejected' ? 'default' : 'outline'}
                    className={newStatus === 'rejected' ? 'bg-red-600 hover:bg-red-700' : ''}
                    onClick={() => setNewStatus('rejected')}
                  >
                    <CancelIcon className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                  <Button 
                    variant={newStatus === 'completed' ? 'default' : 'outline'}
                    className={newStatus === 'completed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    onClick={() => setNewStatus('completed')}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                </div>
              </div>
              
              <div>
                <Textarea
                  placeholder="Add any notes about this status change"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setStatusUpdateOpen(false)} disabled={updating}>
              Cancel
            </Button>
            <Button 
              onClick={handleStatusSubmit} 
              disabled={updating}
            >
              {updating ? <LoaderIcon className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TutorAssignmentsSection;