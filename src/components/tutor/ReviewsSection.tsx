'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { 
  Star, 
  MessageSquare, 
  Calendar, 
  User, 
  TrendingUp,
  Award,
  ThumbsUp,
  Reply,
  Video,
  MessageCircle,
  MapPin,
  Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { useGetAllTutorReviewQuery } from '@/redux/features/review/reviewApi';

// Types based on your API response
interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  testimonial: string;
  isActive: boolean;
  rating: number;
  tutor_id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  testimonial: string;
  isActive: boolean;
  rating: number;
  tutor_id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    testimonial: Testimonial[];
    videoTestimonial: VideoTestimonial[];
  };
}

// Type for calculated statistics
interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  five_star_reviews: number;
  approved_reviews: number;
  rating_distribution: {
    [key: string]: number;
  };
}

export function ReviewsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for response dialog
  const [respondingToReview, setRespondingToReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'testimonials' | 'videos'>('all');

  // Use RTK Query hook
  const { 
    data: reviewsResponse, 
    isLoading, 
    isError,
    refetch 
  } = useGetAllTutorReviewQuery({ id: user?.id } as any, {
    skip: !user?.id,
    refetchOnMountOrArgChange: true,
  });

  // Calculate statistics from the data
  const calculateStats = (): ReviewStats => {
    const testimonialData = reviewsResponse?.data?.testimonial || [];
    const videoTestimonialData = reviewsResponse?.data?.videoTestimonial || [];
    const allReviews = [...testimonialData, ...videoTestimonialData];
    
    const total_reviews = allReviews.length;
    
    const totalRating = allReviews.reduce((sum, review) => sum + (review.rating || 0), 0);
    const average_rating = total_reviews > 0 ? totalRating / total_reviews : 0;
    
    const five_star_reviews = allReviews.filter(review => review.rating === 5).length;
    
    const approved_reviews = allReviews.filter(review => review.isActive).length;
    
    const rating_distribution = {
      '5_star': allReviews.filter(review => review.rating === 5).length,
      '4_star': allReviews.filter(review => review.rating === 4).length,
      '3_star': allReviews.filter(review => review.rating === 3).length,
      '2_star': allReviews.filter(review => review.rating === 2).length,
      '1_star': allReviews.filter(review => review.rating === 1).length,
    };

    return {
      total_reviews,
      average_rating,
      five_star_reviews,
      approved_reviews,
      rating_distribution
    };
  };

  const stats = reviewsResponse ? calculateStats() : null;

  // Get filtered reviews based on active tab
  const getFilteredReviews = () => {
    if (!reviewsResponse?.data) return [];
    
    switch (activeTab) {
      case 'testimonials':
        return reviewsResponse.data.testimonial;
      case 'videos':
        return reviewsResponse.data.videoTestimonial;
      default:
        return [...reviewsResponse.data.testimonial, ...reviewsResponse.data.videoTestimonial];
    }
  };

  const filteredReviews = getFilteredReviews();

  const handleRespondToReview = async (reviewId: string) => {
    if (!responseText.trim()) {
      toast({
        title: "Response Required",
        description: "Please enter a response before submitting.",
        variant: "destructive"
      });
      return;
    }

    setSubmittingResponse(true);
    try {
      // Here you would implement the response API call
      // For now, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Response Submitted",
        description: "Your response has been added successfully.",
      });

      setResponseText('');
      setRespondingToReview(null);
      
      // Refetch reviews to get updated data
      refetch();
    } catch (error: any) {
      console.error('Error submitting response:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingResponse(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-600">{rating}/5</span>
      </div>
    );
  };

  const renderStatusBadge = (isActive: boolean) => {
    return (
      <Badge className={`${isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} border-0`}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reviews</h3>
        <p className="text-gray-600 mb-4">Failed to load reviews. Please try again.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Testimonials</h1>
          <p className="text-gray-600 mt-1">View feedback and testimonials from students</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && stats.total_reviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_reviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.five_star_reviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ThumbsUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved_reviews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Distribution */}
      {stats && stats.total_reviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[`${rating}_star`] || 0;
                const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1 w-16">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for filtering */}
      <div className="flex space-x-2 border-b pb-2">
        <Button
          variant={activeTab === 'all' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('all')}
          className="rounded-full"
        >
          All Reviews ({stats?.total_reviews || 0})
        </Button>
        <Button
          variant={activeTab === 'testimonials' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('testimonials')}
          className="rounded-full"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Testimonials ({reviewsResponse?.data?.testimonial?.length || 0})
        </Button>
        <Button
          variant={activeTab === 'videos' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('videos')}
          className="rounded-full"
        >
          <Video className="h-4 w-4 mr-2" />
          Video Testimonials ({reviewsResponse?.data?.videoTestimonial?.length || 0})
        </Button>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'all' && 'All Reviews'}
            {activeTab === 'testimonials' && 'Text Testimonials'}
            {activeTab === 'videos' && 'Video Testimonials'}
          </CardTitle>
          <p className="text-sm text-gray-600">
            Showing {filteredReviews.length} {filteredReviews.length === 1 ? 'review' : 'reviews'}
          </p>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-600">
                {activeTab === 'all' 
                  ? 'You haven\'t received any reviews yet.' 
                  : `No ${activeTab} found.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                          {review.avatar ? (
                            <img 
                              src={review.avatar} 
                              alt={review.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                        </div>
                        {'videoUrl' in review && (
                          <div className="absolute -top-1 -right-1">
                            <Badge className="bg-blue-100 text-blue-800 border-0">
                              <Video className="h-3 w-3" />
                            </Badge>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{review.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{review.role}</span>
                          {review.location && (
                            <>
                              <span>•</span>
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {review.location}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStatusBadge(review.isActive)}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(review.rating)}
                    </div>
                    <p className="text-gray-700">{review.testimonial}</p>
                    
                    {/* Video testimonial preview */}
                    {'videoUrl' in review && review.videoUrl && (
                      <div className="mt-3">
                        <a 
                          href={review.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800"
                        >
                          <Video className="h-4 w-4 mr-2" />
                          Watch video testimonial
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Response Section - Only for text testimonials */}
                  {'videoUrl' in review ? null : (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRespondingToReview(review.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond to Review
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={!!respondingToReview} onOpenChange={() => setRespondingToReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Write a response to the student's review. This will be visible to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response here..."
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRespondingToReview(null);
                setResponseText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleRespondToReview(respondingToReview!)}
              disabled={submittingResponse || !responseText.trim()}
            >
              {submittingResponse ? 'Submitting...' : 'Submit Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}