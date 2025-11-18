'use client';

import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeProvider";

export default function NotFound() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Trigger animations after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    // Stop animation after initial load
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(animationTimer);
    };
  }, []);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden overflow-x-hidden w-full",
      theme === "dark" 
        ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white" 
        : "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 text-gray-900"
    )}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl animate-pulse",
          theme === "dark" ? "bg-green-600" : "bg-green-300"
        )}></div>
        <div className={cn(
          "absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse delay-1000",
          theme === "dark" ? "bg-emerald-600" : "bg-emerald-300"
        )}></div>
        <div className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse delay-500",
          theme === "dark" ? "bg-teal-600" : "bg-teal-300"
        )}></div>
      </div>
      
      {/* Floating animated elements */}
      {[...Array(6)].map((_, i) => (
        <div 
          key={i}
          className={cn(
            "absolute rounded-full opacity-10 animate-float",
            theme === "dark" ? "bg-green-500" : "bg-green-400"
          )}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${Math.random() * 60 + 20}px`,
            height: `${Math.random() * 60 + 20}px`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            animationDelay: `${Math.random() * 5}s`
          }}
        ></div>
      ))}
      
      <div className="relative z-10 max-w-3xl w-full text-center">
        {/* 404 Number Animation */}
        <div className="mb-8 relative">
          <div className={cn(
            "text-9xl md:text-[12rem] font-extrabold tracking-wider transition-all duration-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            theme === "dark" 
              ? "bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 text-transparent bg-clip-text" 
              : "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-transparent bg-clip-text"
          )}>
            4
            <span className={cn(
              "inline-block transition-transform duration-700",
              isAnimating ? "animate-bounce" : ""
            )}>0</span>
            4
          </div>
          
          {/* Glowing effect behind 404 */}
          <div className={cn(
            "absolute inset-0 -z-10 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 opacity-20 blur-2xl rounded-full mx-auto w-3/4 h-3/4 transition-all duration-1000",
            isVisible ? "opacity-20 scale-100" : "opacity-0 scale-75"
          )}></div>
        </div>
        
        {/* Title with animation */}
        <h1 className={cn(
          "text-3xl md:text-5xl font-bold mb-6 transition-all duration-1000 delay-150",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <span className={theme === "dark" ? "text-green-400" : "text-green-600"}>Oops!</span>{" "}
          <span className={theme === "dark" ? "text-emerald-400" : "text-emerald-600"}>Page Not Found</span>
        </h1>
        
        {/* Description with animation */}
        <p className={cn(
          "text-lg md:text-xl mb-10 max-w-2xl mx-auto transition-all duration-1000 delay-300",
          theme === "dark" ? "text-gray-300" : "text-gray-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          The page you{`'`}re looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        
        {/* Action Buttons with staggered animation */}
        <div className={cn(
          "flex flex-col sm:flex-row justify-center gap-4 mb-12 transition-all duration-1000 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <Button 
            size="lg" 
            className={cn(
              "group relative bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 overflow-hidden"
            )}
            onClick={handleGoHome}
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full blur-sm"></div>
            
            {/* Button content */}
            <div className="relative flex items-center gap-2 z-10">
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className={cn(
              "group relative border-2 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 overflow-hidden",
              theme === "dark" 
                ? "border-green-500 text-white hover:bg-green-900/30" 
                : "border-green-600 text-green-700 hover:bg-green-100"
            )}
            onClick={handleGoBack}
          >
            {/* Button content */}
            <div className="relative flex items-center gap-2 z-10">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Go Back</span>
            </div>
          </Button>
        </div>
        
        
        
        {/* Decorative elements */}
        <div className="mt-16 relative">
          <div className={cn(
            "inline-block p-6 rounded-2xl transition-all duration-1000 delay-1000",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
            theme === "dark" 
              ? "bg-gray-800/50 backdrop-blur-sm border border-gray-700" 
              : "bg-white/50 backdrop-blur-sm border border-green-200"
          )}>
            <div className="flex items-center justify-center gap-4">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    i === 0 ? "bg-green-500" : i === 1 ? "bg-emerald-500" : "bg-teal-500",
                    `delay-${i * 200}`
                  )}
                ></div>
              ))}
            </div>
            <p className={cn(
              "mt-4 text-sm",
              theme === "dark" ? "text-gray-400" : "text-gray-600"
            )}>
              Looking for something specific? Try our search above.
            </p>
          </div>
        </div>
      </div>
      
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
            opacity: 0.15;
          }
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.1;
          }
        }
        .animate-float {
          animation: float 8s infinite ease-in-out;
        }
        .delay-0 {
          animation-delay: 0s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
}
