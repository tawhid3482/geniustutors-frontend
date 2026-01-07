"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Megaphone, 
  Plus, 
  Trash2, 
  Eye, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";
import {
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
  useGetAllNoticeQuery,
  useUpdateNoticeMutation,
} from "@/redux/features/notice/noticeApi";

export function NoticeBoardSection() {
  const { toast } = useToast();

  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form state for creating new notice
  const [newNotice, setNewNotice] = useState({
    title: "",
    content: "",
    type: "info",
    status: "active",
    target_audience: "all",
  });

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      // Reset to first page when search changes
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter]);

  // RTK Query hooks with pagination and filtering
  const queryParams = {
    page: currentPage,
    limit: pageSize,
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(debouncedSearch && { search: debouncedSearch }),
  };

  // Debug: log query parameters
  console.log("API Query Params:", queryParams);

  const {
    data: noticesResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllNoticeQuery(queryParams);

  // Debug: log API response
  console.log("API Response:", noticesResponse);

  const [createNotice, { isLoading: isCreating }] = useCreateNoticeMutation();
  const [updateNotice, { isLoading: isUpdating }] = useUpdateNoticeMutation();
  const [deleteNotice, { isLoading: isDeleting }] = useDeleteNoticeMutation();

  const notices = noticesResponse?.data || [];
  const pagination = noticesResponse?.pagination || {
    total: notices.length,
    page: currentPage,
    limit: pageSize,
    totalPages: Math.ceil(notices.length / pageSize),
  };

  // Debug: log pagination data
  console.log("Pagination data:", pagination);
  console.log("Total notices:", pagination.total);
  console.log("Total pages:", pagination.totalPages);

  // Manual filtering as fallback (if API doesn't support filtering)
  const filteredNotices = useMemo(() => {
    if (!notices.length) return [];

    return notices.filter((notice: any) => {
      // Search filter
      const matchesSearch = debouncedSearch
        ? notice.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          notice.content.toLowerCase().includes(debouncedSearch.toLowerCase())
        : true;

      // Type filter
      const matchesType =
        typeFilter !== "all" ? notice.type === typeFilter : true;

      // Status filter
      const matchesStatus =
        statusFilter !== "all" ? notice.status === statusFilter : true;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notices, debouncedSearch, typeFilter, statusFilter]);

  // Use filteredNotices if API doesn't handle filtering, otherwise use notices
  const displayNotices =
    debouncedSearch || typeFilter !== "all" || statusFilter !== "all"
      ? filteredNotices
      : notices;

  // Calculate pagination information
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));
  const startItem = (currentPage - 1) * pagination.limit + 1;
  const endItem = Math.min(currentPage * pagination.limit, pagination.total);

  // Debug: log pagination calculations
  console.log("Calculated totalPages:", totalPages);
  console.log("Start item:", startItem, "End item:", endItem);

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // If API doesn't return pagination, implement client-side pagination
  const paginatedNotices = useMemo(() => {
    if (!displayNotices.length) return [];
    
    // If API already handled pagination, return all notices
    if (noticesResponse?.pagination) {
      return displayNotices;
    }
    
    // Client-side pagination fallback
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return displayNotices.slice(startIndex, endIndex);
  }, [displayNotices, currentPage, pageSize, noticesResponse?.pagination]);

  // Calculate total for client-side pagination
  const totalItems = displayNotices.length;
  const clientSideTotalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const finalTotalPages = noticesResponse?.pagination ? totalPages : clientSideTotalPages;
  const finalTotalItems = noticesResponse?.pagination ? pagination.total : totalItems;
  const finalStartItem = (currentPage - 1) * pageSize + 1;
  const finalEndItem = Math.min(currentPage * pageSize, finalTotalItems);

  const handleCreateNotice = async () => {
    if (!newNotice.title.trim() || !newNotice.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await createNotice(newNotice).unwrap();

      if (response.success) {
        setShowCreateModal(false);
        setNewNotice({
          title: "",
          content: "",
          type: "info",
          status: "active",
          target_audience: "all",
        });

        // Refetch the notices to get the updated list
        refetch();

        toast({
          title: "Success",
          description: "Notice created successfully",
        });
      }
    } catch (error: any) {
      console.error("Error creating notice:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create notice",
        variant: "destructive",
      });
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    try {
      const response = await deleteNotice(noticeId).unwrap();

      if (response.success) {
        // Refetch the notices to get the updated list
        refetch();

        toast({
          title: "Success",
          description: "Notice deleted successfully",
        });
      }
    } catch (error: any) {
      console.error("Error deleting notice:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete notice",
        variant: "destructive",
      });
    }
  };

  const handleViewNotice = (notice: any) => {
    setSelectedNotice(notice);
    setShowViewModal(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const getTypeBadge = (type: string) => {
    const styles: any = {
      info: "bg-blue-100 text-blue-800 border-blue-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      success: "bg-green-100 text-green-800 border-green-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    };

    const labels: any = {
      info: "Info",
      warning: "Warning",
      success: "Success",
      urgent: "Urgent",
    };

    return <Badge className={styles[type]}>{labels[type]}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status === "active" ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const getTargetAudienceBadge = (target_audience: string) => {
    if (!target_audience) {
      target_audience = "all";
    }

    const styles: any = {
      all: "bg-gray-100 text-gray-800 border-gray-200",
      tutors: "bg-blue-100 text-blue-800 border-blue-200",
      students: "bg-green-100 text-green-800 border-green-200",
    };

    const labels: any = {
      all: "All Users",
      tutors: "Tutors Only",
      students: "Students Only",
    };

    return (
      <Badge className={styles[target_audience]}>
        {labels[target_audience]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasActiveFilters =
    searchQuery || typeFilter !== "all" || statusFilter !== "all";

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (finalTotalPages <= maxVisiblePages) {
      for (let i = 1; i <= finalTotalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(finalTotalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = end - maxVisiblePages + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notice Board</h1>
          <p className="text-gray-600 mt-1">
            Manage and publish important notices for users
          </p>
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
                placeholder="Search notices by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-2 border-green-500"
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
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchQuery && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Search: "{searchQuery}"
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Type: {typeFilter}
              </Badge>
            )}
            {statusFilter !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {statusFilter}
              </Badge>
            )}
            <Badge variant="outline" className="ml-auto">
              {finalTotalItems} total notice(s)
            </Badge>
          </div>
        )}
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
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-green-600"></div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Loading notices...
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-red-600">Error loading notices</div>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="mt-2"
                  >
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : paginatedNotices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {hasActiveFilters
                      ? "No notices match your filters. Try adjusting your search criteria."
                      : "No notices found. Create your first notice to get started."}
                  </div>
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="mt-2"
                    >
                      Clear Filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              paginatedNotices.map((notice: any) => (
                <TableRow key={notice.id}>
                  <TableCell className="font-medium">
                    <div
                      className="max-w-[200px] truncate"
                      title={notice.title}
                    >
                      {notice.title}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(notice.type)}</TableCell>
                  <TableCell>{getStatusBadge(notice.status)}</TableCell>
                  <TableCell>
                    {getTargetAudienceBadge(notice.target_audience)}
                  </TableCell>
                  <TableCell>{formatDate(notice.createdAt)}</TableCell>
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

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteNotice(notice.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {isDeleting ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Footer */}
        {!isLoading && !error && paginatedNotices.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t">
            <div className="text-sm text-gray-600 mb-4 sm:mb-0">
              Showing <span className="font-medium">{finalStartItem}</span> to{" "}
              <span className="font-medium">{finalEndItem}</span> of{" "}
              <span className="font-medium">{finalTotalItems}</span> results
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Page Size Selector */}
              <div className="flex items-center space-x-2 mr-4">
                <span className="text-sm text-gray-600">Show:</span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Numbers */}
                {generatePageNumbers().map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === finalTotalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(finalTotalPages)}
                  disabled={currentPage === finalTotalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Page Info */}
              <div className="text-sm text-gray-600 ml-4">
                Page <span className="font-medium">{currentPage}</span> of{" "}
                <span className="font-medium">{finalTotalPages}</span>
              </div>
            </div>
          </div>
        )}
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
              Create a new notice to inform users about important updates or
              information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Notice Title *</Label>
              <Input
                id="title"
                value={newNotice.title}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, title: e.target.value })
                }
                placeholder="Enter notice title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Notice Content *</Label>
              <Textarea
                id="content"
                value={newNotice.content}
                onChange={(e) =>
                  setNewNotice({ ...newNotice, content: e.target.value })
                }
                placeholder="Enter notice content"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Notice Type</Label>
                <Select
                  value={newNotice.type}
                  onValueChange={(value) =>
                    setNewNotice({
                      ...newNotice,
                      type: value,
                    })
                  }
                >
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
                <Select
                  value={newNotice.status}
                  onValueChange={(value) =>
                    setNewNotice({
                      ...newNotice,
                      status: value,
                    })
                  }
                >
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
              <Select
                value={newNotice.target_audience}
                onValueChange={(value) =>
                  setNewNotice({
                    ...newNotice,
                    target_audience: value,
                  })
                }
              >
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
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCreating ? "Creating..." : "Create Notice"}
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
                <Label className="text-sm font-medium text-gray-500">
                  Title
                </Label>
                <p className="text-lg font-semibold">{selectedNotice.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Content
                </Label>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedNotice.content}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Type
                  </Label>
                  <div className="mt-1">
                    {getTypeBadge(selectedNotice.type)}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <div className="mt-1">
                    {getStatusBadge(selectedNotice.status)}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Target Audience
                </Label>
                <div className="mt-1">
                  {getTargetAudienceBadge(selectedNotice.target_audience)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Created At
                </Label>
                <p>{formatDate(selectedNotice.createdAt)}</p>
              </div>
              {selectedNotice.updatedAt && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </Label>
                  <p>{formatDate(selectedNotice.updatedAt)}</p>
                </div>
              )}
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