'use client';

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Search, Laptop, Mail, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HowItWorksForStudents = () => {
  const steps = [
    {
      id: 1,
      title: "Search for Tutors or Post your tuition requirements",
      description: "Post Tuition by creating Account or without Account.",
      icon: <Search className="h-8 w-8 text-green-500" />
    },
    {
      id: 2,
      title: "Get one to one demo session for free",
      description: "Get free one day demo session with the tutor at your preferred location.",
      icon: <Laptop className="h-8 w-8 text-green-500" />
    },
    {
      id: 3,
      title: "Hire your tutor",
      description: "If you like the demo session, confirm the teacher.",
      icon: <Mail className="h-8 w-8 text-green-500" />
    },
    {
      id: 4,
      title: "Get results",
      description: "Gain knowledge, boost confidence and improve overall academic performance.",
      icon: <GraduationCap className="h-8 w-8 text-green-500" />
    }
  ];

  return (
    <section className="py-8 xs:py-12 sm:py-16 md:py-20 bg-gradient-to-b from-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 xs:mb-10 sm:mb-12 md:mb-16 fade-in-up">
          <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-3 xs:mb-4 sm:mb-6">
            Here's how it works for <span className="text-gradient font-semibold">Students/Guardians</span>
          </h2>
        </div>

        {/* Steps - Modern Connected Flow */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute left-1/2 top-24 bottom-24 w-0.5 bg-green-200 -translate-x-1/2 z-0"></div>
          
          {/* Steps container */}
          <div className="space-y-8 xs:space-y-10 sm:space-y-12 md:space-y-16">
            {steps.map((step, index) => (
              <div key={step.id} className={`relative z-10 ${index % 2 === 0 ? 'lg:ml-0 lg:mr-auto' : 'lg:ml-auto lg:mr-0'} lg:w-[85%]`}>
                {/* Step card */}
                <div className={`bg-white rounded-lg xs:rounded-xl shadow-md xs:shadow-lg sm:shadow-xl p-4 xs:p-5 sm:p-6 flex flex-col xs:flex-row ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-3 xs:gap-4 sm:gap-6 hover:shadow-2xl transition-all duration-300 border border-green-100`}>
                  {/* Icon container */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full bg-green-50 flex items-center justify-center">
                      {React.cloneElement(step.icon, { className: 'h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-green-500' })}
                    </div>
                    <div className="absolute -top-2 xs:-top-3 -right-2 xs:-right-3 w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs xs:text-sm shadow-lg">
                      {step.id}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-center xs:text-left">
                    <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-800 mb-1 xs:mb-1.5 sm:mb-2">{step.title}</h3>
                    <p className="text-xs xs:text-sm sm:text-base text-gray-600">{step.description}</p>
                  </div>
                  
                  {/* Connection arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -bottom-8 sm:-bottom-10 md:-bottom-12 left-1/2 transform -translate-x-1/2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-green-400 sm:w-22 sm:h-22 md:w-24 md:h-24">
                        <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA Button */}
        <div className="mt-6 xs:mt-8 sm:mt-10 md:mt-12 text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-5 xs:px-6 sm:px-8 py-4 xs:py-5 sm:py-6 text-sm xs:text-base sm:text-lg rounded-full shadow-md xs:shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => window.location.href = '/premium-tutors'}
          >
            Find a Tutor Now
          </Button>
        </div>
      </div>
    </section>
  );
};