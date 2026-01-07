"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
  MoreHorizontal,
  Star,
  Search,
  Filter,
  Trash,
  Eye,
  CheckCircle,
  XCircle,
  MessageSquare,
  RefreshCw,
  Edit,
  Video,
} from "lucide-react";
import {
  useDeleteReviewMutation,
  useDeleteVideoReviewMutation,
  useGetAllAdminReviewQuery,
  useUpdateReviewMutation,
  useUpdateVideoReviewMutation,
} from "@/redux/features/review/reviewApi";
import { useAuth } from "@/contexts/AuthContext.next";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  testimonial: string;
  tutor_id: string;
  userId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  type?: "text" | "video";
}

export interface VideoTestimonial extends Testimonial {
  videoUrl: string;
  thumbnail: string;
  duration: string;
}

export function ReviewManagementSection() {
  const { toast } = useToast();
  const { user } = useAuth();

  const {
    data: reviewData,
    refetch,
    isLoading: isDataLoading,
  } = useGetAllAdminReviewQuery({ id: user?.id });

  const [deleteReview, { isLoading: isDeletingReview }] =
    useDeleteReviewMutation();
  const [deleteVideoReview, { isLoading: isDeletingVideoReview }] =
    useDeleteVideoReviewMutation();
  const [updateReview, { isLoading: isUpdatingReview }] =
    useUpdateReviewMutation();
  const [updateVideoReview, { isLoading: isUpdatingVideoReview }] =
    useUpdateVideoReviewMutation();

  const [allReviews, setAllReviews] = useState<
    (Testimonial | VideoTestimonial)[]
  >([]);
  const [filteredReviews, setFilteredReviews] = useState<
    (Testimonial | VideoTestimonial)[]
  >([]);
  const [selectedReview, setSelectedReview] = useState<
    Testimonial | VideoTestimonial | null
  >(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [reviewTypeFilter, setReviewTypeFilter] = useState("all");

  // Transform backend data to state
  useEffect(() => {
    if (reviewData?.data) {
      const { testimonial, videoTestimonial } = reviewData.data;

      const combinedReviews = [
        ...testimonial.map((t: any) => ({
          ...t,
          type: "text" as const,
          id: t.id || t._id,
        })),
        ...videoTestimonial.map((v: any) => ({
          ...v,
          type: "video" as const,
          id: v.id || v._id,
        })),
      ];

      setAllReviews(combinedReviews);
    }
  }, [reviewData]);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...allReviews];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (review) =>
          review.name.toLowerCase().includes(query) ||
          review.role.toLowerCase().includes(query) ||
          review.location.toLowerCase().includes(query) ||
          review.testimonial.toLowerCase().includes(query) ||
          review.tutor_id.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((review) =>
        statusFilter === "active" ? review.isActive : !review.isActive
      );
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter(
        (review) => review.rating === parseInt(ratingFilter)
      );
    }

    if (reviewTypeFilter !== "all") {
      filtered = filtered.filter((review) =>
        reviewTypeFilter === "text"
          ? review.type === "text"
          : review.type === "video"
      );
    }

    setFilteredReviews(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, statusFilter, ratingFilter, reviewTypeFilter, allReviews]);

  // DEBUG: Log reviews and API status
  useEffect(() => {
   
  }, [allReviews, selectedReview]);

  // Handle toggle review status - IMPROVED
  const handleToggleReviewStatus = async (
    review: Testimonial | VideoTestimonial
  ) => {
    try {
      const newStatus = !review.isActive;
      const updateData = { isActive: newStatus };

     

      // Optimistically update state
      setAllReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === review.id ? { ...r, isActive: newStatus } : r
        )
      );

      let result;
      if (review.type === "text") {
        result = await updateReview({
          id: review.id,
          data: updateData,
        }).unwrap();
      } else {
        result = await updateVideoReview({
          id: review.id,
          data: updateData,
        }).unwrap();
      }

      toast({
        title: newStatus ? "Review Activated" : "Review Deactivated",
        description: newStatus
          ? "The review has been activated and is now visible."
          : "The review has been deactivated and will not be displayed.",
      });

      if (showReviewModal) {
        setShowReviewModal(false);
      }

      // Refetch to ensure data is in sync
      refetch();
    } catch (error: any) {
      console.error(`Error toggling ${review.type} review status:`, error);

      // Revert optimistic update
      setAllReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === review.id ? { ...r, isActive: review.isActive } : r
        )
      );

      let errorMessage = `Failed to update ${review.type} review status. Please try again.`;

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      } else if (error?.status) {
        errorMessage = `Server error ${error.status}`;
      }

      console.error("Full error details:", {
        status: error?.status,
        data: error?.data,
        originalStatus: error?.originalStatus,
        endpointUsed:
          review.type === "video" ? "updateVideoReview" : "updateReview",
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle review deletion - IMPROVED
  const handleDeleteReview = async (review: Testimonial | VideoTestimonial) => {
    try {

      // Optimistically remove from state
      setAllReviews((prevReviews) =>
        prevReviews.filter((r) => r.id !== review.id)
      );

      let result;
      if (review.type === "text") {
        result = await deleteReview(review.id).unwrap();
      } else {
        result = await deleteVideoReview(review.id).unwrap();
      }

      toast({
        title: "Review Deleted",
        description: "The review has been permanently deleted.",
      });

      if (showReviewModal) {
        setShowReviewModal(false);
      }

      // Refetch to ensure data is in sync
      refetch();
    } catch (error: any) {
      console.error(`Error deleting ${review.type} review:`, error);

      // Revert optimistic update
      setAllReviews((prevReviews) => {
        const index = prevReviews.findIndex((r) => r.id === review.id);
        if (index === -1) {
          return [...prevReviews, review];
        }
        return prevReviews;
      });

      let errorMessage = `Failed to delete ${review.type} review. Please try again.`;

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle updating review text - IMPROVED
  const handleUpdateReviewText = async (
    review: Testimonial | VideoTestimonial,
    newText: string
  ) => {
    try {
      if (!newText.trim()) {
        toast({
          title: "Error",
          description: "Review text cannot be empty.",
          variant: "destructive",
        });
        return;
      }

      const updateData = { testimonial: newText };
   

      // Optimistically update state
      setAllReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === review.id ? { ...r, testimonial: newText } : r
        )
      );

      let result;
      if (review.type === "text") {
        result = await updateReview({
          id: review.id,
          data: updateData,
        }).unwrap();
      } else {
        // For video reviews, we need to ensure we're updating the testimonial field
        // Some backends might expect different field names
        const videoUpdateData = {
          ...updateData,
          // Include other fields that might be required
          id: review.id,
        };

        result = await updateVideoReview({
          id: review.id,
          data: videoUpdateData,
        }).unwrap();
      }

      toast({
        title: "Review Updated",
        description: "Review text has been updated successfully.",
      });

      setSelectedReview(null);
      setShowResponseModal(false);
      setResponseText("");

      // Refetch to ensure data is in sync
      refetch();
    } catch (error: any) {
      console.error(`Error updating ${review.type} review text:`, error);

      // Revert optimistic update
      setAllReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === review.id ? { ...r, testimonial: review.testimonial } : r
        )
      );

      let errorMessage = `Failed to update ${review.type} review. Please try again.`;

      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      console.error("Full error details:", {
        status: error?.status,
        data: error?.data,
        originalStatus: error?.originalStatus,
        endpointUsed:
          review.type === "video" ? "updateVideoReview" : "updateReview",
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Separate function for debugging video review API
  const debugVideoReviewAPI = async () => {
    try {

      // Find a video review
      const videoReview = allReviews.find((r) => r.type === "video");

      if (!videoReview) {
        return;
      }

 

      // Test simple status update
      const testData = { isActive: videoReview.isActive };

      // You can manually test the API call here
      const result = await updateVideoReview({
        id: videoReview.id,
        data: testData,
      }).unwrap();

     
    } catch (error) {
      console.error("Video review API test failed:", error);
    }
  };

  const isProcessing =
    isDeletingReview ||
    isDeletingVideoReview ||
    isUpdatingReview ||
    isUpdatingVideoReview;

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
        Active
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
        Inactive
      </Badge>
    );
  };

  const renderTypeBadge = (review: Testimonial | VideoTestimonial) => {
    return review.type === "video" ? (
      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
        <Video className="h-3 w-3 mr-1" /> Video
      </Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
        Text
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalReviews = allReviews.length;
  const activeReviews = allReviews.filter((r) => r.isActive).length;
  const videoReviews = allReviews.filter((r) => r.type === "video").length;

  return (
    <div className="space-y-6 w-full">
      {/* Header with Debug Button */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Review Management
            </h2>
            <p className="text-white/90 mt-1">
              Monitor and moderate user reviews across the platform
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Badge className="bg-white/20 hover:bg-white/30 text-white">
                {totalReviews} Total
              </Badge>
              <Badge className="bg-green-500/80 hover:bg-green-500 text-white">
                {activeReviews} Active
              </Badge>
              <Badge className="bg-blue-500/80 hover:bg-blue-500 text-white">
                {videoReviews} Video
              </Badge>
            </div>
            <div className="flex gap-2">
              {/* Debug Button - Remove in production */}
              {/* <Button
                variant="outline"
                className="bg-white/20 text-white hover:bg-white/30 border-white/30"
                onClick={debugVideoReviewAPI}
                size="sm"
              >
                Debug Video API
              </Button> */}
              <Button
                variant="secondary"
                className="bg-white text-green-700 hover:bg-green-50"
                onClick={() => refetch()}
                disabled={isDataLoading || isProcessing}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    isDataLoading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-8 border-2 border-green-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isProcessing}
                />
              </div>
            </div>
            <div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={ratingFilter}
                onValueChange={setRatingFilter}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={reviewTypeFilter}
                onValueChange={setReviewTypeFilter}
                disabled={isProcessing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text Reviews</SelectItem>
                  <SelectItem value="video">Video Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">
            Reviews ({filteredReviews.length})
            {videoReviews > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({videoReviews} video reviews)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isDataLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reviews found matching your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={review.avatar}
                            alt={review.name}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://via.placeholder.com/32";
                            }}
                          />
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-sm text-gray-500">
                              {review.location}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{review.role}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderTypeBadge(review)}
                          {review.type === "video" && (
                            <span className="text-xs text-gray-500" title="ID">
                              #{review.id.substring(0, 8)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            ({review.rating})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(review.isActive)}
                          {isProcessing && selectedReview?.id === review.id && (
                            <span className="text-xs text-gray-500 animate-pulse">
                              Updating...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(review.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              disabled={isProcessing}
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReviewModal(true);
                              }}
                              disabled={isProcessing}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleReviewStatus(review)}
                              disabled={isProcessing}
                            >
                              {review.isActive ? (
                                <>
                                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedReview(review);
                                setResponseText(review.testimonial);
                                setShowResponseModal(true);
                              }}
                              disabled={isProcessing}
                            >
                              <MessageSquare className="mr-2 h-4 w-4 text-blue-600" />
                              Edit Review Text
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteReview(review)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Detail Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
            <DialogDescription>
              Full review information and moderation options
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedReview.avatar}
                  alt={selectedReview.name}
                  className="h-16 w-16 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/64";
                  }}
                />
                <div>
                  <h3 className="font-bold text-lg">{selectedReview.name}</h3>
                  <p className="text-gray-600">
                    {selectedReview.role} • {selectedReview.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderTypeBadge(selectedReview)}
                    <span className="text-xs text-gray-500 font-mono">
                      ID: {selectedReview.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Tutor ID
                  </h4>
                  <p className="font-medium">{selectedReview.tutor_id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Date</h4>
                  <p>{formatDate(selectedReview.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rating</h4>
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm font-medium">
                      {selectedReview.rating}/5
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(selectedReview.isActive)}
                    {isProcessing && (
                      <span className="text-xs text-gray-500 animate-pulse">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>
                {/* <div> */}
                  {/* <h4 className="text-sm font-medium text-gray-500">User ID</h4>
                  <p className="text-xs font-mono truncate">
                    {selectedReview.userId}
                  </p> */}
                {/* </div> */}
                {/* <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Review ID
                  </h4>
                  <p className="text-xs font-mono truncate">
                    {selectedReview.id}
                  </p>
                </div> */}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Review Text
                </h4>
                <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedReview.testimonial}
                </p>
              </div>

              {selectedReview.type === "video" && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Video Testimonial
                  </h4>
                  <div className="mt-2 space-y-2">
                    {/* <div className="relative aspect-video">
                      <img
                        src={(selectedReview as VideoTestimonial).thumbnail}
                        alt="Video thumbnail"
                        className="w-full rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x225";
                        }}
                      />
                    </div> */}
                    <div>
                      <h5 className="text-sm font-medium">Video URL:</h5>
                      <a
                        href={(selectedReview as VideoTestimonial).videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate block"
                      >
                        {(selectedReview as VideoTestimonial).videoUrl}
                      </a>
                    </div>
                    {(selectedReview as VideoTestimonial).duration && (
                      <p className="text-sm text-gray-500">
                        Duration:{" "}
                        {(selectedReview as VideoTestimonial).duration}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-between items-center sticky bottom-0 bg-white pt-4 border-t">
            {selectedReview && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleToggleReviewStatus(selectedReview)}
                  disabled={isProcessing}
                  className={
                    selectedReview.isActive
                      ? "border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      : "border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
                  }
                >
                  {selectedReview.isActive ? (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleDeleteReview(selectedReview)}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={isProcessing}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Review Text Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Review Text</DialogTitle>
            <DialogDescription>
              Update the review text content.
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">User</h4>
                  <p className="font-medium">{selectedReview.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Role</h4>
                  <p className="font-medium">{selectedReview.role}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type</h4>
                  <p className="font-medium">
                    {selectedReview.type === "video"
                      ? "Video Review"
                      : "Text Review"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Review ID
                  </h4>
                  <p className="text-xs font-mono truncate">
                    {selectedReview.id}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  Original Review Text
                </h4>
                <p className="p-3 bg-gray-50 rounded-md text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedReview.testimonial}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">
                  New Review Text
                </h4>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Enter the new review text..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={6}
                  disabled={isProcessing}
                />
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {responseText.length} characters
                  </p>
                  <p className="text-xs text-gray-500">
                    This will update the original review text.
                  </p>
                </div>
              </div>

              {selectedReview.type === "video" && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> You are editing a video review. The
                    video URL and thumbnail will remain unchanged.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowResponseModal(false);
                setResponseText("");
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedReview &&
                handleUpdateReviewText(selectedReview, responseText)
              }
              disabled={
                isProcessing ||
                !responseText.trim() ||
                responseText === selectedReview?.testimonial
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
