'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { useCheckPhoneNumberMutation, useCreateStudentOrGuardianMutation } from '@/redux/features/auth/authApi'
import { useResendOtpMutation, useSendOtpMutation, useVerifyOtpMutation } from '@/redux/features/phoneVerification/phoneVerificationApi'

interface StudentSignupFormProps {
  onPhoneVerification: (phoneNumber: string, fullName: string, formData?: any) => void
  onSuccess?: () => void
}

export const StudentSignupForm: React.FC<StudentSignupFormProps> = ({ 
  onPhoneVerification, 
  onSuccess 
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    gender: ''
  })

  // RTK Query mutations
  const [checkPhoneNumber] = useCheckPhoneNumberMutation()
  const [sendOTP] = useSendOtpMutation()


  // Check if phone number already exists using RTK Query - FIXED
  const handleCheckPhoneExists = async (phone: string) => {
    try {
      const result = await checkPhoneNumber({ phone }).unwrap()
      console.log('📞 Phone check response:', result)
      
      // Check if phone exists based on API response
      if (result.success && result.data && result.data.exists === true) {
        console.log('❌ Phone number already exists')
        return true
      }
      
      console.log('✅ Phone number is available')
      return false
    } catch (error: any) {
      console.error('Error checking phone:', error)
      
      // If there's an error in the API call, check the error response
      if (error?.data?.data?.exists === true) {
        return true
      }
      
      // Default to false if there's any uncertainty
      return false
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!signupForm.phone || !signupForm.password || !signupForm.fullName || !signupForm.gender) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate password match
    if (signupForm.password !== signupForm.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Validate password length
    if (signupForm.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    // Validate phone number format (Bangladeshi phone number)
    const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/
    if (!phoneRegex.test(signupForm.phone)) {
      toast.error('Please enter a valid Bangladeshi phone number')
      return
    }

    setLoading(true)
    
    try {
      // Check if phone number already exists using RTK Query
      console.log('🔍 Checking if phone number exists...')
      const phoneExists = await handleCheckPhoneExists(signupForm.phone)
      
      
      if (phoneExists) {
        throw new Error('An account with this phone number already exists. Please use a different phone number or try logging in.')
      }

      // Prepare form data for student registration
      const formData = {
        email: signupForm.email || undefined,
        password: signupForm.password,
        fullName: signupForm.fullName,
        role: 'STUDENT_GUARDIAN',
        phone: signupForm.phone,
        gender: signupForm.gender
      }

      console.log('📋 StudentSignupForm - Form data prepared:', formData)
      
      // Send OTP for phone verification ONLY if phone doesn't exist
      console.log('📱 Sending OTP for phone verification...')
        await sendOTP({ 
        phone: signupForm.phone, 
        name: signupForm.fullName 
      }).unwrap()


      onPhoneVerification(signupForm.phone, signupForm.fullName, formData)
      
    } catch (error: any) {
      console.error('❌ Error in student registration:', error)
      
      // Handle specific error messages from API
      if (error?.data?.message) {
        toast.error(error.data.message)
      } else if (error.message) {
        toast.error(error.message)
      } else {
        toast.error('Signup failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {/* Horizontal layout for common fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-sm font-semibold text-green-800">Full Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={signupForm.fullName}
              onChange={(e) => setSignupForm(prev => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-semibold text-green-800">Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="Enter your phone number"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={signupForm.phone}
              onChange={(e) => setSignupForm(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="signupEmail" className="text-sm font-semibold text-green-800">Email (Optional)</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="signupEmail"
              name="email"
              type="email"
              placeholder="Enter your email address (optional)"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={signupForm.email}
              onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
        </div>

        {/* Gender - Required for all users */}
        <div className="space-y-2">
          <Label htmlFor="studentGender" className="text-sm font-semibold text-green-800">Gender *</Label>
          <Select 
            value={signupForm.gender} 
            onValueChange={(value: string) => setSignupForm(prev => ({ ...prev, gender: value }))}
          >
            <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Password fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="signupPassword" className="text-sm font-semibold text-green-800">Password *</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="signupPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={signupForm.password}
              onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-semibold text-green-800">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={signupForm.confirmPassword}
            onChange={(e) => setSignupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.01] transition-all duration-300 text-sm" 
        disabled={loading}
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  )
}