// Student Dashboard Custom Hook

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext.next';
import { MOCK_TUTORS } from '@/data/mockData';
import { ALL_DISTRICTS, getAreasByDistrict } from '@/data/bangladeshDistricts';
import { tutorRequestService, TutorRequestFormData, TutorRequest } from '@/services/tutorRequestService';
import { profileService, ProfileUpdateData, PasswordChangeData, PaymentMethodData, PaymentMethod } from '@/services/profileService';
import tutorService, { Tutor as DBTutor } from '@/services/tutorService';
import { getMyEnrollments, type CourseEnrollment } from '@/services/courseService';
import {
  Tutor,
  Booking,
  SessionItem,
  ReviewItem,
  TicketItem,
  NewReview,
  NewTicket,
  PayDialogState,
  PaymentMethod as PaymentMethodType,
  ViewMode,
  FilterGender,
  TutorRequestFormData as OldTutorRequestFormData,
} from '@/types/student';


export function useStudentDashboard() {
  const { toast } = useToast();
  const { signOut, user } = useAuth();

  // Shared state
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Local UI state for navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Analytics counters
  const [requestsPostedCount, setRequestsPostedCount] = useState<number>(0);
  const [tutorRequestedCount, setTutorRequestedCount] = useState<number>(0);

  // Request state
  const [reqSubject, setReqSubject] = useState<string>('Mathematics');
  const [reqClass, setReqClass] = useState<string>('Class 8');
  const [reqTime, setReqTime] = useState<string>('Evening (6-8 PM)');
  const [reqLocation, setReqLocation] = useState<string>('Dhanmondi');
  const [reqBudget, setReqBudget] = useState<number>(5000);
  const [matchedTutors, setMatchedTutors] = useState<Tutor[]>([]);

  // Enhanced Tutor Request state
  const [requestStep, setRequestStep] = useState<number>(1);
  const [postedRequests, setPostedRequests] = useState<TutorRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(false);

  const [isDeletingRequest, setIsDeletingRequest] = useState<string | null>(null);

  // Course enrollments state
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState<boolean>(false);

  const [tutorRequestForm, setTutorRequestForm] = useState<any>({
    phoneNumber: user?.phone || '',
    numberOfStudents: 1,
    studentGender: 'male',
    district: '',
    area: '',
    detailedLocation: '',
    // category: '',
    selectedCategories: [],
    selectedSubjects: [],
    selectedClasses: [],
    medium: 'English Medium',
    studentClass: '',
    subject: '',
    tutoringType: 'Home Tutoring',
    tutorGenderPreference: 'any',
    tutoringDays: 5,
    tutoringTime: '',
    tutoringDuration: '',
    // salary: '',
    isSalaryNegotiable: false,
    salaryRange: {
      min: 3000,
      max: 8000,
    },
    extraInformation: '',
  });

  // Load posted requests from API on component mount
  useEffect(() => {
    loadPostedRequests();
  }, []);

  // Load course enrollments when user is available
  useEffect(() => {
    if (user) {
      loadCourseEnrollments();
    }
  }, [user]);

  const loadPostedRequests = async () => {
 
    
    setIsLoadingRequests(true);
    try {
      const response = await tutorRequestService.getStudentTutorRequests();
      
     
      
      if (response.success) {
        setPostedRequests(response.data);
        // Update the requests count based on actual data
        const count = response.data.length;
        setRequestsPostedCount(count);
      } else {
        console.warn('Response not successful:', response);
        setPostedRequests([]);
        setRequestsPostedCount(0);
      }
    } catch (error) {
      console.error('=== ERROR IN USE STUDENT DASHBOARD HOOK ===');
      console.error('Error:', error);
      console.error('==========================================');
      
      toast({ 
        title: 'Error', 
        description: 'Failed to load posted requests', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const loadCourseEnrollments = async () => {
    if (!user) return;
    
    setIsLoadingEnrollments(true);
    try {
      const enrollmentsData = await getMyEnrollments();
      // getMyEnrollments now returns {enrollments: CourseEnrollment[]}
      const safeEnrollments = enrollmentsData?.enrollments || [];
      setEnrollments(safeEnrollments);
    } catch (error) {
      console.error('Error loading course enrollments:', error);
      // Set empty array on error to prevent undefined issues
      setEnrollments([]);
      toast({ 
        title: 'Error', 
        description: 'Failed to load course enrollments', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  // Function to refresh posted requests
  const refreshPostedRequests = () => {
    loadPostedRequests();
  };



  // Function to delete tutor request
  const deleteTutorRequest = async (requestId: string) => {
    setIsDeletingRequest(requestId);
    try {
      const response = await tutorRequestService.deleteTutorRequest(requestId);
      if (response.success) {
        // Refresh the requests to get updated data
        await loadPostedRequests();
        toast({
          title: 'Request Deleted',
          description: 'Tutor request has been deleted successfully',
        });
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsDeletingRequest(null);
    }
  };

  // Function to populate form for editing
  const populateFormForEdit = (request: TutorRequest) => {
    setTutorRequestForm({
      phoneNumber: request.phoneNumber,
      studentGender: request.studentGender,
      district: request.district,
      area: request.area,
      detailedLocation: request.detailedLocation,
      // category: request.category,
      selectedCategories: request.selectedCategories || [],
      selectedSubjects: request.selectedSubjects || [],
      selectedClasses: request.selectedClasses || [],
      tutorGenderPreference: request.tutorGenderPreference,
      // salary: request.salary,
      isSalaryNegotiable: request.isSalaryNegotiable,
      salaryRange: request.salaryRange,
      extraInformation: request.extraInformation,
      medium: request.medium || 'English',
      numberOfStudents: request.numberOfStudents || 1,
      tutoringDays: request.tutoringDays || 5,
      tutoringTime: request.tutoringTime || '',
      tutoringDuration: request.tutoringDuration || '2:00',
      tutoringType: request.tutoringType || 'Home Tutoring',
    });
    setRequestStep(1);
  };

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('any');
  const [filterArea, setFilterArea] = useState<string>('');
  const [filterGender, setFilterGender] = useState<FilterGender>('any');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoadingTutors, setIsLoadingTutors] = useState<boolean>(false);

  // Booking & Payments state
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'b1',
      tutorId: 't1',
      tutorName: 'Ayesha Rahman',
      subject: 'Mathematics',
      type: 'Recurring',
      schedule: 'Mon & Wed 7:00-8:00 PM',
      status: 'Pending',
      amount: 3200,
    },
  ]);
  const [payDialog, setPayDialog] = useState<PayDialogState>({ open: false });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('');

  // Sessions state
  const [sessions, setSessions] = useState<SessionItem[]>([
    {
      id: 's1',
      tutorName: 'Ayesha Rahman',
      subject: 'Mathematics',
      datetime: '2025-08-15 19:00',
      status: 'Upcoming',
      notesUrl: '#',
    },
  ]);

  // Reviews state
  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'r1',
      tutorName: 'Nayeem Hasan',
      subject: 'Physics',
      rating: 5,
      text: 'Great explanation and patience.',
      date: '2025-08-01',
    },
  ]);
  const [newReview, setNewReview] = useState<NewReview>({
    tutorName: '',
    subject: '',
    rating: 5,
    text: '',
  });

  // Support state
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [newTicket, setNewTicket] = useState<NewTicket>({
    subject: '',
    category: 'Other',
    description: '',
  });

  // Profile state
  const [profile, setProfile] = useState({
    id: 'student-1',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@email.com',
    phone: '+880 1712-345678',
    avatar: '/avatars/student-1.jpg',
    dateOfBirth: '2008-05-15',
    district: 'Dhaka',
    location: 'Dhanmondi, Dhaka',
    preferredSubjects: ['Mathematics', 'Physics'],
    preferredClassLevels: ['Class 8', 'Class 9'],
    preferredTimeSlots: ['Evening (6-8 PM)', 'Afternoon (2-5 PM)'],
    preferredBudget: 5000,
    notificationPreferences: {
      email: true,
      sms: false,
      push: true,
    },
    privacySettings: {
      profileVisible: true,
      contactInfoVisible: false,
      bookingHistoryVisible: true,
    },
  });

  // Payment methods state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);

  // Load payment methods on component mount
  useEffect(() => {
    if (user?.id) {
      loadPaymentMethods();
    }
  }, [user?.id]);

  // Load profile from backend when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const res = await profileService.getProfile(user.id);
        if (res.success) {
          const db = res.data;
          const nextProfile = {
            id: db.id,
            name: db.full_name || '',
            email: db.email || '',
            phone: db.phone || '',
            avatar: db.avatar_url || '',
            dateOfBirth: '',
            district: db.district || '',
            location: db.location || '',
            preferredSubjects: [],
            preferredClassLevels: [],
            preferredTimeSlots: [],
            preferredBudget: 0,
            notificationPreferences: {
              email: true,
              sms: false,
              push: true,
            },
            privacySettings: {
              profileVisible: true,
              contactInfoVisible: false,
              bookingHistoryVisible: true,
            },
          };
          setProfile(nextProfile);
        }
      } catch (error) {
        console.error('Load profile error:', error);
      }
    };
    loadProfile();
  }, [user?.id]);

  const loadPaymentMethods = async () => {
    if (!user?.id) return;
    
    setIsLoadingPaymentMethods(true);
    try {
      const response = await profileService.getPaymentMethods(user.id);
      if (response.success) {
        setPaymentMethods(response.data);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load payment methods', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingPaymentMethods(false);
    }
  };

  // Profile management functions
  const handleProfileUpdate = async (updatedProfile: any) => {
    if (!user?.id) return;

    try {
      const profileData: ProfileUpdateData = {
        full_name: updatedProfile.name,
        phone: updatedProfile.phone,
        location: updatedProfile.location,
        avatar_url: updatedProfile.avatar,
        email: updatedProfile.email,
        district: updatedProfile.district,
      };

      const response = await profileService.updateProfile(user.id, profileData);
      
      if (response.success) {
        setProfile(updatedProfile);
        // persist to localStorage so reload reflects new values used by AuthContext
        try {
          const saved = localStorage.getItem('user');
          if (saved) {
            const parsed = JSON.parse(saved);
            const merged = {
              ...parsed,
              full_name: profileData.full_name ?? parsed.full_name,
              phone: profileData.phone ?? parsed.phone,
              location: profileData.location ?? parsed.location,
              avatar_url: profileData.avatar_url ?? parsed.avatar_url,
              email: profileData.email ?? parsed.email,
              district: profileData.district ?? parsed.district,
            };
            localStorage.setItem('user', JSON.stringify(merged));
          }
        } catch {}
        toast({ title: 'Profile updated', description: 'Your profile has been successfully updated.' });
      }
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to update profile';
      toast({ 
        title: 'Error', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    }
  };

  const handlePasswordChange = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (!user?.id) return;

    if (newPassword !== confirmPassword) {
      toast({ 
        title: 'Error', 
        description: 'New passwords do not match', 
        variant: 'destructive' 
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({ 
        title: 'Error', 
        description: 'New password must be at least 6 characters long', 
        variant: 'destructive' 
      });
      return;
    }

    try {
      const passwordData: PasswordChangeData = {
        currentPassword,
        newPassword,
      };

      const response = await profileService.changePassword(user.id, passwordData);
      
      if (response.success) {
        toast({ title: 'Password updated', description: 'Your password has been successfully updated.' });
        return true;
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to change password. Please try again.', 
        variant: 'destructive' 
      });
    }
    return false;
  };

  const handleAddPaymentMethod = async (paymentData: PaymentMethodData) => {
    if (!user?.id) return;

    try {
      const response = await profileService.addPaymentMethod(user.id, paymentData);
      
      if (response.success) {
        await loadPaymentMethods(); // Refresh payment methods
        toast({ title: 'Payment method added', description: 'Payment method has been successfully added.' });
        return true;
      }
    } catch (error: any) {
      console.error('Add payment method error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add payment method. Please try again.', 
        variant: 'destructive' 
      });
    }
    return false;
  };

  const handleUpdatePaymentMethod = async (methodId: string, paymentData: PaymentMethodData) => {
    if (!user?.id) return;

    try {
      const response = await profileService.updatePaymentMethod(user.id, methodId, paymentData);
      
      if (response.success) {
        await loadPaymentMethods(); // Refresh payment methods
        toast({ title: 'Payment method updated', description: 'Payment method has been successfully updated.' });
        return true;
      }
    } catch (error: any) {
      console.error('Update payment method error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update payment method. Please try again.', 
        variant: 'destructive' 
      });
    }
    return false;
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    if (!user?.id) return;

    try {
      const response = await profileService.deletePaymentMethod(user.id, methodId);
      
      if (response.success) {
        await loadPaymentMethods(); // Refresh payment methods
        toast({ title: 'Payment method deleted', description: 'Payment method has been successfully deleted.' });
        return true;
      }
    } catch (error: any) {
      console.error('Delete payment method error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete payment method. Please try again.', 
        variant: 'destructive' 
      });
    }
    return false;
  };

  const handleSetDefaultPaymentMethod = async (methodId: string) => {
    if (!user?.id) return;

    try {
      const response = await profileService.setDefaultPaymentMethod(user.id, methodId);
      
      if (response.success) {
        await loadPaymentMethods(); // Refresh payment methods
        toast({ title: 'Default updated', description: 'Default payment method has been updated.' });
        return true;
      }
    } catch (error: any) {
      console.error('Set default payment method error:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to set default payment method. Please try again.', 
        variant: 'destructive' 
      });
    }
    return false;
  };

  // Load tutors from database on component mount
  useEffect(() => {
    loadTutors();
  }, []);

  const loadTutors = async () => {
    setIsLoadingTutors(true);
    try {
      const response = await tutorService.getAllTutors();
      if (response.success) {
        // Transform DB tutors to match the Tutor type used in the component
        const transformedTutors: Tutor[] = response.data.map((dbTutor: DBTutor) => ({
          id: dbTutor.id,
          name: dbTutor.full_name,
          subject: dbTutor.subjects 
            ? (Array.isArray(dbTutor.subjects) 
                ? dbTutor.subjects[0] 
                : dbTutor.subjects.split(',')[0]
              ) 
            : 'General',
          area: dbTutor.location || '',
          gender: 'Male', // Default value as gender might not be available in DB
          rating: dbTutor.rating || 0,
          hourlyRate: dbTutor.hourly_rate || 0,
          qualifications: dbTutor.education || 'Not specified',
          experience: dbTutor.experience || '',
          avatar: dbTutor.avatar_url || '/placeholder.svg',
          verified: true,
          availability: ['Weekdays', 'Weekends'],
        }));
        setTutors(transformedTutors);
      }
    } catch (error) {
      console.error('Error loading tutors:', error);
      toast({ 
        title: 'Error', 
        description: 'Failed to load tutors', 
        variant: 'destructive' 
      });
    } finally {
      setIsLoadingTutors(false);
    }
  };

  const filteredTutors = useMemo(() => {
    return tutors.filter((t) => {
      const matchQuery = searchQuery
        ? t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.area.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchSubject = filterSubject !== 'any' ? t.subject === filterSubject : true;
      const matchArea = filterArea ? t.area.toLowerCase().includes(filterArea.toLowerCase()) : true;
      // Convert filterGender to the correct type if it's 'any'
      const genderFilter = filterGender === 'any' ? null : filterGender as 'Male' | 'Female' | 'Other';
      const matchGender = genderFilter ? t.gender === genderFilter : true;
      const matchRating = t.rating >= filterRating;
      return matchQuery && matchSubject && matchArea && matchGender && matchRating;
    });
  }, [tutors, searchQuery, filterSubject, filterArea, filterGender, filterRating]);

  function toggleFavorite(tutorId: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(tutorId)) {
        next.delete(tutorId);
      } else {
        next.add(tutorId);
      }
      return next;
    });
  }

  function handleSubmitRequest() {
    const areaToken = reqLocation.trim().toLowerCase();
    const suggestions = tutors.filter((t) =>
      t.subject === reqSubject && t.area.toLowerCase().includes(areaToken)
    );
    setMatchedTutors(suggestions);
    setRequestsPostedCount((c) => c + 1);
    toast({ title: 'Request submitted', description: 'We matched tutors based on your preferences.' });
  }

  function handleSubmitRequestWithoutToast() {
    const areaToken = reqLocation.trim().toLowerCase();
    const suggestions = tutors.filter((t) =>
      t.subject === reqSubject && t.area.toLowerCase().includes(areaToken)
    );
    setMatchedTutors(suggestions);
    setRequestsPostedCount((c) => c + 1);
  }

  // Enhanced Tutor Request functions
  function updateTutorRequestForm(field: keyof TutorRequestFormData, value: any) {
    setTutorRequestForm((prev:any) => ({
      ...prev,
      [field]: value
    }));
  }

  function nextStep() {
    if (requestStep < 4) {
      setRequestStep(requestStep + 1);
    }
  }

  function prevStep() {
    if (requestStep > 1) {
      setRequestStep(requestStep - 1);
    }
  }

  function getAvailableAreas(): string[] {
    if (!tutorRequestForm.district) return [];
    return getAreasByDistrict(tutorRequestForm.district);
  }

  function submitTutorRequest() {
    const newRequest: TutorRequest = {
      id: `req-${Date.now()}`,
      ...tutorRequestForm,
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      matchedTutors: [],
    };

    // Find matched tutors based on criteria
    const matchedTutors = tutors.filter((tutor) => {
      // Check if any of the tutor's subjects match any of the selected subjects
      const subjectMatch = (tutorRequestForm.selectedSubjects || []).some((subject:any) => 
        tutor.subject.toLowerCase().includes(subject.toLowerCase()));
      const areaMatch = tutor.area.toLowerCase().includes(tutorRequestForm.area.toLowerCase());
      const genderMatch = tutorRequestForm.tutorGenderPreference.toLowerCase() === 'any' || 
        tutor.gender.toLowerCase() === tutorRequestForm.tutorGenderPreference.toLowerCase();
      // // const budgetMatch = tutorRequestForm.salary ? 
      //   parseFloat(tutor.hourlyRate.toString()) <= parseFloat(tutorRequestForm.salary) : true;
      
      // return subjectMatch && areaMatch && genderMatch && budgetMatch;
    });

    // Convert Tutor[] to TutorAssignment[] format
    const tutorAssignments = matchedTutors.map((tutor) => ({
      id: `assignment-${Date.now()}-${tutor.id}`,
      tutor_request_id: newRequest.id,
      tutor_id: tutor.id,
      tutor_name: tutor.name,
      tutor_email: '', // Not available in Tutor interface
      tutor_phone: '', // Not available in Tutor interface
      tutor_avatar: null, // Not available in Tutor interface
      qualification: tutor.qualifications,
      experience: null, // Not available in Tutor interface
      status: 'pending' as const,
      assigned_by: user?.id || '',
      assigned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: null
    }));

    newRequest.matchedTutors = tutorAssignments;
    
    setPostedRequests(prev => [newRequest, ...prev]);
    setRequestsPostedCount(prev => prev + 1);
    setRequestStep(1);
    setTutorRequestForm({
      phoneNumber: '',
      studentGender: 'male',
      district: '',
      area: '',
      detailedLocation: '',
      // category: '',
      selectedCategories: [],
      selectedSubjects: [],
      selectedClasses: [],
      tutorGenderPreference: 'any',
      // salary: '',
      isSalaryNegotiable: false,
      salaryRange: {
        min: 3000,
        max: 8000,
      },
      extraInformation: '',
      medium: 'English Medium',
      numberOfStudents: 1,
      tutoringDays: 5,
      tutoringTime: '',
      tutoringDuration: '2:00',
      tutoringType: 'Home Tutoring',
    });
    
    toast({
      title: 'Request Submitted Successfully!',
      description: `Your tutor request has been posted. ${matchedTutors.length} tutors matched your criteria.`,
    });
  }

  // New API-based submitTutorRequest function
  const submitTutorRequestAPI = async () => {
    try {
      const response = await tutorRequestService.createTutorRequest(tutorRequestForm);
      
      if (response.success) {
        // Find matched tutors based on criteria
        const matchedTutors = tutors.filter((tutor) => {
          // Check if any of the tutor's subjects match any of the selected subjects
          const subjectMatch = (tutorRequestForm.selectedSubjects || []).some((subject:any) => 
            tutor.subject.toLowerCase().includes(subject.toLowerCase()));
          const areaMatch = tutor.area.toLowerCase().includes(tutorRequestForm.area.toLowerCase());
          const genderMatch = tutorRequestForm.tutorGenderPreference.toLowerCase() === 'any' || 
            tutor.gender.toLowerCase() === tutorRequestForm.tutorGenderPreference.toLowerCase();
          // const budgetMatch = tutorRequestForm.salary ? 
            // parseFloat(tutor.hourlyRate.toString()) <= parseFloat(tutorRequestForm.salary) : true;
          
          // return subjectMatch && areaMatch && genderMatch && budgetMatch;
        });

        // Refresh posted requests to get the latest data from database
        await loadPostedRequests();
        
        setRequestStep(1);
        
        // Reset form
        setTutorRequestForm({
          phoneNumber: '',
          studentGender: 'male',
          district: '',
          area: '',
          detailedLocation: '',
          // category: '',
          selectedCategories: [],
          selectedSubjects: [],
          selectedClasses: [],
          tutorGenderPreference: 'any',
          // salary: '',
          isSalaryNegotiable: false,
          salaryRange: {
            min: 3000,
            max: 8000,
          },
          extraInformation: '',
          medium: 'English Medium',
          numberOfStudents: 1,
          tutoringDays: 5,
          tutoringTime: '',
          tutoringDuration: '2:00',
          tutoringType: 'Home Tutoring',
        });
        
        toast({
          title: 'Request Submitted Successfully!',
          description: `Your tutor request has been posted. ${matchedTutors.length} tutors matched your criteria.`,
        });
      }
    } catch (error) {
      console.error('Error submitting tutor request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit tutor request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  function inviteDemo(tutor: Tutor) {
    const demo: SessionItem = {
      id: `demo-${Date.now()}`,
      tutorName: tutor.name,
      subject: tutor.subject,
      datetime: '2025-08-20 19:00',
      status: 'Upcoming',
    };
    setSessions((prev) => [demo, ...prev]);
    setTutorRequestedCount((c) => c + 1);
    toast({ title: 'Demo invited', description: `${tutor.name} has been invited for a demo class.` });
  }

  function bookSession(tutor: Tutor, type: Booking['type']) {
    const booking: Booking = {
      id: `bk-${Date.now()}`,
      tutorId: tutor.id,
      tutorName: tutor.name,
      subject: tutor.subject,
      type,
      schedule: type === 'Recurring' ? 'Weekly, Tue 7-8 PM' : '2025-08-22 19:00',
      status: 'Pending',
      amount: tutor.hourlyRate,
    };
    setBookings((prev) => [booking, ...prev]);
    toast({ title: 'Booking created', description: `${tutor.name} booked (${type}).` });
  }

  function payForBooking(bookingId: string) {
    if (!paymentMethod) {
      toast({ title: 'Select payment method', description: 'Choose bKash, Nagad, Card, or Wallet.' });
      return;
    }
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: 'Paid' } : b)));
    setPayDialog({ open: false, bookingId: undefined });
    setPaymentMethod('');
    toast({ title: 'Payment successful', description: 'Your payment is confirmed.' });
  }

  function downloadInvoice(booking: Booking) {
    const invoice = `Invoice\nID: ${booking.id}\nTutor: ${booking.tutorName}\nSubject: ${booking.subject}\nType: ${booking.type}\nSchedule: ${booking.schedule}\nAmount: ${booking.amount} BDT\nStatus: ${booking.status}`;
    const blob = new Blob([invoice], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${booking.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function toggleAttendance(id: string, status: 'Attended' | 'Missed') {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function submitReview() {
    if (!newReview.tutorName || !newReview.subject || !newReview.text) {
      toast({ title: 'Missing fields', description: 'Fill tutor, subject, and review text.' });
      return;
    }
    const review: ReviewItem = {
      id: `rv-${Date.now()}`,
      tutorName: newReview.tutorName,
      subject: newReview.subject,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toISOString().slice(0, 10),
    };
    setReviews((prev) => [review, ...prev]);
    setNewReview({ tutorName: '', subject: '', rating: 5, text: '' });
    toast({ title: 'Review submitted', description: 'Thanks for your feedback!' });
  }

  function submitTicket() {
    if (!newTicket.subject || !newTicket.description) {
      toast({ title: 'Missing fields', description: 'Fill subject and description.' });
      return;
    }
    const ticket: TicketItem = {
      id: `tk-${Date.now()}`,
      subject: newTicket.subject,
      category: newTicket.category,
      description: newTicket.description,
      status: 'Open',
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) => [ticket, ...prev]);
    setNewTicket({ subject: '', category: 'Other', description: '' });
    toast({ title: 'Ticket opened', description: 'Support will contact you shortly.' });
  }

  // Derived analytics
  const tutorAssignedCount = bookings.length;
  const tutorConfirmedCount = sessions.filter((s) => s.status === 'Upcoming').length;
  const paymentsProcessedCount = bookings.filter((b) => b.status === 'Paid').length;

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Logged out', description: 'You have been successfully logged out.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to logout. Please try again.', variant: 'destructive' });
    }
  };

  return {
    // State
    favorites,
    activeTab,
    reqSubject,
    reqClass,
    reqTime,
    reqLocation,
    reqBudget,
    matchedTutors,
    searchQuery,
    filterSubject,
    filterArea,
    filterGender,
    filterRating,
    viewMode,
    bookings,
    payDialog,
    paymentMethod,
    sessions,
    reviews,
    newReview,
    tickets,
    newTicket,
    profile,
    filteredTutors,
    // Enhanced Tutor Request state
    requestStep,
    postedRequests,
    tutorRequestForm,
    isLoadingRequests,

    isDeletingRequest,
    // Analytics
    requestsPostedCount,
    tutorRequestedCount,
    tutorAssignedCount,
    tutorConfirmedCount,
    paymentsProcessedCount,
    // Actions
    setActiveTab,
    setReqSubject,
    setReqClass,
    setReqTime,
    setReqLocation,
    setReqBudget,
    setSearchQuery,
    setFilterSubject,
    setFilterArea,
    setFilterGender,
    setFilterRating,
    setViewMode,
    setPayDialog,
    setPaymentMethod,
    setNewReview,
    setNewTicket,
    // Enhanced Tutor Request actions
    updateTutorRequestForm,
    nextStep,
    prevStep,
    getAvailableAreas,
    submitTutorRequest: submitTutorRequestAPI, // Use the API-based function
    refreshPostedRequests,

    deleteTutorRequest,
    populateFormForEdit, // Add the new function here
    // Functions
    toggleFavorite,
    handleSubmitRequest,
    handleSubmitRequestWithoutToast,
    inviteDemo,
    bookSession,
    payForBooking,
    downloadInvoice,
    toggleAttendance,
    submitReview,
    submitTicket,
    handleLogout,
    // Profile management
    paymentMethods,
    isLoadingPaymentMethods,
    handleProfileUpdate,
    handlePasswordChange,
    handleAddPaymentMethod,
    handleUpdatePaymentMethod,
    handleDeletePaymentMethod,
    handleSetDefaultPaymentMethod,
    // Course enrollments
    enrollments,
    isLoadingEnrollments,
  };
}

export default useStudentDashboard;
