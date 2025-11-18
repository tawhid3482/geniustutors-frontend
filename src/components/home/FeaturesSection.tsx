'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  MapPin, 
  Video, 
  BookOpen,
  CheckCircle,
  TrendingUp,
  Award,
  Zap,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

export const FeaturesSection = () => {
  // Mobile carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);
  const slidesPerView = 1; // Show 1 feature at a time on mobile
  const totalSlides = 6; // Total number of features
  const maxSlideIndex = Math.max(0, totalSlides - slidesPerView);

  // Auto-slide functionality for mobile
  useEffect(() => {
    if (!isPaused) {
      slideInterval.current = setInterval(() => {
        setCurrentSlide(prev => 
          prev >= maxSlideIndex ? 0 : prev + 1
        );
      }, 4000); // Slide every 4 seconds
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

  const features = [
    {
      icon: Shield,
      title: "100% Verified Tutors",
      description: "All our tutors go through rigorous background checks and qualification verification",
      color: "bg-primary",
      stats: "5,000+ Verified"
    },
    {
      icon: Clock,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your schedule. Available 7 days a week, morning to night",
      color: "bg-success",
      stats: "24/7 Available"
    },
    {
      icon: DollarSign,
      title: "Affordable Pricing",
      description: "Competitive rates starting from ৳500/hour. Find tutors within your budget",
      color: "bg-warning",
      stats: "From ৳500/hr"
    },
    {
      icon: Star,
      title: "Quality Guaranteed",
      description: "Average 4.9/5 rating from students. Money-back guarantee if not satisfied",
      color: "bg-info",
      stats: "4.9/5 Rating"
    },
    {
      icon: Video,
      title: "Online & Home Tuition",
      description: "Choose between online video sessions or traditional home tutoring",
      color: "bg-purple-500",
      stats: "Both Options"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Monitor learning progress with detailed analytics and performance reports",
      color: "bg-emerald-500",
      stats: "Real-time Data"
    }
  ];

  const stats = [
    { label: "Active Students", value: "10,000+", icon: Users },
    { label: "Subjects Covered", value: "50+", icon: BookOpen },
    { label: "Cities Served", value: "20+", icon: MapPin },
    { label: "Success Rate", value: "95%", icon: Award }
  ];

  return (
    <section className="py-12 xs:py-16 sm:py-20 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 xs:mb-12 sm:mb-16 md:mb-20 fade-in-up">
          <Badge variant="outline" className="mb-2 xs:mb-3 sm:mb-4">
            <Zap className="h-2.5 w-2.5 xs:h-3 xs:w-3 mr-1" />
            Why Choose Tutor Today
          </Badge>
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 xs:mb-4 sm:mb-6">
            Everything You Need for
            <span className="text-gradient block">Perfect Learning</span>
          </h2>
          <p className="text-sm xs:text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We've built the most comprehensive platform to connect students with the best tutors in Bangladesh. 
            Experience learning like never before.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-10 xs:mb-12 sm:mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center scale-in" style={{animationDelay: `${index * 100}ms`}}>
              <div className="card-modern p-3 xs:p-4 sm:p-6 hover:shadow-primary transition-all duration-300">
                <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3">
                  <stat.icon className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground mb-0.5 xs:mb-1">{stat.value}</div>
                <div className="text-muted-foreground text-xs xs:text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Grid - Desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="card-modern group hover:shadow-primary transition-all duration-500"
              style={{animationDelay: `${index * 150}ms`}}
            >
              <CardContent className="p-4 xs:p-6 sm:p-8">
                <div className="space-y-3 xs:space-y-4 sm:space-y-6">
                  {/* Icon and Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 xs:w-12 xs:h-12 sm:w-14 sm:h-14 ${feature.color} rounded-xl xs:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] xs:text-xs font-medium">
                      {feature.stats}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="space-y-1.5 xs:space-y-2 sm:space-y-3">
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-xs xs:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Check icon */}
                  <div className="flex items-center text-xs xs:text-sm text-primary font-medium">
                    <CheckCircle className="h-3 w-3 xs:h-4 xs:w-4 mr-1.5 xs:mr-2" />
                    Included in all plans
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Carousel - Mobile */}
        <div className="sm:hidden relative">
          {/* Mobile Navigation Arrows */}
          <div className="flex justify-between items-center absolute top-1/2 -translate-y-1/2 left-0 right-0 z-10 px-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 shadow-lg"
              onClick={handlePrev}
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-white/90 hover:bg-white border-gray-200 shadow-lg"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          {/* Mobile Carousel Container */}
          <div 
            className="overflow-hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {features.map((feature, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <Card className="card-modern group hover:shadow-primary transition-all duration-500">
                    <CardContent className="p-4 xs:p-6">
                      <div className="space-y-3 xs:space-y-4">
                        {/* Icon and Badge */}
                        <div className="flex items-center justify-between">
                          <div className={`w-12 h-12 xs:w-14 xs:h-14 ${feature.color} rounded-xl xs:rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                            <feature.icon className="h-6 w-6 xs:h-7 xs:w-7 text-white" />
                          </div>
                          <Badge variant="secondary" className="text-xs font-medium">
                            {feature.stats}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="space-y-2 xs:space-y-3">
                          <h3 className="text-lg xs:text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {feature.title}
                          </h3>
                          <p className="text-sm xs:text-base text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>

                        {/* Check icon */}
                        <div className="flex items-center text-sm xs:text-base text-primary font-medium">
                          <CheckCircle className="h-4 w-4 xs:h-5 xs:w-5 mr-2" />
                          Included in all plans
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 xs:mt-12 sm:mt-16 md:mt-20">
          <div className="card-glass rounded-xl xs:rounded-2xl sm:rounded-3xl p-5 xs:p-8 sm:p-10 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-foreground mb-2 xs:mb-3 sm:mb-4">
              Ready to Start Your Learning Journey?
            </h3>
            <p className="text-sm xs:text-base sm:text-lg text-muted-foreground mb-4 xs:mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of students who have already transformed their academic performance with Tutor Today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 justify-center">
              <button className="bg-gradient-primary text-white px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl text-sm xs:text-base sm:text-lg font-semibold hover:opacity-90 transition-opacity shadow-primary">
                Get Started Today
              </button>
              <button className="border border-border text-foreground px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl text-sm xs:text-base sm:text-lg font-semibold hover:bg-muted transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};