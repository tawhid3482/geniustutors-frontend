'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react'
import { phoneVerificationService } from '@/services/phoneVerificationService'
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from '@/data/bangladeshDistricts'
import { MultiSelect } from '@/components/ui/multi-select'
import { PhoneVerificationDialog } from '@/components/auth/PhoneVerificationDialog'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext.next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'
import { LoginDialog } from '@/components/auth/LoginDialog'
import { Navbar } from '@/components/layout/Navbar'

export default function TutorSignupPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showVerificationDialog, setShowVerificationDialog] = useState(false)
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null)
  const [pendingTutorData, setPendingTutorData] = useState<any>(null)

  // Extract all thanas from the districts data
  const getAllThanas = () => {
    const allThanas: string[] = []
    BANGLADESH_DISTRICTS_WITH_POST_OFFICES.forEach(district => {
      district.areas.forEach(area => {
        if (!allThanas.includes(area.name)) {
          allThanas.push(area.name)
        }
      })
    })
    return allThanas.sort()
  }

  // Simplified tutor registration form data
  const [tutorFormData, setTutorFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternativePhone: '',
    universityName: '',
    departmentName: '',
    universityYear: '',
    preferredAreas: [] as string[],
    background: [] as string[],
    gender: '',
    religion: '',
    nationality: 'Bangladeshi',
    password: '',
    confirmPassword: ''
  })

  // Helper functions for tutor registration
  const handleTutorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTutorFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTutorSelectChange = (name: string, value: string) => {
    setTutorFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferredAreasChange = (areas: string[]) => {
    setTutorFormData(prev => ({ ...prev, preferredAreas: areas }));
  };

  const handleBackgroundChange = (backgrounds: string[]) => {
    setTutorFormData(prev => ({ ...prev, background: backgrounds }));
  };

  // State for categories from database
  const [categories, setCategories] = useState<{id: number, name: string, description: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories from database
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch categories on component mount
  React.useEffect(() => {
    fetchCategories();
  }, []);

  // Check if phone already exists
  const checkPhoneExists = async (phone: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/api/auth/check-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      
      const data = await res.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking phone:', error);
      return false;
    }
  };

  // Handle phone verification success
  const handlePhoneVerificationSuccess = async (verificationData?: { user: any; token: string }) => {
    try {
      console.log('🔍 TutorSignupPage - Phone verification success, verification data:', verificationData);

      if (verificationData && verificationData.user && verificationData.token) {
        // Set user and token in context
        setUser(verificationData.user);
        localStorage.setItem('token', verificationData.token);
        
        console.log('User and token set in context after phone verification');
        
        // Wait a moment for state to update, then handle tutor details submission
        setTimeout(() => {
          const createdUser = verificationData.user;
          const userRole = createdUser?.role;
          const userName = createdUser?.name || createdUser?.full_name || '';

          // If tutor extra details exist, submit them; otherwise skip
          if (pendingTutorData) {
            console.log('Continuing with tutor details submission...');
            handleTutorDetailsSubmission(createdUser);
          } else {
            console.log('Registration complete (non-tutor extra details), redirecting to thank-you...');
            toast.success('Account created successfully! Phone verified!')
            // Redirect all roles to thank-you
            router.push(`/thank-you?role=${encodeURIComponent(userRole || '')}&name=${encodeURIComponent(userName)}`);
          }
        }, 100);
      } else {
        console.error('No user data or token available for redirection');
        toast.error('Failed to complete registration - missing user data');
      }
    } catch (error: any) {
      console.error('Error after phone verification:', error);
      toast.error(error.message || 'Failed to complete registration');
    }
  };

  // Extract tutor details submission logic
  const handleTutorDetailsSubmission = async (createdUser: any) => {
    try {
      console.log('🔍 Submitting tutor details for user:', createdUser);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const tutorDetailsPayload = {
        user_id: createdUser.id,
        alternative_phone: pendingTutorData.alternativePhone || null,
        university_name: pendingTutorData.universityName || null,
        department_name: pendingTutorData.departmentName || null,
        university_year: pendingTutorData.universityYear || null,
        preferred_areas: pendingTutorData.preferredAreas || [],
        religion: pendingTutorData.religion || null,
        nationality: pendingTutorData.nationality || 'Bangladeshi',
        background: pendingTutorData.background || []
      };

      console.log('📤 Sending tutor details to /api/tutor-details/simple:', tutorDetailsPayload);

      const tutorDetailsResponse = await fetch('/api/tutor-details/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tutorDetailsPayload)
      });

      console.log('📥 Tutor details response status:', tutorDetailsResponse.status);

      if (!tutorDetailsResponse.ok) {
        const errorData = await tutorDetailsResponse.json();
        console.error('❌ Tutor details submission failed:', errorData);
        throw new Error(errorData.error || 'Failed to save tutor details');
      }

      const tutorDetailsResult = await tutorDetailsResponse.json();
      console.log('✅ Tutor details submission success:', tutorDetailsResult);

      toast.success('Tutor profile created successfully!');
      
      // Redirect to thank-you page
      const userRole = createdUser?.role;
      const userName = createdUser?.name || createdUser?.full_name || '';
      router.push(`/thank-you?role=${encodeURIComponent(userRole || '')}&name=${encodeURIComponent(userName)}`);
    } catch (error: any) {
      console.error('Error submitting tutor details:', error);
      toast.error(error.message || 'Failed to complete tutor profile');
      
      // Still redirect but show error
      const userRole = createdUser?.role;
      const userName = createdUser?.name || createdUser?.full_name || '';
      router.push(`/thank-you?role=${encodeURIComponent(userRole || '')}&name=${encodeURIComponent(userName)}`);
    }
  };

  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!tutorFormData.fullName || !tutorFormData.phone || 
        !tutorFormData.universityName || !tutorFormData.departmentName || 
        tutorFormData.preferredAreas.length === 0 || !tutorFormData.gender || 
        !tutorFormData.password || !tutorFormData.confirmPassword) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (tutorFormData.password !== tutorFormData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (tutorFormData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate phone number format (Bangladeshi phone number)
    const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!phoneRegex.test(tutorFormData.phone)) {
      toast.error('Please enter a valid Bangladeshi phone number');
      return;
    }
    
    setLoading(true);
    try {
      // Check if phone number already exists
      const phoneExists = await checkPhoneExists(tutorFormData.phone);
      if (phoneExists) {
        throw new Error('An account with this phone number already exists. Please use a different phone number or try logging in.');
      }

      // Send OTP for phone verification first
      console.log('Sending OTP for tutor phone verification...');
      await phoneVerificationService.sendOTP(tutorFormData.phone, tutorFormData.fullName);
      
      // Build registration payload expected by backend and include tutor extra details
      const registrationPayload = {
        // Required for account creation
        email: tutorFormData.email || null,
        password: tutorFormData.password,
        full_name: tutorFormData.fullName,
        role: 'tutor' as const,
        phone: tutorFormData.phone,
        gender: tutorFormData.gender,
        
        // Tutor extra details to submit after account creation
        alternativePhone: tutorFormData.alternativePhone,
        universityName: tutorFormData.universityName,
        departmentName: tutorFormData.departmentName,
        universityYear: tutorFormData.universityYear,
        preferredAreas: tutorFormData.preferredAreas,
        religion: tutorFormData.religion,
        nationality: tutorFormData.nationality,
        background: tutorFormData.background
      };

      console.log('🔍 TutorSignupPage - Registration payload prepared:', registrationPayload);
      
      // Store pending data and show verification dialog
      setPendingRegistrationData(registrationPayload);
      setPendingTutorData({
        alternativePhone: tutorFormData.alternativePhone,
        universityName: tutorFormData.universityName,
        departmentName: tutorFormData.departmentName,
        universityYear: tutorFormData.universityYear,
        preferredAreas: tutorFormData.preferredAreas,
        religion: tutorFormData.religion,
        nationality: tutorFormData.nationality,
        background: tutorFormData.background
      });
      
      setShowVerificationDialog(true);
      console.log('✅ TutorSignupPage - Phone verification dialog should now be visible for tutor');
      setLoading(false);
      return; // Don't proceed until phone is verified
    } catch (error: any) {
      console.error('Error in tutor registration:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-none px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <Navbar 
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />

      {/* Main Content - Centered */}
      <div className="flex-1 flex items-center justify-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-green-100">
          {/* Title */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              Become a Tutor
            </h1>
            <p className="text-green-600/80 text-xs sm:text-sm">
              Join our platform and start teaching students
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleTutorSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Full Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tutorFullName" className="text-xs sm:text-sm font-semibold text-green-800">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-green-600" />
                  <Input
                    id="tutorFullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    className="pl-10 h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                    value={tutorFormData.fullName}
                    onChange={handleTutorChange}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tutorEmail" className="text-xs sm:text-sm font-semibold text-green-800">Email Address (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-green-600" />
                  <Input
                    id="tutorEmail"
                    name="email"
                    type="email"
                    placeholder="Enter your email address (optional)"
                    className="pl-10 h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                    value={tutorFormData.email}
                    onChange={handleTutorChange}
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tutorPhone" className="text-xs sm:text-sm font-semibold text-green-800">Mobile Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-green-600" />
                  <Input
                    id="tutorPhone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your mobile number"
                    className="pl-10 h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                    value={tutorFormData.phone}
                    onChange={handleTutorChange}
                    required
                  />
                </div>
              </div>

              {/* Alternative Number */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="alternativePhone" className="text-xs sm:text-sm font-semibold text-green-800">Alternative Number</Label>
                <Input
                  id="alternativePhone"
                  name="alternativePhone"
                  type="tel"
                  placeholder="Alternative contact number"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.alternativePhone}
                  onChange={handleTutorChange}
                />
              </div>

              {/* University Name */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="universityName" className="text-xs sm:text-sm font-semibold text-green-800">Institute Name *</Label>
                <Input
                  id="universityName"
                  name="universityName"
                  type="text"
                  placeholder="Your university/college name"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.universityName}
                  onChange={handleTutorChange}
                  required
                />
              </div>

              {/* Department */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="departmentName" className="text-xs sm:text-sm font-semibold text-green-800">Department *</Label>
                <Input
                  id="departmentName"
                  name="departmentName"
                  type="text"
                  placeholder="Your department"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.departmentName}
                  onChange={handleTutorChange}
                  required
                />
              </div>

              {/* Year */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="universityYear" className="text-xs sm:text-sm font-semibold text-green-800">Year</Label>
                <Input
                  id="universityYear"
                  name="universityYear"
                  type="text"
                  placeholder="e.g., 2nd year, Final year"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.universityYear}
                  onChange={handleTutorChange}
                />
              </div>

              {/* Preferred Areas */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="preferredAreas" className="text-xs sm:text-sm font-semibold text-green-800">Preferred Areas *</Label>
                <MultiSelect
                  value={tutorFormData.preferredAreas}
                  onValueChange={handlePreferredAreasChange}
                  placeholder="Select preferred areas"
                  options={getAllThanas().map((thana) => ({
                    value: thana,
                    label: thana
                  }))}
                  maxSelections={5}
                  className="!h-10 sm:!h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tutorGender" className="text-xs sm:text-sm font-semibold text-green-800">Gender *</Label>
                <Select 
                  value={tutorFormData.gender} 
                  onValueChange={(value) => handleTutorSelectChange('gender', value)}
                >
                  <SelectTrigger className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Religion */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="religion" className="text-xs sm:text-sm font-semibold text-green-800">Religion</Label>
                <Input
                  id="religion"
                  name="religion"
                  type="text"
                  placeholder="Your religion"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.religion}
                  onChange={handleTutorChange}
                />
              </div>

              {/* Nationality */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="nationality" className="text-xs sm:text-sm font-semibold text-green-800">Nationality</Label>
                <Input
                  id="nationality"
                  name="nationality"
                  type="text"
                  placeholder="Your nationality"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.nationality}
                  onChange={handleTutorChange}
                />
              </div>

              {/* Background */}
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="background" className="text-xs sm:text-sm font-semibold text-green-800">Background</Label>
                <MultiSelect
                  value={tutorFormData.background}
                  onValueChange={handleBackgroundChange}
                  placeholder="Select Categories"
                  options={categories.map((category) => ({
                    value: category.name,
                    label: category.name
                  }))}
                  maxSelections={3}
                  className="!h-10 sm:!h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tutorPassword" className="text-xs sm:text-sm font-semibold text-green-800">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-green-600" />
                  <Input
                    id="tutorPassword"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pl-10 pr-10 h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                    value={tutorFormData.password}
                    onChange={handleTutorChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-2 sm:px-3 hover:bg-transparent text-green-600 hover:text-green-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="tutorConfirmPassword" className="text-xs sm:text-sm font-semibold text-green-800">Confirm Password *</Label>
                <Input
                  id="tutorConfirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  className="h-10 sm:h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                  value={tutorFormData.confirmPassword}
                  onChange={handleTutorChange}
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 sm:py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base" 
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </Button>

            {/* Login Link */}
            <div className="text-center mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-green-600/80">
                Already have an account?{' '}
                <LoginDialog>
                  <button className="font-semibold text-green-600 hover:text-green-700 transition-colors underline">
                    Login here
                  </button>
                </LoginDialog>
              </p>
            </div>
          </form>
        </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0">
        <Footer />
      </div>

      {/* Phone Verification Dialog */}
      <PhoneVerificationDialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
        phoneNumber={tutorFormData.phone}
        fullName={tutorFormData.fullName}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        formData={pendingRegistrationData}
      />
    </div>
  )
}

