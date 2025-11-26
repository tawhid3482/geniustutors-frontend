"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, MapPin, User, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useGetAllTutorRequestsQuery } from "@/redux/features/tutorRequest/tutorRequestApi";

export function RecentTuitionRequests() {
  const {
    data: tutorRequestsData,
    isLoading,
    error: rtkError,
    refetch,
    isFetching,
  } = useGetAllTutorRequestsQuery(undefined, {
    refetchOnMountOrArgChange: true, 
  });


  const handleRefresh = () => {
    refetch(); // This should force a refetch
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  const getSubjectIcon = (subjects: string[]) => {
    return <BookOpen className="h-5 w-5" />;
  };

  const getSubjectsText = (request: any) => {
    if (request.selectedSubjects && request.selectedSubjects.length > 0) {
      return request.selectedSubjects.join(", ");
    }
    return "No subjects specified";
  };

  const getClassesText = (request: any) => {
    if (request.selectedClasses && request.selectedClasses.length > 0) {
      return request.selectedClasses.join(", ");
    }
    return "No classes specified";
  };

  const tuitionRequests = tutorRequestsData?.data || [];
  const error = rtkError ? 'Failed to fetch tuition requests' : null;
  const isRefreshing = isLoading || isFetching;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Tuition Requests</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isRefreshing ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : tuitionRequests.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No tuition requests found
          </div>
        ) : (
          <div className="space-y-4">
            {tuitionRequests.slice(0, 3).map((request: any) => (
              <div
                key={request.id}
                className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-100 p-2 rounded-full text-blue-700">
                  {getSubjectIcon(request.selectedSubjects || [])}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {getSubjectsText(request)} - {getClassesText(request)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    {request.studentGender || "Student"} •
                    <MapPin className="h-3 w-3 ml-1" />
                    {request.district || "Location not specified"}
                  </div>
                  {request.salaryRange && (
                    <div className="text-sm text-green-600 mt-1">
                      Salary: ৳{request.salaryRange.min} - ৳
                      {request.salaryRange.max}
                    </div>
                  )}
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