"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useState, useEffect } from "react";
import { getWebsiteInfo } from "@/services/websiteService";
import logo from "../../../public/Genius-Tutor-Logo.png";
import { useRouter } from "next/navigation";

interface NavbarProps {
  user?: {
    fullName: string;
    email: string;
    role: string;
    avatar?: string;
  };
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
  LoginComponent?: React.ComponentType<{ children: React.ReactNode }>;
  RegisterComponent?: React.ComponentType<{ children: React.ReactNode }>;
}

export const Navbar = ({
  user,
  onLogin,
  onRegister,
  onLogout,
  LoginComponent,
  RegisterComponent
}: NavbarProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [websiteInfo, setWebsiteInfo] = useState({
    siteName: "Tutor Connect",
    siteLogo: "/logo.svg",
  });

  const router = useRouter();

  useEffect(() => {
    const fetchWebsiteInfo = async () => {
      try {
        const info = await getWebsiteInfo();
        setWebsiteInfo(info);
      } catch (error) {
        console.error("Error fetching website info:", error);
      }
    };

    fetchWebsiteInfo();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDashboard = async () => {
    router.push("/dashboard");
  };
  const handleRegistration = async()=>{
    router.push("/registration")
  }

  // console.log(user)

  return (
    <nav className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 min-h-[4rem]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 flex-shrink-0 group"
          >
            {websiteInfo.siteLogo ? (
              <div className="relative max-w-24 sm:max-w-28 md:max-w-36 lg:max-w-44 xl:max-w-52">
                <Image
                  src={logo}
                  alt={websiteInfo.siteName}
                  width={200}
                  height={200}
                  className="w-auto h-auto max-h-24 sm:max-h-28 md:max-h-36 lg:max-h-44 xl:max-h-52 transition-all duration-300 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 xl:w-52 xl:h-52 bg-green-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-green-700 group-hover:scale-110 shadow-lg group-hover:shadow-green-500/25">
                <span className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl group-hover:text-green-100 transition-colors duration-300">
                  G
                </span>
              </div>
            )}
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-8">
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
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />

            {user ? (
              <>
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full"
                    >
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                        <AvatarImage
                          src={user?.avatar || undefined}
                          alt={user?.fullName || "User"}
                        />
                        <AvatarFallback>
                          {user?.fullName ? user.fullName.charAt(0) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem className="flex flex-col items-start">
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div className="text-xs text-primary">{user.role}</div>
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={handleDashboard}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {LoginComponent ? (
                  <LoginComponent>
                    <Button
                      variant="ghost"
                      className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                    >
                      Login
                    </Button>
                  </LoginComponent>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={onLogin}
                    className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9"
                  >
                    Login
                  </Button>
                )}
                {RegisterComponent ? (
                  <RegisterComponent>
                    <Button
                    // onClick={handleRegistration}
                      variant="hero"
                      className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 ease-out border-0 hover:border-green-400"
                      data-auth-type="register"
                    >
                      Register
                    </Button>
                  </RegisterComponent>
                ) : (
                  <Button
                    variant="hero"
                    onClick={onRegister}
                    className="text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-9 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-green-500/25 transform hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 ease-out border-0 hover:border-green-400"
                  >
                    Register
                  </Button>
                )}
              </>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden p-2 h-10 w-10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 px-2 space-y-1 border-t border-border animate-in slide-in-from-top duration-300 absolute left-0 right-0 bg-background shadow-md z-50">
            <Link
              href="/tuition-jobs"
              className="block px-4 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tuition Jobs
            </Link>
            <Link
              href="/tutor-hub"
              className="block px-4 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tutor Hub
            </Link>
            <Link
              href="/tutor-request"
              className="block px-4 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tutor Request
            </Link>
            <Link
              href="/courses"
              className="block px-4 py-3 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
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
