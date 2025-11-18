"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toggle } from "@/components/ui/toggle";
import { Search, Star, Award, CheckCircle } from "lucide-react";
import { FilterGender } from "@/types/student";
import { ALL_DISTRICTS } from "@/data/bangladeshDistricts";

interface StudentSearchProps {
  searchQuery: string;
  filterSubject: string;
  filterArea: string;
  filterGender: FilterGender;
  filterRating: number;
  viewMode: string;
  setSearchQuery: (query: string) => void;
  setFilterSubject: (subject: string) => void;
  setFilterArea: (area: string) => void;
  setFilterGender: (gender: FilterGender) => void;
  setFilterRating: (rating: number) => void;
  setViewMode: (mode: string) => void;
  filteredTutors: any[];
  inviteDemo: (tutor: any) => void;
}

export function StudentSearch({
  searchQuery,
  filterSubject,
  filterArea,
  filterGender,
  filterRating,
  viewMode,
  setSearchQuery,
  setFilterSubject,
  setFilterArea,
  setFilterGender,
  setFilterRating,
  setViewMode,
  filteredTutors,
  inviteDemo
}: StudentSearchProps) {
  
  // Helper function to check if tutor is verified
  const isVerified = (verified: any) => {
    if (!verified) return false;
    if (verified === '0' || verified === 0) return false;
    if (verified === 'false' || verified === false) return false;
    if (verified === 'no' || verified === 'No') return false;
    return true;
  };
  return (
    <div className="space-y-6 w-full">
      <Card className="border-green-100/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-green-600" /> Find Tutors</CardTitle>
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
                placeholder="Search tutors by name or subject..." 
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
                  <SelectItem value="Computer Science">Computer Science</SelectItem>
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
              <Select value={filterGender} onValueChange={(v) => setFilterGender(v as FilterGender)}>
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
              <Select value={String(filterRating)} onValueChange={(v) => setFilterRating(Number(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="3">3+ Stars</SelectItem>
                  <SelectItem value="4">4+ Stars</SelectItem>
                  <SelectItem value="4.5">4.5+ Stars</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Experience Filter */}
            <div>
              <Label>Minimum Experience (Years)</Label>
              <Select value="0" onValueChange={() => {}}>
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
              <Select value="all" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Any Education" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Education</SelectItem>
                  <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="Master">Master's Degree</SelectItem>
                  <SelectItem value="PhD">PhD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Availability Filter */}
            <div>
              <Label>Availability</Label>
              <Select value="all" onValueChange={() => {}}>
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
              />
            </div>

            {/* Sort By */}
            <div>
              <Label>Sort By</Label>
              <Select value="rating" onValueChange={() => {}}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="hourly_rate">Price</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="total_reviews">Number of Reviews</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Order */}
            <div>
              <Label>Sort Order</Label>
              <Select value="desc" onValueChange={() => {}}>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Available Tutors</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">View:</span>
          <Toggle pressed={viewMode === "grid"} onPressedChange={(v) => setViewMode(v ? "grid" : "list")}>
            Grid
          </Toggle>
          <Toggle pressed={viewMode === "list"} onPressedChange={(v) => setViewMode(v ? "list" : "grid")}>
            List
          </Toggle>
        </div>
      </div>

      {/* Tutors Display */}
      {filteredTutors.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {filteredTutors.map((tutor) => (
            <Card key={tutor.id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-green-100 flex flex-col h-full">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Tutor Header */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Tutor Image */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-green-100 flex items-center justify-center flex-shrink-0">
                    {tutor.avatar_url ? (
                      <img 
                        src={tutor.avatar_url} 
                        alt={tutor.full_name || tutor.name || 'Tutor'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-green-600 font-semibold text-xl">
                        {tutor.full_name ? tutor.full_name.charAt(0).toUpperCase() : tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {tutor.full_name || tutor.name || 'Tutor Name'}
                      </h3>
                      {/* Badges - Only show if tutor has badges */}
                      {(tutor.premium === 'yes' || isVerified(tutor.verified)) && (
                        <div className="flex items-center gap-1">
                          {tutor.premium === 'yes' && (
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
                    </div>
                    
                    {/* University */}
                    {tutor.university_name && (
                      <p className="text-sm text-gray-600 mb-1">
                        {tutor.university_name}
                      </p>
                    )}
                    
                    {/* Location */}
                    <p className="text-sm text-gray-500">
                      {tutor.district || tutor.area || tutor.location || 'Location not specified'}
                    </p>
                  </div>
                </div>

                {/* Tutor Details */}
                <div className="space-y-3 flex-1">
                  {/* Experience */}
                  {tutor.experience && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Experience</span>
                      <p className="text-sm text-gray-700 mt-1">{tutor.experience} years</p>
                    </div>
                  )}

                  {/* Education */}
                  {tutor.education && (
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Education</span>
                      <p className="text-sm text-gray-700 mt-1">{tutor.education}</p>
                    </div>
                  )}


                </div>

                {/* Action Button - Positioned at bottom */}
                <div className="mt-4">
                  <Button 
                    className="bg-green-600 hover:bg-green-700 w-full" 
                    onClick={() => window.open(`/tutor/${tutor.id}`, '_blank')}
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
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
                setViewMode("grid");
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
