"use client";

import { useAuth } from "@/contexts/AuthContext.next";
import { useGetAllTutorsApplicationQuery } from "@/redux/features/application/applicationApi";
import { useGetMYInfoQuery } from "@/redux/features/auth/authApi";
import {
  History,
 
  Calendar,
  Clock,
  User,
  BookOpen,
  Star,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw,
  MapPin,
  DollarSign,
  Users,
  Book,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Status badge component
const StatusBadge = ({
  status,
}: {
  status: "APPLIED" | "PENDING" | "ACCEPTED" | "UNDER_REVIEW" | "REJECTED";
}) => {
  const statusConfig: Record<
    "APPLIED" | "PENDING" | "ACCEPTED" | "UNDER_REVIEW" | "REJECTED",
    {
      label: string;
      variant: "outline" | "secondary" | "default" | "destructive";
      icon: typeof AlertCircle;
    }
  > = {
    APPLIED: { label: "Applied", variant: "outline", icon: AlertCircle },
    PENDING: { label: "Pending", variant: "secondary", icon: AlertCircle },
    ACCEPTED: { label: "Accepted", variant: "default", icon: CheckCircle },
    UNDER_REVIEW: {
      label: "Under Review",
      variant: "secondary",
      icon: AlertCircle,
    },
    REJECTED: { label: "Rejected", variant: "destructive", icon: XCircle },
  };

  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Application card component
const ApplicationCard = ({ application }: any) => {
  const { tutorRequest } = application;

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: any) => {
    if (!timeString) return "Not specified";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CardTitle className="text-lg">
                {tutorRequest?.subject || "N/A"}
              </CardTitle>
              <StatusBadge status={application.status} />
            </div>
            <CardDescription className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              {tutorRequest?.studentClass} • {tutorRequest?.medium}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Applied: {formatDate(application.appliedAt)}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {tutorRequest?.district}, {tutorRequest?.area}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                ৳{tutorRequest?.salaryRange?.min} - ৳
                {tutorRequest?.salaryRange?.max}
                {tutorRequest?.isSalaryNegotiable && " (Negotiable)"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {tutorRequest?.numberOfStudents} Students •{" "}
                {tutorRequest?.tutoringDays} days/week
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatTime(tutorRequest?.tutoringTime)} •{" "}
                {tutorRequest?.tutoringDuration} hours
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Book className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{tutorRequest?.tutoringType}</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                Student Gender: {tutorRequest?.studentGender}
              </span>
            </div>
          </div>
        </div>

        {/* Categories and Subjects */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {tutorRequest?.selectedCategories?.map(
              (category: any, index: any) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category}
                </Badge>
              )
            )}
            {tutorRequest?.selectedSubjects?.map((subject: any, index: any) => (
              <Badge key={index} variant="outline" className="text-xs">
                {subject}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated: {formatDate(application.updatedAt)}
            </span>
          </div>
          <Button variant="outline" size="sm">
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

// Stats card component
const StatsCard = ({ title, value, icon: Icon, description, color }: any) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2">{value}</h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Skeleton loader
const ApplicationCardSkeleton = () => (
  <Card>
    <CardHeader className="pb-3">
      <Skeleton className="h-6 w-1/3 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </CardHeader>
    <CardContent className="pb-3">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-4 pt-4 border-t">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Skeleton className="h-9 w-24" />
    </CardFooter>
  </Card>
);

export function TutoringHistorySection() {
  const { user } = useAuth();
  const userId = user.id;
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  const {
    data: applicationData,
    isLoading: isLoadingApp,
    refetch: refetchApp,
  } = useGetAllTutorsApplicationQuery(userId);

  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useGetMYInfoQuery(userId);

  // Filter applications by status
  const filterApplicationsByStatus = (status: any) => {
    if (!applicationData?.data) return [];
    if (status === "ALL") return applicationData.data;
    return applicationData.data.filter((app: any) => app.status === status);
  };

  // Calculate stats
  useEffect(() => {
    if (applicationData?.data) {
      const applications = applicationData.data;
      const total = applications.length;
      const pending = applications.filter(
        (app: any) => app.status === "PENDING"
      ).length;
      const under_review = applications.filter(
        (app: any) => app.status === "UNDER_REVIEW"
      ).length;
      const accepted = applications.filter(
        (app: any) => app.status === "ACCEPTED"
      ).length;
      const rejected = applications.filter(
        (app: any) => app.status === "REJECTED"
      ).length;

      setStats({ total, pending, accepted, rejected });
      setFilteredApplications(applications);
    }
  }, [applicationData]);

  const handleRefresh = () => {
    refetchApp();
    refetchUser();
  };

  const isLoading = isLoadingApp || isLoadingUser;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Tutoring History
              </h2>
              <p className="text-muted-foreground">
                Track your applications and teaching assignments
              </p>
            </div>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Applications"
          value={stats.total}
          icon={BookOpen}
          description="All applications submitted"
          color="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={AlertCircle}
          description="Awaiting response"
          color="bg-yellow-100 text-yellow-600"
        />
        <StatsCard
          title="Accepted"
          value={stats.accepted}
          icon={CheckCircle}
          description="Confirmed assignments"
          color="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          description="Not accepted"
          color="bg-red-100 text-red-600"
        />
      </div>

      {/* Tutor Profile Summary */}
      {userData?.data && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={userData.data.avatar}
                  alt={userData.data.fullName}
                />
                <AvatarFallback>
                  {userData.data.fullName?.charAt(0) || "T"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {userData.data.fullName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Tutor ID: {userData.data.tutor_id} •{" "}
                      {userData.data.qualification}
                    </p>
                  </div>
                  <Badge
                    variant={userData.data.genius ? "default" : "outline"}
                  >
                    {userData.data.genius ? "Genius Tutor" : "Standard Tutor"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{userData.data.district}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>৳{userData.data.expected_salary}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span>{userData.data.total_reviews || 0} Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="ALL" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="ALL">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="ACCEPTED">
              Accepted ({stats.accepted})
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              Rejected ({stats.rejected})
            </TabsTrigger>
          </TabsList>

      
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <ApplicationCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            {/* All Applications */}
            <TabsContent value="ALL" className="space-y-4">
              {filteredApplications.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredApplications.map((application:any) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Applications Found
                    </h3>
                    <p className="text-muted-foreground">
                      You haven't applied for any tutoring positions yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Pending Applications */}
            <TabsContent value="PENDING" className="space-y-4">
              {filterApplicationsByStatus("PENDING").length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterApplicationsByStatus("PENDING").map((application:any) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <AlertCircle className="h-12 w-12 mx-auto text-yellow-500/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Pending Applications
                    </h3>
                    <p className="text-muted-foreground">
                      You don't have any pending applications at the moment.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Accepted Applications */}
            <TabsContent value="ACCEPTED" className="space-y-4">
              {filterApplicationsByStatus("ACCEPTED").length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterApplicationsByStatus("ACCEPTED").map((application:any) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <CheckCircle className="h-12 w-12 mx-auto text-green-500/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Accepted Applications
                    </h3>
                    <p className="text-muted-foreground">
                      You don't have any accepted applications yet.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Rejected Applications */}
            <TabsContent value="REJECTED" className="space-y-4">
              {filterApplicationsByStatus("REJECTED").length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filterApplicationsByStatus("REJECTED").map((application:any) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 pb-6 text-center">
                    <XCircle className="h-12 w-12 mx-auto text-red-500/50 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Rejected Applications
                    </h3>
                    <p className="text-muted-foreground">
                      You don't have any rejected applications.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
