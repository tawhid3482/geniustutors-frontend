"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Search, Star, Award, CheckCircle } from "lucide-react";
import { ALL_DISTRICTS } from "@/data/bangladeshDistricts";
import { useGetAllTutorPublicQuery } from "@/redux/features/tutorHub/tutorHubApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";

export function StudentSearch() {
  // Local state for all filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("any");
  const [filterArea, setFilterArea] = useState("all");
  const [filterGender, setFilterGender] = useState("any");
  const [filterRating, setFilterRating] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [filterExperience, setFilterExperience] = useState<string>("0");
  const [filterEducation, setFilterEducation] = useState<string>("all");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("all");
  const [filterSortOrder, setFilterSortOrder] = useState<string>("desc");

  // RTK Query to fetch tutors
  const {
    data: tutorsResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllTutorPublicQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Extract tutors from the response
  const tutors = tutorsResponse?.data || [];

  // Auto-refetch data when component mounts
  useEffect(() => {
    refetch();
  }, [refetch]);

  // Helper function to check if tutor is verified
  const isVerified = (verified: any) => {
    if (!verified) return false;
    if (verified === "0" || verified === 0) return false;
    if (verified === "false" || verified === false) return false;
    if (verified === "no" || verified === "No") return false;
    return true;
  };

  // Filter tutors based on all criteria
  const filteredTutors = tutors.filter((tutor: any) => {
    // Search by name, email, institute, department, or subjects
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = tutor.fullName?.toLowerCase().includes(query) || false;
      const emailMatch = tutor.email?.toLowerCase().includes(query) || false;
      const instituteMatch =
        tutor.Institute_name?.toLowerCase().includes(query) || false;
      const departmentMatch =
        tutor.department_name?.toLowerCase().includes(query) || false;

      // Check if any subject matches (case-insensitive)
      const subjectMatch =
        tutor.subjects?.some((subject: string) =>
          subject?.toLowerCase().includes(query)
        ) || false;

      if (
        !nameMatch &&
        !emailMatch &&
        !instituteMatch &&
        !departmentMatch &&
        !subjectMatch
      ) {
        return false;
      }
    }

    // Filter by subject (case-insensitive)
    if (filterSubject !== "any") {
      if (tutor.subjects && tutor.subjects.length > 0) {
        const lowerCaseSubjects = tutor.subjects.map(
          (subject: string) => subject?.toLowerCase() || ""
        );
        const filterSubjectLower = filterSubject.toLowerCase();
        const hasSubject = lowerCaseSubjects.some((subject: string) =>
          subject.includes(filterSubjectLower)
        );
        if (!hasSubject) {
          return false;
        }
      } else {
        return false;
      }
    }

    // Filter by area (district)
    if (filterArea !== "all") {
      if (
        !tutor.district ||
        tutor.district.toLowerCase() !== filterArea.toLowerCase()
      ) {
        return false;
      }
    }

    // Filter by gender
    if (filterGender !== "any") {
      if (
        !tutor.gender ||
        tutor.gender.toLowerCase() !== filterGender.toLowerCase()
      ) {
        return false;
      }
    }

    // Filter by rating
    if (filterRating > 0) {
      const tutorRating = tutor.rating || 0;
      if (tutorRating < filterRating) {
        return false;
      }
    }

    // Filter by experience
    if (filterExperience !== "0") {
      const minExperience = parseInt(filterExperience);
      const tutorExperience = tutor.experience || 0;
      if (tutorExperience < minExperience) {
        return false;
      }
    }

    // Filter by education
    if (filterEducation !== "all") {
      if (
        !tutor.education ||
        tutor.education.toLowerCase() !== filterEducation.toLowerCase()
      ) {
        return false;
      }
    }

    // Filter by availability
    if (filterAvailability !== "all") {
      if (
        !tutor.availability ||
        tutor.availability.toLowerCase() !== filterAvailability.toLowerCase()
      ) {
        return false;
      }
    }

    // Filter by maximum price
    if (filterMaxPrice.trim()) {
      const maxPrice = parseFloat(filterMaxPrice);
      const tutorPrice = tutor.hourly_rate || 0;
      if (tutorPrice > maxPrice) {
        return false;
      }
    }

    return true;
  });

  // Apply sorting
  let sortedTutors = [...filteredTutors];

  if (filterSortBy !== "all") {
    sortedTutors.sort((a: any, b: any) => {
      let aValue, bValue;

      switch (filterSortBy) {
        case "rating":
          aValue = a.rating || 0;
          bValue = b.rating || 0;
          break;
        case "hourly_rate":
          aValue = a.hourly_rate || 0;
          bValue = b.hourly_rate || 0;
          break;
        case "experience":
          aValue = a.experience || 0;
          bValue = b.experience || 0;
          break;
        case "total_reviews":
          aValue = a.total_reviews || 0;
          bValue = b.total_reviews || 0;
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (filterSortOrder === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 w-full">
        <Card className="border-green-100/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-600" /> Find Tutors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-green-100">
              <CardContent className="p-6">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-8 text-center">
          <p className="text-red-600">
            Error loading tutors. Please try again.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <Card className="border-green-100/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-green-600" /> Find Tutors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-2 xl:col-span-3">
              <Label>Search</Label>
              <Input
                className="mt-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutors by name, email, institute or subjects..."
              />
            </div>

            {/* Subject Filter */}
            <div>
              <Label>Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Computer Science">
                    Computer Science
                  </SelectItem>
                  <SelectItem value="Programming">Programming</SelectItem>
                  <SelectItem value="Bangla">Bangla</SelectItem>
                  <SelectItem value="Economics">Economics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* District Filter */}
            <div>
              <Label>District</Label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {ALL_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Gender Filter */}
            <div>
              <Label>Gender</Label>
              <Select
                value={filterGender}
                onValueChange={(v) => setFilterGender(v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Gender</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <Label>Minimum Rating</Label>
              <Select
                value={String(filterRating)}
                onValueChange={(v) => setFilterRating(Number(v))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Filter */}
            <div>
              <Label>Minimum Experience (Years)</Label>
              <Select
                value={filterExperience}
                onValueChange={setFilterExperience}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Experience</SelectItem>
                  <SelectItem value="1">1+ Years</SelectItem>
                  <SelectItem value="2">2+ Years</SelectItem>
                  <SelectItem value="3">3+ Years</SelectItem>
                  <SelectItem value="5">5+ Years</SelectItem>
                  <SelectItem value="10">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Education Filter */}
            <div>
              <Label>Education</Label>
              <Select
                value={filterEducation}
                onValueChange={setFilterEducation}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Education</SelectItem>
                  <SelectItem value="HSC">HSC</SelectItem>
                  <SelectItem value="Diploma">Diploma</SelectItem>
                  <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div>
              <Label>Availability</Label>
              <Select
                value={filterAvailability}
                onValueChange={setFilterAvailability}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Availability</SelectItem>
                  <SelectItem value="Weekdays">Weekdays</SelectItem>
                  <SelectItem value="Weekends">Weekends</SelectItem>
                  <SelectItem value="Evenings">Evenings</SelectItem>
                  <SelectItem value="Mornings">Mornings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Maximum Price Filter */}
            <div>
              <Label>Maximum Price (৳/hour)</Label>
              <Input
                type="number"
                placeholder="Any Price"
                min="0"
                className="mt-1"
                value={filterMaxPrice}
                onChange={(e) => setFilterMaxPrice(e.target.value)}
              />
            </div>

            {/* Sort By */}
            <div>
              <Label>Sort By</Label>
              <Select value={filterSortBy} onValueChange={setFilterSortBy}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Default (No Sorting)</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="hourly_rate">Price</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="total_reviews">
                    Number of Reviews
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <Label>Sort Order</Label>
              <Select
                value={filterSortOrder}
                onValueChange={setFilterSortOrder}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
            <div className="lg:col-span-2 xl:col-span-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setFilterSubject("any");
                  setFilterArea("all");
                  setFilterGender("any");
                  setFilterRating(0);
                  setFilterExperience("0");
                  setFilterEducation("all");
                  setFilterAvailability("all");
                  setFilterMaxPrice("");
                  setFilterSortBy("all");
                  setFilterSortOrder("desc");
                  setViewMode("grid");
                }}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Header */}
      {tutors.length > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Available Tutors
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {sortedTutors.length} tutor{sortedTutors.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">View:</span>
            <Toggle
              pressed={viewMode === "grid"}
              onPressedChange={(v) => setViewMode(v ? "grid" : "list")}
            >
              Grid
            </Toggle>
            <Toggle
              pressed={viewMode === "list"}
              onPressedChange={(v) => setViewMode(v ? "list" : "grid")}
            >
              List
            </Toggle>
          </div>
        </div>
      )}

      {/* Tutors Display */}
      {!isLoading && tutors.length > 0 ? (
        sortedTutors.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {sortedTutors.map((tutor: any) => (
              <Card
                key={tutor.id}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full border border-green-300"
              >
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Tutor Header */}
                  <div className="flex items-start gap-3 mb-4">
                    {/* Tutor Image */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
                      {tutor.avatar ? (
                        <img
                          src={tutor.avatar}
                          alt={tutor.fullName || "Tutor"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-green-600 font-semibold text-xl">
                          {tutor.fullName
                            ? tutor.fullName.charAt(0).toUpperCase()
                            : "T"}
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900 truncate">
                          {tutor.fullName || "Tutor Name"}
                        </h3>
                      </div>

                      {/* Badges */}
                      {(tutor.premium || isVerified(tutor.verified)) && (
                        <div className="flex items-center gap-1 mb-3">
                          {tutor.premium && (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-1">
                              <Award className="h-3 w-3 mr-1" />
                              Genius
                            </Badge>
                          )}
                          {isVerified(tutor.verified) && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      )}
                      {/* Status Badge */}
                      {tutor.tutorStatus && (
                        <Badge
                          className={`text-xs px-2 py-1 mb-3 ${
                            tutor.tutorStatus === "approved"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : tutor.tutorStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                              : "bg-red-100 text-red-800 border-red-200"
                          }`}
                        >
                          {tutor.tutorStatus}
                        </Badge>
                      )}

                      {/* Institute */}
                      {tutor.Institute_name && (
                        <p className="text-sm text-gray-800 mb-1">
                          Institute Name : {tutor.Institute_name}
                        </p>
                      )}

                      {/* Location */}
                      <p className="text-sm text-gray-500">
                        {tutor.district || "Location not specified"}
                      </p>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium">
                          {tutor.rating || 0}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({tutor.total_reviews || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tutor Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      {tutor.department_name && (
                        <div>
                          <span className="text-xs font-medium text-black uppercase tracking-wide">
                            Department
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {tutor.department_name}
                          </p>
                        </div>
                      )}

                      {/* Year */}
                      {tutor.year && (
                        <div>
                          <span className="text-xs font-medium text-black uppercase tracking-wide">
                            Year
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {tutor.year}
                          </p>
                        </div>
                      )}

                      {tutor.experience !== undefined &&
                        tutor.experience !== null && (
                          <div>
                            <span className="text-xs font-medium text-black uppercase tracking-wide">
                              Experience
                            </span>
                            <p className="text-sm text-gray-700 mt-1">
                              {tutor.experience} years
                            </p>
                          </div>
                        )}

                      {/* Education */}
                      {tutor.education && (
                        <div>
                          <span className="text-xs font-medium text-black uppercase tracking-wide">
                            Education
                          </span>
                          <p className="text-sm text-gray-700 mt-1">
                            {tutor.education}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Subjects */}
                    {tutor.subjects && tutor.subjects.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-black uppercase tracking-wide">
                          Subjects
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tutor.subjects.map(
                            (subject: string, index: number) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    <Button
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={() =>
                        window.open(`/tutor/${tutor.tutor_id}`, "_blank")
                      }
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No tutors found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or filters to find more tutors.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setFilterSubject("any");
                  setFilterArea("all");
                  setFilterGender("any");
                  setFilterRating(0);
                  setFilterExperience("0");
                  setFilterEducation("all");
                  setFilterAvailability("all");
                  setFilterMaxPrice("");
                  setFilterSortBy("all");
                  setFilterSortOrder("desc");
                  setViewMode("grid");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )
      ) : !isLoading && tutors.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tutors available
            </h3>
            <p className="text-gray-500 mb-4">
              There are currently no tutors available. Please check back later.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}