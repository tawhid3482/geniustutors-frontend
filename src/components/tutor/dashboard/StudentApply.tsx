import { useAuth } from "@/contexts/AuthContext.next";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  BookOpen,
  Clock,
  DollarSign,
  User,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  Edit,
  Save,
  X,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  useGetAllApplyForTutorsQuery,
  useUpdateapplyForTutorMutation,
} from "@/redux/features/applyForTutor/applyForTutorApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

const TutorApplications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = user?.id;

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetAllApplyForTutorsQuery(userId, {
    skip: !userId,
  });

  const [updateapplyForTutor, { isLoading: isUpdating }] =
    useUpdateapplyForTutorMutation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>("");

  console.log("Tutor Applications Data:", response);

  // Handle status update - FIXED: now sending data object
  const handleStatusUpdate = async (id: string) => {
    if (!editStatus) {
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateapplyForTutor({
        id,
        data: { Status: editStatus }, // Correct: sending data object
      }).unwrap();

      toast({
        title: "Success",
        description: "Application status updated successfully",
      });

      setEditingId(null);
      setEditStatus("");
      refetch(); // Refetch data to update the UI
    } catch (error: any) {
      console.error("Update error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  // Start editing
  const startEditing = (application: any) => {
    setEditingId(application.id);
    setEditStatus(application.Status);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditStatus("");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Applications Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-gray-200">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Applications Management</h1>
        <Card className="border border-red-200">
          <CardContent className="p-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              Error Loading Applications
            </h2>
            <p className="text-gray-600">
              Failed to load applications. Please try again later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const applications = response?.data || [];

  // No applications state
  if (applications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Applications Management</h1>
        <Card className="border border-gray-200">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              No Applications Yet
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              No applications have been submitted yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<
      string,
      { color: string; icon: React.ReactNode }
    > = {
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <ClockIcon className="h-3 w-3 mr-1" />,
      },
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="h-3 w-3 mr-1" />,
      },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

    return (
      <Badge variant="outline" className={`${config.color} border`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Status edit component
  const StatusEdit = ({ application }: { application: any }) => {
    return (
      <div className="space-y-2 pt-2 border-t">
        <Label className="text-sm font-medium">Update Status</Label>
        <div className="flex items-center gap-2">
          <Select
            value={editStatus}
            onValueChange={setEditStatus}
            disabled={isUpdating}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(application.id)}
            disabled={isUpdating || editStatus === application.Status}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-1" />
            {isUpdating ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelEditing}
            disabled={isUpdating}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Applications Management
        </h1>
        <p className="text-gray-600">
          Manage {applications.length} application
          {applications.length !== 1 ? "s" : ""} from students
        </p>
      </div>

      {/* Application Summary at the TOP */}
      <Card className="mb-8 border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Application Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {applications.length}
              </div>
              <div className="text-sm text-gray-600">Total Applications</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {
                  applications.filter((app: any) => app.Status === "pending")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {
                  applications.filter((app: any) => app.Status === "approved")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {
                  applications.filter((app: any) => app.Status === "rejected")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((application: any) => (
          <Card
            key={application.id}
            className="border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Application #{application.id.slice(-6)}
                  </CardTitle>
                  <CardDescription>
                    Applied on {formatDate(application.createdAt)}
                  </CardDescription>
                </div>
                <StatusBadge status={application.Status} />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {/* Applicant Name */}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Applicant:</span>{" "}
                    {application.name}
                  </span>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Phone:</span>{" "}
                    {application.phone}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Location:</span>{" "}
                    {application.location}
                  </span>
                </div>

                {/* Class & Gender */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium">Class:</span>{" "}
                      {application.class}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium">Gender:</span>{" "}
                      {application.gender}
                    </span>
                  </div>
                </div>

                {/* Subject */}
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Subject:</span>{" "}
                    {application.subject}
                  </span>
                </div>

                {/* Time & Days */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium">Time:</span>{" "}
                      {application.preferredTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      <span className="font-medium">Days:</span>{" "}
                      {application.dayPerWeek}
                    </span>
                  </div>
                </div>

                {/* Salary */}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    <span className="font-medium">Salary:</span> ৳
                    {application.salary}
                  </span>
                </div>

                {/* Message */}
                {application.message && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="text-sm">
                      <span className="font-medium">Message:</span>
                      <p className="text-gray-600 mt-1 line-clamp-2">
                        {application.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Status Update Section */}
                {editingId === application.id ? (
                  <StatusEdit application={application} />
                ) : (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => startEditing(application)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TutorApplications;
