"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { tutorRequestService, type TutorRequest } from "@/services/tutorRequestService";

interface StudentPostedJobsProps {
  onRequestCreated?: () => void;
}

export function StudentPostedJobs({
  onRequestCreated
}: StudentPostedJobsProps) {
  const router = useRouter();
  const [createdRequests, setCreatedRequests] = useState<TutorRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Fetch created requests
  const fetchCreatedRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const response = await tutorRequestService.getStudentTutorRequests();
      if (response.success) {
        setCreatedRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching created requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your requests',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Load requests on component mount
  useEffect(() => {
    fetchCreatedRequests();
  }, []);

  // Handle view request navigation
  const handleViewRequest = (requestId: string) => {
    router.push(`/tuition-jobs/${requestId}`);
  };




  return (
    <div className="space-y-6">
      {/* Created Requests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Your Created Requests ({createdRequests.length})
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchCreatedRequests}
              disabled={isLoadingRequests}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingRequests ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingRequests ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                <p className="text-muted-foreground">Loading your requests...</p>
              </div>
            </div>
          ) : createdRequests.length === 0 ? (
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No requests created yet. Create your first tutor request above!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {createdRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  {/* Request Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{request.extraInformation ? request.extraInformation.substring(0, 50) + '...' : 'Tutor Request'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.subject} • {request.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.district} • {request.tutoringTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        request.status === 'Active' ? "bg-green-600" : 
                        request.status === 'Completed' ? "bg-blue-600" : 
                        "bg-gray-600"
                      }>
                        {request.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span> {request.category}
                    </div>
                    <div>
                      <span className="font-medium">Subject:</span> {request.subject}
                    </div>
                    <div>
                      <span className="font-medium">Budget:</span> {request.salary || `${request.salaryRange?.min}-${request.salaryRange?.max}`}
                    </div>
                    <div>
                      <span className="font-medium">Schedule:</span> {request.tutoringTime}
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {request.district}
                    </div>
                  </div>

                  {request.extraInformation && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-sm">Description:</span>
                      <p className="text-sm mt-1">{request.extraInformation}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
