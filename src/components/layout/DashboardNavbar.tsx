'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Search, Menu, X } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { useState, useEffect } from "react";
import { getWebsiteInfo } from "@/services/websiteService";
import Image from "next/image";

interface NavbarProps {
  user?: {
    id?: string;
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
  // Optional props for sidebar control
  onToggleSidebar?: () => void;
  showMobileSidebar?: boolean;
}

export const DashboardNavbar = ({ user, onLogout, onToggleSidebar, showMobileSidebar }: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState({ siteName: 'Tutor Connect', siteLogo: '/logo.svg' });
  
  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  console.log("user5641", user)
  
  useEffect(() => {
    const fetchWebsiteInfo = async () => {
      try {
        const info = await getWebsiteInfo();
        setWebsiteInfo(info);
      } catch (error) {
        console.error('Error fetching website info:', error);
      }
    };
    
    fetchWebsiteInfo();
  }, []);

  // Handle mobile menu toggle
  const handleMobileMenuToggle = () => {
    if (onToggleSidebar) {
      // If sidebar control is provided, use it
      onToggleSidebar();
    } else {
      // Otherwise toggle the regular mobile menu
      setMobileMenuOpen(!mobileMenuOpen);
    }
  };
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-40 backdrop-blur-sm w-full shadow-sm">
      <div className="w-full px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16 min-h-[4rem]">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0 group">
            {websiteInfo.siteLogo ? (
              <div className="relative max-w-24 sm:max-w-28 md:max-w-36 lg:max-w-44 xl:max-w-52">
                <Image 
                  src={websiteInfo.siteLogo} 
                  alt={websiteInfo.siteName} 
                  width={200}
                  height={200}
                  className="w-auto h-auto max-h-24 sm:max-h-28 md:max-h-36 lg:max-h-44 xl:max-h-52 transition-all duration-300 group-hover:scale-110" 
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-green-700 group-hover:scale-110 shadow-lg group-hover:shadow-green-500/25">
                <span className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl group-hover:text-green-100 transition-colors duration-300">G</span>
              </div>
            )}

          </Link>






          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center justify-center space-x-8 flex-1 mx-4">
            <Link 
              href="/tuition-jobs" 
              className="relative text-foreground hover:text-primary transition-all duration-300 group py-1"
            >
              Tuition Jobs
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
            <Link 
              href="/tutor-hub" 
              className="relative text-foreground hover:text-primary transition-all duration-300 group py-1"
            >
              Tutor Hub
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
            <Link 
              href="/tutor-request" 
              className="relative text-foreground hover:text-primary transition-all duration-300 group py-1"
            >
              Tutor Request
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
            <Link 
              href="/courses" 
              className="relative text-foreground hover:text-primary transition-all duration-300 group py-1"
            >
              Courses
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 ease-in-out"></span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {user ? (
              <>
                {/* Notification Dropdown - Removed for super admin */}
                {/* <NotificationDropdown userId={user.id} /> */}
                
                
              </>
            ) : (
              // When no user is present, show nothing instead of login/register buttons
              <></>
            )}

            {/* Theme Toggle - Positioned at far right */}
            {/* <div className="flex items-center">
              <ThemeToggle />
            </div> */}

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden p-1.5 h-8 w-8 sm:h-9 sm:w-9"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle mobile menu"
            >
              {onToggleSidebar ? (
                // Always show Menu icon for sidebar toggle (don't change to X)
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                // Regular mobile menu toggle
                mobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 px-2 space-y-1 border-t border-border animate-in slide-in-from-top duration-300 absolute left-0 right-0 bg-background shadow-md z-50">
            <Link 
              href="/tuition-jobs" 
              className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tuition Jobs
            </Link>
            <Link 
              href="/premium-tutors" 
              className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tutor Hub
            </Link>
            <Link 
              href="/tutor-request" 
              className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tutor Request
            </Link>
            <Link 
              href="/courses" 
              className="block px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-sm sm:text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Courses
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};
