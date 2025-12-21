"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ListFilter,
  Users,
  CheckCircle2,
  CreditCard,
  Star,
  User,
  Megaphone,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { useGetAllNoticeByRoleQuery } from "@/redux/features/notice/noticeApi";
import { useAuth } from "@/contexts/AuthContext.next";
import { useRouter } from "next/navigation";
import { useGetStudentStatsQuery } from "@/redux/features/auth/authApi";

interface StudentOverviewProps {
  profile: any;
  requestsPostedCount: number;
  tutorRequestedCount: number;
  tutorAssignedCount: number;
  paymentsProcessedCount: number;
  postedRequests: any[];
  recentPlatformJobs: any[];
  topRatedTutors: any[];
  setActiveTab: (tab: string) => void;
  inviteDemo: (tutor: any) => void;
}

export function StudentOverview({
  profile,
  recentPlatformJobs,
  topRatedTutors,
  setActiveTab,
  inviteDemo,
}: StudentOverviewProps) {
  const user = useAuth();
  const userId = user.user.id;

  // Use RTK Query hook
  const {
    data: noticeResponse,
    isLoading: loadingNotices,
    error,
  } = useGetAllNoticeByRoleQuery({
    id: userId,
  });

  const { data: statsResponse, isLoading: loadingStats } =
    useGetStudentStatsQuery(userId);

  console.log("Stats Data:", statsResponse);

  const notices = noticeResponse?.data || [];
  const statsData = statsResponse?.data || {};

  // Create stats cards data from API response
  const statsCards = useMemo(() => {
    if (!statsData || Object.keys(statsData).length === 0) {
      return [];
    }

    const { active, confirmed, rejected, total } = statsData;

    return [
      {
        id: "total",
        label: "Total Requests",
        value: total || 0,
        icon: BookOpen,
        description: "All tuition requests",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        textColor: "text-blue-700",
        iconColor: "text-blue-600",
        trend: "total",
      },
       {
        id: "active",
        label: "Active",
        value: active || 0,
        icon: Clock,
        description: "Currently active",
        color: "from-amber-500 to-amber-600",
        bgColor: "bg-amber-50",
        textColor: "text-amber-700",
        iconColor: "text-amber-600",
        trend: "active",
      },
      {
        id: "confirmed",
        label: "Confirmed",
        value: confirmed || 0,
        icon: CheckCircle2,
        description: "Approved requests",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        textColor: "text-green-700",
        iconColor: "text-green-600",
        trend: "confirmed",
      },
     
      {
        id: "rejected",
        label: "Rejected",
        value: rejected || 0,
        icon: AlertCircle,
        description: "Not approved",
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        iconColor: "text-red-600",
        trend: "rejected",
      },
    ];
  }, [statsData]);

  // Calculate stats summary for the header
  const statsSummary = useMemo(() => {
    if (!statsData || Object.keys(statsData).length === 0) {
      return null;
    }

    const { total,  active, confirmed, rejected } = statsData;

    if (total === 0) return null;

    const confirmedPercentage =
      total > 0 ? Math.round((confirmed / total) * 100) : 0;
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

    return {
      confirmedPercentage,
      activePercentage,
      total,
      active,
      confirmed,
      rejected,
    };
  }, [statsData]);

  // Get notice type icon and styling
  const getNoticeTypeConfig = (type: string) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-50",
          borderColor: "border-green-500",
          iconColor: "text-green-600",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-500",
          iconColor: "text-yellow-600",
        };
      case "urgent":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-50",
          borderColor: "border-red-500",
          iconColor: "text-red-600",
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-500",
          iconColor: "text-blue-600",
        };
    }
  };

  const router = useRouter();

  const handlePush = () => {
    router.push("/tutor-request");
  };

  // Loading state for stats
  if (loadingStats) {
    return (
      <div className="space-y-4 sm:space-y-6 w-full">
        <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-4 sm:p-6 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Welcome back, {profile.name.split(" ")[0]} 👋
              </h2>
              <p className="text-white/90 mt-1 text-sm sm:text-base">
                Loading your learning journey...
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-green-100/60">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-4 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              Welcome back, {profile.name.split(" ")[0]} 👋
            </h2>
            <p className="text-white/90 mt-1 text-sm sm:text-base">
              {statsSummary ? (
                <>
                  You have{" "}
                  <span className="font-bold">
                    {statsSummary.total} tuition request
                    {statsSummary.total !== 1 ? "s" : ""}
                  </span>
                  .{" "}
                  <span className="font-bold text-green-200">
                    {statsSummary.confirmedPercentage}% confirmed
                  </span>
                  ,{" "}
                  <span className="font-bold text-amber-200">
                    {statsSummary.activePercentage}% active
                  </span>
                </>
              ) : (
                "Start your learning journey by posting a tuition request."
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="bg-white text-green-700 hover:bg-green-50 text-sm sm:text-base"
              onClick={() => handlePush()}
            >
              Post a Request
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
    

  

      {/* Notice Board */}
      <Card className="bg-white rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Notice Board
            </h2>
          </div>

          {loadingNotices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading notices...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-600 mb-2">Failed to load notices</p>
              <p className="text-sm text-red-500">Please try again later.</p>
            </div>
          ) : notices.length > 0 ? (
            <div className="space-y-3">
              {notices.map((notice: any) => {
                const typeConfig = getNoticeTypeConfig(notice.type);
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={notice.id}
                    className={`${typeConfig.bgColor} rounded-lg p-4 border-l-4 ${typeConfig.borderColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <TypeIcon
                        className={`h-5 w-5 ${typeConfig.iconColor} mt-0.5 flex-shrink-0`}
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 mb-1">
                          {notice.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed text-sm mb-2">
                          {notice.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {new Date(notice.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              notice.type === "urgent"
                                ? "bg-red-100 text-red-700"
                                : notice.type === "warning"
                                ? "bg-yellow-100 text-yellow-700"
                                : notice.type === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {notice.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No notices available</p>
              <p className="text-sm text-gray-500">
                Check back later for important updates and announcements.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <Card
              key={stat.id}
              className={`${stat.bgColor} border-transparent hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group overflow-hidden`}
            >
              <div className="relative">
                {/* Gradient overlay */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 opacity-10 bg-gradient-to-br ${stat.color} rounded-full -translate-y-8 translate-x-8`}
                ></div>

                <CardHeader className="pb-2 flex flex-row items-center justify-between relative z-10">
                  <CardTitle
                    className={`text-xs sm:text-sm font-medium ${stat.textColor}`}
                  >
                    {stat.label}
                  </CardTitle>
                  <div
                    className={`p-2 rounded-lg ${stat.bgColor} bg-opacity-50 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div
                    className={`text-2xl sm:text-3xl font-bold ${stat.textColor}`}
                  >
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {stat.description}
                  </p>

                  {/* Progress bar for confirmed and active */}
                  {(stat.id === "confirmed" || stat.id === "active") &&
                    statsSummary &&
                    statsSummary.total > 0 && (
                      <div className="mt-3">
                      
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              stat.id === "confirmed"
                                ? "bg-green-500"
                                : "bg-amber-500"
                            } rounded-full transition-all duration-500`}
                            style={{
                              width: `${
                                stat.id === "confirmed"
                                  ? statsSummary.confirmedPercentage
                                  : statsSummary.activePercentage
                              }%`,
                            }}
                          ></div>
                        </div>

                          <div className="flex justify-between text-xs mb-1">
                          <span className={`${stat.textColor} font-medium`}>
                            {stat.id === "confirmed"
                              ? statsSummary.confirmedPercentage
                              : statsSummary.activePercentage}
                            %
                          </span>
                          <span className="text-gray-500">of total</span>
                        </div>
                      </div>
                    )}
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Tuition Jobs and Top Rated Tutors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Recent Tuition Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPlatformJobs.slice(0, 5).map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm sm:text-base">
                      {job.subject || job.title || "Tuition Request"}
                    </div>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {job.district && job.area
                        ? `${job.district} • ${job.area}`
                        : job.location || "Location not specified"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(
                        job.createdAt || job.created_at
                      ).toLocaleDateString()}
                    </div>
                    {job.salary && (
                      <div className="text-xs text-green-600 font-medium">
                        ৳{job.salary}
                        {job.isSalaryNegotiable && " (Negotiable)"}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        job.status === "Active"
                          ? "bg-green-600"
                          : job.status === "Completed"
                          ? "bg-blue-600"
                          : "bg-gray-600"
                      }
                    >
                      {job.status}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      {job.matchedTutors ? job.matchedTutors.length : 0} matches
                    </span>
                  </div>
                </div>
              ))}
              {recentPlatformJobs.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No recent tuition jobs available
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveTab("search")}
                  >
                    Find Tutors
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">
              Top Rated Tutors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRatedTutors.slice(0, 5).map((tutor) => (
                <div
                  key={tutor.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-2"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm sm:text-base">
                        {tutor.full_name || tutor.name}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {typeof tutor.subjects === "string"
                          ? tutor.subjects
                          : Array.isArray(tutor.subjects)
                          ? tutor.subjects.join(", ")
                          : "Multiple Subjects"}{" "}
                        • {tutor.area || tutor.district}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span className="text-xs text-muted-foreground">
                          {tutor.rating || "N/A"}
                        </span>
                        {tutor.experience && (
                          <span className="text-xs text-muted-foreground ml-2">
                            • {tutor.experience} years exp
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 text-xs sm:text-sm"
                      onClick={() =>
                        window.open(`/tutor/${tutor?.tutor_id}`, "_blank")
                      }
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              ))}
              {topRatedTutors.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    No top-rated tutors available
                  </p>
                  <Button
                    size="sm"
                    className="mt-2 bg-green-600 hover:bg-green-700"
                    onClick={() => setActiveTab("search")}
                  >
                    Find Tutors
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
