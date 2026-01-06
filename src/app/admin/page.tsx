"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  Shield,
  ArrowLeft,
  Loader2,
  KeyRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  useLoginAdminMutation,
} from "@/redux/features/auth/authApi";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const router = useRouter();

  // RTK Query hooks
  const [loginAdmin, { isLoading: isLoginLoading }] = useLoginAdminMutation();

  const [loginForm, setLoginForm] = useState({
    phone: "",
    password: "",
  });

  const [forgotPasswordForm, setForgotPasswordForm] = useState<{
    phone: string;
    verificationCode: string;
    newPassword: string;
    confirmPassword: string;
  }>({
    phone: "",
    verificationCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [forgotPasswordStep, setForgotPasswordStep] = useState<
    "phone" | "verification" | "newPassword"
  >("phone");

  // Handle login using RTK Query
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.phone || !loginForm.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      // Call RTK Query mutation
      const response = await loginAdmin({
        phone: loginForm.phone,
        password: loginForm.password,
      }).unwrap();

      console.log("Login Response:", response);

      if (response.success) {
        toast.success("Welcome to Admin Panel!");

        // FIXED: Access user data correctly from response
        const user = response.data?.user || response.data?.[0]; // Try both formats
        const token = response.data?.token || response.data?.[1]; // Try both formats

        

        if (token && user) {
          // Store in localStorage
          localStorage.setItem("authToken", token);
          localStorage.setItem("user", JSON.stringify(user));
          
          // FIXED: Get user role from the stored user object
          const userRole = user.role;
          console.log("User Role:", userRole);
          
          // **AUTO RELOAD AFTER LOGIN**
          // First show success message
          toast.success("Login successful! Reloading page...");
          
          // Wait a moment for user to see the message
          setTimeout(() => {
            // Reload the page
            window.location.reload();
          }, 1000);
          
        } else {
          toast.error("User data not found in response");
        }
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: any) {
      // RTK Query error handling
      const errorMessage =
        error?.data?.message || error?.message || "Login failed";
      toast.error(errorMessage);
      console.error("Login Error:", error);
    }
  };

  // Check if user is already logged in - AFTER RELOAD
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userString = localStorage.getItem("user");

    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        console.log("Auto-redirecting user:", user);
        
        // Redirect based on role after reload
        if (user.role === "SUPER_ADMIN") {
          router.push("/super-admin/dashboard");
        } else if (user.role === "ADMIN" || user.role === "MANAGER") {
          router.push("/dashboard");
        } else {
          router.push("/dashboard"); // Default redirect
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
        // Invalid user data in localStorage, clear it
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      }
    }
  }, [router]);

  // Disable forgot password functions since they're not implemented
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Forgot password feature is not implemented yet");
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Forgot password feature is not implemented yet");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.error("Forgot password feature is not implemented yet");
  };

  // Reset to login view
  const resetToLogin = () => {
    setForgotPasswordMode(false);
    setForgotPasswordStep("phone");
    setForgotPasswordForm({
      phone: "",
      verificationCode: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="flex min-h-screen flex-col w-full overflow-x-hidden">
      <Navbar />
      <div
        className="admin-login-container bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 flex-1"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 4rem)",
          width: "100%",
          position: "relative",
        }}
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-3xl"></div>

        <div
          className="admin-login-content relative z-10"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "32rem",
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8 w-full">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl mb-6 shadow-2xl">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-green-800 mb-3">
              Admin Panel
            </h1>
            <p className="text-green-600/80 text-lg">
              Secure administrative access
            </p>
          </div>

          {/* Login/Forgot Password Form */}
          <div className="bg-white/90 backdrop-blur-xl border border-green-200/50 rounded-3xl p-8 shadow-2xl w-full">
            {!forgotPasswordMode ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-sm font-semibold text-green-800"
                  >
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      className="pl-12 h-12 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 text-green-900 placeholder:text-green-400 rounded-xl transition-all duration-300 text-base"
                      value={loginForm.phone}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-green-800"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-green-600" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-12 pr-12 h-12 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 text-green-900 placeholder:text-green-400 rounded-xl transition-all duration-300 text-base"
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-base h-12"
                  disabled={isLoginLoading}
                >
                  {isLoginLoading ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    "Access Admin Panel"
                  )}
                </Button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordMode(true)}
                    className="text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              </form>
            ) : (
              // Forgot Password Form (Disabled)
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Reset Password
                  </h2>
                  <p className="text-green-600/80 text-sm">
                    This feature is currently unavailable
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-700 text-center">
                    Password reset feature is under maintenance. Please contact system administrator for assistance.
                  </p>
                </div>

                {/* Back to Login Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium text-sm transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Login
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-xs text-red-600 text-center">
                ⚠️ This portal is restricted to authorized administrative
                personnel only.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-green-600/60 text-sm">
              Need help? Contact system administrator
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}