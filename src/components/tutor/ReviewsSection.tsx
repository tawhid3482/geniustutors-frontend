'use client';

import React, { useState, useEffect } from 'react';
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
  Reply
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.next';
import { api } from '@/config/api';

interface TutorReview {
  id: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  subject: string;
  response?: string;
  response_created_at?: string;
  created_at: string;
  updated_at: string;
  student_name: string;
  student_email: string;
}

interface ReviewStats {
  total_reviews: number;
  pending_reviews: number;
  approved_reviews: number;
  rejected_reviews: number;
  average_rating: number;
  five_star_reviews: number;
  four_star_reviews: number;
  three_star_reviews: number;
  two_star_reviews: number;
  one_star_reviews: number;
}

export function ReviewsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<TutorReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [respondingToReview, setRespondingToReview] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submittingResponse, setSubmittingResponse] = useState(false);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, []);

  const fetchReviews = async () => {
    try {
      
      
      const data = await api.get('/reviews/my-reviews');
     
      
      setReviews(data.data || []);
    } catch (error: any) {
      
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    try {
     
      const data = await api.get('/reviews/my-stats');
      
    
      setStats(data.data);
    } catch (error: any) {
     
    } finally {
      setLoading(false);
    }
  };

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
     
      await api.post(`/reviews/respond/${reviewId}`, { response: responseText.trim() });

      

      toast({
        title: "Response Submitted",
        description: "Your response has been added successfully.",
      });

      setResponseText('');
      setRespondingToReview(null);
      fetchReviews(); // Refresh reviews to show the new response
    } catch (error: any) {
      
      
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

  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={`${config.color} border-0`}>
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews & Ratingssss</h1>
          <p className="text-gray-600 mt-1">View feedback from your students</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="h-6 w-6 text-blue-600" />
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
                  <p className="text-sm font-medium text-gray-600">Approved</p>
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
                const count = stats[`${rating}_star_reviews` as keyof ReviewStats] as number;
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

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Reviews</CardTitle>
          <p className="text-sm text-gray-600">Feedback from your students only</p>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">You haven't received any reviews from students yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-full">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{review.student_name}</h4>
                        <p className="text-sm text-gray-600">{review.student_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStatusBadge(review.status)}
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(review.rating)}
                      <Badge variant="outline" className="text-xs">
                        {review.subject}
                      </Badge>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>

                  {/* Response Section */}
                  {review.response ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Reply className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Your Response</span>
                        {review.response_created_at && (
                          <span className="text-xs text-green-600">
                            {new Date(review.response_created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-green-700">{review.response}</p>
                    </div>
                  ) : (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRespondingToReview(review.id)}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Respond
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
