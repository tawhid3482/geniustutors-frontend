// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import {
//   Phone,
//   Clock,
//   RefreshCw,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import {
//   useResendOtpMutation,
//   useVerifyOtpMutation,
// } from "@/redux/features/phoneVerification/phoneVerificationApi";
// import { useCreateStudentOrGuardianMutation } from "@/redux/features/auth/authApi";
// import { Router } from "next/router";
// import { useRouter } from "next/navigation";

// interface PhoneVerificationDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   phoneNumber: string;
//   fullName: string;
//   onVerificationSuccess: (data?: { user: any; token: string }) => void;
//   onResendOTP?: () => void;
//   formData?: any; // Store form data for account creation after verification
// }

// export const PhoneVerificationDialog: React.FC<
//   PhoneVerificationDialogProps
// > = ({
//   open,
//   onOpenChange,
//   phoneNumber,
//   fullName,
//   onVerificationSuccess,
//   onResendOTP,
//   formData,
// }) => {
//   const [otpCode, setOtpCode] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [resendLoading, setResendLoading] = useState(false);
//   const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds (backend-এ 5 minutes)
//   const [isVerified, setIsVerified] = useState(false);

//   const [verifyOtp] = useVerifyOtpMutation();
//   const [resendOtp] = useResendOtpMutation();
//   const [createStudentOrGuardian] = useCreateStudentOrGuardianMutation();
// const router = useRouter()
//   // Timer countdown
//   useEffect(() => {
//     if (!open || timeLeft <= 0) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [open, timeLeft]);

//   // Reset timer when dialog opens
//   useEffect(() => {
//     if (open) {
//       console.log("📋 PhoneVerificationDialog - Props received:", {
//         open,
//         phoneNumber,
//         fullName,
//         formData,
//         onVerificationSuccess: typeof onVerificationSuccess,
//         onOpenChange: typeof onOpenChange,
//       });
//       setTimeLeft(300); // 5 minutes (backend-এ 5 minutes)
//       setOtpCode("");
//       setIsVerified(false);
//     }
//   }, [open, phoneNumber, fullName, formData]);

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
//   };

//   // OTP Verification Handler - Backend structure অনুযায়ী
//   const handleVerifyOTP = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!otpCode || otpCode.length !== 6) {
//       toast.error("Please enter a valid 6-digit OTP code");
//       return;
//     }

//     setLoading(true);
//     try {
//       const verifyResult = await verifyOtp({
//         phone: phoneNumber,
//         otp: otpCode,
//       }).unwrap();

//       if (!verifyResult.success) {
//         throw new Error(verifyResult.message || "OTP verification failed");
//       }

//       // If OTP verification successful and form data exists, create account
//       if (formData) {
//         // Use RTK Query mutation to create student/guardian (OTP already verified)
//         const createResult = await createStudentOrGuardian(formData).unwrap();
//         if (createResult.success) {
//           setIsVerified(true);
//           toast.success(
//             "Phone number verified and account created successfully!"
//           );
//           router.push('/')

//           // Wait a moment to show success state
//           setTimeout(() => {
//             onVerificationSuccess(createResult.data);
//             onOpenChange(false);
//           }, 1500);
//         } else {
//           throw new Error(createResult.message || "Failed to create account");
//         }
//       } else {
//         setIsVerified(true);
//         toast.success("Phone number verified successfully!");

//         // Wait a moment to show success state
//         setTimeout(() => {
//           onVerificationSuccess(verifyResult.data);
//           onOpenChange(false);
//         }, 1500);
//       }
//     } catch (error: any) {
//       // Handle specific error messages from API
//       if (error?.data?.message) {
//         toast.error(error.data.message);
//       } else if (error.message) {
//         toast.error(error.message);
//       } else {
//         toast.error("Failed to verify OTP. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Resend OTP Handler - Backend structure অনুযায়ী
//   const handleResendOTP = async () => {
//     setResendLoading(true);
//     try {
//       const result = await resendOtp({
//         phone: phoneNumber,
//       }).unwrap();

//       if (result.success) {
//         setTimeLeft(300);
//         toast.success("OTP resent successfully!");

//         if (onResendOTP) {
//           onResendOTP();
//         }
//       } else {
//         throw new Error(result.message || "Failed to resend OTP");
//       }
//     } catch (error: any) {
//       console.error("❌ Error resending OTP:", error);

