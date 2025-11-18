'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { TutorHubHeader } from "../../components/tutor-hub/TutorHubHeader";
import { TutorHubStats } from "../../components/tutor-hub/TutorHubStats";
import { TutorHubSearch } from "../../components/tutor-hub/TutorHubSearch";
import { TutorCategorySection } from "../../components/tutor-hub/TutorCategorySection";

export default function TutorHubPage() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden bg-gray-50">
      <Navbar 
        user={user ? {
          name: user.full_name,
          email: user.email,
          role: user.role,
          avatar: user.avatar_url
        } : undefined}
        onLogout={handleLogout}
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />
      <main className="flex-1 w-full overflow-x-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-12">
          <TutorHubHeader />
          <TutorHubStats />
          <TutorHubSearch />
          
          <div className="space-y-8 sm:space-y-12 mt-8 sm:mt-12">
            <TutorCategorySection 
              title="All Tutors" 
              category="all" 
              limit={8}
            />
            <TutorCategorySection 
              title="Verified Tutors" 
              category="verified" 
              limit={8}
            />
            <TutorCategorySection 
              title="Genius Tutors" 
              category="genius" 
              limit={8}
            />
            <TutorCategorySection 
              title="New Tutors" 
              category="new" 
              limit={8}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
