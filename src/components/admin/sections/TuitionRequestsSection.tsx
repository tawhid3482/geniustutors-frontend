'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast, useToast } from "@/components/ui/use-toast";
import { Eye, Filter, Search, CheckCircle, XCircle, MoreHorizontal, UserPlus, Users, Trash2, MapPin, Star, Clock, BookOpen, GraduationCap, Phone, Mail, RefreshCw, AlertCircle, User } from "lucide-react";
import { tutorRequestService, TutorAssignment, UpdateNoticeHistory } from '@/services/tutorRequestService';
import tutorService from '@/services/tutorService';
import { Textarea } from '@/components/ui/textarea';
import { taxonomyService, Category } from '@/services/taxonomyService';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from '@/data/bangladeshDistricts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useRole } from "@/contexts/RoleContext";

interface TuitionRequest {
  id: string;
  studentId?: string;
  title?: string;
  studentName: string;
  studentFullName?: string;
  studentPhone?: string;
  studentEmail?: string;
  numberOfStudents?: number;
  studentGender?: string;
  district: string;
  area: string;
  postOffice?: string;
  locationDetails?: string;
  medium?: string;
  subject: string;
  studentClass: string;
  category?: string;
  tutoringType: string;
  preferredTeacherGender?: string;
  daysPerWeek?: number;
  tutoringTime?: string;
  salaryRange: {
    min: number;
    max: number;
  };
  budget?: string;
  experienceRequired?: string;
  availability?: string;
  extraInformation?: string;
  adminNote?: string;
  updateNotice?: string;
  updateNoticeBy?: string;
  updateNoticeByName?: string;
  updateNoticeAt?: string;
  status: 'Active' | 'Inactive' | 'Completed' | 'Assign';
  urgent?: boolean;
  createdAt: string;
  updatedAt: string;
  matchedTutors: TutorAssignment[];
  submittedFromTutorId?: string;
  referringTutorName?: string;
  referringTutorEmail?: string;
}

// Use the imported Tutor interface from tutorService
type LocalTutor = import('@/services/tutorService').Tutor;

interface TutorFilter {
  subject?: string;
  district?: string;
  minRating?: number;
  maxPrice?: number;
  gender?: string;
  education?: string;
  availability?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface RealTimeConfig {
  enabled: boolean;
  interval: number;
  lastUpdate: Date;
}

export function TuitionRequestsSection() {
  const { toast } = useToast();
  const { user } = useRole();
  const [requests, setRequests] = useState<TuitionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<TuitionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [referralFilter, setReferralFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<TuitionRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAssignTutorModal, setShowAssignTutorModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [tutors, setTutors] = useState<LocalTutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<LocalTutor[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [createDemoClass, setCreateDemoClass] = useState(false);
  const [demoDate, setDemoDate] = useState('');
  const [demoDuration, setDemoDuration] = useState(30);
  const [demoNotes, setDemoNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [assignerNames, setAssignerNames] = useState<Record<string, string>>({});
  const [showAssignerDialog, setShowAssignerDialog] = useState(false);
  const [assignerDetails, setAssignerDetails] = useState<any | null>(null);
  const [updateNoticeAuthorName, setUpdateNoticeAuthorName] = useState<string | null>(null);
  const [updateNoticeHistory, setUpdateNoticeHistory] = useState<UpdateNoticeHistory[]>([]);
  const [isLoadingUpdateHistory, setIsLoadingUpdateHistory] = useState(false);

  // Check if current user can delete requests (only admins can delete)
  const canDeleteRequests = () => {
    return user?.role === 'admin';
  };
  const [assignments, setAssignments] = useState<TutorAssignment[]>([]);
  const [editFormData, setEditFormData] = useState<Partial<TuitionRequest>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  
  // Real-time functionality
  const [realTimeConfig, setRealTimeConfig] = useState<RealTimeConfig>({
    enabled: true,
    interval: 30000, // 30 seconds
    lastUpdate: new Date()
  });
  const realTimeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Enhanced tutor assignment
  const [tutorFilters, setTutorFilters] = useState<TutorFilter>({});
  const [isLoadingTutors, setIsLoadingTutors] = useState(false);
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<LocalTutor | null>(null);
  const [showTutorDetails, setShowTutorDetails] = useState(false);
  const [assignmentTab, setAssignmentTab] = useState<'all' | 'matched' | 'nearby'>('all');
  const [tutorSearchTerm, setTutorSearchTerm] = useState('');
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [sendSMSNotification, setSendSMSNotification] = useState(true);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setIsLoadingCategories(true);
    try {
      const taxonomyData = await taxonomyService.getTaxonomyData();
      setCategories(taxonomyData.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCategories(false);
    }
  }, [toast]);

  // Fetch taxonomy for multiple categories and aggregate subjects and classes
  const fetchMultiCategoryTaxonomy = useCallback(async (categoryNames: string[]) => {
    setIsLoadingCategories(true);
    try {
      const allSubjects: any[] = [];
      const allClassLevels: any[] = [];
      const processedSubjects = new Set<string>();
      const processedClassLevels = new Set<string>();

      // Find categories in the current categories
      for (const categoryName of categoryNames) {
        const category = categories.find(cat => cat.name === categoryName);
        
        if (category) {
          // Add unique subjects
          if (category.subjects) {
            category.subjects.forEach((subject: any) => {
              if (subject && typeof subject === 'object' && subject.id !== undefined && !processedSubjects.has(subject.name)) {
                allSubjects.push(subject);
                processedSubjects.add(subject.name);
              }
            });
          }
          
          // Add unique class levels
          if (category.classLevels) {
            category.classLevels.forEach((classLevel: any) => {
              if (classLevel && typeof classLevel === 'object' && classLevel.id !== undefined && !processedClassLevels.has(classLevel.name)) {
                allClassLevels.push(classLevel);
                processedClassLevels.add(classLevel.name);
              }
            });
          }
        }
      }

      // Set the aggregated subjects and class levels
      setSubjects(allSubjects);
      setClassLevels(allClassLevels);
    } catch (error) {
      console.error("Error fetching multi-category taxonomy:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects and class levels",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCategories(false);
    }
  }, [categories, toast]);

  // Handle category selection
  const handleCategorySelection = (categoryName: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName];
      
      // Update form data
      setEditFormData(prevForm => ({
        ...prevForm,
        category: newCategories.join(', ')
      }));
      
      return newCategories;
    });
  };

  // Handle subject selection
  const handleSubjectSelection = (subjectName: string) => {
    setSelectedSubjects(prev => {
      const newSubjects = prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName];
      
      // Update form data
      setEditFormData(prevForm => ({
        ...prevForm,
        subject: newSubjects.join(', ')
      }));
      
      return newSubjects;
    });
  };

