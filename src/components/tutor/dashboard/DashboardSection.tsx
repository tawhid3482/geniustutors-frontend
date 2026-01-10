"use client";

import React, { useState, useEffect } from "react";
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
import { useGetAllNoticeByRoleQuery } from "@/redux/features/notice/noticeApi";
import {
  useGetMYInfoQuery,
  useGetTutorStatsQuery,
} from "@/redux/features/auth/authApi";
import { useGetAllTutorRequestsForPublicQuery } from "@/redux/features/tutorRequest/tutorRequestApi";

interface ProfileFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  gender: string;
  religion: string;
  nationality: string;
  blood_group: string;

  // Institute Information
  Institute_name: string;
  department_name: string;
  year: string;

  // Location Information
  location: string;
  district: string;
  thana: string;

  // Tutoring Information
  preferred_class: string[];
  subjects: string[];
  preferred_tutoring_style: string;
  days_per_week: number;
  availability: string[];
  preferred_time: string[];
  preferred_areas: string[];
  expected_salary: string;

  // Skills & Bio
  other_skills: string[];
  social_media_links: string;
  bio: string;
  experience: string;
  hourly_rate: string;
  preferred_student_gender: string;
}

interface CompletionDetails {
  percentage: number;
  message: string;
  suggestions: string[];
}

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
    nearbyJobs: 0,
    profileCompletion: 0,
    isVerified: false,
    isGeniusTutor: false,
  });

  const [completionDetails, setCompletionDetails] = useState<CompletionDetails>(
    {
      percentage: 0,
      message: "",
      suggestions: [],
    }
  );

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

  const tutorStatusData = tutorStatus?.data;

  // Calculate profile completion percentage based on ProfileFormData
  const calculateProfileCompletion = (userData: any): number => {
    if (!userData) return 0;

    // Define required fields from ProfileFormData with their weight
    const requiredFields = [
      // Personal Information (Weight: 20%)
      { field: "fullName", weight: 2 },
      { field: "email", weight: 1 },
      { field: "phone", weight: 2 },
      { field: "avatar", weight: 2 },
      { field: "gender", weight: 1 },
      { field: "religion", weight: 0.5 },
      { field: "nationality", weight: 0.5 },
      { field: "blood_group", weight: 0.5 },

      // Institute Information (Weight: 10%)
      { field: "Institute_name", weight: 3 },
      { field: "department_name", weight: 3 },
      { field: "year", weight: 2 },

      // Location Information (Weight: 15%)
      { field: "location", weight: 3 },
      { field: "district", weight: 3 },
      { field: "thana", weight: 2 },

      // Tutoring Information (Weight: 25%)
      { field: "preferred_class", weight: 3, isArray: true },
      { field: "subjects", weight: 4, isArray: true },
      { field: "preferred_tutoring_style", weight: 2 },
      { field: "days_per_week", weight: 1 },
      { field: "availability", weight: 2, isArray: true },
      { field: "preferred_time", weight: 2, isArray: true },
      { field: "preferred_areas", weight: 4, isArray: true },
      { field: "expected_salary", weight: 1 },

      // Skills & Bio (Weight: 20%)
      { field: "bio", weight: 4 },
      { field: "experience", weight: 3 },
      { field: "hourly_rate", weight: 2 },
      { field: "preferred_student_gender", weight: 1 },
      { field: "other_skills", weight: 2, isArray: true },
      { field: "social_media_links", weight: 1 },
    ];

    let totalScore = 0;
    let maxScore = 0;

    requiredFields.forEach((fieldInfo) => {
      maxScore += fieldInfo.weight;

      const value = userData[fieldInfo.field];

      if (fieldInfo.isArray) {
        // For array fields
        if (value && Array.isArray(value) && value.length > 0) {
          totalScore += fieldInfo.weight;
        }
      } else {
        // For regular fields
        if (value !== null && value !== undefined && value !== "") {
          if (typeof value === "number" && value > 0) {
            totalScore += fieldInfo.weight;
          } else if (typeof value === "string" && value.trim() !== "") {
            totalScore += fieldInfo.weight;
          } else if (typeof value === "boolean") {
            totalScore += fieldInfo.weight;
          }
        }
      }
    });

    // Calculate percentage
    const percentage = Math.round((totalScore / maxScore) * 100);

    // Ensure it's between 0 and 100
    return Math.min(100, Math.max(0, percentage));
  };

  // Get completion details for showing in UI
  const getProfileCompletionDetails = (userData: any): CompletionDetails => {
    const completion = calculateProfileCompletion(userData);

    let message = "";
    let suggestions: string[] = [];

    // Check which fields are missing and give specific suggestions
    const missingFields: string[] = [];
    const userFields = userData || {};

    // Check each field
    const fieldLabels: Record<string, string> = {
      fullName: "Full Name",
      email: "Email",
      phone: "Phone Number",
      avatar: "Profile Photo",
      gender: "Gender",
      religion: "Religion",
      nationality: "Nationality",
      blood_group: "Blood Group",
      Institute_name: "Institute Name",
      department_name: "Department",
      year: "Year/Semester",
      location: "Location",
      district: "District",
      thana: "Thana",
      preferred_class: "Preferred Classes",
      subjects: "Subjects",
      preferred_tutoring_style: "Tutoring Style",
      days_per_week: "Days Per Week",
      availability: "Availability Days",
      preferred_time: "Preferred Time",
      preferred_areas: "Preferred Areas",
      expected_salary: "Expected Salary",
      bio: "Bio/About",
      experience: "Experience",
      hourly_rate: "Hourly Rate",
      preferred_student_gender: "Preferred Student Gender",
      other_skills: "Other Skills",
      social_media_links: "Social Media Links",
    };

    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "avatar",
      "gender",
      "Institute_name",
      "department_name",
      "year",
      "location",
      "district",
      "thana",
      "preferred_class",
      "subjects",
      "preferred_tutoring_style",
      "days_per_week",
      "availability",
      "preferred_time",
      "preferred_areas",
      "expected_salary",
      "bio",
      "experience",
      "hourly_rate",
      "preferred_student_gender",
    ];

    requiredFields.forEach((field) => {
      const value = userFields[field];
      let isValid = false;

      if (Array.isArray(value)) {
        isValid = value.length > 0;
      } else if (typeof value === "string") {
        isValid = value.trim() !== "";
      } else if (typeof value === "number") {
        isValid = value > 0;
      } else {
        isValid = !!value;
      }

      if (!isValid && fieldLabels[field]) {
        missingFields.push(fieldLabels[field]);
      }
    });

    if (completion < 30) {
      message = "Basic Profile - Add more details to get better opportunities";
      suggestions = missingFields.slice(0, 4); // Show first 4 missing fields
    } else if (completion < 60) {
      message = "Good Profile - Almost there! Complete a few more sections";
      suggestions = missingFields.slice(0, 3);
    } else if (completion < 85) {
      message = "Great Profile - Looking good! Just a few enhancements needed";
      suggestions = missingFields.slice(0, 2);
    } else {
      message = "Excellent Profile - You're ready to get more students!";
      suggestions = ["Keep your profile updated", "Add reviews from students"];
    }

    return {
      percentage: completion,
      message,
      suggestions,
    };
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

        // Calculate profile completion using the new function
        const completionData = getProfileCompletionDetails(userInfo);

        const nearbyJobs = calculateNearbyJobs(userInfo, jobsData);
        const isVerified = userInfo?.verified || false;
        const isGeniusTutor = userInfo?.genius || false;

        setDashboardStats((prev) => ({
          ...prev,
          ...stats,
          profileCompletion: completionData.percentage,
          nearbyJobs,
          isVerified,
          isGeniusTutor,
        }));

        // Store completion details in state
        setCompletionDetails(completionData);
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
              {tutorStatusData?.total || 0}
            </div>
            <div className="text-sm text-gray-600">Applied Jobs</div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData?.pending || 0}
            </div>
            <div className="text-sm text-gray-600">Pending </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-green-700 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData?.accepted || 0}
            </div>
            <div className="text-sm text-gray-600">Accepted </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <HeartHandshake className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData?.under_review || 0}
            </div>
            <div className="text-sm text-gray-600">Under Reviews </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {tutorStatusData?.rejected || 0}
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
                    className={`${
                      completionDetails.percentage < 30
                        ? "text-red-600"
                        : completionDetails.percentage < 60
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${completionDetails.percentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-800">
                    {completionDetails.percentage}%
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Profile Completed
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {completionDetails.message}
                </p>
                {completionDetails.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Suggestions to improve:
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {completionDetails.suggestions.map(
                        (suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-1">•</span>
                            {suggestion}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <a
                    href="/tutor/profile"
                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                  >
                    <span>Go to Profile Section</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Card */}
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Hourly Rate</span>
                <span className="font-semibold text-gray-800">
                  ৳{MyInfo?.data?.hourly_rate || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardSection;