//       if (error?.data?.message) {
//         toast.error(error.data.message);
//       } else if (error.message) {
//         toast.error(error.message);
//       } else {
//         toast.error("Failed to resend OTP. Please try again.");
//       }
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/\D/g, "").slice(0, 6); // Only allow digits, max 6
//     setOtpCode(value);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden">
//         {/* Decorative background elements */}
//         <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
//         <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
//         <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>

//         <DialogHeader className="relative z-10 text-center">
//           <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
//             {isVerified ? (
//               <CheckCircle className="w-8 h-8 text-white" />
//             ) : (
//               <Phone className="w-8 h-8 text-white" />
//             )}
//           </div>
//           <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent">
//             {isVerified ? "Phone Verified!" : "Verify Your Phone"}
//           </DialogTitle>
//           <p className="text-green-600/80 text-sm mt-2">
//             {isVerified
//               ? "Your phone number has been successfully verified!"
//               : `We've sent a verification code to ${phoneNumber}`}
//           </p>
//         </DialogHeader>

//         {!isVerified && (
//           <div className="relative z-10 space-y-6">
//             {/* Timer */}
//             <div className="flex items-center justify-center space-x-2 text-sm">
//               <Clock className="w-4 h-4 text-green-600" />
//               <span className="text-green-700 font-medium">
//                 Code expires in: {formatTime(timeLeft)}
//               </span>
//             </div>

//             {/* OTP Input Form */}
//             <form onSubmit={handleVerifyOTP} className="space-y-4">
//               <div className="space-y-2">
//                 <Label
//                   htmlFor="otp"
//                   className="text-sm font-semibold text-green-800"
//                 >
//                   Enter Verification Code
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="otp"
//                     type="text"
//                     placeholder="000000"
//                     value={otpCode}
//                     onChange={handleOTPChange}
//                     className="h-12 text-center text-2xl font-mono tracking-widest bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
//                     maxLength={6}
//                     disabled={loading || timeLeft === 0}
//                   />
//                 </div>
//                 <p className="text-xs text-green-600/70 text-center">
//                   Enter the 6-digit code sent to your phone
//                 </p>
//               </div>

//               <Button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
//                 disabled={loading || otpCode.length !== 6 || timeLeft === 0}
//               >
//                 {loading ? (
//                   <>
//                     <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                     Verifying...
//                   </>
//                 ) : (
//                   "Verify Phone"
//                 )}
//               </Button>
//             </form>

//             {/* Resend OTP */}
//             <div className="text-center">
//               <p className="text-sm text-green-600/70 mb-3">
//                 Didn't receive the code?
//               </p>
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleResendOTP}
//                 disabled={resendLoading || timeLeft > 240} // Disable if less than 1 minute has passed (5 minutes total)
//                 className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-400"
//               >
//                 {resendLoading ? (
//                   <>
//                     <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
//                     Sending...
//                   </>
//                 ) : (
//                   <>
//                     <RefreshCw className="w-4 h-4 mr-2" />
//                     Resend Code
//                   </>
//                 )}
//               </Button>
//             </div>

//             {/* Warning for expired code */}
//             {timeLeft === 0 && (
//               <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
//                 <AlertCircle className="w-5 h-5 text-amber-600" />
//                 <p className="text-sm text-amber-700">
//                   Verification code has expired. Please request a new one.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {isVerified && (
//           <div className="relative z-10 text-center py-4">
//             <div className="animate-pulse">
//               <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
//               <p className="text-green-600 font-medium">
//                 {formData
//                   ? "Account created successfully!"
//                   : "Phone verified successfully!"}
//               </p>
//               <p className="text-green-500 text-sm mt-1">Redirecting you...</p>
//             </div>
//           </div>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// };


"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Phone,
  Clock,
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/redux/features/phoneVerification/phoneVerificationApi";
import { useCreateStudentOrGuardianMutation } from "@/redux/features/auth/authApi";
import { useRouter } from "next/navigation";

interface PhoneVerificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: string;
  fullName: string;
  onVerificationSuccess: (data?: { user: any; token: string }) => void;
  onResendOTP?: () => void;
  formData?: any;
}

export const PhoneVerificationDialog: React.FC<
  PhoneVerificationDialogProps
> = ({
  open,
  onOpenChange,
  phoneNumber,
  fullName,
  onVerificationSuccess,
  onResendOTP,
  formData,
}) => {
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const [isVerified, setIsVerified] = useState(false);

  const [verifyOtp] = useVerifyOtpMutation();
  const [resendOtp] = useResendOtpMutation();
  const [createStudentOrGuardian] = useCreateStudentOrGuardianMutation();
  const router = useRouter();

  // Timer countdown
  useEffect(() => {
    if (!open || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, timeLeft]);

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      setTimeLeft(300);
      setOtpCode("");
      setIsVerified(false);
    }
  }, [open, phoneNumber, fullName, formData]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // OTP Verification Handler
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP code");
      return;
    }

    setLoading(true);
    try {
      console.log("🔐 Verifying OTP...");
      
      // First verify OTP
      const verifyResult = await verifyOtp({
        phone: phoneNumber,
        otp: otpCode,
      }).unwrap();

      if (!verifyResult.success) {
        throw new Error(verifyResult.message || "OTP verification failed");
      }

      console.log("✅ OTP verified successfully");

      // If form data exists, create account after OTP verification
      if (formData) {
        console.log("📝 Creating account with form data:", formData);
        
        const createResult = await createStudentOrGuardian(formData).unwrap();
        
        if (createResult.success) {
          console.log("✅ Account created successfully:", createResult.data);
          
          setIsVerified(true);
          toast.success("Phone number verified and account created successfully!");

          // Wait a moment to show success state
          setTimeout(() => {
            // Pass the user and token data to parent component
            onVerificationSuccess({
              user: createResult.data.user,
              token: createResult.data.token
            });
            onOpenChange(false);
          }, 1500);
        } else {
          throw new Error(createResult.message || "Failed to create account");
        }
      } else {
        // If no form data, just complete OTP verification
        setIsVerified(true);
        toast.success("Phone number verified successfully!");

        setTimeout(() => {
          onVerificationSuccess(verifyResult.data);
          onOpenChange(false);
        }, 1500);
      }
    } catch (error: any) {
      console.error("❌ Error in OTP verification:", error);
      
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP Handler
  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const result = await resendOtp({
        phone: phoneNumber,
      }).unwrap();

      if (result.success) {
        setTimeLeft(300);
        toast.success("OTP resent successfully!");

        if (onResendOTP) {
          onResendOTP();
        }
      } else {
        throw new Error(result.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      console.error("❌ Error resending OTP:", error);

      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to resend OTP. Please try again.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtpCode(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>

        <DialogHeader className="relative z-10 text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            {isVerified ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Phone className="w-8 h-8 text-white" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent">
            {isVerified ? "Phone Verified!" : "Verify Your Phone"}
          </DialogTitle>
          <p className="text-green-600/80 text-sm mt-2">
            {isVerified
              ? "Your phone number has been successfully verified!"
              : `We've sent a verification code to ${phoneNumber}`}
          </p>
        </DialogHeader>

        {!isVerified && (
          <div className="relative z-10 space-y-6">
            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Code expires in: {formatTime(timeLeft)}
              </span>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className="text-sm font-semibold text-green-800"
                >
                  Enter Verification Code
                </Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otpCode}
                    onChange={handleOTPChange}
                    className="h-12 text-center text-2xl font-mono tracking-widest bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    maxLength={6}
                    disabled={loading || timeLeft === 0}
                  />
                </div>
                <p className="text-xs text-green-600/70 text-center">
                  Enter the 6-digit code sent to your phone
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                disabled={loading || otpCode.length !== 6 || timeLeft === 0}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Phone"
                )}
              </Button>
            </form>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-sm text-green-600/70 mb-3">
                Didn't receive the code?
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendOTP}
                disabled={resendLoading || timeLeft > 240}
                className="border-green-300 text-green-700 hover:bg-green-50 hover:text-green-800 hover:border-green-400"
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>

            {/* Warning for expired code */}
            {timeLeft === 0 && (
              <div className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-700">
                  Verification code has expired. Please request a new one.
                </p>
              </div>
            )}
          </div>
        )}

        {isVerified && (
          <div className="relative z-10 text-center py-4">
            <div className="animate-pulse">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-600 font-medium">
                {formData
                  ? "Account created successfully!"
                  : "Phone verified successfully!"}
              </p>
              <p className="text-green-500 text-sm mt-1">Redirecting you...</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};