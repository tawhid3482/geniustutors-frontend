"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, RefreshCw, Eye } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { tutorRequestService, type TutorRequest } from "@/services/tutorRequestService";

interface StudentPostedJobsProps {
  postedRequests?: any[];
  isLoadingRequests?: boolean;
  refreshPostedRequests?: () => void;
}

export function StudentPostedJobs({
  postedRequests: propPostedRequests,
  isLoadingRequests: propIsLoadingRequests,
  refreshPostedRequests: propRefreshPostedRequests
}: StudentPostedJobsProps) {
  const router = useRouter();
  // Internal state management
  const [postedRequests, setPostedRequests] = useState<TutorRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // Use props if provided, otherwise use internal state
  const currentPostedRequests = propPostedRequests || postedRequests;
  const currentIsLoadingRequests = propIsLoadingRequests !== undefined ? propIsLoadingRequests : isLoadingRequests;
  
  // Show all posted jobs (not just active ones)
  const allPostedJobs = currentPostedRequests;

  // Fetch posted jobs (tutor requests created by student)
  const fetchPostedRequests = async () => {
   
    
    setIsLoadingRequests(true);
    try {
      const response = await tutorRequestService.getStudentTutorRequests();
      
  
      
      if (response.success) {
        setPostedRequests(response.data);
      } else {
        console.warn('Response not successful:', response);
        setPostedRequests([]);
      }
    } catch (error) {
     
      
      toast({
        title: 'Error',
        description: 'Failed to load your posted jobs',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };


  // Refresh function
  const refreshPostedRequests = () => {
    if (propRefreshPostedRequests) {
      propRefreshPostedRequests();
    } else {
      fetchPostedRequests();
    }
  };

  // Load data on component mount if not using props
  useEffect(() => {
    if (!propPostedRequests) {
      fetchPostedRequests();
    }
  }, [propPostedRequests]);

  // Handle view job navigation
  const handleViewJob = (jobId: string) => {
    router.push(`/tuition-jobs/${jobId}`);
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Posted Jobs ({allPostedJobs.length})
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshPostedRequests}
              disabled={currentIsLoadingRequests}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${currentIsLoadingRequests ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentIsLoadingRequests ? (
            <div className="text-center py-8">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-green-600" />
                <p className="text-muted-foreground">Loading posted jobs...</p>
              </div>
            </div>
          ) : allPostedJobs.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No posted jobs found. Create your first tutor request to get started!</p>
              <Button 
                className="mt-4 bg-green-600 hover:bg-green-700" 
                onClick={() => window.location.href = '/student'}
              >
                Create Request
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {allPostedJobs.map((request) => (
                <div key={request.id} className="border rounded-lg p-6 space-y-4">
                  {/* Request Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{request.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {request.subject} • {request.category}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {request.district} • {request.area}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={request.status === 'Active' ? "bg-green-600" : request.status === 'Completed' ? "bg-blue-600" : "bg-gray-600"}>
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
                      <span className="font-medium">Budget:</span> ৳{request.salaryRangeMin} - ৳{request.salaryRangeMax}
                    </div>
                    <div>
                      <span className="font-medium">Schedule:</span> {request.tutoringTime} ({request.daysPerWeek} days/week)
                    </div>
                    <div>
                      <span className="font-medium">Location:</span> {request.district}, {request.area}
                    </div>
                    <div>
                      <span className="font-medium">Tutoring Type:</span> {request.tutoringType}
                    </div>
                    <div>
                      <span className="font-medium">Medium:</span> {request.medium}
                    </div>
                    <div>
                      <span className="font-medium">Class:</span> {request.studentClass}
                    </div>
                    <div>
                      <span className="font-medium">Students:</span> {request.numberOfStudents}
                    </div>
                  </div>

                  {(request.subjects && request.subjects.length > 0) && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-sm">Subjects:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {request.subjects.map((subject: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {request.extraInformation && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <span className="font-medium text-sm">Additional Information:</span>
                      <p className="text-sm text-gray-700 mt-1">{request.extraInformation}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => handleViewJob(request.id)}
                    >
                      <Eye className="h-4 w-4" /> View Details
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
