'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

export const SearchJobsSection = () => {
  const allSubjects = [
    { id: 1, name: "Bangla" },
    { id: 2, name: "Math" },
    { id: 3, name: "Physics" },
    { id: 4, name: "Chemistry" },
    { id: 5, name: "Biology" },
    { id: 6, name: "English" },
    { id: 7, name: "History" },
    { id: 8, name: "Geography" },
    { id: 9, name: "Economics" },
    { id: 10, name: "Computer Science" },
    { id: 11, name: "Statistics" },
    { id: 12, name: "Accounting" },
    { id: 13, name: "Business Studies" },
    { id: 14, name: "Psychology" },
    { id: 15, name: "Sociology" },
    { id: 16, name: "Political Science" },
  ];

  const jobs = [
    {
      id: 1,
      title: "Mathematics Tutor Needed",
      class: "Class 10",
      subject: "Mathematics",
      location: "Dhanmondi, Dhaka",
      salary: "8,000 - 12,000 BDT",
      type: "Home Tuition",
      time: "3 days/week",
      posted: "2 hours ago",
      applicants: 12
    },
    {
      id: 2,
      title: "English Literature Teacher",
      class: "HSC",
      subject: "English",
      location: "Gulshan, Dhaka",
      salary: "15,000 - 20,000 BDT",
      type: "Online",
      time: "5 days/week",
      posted: "4 hours ago",
      applicants: 8
    },
    {
      id: 3,
      title: "Physics & Chemistry Tutor",
      class: "Class 11-12",
      subject: "Physics, Chemistry",
      location: "Chittagong",
      salary: "10,000 - 15,000 BDT",
      type: "Home Tuition",
      time: "4 days/week",
      posted: "6 hours ago",
      applicants: 15
    }
  ];
  
  const [currentPage, setCurrentPage] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subjectsPerPage = 4;
  const totalPages = Math.ceil(allSubjects.length / subjectsPerPage);
  
  // Get current subjects to display
  const getCurrentSubjects = () => {
    const startIndex = currentPage * subjectsPerPage;
    return allSubjects.slice(startIndex, startIndex + subjectsPerPage);
  };
  
  // Handle navigation
  const goToNextPage = () => {
    setSlideDirection('right');
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const goToPrevPage = () => {
    setSlideDirection('left');
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  const goToPage = (pageIndex: number) => {
    setSlideDirection(pageIndex > currentPage ? 'right' : 'left');
    setCurrentPage(pageIndex);
  };
  
  // Auto slide functionality
  useEffect(() => {
    if (isAutoSliding) {
      autoSlideTimerRef.current = setInterval(() => {
        goToNextPage();
      }, 2000);
    }
    
    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [isAutoSliding, currentPage]);
  
  // Pause auto-sliding on hover
  const handleMouseEnter = () => setIsAutoSliding(false);
  const handleMouseLeave = () => setIsAutoSliding(true);

  const stats = [
    { id: 1, value: "2120+", label: "Live Tuition Jobs" },
    { id: 2, value: "1280 +", label: "Total Tutors" },
    { id: 3, value: "1000 +", label: "Tutors Applied" },
    { id: 4, value: "4.7", label: "Average Tutor Rating" },
  ];

  return (
    <section className="py-8 xs:py-10 sm:py-14 md:py-16 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
        

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 xs:py-8 sm:py-10 px-3 xs:px-4 rounded-lg shadow-card">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 xs:gap-6 sm:gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={stat.id} className="space-y-0.5 xs:space-y-1 scale-in" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-xs xs:text-sm text-white/90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export const SearchJobsSectionContent = () => {
  return (
    <section className="py-12 xs:py-16 sm:py-20 bg-gradient-surface relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <div className="relative w-full h-full">
          <Image 
            src="/assets/online-learning.jpg" 
            alt="Online Learning Platform" 
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-3 xs:mb-4 sm:mb-6">
            <span className="text-gradient">SEARCH TUTORING JOBS</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Find Your Tuition Jobs, in your area. Looking for interesting tuition jobs to excel your teaching experience?
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 xs:gap-8 sm:gap-10 md:gap-12 items-center">
          {/* Left Side - Illustration */}
          <div className="relative">
            <div className="bg-gradient-card rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 shadow-card">
              <div className="grid grid-cols-2 gap-3 xs:gap-4">
                <div className="bg-primary/10 rounded-lg xs:rounded-xl p-3 xs:p-4 text-center">
                  <div className="w-8 h-8 xs:w-10 sm:w-12 xs:h-10 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-1.5 xs:mb-2">
                    <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                  </div>
                  <div className="text-xs xs:text-sm font-medium">500+</div>
                  <div className="text-[10px] xs:text-xs text-muted-foreground">Open Jobs</div>
                </div>
                
                <div className="bg-accent/10 rounded-lg xs:rounded-xl p-3 xs:p-4 text-center">
                  <div className="w-8 h-8 xs:w-10 sm:w-12 xs:h-10 sm:h-12 bg-accent rounded-full flex items-center justify-center mx-auto mb-1.5 xs:mb-2">
                    <Users className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-xs xs:text-sm font-medium">100%</div>
                  <div className="text-[10px] xs:text-xs text-muted-foreground">Verified</div>
                </div>
              </div>
              
              <div className="mt-3 xs:mt-4 sm:mt-6 p-3 xs:p-4 bg-white rounded-lg xs:rounded-xl shadow-sm">
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className="w-8 h-8 xs:w-10 xs:h-10 bg-gradient-primary rounded-full"></div>
                  <div className="flex-1">
                    <div className="font-medium text-xs xs:text-sm">Teaching Position Available</div>
                    <div className="text-[10px] xs:text-xs text-muted-foreground">Mathematics • Class 10</div>
                  </div>
                  <div className="text-[10px] xs:text-xs text-primary font-medium">Apply Now</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-4 xs:space-y-5 sm:space-y-6">
            <div className="space-y-2 xs:space-y-3 sm:space-y-4">
              <h3 className="text-xl xs:text-2xl font-bold text-black dark:text-white">
                Looking for interesting tuition jobs to excel your teaching experience?
              </h3>
              <p className="text-xs xs:text-sm sm:text-base text-black dark:text-gray-300 leading-relaxed">
                If teaching jobs interests you, then you are on the right place. tutortoday.com, we often 
                have <span className="font-semibold text-primary">500+</span> open home tuition jobs that are genuine and{" "}
                <span className="font-semibold text-primary">100% verified</span>. Whether you are 
                starting your career as a tuition teacher or an expert in your field, we can help you find your 
                next big tuition job. You can search and apply to the tuition jobs that best fit your skills, 
                favorable location, class and subjects.
              </p>
            </div>

            <Button className="bg-gradient-primary hover:opacity-90 text-white h-9 xs:h-10 sm:h-11 text-xs xs:text-sm sm:text-base px-3 xs:px-4 sm:px-6">
              SEARCH TUITION JOBS
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
