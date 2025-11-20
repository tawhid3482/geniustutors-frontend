'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGetAllVideoTestimonialQuery } from "@/redux/features/videoTestimonail/videoTestimonailApi";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  testimonial: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const VideoTestimonialsSection = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Use RTK Query to fetch video testimonials
  const { data: videoData, isLoading, error } = useGetAllVideoTestimonialQuery(undefined);
  
  // Extract video testimonials from API response
  const videoTestimonials = videoData?.data || [];
  const totalSlides = videoTestimonials.length;

  
  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && videoTestimonials.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 5000); // Slightly longer interval for video testimonials
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, totalSlides, videoTestimonials.length]);
  
  const handlePrev = () => {
    setCurrentSlide(prev => (prev <= 0 ? totalSlides - 1 : prev - 1));
  };
  
  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % totalSlides);
  };
  
  const handleMouseEnter = () => {
    setIsPaused(true);
  };
  
  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleHireTutor = () => {
    router.push('/premium-tutors');
  };

  const handlePlayVideo = (testimonial: VideoTestimonial) => {
    setSelectedVideo(testimonial);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string => {
    if (!url) return '';
    
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  // Helper function to ensure proper YouTube embed URL
  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url; // Return original URL if it's already an embed URL
  };

  // Show loading state
  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-6 bg-gray-200 rounded mb-8"></div>
            <div className="h-12 bg-gray-200 rounded mb-16"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  // Show error state
  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Watch Our Students Share Their Success Stories
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Hear directly from our students about their learning journey
          </p>
          <Button 
            onClick={handleHireTutor}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium mb-16"
          >
            Hire a Tutor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-red-500">Failed to load video testimonials. Please try again.</p>
        </div>
      </section>
    );
  }

  // Show empty state if no video testimonials
  if (videoTestimonials.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Watch Our Students Share Their Success Stories
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Hear directly from our students about their learning journey
          </p>
          <Button 
            onClick={handleHireTutor}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium mb-16"
          >
            Hire a Tutor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-gray-500">No video testimonials available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          {/* Main Title */}
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Watch Our Students Share Their Success Stories
          </h2>
          
          {/* Call-to-Action Subtitle */}
          <p className="text-lg text-gray-600 mb-8">
            Hear directly from our students about their learning journey
          </p>
          
          {/* Button */}
          <Button 
            onClick={handleHireTutor}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium mb-16"
          >
            Hire a Tutor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {/* Video Testimonials Carousel */}
          <div className="relative">
            {/* Navigation Controls - Only show if multiple videos */}
            {videoTestimonials.length > 1 && (
              <div className="flex justify-center items-center mb-6 gap-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 border-green-200"
                  onClick={handlePrev}
                >
                  <ChevronLeft className="h-5 w-5 text-green-600" />
                </Button>
                
                <div className="hidden sm:flex gap-2">
                  {videoTestimonials.map((_:any, idx:any) => (
                    <button
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx 
                          ? 'bg-green-600 w-6' 
                          : 'bg-green-300 w-2'
                      }`}
                      onClick={() => setCurrentSlide(idx)}
                    />
                  ))}
                </div>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 border-green-200"
                  onClick={handleNext}
                >
                  <ChevronRight className="h-5 w-5 text-green-600" />
                </Button>
              </div>
            )}
            
            {/* Video Testimonials Container */}
            <div 
              className="relative overflow-hidden"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {videoTestimonials.map((testimonial:any, index:any) => (
                  <div key={testimonial.id} className="w-full flex-shrink-0">
                    <div className="max-w-4xl mx-auto">
                      {/* Video Card */}
                      <Card className="bg-white border-0 shadow-lg rounded-xl overflow-hidden">
                        <CardContent className="p-0">
                          {/* Video Player */}
                          <div className="relative aspect-video bg-black">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="relative w-full h-full">
                                <img 
                                  src={testimonial.thumbnail || `https://img.youtube.com/vi/${getYouTubeVideoId(testimonial.videoUrl)}/maxresdefault.jpg`} 
                                  alt={testimonial.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = `https://img.youtube.com/vi/${getYouTubeVideoId(testimonial.videoUrl)}/hqdefault.jpg`;
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                                  <Button
                                    onClick={() => handlePlayVideo(testimonial)}
                                    className="h-16 w-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                  >
                                    <Play className="h-8 w-8 ml-1" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {testimonial.duration}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Testimonial Info */}
                          <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                <AvatarFallback className="bg-green-600 text-white">
                                  {testimonial.name.split(' ').map((n:any) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <h4 className="text-lg font-bold text-gray-900">
                                  {testimonial.name}
                                </h4>
                                <p className="text-sm text-gray-600">{testimonial.role}</p>
                                <p className="text-xs text-gray-500">{testimonial.location}</p>
                                {/* Rating Stars */}
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < testimonial.rating 
                                          ? 'text-yellow-400 fill-current' 
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <blockquote className="text-gray-700 text-base leading-relaxed italic">
                              "{testimonial.testimonial}"
                            </blockquote>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <Button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-10"
              variant="ghost"
            >
              ✕ Close
            </Button>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={getYouTubeEmbedUrl(selectedVideo.videoUrl)}
                title={selectedVideo.name}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 text-white text-center">
              <h3 className="text-xl font-bold">{selectedVideo.name}</h3>
              <p className="text-gray-300">{selectedVideo.role} • {selectedVideo.location}</p>
              {/* Rating in modal */}
              <div className="flex justify-center items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < selectedVideo.rating 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};