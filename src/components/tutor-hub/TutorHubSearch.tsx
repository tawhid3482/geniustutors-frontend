'use client';

import { useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetAllTutorHubSearchQuery } from "@/redux/features/tutorHub/tutorHubApi";
import { TutorCard } from '@/components/tutor-hub/TutorCard';

interface Tutor {
  id: string;
  tutor_id: string;
  full_name: string;
  avatar_url?: string;
  gender?: string;
  verified?: number | string | boolean;
  premium?: string;
  location?: string;
  created_at?: string;
  university_name?: string;
  district?: string;
}

export const TutorHubSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Use the query only when we have a search query and user has clicked search
  const { 
    data: searchData, 
    isLoading: isSearching, 
    error: searchError,
    refetch 
  } = useGetAllTutorHubSearchQuery(searchQuery, {
    skip: !hasSearched || !searchQuery.trim(),
  });

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    refetch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHasSearched(false);
  };

  // Transform backend data to frontend format
  const searchResults = searchData?.data?.tutors?.map((tutor:any) => ({
    id: tutor.id,
    tutor_id: tutor.tutor_id?.toString(),
    full_name: tutor.fullName, // Map fullName to full_name
    avatar_url: tutor.avatar,
    gender: tutor.gender,
    verified: tutor.verified,
    premium: tutor.premium ? "premium" : "standard",
    location: tutor.district,
    created_at: tutor.createdAt,
    university_name: tutor.Institute_name,
    district: tutor.district
  })) || [];

  const error = searchError ? 'Failed to search tutors. Please try again.' : null;

  return (
    <div className="mb-6 sm:mb-8">
      {/* Search Input */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="flex w-full max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by tutor ID or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-l-3xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 sm:px-8 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-r-3xl rounded-l-none transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            {isSearching ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
            ) : (
              <span className="hidden sm:inline">Search</span>
            )}
          </Button>
        </div>
      </div>

      {/* Search Results */}
      {hasSearched && (
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={handleSearch} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!error && searchResults.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tutors found matching "{searchQuery}"</p>
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
            </div>
          )}

          {!error && searchResults.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Search Results ({searchResults.length})
                </h3>
                <Button onClick={clearSearch} variant="outline" size="sm" className="text-xs sm:text-sm">
                  Clear Search
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {searchResults.map((tutor:any) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};