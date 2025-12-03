"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Eye, MapPin, Clock, Users, DollarSign, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetAllTutorRequestsForPublicQuery } from "@/redux/features/tutorRequest/tutorRequestApi";
import { useGetMYInfoQuery } from "@/redux/features/auth/authApi";
import { useAuth } from "@/contexts/AuthContext.next";

// Type for transformed job data
interface TuitionJob {
  id: string;
  subject: string;
  studentClass: string;
  district: string;
  area: string;
  salaryRangeMin: number;
  salaryRangeMax: number;
  tutoringType: string;
  daysPerWeek: number;
  preferredTeacherGender: string;
  studentGender: string;
  extraInformation?: string;
  createdAt: string;
  numberOfStudents: number;
  tutoringTime: string;
  tutoringDuration: string;
  medium: string;
  isSalaryNegotiable: boolean;
  selectedCategories: string[];
  selectedClasses: string[];
  selectedSubjects: string[];
  status: string;
  tutorRequestId: string;
  phoneNumber: string;
  detailedLocation: string;
}

const JobsSection = () => {
  const router = useRouter();
  const {user} =useAuth()
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  // Fetch user info for preferred areas filtering
  const { data: myInfoData } = useGetMYInfoQuery(user?.id);
  const userPreferredAreas = myInfoData?.data?.preferred_areas || [];

  // Fetch all jobs with RTK Query
  const { 
    data: jobsResponse, 
    isLoading, 
    isError,
    error 
  } = useGetAllTutorRequestsForPublicQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Transform API data to TuitionJob format
  const transformJobData = (apiData: any): TuitionJob[] => {
    if (!apiData?.data || !Array.isArray(apiData.data)) return [];
    
    return apiData.data.map((job: any) => ({
      id: job.id,
      subject: job.selectedSubjects?.[0] || job.subject || "Not specified",
      studentClass: job.selectedClasses?.[0] || job.studentClass || "Not specified",
      district: job.district || "Not specified",
      area: job.area || "Not specified",
      salaryRangeMin: job.salaryRange?.min || 0,
      salaryRangeMax: job.salaryRange?.max || 0,
      tutoringType: job.tutoringType || "Not specified",
      daysPerWeek: job.tutoringDays || 0,
      preferredTeacherGender: job.tutorGenderPreference || "Any",
      studentGender: job.studentGender || "Not specified",
      extraInformation: job.extraInformation,
      createdAt: job.createdAt,
      numberOfStudents: job.numberOfStudents || 1,
      tutoringTime: job.tutoringTime || "Not specified",
      tutoringDuration: job.tutoringDuration || "Not specified",
      medium: job.medium || "Not specified",
      isSalaryNegotiable: job.isSalaryNegotiable || false,
      selectedCategories: job.selectedCategories || [],
      selectedClasses: job.selectedClasses || [],
      selectedSubjects: job.selectedSubjects || [],
      status: job.status || "Active",
      tutorRequestId: job.tutorRequestId || "",
      phoneNumber: job.phoneNumber || "",
      detailedLocation: job.detailedLocation || "",
    }));
  };

  // Get all jobs
  const allJobs = useMemo(() => transformJobData(jobsResponse), [jobsResponse]);

  // Get unique subjects from jobs for filter dropdown
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>();
    allJobs.forEach(job => {
      job.selectedSubjects?.forEach(subject => subjects.add(subject));
      if (job.subject && job.subject !== "Not specified") {
        subjects.add(job.subject);
      }
    });
    return Array.from(subjects);
  }, [allJobs]);

  // Get unique locations from jobs for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    allJobs.forEach(job => {
      if (job.district && job.district !== "Not specified") {
        locations.add(job.district);
      }
    });
    return Array.from(locations);
  }, [allJobs]);

  // Filter jobs based on search and filters
  const filteredJobs = useMemo(() => {
    let filtered = allJobs;

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job =>
        job.subject?.toLowerCase().includes(term) ||
        job.studentClass?.toLowerCase().includes(term) ||
        job.district?.toLowerCase().includes(term) ||
        job.area?.toLowerCase().includes(term) ||
        job.detailedLocation?.toLowerCase().includes(term) ||
        job.selectedSubjects?.some(subject => subject.toLowerCase().includes(term)) ||
        job.selectedCategories?.some(category => category.toLowerCase().includes(term))
      );
    }

    // Apply subject filter
    if (selectedSubject !== "all") {
      filtered = filtered.filter(job =>
        job.subject === selectedSubject ||
        job.selectedSubjects?.includes(selectedSubject)
      );
    }

    // Apply location filter
    if (selectedLocation !== "all") {
      filtered = filtered.filter(job =>
        job.district === selectedLocation ||
        job.area === selectedLocation
      );
    }

    return filtered;
  }, [allJobs, searchTerm, selectedSubject, selectedLocation]);

  // Filter nearby jobs based on user's preferred areas
  const nearbyJobs = useMemo(() => {
    if (!userPreferredAreas || userPreferredAreas.length === 0) return allJobs;
    
    const preferredAreasLower = userPreferredAreas.map((area: string) => area.toLowerCase());
    
    return allJobs.filter(job => {
      const jobArea = job.area?.toLowerCase() || '';
      const jobDistrict = job.district?.toLowerCase() || '';
      const jobDetailedLocation = job.detailedLocation?.toLowerCase() || '';
      
      return preferredAreasLower.some((preferredArea: string) => 
        jobArea.includes(preferredArea) || 
        jobDistrict.includes(preferredArea) ||
        jobDetailedLocation.includes(preferredArea) ||
        preferredArea.includes(jobArea) ||
        preferredArea.includes(jobDistrict)
      );
    });
  }, [allJobs, userPreferredAreas]);

  const handleViewDetails = (jobId: string) => {
    router.push(`/tuition-jobs/${jobId}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-green-600"></div>
        <p className="text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading jobs</h3>
        <p className="text-gray-500">Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Jobs</h1>
          <p className="text-gray-600">
            Browse and apply for tutoring opportunities
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {filteredJobs.length} jobs available
          </Badge>
          {userPreferredAreas && userPreferredAreas.length > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {nearbyJobs.length} jobs in your preferred areas
            </Badge>
          )}
        </div>
      </div>

      {/* Search and Filters Card */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search jobs by subject, class, location, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md bg-white"
                >
                  <option value="all">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedLocation("all");
                }}
              >
                Clear Filters
              </Button>
              {userPreferredAreas && userPreferredAreas.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSubject("all");
                    setSelectedLocation("all");
                    // Show nearby jobs in filtered results
                    // We can't directly set the filteredJobs, so we show a badge
                  }}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Show Nearby Jobs ({nearbyJobs.length})
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow border hover:border-green-200">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {job.status}
                          </Badge>
                          {job.isSalaryNegotiable && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Negotiable
                            </Badge>
                          )}
                          {nearbyJobs.some(nj => nj.id === job.id) && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              <MapPin className="h-3 w-3 mr-1" />
                              Nearby
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {job.subject} Tutor for {job.studentClass} Student
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Job ID: {job.tutorRequestId}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}
                        </div>
                        <p className="text-sm text-gray-500">per month</p>
                      </div>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <GraduationCap className="h-4 w-4" />
                          <span>Subject</span>
                        </div>
                        <p className="font-medium">{job.subject}</p>
                        {job.selectedSubjects && job.selectedSubjects.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Also: {job.selectedSubjects.slice(1).join(", ")}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>Location</span>
                        </div>
                        <p className="font-medium">{job.district}</p>
                        <p className="text-xs text-gray-500">{job.area}</p>
                        {job.detailedLocation && (
                          <p className="text-xs text-gray-500">{job.detailedLocation}</p>
                        )}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>Student</span>
                        </div>
                        <p className="font-medium">{job.studentGender}, Class {job.studentClass}</p>
                        <p className="text-xs text-gray-500">{job.numberOfStudents} student(s)</p>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>Schedule</span>
                        </div>
                        <p className="font-medium">{job.tutoringTime} ({job.tutoringDuration})</p>
                        <p className="text-xs text-gray-500">{job.daysPerWeek} days/week</p>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Tutoring Type</p>
                        <Badge variant="secondary" className="bg-gray-100">
                          {job.tutoringType}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Medium</p>
                        <Badge variant="secondary" className="bg-gray-100">
                          {job.medium}
                        </Badge>
                      </div>
                    </div>

                    {job.extraInformation && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700 mb-1">Additional Information:</p>
                        <p className="text-gray-900 text-sm">{job.extraInformation}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                      <span className="flex items-center gap-1">
                        Posted: {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Preferred Tutor: {job.preferredTeacherGender}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Categories: {job.selectedCategories?.join(", ") || "General"}
                      </span>
                    </div>
                  </div>

                  <div className="lg:w-48 flex flex-col gap-3">
                    <Button
                      onClick={() => handleViewDetails(job.id)}
                      className="bg-green-600 hover:bg-green-700 w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      Apply Now
                    </Button>
                    <div className="text-xs text-gray-500 text-center mt-2">
                      {job.tutorRequestId}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tuition jobs found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedSubject !== "all" || selectedLocation !== "all"
                ? "Try adjusting your search criteria or filters."
                : "There are currently no tuition jobs available. Check back later!"}
            </p>
            {(searchTerm || selectedSubject !== "all" || selectedLocation !== "all") && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSubject("all");
                  setSelectedLocation("all");
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Nearby Jobs Section */}
      {userPreferredAreas && userPreferredAreas.length > 0 && nearbyJobs.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Jobs in Your Preferred Areas
            </h2>
            <Badge className="ml-2 bg-blue-100 text-blue-800">
              {nearbyJobs.length} jobs
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyJobs.slice(0, 3).map((job) => (
              <Card key={`nearby-${job.id}`} className="hover:shadow-md transition-shadow border-blue-100">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.subject}</h4>
                        <p className="text-sm text-gray-600">{job.studentClass}</p>
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                        Nearby
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.area}, {job.district}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-green-600">
                        ৳{job.salaryRangeMin} - ৳{job.salaryRangeMax}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(job.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsSection;