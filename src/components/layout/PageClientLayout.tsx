'use client';

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { useAuth } from "@/contexts/AuthContext.next";

interface PageClientLayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
}

export function PageClientLayout({
  children,
  showNavbar = true,
  showFooter = true,
}: PageClientLayoutProps) {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden w-full">
      {showNavbar && (
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
      )}
      <main className="flex-1 overflow-x-hidden w-full">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
} 