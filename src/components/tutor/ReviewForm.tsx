'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { Star } from 'lucide-react';
import { Review, TutorReview, reviewService } from '@/services/reviewService';

interface ReviewFormProps {
  tutorId: string;
  onReviewSubmitted: (review: TutorReview) => void;
}

export default function ReviewForm({ tutorId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting your review.",
        variant: "destructive"
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const review = await reviewService.submitReview(tutorId, rating, comment);
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Notify parent component
      onReviewSubmitted(review);
      
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback! Your review is pending approval and will be visible once approved.",
      });
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      // Check if it's a network error or API error
      let errorMessage = "Failed to submit review. Please try again.";
      
      if (error.isNetworkError) {
        errorMessage = "Network error - please check your connection";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/20 rounded-lg">
      <h3 className="font-medium">Write a Review</h3>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <p className="mr-2">Rating:</p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  className={`h-6 w-6 ${(hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                />
              </button>
            ))}
          </div>
        </div>
        
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this tutor..."
          className="min-h-[100px]"
        />
      </div>
      
      <Button type="submit" disabled={loading || rating === 0} className="w-full">
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  );
}