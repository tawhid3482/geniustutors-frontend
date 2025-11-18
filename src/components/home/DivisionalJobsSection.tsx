'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, BookOpen, Clock, DollarSign, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const DivisionalJobsSection = () => {
  const router = useRouter();
  const [currentDivision, setCurrentDivision] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const slidesPerView = 2; // Number of slides visible at once
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Sample divisional jobs data
  const divisionalJobs = [
    {
      division: "Dhaka",
      jobs: [
        {
          id: 1,
          title: "Mathematics Tutor - Grade 10",
          location: "Dhanmondi, Dhaka",
          salary: "৳8,000-12,000/month",
          subject: "Mathematics",
          type: "Part-time"
        },
        {
          id: 2,
          title: "English Language Tutor - Primary",
          location: "Gulshan, Dhaka",
          salary: "৳6,000-10,000/month",
          subject: "English",
          type: "Part-time"
        }
      ]
    },
    {
      division: "Chattogram",
      jobs: [
        {
          id: 3,
          title: "Science Tutor - Secondary",
          location: "GEC, Chattogram",
          salary: "৳10,000-15,000/month",
          subject: "Science",
          type: "Full-time"
        },
        {
          id: 4,
          title: "Bangla Literature - HSC",
          location: "Agrabad, Chattogram",
          salary: "৳7,000-9,000/month",
          subject: "Bangla",
          type: "Part-time"
        }
      ]
    },
    {
      division: "Sylhet",
      jobs: [
        {
          id: 5,
          title: "Physics & Chemistry Tutor",
          location: "Zindabazar, Sylhet",
          salary: "৳12,000-18,000/month",
          subject: "Science",
          type: "Full-time"
        },
        {
          id: 6,
          title: "Computer Science Tutor",
          location: "Upashahar, Sylhet",
          salary: "৳15,000-20,000/month",
          subject: "Computer Science",
          type: "Part-time"
        }
      ]
    },
    {
      division: "Rajshahi",
      jobs: [
        {
          id: 7,
          title: "Mathematics & Physics Tutor",
          location: "New Market, Rajshahi",
          salary: "৳9,000-14,000/month",
          subject: "Mathematics, Physics",
          type: "Full-time"
        }
      ]
    },
    {
      division: "Khulna",
      jobs: [
        {
          id: 8,
          title: "English & Social Science Tutor",
          location: "Sonadanga, Khulna",
          salary: "৳8,000-12,000/month",
          subject: "English, Social Science",
          type: "Part-time"
        }
      ]
    },
    {
      division: "Barishal",
      jobs: [
        {
          id: 9,
          title: "Primary Level All Subjects",
          location: "Sadar Road, Barishal",
          salary: "৳7,000-10,000/month",
          subject: "All Subjects",
          type: "Part-time"
        }
      ]
    }
  ];
  
  const totalSlides = divisionalJobs.length;
  const maxSlideIndex = Math.max(0, totalSlides - slidesPerView);

  useEffect(() => {
    if (!isPaused) {
      slideInterval.current = setInterval(() => {
        setCurrentDivision(prev => 
          prev >= maxSlideIndex ? 0 : prev + 1
        );
      }, 4000); // Slide every 4 seconds
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, maxSlideIndex]);
  
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
  
  const handleViewAllJobs = () => {
    router.push('/tuition-jobs');
  };

  return (
    <section className="py-8 xs:py-10 sm:py-12 md:py-16 bg-gradient-to-b from-green-50/50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 xs:mb-8 sm:mb-10">
          <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">Divisional</span> Tutors
          </h2>
          <p className="text-xs xs:text-sm sm:text-base text-muted-foreground mt-1 xs:mt-1.5 sm:mt-2">Find qualified tutors in your division</p>
        </div>
        
        {/* Carousel container */}
        <div className="relative">
          <div className="flex justify-between items-center mb-4 xs:mb-5 sm:mb-6">
            <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-800">Available Tutors by Division</h3>
            <div className="flex space-x-1 xs:space-x-1.5 sm:space-x-2">
              <button 
                onClick={prevSlide}
                className="p-1 xs:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 text-green-700" />
              </button>
              <button 
                onClick={nextSlide}
                className="p-1 xs:p-1.5 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4 xs:h-4.5 xs:w-4.5 sm:h-5 sm:w-5 text-green-700" />
              </button>
            </div>
          </div>
          
          {/* Slides container */}
          <div 
            ref={sliderRef}
            className="overflow-hidden rounded-lg xs:rounded-xl"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-3 xs:gap-4 sm:gap-6"
              style={{ transform: `translateX(-${currentDivision * (100 / slidesPerView)}%)` }}
            >
              {divisionalJobs.map((divisionData, index) => (
                <div 
                  key={divisionData.division} 
                  className="flex-none w-1/2 px-1 xs:px-1.5 sm:px-2"
                >
                  <div className={cn(
                    "bg-white/90 backdrop-blur-sm p-3 xs:p-4 sm:p-6 rounded-lg xs:rounded-xl shadow-md border border-green-100",
                    "hover:shadow-lg transition-all duration-300 h-full",
                    index % 2 === 0 ? "bg-gradient-to-br from-green-50 to-emerald-50/50" : "bg-gradient-to-br from-emerald-50 to-teal-50/50"
                  )}>
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-green-700 mb-2 xs:mb-3 sm:mb-4 flex items-center">
                      <MapPin className="mr-1 xs:mr-1.5 sm:mr-2 h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                      {divisionData.division} Division
                    </h3>
                    
                    <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                      {divisionData.jobs.map((job) => (
                        <div 
                          key={job.id} 
                          className="bg-white p-2 xs:p-3 sm:p-4 rounded-md xs:rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-green-50 hover:border-green-200 transform hover:scale-[1.02] group"
                        >
                          <div className="flex justify-between items-start mb-1 xs:mb-1.5 sm:mb-2">
                            <h4 className="text-xs xs:text-sm sm:text-base font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{job.title}</h4>
                            <Badge variant="outline" className="text-[10px] xs:text-xs py-0.5 h-auto bg-green-50 text-green-700 border-green-200">
                              {job.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 xs:gap-1.5 sm:gap-2 text-[10px] xs:text-xs sm:text-sm mb-2 xs:mb-2.5 sm:mb-3">
                            <div className="flex items-center text-black dark:text-gray-300">
                              <MapPin className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-0.5 xs:mr-1 text-green-500" />
                              {job.location}
                            </div>
                            <div className="flex items-center text-black dark:text-gray-300">
                              <BookOpen className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-0.5 xs:mr-1 text-blue-500" />
                              {job.subject}
                            </div>
                            <div className="flex items-center font-medium text-green-600">
                              <DollarSign className="h-2.5 w-2.5 xs:h-3 xs:w-3 sm:h-3.5 sm:w-3.5 mr-0.5 xs:mr-1" />
                              {job.salary}
                            </div>
                          </div>
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full h-7 xs:h-8 sm:h-9 text-[10px] xs:text-xs sm:text-sm border-green-200 hover:bg-green-50 hover:text-green-700 text-green-600"
                            onClick={handleViewAllJobs}
                          >
                            View Details
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Slide indicators */}
        <div className="flex justify-center mt-4 xs:mt-6 sm:mt-8 space-x-1.5 xs:space-x-2">
          {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                currentDivision === index 
                  ? "bg-green-600 w-4 xs:w-5 sm:w-6" 
                  : "bg-green-200 hover:bg-green-300"
              )}
              onClick={() => setCurrentDivision(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        
        {/* View all jobs button */}
        <div className="text-center mt-6 xs:mt-8 sm:mt-10">
          <Button 
            onClick={handleViewAllJobs}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 xs:px-6 sm:px-8 py-2 xs:py-2.5 sm:py-3 rounded-full group shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <span className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 text-xs xs:text-sm sm:text-base">
              View All Tuition Jobs
              <ArrowRight className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </Button>
        </div>
      </div>
    </section>
  );
};