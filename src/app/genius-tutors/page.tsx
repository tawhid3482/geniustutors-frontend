"use client";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext.next";
import { useGetAllTutorPublicQuery } from "@/redux/features/tutorHub/tutorHubApi";
import { Award, CheckCircle, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const VerifiedTutor = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const { data: allTutors } = useGetAllTutorPublicQuery(undefined);
  const allTutorsList = allTutors?.data || [];

  // Filter only verified tutors
  const verifiedTutors = allTutorsList.filter(
    (tutor: any) =>
      tutor.genius === 1 || tutor.genius === "1" || tutor.genius === true
  );


  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 2) {
      return `${parts[0]} ${parts[1].charAt(0)}.`;
    }
    return name;
  };

  const formatUniversity = (university?: string) => {
    if (!university) return "University";
    if (university.length > 20) {
      return university.substring(0, 20) + "...";
    }
    return university;
  };

  const handleViewProfile = (tutorId: string) => {
    router.push(`/tutor/${tutorId}`);
  };

  return (
    <div className="flex min-h-screen flex-col w-full mx-auto overflow-x-hidden">
      <Navbar
        user={
          user
            ? {
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
            : undefined
        }
        onLogout={handleLogout}
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />

      <div className="flex-1 w-full mx-auto overflow-x-hidden p-4 sm:p-6">
        <div className="mb-8 w-full mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Genius Tutors
          </h1>
          <p className="text-gray-600">
            Meet our genius and trusted tutors who have undergone thorough
            verification
          </p>

          <div className="flex items-center justify-center my-2 gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 text-center" />
            <span className="text-sm text-gray-700 text-center">
              {verifiedTutors.length} genius tutors available
            </span>
          </div>
        </div>

        {verifiedTutors.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No genius tutors found</p>
            <p className="text-gray-400 text-sm mt-2">
              Check back later for genius tutors
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {verifiedTutors.map((tutor: any) => (
              <div
                key={tutor.id}
                className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full h-auto flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition-shadow relative"
              >
                {/* Verified Badge */}
                <div className="absolute top-3 left-3">
                  <div className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Genius
                  </div>
                </div>

                {/* Profile Picture with Green Background */}
                <div className="relative mb-3 sm:mb-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                      <AvatarImage src={tutor.avatar} alt={tutor.fullName} />
                      <AvatarFallback className="bg-green-200 text-green-800 font-semibold text-sm sm:text-lg">
                        {getInitials(tutor.fullName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Premium Badge if applicable */}
                {tutor.premium === "premium" && (
                  <div className="mb-3">
                    <div className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Genius Tutor
                    </div>
                  </div>
                )}

                {/* Tutor Name */}
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">
                  {formatName(tutor.fullName)}
                </h3>

                {/* University */}
                <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  {formatUniversity(tutor.university_name)}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1 mb-3 sm:mb-4">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    {tutor.location || "Dhaka"}
                  </span>
                </div>

                {/* View Button */}
                <Button
                  className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors mt-0 text-xs sm:text-sm"
                  onClick={() => handleViewProfile(tutor.tutor_id)}
                >
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VerifiedTutor;
