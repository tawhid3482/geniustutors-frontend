'use client';

import { MapPin, CheckCircle, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TutorCardProps {
  tutor: {
    id: string;
    full_name: string;
    university_name?: string;
    location?: string;
    avatar_url?: string;
    gender?: string;
    verified?: number | string | boolean;
    premium?: string;
    created_at?: string;
  };
}

export const TutorCard = ({ tutor }: TutorCardProps) => {
  const router = useRouter();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatName = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 2) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return name;
  };

  const formatUniversity = (university?: string) => {
    if (!university) return 'University';
    if (university.length > 20) {
      return university.substring(0, 20) + '...';
    }
    return university;
  };

  const handleViewProfile = () => {
    router.push(`/tutor/${tutor.id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-64 sm:w-72 h-100 sm:h-90 flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition-shadow">
      {/* Profile Picture with Green Background */}
      <div className="relative mb-3 sm:mb-4">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
            <AvatarImage src={tutor.avatar_url} alt={tutor.full_name} />
            <AvatarFallback className="bg-green-200 text-green-800 font-semibold text-sm sm:text-lg">
              {getInitials(tutor.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Badges */}
      <div className="flex justify-center gap-1 sm:gap-2 mb-3 sm:mb-4 flex-wrap">
        {tutor.verified === 1 || tutor.verified === '1' || tutor.verified === true ? (
          <div 
            className="bg-green-500 hover:bg-green-600 rounded-full p-1.5 sm:p-2 flex items-center justify-center cursor-pointer group relative"
            title="Verified Tutor"
          >
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Verified Tutor
            </div>
          </div>
        ) : (
          <Badge variant="outline" className="text-gray-500 border-gray-300 text-xs">Unverified</Badge>
        )}
        {tutor.premium === 'yes' && (
          <div 
            className="bg-blue-500 hover:bg-blue-600 rounded-full p-1.5 sm:p-2 flex items-center justify-center cursor-pointer group relative"
            title="Genius Tutor"
          >
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
              Genius Tutor
            </div>
          </div>
        )}
      </div>

      {/* Tutor Name */}
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
        {formatName(tutor.full_name)}
      </h3>

      {/* University */}
      <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
        {formatUniversity(tutor.university_name)}
      </p>

      {/* Location */}
      <div className="flex items-center gap-1 mb-3 sm:mb-4">
        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
        <span className="text-xs sm:text-sm text-gray-600">
          {tutor.location || 'Dhaka'}
        </span>
      </div>

      {/* View Button */}
      <Button 
        className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors mt-0 text-xs sm:text-sm"
        onClick={handleViewProfile}
      >
        View
      </Button>
    </div>
  );
};
