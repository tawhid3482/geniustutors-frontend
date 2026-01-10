"use client";

import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";
import { TutorDashboard } from "@/components/tutor/TutorDashboard";
import { SuperAdminDashboard } from "@/components/super-admin/SuperAdminDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();


  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
      return;
    }

    // Redirect users to their specific dashboards
    if (user && user.role) {
      if (user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else if (user.role === "MANAGER") {
        router.push("/manager/dashboard");
      } else if (user.role === "SUPER_ADMIN") {
        router.push("/super-admin/dashboard");
      } else if (user.role === "STUDENT_GUARDIAN") {
        router.push("/student");
      }
      // Tutors stay on /dashboard, no redirect needed
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return null; // Will redirect in useEffect
  }

  const role = user?.role;

  return (
    <div className="w-full h-screen overflow-hidden">
      {role === "SUPER_ADMIN" && <SuperAdminDashboard user={user} />}
      {role === "ADMIN" && <AdminDashboard user={user} />}
      {role === "TUTOR" && <TutorDashboard />}
      {/* Students are redirected to /student, so this should not render */}
      {(!role || role === "STUDENT_GUARDIAN") && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-lg">Redirecting to student dashboard...</p>
            {/* <StudentDashboard></StudentDashboard> */}
          </div>
        </div>
      )}
    </div>
  );
}
