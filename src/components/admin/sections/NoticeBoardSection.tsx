'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Megaphone, Plus, Trash2, Eye, Search, Filter } from "lucide-react";
import { noticeBoardService, Notice, CreateNoticeRequest } from "@/services/noticeBoardService";
import { useRole } from "@/contexts/RoleContext";

export function NoticeBoardSection() {
  const { toast } = useToast();
  const { canDelete } = useRole();
  
  // State management
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0
  });
  
  // Form state for creating new notice
  const [newNotice, setNewNotice] = useState<CreateNoticeRequest>({
    title: '',
    content: '',
    type: 'info',
    status: 'active',
    target_audience: 'all'
  });

  // Load notices on component mount and when filters change
  useEffect(() => {
    loadNotices();
  }, [searchQuery, typeFilter, statusFilter]);

  const loadNotices = async () => {
    setIsLoading(true);
    try {
      const response = await noticeBoardService.getNotices({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
        page: pagination.page,
        limit: pagination.limit
      });
      
      if (response.success) {
        console.log('Notices data:', response.data);
        setNotices(response.data);
        setPagination(response.pagination);
      } else {
        throw new Error('Failed to load notices');
      }
    } catch (error) {
      console.error('Error loading notices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notices',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await noticeBoardService.createNotice(newNotice);
      
      if (response.success) {
        setShowCreateModal(false);
        setNewNotice({ title: '', content: '', type: 'info', status: 'active', target_audience: 'all' });
        
        // Reload notices to show the new one
        await loadNotices();
        
        toast({
          title: 'Success',
          description: 'Notice created successfully'
        });
      } else {
        throw new Error(response.message || 'Failed to create notice');
      }
    } catch (error) {
      console.error('Error creating notice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notice',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      setIsLoading(true);
      
      const response = await noticeBoardService.deleteNotice(noticeId);
      
      if (response.success) {
        // Reload notices to reflect the deletion
        await loadNotices();
        
        toast({
          title: 'Success',
          description: 'Notice deleted successfully'
        });
      } else {
        throw new Error(response.message || 'Failed to delete notice');
      }
    } catch (error) {
      console.error('Error deleting notice:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete notice',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  const getTypeBadge = (type: Notice['type']) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 border-blue-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    
    const labels = {
      info: 'Info',
      warning: 'Warning',
      success: 'Success',
      urgent: 'Urgent'
    };
    
    return (
      <Badge className={styles[type]}>
        {labels[type]}
      </Badge>
    );
  };

  const getStatusBadge = (status: Notice['status']) => {
    return (
      <Badge variant={status === 'active' ? 'default' : 'secondary'}>
        {status === 'active' ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getTargetAudienceBadge = (target_audience: Notice['target_audience']) => {
    console.log('getTargetAudienceBadge called with:', target_audience);
    // Handle undefined or null values
    if (!target_audience) {
      target_audience = 'all';
    }
    
    const styles = {
      all: 'bg-gray-100 text-gray-800 border-gray-200',
      tutors: 'bg-blue-100 text-blue-800 border-blue-200',
      students: 'bg-green-100 text-green-800 border-green-200'
    };
    
    const labels = {
      all: 'All Users',
      tutors: 'Tutors Only',
      students: 'Students Only'
    };
    
    return (
      <Badge className={styles[target_audience]}>
        {labels[target_audience]}
      </Badge>
    );
  };

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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-600 mt-1">Manage and publish important notices for users</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Notice
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target Audience</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">Loading notices...</div>
                </TableCell>
              </TableRow>
            ) : notices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">No notices found</div>
                </TableCell>
              </TableRow>
            ) : (
              notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell className="font-medium">{notice.title}</TableCell>
                  <TableCell>{getTypeBadge(notice.type)}</TableCell>
                  <TableCell>{getStatusBadge(notice.status)}</TableCell>
                  <TableCell>{getTargetAudienceBadge(notice.target_audience)}</TableCell>
                  <TableCell>{notice.created_by_name || 'Unknown'}</TableCell>
                  <TableCell>{formatDate(notice.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewNotice(notice)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNotice(notice.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Notice Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-green-600" />
              Create New Notice
            </DialogTitle>
            <DialogDescription>
              Create a new notice to inform users about important updates or information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notice Title</Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) => setNewNotice({...newNotice, title: e.target.value})}
                placeholder="Enter notice title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Notice Content</Label>
              <Textarea
                id="content"
                value={newNotice.content}
                onChange={(e) => setNewNotice({...newNotice, content: e.target.value})}
                placeholder="Enter notice content"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Notice Type</Label>
                <Select value={newNotice.type} onValueChange={(value) => setNewNotice({...newNotice, type: value as Notice['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newNotice.status} onValueChange={(value) => setNewNotice({...newNotice, status: value as Notice['status']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select value={newNotice.target_audience} onValueChange={(value) => setNewNotice({...newNotice, target_audience: value as Notice['target_audience']})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="tutors">Tutors Only</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateNotice}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Creating...' : 'Create Notice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Notice Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-green-600" />
              Notice Details
            </DialogTitle>
          </DialogHeader>
          {selectedNotice && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Title</Label>
                <p className="text-lg font-semibold">{selectedNotice.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Content</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedNotice.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedNotice.type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedNotice.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Target Audience</Label>
                <div className="mt-1">{getTargetAudienceBadge(selectedNotice.target_audience)}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created By</Label>
                  <p>{selectedNotice.created_by_name || 'Unknown'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created At</Label>
                  <p>{formatDate(selectedNotice.created_at)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
