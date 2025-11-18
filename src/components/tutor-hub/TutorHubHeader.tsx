'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import tutorService, { DistrictStats } from '@/services/tutorService';

export const TutorHubHeader = () => {
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0);
  const [locations, setLocations] = useState<DistrictStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const nextLocation = () => {
    setCurrentLocationIndex((prev) => Math.min(prev + 1, locations.length - 3));
  };

  const prevLocation = () => {
    setCurrentLocationIndex((prev) => Math.max(0, prev - 1));
  };

  const handleDivisionClick = (district: string) => {
    // Navigate to premium tutors page with district filter
    router.push(`/premium-tutors?district=${district.toLowerCase()}`);
  };

  // Fetch district stats from database
  useEffect(() => {
    const fetchDistrictStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await tutorService.getDistrictStats();
        
        if (response.success) {
          // Transform district names to uppercase for display
          const transformedData = response.data.map(item => ({
            ...item,
            district: item.district.toUpperCase()
          }));
          setLocations(transformedData);
        } else {
          setError('Failed to fetch district data');
        }
      } catch (err) {
        console.error('Error fetching district stats:', err);
        setError('Failed to load tutor data');
        // Fallback to default data
        setLocations([
          { district: 'DHAKA', count: 0 },
          { district: 'CHITTAGONG', count: 0 },
          { district: 'RAJSHAHI', count: 0 },
          { district: 'KHULNA', count: 0 },
          { district: 'BARISAL', count: 0 },
          { district: 'SYLHET', count: 0 },
          { district: 'RANGPUR', count: 0 },
          { district: 'MYMENSINGH', count: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDistrictStats();
  }, []);

  // Auto-slide every 3 seconds
  useEffect(() => {
    if (locations.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentLocationIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex > locations.length - 3) {
          return 0; // Reset to beginning
        }
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [locations.length]);

  if (loading) {
    return (
      <div className="text-left mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Hire the best qualified tutors with few clicks!
        </h1>
        
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="flex gap-1 sm:gap-2 bg-white rounded-lg p-1 sm:p-2 justify-center overflow-hidden w-full max-w-4xl">
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className="px-2 sm:px-4 md:px-8 py-2 sm:py-4 rounded-lg bg-gray-200 animate-pulse flex-1 h-12 sm:h-16"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-left mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
          Hire the best qualified tutors with few clicks!
        </h1>
        
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
          <div className="text-red-500 text-xs sm:text-sm">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-left mb-6 sm:mb-8">
      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
        Hire the best qualified tutors with few clicks!
      </h1>
      
      <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4 mb-6 sm:mb-8">
        <button
          onClick={prevLocation}
          disabled={currentLocationIndex === 0}
          className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
        </button>
        
        <div className="flex gap-1 sm:gap-2 bg-white rounded-lg p-1 sm:p-2 justify-center overflow-hidden w-full max-w-4xl">
          {locations.slice(currentLocationIndex, currentLocationIndex + 3).map((location, index) => (
            <button
              key={currentLocationIndex + index}
              onClick={() => handleDivisionClick(location.district)}
              className={`px-2 sm:px-4 md:px-8 py-2 sm:py-4 rounded-lg text-gray-700 font-medium transition-all duration-300 whitespace-nowrap flex-1 transform hover:scale-105 active:scale-95 text-xs sm:text-sm ${
                index === 0 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200 shadow-md hover:shadow-lg' 
                  : 'bg-gray-100 hover:bg-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span className="truncate">{location.district}</span>
                <span className="bg-white bg-opacity-50 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold flex-shrink-0">
                  {location.count}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <button
          onClick={nextLocation}
          disabled={currentLocationIndex >= locations.length - 3}
          className="p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
        </button>
      </div>
    </div>
  );
};
