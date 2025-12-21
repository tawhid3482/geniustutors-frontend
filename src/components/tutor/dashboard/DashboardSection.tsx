"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  CheckCircle,
  Crown,
  Briefcase,
  FileText,
  UserCheck,
  HeartHandshake,
  XCircle,
  MapPin,
  ArrowRight,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";
import { tutorDashboardService } from "@/services/tutorDashboardService";
import { noticeBoardService } from "@/services/noticeBoardService";
import { useGetAllNoticeByRoleQuery } from "@/redux/features/notice/noticeApi";
import {
  useGetMYInfoQuery,
  useGetTutorStatsQuery,
} from "@/redux/features/auth/authApi";
import { useGetAllTutorRequestsForPublicQuery } from "@/redux/features/tutorRequest/tutorRequestApi";
import ProfileSection from "../ProfileSection";

const DashboardSection = () => {
  const { user } = useAuth();

  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    thisMonthEarnings: 0,
    totalSessions: 0,
    completedSessions: 0,
    pendingSessions: 0,
    averageRating: "0.0",
    totalStudents: 0,
    activeJobs: 0,
    appliedJobs: 0,
    acceptedJobs: 0,
    shortlistedJobs: 0,
    appointedJobs: 0,
    confirmedJobs: 0,
    cancelledJobs: 0,
    nearbyJobs: 0, // Will calculate from jobs data
    profileCompletion: 0, // Will calculate from user info
    isVerified: false, // From MyInfo data
    isGeniusTutor: false, // From MyInfo data
  });

  const [loading, setLoading] = useState(true);

  const userId = user?.id as string;

  const {
    data: noticeResponse,
    isLoading: loadingNotices,
    error,
  } = useGetAllNoticeByRoleQuery({
    id: userId,
  });

  const { data: MyInfo, isLoading: loadingMyInfo } = useGetMYInfoQuery(userId);
  const { data: AllJobs, isLoading: loadingAllJobs } =
    useGetAllTutorRequestsForPublicQuery(undefined);

  const { data: tutorStatus } = useGetTutorStatsQuery(userId);

  const tutorStatusData = tutorStatus?.data

  // Calculate profile completion percentage
  const calculateProfileCompletion = (userData: any) => {
    if (!userData) return 0;

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "gender",
      "avatar",
      "bio",
      "location",
      "district",
      "nationality",
      "religion",
      "education",
      "qualification",
      "experience",
      "hourly_rate",
      "subjects",
      "preferred_areas",
      "availability",
      "Institute_name",
      "department_name",
    ];

    let filledFields = 0;

    requiredFields.forEach((field) => {
      const value = userData[field];
      if (value !== null && value !== undefined && value !== "") {
        if (Array.isArray(value) && value.length > 0) {
          filledFields++;
        } else if (typeof value === "number") {
          filledFields++;
        } else if (typeof value === "string" && value.trim() !== "") {
          filledFields++;
        } else if (typeof value === "boolean") {
          filledFields++;
        }
      }
    });

    return Math.round((filledFields / requiredFields.length) * 100);
  };

  // Calculate nearby jobs based on preferred_areas
  const calculateNearbyJobs = (userData: any, jobsData: any) => {
    if (
      !userData ||
      !jobsData ||
      !jobsData.data ||
      !Array.isArray(jobsData.data)
    )
      return 0;

    const preferredAreas = userData.preferred_areas || [];
    if (preferredAreas.length === 0) return 0;

    // Convert preferred areas to lowercase for case-insensitive comparison
    const preferredAreasLower = preferredAreas.map((area: string) =>
      area.toLowerCase()
    );

    const nearbyJobs = jobsData.data.filter((job: any) => {
      const jobArea = job.area?.toLowerCase() || "";
      const jobDistrict = job.district?.toLowerCase() || "";

      return preferredAreasLower.some(
        (preferredArea: string) =>
          jobArea.includes(preferredArea) ||
          jobDistrict.includes(preferredArea) ||
          preferredArea.includes(jobArea) ||
          preferredArea.includes(jobDistrict)
      );
    });

    return nearbyJobs.length;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const stats = await tutorDashboardService.getDashboardStats();

        // Get user info from MyInfo query
        const userInfo = MyInfo?.data;
        const jobsData = AllJobs;

        // Calculate derived values
        const profileCompletion = calculateProfileCompletion(userInfo);
        const nearbyJobs = calculateNearbyJobs(userInfo, jobsData);
        const isVerified = userInfo?.verified || false;
        const isGeniusTutor = userInfo?.genius || false;

        setDashboardStats((prev) => ({
          ...prev,
          ...stats,
          profileCompletion,
          nearbyJobs,
          isVerified,
          isGeniusTutor,
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (MyInfo && AllJobs) {
      fetchDashboardData();
    }
  }, [MyInfo, AllJobs]);

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

  const isLoading = loading || loadingMyInfo || loadingAllJobs;
  const notices = noticeResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      {/* Notice Board */}
      <Card className="bg-white rounded-xl shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Megaphone className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Notice Boards
            </h2>
          </div>

          {loadingNotices ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading notices...</span>
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

      {/* Verification & Badge Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  dashboardStats.isVerified ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                <CheckCircle
                  className={`h-6 w-6 ${
                    dashboardStats.isVerified
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Verification Status
                </h3>
                <p
                  className={`text-sm ${
                    dashboardStats.isVerified
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {dashboardStats.isVerified
                    ? "Verified Tutor"
                    : "Not Verified"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  dashboardStats.isGeniusTutor ? "bg-yellow-100" : "bg-gray-100"
                }`}
              >
                <Crown
                  className={`h-6 w-6 ${
                    dashboardStats.isGeniusTutor
                      ? "text-yellow-600"
                      : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Genius Tutor Badge
                </h3>
                <p
                  className={`text-sm ${
                    dashboardStats.isGeniusTutor
                      ? "text-yellow-600"
                      : "text-gray-500"
                  }`}
                >
                  {dashboardStats.isGeniusTutor
                    ? "Genius Tutor"
                    : "Standard Tutor"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData.total}
            </div>
            <div className="text-sm text-gray-600">Applied Jobs</div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData.pending}
            </div>
            <div className="text-sm text-gray-600">Pending </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-green-700 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData.accepted}
            </div>
            <div className="text-sm text-gray-600">Accepted </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <HeartHandshake className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData.under_review}
            </div>
            <div className="text-sm text-gray-600">Under Reviews </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData.rejected}
            </div>
            <div className="text-sm text-gray-600">Rejected </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nearby Jobs */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Nearby Jobs
            </h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">
                {dashboardStats.nearbyJobs}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                {dashboardStats.nearbyJobs === 0
                  ? "No jobs in your preferred areas"
                  : `in your preferred areas`}
              </div>
              <div className="flex items-center justify-center text-green-600 hover:text-green-700 cursor-pointer">
                <a href="tuition-jobs">
                  <span className="text-sm font-medium">View Jobs</span>
                </a>
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Completed */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <svg
                  className="w-16 h-16 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-green-600"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${dashboardStats.profileCompletion}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-green-600">
                    {dashboardStats.profileCompletion}%
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Profile Completed
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Complete & organized profile may help to get better response.
                </p>
                <div className="flex items-center  cursor-pointer">
                  <span className="text-sm ">
                    Go to Profile Section and Update Your Profile
                  </span>
                  {/* {activeTab === "profile" && <ProfileSection />} */}
                  {/* <ArrowRight className="h-4 w-4 ml-1" /> */}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card (Optional) */}
        <Card className="bg-white rounded-xl shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Reviews</span>
                <span className="font-semibold text-gray-800">
                  {MyInfo?.data?.total_reviews || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Experience</span>
                <span className="font-semibold text-gray-800">
                  {MyInfo?.data?.experience || 0} years
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge
                  className={`${
                    MyInfo?.data?.tutorStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : MyInfo?.data?.tutorStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {MyInfo?.data?.tutorStatus || "pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSection;
