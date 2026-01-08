"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Phone,
  KeyRound,
  Lock,
  CheckCircle,
  RotateCw,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  Sparkles,
  Fingerprint,
  Smartphone,
  Mail,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSendOtpMutation } from "@/redux/features/phoneVerification/phoneVerificationApi";
import { useVerifyOtpForForgetPasswordMutation } from "@/redux/features/phoneVerification/phoneVerificationApi";
import { useForgetPasswordMutation } from "@/redux/features/auth/authApi";
import { useAuth } from "@/contexts/AuthContext.next";

type Step = "phone" | "verification" | "newPassword" | "success";

export default function ForgetPasswordPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  if (user) {
    router.push("/");
  }

  const [currentStep, setCurrentStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [animatedStep, setAnimatedStep] = useState(false);

  // RTK Query mutations
  const [sendOtp] = useSendOtpMutation();
  const [verifyOtp] = useVerifyOtpForForgetPasswordMutation();
  const [setNewPasswordMutation] = useForgetPasswordMutation();

  // Animate step transition
  useEffect(() => {
    setAnimatedStep(true);
    const timer = setTimeout(() => setAnimatedStep(false), 300);
    return () => clearTimeout(timer);
  }, [currentStep]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "Invalid Phone Number",
        description:
          "Please enter a valid Bangladeshi phone number (e.g., 017XXXXXXXX)",
        variant: "destructive",
      });
      return;
    }

    setIsSendingOtp(true);
    setLoading(true);

    try {
      await sendOtp({ phone }).unwrap();

      toast({
        title: "OTP Sent Successfully",
        description: `A 6-digit OTP has been sent to ${phone}`,
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200",
      });

      setCurrentStep("verification");
      setCountdown(60);
    } catch (error: any) {
      toast({
        title: "Failed to send OTP",
        description: error?.data?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      });
      return;
    }

    setIsVerifyingOtp(true);
    setLoading(true);

    try {
      await verifyOtp({ phone, otp: verificationCode }).unwrap();

      toast({
        title: "OTP Verified",
        description: "Please set your new password",
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200",
      });

      setCurrentStep("newPassword");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error?.data?.message || "Invalid OTP. Please try again",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingOtp(false);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    setLoading(true);

    const data = {
      phone,
      newPassword,
    };

    try {
      await setNewPasswordMutation({ data }).unwrap();

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully",
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200",
      });

      setCurrentStep("success");

      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description:
          error?.data?.message || "Failed to reset password. Please try again",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsResendingOtp(true);

    try {
      await sendOtp({ phone }).unwrap();
      setCountdown(300);

      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your phone",
        className:
          "bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200",
      });
    } catch (error: any) {
      toast({
        title: "Failed to resend OTP",
        description: error?.data?.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen w-full mx-auto bg-gradient-to-br from-gray-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating geometric shapes */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-green-400/10 to-emerald-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-tr from-blue-400/10 to-cyan-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>

        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-green-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full relative mx-auto px-4 py-12">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="absolute top-6 left-6 group"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>

        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-500 bg-clip-text text-transparent mb-3">
            Secure Password Reset
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Follow these simple steps to securely reset your account password
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className=" flex flex-wrap items-center justify-center ">
            {["phone", "verification", "newPassword", "success"].map(
              (step, index) => (
                <div key={step} className="flex items-center">
                  <div className="relative">
                    <div
                      className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-500 ${
                        currentStep === step
                          ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-110 shadow-lg shadow-green-500/30"
                          : index <
                            [
                              "phone",
                              "verification",
                              "newPassword",
                              "success",
                            ].indexOf(currentStep)
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-md"
                          : "bg-white border-2 border-gray-200"
                      }`}
                    >
                      {step === "phone" && (
                        <Phone
                          className={`w-6 h-6 ${
                            currentStep === step ||
                            index <
                              [
                                "phone",
                                "verification",
                                "newPassword",
                                "success",
                              ].indexOf(currentStep)
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                      {step === "verification" && (
                        <KeyRound
                          className={`w-6 h-6 ${
                            currentStep === step ||
                            index <
                              [
                                "phone",
                                "verification",
                                "newPassword",
                                "success",
                              ].indexOf(currentStep)
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                      {step === "newPassword" && (
                        <Lock
                          className={`w-6 h-6 ${
                            currentStep === step ||
                            index <
                              [
                                "phone",
                                "verification",
                                "newPassword",
                                "success",
                              ].indexOf(currentStep)
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                      {step === "success" && (
                        <CheckCircle
                          className={`w-6 h-6 ${
                            currentStep === step ||
                            index <
                              [
                                "phone",
                                "verification",
                                "newPassword",
                                "success",
                              ].indexOf(currentStep)
                              ? "text-white"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                      <span
                        className={`text-xs mt-1 ${
                          currentStep === step ||
                          index <
                            [
                              "phone",
                              "verification",
                              "newPassword",
                              "success",
                            ].indexOf(currentStep)
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      >
                        Step {index + 1}
                      </span>
                    </div>

                    {currentStep === step && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {index < 3 && (
                    <div
                      className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-all duration-500 ${
                        index <
                        [
                          "phone",
                          "verification",
                          "newPassword",
                          "success",
                        ].indexOf(currentStep)
                          ? "bg-gradient-to-r from-emerald-400 to-green-400"
                          : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </div>
              )
            )}
          </div>

          <div className="flex justify-between mt-4 text-sm text-gray-600 max-w-3xl mx-auto">
            <span className="text-center">Enter Phone</span>
            <span className="text-center">Verify OTP</span>
            <span className="text-center">New Password</span>
            <span className="text-center">Complete</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-md mx-auto">
          <Card
            className={`border-0 shadow-2xl shadow-green-500/10 bg-white/80 backdrop-blur-sm overflow-hidden transition-all duration-300 ${
              animatedStep ? "scale-105" : ""
            }`}
          >
            {/* Card Header Gradient */}
            <div className="h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500"></div>

            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                {currentStep === "phone" && "Enter Your Phone Number"}
                {currentStep === "verification" && "Verify Your Identity"}
                {currentStep === "newPassword" && "Create New Password"}
                {currentStep === "success" && "Success!"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {currentStep === "phone" &&
                  "We'll send a verification code to your registered phone"}
                {currentStep === "verification" &&
                  `Enter the 6-digit code sent to ${phone}`}
                {currentStep === "newPassword" &&
                  "Create a strong new password for your account"}
                {currentStep === "success" &&
                  "Your password has been reset successfully"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {currentStep === "phone" && (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <div className="flex items-center">
                          <Smartphone className="w-4 h-4 mr-2 text-green-600" />
                          Phone Number
                        </div>
                      </Label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                          <div className="text-green-700 font-bold">+88</div>
                          <Fingerprint className="w-4 h-4 text-green-600" />
                        </div>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="17XXXXXXXX"
                          className="pl-24 pr-4 h-12 text-lg bg-white/50 border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-xl transition-all duration-300"
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 11)
                            )
                          }
                          disabled={loading}
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Shield className="w-3 h-3 mr-1" />
                        Your phone number is only used for verification
                      </p>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
                    disabled={loading || phone.length !== 11}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      {isSendingOtp ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send OTP
                          <Sparkles className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </form>
              )}

              {currentStep === "verification" && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Label
                        htmlFor="verificationCode"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        <div className="flex items-center">
                          <KeyRound className="w-4 h-4 mr-2 text-blue-600" />
                          6-Digit Verification Code
                        </div>
                      </Label>
                      <div className="relative">
                        <Input
                          id="verificationCode"
                          type="text"
                          placeholder="• • • • • •"
                          className="pl-12 pr-4 h-14 text-2xl font-mono tracking-widest text-center bg-white/50 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl transition-all duration-300"
                          value={verificationCode}
                          onChange={(e) => {
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6);
                            setVerificationCode(value);
                          }}
                          disabled={loading}
                          required
                        />
                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full animate-pulse ${
                              countdown > 30
                                ? "bg-green-500"
                                : countdown > 10
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                          ></div>
                          <span className="text-sm text-gray-600">
                            {countdown > 0
                              ? `Code expires in ${countdown}s`
                              : "Code expired"}
                          </span>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleResendOtp}
                          disabled={countdown > 0 || isResendingOtp}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                        >
                          {isResendingOtp ? (
                            <div className="flex items-center">
                              <RotateCw className="h-3 w-3 mr-1 animate-spin" />
                              Resending...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <RotateCw className="h-3 w-3 mr-1" />
                              Resend OTP
                            </div>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                      onClick={() => setCurrentStep("phone")}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                      disabled={loading || verificationCode.length !== 6}
                    >
                      {isVerifyingOtp ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Verifying...
                        </div>
                      ) : (
                        "Verify & Continue"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {currentStep === "newPassword" && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <Label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-purple-600" />
                          New Password
                        </div>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          className="pl-12 pr-12 h-12 bg-white/50 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>

                      {/* Password Strength Meter */}
                      <div className="space-y-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              newPassword.length >= 12
                                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                : newPassword.length >= 8
                                ? "bg-gradient-to-r from-green-400 to-green-300"
                                : newPassword.length >= 6
                                ? "bg-gradient-to-r from-yellow-400 to-yellow-300"
                                : "bg-gradient-to-r from-red-400 to-red-300"
                            }`}
                            style={{
                              width: `${Math.min(
                                newPassword.length * 8.33,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Weak</span>
                          <span>Medium</span>
                          <span>Strong</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="confirmPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-purple-600" />
                          Confirm Password
                        </div>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          className="pl-12 pr-12 h-12 bg-white/50 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-xl transition-all duration-300"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>

                      {newPassword && confirmPassword && (
                        <div
                          className={`flex items-center space-x-2 p-3 rounded-lg ${
                            newPassword === confirmPassword &&
                            newPassword.length >= 6
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              newPassword === confirmPassword &&
                              newPassword.length >= 6
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {newPassword === confirmPassword &&
                            newPassword.length >= 6 ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              newPassword === confirmPassword &&
                              newPassword.length >= 6
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {newPassword === confirmPassword &&
                            newPassword.length >= 6
                              ? "✓ Passwords match"
                              : "Passwords do not match"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all duration-300"
                      onClick={() => setCurrentStep("verification")}
                      disabled={loading}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                      disabled={
                        loading ||
                        newPassword.length < 6 ||
                        newPassword !== confirmPassword
                      }
                    >
                      {isResettingPassword ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                          Resetting...
                        </div>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {currentStep === "success" && (
                <div className="text-center py-6 space-y-6">
                  <div className="relative inline-block">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-12 h-12 text-green-600 animate-bounce" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-ping"></div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-800">
                      Password Reset Successful!
                    </h3>
                    <p className="text-gray-600">
                      Your password has been reset successfully. You will be
                      redirected to the login page shortly.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-300"></div>
                      <span className="text-sm text-gray-600">
                        Redirecting in 3 seconds...
                      </span>
                    </div>

                    <Button
                      onClick={() => router.push("/login")}
                      className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="border-t border-gray-100 pt-6">
              <div className="w-full text-center">
                <p className="text-sm text-gray-500">
                  Need help?{" "}
                  <Button
                    variant="link"
                    className="text-green-600 hover:text-green-700 p-0 h-auto font-medium"
                    onClick={() => router.push("/contact")}
                  >
                    Contact Support
                  </Button>
                </p>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Security Info */}
        <div className="max-w-2xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Secure Process</h4>
                <p className="text-xs text-gray-600">End-to-end encrypted</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">OTP Protected</h4>
                <p className="text-xs text-gray-600">Time-based verification</p>
              </div>
            </div>
          </div>

          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">Instant Support</h4>
                <p className="text-xs text-gray-600">
                  24/7 assistance available
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.6;
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
