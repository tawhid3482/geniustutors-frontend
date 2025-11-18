'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext.next'
import { setAuthToken } from '@/utils/auth'
import { toast } from 'sonner'
import { PhoneVerificationDialog } from './PhoneVerificationDialog'
import tutorDetailsService from '@/services/tutorDetailsService'
import { useRouter } from 'next/navigation'
import { LoginForm } from './LoginForm'
import { StudentSignupForm } from './StudentSignupForm'
import { TutorSignupForm } from './TutorSignupForm'

interface LoginDialogProps {
  children: React.ReactNode
  defaultRole?: 'student' | 'tutor'
}

export const LoginDialog: React.FC<LoginDialogProps> = ({ children, defaultRole = 'student' }) => {
  const [open, setOpen] = useState(false)
  const [defaultTab, setDefaultTab] = useState('login')
  const router = useRouter()
  
  const { redirectToDashboard, user, setUser, setProfile } = useAuth()
  
  // Phone verification state
  const [showPhoneVerification, setShowPhoneVerification] = useState(false)
  const [pendingVerificationPhone, setPendingVerificationPhone] = useState('')
  const [pendingVerificationName, setPendingVerificationName] = useState('')
  // Registration payload to create the account (used by PhoneVerificationDialog)
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null)
  // Tutor-only extra details to submit after account creation (null for students)
  const [pendingTutorData, setPendingTutorData] = useState<any>(null)

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔍 LoginDialog - State changed:', {
      showPhoneVerification,
      pendingVerificationPhone,
      pendingVerificationName,
      pendingRegistrationData, // Changed from pendingUserData
      open
    });
  }, [showPhoneVerification, pendingVerificationPhone, pendingVerificationName, pendingRegistrationData, pendingTutorData, open]);

  // Set the default tab based on the data-auth-type attribute
  useEffect(() => {
    if (children && React.isValidElement(children) && children.props['data-auth-type'] === 'register') {
      setDefaultTab('signup')
    }
  }, [children])

  // Handle phone verification success
  const handlePhoneVerificationSuccess = async (verificationData?: { user: any; token: string }) => {
    try {
      console.log('🔍 LoginDialog - Phone verification success, verification data:', verificationData);
      console.log('📋 LoginDialog - verificationData type:', typeof verificationData);
      console.log('📋 LoginDialog - verificationData keys:', verificationData ? Object.keys(verificationData) : 'N/A');
      console.log('📋 LoginDialog - verificationData.user:', verificationData?.user);
      console.log('📋 LoginDialog - verificationData.token:', verificationData?.token);
      
      if (verificationData?.user && verificationData?.token) {
        // Set the auth token
        setAuthToken(verificationData.token);
        localStorage.setItem('authToken', verificationData.token);
        
        // Set the user in context
        setUser(verificationData.user);
        setProfile(verificationData.user);
        localStorage.setItem('user', JSON.stringify(verificationData.user));
        
        console.log('User and token set in context after phone verification');
        
        // Wait a moment for state to update, then redirect
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
            setOpen(false)
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
    if (!createdUser?.id) {
      throw new Error('Tutor registration completed but user ID not available');
    }

    // Add a small delay to ensure token is properly set
    await new Promise(resolve => setTimeout(resolve, 100));

    // Format the data for tutor details API
    const tutorData = {
      user_id: createdUser.id,
      district: pendingTutorData?.preferredAreas?.[0] || '', // Map first preferredArea to district
      location: pendingTutorData?.preferredAreas?.[0] || '', // Map first preferredArea to location
      qualification: 'Not specified', // Default value
      expectedSalary: '0', // Default value
      availabilityStatus: 'available', // Default value
      daysPerWeek: 0, // Default value
      tutoringStyles: [], // Default empty array
      experience: 'Not specified', // Default value
      placeOfLearning: [], // Default empty array
      extraFacilities: [], // Default empty array
      preferredMedium: [], // Default empty array
      preferredClasses: [], // Default empty array
      preferredSubjects: [], // Default empty array
      preferredTime: [], // Default empty array
      preferredStudentGender: 'any', // Default value
      alternativePhone: pendingTutorData?.alternativePhone,
      universityDetails: {
        name: pendingTutorData?.universityName,
        department: pendingTutorData?.departmentName,
        year: pendingTutorData?.universityYear
      },
      religion: pendingTutorData?.religion,
      nationality: pendingTutorData?.nationality,
      preferredTutoringCategory: [], // Default empty array
      presentLocation: pendingTutorData?.preferredAreas?.[0] || '',
      educationalQualifications: [] // Default empty array
    };
    
    // Debug: Log the data being sent
    console.log('Tutor data being sent:', JSON.stringify(tutorData, null, 2));
    
    // Validate required fields before sending
    const requiredFields = [
      'universityName', 'departmentName', 'preferredAreas'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = pendingTutorData?.[field as keyof typeof pendingTutorData];
      return !value || (Array.isArray(value) && value.length === 0);
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    // Submit tutor details using the service
    const response = await tutorDetailsService.submitTutorDetails(tutorData);
    
    if (!response.success) {
      throw new Error(response.message || 'Failed to register tutor details');
    }
     
    toast.success('Tutor account created successfully! Welcome to TutorConnect!');
    
    // User is already set in context from phone verification
    // Redirect to thank-you for tutor as well
    const userRole = createdUser?.role;
    const userName = createdUser?.name || createdUser?.full_name || '';
    setTimeout(() => {
      router.push(`/thank-you?role=${encodeURIComponent(userRole || '')}&name=${encodeURIComponent(userName)}`);
      setOpen(false);
      setPendingTutorData(null);
      setPendingRegistrationData(null);
    }, 100);
  };

  // Handle phone verification request from forms
  const handlePhoneVerification = (phoneNumber: string, fullName: string, userData?: any) => {
    console.log('🔍 LoginDialog - handlePhoneVerification called');
    console.log('📱 LoginDialog - phoneNumber:', phoneNumber);
    console.log('👤 LoginDialog - fullName:', fullName);
    console.log('📋 LoginDialog - userData:', userData);
    console.log('📋 LoginDialog - userData type:', typeof userData);
    console.log('📋 LoginDialog - userData is null/undefined:', userData == null);
    console.log('📋 LoginDialog - userData keys:', userData ? Object.keys(userData) : 'N/A');
    
    console.log('🔄 LoginDialog - Setting state variables...');
    setPendingVerificationPhone(phoneNumber);
    setPendingVerificationName(fullName);
    // Always store registration payload for account creation in the dialog
    setPendingRegistrationData(userData || null);
    // Only store tutor extra details if role is tutor
    if (userData && userData.role === 'tutor') {
      setPendingTutorData(userData);
    } else {
      setPendingTutorData(null);
    }
    setShowPhoneVerification(true);
    
    console.log('✅ LoginDialog - Phone verification dialog state set');
    console.log('🔍 LoginDialog - Current state after setting:', {
      pendingVerificationPhone: phoneNumber,
      pendingVerificationName: fullName,
      pendingUserData: userData,
      showPhoneVerification: true
    });
  };

  // Handle successful login
  const handleLoginSuccess = () => {
    setOpen(false);
  };

  // Check if the trigger is the register button
  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (open) {
      // Check if the clicked element has the data-auth-type attribute
      const triggerElement = document.activeElement as HTMLElement
      if (triggerElement && triggerElement.getAttribute('data-auth-type') === 'register') {
        setDefaultTab('signup')
      } else {
        setDefaultTab('login')
      }
    }
    // Reset state when dialog closes
    if (!open) {
      setPendingTutorData(null);
      setPendingRegistrationData(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-gradient-to-br from-green-50 via-green-100 to-emerald-50 border-0 shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 via-green-500/5 to-emerald-400/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-400/20 to-transparent rounded-full blur-2xl"></div>
        
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Login And Explore
          </DialogTitle>
          <p className="text-center text-green-600/80 text-sm">Your journey to excellence starts here</p>
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
              defaultRole={defaultRole}
              onPhoneVerification={handlePhoneVerification}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
      
      {/* Email Verification Dialog */}
      <PhoneVerificationDialog
        open={showPhoneVerification}
        onOpenChange={setShowPhoneVerification}
        phoneNumber={pendingVerificationPhone}
        fullName={pendingVerificationName}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        formData={pendingRegistrationData}
      />
    </Dialog>
  )
}

// Component to handle role selection and render appropriate form
const SignupFormContainer: React.FC<{
  defaultRole: 'student' | 'tutor'
  onPhoneVerification: (phoneNumber: string, fullName: string, userData?: any) => void
}> = ({ defaultRole, onPhoneVerification }) => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'tutor'>(defaultRole)

  console.log('🔍 SignupFormContainer - Rendered with:', {
    defaultRole,
    selectedRole,
    onPhoneVerification: typeof onPhoneVerification
  });

  return (
    <div className="space-y-4">
      {/* Role selection */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-green-800">Create a profile as a*</label>
        <div className="flex gap-4">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedRole === 'student'}
                onChange={() => {
                  console.log('🔄 SignupFormContainer - Role changed to: student');
                  setSelectedRole('student');
                }}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                selectedRole === 'student' 
                  ? 'bg-green-500 border-green-500' 
                  : 'bg-white border-green-300 group-hover:border-green-400'
              }`}>
                {selectedRole === 'student' && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Student/Guardian</span>
          </label>
          
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={selectedRole === 'tutor'}
                onChange={() => {
                  console.log('🔄 SignupFormContainer - Role changed to: tutor');
                  setSelectedRole('tutor');
                }}
                className="sr-only"
              />
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                selectedRole === 'tutor' 
                  ? 'bg-green-500 border-green-500' 
                  : 'bg-white border-green-300 group-hover:border-green-400'
              }`}>
                {selectedRole === 'tutor' && (
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Tutor</span>
          </label>
        </div>
      </div>

      {/* Render appropriate form based on selected role */}
      {selectedRole === 'tutor' ? (
        <>
          {console.log('🔍 SignupFormContainer - Rendering TutorSignupForm')}
          <TutorSignupForm 
            onPhoneVerification={onPhoneVerification}
          />
        </>
      ) : (
        <>
          {console.log('🔍 SignupFormContainer - Rendering StudentSignupForm')}
          <StudentSignupForm 
            onPhoneVerification={onPhoneVerification}
          />
        </>
      )}
    </div>
  )
}
