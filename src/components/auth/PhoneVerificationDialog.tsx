'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Phone, Clock, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { phoneVerificationService } from '@/services/phoneVerificationService'

interface PhoneVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  fullName: string
  onVerificationSuccess: (data?: { user: any; token: string }) => void
  onResendOTP?: () => void
  formData?: any // Store form data for account creation after verification
}

export const PhoneVerificationDialog: React.FC<PhoneVerificationDialogProps> = ({
  open,
  onOpenChange,
  phoneNumber,
  fullName,
  onVerificationSuccess,
  onResendOTP,
  formData
}) => {
  const [otpCode, setOtpCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds
  const [isVerified, setIsVerified] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (!open || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open, timeLeft])

  // Reset timer when dialog opens
  useEffect(() => {
    if (open) {
      console.log('🔍 PhoneVerificationDialog - Dialog opened');
      console.log('📋 PhoneVerificationDialog - Props received:', {
        open,
        phoneNumber,
        fullName,
        formData,
        onVerificationSuccess: typeof onVerificationSuccess,
        onOpenChange: typeof onOpenChange
      });
      setTimeLeft(600)
      setOtpCode('')
      setIsVerified(false)
    }
  }, [open, phoneNumber, fullName, formData])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code')
      return
    }

    setLoading(true)
    try {
      console.log('🔍 PhoneVerificationDialog - Starting OTP verification process');
      console.log('📱 PhoneVerificationDialog - phoneNumber:', phoneNumber);
      console.log('🔢 PhoneVerificationDialog - otpCode:', otpCode);
      console.log('📋 PhoneVerificationDialog - formData:', formData);
      console.log('📋 PhoneVerificationDialog - formData type:', typeof formData);
      console.log('📋 PhoneVerificationDialog - formData is null/undefined:', formData == null);
      
      // If form data is provided, create the account (OTP verification is handled in register endpoint)
      if (formData) {
        console.log('✅ Using REGISTER endpoint - New user registration flow');
        console.log('📤 Sending data to /api/auth/register:', {
          ...formData,
          otpCode
        });
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            otpCode // Include OTP in registration data
          }),
        })

        console.log('📥 Register endpoint response status:', response.status);
        console.log('📥 Register endpoint response ok:', response.ok);
        
        const result = await response.json()
        console.log('📥 Register endpoint response data:', result);
        
        if (!response.ok) {
          console.error('❌ Register endpoint failed:', result);
          throw new Error(result.error || 'Failed to create account')
        }

        console.log('✅ Register endpoint success:', result);
        setIsVerified(true)
        toast.success('Phone number verified and account created successfully!')
        
        // Wait a moment to show success state
        setTimeout(() => {
          console.log('🔄 Calling onVerificationSuccess with result:', result);
          // For register endpoint, pass the data in the expected format
          onVerificationSuccess(result.data)
          onOpenChange(false)
        }, 1500)
      } else {
        console.log('⚠️ Using COMPLETE-REGISTRATION endpoint - Existing user flow');
        console.log('📤 Sending data to /api/auth/complete-registration:', {
          phoneNumber,
          otpCode
        });
        
        // If no form data, complete registration directly (OTP verification is handled in the endpoint)
        const response = await fetch('/api/auth/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber,
            otpCode
          }),
        })

        console.log('📥 Complete-registration endpoint response status:', response.status);
        console.log('📥 Complete-registration endpoint response ok:', response.ok);
        
        const result = await response.json()
        console.log('📥 Complete-registration endpoint response data:', result);
        
        if (!response.ok) {
          console.error('❌ Complete-registration endpoint failed:', result);
          throw new Error(result.error || 'Failed to complete registration')
        }

        console.log('✅ Complete-registration endpoint success:', result);
        setIsVerified(true)
        toast.success('Phone number verified successfully!')
        
        // Wait a moment to show success state
        setTimeout(() => {
          console.log('🔄 Calling onVerificationSuccess with result.data:', result.data);
          onVerificationSuccess(result.data)
          onOpenChange(false)
        }, 1500)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    try {
      await phoneVerificationService.resendOTP(phoneNumber, fullName)
      setTimeLeft(600) // Reset timer
      toast.success('OTP resent successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to resend OTP')
    } finally {
      setResendLoading(false)
    }
  }

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6) // Only allow digits, max 6
    setOtpCode(value)
  }

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
            {isVerified ? 'Phone Verified!' : 'Verify Your Phone'}
          </DialogTitle>
          <p className="text-green-600/80 text-sm mt-2">
            {isVerified 
              ? 'Your phone number has been successfully verified!' 
              : `We've sent a verification code to ${phoneNumber}`
            }
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
                <Label htmlFor="otp" className="text-sm font-semibold text-green-800">
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
                {loading ? 'Verifying...' : 'Verify Phone'}
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
                disabled={resendLoading || timeLeft > 540} // Disable if less than 1 minute has passed
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
              <p className="text-green-600 font-medium">
                Redirecting you to complete your registration...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

