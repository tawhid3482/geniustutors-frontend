


'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { TutorCard } from './TutorCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useGetAllTutorHubByCategoryQuery } from '@/redux/features/tutorHub/tutorHubApi';

interface Tutor {
  id: string;
  tutor_id?: string;
  full_name: string;
  university_name?: string;
  location?: string;
  avatar_url?: string;
  gender?: string;
  verified?: number | string | boolean;
  premium?: string;
  created_at?: string;
  district?: string;
}

interface TutorCategorySectionProps {
  title: string;
  category: 'all' | 'verified' | 'genius' | 'new';
  limit: number;
}

export const TutorCategorySection = ({ title, category, limit }: TutorCategorySectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoSliding, setIsAutoSliding] = useState(true);

  const { data: categoryTutorData, isLoading: loading, error } = useGetAllTutorHubByCategoryQuery(category);

  // Extract tutors from API response
  const tutors = categoryTutorData?.data?.tutors || [];


  const nextSlide = () => {
    if (tutors.length <= 4) return;
    const maxIndex = tutors.length - 4;
    setCurrentIndex(prev => {
      if (prev >= maxIndex) {
        return 0; // Loop back to start
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    if (tutors.length <= 4) return;
    const maxIndex = tutors.length - 4;
    setCurrentIndex(prev => {
      if (prev <= 0) {
        return maxIndex; // Loop to end
      }
      return prev - 1;
    });
  };

  // Auto-sliding effect
  useEffect(() => {
    if (!isAutoSliding || tutors.length <= 4) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoSliding, tutors.length]);

  // Pause auto-sliding on hover
  const handleMouseEnter = () => {
    setIsAutoSliding(false);
  };

  const handleMouseLeave = () => {
    setIsAutoSliding(true);
  };

  const visibleTutors = tutors.slice(currentIndex, currentIndex + 4);

  if (loading) {
    return (
      <div className="mb-8 sm:mb-12">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
          <div className="w-16 sm:w-24 h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3 sm:gap-6 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-64 sm:w-72 h-72 sm:h-80 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8 sm:mb-12">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load tutors. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 transition-all duration-300 hover:text-green-600">
          {title}
        </h2>
        <Link href={
          category === 'all' ? '/all-tutors' :
          category === 'verified' ? '/verified-tutors' :
          category === 'genius' ? '/genius-tutors' :
          category === 'new' ? '/new-tutors' :
          '/all-tutors'
        }>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white border-green-600 transition-all duration-300 hover:scale-105 hover:shadow-lg text-sm sm:text-base"
          >
            See All
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {tutors.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No tutors found in this category.</p>
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-lg">
              <div 
                className="flex gap-3 sm:gap-6 transition-all duration-700 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (256 + 12)}px)`,
                  width: `${tutors.length * (256 + 12)}px`
                }}
              >
                {tutors.map((tutor:any, index:any) => {
                  const isVisible = index >= currentIndex && index < currentIndex + 4;
                  return (
                    <div 
                      key={tutor.id} 
                      className={`flex-shrink-0 transition-all duration-500 ${
                        isVisible 
                          ? 'opacity-100 scale-100' 
                          : 'opacity-60 scale-95'
                      }`}
                    >
                      <TutorCard tutor={tutor} />
                    </div>
                  );
                })}
              </div>
              
              {/* Gradient overlays for smooth edges */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
            </div>

            {/* Navigation Arrows - Only show if there are more than 4 tutors */}
            {tutors.length > 4 && (
              <div className="flex justify-between mt-4 sm:mt-6">
                <button
                  onClick={prevSlide}
                  className="p-2 sm:p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-2 sm:p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
                >
                  <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};