  // Handle class selection
  const handleClassSelection = (className: string) => {
    setSelectedClasses(prev => {
      const newClasses = prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className];
      
      // Update form data
      setEditFormData(prevForm => ({
        ...prevForm,
        studentClass: newClasses.join(', ')
      }));
      
      return newClasses;
    });
  };

  // Fetch tuition requests with real-time updates
  const fetchTuitionRequests = useCallback(async (isRealTimeUpdate = false) => {
    try {
      if (!isRealTimeUpdate) {
        setIsLoading(true);
      }
      
      const response = await tutorRequestService.getAllTutorRequests();
      console.log('Tuition requests response:', response);
      if (response.success) {
        console.log('Raw tuition request data:', response.data);
        

        
        // Transform the data to match our interface
        const formattedRequests: TuitionRequest[] = response.data.map((req: any) => {
          // Ensure we have valid data for all fields
          // ALWAYS prioritize the actual database fields (student_name) over any other fields
          const studentName = req.student_name || req.studentName || req.title || 'Anonymous Student';
          const studentFullName = req.student_name || req.studentName || req.title || 'Anonymous Student';
          const studentPhone = req.phone_number || '';
          const district = req.district || '';
          const area = req.area || '';
          const subject = req.subject || '';
          const studentClass = req.student_class || '';
          const tutoringType = req.tutoring_type || 'Home Tutoring';
          
          // Handle salary range with proper validation
          const salaryMin = parseFloat(req.salary_range_min) || parseFloat(req.salaryRangeMin) || 0;
          const salaryMax = parseFloat(req.salary_range_max) || parseFloat(req.salaryRangeMax) || 0;
          
          // Ensure status is properly formatted
          const status = req.status || 'active';
          const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
          
          // Handle dates with proper validation
          const createdAt = req.created_at ? new Date(req.created_at).toLocaleDateString() : new Date().toLocaleDateString();
          const updatedAt = req.updated_at ? new Date(req.updated_at).toLocaleDateString() : '';
          
          const finalRequest = {
          id: req.id,
            studentId: req.student_id || '',
            title: req.title || '',
            studentName,
            studentFullName,
            studentPhone,
            studentEmail: req.student_email || '',
            numberOfStudents: req.number_of_students || 1,
            studentGender: req.student_gender || '',
            district,
            area,
            postOffice: req.post_office || '',
            locationDetails: req.location_details || '',
            medium: req.medium || '',
            subject,
            studentClass,
            tutoringType,
            preferredTeacherGender: req.preferred_teacher_gender || '',
            daysPerWeek: req.days_per_week || 0,
            tutoringTime: req.tutoring_time || '',
          salaryRange: {
              min: salaryMin,
              max: salaryMax
            },
            budget: req.budget || '',
            experienceRequired: req.experience_required || '',
            availability: req.availability || '',
            extraInformation: req.extra_information || '',
            adminNote: req.admin_note || '',
            updateNotice: req.update_notice || '',
            updateNoticeBy: req.update_notice_by || undefined,
            updateNoticeByName: req.update_notice_by_name || undefined,
            updateNoticeAt: req.update_notice_at || undefined,
            status: formattedStatus as 'Active' | 'Inactive' | 'Completed' | 'Assign',
            urgent: req.urgent === 1 || req.urgent === true,
            createdAt,
            updatedAt,
          matchedTutors: req.matchedTutors || [],
          submittedFromTutorId: req.submitted_from_tutor_id || '',
          referringTutorName: req.referring_tutor_name || '',
          referringTutorEmail: req.referring_tutor_email || ''
          };
          

          
          return finalRequest;
        });
        
        console.log('Formatted tuition requests:', formattedRequests);
        setRequests(formattedRequests);
        setFilteredRequests(formattedRequests);
        
        // Fetch referring tutor information for requests that have it
        if (!isRealTimeUpdate) {
          const requestsWithReferringTutors = formattedRequests.filter(req => req.submittedFromTutorId);
          for (const request of requestsWithReferringTutors) {
            try {
              const referringTutorInfo = await fetchReferringTutorInfo(request.submittedFromTutorId!);
              if (referringTutorInfo) {
                setRequests(prev => prev.map(req => 
                  req.id === request.id 
                    ? { ...req, referringTutorName: referringTutorInfo.name, referringTutorEmail: referringTutorInfo.email }
                    : req
                ));
                setFilteredRequests(prev => prev.map(req => 
                  req.id === request.id 
                    ? { ...req, referringTutorName: referringTutorInfo.name, referringTutorEmail: referringTutorInfo.email }
                    : req
                ));
              }
            } catch (error) {
              console.error('Error fetching referring tutor info for request:', request.id, error);
            }
          }
        }
        
        if (isRealTimeUpdate) {
          setRealTimeConfig(prev => ({ ...prev, lastUpdate: new Date() }));
        }
        
        // If this is not a real-time update, also refresh assignments if a request is selected
        if (!isRealTimeUpdate && selectedRequest) {
          try {
            const assignmentsResponse = await tutorRequestService.getTutorAssignments(selectedRequest.id);
            if (assignmentsResponse.success) {
              setAssignments(assignmentsResponse.data);
              // Resolve assigner names for assignments missing assigned_by_name
              resolveAssignerNames(assignmentsResponse.data);
            }
          } catch (error) {
            console.error('Error refreshing assignments:', error);
          }
        }
      } else {
        if (!isRealTimeUpdate) {
          toast({
            title: "Error",
            description: "Failed to fetch tuition requests",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching tuition requests:', error);
      if (!isRealTimeUpdate) {
        toast({
          title: 'Error',
          description: 'Failed to load tuition requests',
          variant: 'destructive',
        });
      }
    } finally {
      if (!isRealTimeUpdate) {
        setIsLoading(false);
      }
    }
  }, [toast, selectedRequest]);

  // Resolve assigner names by user id when missing assigned_by_name
  const resolveAssignerNames = useCallback(async (items: TutorAssignment[]) => {
    try {
      const missing = items
        .filter((a: any) => !a.assigned_by_name && a.assigned_by && !assignerNames[a.assigned_by])
        .map(a => a.assigned_by);
      const uniqueIds = Array.from(new Set(missing));
      if (uniqueIds.length === 0) return;
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const entries: Array<[string, string]> = [];
      await Promise.all(uniqueIds.map(async (uid) => {
        try {
          const res = await fetch(`/api/users/${uid}`, { headers });
          const data = await res.json().catch(() => null);
          if (res.ok && data) {
            const name = data.data?.name || data.data?.full_name || data.data?.email || uid;
            entries.push([uid, name]);
          }
        } catch {}
      }));
      if (entries.length > 0) {
        setAssignerNames(prev => ({ ...prev, ...Object.fromEntries(entries) }));
      }
    } catch {}
  }, [assignerNames]);

  const openAssignerDetails = useCallback(async (userId: string) => {
    try {
      setAssignerDetails(null);
      setShowAssignerDialog(true);
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('authToken')) : null;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/users/${userId}`, { headers });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        setAssignerDetails(data.data || data);
      } else {
        setAssignerDetails({ id: userId });
      }
    } catch {
      setAssignerDetails({ id: userId });
    }
  }, []);

  // Fetch referring tutor information
  const fetchReferringTutorInfo = useCallback(async (tutorId: string) => {
    try {
      console.log('Fetching referring tutor info for ID:', tutorId);
      
      // First try to get tutor information from tutor service
      try {
        const tutorResponse = await tutorService.getTutorById(tutorId);
        console.log('Tutor service response:', tutorResponse);
        
        if (tutorResponse.success && tutorResponse.data) {
          const result = {
            name: tutorResponse.data.full_name || 'Unknown Tutor',
            email: 'Email not available' // Tutor service doesn't provide email
          };
          console.log('Returning tutor info from tutor service:', result);
          return result;
        }
      } catch (tutorServiceError) {
        console.log('Tutor service failed, trying users API:', tutorServiceError);
      }
      
      // Fallback: try to get tutor information from users table
      try {
        const response = await fetch(`/api/users/${tutorId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Users API response status:', response.status);
        
        if (response.ok) {
          const tutorData = await response.json();
          console.log('Users API tutor data received:', tutorData);
          
          if (tutorData.success && tutorData.data) {
            const result = {
              name: tutorData.data.full_name || 'Unknown Tutor',
              email: tutorData.data.email || 'No email'
            };
            console.log('Returning tutor info from users API:', result);
            return result;
          }
        }
      } catch (usersApiError) {
        console.log('Users API also failed:', usersApiError);
      }
      
      console.log('All methods failed to fetch tutor info');
      return null;
    } catch (error) {
      console.error('Error fetching referring tutor info:', error);
      return null;
    }
  }, []);

  // Fetch tutors for assignment with advanced filtering
  const fetchTutors = useCallback(async (filters?: TutorFilter) => {
    try {
      setIsLoadingTutors(true);
      
      const response = await tutorService.getAllTutors(filters);
      
      if (response.success && response.data) {
        // Transform the data to ensure all required fields are present
        const transformedTutors = response.data.map((tutor: any) => ({
          id: tutor.id,
          tutor_id: tutor.tutor_id || '',
          full_name: tutor.full_name || 'Unknown Tutor',
          location: tutor.location || '',
          district: tutor.district || '',
          avatar_url: tutor.avatar_url || null,
          created_at: tutor.created_at || new Date().toISOString(),
          gender: tutor.gender || null,
          bio: tutor.bio || null,
          education: tutor.education || null,
          experience: tutor.experience || null,
          subjects: tutor.subjects || '',
          hourly_rate: tutor.hourly_rate ? parseFloat(tutor.hourly_rate) : undefined,
          rating: tutor.rating ? parseFloat(tutor.rating) : 0,
          total_reviews: tutor.total_reviews ? parseInt(tutor.total_reviews) : 0,
          total_views: tutor.total_views || 0,
          availability: tutor.availability || null,
          premium: tutor.premium || null,
          verified: tutor.verified || 0,
          qualification: tutor.qualification || null,
          tutoring_experience: tutor.tutoring_experience || null,
          university_name: tutor.university_name || null,
          department_name: tutor.department_name || null,
          expected_salary: tutor.expected_salary ? parseFloat(tutor.expected_salary) : undefined,
          days_per_week: tutor.days_per_week || null,
          preferred_tutoring_style: tutor.preferred_tutoring_style || null,
          educational_qualifications: tutor.educational_qualifications || null,
          preferred_subjects: tutor.preferred_subjects || null,
          preferred_class: tutor.preferred_class || null,
          preferred_medium: tutor.preferred_medium || null,
          preferred_time: tutor.preferred_time || null,
          religion: tutor.religion || null,
          nationality: tutor.nationality || null
        }));
        
        setTutors(transformedTutors as LocalTutor[]);
        setFilteredTutors(transformedTutors as LocalTutor[]);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tutors",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching tutors:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tutors",
        variant: "destructive"
      });
    } finally {
      setIsLoadingTutors(false);
    }
  }, [toast]);

  // Update available areas when district changes
  useEffect(() => {
    if (editFormData.district) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === editFormData.district);
      if (district) {
        setAvailableAreas(district.areas.map(area => area.name));
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
    }
  }, [editFormData.district]);

  // Fetch category-specific subjects and class levels when selected categories change
  useEffect(() => {
    if (selectedCategories && selectedCategories.length > 0) {
      fetchMultiCategoryTaxonomy(selectedCategories);
    } else {
      // Clear subjects and classes when no categories are selected
      setSubjects([]);
      setClassLevels([]);
    }
  }, [selectedCategories, fetchMultiCategoryTaxonomy]);

  // Fetch data on component mount and set up real-time updates
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchTuitionRequests(),
          fetchTutors(),
          fetchCategories()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };
    
    initializeData();
    
    // Set up real-time updates if enabled
    if (realTimeConfig.enabled) {
      realTimeIntervalRef.current = setInterval(() => {
        fetchTuitionRequests(true);
      }, realTimeConfig.interval);
    }
    
    return () => {
      if (realTimeIntervalRef.current) {
        clearInterval(realTimeIntervalRef.current);
      }
    };
  }, [fetchTuitionRequests, fetchTutors, realTimeConfig.enabled, realTimeConfig.interval]);

  // Ensure tutors are loaded when assign modal opens
  useEffect(() => {
    if (showAssignTutorModal && tutors.length === 0) {
      fetchTutors();
    }
  }, [showAssignTutorModal, tutors.length, fetchTutors]);

  // Ensure referring tutor information is loaded when modal opens
  useEffect(() => {
    if (showAssignTutorModal && selectedRequest?.submittedFromTutorId && !selectedRequest?.referringTutorName) {
      const loadReferringTutorInfo = async () => {
        try {
          const referringTutorInfo = await fetchReferringTutorInfo(selectedRequest.submittedFromTutorId!);
          if (referringTutorInfo) {
            setSelectedRequest(prev => prev ? {
              ...prev,
              referringTutorName: referringTutorInfo.name,
              referringTutorEmail: referringTutorInfo.email
            } : prev);
          }
        } catch (error) {
          console.error('Error fetching referring tutor info:', error);
        }
      };
      
      loadReferringTutorInfo();
    }
  }, [showAssignTutorModal, selectedRequest?.submittedFromTutorId, selectedRequest?.referringTutorName, fetchReferringTutorInfo]);

  // Filter requests based on search term, status, and referral type
  useEffect(() => {
    let filtered = [...requests];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(request => 
        request.studentName.toLowerCase().includes(term) ||
        (request.studentFullName && request.studentFullName.toLowerCase().includes(term)) ||
        request.district.toLowerCase().includes(term) ||
        request.subject.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(request => request.status.toLowerCase() === statusFilter);
    }
    
    // Apply referral filter
    if (referralFilter !== 'all') {
      if (referralFilter === 'referred') {
        filtered = filtered.filter(request => request.submittedFromTutorId);
      } else if (referralFilter === 'direct') {
        filtered = filtered.filter(request => !request.submittedFromTutorId);
      }
    }
    
    setFilteredRequests(filtered);
  }, [searchTerm, statusFilter, referralFilter, requests]);

  // Handle status change
  const handleStatusChange = async (requestId: string, newStatus: 'Active' | 'Inactive' | 'Completed' | 'Assign') => {
    try {
      const response = await tutorRequestService.updateTutorRequestStatus(requestId, newStatus);
      
      if (response.success) {
        toast({
          title: "Status Updated",
          description: `Request status has been updated to ${newStatus}`,
        });
        
        // Refresh data from database to ensure we have the latest information
        await fetchTuitionRequests();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  };

  // Fetch update notice history
  const fetchUpdateNoticeHistory = useCallback(async (requestId: string) => {
    try {
      console.log('=== FETCHING UPDATE NOTICE HISTORY ===');
      console.log('Request ID:', requestId);
      console.log('User role:', user?.role);
      console.log('User ID:', user?.id);
      
      setIsLoadingUpdateHistory(true);
      const response = await tutorRequestService.getUpdateNoticeHistory(requestId);
      console.log('Update notice history response:', response);
      
      if (response.success) {
        console.log('Setting update notice history:', response.data);
        setUpdateNoticeHistory(response.data);
      } else {
        console.error('Failed to fetch update notice history:', response.message);
        setUpdateNoticeHistory([]);
      }
    } catch (error) {
      console.error('Error fetching update notice history:', error);
      console.error('Error details:', error);
      setUpdateNoticeHistory([]);
    } finally {
      setIsLoadingUpdateHistory(false);
    }
  }, [user]);

  // View request details
  const viewRequestDetails = (request: TuitionRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
    // Fetch update notice history when viewing details
    fetchUpdateNoticeHistory(request.id);
  };

  // Open edit request modal
  const openEditRequestModal = (request: TuitionRequest) => {
    setSelectedRequest(request);
    
    // Initialize selected arrays from comma-separated strings
    const categories = request.category ? request.category.split(',').map(c => c.trim()).filter(c => c) : [];
    const subjects = request.subject ? request.subject.split(',').map(s => s.trim()).filter(s => s) : [];
    const classes = request.studentClass ? request.studentClass.split(',').map(c => c.trim()).filter(c => c) : [];
    
    setSelectedCategories(categories);
    setSelectedSubjects(subjects);
    setSelectedClasses(classes);
    
    const formData = {
      studentName: request.studentName,
      district: request.district,
      area: request.area,
      subject: request.subject,
      studentClass: request.studentClass,
      category: request.category || '',
      tutoringType: request.tutoringType || 'Home Tutoring', // Ensure default value
      salaryRange: {
        min: request.salaryRange.min,
        max: request.salaryRange.max
      },
      adminNote: request.adminNote || '',
      updateNotice: request.updateNotice || '',
      updateNoticeBy: request.updateNoticeBy,
      updateNoticeByName: request.updateNoticeByName,
      updateNoticeAt: request.updateNoticeAt,
      status: request.status
    };
    console.log('Initializing edit form with data:', formData);
    console.log('Request updateNotice:', request.updateNotice, 'Type:', typeof request.updateNotice);
    setEditFormData(formData);
    setShowEditModal(true);
  };

  // Handle form field changes
  const handleEditFormChange = (field: string, value: any) => {
    console.log('Form field changed:', field, 'Value:', value, 'Type:', typeof value);
    if (field === 'updateNotice') {
      console.log('updateNotice field changed to:', value);
    }
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle salary range changes
  const handleSalaryRangeChange = (type: 'min' | 'max', value: number) => {
    setEditFormData(prev => ({
      ...prev,
      salaryRange: {
        ...prev.salaryRange!,
        [type]: value
      }
    }));
  };

  // Handle update request
  const handleUpdateRequest = async () => {
    if (!selectedRequest || !editFormData) return;
    
    setIsUpdating(true);
    try {
      // Log what we're sending to the backend
      const updatePayload = {
          studentName: editFormData.studentName,
          district: editFormData.district,
          area: editFormData.area,
          subject: editFormData.subject,
          studentClass: editFormData.studentClass,
          category: editFormData.category,
          tutoringType: editFormData.tutoringType as 'Home Tutoring' | 'Online Tutoring' | 'Both' | undefined,
          salaryRange: editFormData.salaryRange,
          adminNote: editFormData.adminNote,
          updateNotice: editFormData.updateNotice
      };
      
      console.log('Updating tuition request with payload:', updatePayload);
      console.log('Tutoring type value:', editFormData.tutoringType, 'Type:', typeof editFormData.tutoringType);
      console.log('Selected request current tutoring type:', selectedRequest.tutoringType);
      console.log('updateNotice value:', editFormData.updateNotice, 'Type:', typeof editFormData.updateNotice);
      console.log('adminNote value:', editFormData.adminNote, 'Type:', typeof editFormData.adminNote);
      
      const response = await tutorRequestService.updateTutorRequest(
        selectedRequest.id,
        {
          ...updatePayload,
          updateNoticeBy: user?.id,
          updateNoticeByName: (user as any)?.name || (user as any)?.full_name || (user as any)?.email || user?.role,
        }
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Tuition request updated successfully",
        });
        // Optimistically reflect update notice author info in UI
        const nowIso = new Date().toISOString();
        setSelectedRequest(prev => prev ? {
          ...prev,
          updateNotice: editFormData.updateNotice || prev.updateNotice,
          updateNoticeBy: user?.id || prev.updateNoticeBy,
          updateNoticeByName: (user as any)?.name || (user as any)?.full_name || (user as any)?.email || user?.role || prev.updateNoticeByName,
          updateNoticeAt: nowIso,
        } : prev);
        setUpdateNoticeAuthorName((user as any)?.name || (user as any)?.full_name || (user as any)?.email || user?.role || null);
        
        // Refresh data from database to ensure we have the latest information
        await fetchTuitionRequests();
        
        // Refresh update notice history if we're viewing the details
        if (showDetailsModal && selectedRequest) {
          await fetchUpdateNoticeHistory(selectedRequest.id);
        }
        
        setShowEditModal(false);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update tutor request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating tuition request:", error);
      toast({
        title: "Error",
        description: "Failed to update tuition request",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle delete request
  const handleDeleteRequest = async (requestId: string) => {
    // Check if user has permission to delete
    if (!canDeleteRequests()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete tuition requests. Only administrators can delete requests.",
        variant: "destructive"
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this tuition request? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await tutorRequestService.deleteTutorRequestAdmin(requestId);

      if (response.success) {
        toast({
          title: "Success",
          description: "Tuition request deleted successfully",
        });
        
        // Refresh data from database to ensure we have the latest information
        await fetchTuitionRequests();
        
        // Close modals if the deleted request was selected
        if (selectedRequest?.id === requestId) {
          setShowDetailsModal(false);
          setShowEditModal(false);
          setShowAssignTutorModal(false);
          setSelectedRequest(null);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete tutor request",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting tuition request:", error);
      toast({
        title: "Error",
        description: "Failed to delete tuition request",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
      
  // Filter tutors based on request requirements
  const filterTutorsForRequest = useCallback((request: TuitionRequest) => {
    const filters: TutorFilter = {
      subject: request.subject,
      district: request.district,
      sortBy: 'rating',
      sortOrder: 'desc'
    };
    
    // Add salary range filter if available
    if (request.salaryRange.max > 0) {
      filters.maxPrice = request.salaryRange.max;
    }
    
    return filters;
  }, []);

  // Get matched tutors for a specific request
  const getMatchedTutors = useCallback((request: TuitionRequest) => {
    if (!request || !tutors.length) {
      return [];
    }
    
    // Filter out already assigned tutors
    let availableTutors = tutors;
    if (assignments.length > 0) {
      const assignedTutorIds = assignments.map(assignment => assignment.tutor_id);
      availableTutors = tutors.filter(tutor => !assignedTutorIds.includes(tutor.id));
    }
    
    let matchedTutors = availableTutors.filter(tutor => {
      // Apply search filter if search term exists
      if (tutorSearchTerm) {
        const searchTerm = tutorSearchTerm.toLowerCase();
        const tutorName = (tutor.full_name || '').toLowerCase();
        const tutorId = (tutor.id || '').toString().toLowerCase();
        
        if (!tutorName.includes(searchTerm) && !tutorId.includes(searchTerm)) {
          return false;
        }
      }
      
      // Check if tutor teaches the required subject
      const tutorSubjects = Array.isArray(tutor.subjects) 
        ? tutor.subjects.join(',').toLowerCase() 
        : (tutor.subjects || '').toLowerCase();
      const tutorPreferredSubjects = Array.isArray(tutor.preferred_subjects) 
        ? tutor.preferred_subjects.join(',').toLowerCase() 
        : (tutor.preferred_subjects || '').toLowerCase();
      const requestSubject = request.subject.toLowerCase();
      
      const teachesSubject = tutorSubjects.includes(requestSubject) ||
                           tutorPreferredSubjects.includes(requestSubject) ||
                           tutorSubjects.includes('all') ||
                           tutorPreferredSubjects.includes('all');
      
      // Check if tutor is in the same district or nearby
      const tutorDistrict = (tutor.district || '').toLowerCase();
      const tutorLocation = (tutor.location || '').toLowerCase();
      const requestDistrict = request.district.toLowerCase();
      
      const locationMatch = tutorDistrict === requestDistrict || 
                           tutorLocation.includes(requestDistrict) ||
                           requestDistrict.includes(tutorDistrict);
      
      // Check if tutor's expected salary is within range (if salary range is specified)
      const salaryMatch = !request.salaryRange.max || 
                         !tutor.expected_salary || 
                         (tutor.expected_salary >= request.salaryRange.min && 
                          tutor.expected_salary <= request.salaryRange.max);
      
      return teachesSubject && locationMatch && salaryMatch;
    });
    
    // If this is a referred request, ensure the referring tutor is included in matches (if not already assigned)
    if (request.submittedFromTutorId) {
      const assignedTutorIds = assignments.map(assignment => assignment.tutor_id);
      if (!assignedTutorIds.includes(request.submittedFromTutorId)) {
        const referringTutor = tutors.find(t => t.id === request.submittedFromTutorId);
        if (referringTutor && !matchedTutors.find(t => t.id === referringTutor.id)) {
          matchedTutors = [referringTutor, ...matchedTutors];
        }
      }
    }
    
    return matchedTutors;
  }, [tutors, tutorSearchTerm, assignments]);

  // Get nearby tutors (same district)
  const getNearbyTutors = useCallback((request: TuitionRequest) => {
    if (!request || !tutors.length) {
      return [];
    }
    
    // Filter out already assigned tutors
    let availableTutors = tutors;
    if (assignments.length > 0) {
      const assignedTutorIds = assignments.map(assignment => assignment.tutor_id);
      availableTutors = tutors.filter(tutor => !assignedTutorIds.includes(tutor.id));
    }
    
    return availableTutors.filter(tutor => {
      // Apply search filter if search term exists
      if (tutorSearchTerm) {
        const searchTerm = tutorSearchTerm.toLowerCase();
        const tutorName = (tutor.full_name || '').toLowerCase();
        const tutorId = (tutor.id || '').toString().toLowerCase();
        
        if (!tutorName.includes(searchTerm) && !tutorId.includes(searchTerm)) {
          return false;
        }
      }
      
      const tutorDistrict = (tutor.district || '').toLowerCase();
      const tutorLocation = (tutor.location || '').toLowerCase();
      const requestDistrict = request.district.toLowerCase();
      
      return tutorDistrict === requestDistrict || 
             tutorLocation.includes(requestDistrict) ||
             requestDistrict.includes(tutorDistrict);
    });
  }, [tutors, tutorSearchTerm, assignments]);

  // Get all tutors filtered by search term and excluding already assigned tutors
  const getAllTutors = useCallback(() => {
    if (!tutors.length) {
      return [];
    }
    
    // Filter out already assigned tutors
    let availableTutors = tutors;
    if (selectedRequest && assignments.length > 0) {
      const assignedTutorIds = assignments.map(assignment => assignment.tutor_id);
      availableTutors = tutors.filter(tutor => !assignedTutorIds.includes(tutor.id));
    }
    
    if (!tutorSearchTerm) {
      return availableTutors;
    }
    
    const searchTerm = tutorSearchTerm.toLowerCase();
    return availableTutors.filter(tutor => {
      const tutorName = (tutor.full_name || '').toLowerCase();
      const tutorId = (tutor.id || '').toString().toLowerCase();
      
      return tutorName.includes(searchTerm) || tutorId.includes(searchTerm);
    });
  }, [tutors, tutorSearchTerm, selectedRequest, assignments]);

  // Open assign tutor modal with enhanced features
  const openAssignTutorModal = async (request: TuitionRequest) => {
    setSelectedRequest(request);
    setSelectedTutor('');
    setAssignmentNotes('');
    setCreateDemoClass(false);
    setDemoDate('');
    setDemoDuration(30);
    setDemoNotes('');
    setAssignmentTab('all');
    setTutorSearchTerm('');
    setSendEmailNotification(true);
    setSendSMSNotification(true);
    
    // Always fetch all tutors and assignments first to ensure we have the complete list
    try {
      await Promise.all([
        fetchTutors(),
        tutorRequestService.getTutorAssignments(request.id).then(response => {
          if (response.success) {
            setAssignments(response.data);
            resolveAssignerNames(response.data);
          }
        })
      ]);
      
      // Fetch referring tutor information if this is a referred request
      if (request.submittedFromTutorId && !request.referringTutorName) {
        try {
          const referringTutorInfo = await fetchReferringTutorInfo(request.submittedFromTutorId);
          if (referringTutorInfo) {
            // Update the selected request with referring tutor info
            setSelectedRequest(prev => prev ? {
              ...prev,
              referringTutorName: referringTutorInfo.name,
              referringTutorEmail: referringTutorInfo.email
            } : prev);
          }
        } catch (error) {
          console.error('Error fetching referring tutor info for modal:', error);
        }
      }
      
      // Fetch detailed tutor information for the referring tutor
      if (request.submittedFromTutorId) {
        try {
          const tutorResponse = await tutorService.getTutorById(request.submittedFromTutorId);
          if (tutorResponse.success && tutorResponse.data) {
            setSelectedTutorDetails(tutorResponse.data);
          }
        } catch (error) {
          console.error('Error fetching referring tutor details for modal:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching tutors or assignments for assignment modal:', error);
      toast({
        title: "Error",
        description: "Failed to load tutors or assignments. Please try again.",
        variant: "destructive"
      });
    }
    
    setShowAssignTutorModal(true);
  };

  // Handle tutor assignment
  const handleAssignTutor = async () => {
    if (!selectedRequest || !selectedTutor) {
      toast({
        title: "Error",
        description: "Please select a tutor",
        variant: "destructive"
      });
      return;
    }

    // Validate demo class data if creating one
    if (createDemoClass) {
      if (!demoDate) {
        toast({
          title: "Error",
          description: "Please select a demo class date",
          variant: "destructive"
        });
        return;
      }
      
      // Validate that the demo date is in the future
      const selectedDate = new Date(demoDate);
      const now = new Date();
      
      // Check if the date is valid
      if (isNaN(selectedDate.getTime())) {
        toast({
          title: "Error",
          description: "Invalid demo class date format",
          variant: "destructive"
        });
        return;
      }
      
      if (selectedDate <= now) {
        toast({
          title: "Error",
          description: "Demo class date must be in the future",
          variant: "destructive"
        });
        return;
      }
      
      // Validate duration
      if (demoDuration < 15 || demoDuration > 180) {
        toast({
          title: "Error",
          description: "Demo class duration must be between 15 and 180 minutes",
          variant: "destructive"
        });
        return;
      }
    }

    setIsAssigning(true);
    try {
      const demoClassData = createDemoClass ? {
        createDemo: true,
        requestedDate: new Date(demoDate).toISOString(),
        duration: demoDuration,
        notes: demoNotes
      } : undefined;

      console.log('=== FRONTEND DEBUG: Tutor Assignment ===');
      console.log('Request ID:', selectedRequest.id);
      console.log('Tutor ID:', selectedTutor);
      console.log('Assignment Notes:', assignmentNotes);
      console.log('Demo Class Data:', demoClassData);
      console.log('Create Demo Class:', createDemoClass);
      console.log('Demo Date:', demoDate);
      console.log('Demo Duration:', demoDuration);
      console.log('Demo Notes:', demoNotes);
      console.log('Send Email Notification:', sendEmailNotification, '(type:', typeof sendEmailNotification, ')');
      console.log('Send SMS Notification:', sendSMSNotification, '(type:', typeof sendSMSNotification, ')');
      console.log('Notification Options Object:', {
        sendEmailNotification,
        sendSMSNotification
      });
      console.log('==========================================');

      const response = await tutorRequestService.assignTutor(
        selectedRequest.id,
        selectedTutor,
        assignmentNotes,
        demoClassData,
        {
          sendEmailNotification,
          sendSMSNotification
        }
      );

      console.log('Assignment response:', response);

      if (response.success) {
        const successMessage = createDemoClass 
          ? `Tutor assigned successfully with demo class scheduled for ${new Date(demoDate).toLocaleDateString()} at ${new Date(demoDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
          : "Tutor assigned successfully";
        
        // Add notification status to success message
        const notificationStatus = [];
        if (sendEmailNotification) notificationStatus.push('Email notification sent');
        if (sendSMSNotification) notificationStatus.push('SMS notification sent');
        
        const finalMessage = notificationStatus.length > 0 
          ? `${successMessage}. ${notificationStatus.join(', ')}.`
          : successMessage;
        
        toast({
          title: "Success",
          description: finalMessage,
        });
        setShowAssignTutorModal(false);
        // Refresh data from database to ensure we have the latest information
        await fetchTuitionRequests();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to assign tutor",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error assigning tutor:", error);
      toast({
        title: "Error",
        description: "Failed to assign tutor",
        variant: "destructive"
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // View tutor assignments
  const viewAssignments = async (request: TuitionRequest) => {
    setSelectedRequest(request);
    setIsLoading(true);
    try {
      const response = await tutorRequestService.getTutorAssignments(request.id);
      if (response.success) {
        setAssignments(response.data);
        resolveAssignerNames(response.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch tutor assignments",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tutor assignments",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowAssignmentsModal(true);
    }
  };

  // Update assignment status
  const updateAssignmentStatus = async (assignmentId: string, status: 'pending' | 'accepted' | 'rejected' | 'completed') => {
    if (!selectedRequest) return;
    
    try {
      const response = await tutorRequestService.updateAssignmentStatus(
        selectedRequest.id,
        assignmentId,
        status
      );

      if (response.success) {
        toast({
          title: "Success",
          description: `Assignment status updated to ${status}`,
        });
        // Refresh data from database to ensure we have the latest information
        await fetchTuitionRequests();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update assignment status",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating assignment status:", error);
      toast({
        title: "Error",
        description: "Failed to update assignment status",
        variant: "destructive"
      });
    }
  };

  // Delete assignment
  const deleteAssignment = async (assignmentId: string) => {
    if (!selectedRequest) return;
    
    // Check if user has permission to delete
    if (!canDeleteRequests()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete assignments. Only administrators can delete assignments.",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    try {
      const response = await tutorRequestService.deleteAssignment(
        selectedRequest.id,
        assignmentId
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Assignment deleted successfully",
        });
        // Refresh data from database to ensure we have the latest information
        await fetchTuitionRequests();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete assignment",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  // View referring tutor details
  const viewReferringTutorDetails = async (tutorId: string) => {
    try {
      // First try tutor service
      const tutorResponse = await tutorService.getTutorById(tutorId);
      if (tutorResponse.success) {
        setSelectedTutorDetails(tutorResponse.data);
        setShowTutorDetails(true);
        return;
      }
      
      // Fallback to users API
      const response = await fetch(`/api/users/${tutorId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const tutorData = await response.json();
        if (tutorData.success) {
          setSelectedTutorDetails(tutorData.data);
          setShowTutorDetails(true);
        }
      }
    } catch (error) {
      console.error('Error fetching referring tutor details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch referring tutor details",
        variant: "destructive"
      });
    }
  };

  // View tutor details
  const viewTutorDetails = async (tutorId: string) => {
    try {
      const response = await tutorService.getTutorById(tutorId);
      if (response.success) {
        setSelectedTutorDetails(response.data);
        setShowTutorDetails(true);
      }
    } catch (error) {
      console.error('Error fetching tutor details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tutor details",
        variant: "destructive"
      });
    }
  };

  // Manual refresh function
  const handleManualRefresh = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchTuitionRequests(),
        fetchTutors()
      ]);
      
      // Refresh referring tutor information for all requests
      const requestsWithReferringTutors = requests.filter(req => req.submittedFromTutorId);
      for (const request of requestsWithReferringTutors) {
        try {
          const referringTutorInfo = await fetchReferringTutorInfo(request.submittedFromTutorId!);
          if (referringTutorInfo) {
            setRequests(prev => prev.map(req => 
              req.id === request.id 
                ? { ...req, referringTutorName: referringTutorInfo.name, referringTutorEmail: referringTutorInfo.email }
                : req
            ));
            setFilteredRequests(prev => prev.map(req => 
              req.id === request.id 
                ? { ...req, referringTutorName: referringTutorInfo.name, referringTutorEmail: referringTutorInfo.email }
                : req
            ));
          }
        } catch (error) {
          console.error('Error refreshing referring tutor info for request:', request.id, error);
        }
      }
      
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      });
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast({
        title: "Error",
        description: "Failed to refresh data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle real-time updates
  const toggleRealTimeUpdates = () => {
    setRealTimeConfig(prev => {
      const newConfig = { ...prev, enabled: !prev.enabled };
      
      if (newConfig.enabled) {
        realTimeIntervalRef.current = setInterval(() => {
          fetchTuitionRequests(true);
        }, newConfig.interval);
      } else {
        if (realTimeIntervalRef.current) {
          clearInterval(realTimeIntervalRef.current);
          realTimeIntervalRef.current = null;
        }
      }
      
      return newConfig;
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'assign':
        return <Badge className="bg-orange-500">Assign</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        // Capitalize first letter for display
        const displayStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        return <Badge>{displayStatus}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Tuition Requests</h2>
            <p className="text-white/90 mt-1">Manage tuition requests from students</p>
            {realTimeConfig.enabled && (
              <div className="flex items-center gap-2 mt-2 text-white/80">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm">Real-time updates enabled</span>
                <span className="text-xs">• Last updated: {realTimeConfig.lastUpdate.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleRealTimeUpdates}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${realTimeConfig.enabled ? 'animate-spin' : ''}`} />
              {realTimeConfig.enabled ? 'Disable' : 'Enable'} Real-time
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
      


      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Tuition Requests</CardTitle>
              <CardDescription>View and manage tuition requests from students</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="assign">Assign</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={referralFilter} onValueChange={setReferralFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    <SelectValue placeholder="Filter by referral" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="referred">Referred by Tutor</SelectItem>
                  <SelectItem value="direct">Direct Requests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No tuition requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Assignments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{request.studentFullName || request.studentName}</div>
                            {request.submittedFromTutorId && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200" title="Referred by tutor">
                                <UserPlus className="h-3 w-3 mr-1" />
                                Referred
                              </Badge>
                            )}
                          </div>
                          {request.studentPhone && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {request.studentPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{request.district}{request.area ? `, ${request.area}` : ''}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {request.category || 'Not specified'}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.subject}{request.studentClass ? `, ${request.studentClass}` : ''}</TableCell>
                      <TableCell>{request.tutoringType}</TableCell>
                      <TableCell>
                        {request.salaryRange.min === request.salaryRange.max ? 
                          `৳${request.salaryRange.min}` : 
                          `৳${request.salaryRange.min} - ৳${request.salaryRange.max}`}
                      </TableCell>
                      <TableCell>{renderStatusBadge(request.status.toLowerCase())}</TableCell>
                      <TableCell>{request.createdAt}</TableCell>
                      <TableCell>
                        {request.matchedTutors && request.matchedTutors.length > 0 ? (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {request.matchedTutors.length}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">
                            None
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => viewRequestDetails(request)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openEditRequestModal(request)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Edit Request
                </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openAssignTutorModal(request)}>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Assign Tutor
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => viewAssignments(request)}>
                              <Users className="h-4 w-4 mr-2" />
                              View Assignments
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(request.id, 'Active')}
                              disabled={request.status.toLowerCase() === 'active'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                              Mark as Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(request.id, 'Inactive')}
                              disabled={request.status.toLowerCase() === 'inactive'}
                            >
                              <XCircle className="h-4 w-4 mr-2 text-gray-600" />
                              Mark as Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(request.id, 'Assign')}
                              disabled={request.status.toLowerCase() === 'assign'}
                            >
                              <UserPlus className="h-4 w-4 mr-2 text-orange-600" />
                              Mark as Assign
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(request.id, 'Completed')}
                              disabled={request.status.toLowerCase() === 'completed'}
                            >
                              <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                              Mark as Completed
                            </DropdownMenuItem>
                            {canDeleteRequests() && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteRequest(request.id)}
                                  className="text-destructive focus:text-destructive"
                                  disabled={isDeleting}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isDeleting ? 'Deleting...' : 'Delete Request'}
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Modal */}
      {selectedRequest && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Tuition Request Details</DialogTitle>
              <DialogDescription>
                Detailed information about the tuition request
              </DialogDescription>
            </DialogHeader>
            
            <div className="overflow-y-auto scrollbar-hide" style={{ maxHeight: '70vh' }}>
              <div className="flex flex-col space-y-6 py-4 px-2">
                {/* Basic Information Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Basic Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Request ID</h4>
                      <p className="text-base font-semibold text-green-800">{selectedRequest.id}</p>
                  </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Title</h4>
                      <p className="text-base text-green-800">{selectedRequest.title || 'Tutor Request'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student ID</h4>
                      <p className="text-base text-green-800">{selectedRequest.studentId || 'Not available'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Status</h4>
                      <div className="mt-1">{renderStatusBadge(selectedRequest.status.toLowerCase())}</div>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Urgent</h4>
                      <p className="text-base text-green-800">{selectedRequest.urgent ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedRequest.submittedFromTutorId && (
                      <div className="min-w-[200px]">
                        <h4 className="text-sm font-medium text-green-700">Referred By Tutor</h4>
                        <div className="space-y-1">
                          <p 
                            className="text-base font-semibold text-green-800 cursor-pointer hover:text-green-600 hover:underline"
                            onClick={() => viewReferringTutorDetails(selectedRequest.submittedFromTutorId!)}
                            title="Click to view tutor details"
                          >
                            {selectedRequest.referringTutorName || 'Loading...'}
                          </p>
                          {selectedRequest.referringTutorEmail && (
                            <p className="text-sm text-green-600">{selectedRequest.referringTutorEmail}</p>
                          )}
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            <UserPlus className="h-3 w-3 mr-1" />
                            Referred
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Information Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Student Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student Name</h4>
                      <p className="text-base font-semibold text-green-800">{selectedRequest.studentFullName || selectedRequest.studentName}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student Email</h4>
                      <p className="text-base text-green-800">{selectedRequest.studentEmail || 'Not provided'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Phone Number</h4>
                      {selectedRequest.studentPhone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-green-600" />
                          <p className="text-base text-green-800">{selectedRequest.studentPhone}</p>
                        </div>
                      ) : (
                        <p className="text-base text-green-600">Not provided</p>
                )}
              </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Number of Students</h4>
                      <p className="text-base text-green-800">{selectedRequest.numberOfStudents || 1}</p>
              </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Student Gender</h4>
                      <p className="text-base text-green-800">{selectedRequest.studentGender || 'Not specified'}</p>
              </div>
              </div>
                </div>

                {/* Academic Requirements Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Academic Requirements</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Category</h4>
                      <p className="text-base font-semibold text-green-800">{selectedRequest.category || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Subject</h4>
                      <p className="text-base font-semibold text-green-800">{selectedRequest.subject}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Class</h4>
                      <p className="text-base text-green-800">{selectedRequest.studentClass || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Medium</h4>
                      <p className="text-base text-green-800">{selectedRequest.medium || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Tutoring Type</h4>
                      <p className="text-base text-green-800">{selectedRequest.tutoringType || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Preferred Teacher Gender</h4>
                      <p className="text-base text-green-800">{selectedRequest.preferredTeacherGender || 'No preference'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Days Per Week</h4>
                      <p className="text-base text-green-800">{selectedRequest.daysPerWeek || 0} days</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Tutoring Time</h4>
                      <p className="text-base text-green-800">{selectedRequest.tutoringTime || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Budget Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Location & Budget</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">District</h4>
                      <p className="text-base text-green-800">{selectedRequest.district}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Area</h4>
                      <p className="text-base text-green-800">{selectedRequest.area || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Post Office</h4>
                      <p className="text-base text-green-800">{selectedRequest.postOffice || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Location Details</h4>
                      <p className="text-base text-green-800">{selectedRequest.locationDetails || 'Not provided'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Budget Range</h4>
                      <p className="text-base font-semibold text-green-800">
                  {selectedRequest.salaryRange.min === selectedRequest.salaryRange.max ? 
                          `৳${selectedRequest.salaryRange.min.toLocaleString()}` : 
                          `৳${selectedRequest.salaryRange.min.toLocaleString()} - ৳${selectedRequest.salaryRange.max.toLocaleString()}`}
                </p>
              </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Budget (Text)</h4>
                      <p className="text-base text-green-800">{selectedRequest.budget || 'Not specified'}</p>
              </div>
              </div>
                </div>

                {/* Additional Requirements Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">Additional Requirements</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Experience Required</h4>
                      <p className="text-base text-green-800">{selectedRequest.experienceRequired || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Availability</h4>
                      <p className="text-base text-green-800">{selectedRequest.availability || 'Not specified'}</p>
                    </div>
                    <div className="min-w-[400px]">
                      <h4 className="text-sm font-medium text-green-700">Extra Information</h4>
                      <p className="text-base text-green-800">{selectedRequest.extraInformation || 'No additional information provided'}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Note Section */}
                {selectedRequest.adminNote && (
                  <div className="border-b border-green-200 pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-green-600">Admin Note</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-900">Administrator Note</h4>
                          <p className="text-sm text-blue-800 mt-1 whitespace-pre-wrap">{selectedRequest.adminNote}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Update Notice History Section */}
                {(updateNoticeHistory.length > 0 || isLoadingUpdateHistory || (selectedRequest && selectedRequest.updateNotice)) && (
                  <div className="border-b border-green-200 pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-green-600">Update Notice History</h3>
                    <div className="space-y-4">
                      {isLoadingUpdateHistory ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                          <span className="ml-2 text-orange-600">Loading update history...</span>
                        </div>
                      ) : updateNoticeHistory.length > 0 ? (
                        updateNoticeHistory.map((notice, index) => (
                          <div key={notice.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="font-medium text-orange-900">
                                    Update Notice #{updateNoticeHistory.length - index}
                                  </h4>
                                  <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                    {index === 0 ? 'Latest' : 'Previous'}
                                  </span>
                                </div>
                                <p className="text-sm text-orange-800 mt-1 whitespace-pre-wrap">{notice.updateNotice}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-orange-700">
                                  <span>By: {notice.updatedByName || 'Unknown'}</span>
                                  <span>•</span>
                                  <span>At: {new Date(notice.updatedAt).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-orange-600">
                          <p>No update notices found in history</p>
                          <p className="text-xs text-gray-500 mt-1">
                            If you expected to see notices here, please check the console for errors.
                          </p>
                          {/* Fallback: Show current update notice if history is empty but current notice exists */}
                          {selectedRequest && selectedRequest.updateNotice && selectedRequest.updateNotice.trim() !== '' && selectedRequest.updateNotice.toLowerCase() !== 'none' && (
                            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                              <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                                  <AlertCircle className="h-4 w-4 text-orange-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-orange-900">Current Update Notice</h4>
                                  <p className="text-sm text-orange-800 mt-1 whitespace-pre-wrap">{selectedRequest.updateNotice}</p>
                                  {(selectedRequest.updateNoticeByName || selectedRequest.updateNoticeAt) && (
                                    <div className="flex items-center gap-4 mt-2 text-xs text-orange-700">
                                      <span>By: {selectedRequest.updateNoticeByName || 'Unknown'}</span>
                                      <span>•</span>
                                      <span>At: {selectedRequest.updateNoticeAt ? new Date(selectedRequest.updateNoticeAt).toLocaleString() : 'Unknown'}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Update Notice Section (for backward compatibility - only show if no history) */}
                {selectedRequest.updateNotice && selectedRequest.updateNotice.trim() !== '' && selectedRequest.updateNotice.toLowerCase() !== 'none' && updateNoticeHistory.length === 0 && !isLoadingUpdateHistory && (
                  <div className="border-b border-green-200 pb-4">
                    <h3 className="text-lg font-semibold mb-3 text-green-600">Update Notice</h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center mt-0.5">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-900">Administrator Update Notice</h4>
                          <p className="text-sm text-orange-800 mt-1 whitespace-pre-wrap">{selectedRequest.updateNotice}</p>
                          {(selectedRequest.updateNoticeByName || updateNoticeAuthorName || selectedRequest.updateNoticeAt) && (
                            <p className="text-xs text-orange-700 mt-2">
                              {(selectedRequest.updateNoticeByName || updateNoticeAuthorName) ? `By: ${selectedRequest.updateNoticeByName || updateNoticeAuthorName}` : ''}
                              {(selectedRequest.updateNoticeByName || updateNoticeAuthorName) && selectedRequest.updateNoticeAt ? ' • ' : ''}
                              {selectedRequest.updateNoticeAt ? `At: ${new Date(selectedRequest.updateNoticeAt).toLocaleString()}` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Information Section */}
                <div className="border-b border-green-200 pb-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-600">System Information</h3>
                  <div className="flex flex-wrap gap-6">
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Created At</h4>
                      <p className="text-base text-green-800">{selectedRequest.createdAt}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Last Updated</h4>
                      <p className="text-base text-green-800">{selectedRequest.updatedAt || 'Not updated'}</p>
                    </div>
                    <div className="min-w-[200px]">
                      <h4 className="text-sm font-medium text-green-700">Assigned Tutors</h4>
                      <p className="text-base text-green-800">{assignments?.length ?? selectedRequest.matchedTutors?.length ?? 0} tutors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex justify-between items-center">
              <div>
                <span className="text-sm text-muted-foreground">ID: {selectedRequest.id}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  Close
                </Button>
                <Button 
                  variant="default" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    const newStatus = selectedRequest.status.toLowerCase() === 'active' ? 'Completed' : 'Active';
                    handleStatusChange(selectedRequest.id, newStatus);
                    setShowDetailsModal(false);
                  }}
                >
                  {selectedRequest.status.toLowerCase() === 'active' ? 'Mark Completed' : 
                   selectedRequest.status.toLowerCase() === 'completed' ? 'Mark Active' : 
                   selectedRequest.status.toLowerCase() === 'inactive' ? 'Mark Active' : 
                   selectedRequest.status.toLowerCase() === 'assign' ? 'Mark Active' : 'Mark Active'}
                </Button>
                <Button variant="outline" onClick={() => openAssignTutorModal(selectedRequest)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Tutor
                </Button>
                {canDeleteRequests() && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      handleDeleteRequest(selectedRequest.id);
                      setShowDetailsModal(false);
                    }}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? 'Deleting...' : 'Delete Request'}
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {/* Enhanced Assign Tutor Modal */}
      <Dialog open={showAssignTutorModal} onOpenChange={setShowAssignTutorModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Tutor - Advanced Selection</DialogTitle>
            <DialogDescription>
              Select the best tutor for this tuition request with advanced filtering and matching.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Request Summary */}
              <div className="bg-muted/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedRequest.studentFullName || selectedRequest.studentName}</h3>
                    {selectedRequest.studentPhone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{selectedRequest.studentPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Category:</span>
                    <p className="font-medium">{selectedRequest.category || 'Not specified'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Subject:</span>
                    <p className="font-medium">{selectedRequest.subject}{selectedRequest.studentClass ? `, ${selectedRequest.studentClass}` : ''}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <p className="font-medium">{selectedRequest.tutoringType}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Location:</span>
                    <p className="font-medium">{selectedRequest.district}{selectedRequest.area ? `, ${selectedRequest.area}` : ''}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Budget:</span>
                    <p className="font-medium">৳{selectedRequest.salaryRange.min} - ৳{selectedRequest.salaryRange.max}</p>
                  </div>
                </div>
              </div>

              {/* Referring Tutor Information */}
              {selectedRequest.submittedFromTutorId && (
                <div className="bg-green-50/50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <UserPlus className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">Referred by Tutor</h4>
                      <p className="text-sm text-green-700">This request was submitted by an existing tutor</p>
                    </div>
                  </div>
                  
                  {selectedRequest.referringTutorName ? (
                    <div className="space-y-4">
                      {/* Basic Tutor Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm font-medium text-green-700">Tutor Name:</span>
                          <p className="text-base font-semibold text-green-800">{selectedRequest.referringTutorName}</p>
                        </div>
                        {selectedRequest.referringTutorEmail && (
                          <div>
                            <span className="text-sm font-medium text-green-700">Email:</span>
                            <p className="text-base text-green-800">{selectedRequest.referringTutorEmail}</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Detailed Tutor Information */}
                      {selectedTutorDetails && selectedTutorDetails.id === selectedRequest.submittedFromTutorId && (
                        <div className="border-t border-green-200 pt-4">
                          <h5 className="font-medium text-green-800 mb-3">Tutor Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700">Location:</span>
                              <p className="text-blue-800">{selectedTutorDetails.location || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">District:</span>
                              <p className="text-blue-800">{selectedTutorDetails.district || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Subjects:</span>
                              <p className="text-blue-800">{selectedTutorDetails.subjects || selectedTutorDetails.preferred_subjects || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Education:</span>
                              <p className="text-blue-800">{selectedTutorDetails.education || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Experience:</span>
                              <p className="text-blue-800">{selectedTutorDetails.experience || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Rating:</span>
                              <p className="text-blue-800">
                                {selectedTutorDetails.rating ? `${selectedTutorDetails.rating}/5 (${selectedTutorDetails.total_reviews || 0} reviews)` : 'No rating'}
                              </p>
                            </div>
                            {selectedTutorDetails.hourly_rate && (
                              <div>
                                <span className="text-blue-700">Hourly Rate:</span>
                                <p className="text-blue-800">৳{selectedTutorDetails.hourly_rate}/hr</p>
                              </div>
                            )}
                            {selectedTutorDetails.verified && (
                              <div>
                                <span className="text-blue-700">Status:</span>
                                <p className="text-blue-800">
                                  <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                                    Verified
                                  </Badge>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {assignments.some(assignment => assignment.tutor_id === selectedRequest.submittedFromTutorId) ? (
                          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-md border border-amber-200">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Already Assigned</span>
                          </div>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              // Find the referring tutor in the tutors list and select them
                              const referringTutor = tutors.find(t => t.id === selectedRequest.submittedFromTutorId);
                              if (referringTutor) {
                                setSelectedTutor(referringTutor.id);
                                // Switch to the "all" tab to show the selected tutor
                                setAssignmentTab('all');
                                toast({
                                  title: "Tutor Selected",
                                  description: `${referringTutor.full_name} has been selected for assignment`,
                                });
                              } else {
                                toast({
                                  title: "Tutor Not Found",
                                  description: "Referring tutor not found in available tutors list. Please ensure the tutor is in the system.",
                                  variant: "destructive"
                                });
                              }
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Select This Tutor
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-green-300 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-base text-green-600">Loading tutor information...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Tutor Selection Tabs */}
              <Tabs value={assignmentTab} onValueChange={(value) => setAssignmentTab(value as 'all' | 'matched' | 'nearby')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    All Tutors ({getAllTutors().length || 0})
                    {assignments.length > 0 && (
                      <span className="ml-1 text-xs text-amber-600">(-{assignments.length} assigned)</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="matched">
                    Best Matches ({selectedRequest ? getMatchedTutors(selectedRequest).length : 0})
                    {assignments.length > 0 && (
                      <span className="ml-1 text-xs text-amber-600">(-{assignments.length} assigned)</span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="nearby">
                    Nearby ({selectedRequest ? getNearbyTutors(selectedRequest).length : 0})
                    {assignments.length > 0 && (
                      <span className="ml-1 text-xs text-amber-600">(-{assignments.length} assigned)</span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Search Field */}
                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tutors by name or ID..."
                    value={tutorSearchTerm}
                    onChange={(e) => setTutorSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <TabsContent value="all" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {isLoadingTutors ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : getAllTutors().length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>{tutorSearchTerm ? 'No tutors found matching your search' : 'No tutors available'}</p>
                        <p className="text-sm text-gray-500">
                          {tutorSearchTerm ? `Search term: "${tutorSearchTerm}"` : `Tutors loaded: ${tutors.length}`}
                        </p>
                        {assignments.length > 0 && (
                          <p className="text-sm text-amber-600 mt-2">
                            {assignments.length} tutor(s) already assigned to this request
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Showing {getAllTutors().length} of {tutors.length} tutors
                          {tutorSearchTerm && ` for "${tutorSearchTerm}"`}
                        </div>
                        {getAllTutors().map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            isSelected={selectedTutor === tutor.id}
                            onSelect={() => setSelectedTutor(tutor.id)}
                            onViewDetails={() => viewTutorDetails(tutor.id)}
                            request={selectedRequest}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="matched" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {!selectedRequest ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No request selected</p>
                      </div>
                    ) : getMatchedTutors(selectedRequest).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No perfect matches found</p>
                        <p className="text-sm">Try adjusting the filters or check all tutors</p>
                        <p className="text-xs text-gray-500">Request subject: {selectedRequest.subject}, District: {selectedRequest.district}</p>
                        {assignments.length > 0 && (
                          <p className="text-sm text-amber-600 mt-2">
                            {assignments.length} tutor(s) already assigned to this request
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Found {getMatchedTutors(selectedRequest).length} matched tutors
                        </div>
                        {getMatchedTutors(selectedRequest).map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            isSelected={selectedTutor === tutor.id}
                            onSelect={() => setSelectedTutor(tutor.id)}
                            onViewDetails={() => viewTutorDetails(tutor.id)}
                            request={selectedRequest}
                            isMatched={true}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="nearby" className="space-y-4">
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {!selectedRequest ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No request selected</p>
                      </div>
                    ) : getNearbyTutors(selectedRequest).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p>No tutors in this area</p>
                        <p className="text-sm">Try expanding the search area</p>
                        <p className="text-xs text-gray-500">Request district: {selectedRequest.district}</p>
                        {assignments.length > 0 && (
                          <p className="text-sm text-amber-600 mt-2">
                            {assignments.length} tutor(s) already assigned to this request
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Found {getNearbyTutors(selectedRequest).length} nearby tutors
                        </div>
                        {getNearbyTutors(selectedRequest).map((tutor) => (
                          <TutorCard
                            key={tutor.id}
                            tutor={tutor}
                            isSelected={selectedTutor === tutor.id}
                            onSelect={() => setSelectedTutor(tutor.id)}
                            onViewDetails={() => viewTutorDetails(tutor.id)}
                            request={selectedRequest}
                            isNearby={true}
                          />
                        ))}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {/* Assignment Details */}
              {selectedTutor && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                  <h4 className="font-medium">Assignment Details</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this assignment"
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createDemo"
                        checked={createDemoClass}
                        onCheckedChange={(checked) => setCreateDemoClass(checked as boolean)}
                      />
                      <Label htmlFor="createDemo">Create Demo Class</Label>
                    </div>
                  </div>

                  {createDemoClass && (
                    <div className="space-y-4 border rounded-lg p-4 bg-background">
                      <h5 className="font-medium">Demo Class Details</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="demoDate">Demo Date & Time</Label>
                          <Input
                            id="demoDate"
                            type="datetime-local"
                            value={demoDate}
                            onChange={(e) => setDemoDate(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="demoDuration">Duration (minutes)</Label>
                          <Select value={demoDuration.toString()} onValueChange={(value) => setDemoDuration(parseInt(value))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutes</SelectItem>
                              <SelectItem value="30">30 minutes</SelectItem>
                              <SelectItem value="45">45 minutes</SelectItem>
                              <SelectItem value="60">1 hour</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="demoNotes">Demo Class Notes (Optional)</Label>
                        <Textarea
                          id="demoNotes"
                          placeholder="Add any notes for the demo class"
                          value={demoNotes}
                          onChange={(e) => setDemoNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <div className="flex flex-col space-y-4 w-full">
              {/* Notification Options */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emailNotification"
                    checked={sendEmailNotification}
                    onCheckedChange={(checked) => setSendEmailNotification(checked as boolean)}
                  />
                  <Label htmlFor="emailNotification">Send Email Notification</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smsNotification"
                    checked={sendSMSNotification}
                    onCheckedChange={(checked) => {
                      console.log('SMS Notification checkbox changed:', checked);
                      setSendSMSNotification(checked as boolean);
                    }}
                  />
                  <Label htmlFor="smsNotification">Send SMS Notification</Label>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAssignTutorModal(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignTutor} 
                  disabled={!selectedTutor || isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    'Assign Tutor'
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Assignments Modal */}
      <Dialog open={showAssignmentsModal} onOpenChange={setShowAssignmentsModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] w-[95vw]">
          <DialogHeader>
            <DialogTitle>Tutor Assignments</DialogTitle>
            <DialogDescription>
              View and manage tutors assigned to this tuition request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedRequest.studentFullName || selectedRequest.studentName}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedRequest.subject}{selectedRequest.studentClass ? `, ${selectedRequest.studentClass}` : ''} - {selectedRequest.tutoringType}
                </p>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : assignments.length === 0 ? (
                <div className="text-center py-8 border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">No tutors assigned yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => {
                      setShowAssignmentsModal(false);
                      openAssignTutorModal(selectedRequest);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Tutor
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md overflow-x-auto max-w-full">
                  <Table className="w-full">
                    <TableHeader>
                                          <TableRow>
                        <TableHead className="w-[180px]">Tutor</TableHead>
                        <TableHead className="w-[80px]">Status</TableHead>
                        <TableHead className="w-[200px]">Demo Class</TableHead>
                        <TableHead className="w-[160px]">Assigned</TableHead>
                        <TableHead className="w-[120px]">Notes</TableHead>
                        <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                      {assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="font-medium text-sm">{assignment.tutor_name}</div>
                            <div className="text-xs text-muted-foreground truncate" title={assignment.tutor_email}>{assignment.tutor_email}</div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={assignment.status === 'pending' ? 'outline' : 
                                      assignment.status === 'accepted' ? 'default' : 
                                      assignment.status === 'rejected' ? 'destructive' : 
                                      'success'}
                            >
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {assignment.demo_class_id ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    Demo
                                  </Badge>
                                  {assignment.demo_status && (
                                    <Badge 
                                      variant={assignment.demo_status === 'pending' ? 'outline' : 
                                              assignment.demo_status === 'accepted' ? 'default' : 
                                              assignment.demo_status === 'rejected' ? 'destructive' : 
                                              'success'}
                                      className="text-xs"
                                    >
                                      {assignment.demo_status.charAt(0).toUpperCase() + assignment.demo_status.slice(1)}
                                    </Badge>
                                  )}
                                </div>
                                {assignment.demo_date && (
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(assignment.demo_date).toLocaleDateString()}
                                  </div>
                                )}
                                {assignment.demo_duration && (
                                  <div className="text-xs text-muted-foreground">
                                    {assignment.demo_duration}m
                                  </div>
                                )}
                                {assignment.demo_notes && (
                                  <div className="text-xs text-muted-foreground truncate" title={assignment.demo_notes}>
                                    {assignment.demo_notes}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">No demo</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div>{new Date(assignment.assigned_at).toLocaleDateString()}</div>
                            <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span>By {(assignment as any).assigned_by_name || assignerNames[assignment.assigned_by] || assignment.assigned_by}</span>
                              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px]" onClick={() => openAssignerDetails(assignment.assigned_by)}>
                                View
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[120px]">
                            <div className="truncate" title={assignment.notes || '-'}>
                              {assignment.notes || '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-[180px]">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'pending')}>
                                  <Clock className="mr-2 h-4 w-4" />
                                  Mark Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'accepted')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Accepted
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'rejected')}>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Mark Rejected
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateAssignmentStatus(assignment.id, 'completed')}>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Mark Completed
                                </DropdownMenuItem>
                                {canDeleteRequests() && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => deleteAssignment(assignment.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete Assignment
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
            <Button variant="outline" onClick={() => setShowAssignmentsModal(false)}>
              Close
            </Button>
            {!isLoading && assignments.length > 0 && (
              <Button 
                onClick={() => {
                  setShowAssignmentsModal(false);
                  openAssignTutorModal(selectedRequest!);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Assign Another Tutor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assigner Details Dialog */}
      <Dialog open={showAssignerDialog} onOpenChange={setShowAssignerDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assigner Details</DialogTitle>
            <DialogDescription>Information about the user who assigned the tutor</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            {assignerDetails ? (
              <>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{assignerDetails.name || assignerDetails.full_name || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{assignerDetails.email || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span>{assignerDetails.role || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{assignerDetails.phone || assignerDetails.phone_number || '-'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="truncate max-w-[200px]" title={assignerDetails.id}>{assignerDetails.id}</span></div>
              </>
            ) : (
              <div className="text-muted-foreground">Loading...</div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignerDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Request Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tuition Request</DialogTitle>
            <DialogDescription>
              Update the details of this tuition request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && editFormData && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    value={editFormData.studentName || ''}
                    onChange={(e) => handleEditFormChange('studentName', e.target.value)}
                    placeholder="Student Name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <SearchableSelect
                    value={editFormData.district || ''}
                    onValueChange={(value) => handleEditFormChange('district', value)}
                    placeholder="District *"
                    options={BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district) => ({
                      value: district.id,
                      label: district.name
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="area">Thana</Label>
                  <SearchableSelect
                    value={editFormData.area || ''}
                    onValueChange={(value) => handleEditFormChange('area', value)}
                    placeholder="Thana *"
                    options={availableAreas.map((area) => ({
                      value: area,
                      label: area
                    }))}
                    disabled={!editFormData.district}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value="" 
                    onValueChange={(value) => {
                      if (value && !selectedCategories.includes(value)) {
                        handleCategorySelection(value);
                      }
                    }}
                    disabled={isLoadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category *" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(category => category && category.id).map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedCategories.map((category, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm">
                          <span>{category}</span>
                          <button
                            type="button"
                            onClick={() => handleCategorySelection(category)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subjects</Label>
                  {isLoadingCategories ? (
                    <div className="text-center py-4 text-sm">Loading subjects...</div>
                  ) : (
                    <Select 
                      value="" 
                      onValueChange={(value) => {
                        if (value && !selectedSubjects.includes(value)) {
                          handleSubjectSelection(value);
                        }
                      }}
                      disabled={!selectedCategories.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Subjects *" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.filter(subject => subject && subject.id).map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedSubjects.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedSubjects.map((subject, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm">
                          <span>{subject}</span>
                          <button
                            type="button"
                            onClick={() => handleSubjectSelection(subject)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="studentClass">Class Levels</Label>
                  {isLoadingCategories ? (
                    <div className="text-center py-4 text-sm">Loading class levels...</div>
                  ) : (
                    <Select 
                      value="" 
                      onValueChange={(value) => {
                        if (value && !selectedClasses.includes(value)) {
                          handleClassSelection(value);
                        }
                      }}
                      disabled={!selectedCategories.length}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Class Levels *" />
                      </SelectTrigger>
                      <SelectContent>
                        {classLevels.filter(classLevel => classLevel && classLevel.id).map((classLevel) => (
                          <SelectItem key={classLevel.id} value={classLevel.name}>
                            {classLevel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {selectedClasses.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {selectedClasses.map((className, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm">
                          <span>{className}</span>
                          <button
                            type="button"
                            onClick={() => handleClassSelection(className)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tutoringType">Tutoring Type</Label>
                  <Select 
                    value={editFormData.tutoringType || ''} 
                    onValueChange={(value) => handleEditFormChange('tutoringType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tutoring type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home Tutoring">Home Tutoring</SelectItem>
                      <SelectItem value="Online Tutoring">Online Tutoring</SelectItem>
                      <SelectItem value="Both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label>Salary Range (৳)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      value={editFormData.salaryRange?.min || 0}
                      onChange={(e) => handleSalaryRangeChange('min', parseInt(e.target.value))}
                      placeholder="Min"
                    />
                    <span>to</span>
                    <Input
                      type="number"
                      value={editFormData.salaryRange?.max || 0}
                      onChange={(e) => handleSalaryRangeChange('max', parseInt(e.target.value))}
                      placeholder="Max"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="adminNote">Admin Note</Label>
                  <Textarea
                    id="adminNote"
                    value={editFormData.adminNote || ''}
                    onChange={(e) => handleEditFormChange('adminNote', e.target.value)}
                    placeholder="Add admin notes for this tuition request..."
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label htmlFor="updateNotice">Update Notice</Label>
                  <Textarea
                    id="updateNotice"
                    value={editFormData.updateNotice || ''}
                    onChange={(e) => handleEditFormChange('updateNotice', e.target.value)}
                    placeholder="Add update notices for this tuition request (admin only)..."
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    This notice will only be visible to administrators
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            {selectedRequest && canDeleteRequests() && (
              <Button 
                variant="destructive"
                onClick={() => {
                  handleDeleteRequest(selectedRequest.id);
                  setShowEditModal(false);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? 'Deleting...' : 'Delete Request'}
              </Button>
            )}
            <Button 
              onClick={handleUpdateRequest} 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutor Details Modal */}
      <Dialog open={showTutorDetails} onOpenChange={setShowTutorDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tutor Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected tutor
            </DialogDescription>
          </DialogHeader>
          
          {selectedTutorDetails && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  {selectedTutorDetails.avatar_url ? (
                    <img 
                      src={selectedTutorDetails.avatar_url} 
                      alt={selectedTutorDetails.full_name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedTutorDetails.full_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{selectedTutorDetails.rating || 0} ({selectedTutorDetails.total_reviews || 0} reviews)</span>
                    </div>
                    {selectedTutorDetails.verified ? (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        Unverified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                                     <div>
                     <h4 className="font-medium mb-2">Location Information</h4>
                     <div className="space-y-2 text-sm">
                       <div className="flex items-center gap-2">
                         <MapPin className="h-4 w-4 text-muted-foreground" />
                         <span>{selectedTutorDetails.location || 'Location not specified'}</span>
                       </div>
                       {selectedTutorDetails.district && (
                         <div className="flex items-center gap-2">
                           <MapPin className="h-4 w-4 text-muted-foreground" />
                           <span>District: {selectedTutorDetails.district}</span>
                         </div>
                       )}
                     </div>
                   </div>

                  <div>
                    <h4 className="font-medium mb-2">Education & Experience</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTutorDetails.education && (
                        <div>
                          <span className="text-muted-foreground">Education:</span>
                          <p>{selectedTutorDetails.education}</p>
                        </div>
                      )}
                      {selectedTutorDetails.experience && (
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <p>{selectedTutorDetails.experience}</p>
                        </div>
                      )}
                      {selectedTutorDetails.qualification && (
                        <div>
                          <span className="text-muted-foreground">Qualification:</span>
                          <p>{selectedTutorDetails.qualification}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Teaching Details</h4>
                    <div className="space-y-2 text-sm">
                      {selectedTutorDetails.subjects && (
                        <div>
                          <span className="text-muted-foreground">Subjects:</span>
                          <p>{selectedTutorDetails.subjects}</p>
                        </div>
                      )}
                      {selectedTutorDetails.hourly_rate && (
                        <div>
                          <span className="text-muted-foreground">Hourly Rate:</span>
                          <p>৳{selectedTutorDetails.hourly_rate}</p>
                        </div>
                      )}
                      
                    </div>
                  </div>

                  {selectedTutorDetails.bio && (
                    <div>
                      <h4 className="font-medium mb-2">Bio</h4>
                      <p className="text-sm text-muted-foreground">{selectedTutorDetails.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTutorDetails(false)}>
              Close
            </Button>
            {selectedTutorDetails && (
              <Button 
                onClick={() => {
                  setSelectedTutor(selectedTutorDetails.id);
                  setShowTutorDetails(false);
                  setShowAssignTutorModal(true);
                }}
              >
                Select This Tutor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// TutorCard Component
interface TutorCardProps {
  tutor: LocalTutor;
  isSelected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  request: TuitionRequest;
  isMatched?: boolean;
  isNearby?: boolean;
}

function TutorCard({ tutor, isSelected, onSelect, onViewDetails, request, isMatched, isNearby }: TutorCardProps) {
  const getMatchScore = () => {
    let score = 0;
    
    // Subject match (40 points)
    const tutorSubjects = Array.isArray(tutor.subjects) 
      ? tutor.subjects.join(',').toLowerCase() 
      : (tutor.subjects || '').toLowerCase();
    const tutorPreferredSubjects = Array.isArray(tutor.preferred_subjects) 
      ? tutor.preferred_subjects.join(',').toLowerCase() 
      : (tutor.preferred_subjects || '').toLowerCase();
    
    if (tutorSubjects.includes(request.subject.toLowerCase()) ||
        tutorPreferredSubjects.includes(request.subject.toLowerCase())) {
      score += 40;
    }
    
    // Location match (30 points)
    if (tutor.district === request.district) {
      score += 30;
    } else if ((tutor.location?.toLowerCase() || '').includes(request.district.toLowerCase())) {
      score += 20;
    }
    
    // Salary match (20 points)
    if (tutor.expected_salary && 
        tutor.expected_salary >= request.salaryRange.min && 
        tutor.expected_salary <= request.salaryRange.max) {
      score += 20;
    }
    
    // Rating bonus (10 points)
    if (tutor.rating && tutor.rating >= 4.5) {
      score += 10;
    }
    
    return score;
  };

  const matchScore = getMatchScore();

  return (
    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
      isSelected 
        ? 'border-green-500 bg-green-50' 
        : 'border-border hover:border-primary/50 hover:bg-muted/20'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            {tutor.avatar_url ? (
              <img 
                src={tutor.avatar_url} 
                alt={tutor.full_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <User className="h-6 w-6 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium truncate">{tutor.full_name}</h4>
              {tutor.verified ? (
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                  Verified
                </Badge>
              ) : (
                <Badge variant="outline" className="text-yellow-600 border-yellow-600 text-xs">
                  Unverified
                </Badge>
              )}
              {(isMatched || isNearby) && (
                <Badge variant="outline" className="text-blue-600 border-blue-600 text-xs">
                  {isMatched ? 'Best Match' : 'Nearby'}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>{tutor.rating || 0}</span>
                {tutor.total_reviews > 0 && (
                  <span className="text-xs">({tutor.total_reviews} reviews)</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{tutor.district || tutor.location || 'Location N/A'}</span>
              </div>
              {tutor.hourly_rate && (
                <div className="flex items-center gap-1">
                  <span>৳{tutor.hourly_rate}/hr</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="truncate">
                  {tutor.subjects || tutor.preferred_subjects || 'Subjects N/A'}
                </span>
              </div>
              {tutor.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="truncate">{tutor.education}</span>
                </div>
              )}
              {tutor.experience && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="truncate">{tutor.experience}</span>
                </div>
              )}
              {tutor.tutor_id && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-xs font-mono">ID: {tutor.tutor_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {matchScore > 0 && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Match Score</div>
              <div className="text-lg font-semibold text-green-600">{matchScore}%</div>
            </div>
          )}
          
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant={isSelected ? "default" : "outline"}
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected ? 'Selected' : 'Select'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}