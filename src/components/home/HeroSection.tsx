'use client';

// import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef, MouseEvent, TouchEvent } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeProvider";
import { heroDataService, Division, TutorDivision } from "@/services/heroDataService";
import { useGetAllAreaTutorsQuery } from "@/redux/features/area/areaApi";
import { useGetAllDistrictsJobsQuery } from "@/redux/features/district/districtApi";

// Custom hook for managing the animation sequence
const useAnimationSequence = () => {
  const [showFinal, setShowFinal] = useState(true);

  return { showFinal };
};

export const HeroSection = () => {
  const router = useRouter();
  const { showFinal } = useAnimationSequence();
  const { theme } = useTheme();
  const [currentDivision, setCurrentDivision] = useState(0);
  const [currentTutor, setCurrentTutor] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTutorPaused, setIsTutorPaused] = useState(false);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [tutorDivisions, setTutorDivisions] = useState<TutorDivision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const slidesPerView = { 
    mobile: 3, 
    tablet: 4,  
    laptop: 5,  
    desktop: 5
  };
  const sliderRef = useRef<HTMLDivElement>(null);

  const { 
    data: areaTutorsData, 
    isLoading: isLoadingArea, 
    error: areaError 
  } = useGetAllAreaTutorsQuery(undefined, { 
    refetchOnMountOrArgChange: true 
  });

  const { 
    data: districtJobsData, 
    isLoading: isLoadingDistricts, 
    error: districtError 
  } = useGetAllDistrictsJobsQuery(undefined, { 
    refetchOnMountOrArgChange: true 
  });
  
  // For drag functionality
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragThreshold, setDragThreshold] = useState(60);
  
  // For responsive design
  const [currentSlidesPerView, setCurrentSlidesPerView] = useState(slidesPerView.mobile);

  // Process area tutors data from API
  useEffect(() => {
    if (areaTutorsData?.data && Array.isArray(areaTutorsData?.data)) {
      console.log("Processing area tutors data:", areaTutorsData);
      
      const processedTutors: any[] = areaTutorsData?.data?.map((area: any) => ({
        id: area.name, // Use name as ID since no ID field
        name: area.name,
        count: area.count,
        color: "from-blue-100 to-blue-200", // Default color for tutors
        createdAt: new Date().toISOString()
      }));
      
      setTutorDivisions(processedTutors);
      console.log("Processed Tutors:", processedTutors);
    }
  }, [areaTutorsData]);

  // Process district jobs data from API
  useEffect(() => {
    if (districtJobsData?.data && Array.isArray(districtJobsData?.data)) {
      console.log("Processing district jobs data:", districtJobsData);
      
      const processedDivisions: Division[] = districtJobsData?.data?.map((district: any) => ({
        id: district.id,
        name: district.name,
        count: district.count,
        color: "from-green-100 to-green-200", // Default color for jobs
        createdAt: district.createdAt
      }));
      
      setDivisions(processedDivisions);
      console.log("Processed Divisions:", processedDivisions);
    }
  }, [districtJobsData]);

  // Update loading state based on both API calls
  useEffect(() => {
    if (!isLoadingArea && !isLoadingDistricts) {
      setIsLoading(false);
    }
  }, [isLoadingArea, isLoadingDistricts]);
  
  // Update slides per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCurrentSlidesPerView(slidesPerView.mobile);
      } else if (width < 768) {
        setCurrentSlidesPerView(slidesPerView.tablet);
      } else if (width < 1024) {
        setCurrentSlidesPerView(slidesPerView.laptop);
      } else {
        setCurrentSlidesPerView(slidesPerView.desktop);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const totalSlides = divisions?.length || 0;
  const maxSlideIndex = Math.max(0, totalSlides - currentSlidesPerView);

  const totalTutorSlides = tutorDivisions?.length || 0;
  const maxTutorSlideIndex = Math.max(0, totalTutorSlides - currentSlidesPerView);

  // Jobs slider effect
  useEffect(() => {
    if (!isPaused && !isDragging && divisions.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentDivision(prev => 
          prev >= maxSlideIndex ? 0 : prev + 1
        );
      }, 3000);
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, maxSlideIndex, isDragging, currentSlidesPerView, divisions.length]);

  // Tutor slider effect
  useEffect(() => {
    if (!isTutorPaused && tutorDivisions.length > 0) {
      const tutorSlideInterval = setInterval(() => {
        setCurrentTutor(prev => 
          prev >= maxTutorSlideIndex ? 0 : prev + 1
        );
      }, 4000);

      return () => clearInterval(tutorSlideInterval);
    }
  }, [isTutorPaused, maxTutorSlideIndex, currentSlidesPerView, tutorDivisions.length]);
  
  const nextSlide = () => {
    setCurrentDivision(prev => 
      prev >= maxSlideIndex ? 0 : prev + 1
    );
  };
  
  const prevSlide = () => {
    setCurrentDivision(prev => 
      prev <= 0 ? maxSlideIndex : prev - 1
    );
  };

  const nextTutorSlide = () => {
    setCurrentTutor(prev => 
      prev >= maxTutorSlideIndex ? 0 : prev + 1
    );
  };
  
  const prevTutorSlide = () => {
    setCurrentTutor(prev => 
      prev <= 0 ? maxTutorSlideIndex : prev - 1
    );
  };
  
  // Mouse drag handlers
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.pageX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(currentDivision);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (sliderRef.current?.offsetLeft || 0);
    const dragDistance = x - startX;
    
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        setCurrentDivision(prev => Math.max(0, prev - 1));
      } else {
        setCurrentDivision(prev => Math.min(maxSlideIndex, prev + 1));
      }
      setStartX(x);
      setScrollLeft(currentDivision);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setIsPaused(false);
    }
  };
  
  // Touch handlers for mobile
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setIsPaused(true);
    setIsDragging(true);
    setStartX(e.touches[0].clientX - (sliderRef.current?.offsetLeft || 0));
    setScrollLeft(currentDivision);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.touches[0].clientX - (sliderRef.current?.offsetLeft || 0);
    const dragDistance = x - startX;
    
    if (Math.abs(dragDistance) > dragThreshold) {
      if (dragDistance > 0) {
        setCurrentDivision(prev => Math.max(0, prev - 1));
      } else {
        setCurrentDivision(prev => Math.min(maxSlideIndex, prev + 1));
      }
      setStartX(x);
      setScrollLeft(currentDivision);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsPaused(false);
  };

  const handleFindTutors = () => {
    try {
      if (router && typeof router.push === 'function') {
        router.push('/premium-tutors');
      } else {
        window.location.href = '/premium-tutors';
      }
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/premium-tutors';
    }
  };

  const handleDivisionClick = (divisionName: string) => {
    router.push(`/tuition-jobs?district=${encodeURIComponent(divisionName)}`);
  };

  const handleTutorDivisionClick = (divisionName: string) => {
    router.push(`/premium-tutors?division=${encodeURIComponent(divisionName)}`);
  };

  // Calculate total counts
  const totalJobs = divisions?.reduce((acc, div) => acc + div.count, 0) || 0;
  const totalTutors = tutorDivisions?.reduce((acc, div) => acc + div.count, 0) || 0;

  return (
    <div className="overflow-x-hidden">
      {/* Main Hero Section */}
      <section className={cn(
        "py-8 xs:py-10 sm:py-16 md:py-20 px-3 xs:px-4 relative overflow-hidden",
        theme === "dark" 
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" 
          : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
      )}>
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className={cn(
            "absolute top-8 xs:top-10 sm:top-20 left-3 xs:left-5 sm:left-20 w-24 xs:w-32 sm:w-64 h-24 xs:h-32 sm:h-64 rounded-full blur-2xl xs:blur-3xl animate-pulse",
            theme === "dark" ? "bg-green-600" : "bg-green-300"
          )}></div>
          <div className={cn(
            "absolute bottom-8 xs:bottom-10 sm:bottom-20 right-3 xs:right-5 sm:right-20 w-36 xs:w-48 sm:w-96 h-36 xs:h-48 sm:h-96 rounded-full blur-2xl xs:blur-3xl animate-pulse delay-1000",
            theme === "dark" ? "bg-emerald-600" : "bg-emerald-300"
          )}></div>
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 xs:w-40 sm:w-80 h-32 xs:h-40 sm:h-80 rounded-full blur-2xl xs:blur-3xl animate-pulse delay-500",
            theme === "dark" ? "bg-teal-600" : "bg-teal-300"
          )}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className={theme === "dark" ? "text-emerald-400" : "text-emerald-600"}>
                    Hire your Genius Tutor Today
                  </span>
                </h1>
                
                <div className={cn("flex items-center gap-1 sm:gap-2", theme === "dark" ? "text-gray-300" : "text-gray-700")}>
                  <MapPin className={theme === "dark" ? "h-4 w-4 sm:h-5 sm:w-5 text-green-400 animate-bounce" : "h-4 w-4 sm:h-5 sm:w-5 text-green-500 animate-bounce"} />
                  <span className="text-base sm:text-lg">Book A <span className={theme === "dark" ? "text-green-400 font-semibold" : "text-green-600 font-semibold"}>Verified Tutor</span> in Your Area</span>
                </div>
              </div>

              {/* Enhanced CTA Button */}
              <div className="relative inline-block group/button">
                <button 
                  className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white px-8 py-4 rounded-full text-lg font-bold z-10 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 overflow-hidden group/button-inner"
                  onClick={handleFindTutors}
                >
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="absolute inset-0 border-2 border-green-400 rounded-full animate-pulse group-hover:border-emerald-300"></div>
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-0 group-hover/button-inner:opacity-30 transition-opacity duration-500 rounded-full blur-sm"></div>
                  
                  <div className="relative flex items-center gap-2 z-10">
                    <span className="tracking-wide group-hover/button-inner:tracking-wider transition-all duration-300">FIND A TUTOR (IT'S FREE!)
                    </span>
                    <ArrowRight className="h-5 w-5 group-hover/button-inner:translate-x-1 transition-transform duration-300" />
                  </div>
                  
                  <div className="absolute inset-0 -translate-x-full group-hover/button-inner:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"></div>
                  
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-300 rounded-tl-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-300 rounded-tr-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green-300 rounded-bl-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green-300 rounded-br-full group-hover/button-inner:border-emerald-200 transition-colors duration-300"></div>
                </button>
                
                <div className="absolute -top-2 -left-2 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75 delay-500"></div>
                <div className="absolute -top-1 -right-3 w-2 h-2 bg-teal-400 rounded-full animate-bounce opacity-60 delay-300"></div>
                <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-green-300 rounded-full animate-bounce opacity-60 delay-700"></div>
              </div>
              
              {/* Available Jobs Section */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 flex flex-col sm:flex-row sm:items-center">
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">Available Jobs</span>
                    <span className="sm:ml-2 text-xs sm:text-sm text-gray-500">
                      {isLoading ? 'Loading...' : `(${totalJobs.toLocaleString()} jobs)`}
                    </span>
                  </h3>
                  {divisions.length > 0 && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={prevSlide}
                        className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                        aria-label="Previous slide"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                      </button>
                      <button 
                        onClick={nextSlide}
                        className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                        aria-label="Next slide"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  {divisions.length === 0 && !isLoading ? (
                    <div className={cn(
                      "p-4 text-center rounded-lg",
                      theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}>
                      No jobs available at the moment
                    </div>
                  ) : (
                    <div 
                      ref={sliderRef}
                      className={cn(
                        "overflow-hidden rounded-lg sm:rounded-xl bg-transparent backdrop-blur-sm cursor-grab",
                        isDragging && "cursor-grabbing"
                      )}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => handleMouseLeave()}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div 
                        className="flex transition-transform duration-500 ease-in-out gap-1 xs:gap-1.5 sm:gap-2"
                        style={{ transform: `translateX(-${currentDivision * (100 / currentSlidesPerView)}%)` }}
                      >
                        {isLoading ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <div 
                              key={`loading-division-${index}`}
                              className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                                currentSlidesPerView === 1 ? 'w-full' : 
                                currentSlidesPerView === 2 ? 'w-1/3' : 
                                currentSlidesPerView === 3 ? 'w-1/4' : 
                                currentSlidesPerView === 4 ? 'w-1/5' :
                                currentSlidesPerView === 5 ? 'w-1/6' : 'w-1/6'
                              }`}
                            >
                              <div className="bg-gray-200 animate-pulse p-0.5 xs:p-1 sm:p-1.5 rounded-md sm:rounded-lg h-[28px] xs:h-[32px] sm:h-[38px]"></div>
                            </div>
                          ))
                        ) : (
                          divisions.map((division, index) => (
                            <div 
                              key={division.id} 
                              className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                                currentSlidesPerView === 1 ? 'w-full' : 
                                currentSlidesPerView === 2 ? 'w-1/3' : 
                                currentSlidesPerView === 3 ? 'w-1/4' : 
                                currentSlidesPerView === 4 ? 'w-1/5' :
                                currentSlidesPerView === 5 ? 'w-1/6' : 'w-1/6'
                              }`}
                            >
                              <div 
                                className={cn(
                                  "bg-gradient-to-br", 
                                  theme === "dark" ? "from-gray-700 to-gray-800" : division.color,
                                  "p-0.5 xs:p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                                  theme === "dark" 
                                    ? "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-gray-600 transform hover:scale-105 hover:border-green-600 group" 
                                    : "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-green-100 transform hover:scale-105 hover:border-green-300 group"
                                )}
                                onClick={() => handleDivisionClick(division.name)}
                              >
                                <div className="text-center group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center">
                                  <div className="flex items-center gap-0.5 sm:gap-1">
                                    <h4 className={theme === "dark" ? "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-green-400" : "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-black"}>
                                      {division.name} - {division.count.toLocaleString()}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Slide indicators */}
                {divisions.length > 0 && (
                  <div className="hidden sm:flex justify-center mt-3 space-x-1">
                    {Array.from({ length: Math.max(0, maxSlideIndex + 1) }).map((_, index) => (
                      <button
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${currentDivision === index 
                          ? theme === "dark" ? 'w-4 bg-green-400' : 'w-4 bg-green-500' 
                          : theme === "dark" ? 'w-1.5 bg-green-700' : 'w-1.5 bg-green-200'}`}
                        onClick={() => setCurrentDivision(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Available Tutors Section */}
              <div className="mt-6 sm:mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2 sm:gap-0">
                  <h3 className="text-base sm:text-lg font-medium text-gray-700 flex flex-col sm:flex-row sm:items-center">
                    <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">Available Tutors</span>
                    <span className="sm:ml-2 text-xs sm:text-sm text-gray-500">
                      {isLoading ? 'Loading...' : `(${totalTutors.toLocaleString()} tutors)`}
                    </span>
                  </h3>
                  {tutorDivisions.length > 0 && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={prevTutorSlide}
                        className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                        aria-label="Previous tutor division slide"
                      >
                        <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                      </button>
                      <button 
                        onClick={nextTutorSlide}
                        className="p-1 sm:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors shadow-sm"
                        aria-label="Next tutor division slide"
                      >
                        <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-700" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  {tutorDivisions.length === 0 && !isLoading ? (
                    <div className={cn(
                      "p-4 text-center rounded-lg",
                      theme === "dark" ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                    )}>
                      No tutors available at the moment
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        "overflow-hidden rounded-lg sm:rounded-xl bg-transparent backdrop-blur-sm cursor-grab"
                      )}
                      onMouseEnter={() => setIsTutorPaused(true)}
                      onMouseLeave={() => setIsTutorPaused(false)}
                    >
                      <div 
                        className="flex transition-transform duration-500 ease-in-out gap-1 xs:gap-1.5 sm:gap-2"
                        style={{ transform: `translateX(-${currentTutor * (100 / currentSlidesPerView)}%)` }}
                      >
                        {isLoading ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <div 
                              key={`loading-tutor-division-${index}`}
                              className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                                currentSlidesPerView === 1 ? 'w-full' : 
                                currentSlidesPerView === 2 ? 'w-1/3' : 
                                currentSlidesPerView === 3 ? 'w-1/4' : 
                                currentSlidesPerView === 4 ? 'w-1/5' :
                                currentSlidesPerView === 5 ? 'w-1/6' : 'w-1/6'
                              }`}
                            >
                              <div className="bg-gray-200 animate-pulse p-0.5 xs:p-1 sm:p-1.5 rounded-md sm:rounded-lg h-[28px] xs:h-[32px] sm:h-[38px]"></div>
                            </div>
                          ))
                        ) : (
                          tutorDivisions.map((division, index) => (
                            <div 
                              key={division.id} 
                              className={`flex-none px-0.5 xs:px-0.5 sm:px-1 ${
                                currentSlidesPerView === 1 ? 'w-full' : 
                                currentSlidesPerView === 2 ? 'w-1/3' : 
                                currentSlidesPerView === 3 ? 'w-1/4' : 
                                currentSlidesPerView === 4 ? 'w-1/5' :
                                currentSlidesPerView === 5 ? 'w-1/6' : 'w-1/6'
                              }`}
                            >
                              <div 
                                className={cn(
                                  "bg-gradient-to-br", 
                                  theme === "dark" ? "from-gray-700 to-gray-800" : "from-green-100 to-emerald-200" ,
                                  "p-0.5 xs:p-1 sm:p-1.5 rounded-md sm:rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer",
                                  theme === "dark" 
                                    ? "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-gray-600 transform hover:scale-105 hover:border-green-600 group" 
                                    : "h-[28px] xs:h-[32px] sm:h-[38px] flex items-center justify-center border border-green-100 transform hover:scale-105 hover:border-green-300 group"
                                )}
                                onClick={() => handleTutorDivisionClick(division.name)}
                              >
                                <div className="text-center group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1 transition-transform duration-300 flex items-center justify-center">
                                  <div className="flex items-center gap-0.5 sm:gap-1">
                                    <h4 className={theme === "dark" ? "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-green-400" : "text-[9px] xs:text-[10px] sm:text-xs font-semibold text-black"}>
                                      {division.name} - {division.count.toLocaleString()}
                                    </h4>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Tutor Slide indicators */}
                {tutorDivisions.length > 0 && (
                  <div className="hidden sm:flex justify-center mt-3 space-x-1">
                    {Array.from({ length: Math.max(0, maxTutorSlideIndex + 1) }).map((_, index) => (
                      <button
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${currentTutor === index 
                          ? theme === "dark" ? 'w-4 bg-green-400' : 'w-4 bg-green-500' 
                          : theme === "dark" ? 'w-1.5 bg-green-700' : 'w-1.5 bg-green-200'}`}
                        onClick={() => setCurrentTutor(index)}
                        aria-label={`Go to tutor division slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Illustration */}
            <div className="relative flex justify-center lg:justify-start mt-8 lg:mt-0">
              <div className="relative">
                <div className="relative z-10">
                  <div className="bg-transparent">
                    <div className="flex items-center justify-center h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96 relative">
                      <div className="relative w-[280px] h-[180px] sm:w-[320px] sm:h-[200px] md:w-[380px] md:h-[240px] lg:w-[500px] lg:h-[320px] xl:w-[580px] xl:h-[360px]">
                        {showFinal && (
                          <div 
                            className="absolute top-0 left-0 right-0 bottom-0 transition-all duration-1000 ease-out flex items-center justify-center"
                            style={{ 
                              animation: 'fadeInScale 1.2s ease-out forwards'
                            }}
                          >
                            <Image
                              src="/hero-section/All.png"
                              alt="Complete Classroom Scene"
                              width={280}
                              height={180}
                              className="opacity-0 object-contain sm:w-[320px] sm:h-[200px] md:w-[380px] md:h-[240px] lg:w-[500px] lg:h-[320px] xl:w-[580px] xl:h-[360px]"
                              style={{ 
                                animation: 'fadeInScale 1.2s ease-out forwards'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 md:-top-4 md:-right-4 lg:-top-6 lg:-right-6 xl:-top-8 xl:-right-8 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-60 animate-pulse shadow-lg"></div>
              <div className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:-left-4 md:-bottom-6 md:-left-6 lg:-bottom-8 lg:-left-8 xl:-bottom-10 xl:-left-10 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 bg-gradient-to-br from-teal-200 to-green-200 rounded-full opacity-40 animate-bounce shadow-lg"></div>
              <div className="absolute top-1/2 -right-4 sm:-right-5 md:-right-6 lg:-right-10 xl:-right-12 w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-br from-emerald-200 to-teal-200 rounded-full opacity-50 animate-ping"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};