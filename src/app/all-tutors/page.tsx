'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, GraduationCap, Clock, Search, LayoutGrid, List, Filter, RefreshCw, User, Users, Calendar, Sun, Moon, Award, Shield, Check, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext.next";
import { API_BASE_URL } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { useGetAllTutorsQuery } from "@/redux/features/tutorHub/tutorHubApi";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";
import { useGetAllAreaQuery } from "@/redux/features/area/areaApi";

// API response এর সাথে match করতে Tutor type
interface ApiTutor {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  alternative_number: string;
  Institute_name: string;
  department_name: string;
  year: string;
  preferred_areas: string[];
  religion: string;
  nationality: string;
  background: string[];
  avatar: string | null;
  qualification: string | null;
  district: string | null;
  premium: boolean;
  gender: string;
  role: string;
  tutor_id: number;
  rating: number | null;
  postOffice: string | null;
  hourly_rate: number | null;
  subjects: string[];
  availability: string | null;
  education: string | null;
  total_reviews: number | null;
  experience: number | null;
  location: string | null;
  createdAt: string;
  verified: boolean;
  genius: boolean;
}

export default function AllTutors() {
  const { user, profile } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedPostOffice, setSelectedPostOffice] = useState<string>("all");
  const [minExperience, setMinExperience] = useState<number>(0);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedEducation, setSelectedEducation] = useState<string>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [sortOrder, setSortOrder] = useState<string>("desc");
  const [geniusTutorOnly, setGeniusTutorOnly] = useState(false);
  const [verifiedTutorOnly, setVerifiedTutorOnly] = useState(false);
  const [tutors, setTutors] = useState<ApiTutor[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [areas, setAreas] = useState<string[]>([]);
  const [postOffices, setPostOffices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const searchParams = useSearchParams();

  // RTK Query ব্যবহার করে data fetch করা
  const { data: tutorsData, isLoading: rtkLoading, error: rtkError } = useGetAllTutorsQuery(undefined);
  const { data: districtData } = useGetAllDistrictsQuery(undefined);
  const { data: areaData } = useGetAllAreaQuery(undefined);

  // Handle URL parameters for pre-filtering
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      setSelectedDistrict(districtParam);
    }
  }, [searchParams]);

  // Process district data from RTK Query
  useEffect(() => {
    if (districtData && districtData.success) {
      console.log('District Data:', districtData);
      if (districtData.data && districtData.data.length > 0) {
        // District names array থেকে সব names নেওয়া
        const allDistrictNames = districtData.data[0].name || [];
        setDistricts(allDistrictNames);
      }
    }
  }, [districtData]);

  // Process area data from RTK Query
  useEffect(() => {
    if (areaData && areaData.success) {
      console.log('Area Data:', areaData);
      if (areaData.data && areaData.data.length > 0) {
        // Area names array থেকে সব names নেওয়া
        const allAreaNames = areaData.data[0].name || [];
        setAreas(allAreaNames);
      }
    }
  }, [areaData]);

  // Post offices - manually set করা হয়েছে
  // useEffect(() => {
  //   const manualPostOffices = [
  //     "Mirpur Post Office",
  //     "Gulshan Post Office", 
  //     "Dhanmondi Post Office",
  //     "Uttara Post Office",
  //     "Banani Post Office"
  //   ];
  //   setPostOffices(manualPostOffices);
  // }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  // RTK Query data process করা
  useEffect(() => {
    if (tutorsData) {
      console.log('RTK Query Tutors Data:', tutorsData);
      if (tutorsData.success) {
        setTutors(tutorsData.data || []);
        setTotalCount(tutorsData.data?.length || 0);
        setTotalPages(Math.ceil((tutorsData.data?.length || 0) / 6));
      } else {
        setError('Failed to fetch tutors from API');
      }
    }
  }, [tutorsData]);

  // Loading state set করা
  useEffect(() => {
    setIsLoading(rtkLoading);
  }, [rtkLoading]);

  // Error state set করা
  useEffect(() => {
    if (rtkError) {
      setError('Failed to fetch tutors. Please try again later.');
      console.error('RTK Error:', rtkError);
    }
  }, [rtkError]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, ratingFilter, minExperience, selectedGender, selectedEducation, selectedAvailability, maxPrice, sortBy, sortOrder, geniusTutorOnly, verifiedTutorOnly]);

  // Filter tutors based on search query and other filters
  const filteredTutors = tutors.filter(tutor => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        tutor.fullName?.toLowerCase().includes(query) ||
        tutor.subjects?.some(subject => subject.toLowerCase().includes(query)) ||
        tutor.department_name?.toLowerCase().includes(query) ||
        tutor.Institute_name?.toLowerCase().includes(query) ||
        tutor.background?.some(bg => bg.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;
    }

    // Subject filter
    if (selectedSubject !== 'all' && !tutor.subjects?.includes(selectedSubject)) {
      return false;
    }

    // District filter - আলাদা filter, related না
    if (selectedDistrict !== 'all' && tutor.district !== selectedDistrict) {
      return false;
    }

    // Area filter - আলাদা filter, related না (preferred_areas check)
    if (selectedArea !== 'all' && !tutor.preferred_areas?.some(area => 
      area.toLowerCase().includes(selectedArea.toLowerCase()))) {
      return false;
    }

    // Post Office filter - আলাদা filter, related না
    // if (selectedPostOffice !== 'all' && tutor.postOffice !== selectedPostOffice) {
    //   return false;
    // }

    // Rating filter
    if (ratingFilter > 0 && (!tutor.rating || tutor.rating < ratingFilter)) {
      return false;
    }

    // Experience filter
    if (minExperience > 0 && (!tutor.experience || tutor.experience < minExperience)) {
      return false;
    }

    // Gender filter
    if (selectedGender !== 'all' && tutor.gender.toLowerCase() !== selectedGender.toLowerCase()) {
      return false;
    }

    // Education filter
    if (selectedEducation !== 'all' && tutor.education !== selectedEducation) {
      return false;
    }

    // Availability filter
    if (selectedAvailability !== 'all' && tutor.availability !== selectedAvailability) {
      return false;
    }

    // Price filter
    if (maxPrice && (!tutor.hourly_rate || tutor.hourly_rate > maxPrice)) {
      return false;
    }

    // Genius tutor filter - premium field check করা
    if (geniusTutorOnly && !tutor.premium) {
      return false;
    }

    // Verified tutor filter
    if (verifiedTutorOnly && !tutor.verified) {
      return false;
    }

    return true;
  });

  // Sort filtered tutors
  const sortedTutors = [...filteredTutors].sort((a, b) => {
    let aValue: any = 0;
    let bValue: any = 0;

    switch (sortBy) {
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
        aValue = a.rating || 0;
        bValue = b.rating || 0;
    }

    if (sortOrder === "asc") {
      return aValue - bValue;
    } else {
      return bValue - aValue;
    }
  });

  // Pagination apply করা
  const paginatedTutors = sortedTutors.slice((currentPage - 1) * 6, currentPage * 6);

  // Generate star rating display
  const renderStars = (rating: number | null) => {
    if (!rating) {
      return (
        <div className="flex items-center">
          <span className="text-sm text-gray-500">No ratings</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden w-full">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">All Tutors</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Browse through our complete collection of qualified and experienced tutors</p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Filters Section - Top on Mobile, Left Sidebar on Desktop */}
            <div className="order-1 lg:w-80 lg:order-1">
              <Card className="h-fit lg:sticky lg:top-20">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-bold text-green-600">Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger id="subject" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="All Subjects" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="all" className="font-bold">All Subjects</SelectItem>
                          <SelectItem value="Mathematics" className="font-bold">Mathematics</SelectItem>
                          <SelectItem value="Physics" className="font-bold">Physics</SelectItem>
                          <SelectItem value="Chemistry" className="font-bold">Chemistry</SelectItem>
                          <SelectItem value="Biology" className="font-bold">Biology</SelectItem>
                          <SelectItem value="English" className="font-bold">English</SelectItem>
                          <SelectItem value="Computer Science" className="font-bold">Computer Science</SelectItem>
                          <SelectItem value="Programming" className="font-bold">Programming</SelectItem>
                          <SelectItem value="Bangla" className="font-bold">Bangla</SelectItem>
                          <SelectItem value="Economics" className="font-bold">Economics</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-sm font-bold text-green-600">District</Label>
                    <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                      <SelectTrigger id="district" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="All Districts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Districts</SelectItem>
                        {districts.map((district, index) => (
                          <SelectItem key={index} value={district} className="font-bold">
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area" className="text-sm font-bold text-green-600">Area</Label>
                    <Select 
                      value={selectedArea} 
                      onValueChange={setSelectedArea}
                    >
                      <SelectTrigger id="area" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="All Areas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Areas</SelectItem>
                        {areas.map((area, index) => (
                          <SelectItem key={index} value={area} className="font-bold">
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="postOffice" className="text-sm font-bold text-green-600">Post Office</Label>
                    <Select 
                      value={selectedPostOffice} 
                      onValueChange={setSelectedPostOffice}
                    >
                      <SelectTrigger id="postOffice" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="All Post Offices" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Post Offices</SelectItem>
                        {postOffices.map((postOffice, index) => (
                          <SelectItem key={index} value={postOffice} className="font-bold">
                            {postOffice}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div> */}

                  <div className="space-y-2">
                    <Label htmlFor="rating" className="text-sm font-bold text-green-600">Minimum Rating</Label>
                    <Select value={ratingFilter.toString()} onValueChange={(value) => setRatingFilter(Number(value))}>
                      <SelectTrigger id="rating" className="h-10 sm:h-11 font-bold">
                        <div className="flex items-center">
                          <SelectValue placeholder="Any Rating" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" className="font-bold">
                          <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                            Any Rating
                          </div>
                        </SelectItem>
                        <SelectItem value="3" className="font-bold">
                          <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" />
                            3+ Stars
                          </div>
                        </SelectItem>
                        <SelectItem value="4" className="font-bold">
                          <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" />
                            4+ Stars
                          </div>
                        </SelectItem>
                        <SelectItem value="4.5" className="font-bold">
                          <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" />
                            4.5+ Stars
                          </div>
                        </SelectItem>
                        <SelectItem value="5" className="font-bold">
                          <div className="flex items-center">
                            <Star className="mr-2 h-4 w-4 text-yellow-400 fill-yellow-400" />
                            5 Stars
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minExperience" className="text-sm font-bold text-green-600">Minimum Experience (Years)</Label>
                    <Select value={minExperience.toString()} onValueChange={(value) => setMinExperience(Number(value))}>
                      <SelectTrigger id="minExperience" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="Any Experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0" className="font-bold">Any Experience</SelectItem>
                        <SelectItem value="1" className="font-bold">1+ Years</SelectItem>
                        <SelectItem value="2" className="font-bold">2+ Years</SelectItem>
                        <SelectItem value="3" className="font-bold">3+ Years</SelectItem>
                        <SelectItem value="5" className="font-bold">5+ Years</SelectItem>
                        <SelectItem value="10" className="font-bold">10+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-sm font-bold text-green-600">Gender</Label>
                    <Select value={selectedGender} onValueChange={setSelectedGender}>
                      <SelectTrigger id="gender" className="h-10 sm:h-11 font-bold">
                        <div className="flex items-center">
                          <SelectValue placeholder="Any Gender" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">
                          <div className="flex items-center">
                            <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                            Any Gender
                          </div>
                        </SelectItem>
                        <SelectItem value="male" className="font-bold">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-blue-500" />
                            Male
                          </div>
                        </SelectItem>
                        <SelectItem value="female" className="font-bold">
                          <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-pink-500" />
                            Female
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="education" className="text-sm font-bold text-green-600">Education</Label>
                    <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                      <SelectTrigger id="education" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="Any Education" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">Any Education</SelectItem>
                        <SelectItem value="HSC" className="font-bold">HSC</SelectItem>
                        <SelectItem value="Diploma" className="font-bold">Diploma</SelectItem>
                        <SelectItem value="Bachelor" className="font-bold">Bachelor's Degree</SelectItem>
                        <SelectItem value="Master" className="font-bold">Master's Degree</SelectItem>
                        <SelectItem value="PhD" className="font-bold">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability" className="text-sm font-bold text-green-600">Availability</Label>
                    <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                      <SelectTrigger id="availability" className="h-10 sm:h-11 font-bold">
                        <div className="flex items-center">
                          <SelectValue placeholder="Any Availability" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            Any Availability
                          </div>
                        </SelectItem>
                        <SelectItem value="Weekdays" className="font-bold">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-blue-500" />
                            Weekdays
                          </div>
                        </SelectItem>
                        <SelectItem value="Weekends" className="font-bold">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-green-500" />
                            Weekends
                          </div>
                        </SelectItem>
                        <SelectItem value="Evenings" className="font-bold">
                          <div className="flex items-center">
                            <Moon className="mr-2 h-4 w-4 text-purple-500" />
                            Evenings
                          </div>
                        </SelectItem>
                        <SelectItem value="Mornings" className="font-bold">
                          <div className="flex items-center">
                            <Sun className="mr-2 h-4 w-4 text-orange-500" />
                            Mornings
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice" className="text-sm font-bold text-green-600">Maximum Price (৳/hour)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Any Price"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                      min="0"
                      className="h-10 sm:h-11 font-bold"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-green-600 flex items-center">
                      <Award className="mr-2 h-4 w-4 text-muted-foreground" />
                      Tutor Type
                    </Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="geniusTutor" 
                          checked={geniusTutorOnly}
                          onCheckedChange={(checked) => setGeniusTutorOnly(checked === true)}
                        />
                        <Label htmlFor="geniusTutor" className="text-sm font-bold text-green-600 flex items-center">
                          <Award className="mr-2 h-4 w-4 text-blue-500" />
                          Genius Tutor
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="verifiedTutor" 
                          checked={verifiedTutorOnly}
                          onCheckedChange={(checked) => setVerifiedTutorOnly(checked === true)}
                        />
                        <Label htmlFor="verifiedTutor" className="text-sm font-bold text-green-600 flex items-center">
                          <Shield className="mr-2 h-4 w-4 text-green-500" />
                          Verified Tutor
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortBy" className="text-sm font-bold text-green-600">Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sortBy" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rating" className="font-bold">Rating</SelectItem>
                        <SelectItem value="hourly_rate" className="font-bold">Price</SelectItem>
                        <SelectItem value="experience" className="font-bold">Experience</SelectItem>
                        <SelectItem value="total_reviews" className="font-bold">Number of Reviews</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sortOrder" className="text-sm font-bold text-green-600">Sort Order</Label>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger id="sortOrder" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder="Sort Order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc" className="font-bold">Ascending</SelectItem>
                        <SelectItem value="desc" className="font-bold">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full h-10 sm:h-11 font-bold" 
                    variant="outline"
                    onClick={() => {
                      setSelectedSubject("all");
                      setSelectedDistrict("all");
                      setSelectedArea("all");
                      setSelectedPostOffice("all");
                      setRatingFilter(0);
                      setMinExperience(0);
                      setSelectedGender("all");
                      setSelectedEducation("all");
                      setSelectedAvailability("all");
                      setMaxPrice(null);
                      setSortBy("rating");
                      setSortOrder("desc");
                      setSearchQuery("");
                      setGeniusTutorOnly(false);
                      setVerifiedTutorOnly(false);
                    }}
                  >
                    Reset Filters
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content - Right Side */}
            <div className="flex-1 space-y-4 sm:space-y-6 order-2 lg:order-2">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tutors by name or subject..."
                  className="pl-10 h-11 font-bold"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {/* View Toggle and Results Count */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? (
                      <span className="flex items-center"><RefreshCw className="h-3 w-3 mr-2 animate-spin" /> Loading tutors...</span>
                    ) : (
                      <>Showing <span className="font-medium">{paginatedTutors.length}</span> of <span className="font-medium">{filteredTutors.length}</span> tutors</>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="h-8 w-8"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="h-8 w-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader className="pb-2 p-4 sm:p-6">
                        <div className="flex items-start gap-4">
                          <Skeleton className="h-12 w-12 sm:h-16 sm:w-16 rounded-full" />
                          <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-32 sm:w-40" />
                            <div className="flex flex-wrap gap-1">
                              <Skeleton className="h-3 w-12 sm:w-16" />
                              <Skeleton className="h-3 w-16 sm:w-20" />
                            </div>
                            <Skeleton className="h-3 w-24 sm:w-32" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                        <div className="space-y-2">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                        <Skeleton className="h-16 w-full" />
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-5 w-20 sm:w-24" />
                          <Skeleton className="h-8 w-24 sm:w-32" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Error State */}
              {!isLoading && error && (
                <div className="text-center p-6 sm:p-8">
                  <p className="text-red-500 mb-4">{error}</p>
                </div>
              )}
              
              {/* No Results */}
              {!isLoading && !error && paginatedTutors.length === 0 && (
                <div className="text-center p-6 sm:p-8">
                  <p className="mb-4">No tutors found matching your criteria.</p>
                  <Button onClick={() => {
                    setSelectedSubject("all");
                    setSelectedDistrict("all");
                    setSelectedArea("all");
                    setSelectedPostOffice("all");
                    setRatingFilter(0);
                    setSearchQuery("");
                    setGeniusTutorOnly(false);
                    setVerifiedTutorOnly(false);
                  }}>Reset Filters</Button>
                </div>
              )}
              
              {/* Tutor Listings */}
              {!isLoading && !error && paginatedTutors.length > 0 && (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" : "space-y-4"}>
                  {paginatedTutors.map((tutor) => (
                    <Card key={tutor.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      {viewMode === "grid" ? (
                        <CardContent className="p-4 sm:p-6">
                          {/* Profile Picture at the top */}
                          <div className="flex justify-center mb-4">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary">
                              <AvatarImage src={tutor.avatar || "/placeholder.svg"} alt={tutor.fullName} />
                              <AvatarFallback className="text-lg sm:text-xl">{tutor.fullName?.charAt(0) || 'T'}</AvatarFallback>
                            </Avatar>
                          </div>
                          
                          {/* Name */}
                          <div className="text-center mb-3">
                            <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                              {tutor.fullName?.toUpperCase()}
                            </CardTitle>
                          </div>
                          
                          {/* University */}
                          <div className="text-center mb-2">
                            <p className="text-sm text-gray-600">
                              {tutor.Institute_name || 'University not specified'}
                            </p>
                          </div>
                          
                          {/* Department */}
                          <div className="text-center mb-3">
                            <p className="text-sm font-medium text-blue-800">
                              {tutor.department_name || 'Department not specified'}
                            </p>
                          </div>
                          
                          {/* Location */}
                          <div className="flex justify-center mb-3 gap-2 flex-wrap">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <MapPin className="mr-1 h-3 w-3" />
                              {tutor.district || tutor.location || 'Location not specified'}
                            </Badge>
                            {tutor.preferred_areas && tutor.preferred_areas.length > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <MapPin className="mr-1 h-3 w-3" />
                                {tutor.preferred_areas[0]}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Experience */}
                          <div className="text-center mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">
                                {tutor.experience ? `${tutor.experience} Years Experience` : 'Experience not specified'}
                              </span>
                            </p>
                          </div>

                          {/* Rating */}
                          <div className="text-center mb-3">
                            {renderStars(tutor.rating)}
                          </div>
                          
                          {/* Badges */}
                          <div className="flex justify-center gap-2 mb-4 flex-wrap">
                            {tutor.verified ? (
                              <div 
                                className="bg-green-500 hover:bg-green-600 rounded-full p-2 flex items-center justify-center cursor-pointer group relative"
                                title="Verified Tutor"
                              >
                                <CheckCircle className="h-5 w-5 text-white" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  Verified Tutor
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Unverified</Badge>
                            )}
                            {tutor.premium && (
                              <div 
                                className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 flex items-center justify-center cursor-pointer group relative"
                                title="Premium Tutor"
                              >
                                <Award className="h-5 w-5 text-white" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                  Premium Tutor
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* View Details Button */}
                          <div className="flex justify-center">
                            <Button 
                              className="bg-green-600 hover:bg-green-700 text-white w-full text-sm font-medium"
                              onClick={() => window.location.href = `/tutor/${tutor.tutor_id}`}
                            >
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      ) : (
                        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="flex-shrink-0">
                            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary">
                              <AvatarImage src={tutor.avatar || "/placeholder.svg"} alt={tutor.fullName} />
                              <AvatarFallback className="text-lg sm:text-xl">{tutor.fullName?.charAt(0) || 'T'}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex-1 space-y-2 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                              <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                                {tutor.fullName?.toUpperCase()}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                {tutor.verified ? (
                                  <div 
                                    className="bg-green-500 hover:bg-green-600 rounded-full p-1 flex items-center justify-center cursor-pointer group relative"
                                    title="Verified Tutor"
                                  >
                                    <CheckCircle className="h-4 w-4 text-white" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                      Verified Tutor
                                    </div>
                                  </div>
                                ) : (
                                  <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Unverified</Badge>
                                )}
                                {tutor.premium && (
                                  <div 
                                    className="bg-blue-500 hover:bg-blue-600 rounded-full p-1 flex items-center justify-center cursor-pointer group relative"
                                    title="Premium Tutor"
                                  >
                                    <Award className="h-4 w-4 text-white" />
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                      Premium Tutor
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                              {tutor.Institute_name || 'University not specified'}
                            </p>
                            <p className="text-sm font-medium text-blue-800">
                              {tutor.department_name || 'Department not specified'}
                            </p>
                            
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                <MapPin className="mr-1 h-3 w-3" />
                                {tutor.district || tutor.location || 'Location not specified'}
                              </Badge>
                              {tutor.preferred_areas && tutor.preferred_areas.length > 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {tutor.preferred_areas[0]}
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">
                                {tutor.experience ? `${tutor.experience} Years Experience` : 'Experience not specified'}
                              </span>
                            </p>

                            <div className="flex items-center gap-4">
                              {renderStars(tutor.rating)}
                              {tutor.hourly_rate && (
                                <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                                  ৳{tutor.hourly_rate}/hour
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex justify-end mt-4">
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                                onClick={() => window.location.href = `/tutor/${tutor.id}`}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && filteredTutors.length > 0 && totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}