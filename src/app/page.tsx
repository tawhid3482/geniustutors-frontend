"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { HeroSection } from "@/components/home/HeroSection";
import { PopularCategorySection } from "@/components/home/PopularCategorySection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { TuitionTypesSection } from "@/components/home/TuitionTypesSection";
import { HowItWorksForStudents } from "@/components/home/HowItWorksForStudents";
import { HowItWorksForTutors } from "@/components/home/HowItWorksForTutors";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { VideoTestimonialsSection } from "@/components/home/VideoTestimonialsSection";
import { TutorShowcase } from "@/components/home/TutorShowcase";
import { FeaturedOnSection } from "@/components/home/FeaturedOnSection";
import {
  SearchJobsSection,
  SearchJobsSectionContent,
} from "@/components/home/SearchJobsSection";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect student and tutor users, allow admin users to access home page
    if (user && user.role === "student") {
      router.push("/student");
    }
    if (user && user.role === "tutor") {
      router.push("/tutor");
    }
    // Admin users (admin, super_admin, manager) can access the home page
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Only show loading spinner for student and tutor users, not admin users
  if (user && (user.role === "student" || user.role === "tutor")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar
        user={
          user
            ? {
                name: user.full_name,
                email: user.email,
                role: user.role,
                avatar: user.avatar_url,
              }
            : undefined
        }
        onLogout={handleLogout}
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />

      <main className="flex-1 w-full overflow-x-hidden">
        <HeroSection />
        <PopularCategorySection />
        <TutorShowcase />
        <SearchJobsSection />
        {/* <SearchJobsSectionContent /> */}
        <TuitionTypesSection />
        <TestimonialsSection />
        <VideoTestimonialsSection />
        <ServicesSection />
        <HowItWorksForTutors />
        <HowItWorksForStudents />
        <FeaturedOnSection />
      </main>
      <Footer />
    </div>
  );
}
