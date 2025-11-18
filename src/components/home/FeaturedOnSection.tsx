'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getFeaturedMediaOutlets, FeaturedMediaOutlet } from "@/services/featuredMediaService";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const FeaturedOnSection = () => {
  // State for media outlets
  const [mediaOutlets, setMediaOutlets] = useState<FeaturedMediaOutlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // For auto-sliding functionality
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slidesPerView, setSlidesPerView] = useState(4); // Default number of slides visible
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const totalSlides = mediaOutlets.length;
  const maxSlideIndex = Math.max(0, totalSlides - slidesPerView);

  // Fetch media outlets data
  useEffect(() => {
    const fetchMediaOutlets = async () => {
      try {
        const outlets = await getFeaturedMediaOutlets();
        setMediaOutlets(outlets);
      } catch (error) {
        console.error('Error fetching media outlets:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaOutlets();
  }, []);
  
  // Update slidesPerView based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) { // xs
        setSlidesPerView(2);
      } else if (width < 768) { // sm
        setSlidesPerView(3);
      } else if (width < 1024) { // md
        setSlidesPerView(4);
      } else { // lg and above
        setSlidesPerView(5);
      }
    };

    // Set initial value
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Start the auto-sliding
  useEffect(() => {
    if (!isPaused) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => 
          prev >= maxSlideIndex ? 0 : prev + 1
        );
      }, 3000); // Slide every 3 seconds
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, maxSlideIndex]);
  
  const handleMouseEnter = () => {
    setIsPaused(true);
  };
  
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev <= 0 ? maxSlideIndex : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentSlide(prev => (prev >= maxSlideIndex ? 0 : prev + 1));
  };

  // Don't render if no media outlets or still loading
  if (isLoading) {
    return (
      <section className="py-8 xs:py-10 sm:py-12 md:py-16 bg-gradient-to-b from-background to-muted/10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6 xs:mb-8 sm:mb-10">
            <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold inline-flex items-center flex-wrap justify-center">
              We were <span className="text-gradient ml-1 xs:ml-2 mr-1 xs:mr-2 font-semibold">featured on</span>:
            </h2>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no media outlets
  if (mediaOutlets.length === 0) {
    return null;
  }

  return (
    <section className="py-8 xs:py-10 sm:py-12 md:py-16 bg-gradient-to-b from-background to-muted/10 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 xs:mb-8 sm:mb-10">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold inline-flex items-center flex-wrap justify-center">
            We were <span className="text-gradient ml-1 xs:ml-2 mr-1 xs:mr-2 font-semibold">featured on</span>:
          </h2>
        </div>
        
        {/* Sliding images container */}
        <div className="relative px-2 xs:px-3 sm:px-4">
          {/* Mobile Navigation Arrows */}
          <div className="sm:hidden flex justify-between items-center absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 px-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white/80 hover:bg-white border-gray-200 shadow-md"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-white/80 hover:bg-white border-gray-200 shadow-md"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
          
          {/* Slides container */}
          <div 
            className="overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-4 xs:gap-6 sm:gap-8"
              style={{ transform: `translateX(-${currentSlide * (100 / slidesPerView)}%)` }}
            >
              {mediaOutlets.map((outlet) => (
                <div 
                  key={outlet.id} 
                  className="flex-none w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5 px-2 xs:px-3 sm:px-4"
                >
                  <div className="flex items-center justify-center p-2 xs:p-3 sm:p-4">
                    <img 
                      src={outlet.logo_url} 
                      alt={outlet.alt_text || outlet.name} 
                      className="max-h-12 xs:max-h-16 sm:max-h-20 w-full object-contain" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Slide indicators - hidden on mobile */}
        <div className="hidden sm:flex justify-center mt-4 xs:mt-5 sm:mt-6 space-x-1.5 xs:space-x-2">
          {Array.from({ length: maxSlideIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`h-1.5 xs:h-2 rounded-full transition-all ${currentSlide === index ? 'w-4 xs:w-5 sm:w-6 bg-green-500' : 'w-1.5 xs:w-2 bg-green-200'}`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
