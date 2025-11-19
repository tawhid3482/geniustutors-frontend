'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, MapPin, User, RefreshCw } from "lucide-react";
import { tutorRequestService, TutorRequest } from '@/services/tutorRequestService';
import { formatDistanceToNow } from 'date-fns';

/**
 * RecentTuitionRequests Component
 * Displays the most recent tuition requests in the admin dashboard
 */
export function RecentTuitionRequests() {
  const [tuitionRequests, setTuitionRequests] = useState<TutorRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTuitionRequests = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch the most recent tuition requests (limit to 3 for the dashboard)
      const response = await tutorRequestService.getAllTutorRequests({
        limit: 3
      });
      
      if (response.success) {
        setTuitionRequests(response.data);
      } else {
        setError('Failed to fetch tuition requests');
      }
    } catch (err) {
      console.error('Error fetching tuition requests:', err);
      setError('An error occurred while fetching tuition requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTuitionRequests();
    
    // Set up auto-refresh every 60 seconds
    const interval = setInterval(fetchTuitionRequests, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to get appropriate icon based on subject
  const getSubjectIcon = (subjects: string[]) => {
    // Default to BookOpen icon
    return <BookOpen className="h-5 w-5" />;
  };

  // Format the timestamp to relative time (e.g., "2 hours ago")
  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Recently';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Tuition Requests</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTuitionRequests()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : tuitionRequests.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">No tuition requests found</div>
        ) : (
          <div className="space-y-4">
            {tuitionRequests.map((request) => (
              <div key={request.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                  {getSubjectIcon(request.selectedSubjects)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {/* {request.category && <span className="text-blue-600 font-semibold mr-2">{request.category}</span>} */}
                    {request.selectedSubjects?.join(', ') || 'No subjects'} - {request.selectedClasses?.join(', ') || 'No classes'}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" /> Student Request • 
                    <MapPin className="h-3 w-3 ml-1" /> {request.district}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatTimestamp(request.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}