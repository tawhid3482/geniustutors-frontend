'use client';

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Star, 
  MapPin, 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  ArrowRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import tutorService, { Tutor } from "@/services/tutorService";
import { Skeleton } from "@/components/ui/skeleton";

export const TutorShowcase = () => {
  const router = useRouter();
  const [featuredTutors, setFeaturedTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedTutors = async () => {
      try {
        setIsLoading(true);
        const response = await tutorService.getFeaturedTutors();
        
        if (response.success) {
          setFeaturedTutors(response.data);
        } else {
          setError('Failed to fetch featured tutors');
        }
      } catch (error) {
        console.error('Error fetching featured tutors:', error);
        setError('Failed to fetch featured tutors');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTutors();
  }, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-surface">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <Skeleton className="h-6 w-32 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-80 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-8 sm:mb-12 md:mb-16">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="card-modern">
                <CardContent className="p-0">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-surface">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 text-center">
          <p className="text-muted-foreground">Unable to load featured tutors. Please try again later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-surface">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16 fade-in-up">
          <Badge variant="outline" className="mb-3 sm:mb-4">
            <Award className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
            Featured Tutors
          </Badge>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            Meet Our
            <span className="text-gradient block">Top-Rated Tutors</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Hand-picked educators with proven track records of student success. 
            All verified and ready to help you achieve your academic goals.
          </p>
        </div>

        {/* Tutors Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8 mb-8 sm:mb-12 md:mb-16">
          {featuredTutors.map((tutor, index) => (
            <Card 
              key={tutor.id} 
              className="card-modern group hover:shadow-primary transition-all duration-500 overflow-hidden"
              style={{animationDelay: `${index * 200}ms`}}
            >
              <CardContent className="p-0">
                {/* Header with status */}
                <div className="relative p-4 sm:p-6 pb-3 sm:pb-4">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-12 w-12 sm:h-14 md:h-16 sm:w-14 md:w-16 ring-2 sm:ring-4 ring-primary/20">
                        <AvatarImage src={tutor.avatar_url || "/placeholder.svg"} alt={tutor.full_name} />
                        <AvatarFallback className="bg-gradient-primary text-white text-sm sm:text-base md:text-lg font-bold">
                          {tutor.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">
                          <strong>{tutor.full_name}</strong>
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <strong>{tutor.subjects || 'Multiple Subjects'}</strong>
                        </p>
                        <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
                          <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-yellow-500 fill-current" />
                          <span className="text-xs sm:text-sm font-medium">
                            <strong>{tutor.rating || 0}</strong>
                          </span>
                          <span className="text-xs text-muted-foreground">({tutor.total_reviews || 0})</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {tutor.premium === 'yes' && (
                      <Badge variant="outline" className="text-[10px] xs:text-xs px-1.5 py-0.5 xs:px-2 xs:py-0.5">
                        <strong>Genius</strong>
                      </Badge>
                    )}
                    {tutor.verified === 1 || tutor.verified === '1' ? (
                      <Badge variant="outline" className="text-[10px] xs:text-xs px-1.5 py-0.5 xs:px-2 xs:py-0.5 text-green-600 border-green-600">
                        <strong>Verified</strong>
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] xs:text-xs px-1.5 py-0.5 xs:px-2 xs:py-0.5 text-gray-500 border-gray-300">
                        <strong>Unverified</strong>
                      </Badge>
                    )}
                  </div>
                </div>

                

                {/* Details */}
                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-2 sm:space-y-3">
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <strong>{tutor.education || 'Education details not available'}</strong>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <strong>{tutor.location || 'Location not specified'}</strong>
                  </div>
                  <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    <strong>৳{tutor.hourly_rate || 0}/hr</strong>
                  </div>

                  {/* Bio */}
                  {tutor.bio && (
                    <div className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">
                      <strong>{tutor.bio}</strong>
                    </div>
                  )}

                  {/* Specialties - Parse subjects if available */}
                  {tutor.subjects && (
                    <div className="flex flex-wrap gap-1 mt-2 sm:mt-3">
                      {(Array.isArray(tutor.subjects) 
                        ? tutor.subjects 
                        : tutor.subjects.split(',')
                      ).slice(0, 3).map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-[10px] xs:text-xs px-1.5 py-0.5 xs:px-2 xs:py-0.5">
                          <strong>{subject.trim()}</strong>
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Price and Actions */}
                  <div className="flex items-center justify-center pt-3 sm:pt-4 border-t border-border">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 hover:scale-105"
                      onClick={() => router.push(`/tutor/${tutor.id}`)}
                    >
                      See Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
            onClick={() => router.push('/premium-tutors')}
          >
            View All Tutors
            <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>
    </section>
  );
};
