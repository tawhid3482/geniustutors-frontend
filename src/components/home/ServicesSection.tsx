'use client';

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export const ServicesSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
const [slidesPerView, setSlidesPerView] = useState(4); // Number of slides visible at once on desktop
  const totalSlides = 8; // Total number of services
  const maxSlideIndex = Math.max(0, totalSlides - slidesPerView);
  
  // Start the auto-sliding
  useEffect(() => {
    if (!isPaused) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => 
          prev >= maxSlideIndex ? 0 : prev + 1
        );
      }, 2000);
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, maxSlideIndex]);
  
  const handlePrev = () => {
    setCurrentSlide(prev => (prev <= 0 ? maxSlideIndex : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentSlide(prev => (prev >= maxSlideIndex ? 0 : prev + 1));
  };
  
  const handleMouseEnter = () => {
    setIsPaused(true);
  };
  
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const services = [
    {
      id: 1,
      title: "Play",
      image: "/play-group-1.svg",
      description: "Interactive play-based learning for early childhood development"
    },
    {
      id: 2,
      title: "Play",
      image: "/play-group-2.svg",
      description: "Educational games and activities for foundational skills"
    },
    {
      id: 3,
      title: "Nursery",
      image: "/nursery.svg",
      description: "Nurturing environment for preschool children with personalized care"
    },
    {
      id: 4,
      title: "KG",
      image: "/kg.svg",
      description: "Kindergarten programs focusing on holistic child development"
    },
    {
      id: 5,
      title: "Primary",
      image: "/primary.svg",
      description: "Comprehensive primary education with expert tutors"
    },
    {
      id: 6,
      title: "Secondary",
      image: "/secondary.svg",
      description: "Specialized secondary school tutoring across all subjects"
    },
    {
      id: 7,
      title: "Higher Secondary",
      image: "/higher-secondary.svg",
      description: "Advanced tutoring for HSC and A-Level students"
    },
    {
      id: 8,
      title: "University",
      image: "/university.svg",
      description: "Expert guidance for university courses and admission preparation"
    }
  ];

  // Update slidesPerView based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) { // xs
        setSlidesPerView(1);
      } else if (width < 768) { // sm
        setSlidesPerView(2);
      } else if (width < 1024) { // md
        setSlidesPerView(3);
      } else { // lg and above
        setSlidesPerView(4);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="py-6 xs:py-8 sm:py-10 md:py-12 bg-gradient-to-b from-background to-muted/10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 fade-in-up">
          <Badge variant="outline" className="mb-2 xs:mb-3 sm:mb-4">
            <Lightbulb className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-1 text-green-600" />
            <span className="text-xs xs:text-sm">Educational Services</span>
          </Badge>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 xs:mb-4 sm:mb-6">
            Our
            <span className="text-gradient block">Services</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Here are the comprehensive educational services we provide to support students at every stage of their learning journey.
          </p>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex justify-center items-center mb-4 xs:mb-6 sm:mb-8 gap-2 xs:gap-3 sm:gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-full bg-green-600/5 hover:bg-green-600/10 border-green-600/20"
            onClick={handlePrev}
          >
            <ChevronLeft className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-green-600" />
          </Button>
          
          <div className="hidden sm:flex gap-1 xs:gap-1.5 sm:gap-2">
            {[...Array(maxSlideIndex + 1)].map((_, idx) => (
              <button
                key={idx}
                className={`h-1.5 xs:h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-green-600 w-4 xs:w-5 sm:w-6' : 'bg-green-600/30 w-1.5 xs:w-2'}`}
                onClick={() => setCurrentSlide(idx)}
              />
            ))}
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-7 w-7 xs:h-8 xs:w-8 sm:h-9 sm:w-9 rounded-full bg-green-600/5 hover:bg-green-600/10 border-green-600/20"
            onClick={handleNext}
          >
            <ChevronRight className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 text-green-600" />
          </Button>
        </div>

        {/* Services Carousel */}
        <div className="relative mb-6 xs:mb-8 sm:mb-10 md:mb-12 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out px-2 xs:px-3 sm:px-4 gap-4 xs:gap-5 sm:gap-6"
            style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {services.map((service) => (
              <Card 
                key={service.id} 
                className="group hover:shadow-green-600/20 transition-all duration-500 relative overflow-hidden flex-shrink-0 w-full xs:w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
              >
                <CardContent className="p-3 xs:p-4 sm:p-5 md:p-6 flex flex-col items-center text-center">
                  <div className="w-full aspect-square mb-2 xs:mb-3 sm:mb-4 overflow-hidden rounded-lg xs:rounded-xl bg-green-50 flex items-center justify-center">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-foreground mb-1 xs:mb-1.5 sm:mb-2">{service.title}</h3>
                  
                  <p className="text-xs xs:text-sm text-muted-foreground">{service.description}</p>

                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
