'use client';

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationDropdown } from "@/components/ui/NotificationDropdown";
import { useState, useEffect } from "react";
import { getWebsiteInfo } from "@/services/websiteService";

interface SuperAdminNavbarProps {
  user?: {
    id?: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  showMobileSidebar?: boolean;
}

export const SuperAdminNavbar = ({ user, onLogout, onToggleSidebar, showMobileSidebar }: SuperAdminNavbarProps) => {
  const [websiteInfo, setWebsiteInfo] = useState({ siteName: 'Tutor Connect', siteLogo: '/logo.svg' });
  
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
  
  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm w-full">
      <div className="w-full px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-16 min-h-[4rem]">
          {/* Left Side - Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              {websiteInfo.siteLogo ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 relative">
                  <Image 
                    src={websiteInfo.siteLogo} 
                    alt={websiteInfo.siteName} 
                    fill 
                    className="object-contain transition-all duration-300 group-hover:scale-110" 
                  />
                </div>
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-600 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:bg-green-700 group-hover:scale-110 shadow-lg group-hover:shadow-green-500/25">
                  <span className="text-white font-bold text-base sm:text-lg group-hover:text-green-100 transition-colors duration-300">G</span>
                </div>
              )}
              <span className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent group-hover:from-green-700 group-hover:to-green-600 transition-all duration-300">
                {websiteInfo.siteName}
              </span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
            {user ? (
              <>
                {/* Notification Dropdown */}
                <NotificationDropdown userId={user.id} />
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                        <AvatarImage src={user?.avatar} alt={user?.name || 'User'} />
                        <AvatarFallback className="text-xs sm:text-sm">{user?.name ? user.name.charAt(0) : 'U'}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex flex-col items-start p-3">
                      <div className="font-medium text-sm sm:text-base">{user?.name || 'User'}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{user?.email || 'No email'}</div>
                      <div className="text-xs text-primary">{user?.role || 'No role'}</div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout} className="text-sm">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <></>
            )}

            {/* Theme Toggle */}
            <div className="flex items-center">
              <ThemeToggle />
            </div>

            {/* Mobile Sidebar Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden p-1.5 h-8 w-8 sm:h-9 sm:w-9"
              onClick={onToggleSidebar}
              aria-label="Toggle sidebar menu"
            >
              {showMobileSidebar ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
