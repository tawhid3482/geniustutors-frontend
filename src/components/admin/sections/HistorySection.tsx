'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  History, 
  Users, 
  TrendingUp,
  Activity,
  Eye,
  BarChart3,
  Clock
} from 'lucide-react';
import historyService, { 
  type HistoryLog, 
  type HistorySummary
} from '@/services/historyService';

export function HistorySection() {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistoryLog[]>([]);
  const [summaryData, setSummaryData] = useState<HistorySummary | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    limit: 20
  });

  // Date range for summary
  const [summaryDateRange, setSummaryDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);


  // Fetch history data
  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      const response = await historyService.getHistory({
        entity_type: '',
        action_type: '',
        start_date: '',
        end_date: '',
        performed_by: '',
        page: 1,
        limit: 20,
        sort_by: 'created_at',
        sort_order: 'DESC'
      });
      setHistoryData(response.data);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error('Error fetching history data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch history data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch summary data
  const fetchSummaryData = async () => {
    try {
      const response = await historyService.getSummary(
        summaryDateRange.start_date || undefined,
        summaryDateRange.end_date || undefined
      );
      setSummaryData(response.data);
    } catch (error: any) {
      console.error('Error fetching summary data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch summary data',
        variant: 'destructive'
      });
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchHistoryData();
    fetchSummaryData();
  }, []);

  // View log details
  const viewLogDetails = (log: HistoryLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  // Format field values for better readability
  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'Not set';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'string' && value.trim() === '') return 'Empty';
    if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : 'None';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  // Get user-friendly field labels
  const getFieldLabel = (key: string): string => {
    const fieldLabels: { [key: string]: string } = {
      // User fields
      'full_name': 'Full Name',
      'email': 'Email Address',
      'phone': 'Phone Number',
      'gender': 'Gender',
      'date_of_birth': 'Date of Birth',
      'address': 'Address',
      'area': 'Area',
      'post_office': 'Post Office',
      'role': 'Role',
      'status': 'Status',
      'is_active': 'Active Status',
      'created_at': 'Created Date',
      'updated_at': 'Updated Date',
      
      // Tutor fields
      'qualification': 'Qualification',
      'experience': 'Experience',
      'subjects': 'Subjects',
      'hourly_rate': 'Hourly Rate',
      'availability': 'Availability',
      'bio': 'Biography',
      'profile_picture': 'Profile Picture',
      'documents': 'Documents',
      'verification_status': 'Verification Status',
      'rating': 'Rating',
      'total_students': 'Total Students',
      
      // Student fields
      'class_level': 'Class Level',
      'institution': 'Institution',
      'parent_name': 'Parent Name',
      'parent_phone': 'Parent Phone',
      'preferred_subjects': 'Preferred Subjects',
      'learning_goals': 'Learning Goals',
      
      // Assignment fields
      'tutor_id': 'Tutor',
      'student_id': 'Student',
      'subject': 'Subject',
      'start_date': 'Start Date',
      'end_date': 'End Date',
      'schedule': 'Schedule',
      'duration': 'Duration',
      'location': 'Location',
      'assignment_type': 'Assignment Type',
      'assignment_status': 'Assignment Status',
      'notes': 'Notes',
      
      // Payment fields
      'amount': 'Amount',
      'payment_method': 'Payment Method',
      'transaction_id': 'Transaction ID',
      'payment_status': 'Payment Status',
      'due_date': 'Due Date',
      'paid_date': 'Paid Date',
      
      // Review fields
      'review_rating': 'Review Rating',
      'comment': 'Comment',
      'review_date': 'Review Date',
      
      // Application fields
      'application_type': 'Application Type',
      'application_status': 'Application Status',
      'submitted_at': 'Submitted Date',
      'reviewed_at': 'Reviewed Date',
      'reviewer_notes': 'Reviewer Notes'
    };
    
    return fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Render formatted values
  const renderFormattedValues = (values: any, title: string) => {
    if (!values || typeof values !== 'object') {
      return (
        <div>
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-sm mt-1 text-muted-foreground">No data available</p>
        </div>
      );
    }

    const entries = Object.entries(values);
    if (entries.length === 0) {
      return (
        <div>
          <Label className="text-sm font-medium">{title}</Label>
          <p className="text-sm mt-1 text-muted-foreground">No changes recorded</p>
        </div>
      );
    }

    return (
      <div>
        <Label className="text-sm font-medium">{title}</Label>
        <div className="mt-2 space-y-3">
          {entries.map(([key, value]) => (
            <div key={key} className="border-l-4 border-blue-200 pl-3 py-2 bg-blue-50 rounded-r">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {getFieldLabel(key)}
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    {formatFieldValue(key, value)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render overview tab
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pagination.total_records}</div>
            <p className="text-xs text-muted-foreground">
              Across all entity types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.recent_activity?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Last 10 activities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.top_performers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active users tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entity Types</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryData?.summary?.reduce((acc, item) => acc + item.count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tracked entities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      {summaryData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Activity Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData.summary.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {historyService.getEntityTypeDisplayName(item.entity_type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {historyService.getActionTypeDisplayName(item.action_type)}
                      </span>
                    </div>
                    <Badge variant="default">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaryData.top_performers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{performer.full_name}</p>
                      <p className="text-sm text-muted-foreground">{performer.email}</p>
                    </div>
                    <Badge variant="secondary">{performer.action_count} actions</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summaryData?.recent_activity?.map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={historyService.getActionTypeBadgeVariant(log.action_type) as any}>
                      {historyService.getActionTypeDisplayName(log.action_type)}
                    </Badge>
                    <Badge variant="outline">
                      {historyService.getEntityTypeDisplayName(log.entity_type)}
                    </Badge>
                  </div>
                  <span className="text-sm">{log.action_description}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {historyService.formatDate(log.created_at)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => viewLogDetails(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">History Management</h2>
          <p className="text-muted-foreground">
            Comprehensive tracking and analysis of all system activities
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {renderOverview()}
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>History Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Action Type</Label>
                  <Badge variant={historyService.getActionTypeBadgeVariant(selectedLog.action_type) as any}>
                    {historyService.getActionTypeDisplayName(selectedLog.action_type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Entity Type</Label>
                  <Badge variant="outline">
                    {historyService.getEntityTypeDisplayName(selectedLog.entity_type)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Entity ID</Label>
                  <p className="text-sm">{selectedLog.entity_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Performed By</Label>
                  <p className="text-sm">{selectedLog.performed_by_name || 'System'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Role</Label>
                  <p className="text-sm capitalize">{selectedLog.performed_by_role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{historyService.formatDate(selectedLog.created_at)}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedLog.action_description}</p>
              </div>

              {selectedLog.old_values && renderFormattedValues(selectedLog.old_values, "Previous Values")}
              {selectedLog.new_values && renderFormattedValues(selectedLog.new_values, "New Values")}

              {selectedLog.ip_address && (
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm">{selectedLog.ip_address}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
