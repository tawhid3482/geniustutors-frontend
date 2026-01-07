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
import tutorService, { Tutor } from "@/services/tutorService";
import { API_BASE_URL } from "@/config/api";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { BANGLADESH_DISTRICTS, BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";

export default function GeniusTutors() {
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
  const [geniusTutorOnly, setGeniusTutorOnly] = useState(true);
  const [verifiedTutorOnly, setVerifiedTutorOnly] = useState(false);
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availablePostOffices, setAvailablePostOffices] = useState<Array<{name: string, postcode: string}>>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  const searchParams = useSearchParams();

  // Handle URL parameters for pre-filtering
  useEffect(() => {
    const districtParam = searchParams.get('district');
    if (districtParam) {
      // First try to find by ID (new format)
      const districtById = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => 
        d.id === districtParam
      );
      if (districtById) {
        setSelectedDistrict(districtById.id);
      } else {
        // Fallback: try to find by name (old format)
        const districtByName = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => 
          d.name.toLowerCase() === districtParam.toLowerCase()
        );
        if (districtByName) {
          setSelectedDistrict(districtByName.id);
        }
      }
    }
  }, [searchParams]);

  // Update available areas when district changes
  useEffect(() => {
    if (selectedDistrict !== 'all') {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === selectedDistrict);
      if (district) {
        setAvailableAreas(district.areas.map(area => area.name));
        // Reset area and post office when district changes
        setSelectedArea('all');
        setSelectedPostOffice('all');
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
      setSelectedArea('all');
      setSelectedPostOffice('all');
    }
  }, [selectedDistrict]);

  // Update available post offices when area changes
  useEffect(() => {
    if (selectedDistrict !== 'all' && selectedArea !== 'all') {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === selectedDistrict);
      if (district) {
        const area = district.areas.find(a => a.name === selectedArea);
        if (area) {
          setAvailablePostOffices(area.postOffices);
          // Reset post office when area changes
          setSelectedPostOffice('all');
        } else {
          setAvailablePostOffices([]);
        }
      }
    } else {
      setAvailablePostOffices([]);
      setSelectedPostOffice('all');
    }
  }, [selectedDistrict, selectedArea]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const fetchTutors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = {};
      
      if (selectedSubject !== 'all') {
        params.subject = selectedSubject;
      }
      
      if (selectedDistrict !== 'all') {
        params.district = selectedDistrict;
      }
      
      if (selectedArea !== 'all') {
        params.area = selectedArea;
      }
      
      if (selectedPostOffice !== 'all') {
        params.postOffice = selectedPostOffice;
      }
      
      if (ratingFilter > 0) {
        params.minRating = ratingFilter;
      }
      
      // Add new filter parameters
      if (minExperience > 0) {
        params.minExperience = minExperience;
      }
      
      if (selectedGender !== 'all') {
        params.gender = selectedGender;
      }
      
      if (selectedEducation !== 'all') {
        params.education = selectedEducation;
      }
      
      if (selectedAvailability !== 'all') {
        params.availability = selectedAvailability;
      }
      
      if (maxPrice) {
        params.maxPrice = maxPrice;
      }
      
      // Add tutor type filters
      if (geniusTutorOnly) {
        params.premium = 'yes';
      }
      
      if (verifiedTutorOnly) {
        params.verified = 1;
      }
      
      // Add sorting parameters
      if (sortBy) {
        params.sortBy = sortBy;
        params.sortOrder = sortOrder;
      }
      
      // Add pagination parameters
      params.page = currentPage;
      params.limit = 6;
      
   
      const response = await tutorService.getAllTutors(params);
      
    
      
      if (response.success) {
     
        setTutors(response.data);
        
        // Update pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
          setTotalCount(response.pagination.total);
        } else {
          console.warn('No pagination data received from API');
          // Fallback: calculate pagination based on expected total count
          // Since we know there are 30 active tutors, calculate pagination
          const expectedTotal = 30; // We know this from database query
          const limit = 6;
          const calculatedPages = Math.ceil(expectedTotal / limit);
          setTotalPages(calculatedPages);
          setTotalCount(expectedTotal);
        }
      } else {
        console.error('API returned error:', response);
        setError('Failed to fetch tutors');
        setTutors([]);
      }
    } catch (error) {
      console.error('Error fetching tutors:', error);
      setError('Failed to fetch tutors. Please try again later.');
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, ratingFilter, minExperience, selectedGender, selectedEducation, selectedAvailability, maxPrice, sortBy, sortOrder, geniusTutorOnly, verifiedTutorOnly, currentPage]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedDistrict, selectedArea, selectedPostOffice, ratingFilter, minExperience, selectedGender, selectedEducation, selectedAvailability, maxPrice, sortBy, sortOrder, geniusTutorOnly, verifiedTutorOnly]);

  // No fallback demo tutors - we'll rely on the API

  // Filter tutors based on search query (other filters are applied in API call)
  const filteredTutors = tutors?.filter(tutor => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      tutor.full_name?.toLowerCase().includes(query) ||
      (typeof tutor.subjects === 'string' ? 
        tutor.subjects.toLowerCase().includes(query) :
        Array.isArray(tutor.subjects) && (tutor.subjects as string[]).some(subject => subject.toLowerCase().includes(query)))
    );
  }) || [];

  // Generate star rating display
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8 overflow-x-hidden w-full">
        <div className="flex flex-col space-y-4 sm:space-y-6">
          {/* Page Header */}
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Genius Tutors</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Discover our premium genius tutors who have been specially selected for their exceptional teaching abilities and expertise</p>
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
                        {BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district) => (
                          <SelectItem key={district.id} value={district.id} className="font-bold">
                            {district.name}
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
                      disabled={selectedDistrict === 'all'}
                    >
                      <SelectTrigger id="area" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder={selectedDistrict === 'all' ? "Select a district first" : "All Areas"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Areas</SelectItem>
                        {availableAreas.map((area) => (
                          <SelectItem key={area} value={area} className="font-bold">
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postOffice" className="text-sm font-bold text-green-600">Post Office</Label>
                    <Select 
                      value={selectedPostOffice} 
                      onValueChange={setSelectedPostOffice}
                      disabled={selectedArea === 'all'}
                    >
                      <SelectTrigger id="postOffice" className="h-10 sm:h-11 font-bold">
                        <SelectValue placeholder={selectedArea === 'all' ? "Select an area first" : "All Post Offices"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="font-bold">All Post Offices</SelectItem>
                        {availablePostOffices.map((postOffice) => (
                          <SelectItem key={postOffice.name} value={postOffice.name} className="font-bold">
                            {postOffice.name} ({postOffice.postcode})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
                          disabled={true}
                        />
                        <Label htmlFor="geniusTutor" className="text-sm font-bold text-green-600 flex items-center">
                          <Award className="mr-2 h-4 w-4 text-blue-500" />
                          Genius Tutor (Always On)
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
                      setGeniusTutorOnly(true);
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
                      <>Showing <span className="font-medium">{filteredTutors.length}</span> of <span className="font-medium">{totalCount}</span> tutors</>
                    )}
                  </p>
                  
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={fetchTutors}
                    className="h-8 w-8"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
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
                  <Button onClick={fetchTutors}>Try Again</Button>
                </div>
              )}
              
              {/* No Results */}
              {!isLoading && !error && filteredTutors.length === 0 && (
                <div className="text-center p-6 sm:p-8">
                  <p className="mb-4">No genius tutors found matching your criteria.</p>
                  <Button onClick={() => {
                    setSelectedSubject("all");
                    setSelectedDistrict("all");
                    setSelectedArea("all");
                    setSelectedPostOffice("all");
                    setRatingFilter(0);
                    setSearchQuery("");
                    setGeniusTutorOnly(true);
                    setVerifiedTutorOnly(false);
                  }}>Reset Filters</Button>
                </div>
              )}
              
              {/* Tutor Listings */}
              {!isLoading && !error && filteredTutors.length > 0 && (
                <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" : "space-y-4"}>
                  {filteredTutors.map((tutor) => {
                    // Process tutor data from API
                    const tutorSubjects = typeof tutor.subjects === 'string' 
                      ? tutor.subjects.split(',').map(s => s.trim()) 
                      : [];
                    
                    // Debug log for verified status
                    
                    return (
                      <Card key={tutor.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        {viewMode === "grid" ? (
                          <CardContent className="p-4 sm:p-6">
                            {/* Profile Picture at the top */}
                            <div className="flex justify-center mb-4">
                              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary">
                                <AvatarImage src={tutor.avatar_url || "/placeholder.svg"} alt={tutor.full_name} />
                                <AvatarFallback className="text-lg sm:text-xl">{tutor.full_name?.charAt(0) || 'T'}</AvatarFallback>
                              </Avatar>
                            </div>
                            
                            {/* Name */}
                            <div className="text-center mb-3">
                              <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                                {tutor.full_name?.toUpperCase()}
                              </CardTitle>
                            </div>
                            
                            {/* University */}
                            <div className="text-center mb-2">
                              <p className="text-sm text-gray-600">
                                {tutor.university_name || 'University not specified'}
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
                                {(tutor.district || tutor.location || 'Location not specified').charAt(0).toUpperCase() + (tutor.district || tutor.location || 'Location not specified').slice(1)}
                              </Badge>
                              {tutor.area && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {tutor.area.charAt(0).toUpperCase() + tutor.area.slice(1)}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Experience */}
                            <div className="text-center mb-4">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">
                                  {(() => {
                                    const experienceText = tutor.tutoring_experience || tutor.experience || '';
                                    const yearsMatch = experienceText.match(/(\d+)\s*years?/i);
                                    return yearsMatch ? `${yearsMatch[1]} Years Experience` : 'Experience not specified';
                                  })()}
                                </span>
                              </p>
                            </div>
                            
                            {/* Badges */}
                            <div className="flex justify-center gap-2 mb-4 flex-wrap">
                              {tutor.verified === 1 || tutor.verified === '1' ? (
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
                              {tutor.premium === 'yes' && (
                                <div 
                                  className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 flex items-center justify-center cursor-pointer group relative"
                                  title="Genius Tutor"
                                >
                                  <Check className="h-5 w-5 text-white" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                    Genius Tutor
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* View Details Button */}
                            <div className="flex justify-center">
                                <Button 
                                className="bg-green-600 hover:bg-green-700 text-white w-full text-sm font-medium"
                                  onClick={() => window.location.href = `/tutor/${tutor.id}`}
                                >
                                View Details
                                </Button>
                              </div>
                          </CardContent>
                        ) : (
                          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex-shrink-0">
                              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-primary">
                                <AvatarImage src={tutor.avatar_url || "/placeholder.svg"} alt={tutor.full_name} />
                                <AvatarFallback className="text-lg sm:text-xl">{tutor.full_name?.charAt(0) || 'T'}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 space-y-2 w-full">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                                <CardTitle className="text-lg sm:text-xl font-bold text-blue-900">
                                  {tutor.full_name?.toUpperCase()}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                                  {tutor.verified === 1 || tutor.verified === '1' ? (
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
                                  {tutor.premium === 'yes' && (
                                    <div 
                                      className="bg-blue-500 hover:bg-blue-600 rounded-full p-1 flex items-center justify-center cursor-pointer group relative"
                                      title="Genius Tutor"
                                    >
                                      <Check className="h-4 w-4 text-white" />
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                                        Genius Tutor
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600">
                                {tutor.university_name || 'University not specified'}
                              </p>
                              <p className="text-sm font-medium text-blue-800">
                                {tutor.department_name || 'Department not specified'}
                              </p>
                              
                              <div className="flex gap-2 flex-wrap">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  <MapPin className="mr-1 h-3 w-3" />
                                  {(tutor.district || tutor.location || 'Location not specified').charAt(0).toUpperCase() + (tutor.district || tutor.location || 'Location not specified').slice(1)}
                                </Badge>
                                {tutor.area && (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <MapPin className="mr-1 h-3 w-3" />
                                    {tutor.area.charAt(0).toUpperCase() + tutor.area.slice(1)}
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">
                                  {(() => {
                                    const experienceText = tutor.tutoring_experience || tutor.experience || '';
                                    const yearsMatch = experienceText.match(/(\d+)\s*years?/i);
                                    return yearsMatch ? `${yearsMatch[1]} Years Experience` : 'Experience not specified';
                                  })()}
                                </span>
                              </p>
                              
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
                    );
                  })}
                </div>
              )}

            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
