"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/contexts/AuthContext.next";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ColorThemeProvider } from "@/contexts/ColorThemeContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToast } from "react-hot-toast";

import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noSidebarPaths = [
    "/thank-you",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
  ];

  if (noSidebarPaths.includes(pathname)) {
    return (
      <>
        <Toaster />
        <HotToast />
        <Sonner />
        {children}
      </>
    );
  }

  return (
    <SidebarProvider>
      <Toaster />
      <HotToast />
      <Sonner />
      {children}
    </SidebarProvider>
  );
}

// Wrapper component to provide user data to RoleProvider
function RoleProviderWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Transform user data to match RoleProvider expectations
  const roleUser = user
    ? {
        id: user.id || user.user_id,
        role: user.role,
        name: user.name || user.full_name,
        email: user.email,
        avatar: user.avatar,
      }
    : null;

  return <RoleProvider user={roleUser}>{children}</RoleProvider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ColorThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <RoleProviderWrapper>
                <AppLayout>{children}</AppLayout>
              </RoleProviderWrapper>
            </AuthProvider>
          </TooltipProvider>
        </ColorThemeProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
