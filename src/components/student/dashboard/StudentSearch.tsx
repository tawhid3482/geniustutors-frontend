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
import { Search, Star, Award, CheckCircle, MapPin, ChevronDown, ChevronUp, X } from "lucide-react";
import { useGetAllTutorPublicQuery } from "@/redux/features/tutorHub/tutorHubApi";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect, useMemo } from "react";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";

export function StudentSearch() {
  // Local state for all filters and search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("any");
  const [filterRating, setFilterRating] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [filterExperience, setFilterExperience] = useState<string>("0");
  const [filterEducation, setFilterEducation] = useState<string>("all");
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>("");
  const [filterSortBy, setFilterSortBy] = useState<string>("all");
  const [filterSortOrder, setFilterSortOrder] = useState<string>("desc");

  // Area-based filter states
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [areaSearchQuery, setAreaSearchQuery] = useState("");
  const [isAreaFilterExpanded, setIsAreaFilterExpanded] = useState(false);

  // RTK Query to fetch tutors
  const {
    data: tutorsResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllTutorPublicQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data: districtData } = useGetAllDistrictsQuery(undefined);

  // Extract tutors from the response
  const tutors = tutorsResponse?.data || [];

  // Extract all unique areas from district data
  const allUniqueAreas = useMemo(() => {
    const areas = new Set<string>();
    
    if (districtData?.data) {
      districtData.data.forEach((district: any) => {
        if (district.area && Array.isArray(district.area)) {
          district.area.forEach((area: string) => {
            // Clean up area names
            const cleanArea = area.trim();
            if (cleanArea) {
              areas.add(cleanArea);
            }
          });
        }
      });
    }
    
    // Also extract areas from tutors
    tutors.forEach((tutor: any) => {
      if (tutor.area) {
        if (Array.isArray(tutor.area)) {
          tutor.area.forEach((area: string) => {
            const cleanArea = area.trim();
            if (cleanArea) {
              areas.add(cleanArea);
            }
          });
        } else if (typeof tutor.area === 'string') {
          // Split comma separated areas
          const areaList = tutor.area.split(',').map((a: string) => a.trim());
          areaList.forEach((area: string) => {
            if (area) {
              areas.add(area);
            }
          });
        }
      }
    });
    
    return Array.from(areas).sort();
  }, [districtData, tutors]);

  // Filter areas based on search query
  const filteredAreas = useMemo(() => {
    if (!areaSearchQuery.trim()) {
      return allUniqueAreas;
    }
    
    const query = areaSearchQuery.toLowerCase().trim();
    return allUniqueAreas.filter(area => 
      area.toLowerCase().includes(query)
    );
  }, [allUniqueAreas, areaSearchQuery]);

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

  // Helper function to check if tutor has area
  const tutorHasArea = (tutor: any, selectedArea: string): boolean => {
    if (selectedArea === "all") return true;
    if (!tutor.area) return false;
    
    let tutorAreas: string[] = [];
    
    if (Array.isArray(tutor.area)) {
      tutorAreas = tutor.area.map((area: string) => area.trim());
    } else if (typeof tutor.area === 'string') {
      // Split by comma and trim each area
      tutorAreas = tutor.area.split(',').map((area: string) => area.trim());
    }
    
    // Check if any tutor area matches the selected area
    return tutorAreas.some((area: string) => area === selectedArea);
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

    // Filter by maximum price
    if (filterMaxPrice.trim()) {
      const maxPrice = parseFloat(filterMaxPrice);
      const tutorPrice = tutor.hourly_rate || 0;
      if (tutorPrice > maxPrice) {
        return false;
      }
    }

    // Filter by area
    if (!tutorHasArea(tutor, selectedArea)) {
      return false;
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

      if (filterSortOrder === "desc") {
        return bValue - aValue;
      } else {
        return aValue - bValue;
      }
    });
  }

  // Reset all filters
  const resetAllFilters = () => {
    setSearchQuery("");
    setFilterGender("any");
    setFilterRating(0);
    setFilterExperience("0");
    setFilterEducation("all");
    setFilterMaxPrice("");
    setFilterSortBy("all");
    setFilterSortOrder("desc");
    setViewMode("grid");
    
    // Reset area filter
    setSelectedArea("all");
    setAreaSearchQuery("");
    setIsAreaFilterExpanded(false);
  };

  // Clear area search
  const clearAreaSearch = () => {
    setAreaSearchQuery("");
  };

  // Handle area selection from search
  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    setAreaSearchQuery("");
  };

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
              <Label>Search Tutors</Label>
              <Input
                className="mt-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tutors by name, email, institute or subjects..."
              />
            </div>

            {/* Area Filter Section */}
            <div className="lg:col-span-2 xl:col-span-3 space-y-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsAreaFilterExpanded(!isAreaFilterExpanded)}
              >
                <Label className="text-sm font-bold text-green-600 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Search By Area
                </Label>
                {isAreaFilterExpanded ? (
                  <ChevronUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-green-600" />
                )}
              </div>

              {isAreaFilterExpanded && (
                <div className="space-y-3 bg-green-50 p-4 rounded-lg">
                  {/* Area Search Input */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-black">
                      Search Area
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        className="pl-10 pr-10"
                        value={areaSearchQuery}
                        onChange={(e) => setAreaSearchQuery(e.target.value)}
                        placeholder="Type to search areas..."
                      />
                      {areaSearchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                          onClick={clearAreaSearch}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Type area name to search (e.g., "Chattogram City", "Agrabad")
                    </p>
                  </div>

                  {/* Area Selection - Show filtered results or all */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-black">
                      Select Area
                    </Label>
                    <div className="max-h-60 overflow-y-auto border rounded-lg bg-white p-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                      {filteredAreas.length === 0 ? (
                        <div className="text-center py-4 text-sm text-gray-500">
                          No areas found matching "{areaSearchQuery}"
                        </div>
                      ) : (
                        <>
                          {/* All Areas option */}
                          <div
                            className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 ${
                              selectedArea === "all" ? "bg-green-50 border border-green-200" : ""
                            }`}
                            onClick={() => setSelectedArea("all")}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full border ${
                                selectedArea === "all" ? "bg-green-500 border-green-500" : "border-gray-300"
                              }`} />
                              <span className="text-sm font-medium">All Areas</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {allUniqueAreas.length} areas
                            </span>
                          </div>

                          {/* Area list */}
                          {filteredAreas.map((area: string) => (
                            <div
                              key={area}
                              className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-100 ${
                                selectedArea === area ? "bg-green-50 border border-green-200" : ""
                              }`}
                              onClick={() => handleAreaSelect(area)}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full border ${
                                  selectedArea === area ? "bg-green-500 border-green-500" : "border-gray-300"
                                }`} />
                                <span className="text-sm">{area}</span>
                              </div>
                              {selectedArea === area && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {selectedArea !== "all" && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600">
                          Selected: <span className="font-semibold text-green-700">{selectedArea}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

            {/* Reset Filters */}
            <div className="lg:col-span-2 xl:col-span-3 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
              >
                Reset All Filters
              </Button>
            </div>
          </div>

          {/* Filter Badges */}
          {selectedArea !== "all" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Area: {selectedArea}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedArea("all")}
                  className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                >
                  ×
                </Button>
              </Badge>
            </div>
          )}
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
              {selectedArea !== "all" && ` in ${selectedArea}`}
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

                      {/* Location with area info */}
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        {tutor.area && <span>{tutor.area}</span>}
                        {!tutor.area && <span>Location not specified</span>}
                      </div>

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
                {selectedArea !== "all" 
                  ? `No tutors found in "${selectedArea}"`
                  : "Try adjusting your search criteria or filters to find more tutors."}
              </p>
              <Button
                variant="outline"
                onClick={resetAllFilters}
              >
                Clear All Filters
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