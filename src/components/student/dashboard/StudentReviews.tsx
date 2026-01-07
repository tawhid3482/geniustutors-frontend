"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Star,
  DollarSign,
  BookOpen,
  GraduationCap,
  Award,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Book,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetAllTutorPublicQuery } from "@/redux/features/tutorHub/tutorHubApi";

interface Tutor {
  id: string;
  tutor_id: number;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  verified: boolean;
  premium: boolean;
  genius: boolean;
  tutorStatus: string;
  status: string;
  rating: number | null;
  total_reviews: number;
  hourly_rate: number;
  experience: number;
  education: string | null;
  qualification: string | null;
  district: string;
  present_location: string | null;
  preferred_areas: string[];
  subjects: string[];
  educational_qualifications: string | null;
  other_skills: string[];
  preferred_tutoring_style: string[];
  preferred_time: string[];
  bio: string | null;
  gender: string;
  createdAt: string;
}

const StudentReviews = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Use RTK Query hook
  const { data: tutorData, isLoading, error } = useGetAllTutorPublicQuery(undefined);
  
  // Get tutors from the response data structure
  const tutors = tutorData?.data || [];
  
 

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get initials from full name
  const getInitials = (name: string) => {
    if (!name) return "T";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format name
  const formatName = (name: string) => {
    if (!name) return "Unknown Tutor";
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Parse educational qualifications
  const parseQualifications = (qualifications: string | null) => {
    if (!qualifications) return [];
    try {
      return JSON.parse(qualifications);
    } catch {
      return [];
    }
  };

  // Get highest qualification
  const getHighestQualification = (tutor: Tutor) => {
    if (tutor.education) return tutor.education;
    if (tutor.qualification) return tutor.qualification;

    const quals = parseQualifications(tutor.educational_qualifications);
    if (quals.length > 0) {
      return quals[quals.length - 1].examTitle || "Diploma";
    }

    return "Not specified";
  };

  // Get display location
  const getLocation = (tutor: Tutor) => {
    if (tutor.present_location) return tutor.present_location;
    if (tutor.district) return tutor.district;
    if (tutor.preferred_areas && tutor.preferred_areas.length > 0) {
      return tutor.preferred_areas[0];
    }
    return "Location not specified";
  };

  // Handle view profile
  const handleViewProfile = (tutorId: string) => {
    router.push(`/tutor/${tutorId}`);
  };

  // Handle errors
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-600 mb-2">
            Error loading tutors
          </h3>
          <p className="text-gray-600">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  // Loading states
  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="bg-white rounded-xl shadow-lg border border-gray-200 animate-pulse"
            >
              <CardContent className="p-5">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-16 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!tutors || tutors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex flex-col items-center justify-center">
        <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No tutors found
        </h3>
        <p className="text-gray-500 text-center">
          There are no tutors available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Available Tutors
        </h1>
        <p className="text-gray-600">
          Find and connect with experienced tutors. {tutors.length} tutors
          available.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {tutors.map((tutor: any) => (
          <Card
            key={tutor.id || tutor.tutor_id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300 overflow-hidden"
          >
            <CardContent className="p-5">
              {/* Header with avatar and badges */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-green-100">
                      <AvatarImage
                        src={tutor.avatar}
                        alt={tutor.fullName}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-green-100 text-green-800 font-semibold">
                        {getInitials(tutor.fullName)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Badges */}
                    <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                      {tutor.verified && (
                        <div
                          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                          title="Verified Tutor"
                        >
                          <CheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {tutor.premium && (
                        <div
                          className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                          title="Premium Tutor"
                        >
                          <Award className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {tutor.genius && (
                        <div
                          className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center"
                          title="Genius Tutor"
                        >
                          <Star className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {formatName(tutor.fullName)}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          tutor.tutorStatus === "approved"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : tutor.tutorStatus === "pending"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {tutor.tutorStatus || "Unknown"}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        ID: {tutor.tutor_id || tutor.id?.slice(-4)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(tutor.rating || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-700">
                  ({tutor.rating || "No"} rating • {tutor.total_reviews || 0}{" "}
                  reviews)
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-1">
                  {getLocation(tutor)}
                </span>
              </div>

              {/* Subjects */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">
                    Subjects:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {tutor.subjects?.slice(0, 3).map((subject: string, index: number) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      {subject}
                    </span>
                  ))}
                  {tutor.subjects?.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      +{tutor.subjects.length - 3} more
                    </span>
                  )}
                  {(!tutor.subjects || tutor.subjects.length === 0) && (
                    <span className="text-xs text-gray-500">Not specified</span>
                  )}
                </div>
              </div>

              {/* Qualifications */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">
                    Qualification:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    {getHighestQualification(tutor)}
                  </span>
                  {tutor.experience > 0 && (
                    <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200">
                      {tutor.experience} yrs exp
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Hourly Rate</p>
                    <p className="text-sm font-semibold text-gray-800">
                      ৳{tutor.hourly_rate || "Negotiable"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-3 w-3 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="text-sm font-semibold text-gray-800 capitalize">
                      {tutor.gender || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferred Areas */}
              {tutor.preferred_areas && tutor.preferred_areas.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-medium text-gray-700">
                      Preferred Areas:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tutor.preferred_areas.slice(0, 2).map((area: string, index: number) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 border border-green-200"
                      >
                        {area}
                      </span>
                    ))}
                    {tutor.preferred_areas.length > 2 && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 border border-gray-200">
                        +{tutor.preferred_areas.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* View Button */}
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2.5 rounded-lg transition-all duration-300 hover:shadow-lg"
                onClick={() => handleViewProfile(tutor.tutor_id?.toString() || tutor.id)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentReviews;