import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Phone, Lock, KeyRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";

interface ForgotPasswordProps {
  children: React.ReactNode;
}

type ForgotPasswordStep = 'phone' | 'verification' | 'newPassword';

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ children }) => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>('phone');
  const { resetPassword, verifyResetCode } = useAuth();

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const data = await resetPassword(phone);
      toast.success('Password reset code sent! Please check your phone.');
      setCurrentStep('verification');
      // For development, show the reset token in console
      if (data && 'resetToken' in data) {
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }
    
    // Store the verification code for the next step
    setCurrentStep('newPassword');
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      // Call the verify reset code API with the verification code and new password
      await verifyResetCode(phone, verificationCode, newPassword);
      toast.success('Password has been reset successfully!');
      setOpen(false);
      
      // Reset the form
      setPhone('');
      setVerificationCode('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentStep('phone');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Reset Your Password
          </DialogTitle>
          {currentStep === 'phone' && (
            <p className="text-center text-green-600/80 text-sm">Enter your phone number to receive reset instructions</p>
          )}
          {currentStep === 'verification' && (
            <p className="text-center text-green-600/80 text-sm">Enter the verification code sent to your phone</p>
          )}
          {currentStep === 'newPassword' && (
            <p className="text-center text-green-600/80 text-sm">Create a new password for your account</p>
          )}
        </DialogHeader>
        
        {currentStep === 'phone' && (
          <form onSubmit={handleSendResetCode} className="space-y-6 py-4 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold text-green-800">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 h-4 w-4" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="pl-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-sm text-green-600/80">
                We'll send you a code to reset your password.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>
          </form>
        )}
        
        {currentStep === 'verification' && (
          <form onSubmit={handleVerifyCode} className="space-y-6 py-4 relative z-10">
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="text-sm font-semibold text-green-800">
                Verification Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 h-4 w-4" />
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  className="pl-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <p className="text-sm text-green-600/80">
                Enter the 6-digit code sent to your phone.
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1 border-green-200 hover:border-green-300 text-green-700 font-semibold py-3 rounded-xl transition-all duration-300"
                onClick={() => setCurrentStep('phone')}
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                disabled={loading}
              >
                Verify Code
              </Button>
            </div>
          </form>
        )}
        
        {currentStep === 'newPassword' && (
          <form onSubmit={handleResetPassword} className="space-y-6 py-4 relative z-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold text-green-800">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 h-4 w-4" />
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="pl-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-green-800">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="pl-10 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <p className="text-sm text-green-600/80">
                  Password must be at least 6 characters long.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline"
                className="flex-1 border-green-200 hover:border-green-300 text-green-700 font-semibold py-3 rounded-xl transition-all duration-300"
                onClick={() => setCurrentStep('verification')}
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
