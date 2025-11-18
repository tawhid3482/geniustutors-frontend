'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Quote, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTestimonials, Testimonial } from "@/services/testimonialService";

export const TestimonialsSection = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  
  const totalSlides = testimonials.length;
  
  // Fetch testimonials on component mount
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const data = await getTestimonials();
        setTestimonials(data);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);
  
  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && testimonials.length > 0) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides);
      }, 4000);
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [isPaused, totalSlides, testimonials.length]);
  
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

  // Show loading state
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
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

  // Show empty state if no testimonials
  if (testimonials.length === 0) {
  return (
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            What Some Awesome Guardian/Student Says about Us
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Hire a tutor today and start learning!
          </p>
          <Button 
            onClick={handleHireTutor}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium mb-16"
          >
            Hire a Tutor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-gray-500">No testimonials available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Main Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          What Some Awesome Guardian/Student Says about Us
        </h2>
        
        {/* Call-to-Action Subtitle */}
        <p className="text-lg text-gray-600 mb-8">
          Hire a tutor today and start learning!
        </p>
        
        {/* Button */}
        <Button 
          onClick={handleHireTutor}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-medium mb-16"
        >
          Hire a Tutor
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        
        {/* Testimonial Carousel */}
        <div className="relative">
        {/* Navigation Controls */}
          <div className="flex justify-center items-center mb-6 gap-4">
          <Button 
            variant="outline" 
            size="icon" 
              className="h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 border-green-200"
            onClick={handlePrev}
          >
              <ChevronLeft className="h-5 w-5 text-green-600" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
              className="h-10 w-10 rounded-full bg-green-50 hover:bg-green-100 border-green-200"
            onClick={handleNext}
          >
              <ChevronRight className="h-5 w-5 text-green-600" />
          </Button>
        </div>

          {/* Testimonial Cards Container */}
          <div 
            className="relative overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0">
                  {/* Profile Picture - positioned above the card */}
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-20 w-20 ring-4 ring-green-200">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-green-600 text-white font-semibold text-xl">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Testimonial Card */}
                  <Card className="bg-gray-50 border-0 shadow-sm rounded-xl max-w-2xl mx-auto">
                    <CardContent className="p-4 sm:p-8 relative">
                      {/* Large Quote Icon */}
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6">
                        <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-green-600" />
                  </div>

                      {/* Name and Title */}
                      <div className="text-center mb-2 sm:mb-2">
                        <h4 className="text-lg sm:text-xl font-bold text-green-600">
                          {testimonial.name}
                        </h4>
                        <p className="text-gray-600 text-sm sm:text-base">
                          {testimonial.location}
                        </p>
                  </div>

                      {/* Testimonial Text */}
                      <blockquote className="text-gray-800 text-base sm:text-lg leading-relaxed mt-4 sm:mt-6 ml-12 sm:ml-16">
                    "{testimonial.testimonial}"
                  </blockquote>
                </CardContent>
              </Card>
                </div>
            ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
