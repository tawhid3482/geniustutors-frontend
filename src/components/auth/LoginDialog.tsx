"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext.next";
import { setAuthToken } from "@/utils/auth";
import { toast } from "sonner";
import { PhoneVerificationDialog } from "./PhoneVerificationDialog";
import { useRouter } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { StudentSignupForm } from "./StudentSignupForm";
import { TutorSignupForm } from "./TutorSignupForm";

interface LoginDialogProps {
  children: React.ReactNode;
  defaultRole?: "TUTOR" | "STUDENT_GUARDIAN";
}

export const LoginDialog: React.FC<LoginDialogProps> = ({
  children,
  defaultRole = "TUTOR", // এখানে DEFAULT হিসেবে TUTOR সেট করুন
}) => {
  const [open, setOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState("login");
  const router = useRouter();

  const { setUser, setProfile } = useAuth();

  // Phone verification state
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingVerificationPhone, setPendingVerificationPhone] = useState("");
  const [pendingVerificationName, setPendingVerificationName] = useState("");
  const [pendingRegistrationData, setPendingRegistrationData] =
    useState<any>(null);

  // Set the default tab based on the data-auth-type attribute
  useEffect(() => {
    if (
      children &&
      React.isValidElement(children) &&
      children.props["data-auth-type"] === "register"
    ) {
      setDefaultTab("signup");
    }
  }, [children]);

  // Handle phone verification success
  const handlePhoneVerificationSuccess = async (verificationData?: {
    user: any;
    token: string;
  }) => {
    try {
      if (verificationData?.user && verificationData?.token) {
        // Set the auth token and user data
        setAuthToken(verificationData.token);
        localStorage.setItem("authToken", verificationData.token);
        setUser(verificationData.user);
        setProfile(verificationData.user);
        localStorage.setItem("user", JSON.stringify(verificationData.user));

        // Show success message
        toast.success("Account created successfully!");

        // Redirect based on user role
        setTimeout(() => {
          const userRole = verificationData.user?.role;

          if (userRole === "TUTOR") {
            router.push("/tutor/dashboard");
          } else {
            router.push("/student/dashboard");
          }

          setOpen(false);
        }, 1500);
      } else {
        toast.error("Failed to complete registration - missing user data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete registration");
    }
  };

  // Handle phone verification request from forms
  const handlePhoneVerification = (
    phoneNumber: string,
    fullName: string,
    userData?: any
  ) => {
    console.log('📱 Phone verification requested:', { phoneNumber, fullName, userData });

    setPendingVerificationPhone(phoneNumber);
    setPendingVerificationName(fullName);
    setPendingRegistrationData(userData || null);
    setShowPhoneVerification(true);
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setOpen(false);
    toast.success("Login successful!");
  };

  // Handle dialog open/close
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      const triggerElement = document.activeElement as HTMLElement;
      if (
        triggerElement &&
        triggerElement.getAttribute("data-auth-type") === "register"
      ) {
        setDefaultTab("signup");
      } else {
        setDefaultTab("login");
      }
    }
    if (!open) {
      setPendingRegistrationData(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>

        <DialogHeader className="relative z-10">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Login And Explore
          </DialogTitle>
          <p className="text-center text-green-600/80 text-sm">
            Your journey to excellence starts here
          </p>
        </DialogHeader>

        <Tabs defaultValue={defaultTab} className="w-full relative z-10">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-xl p-1 shadow-lg">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 font-medium"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 font-medium"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <LoginForm onSuccess={handleLoginSuccess} />
          </TabsContent>

          <TabsContent value="signup" className="space-y-4 mt-6">
            <SignupFormContainer
              defaultRole={defaultRole} // এখানে prop পাস করুন
              onPhoneVerification={handlePhoneVerification}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>

      {/* Phone Verification Dialog */}
      <PhoneVerificationDialog
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
        phoneNumber={pendingVerificationPhone}
        fullName={pendingVerificationName}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        formData={pendingRegistrationData}
      />
    </Dialog>
  );
};

// Component to handle role selection and render appropriate form
const SignupFormContainer: React.FC<{
  defaultRole: "TUTOR" | "STUDENT_GUARDIAN";
  onPhoneVerification: (
    phoneNumber: string,
    fullName: string,
    userData?: any
  ) => void;
}> = ({ defaultRole, onPhoneVerification }) => {
  const [selectedRole, setSelectedRole] = useState<
    "TUTOR" | "STUDENT_GUARDIAN"
  >(defaultRole); // defaultRole ব্যবহার করুন

  return (
    <div className="space-y-4">
      {/* Role selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-green-800">
          Create a profile as a*
        </label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedRole === "TUTOR"}
                onChange={() => setSelectedRole("TUTOR")}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedRole === "TUTOR"
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-green-300 group-hover:border-green-400"
                }`}
              >
                {selectedRole === "TUTOR" && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Tutor
            </span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedRole === "STUDENT_GUARDIAN"}
                onChange={() => setSelectedRole("STUDENT_GUARDIAN")}
                className="sr-only"
              />
              <div
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedRole === "STUDENT_GUARDIAN"
                    ? "bg-green-500 border-green-500"
                    : "bg-white border-green-300 group-hover:border-green-400"
                }`}
              >
                {selectedRole === "STUDENT_GUARDIAN" && (
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              Student/Guardian
            </span>
          </label>
        </div>
      </div>

      {/* Render appropriate form based on selected role */}
      {selectedRole === "TUTOR" ? (
        <TutorSignupForm onPhoneVerification={onPhoneVerification} />
      ) : (
        <StudentSignupForm onPhoneVerification={onPhoneVerification} />
      )}
    </div>
  );
};