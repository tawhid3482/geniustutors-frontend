'use client';

import React from "react";
import { UserPlus, FileText, FileCheck, CheckCircle } from "lucide-react";

export const HowItWorksForTutors = () => {
  const steps = [
    {
      id: 1,
      title: "Create Profile",
      description: "Create your professional tutor profile with qualifications and experience.",
      icon: <UserPlus className="h-6 w-6" />
    },
    {
      id: 2,
      title: "Browse Jobs",
      description: "Explore available tuition jobs and find opportunities that match your expertise.",
      icon: <FileText className="h-6 w-6" />
    },
    {
      id: 3,
      title: "Apply & Connect",
      description: "Submit applications and connect with students who need your tutoring services.",
      icon: <FileCheck className="h-6 w-6" />
    },
    {
      id: 4,
      title: "Start Teaching",
      description: "Begin tutoring sessions and start earning with your selected students.",
      icon: <CheckCircle className="h-6 w-6" />
    }
  ];

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            The ways <span className="text-green-500">Tutors</span> can connect with us
          </h2>
        </div>

        {/* Steps Flow */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step */}
              <div className="flex flex-col items-center text-center max-w-64">
                {/* Circular Icon */}
                <div className="w-16 h-16 bg-green-500 rounded-full border-4 border-white flex items-center justify-center text-white shadow-lg mb-4">
                  {step.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except for last step) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block relative">
                  <svg width="80" height="40" viewBox="0 0 80 40" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    {/* Curved path for the arrow */}
                    <path 
                      d={index % 2 === 0 ? "M10,20 Q40,5 70,20" : "M10,20 Q40,35 70,20"} 
                      stroke="none" 
                      fill="none"
                      id={`arrow-path-${index}`}
                    />
                    
                    {/* Dotted arrow along the curved path */}
                    <defs>
                      <pattern id={`dot-pattern-${index}`} patternUnits="userSpaceOnUse" width="8" height="8">
                        <circle cx="4" cy="4" r="1.5" fill="#22c55e"/>
                      </pattern>
                    </defs>
                    
                    {/* Arrow shaft dots */}
                    <circle cx="15" cy={index % 2 === 0 ? "12" : "28"} r="1.5" fill="#22c55e"/>
                    <circle cx="25" cy={index % 2 === 0 ? "8" : "32"} r="1.5" fill="#22c55e"/>
                    <circle cx="35" cy={index % 2 === 0 ? "6" : "34"} r="1.5" fill="#22c55e"/>
                    <circle cx="45" cy={index % 2 === 0 ? "6" : "34"} r="1.5" fill="#22c55e"/>
                    <circle cx="55" cy={index % 2 === 0 ? "8" : "32"} r="1.5" fill="#22c55e"/>
                    <circle cx="65" cy={index % 2 === 0 ? "12" : "28"} r="1.5" fill="#22c55e"/>
                    
                    {/* Arrowhead - larger dot */}
                    <circle cx="72" cy="20" r="2" fill="#22c55e"/>
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};