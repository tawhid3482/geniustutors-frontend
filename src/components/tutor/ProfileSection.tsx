import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { profileService } from '@/services/profileService';
import tutorDetailsService from '@/services/tutorDetailsService';
import { documentService } from '@/services/documentService';
import { avatarService } from '@/services/avatarService';
import { Loader2, CheckCircle, Shield, Award, BadgeCheck } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { taxonomyService, Category } from '@/services/taxonomyService';
import { SUBJECT_OPTIONS, CLASS_LEVELS } from '@/data/mockData';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from '@/data/bangladeshDistricts';
import { MultiSelect } from '@/components/ui/multi-select';
import { SKILLS } from '@/data/skills';
import { Badge } from '@/components/ui/badge';
import { getUpgradeStatus, type UpgradeStatus } from '@/services/upgradeService';



interface TutorProfile {
  full_name: string;
  email: string;
  phone: string;
  avatar_url: string;
  district: string;
  location: string;
  bio: string;
  education: string;
  experience: string;
  subjects: string;
  hourly_rate: number;
  availability: Record<string, string[]>;
  qualification: string;
  expected_salary: string;
  availability_status: string;
  days_per_week: number;
  preferred_tutoring_style: string[];
  tutoring_experience: string;
  place_of_learning: string[];
  extra_facilities: string;
  preferred_medium: string[];
  preferred_class: string;
  preferred_subjects: string;
  preferred_time: string[];
  preferred_student_gender: string;
  alternative_phone: string;
  university_name: string;
  department_name: string;
  university_year: string;
  religion: string;
  nationality: string;
  social_media_links: string;
  preferred_tutoring_category: string;
  present_location: string;
  educational_qualifications: string;
  other_skills: string[];
}

export default function ProfileSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus | null>(null);
  
  // Helper function to construct full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) {
      return `${API_BASE_URL.replace('/api', '')}${imagePath}`;
    }
    return imagePath;
  };
  
  const [profile, setProfile] = useState({
    photo: '',
    name: '',
    location: '',
    district: '',
    area: '',
    rate: '',
    experience: '',
    about: '',
    phone: '',
    email: '',
    qualification: '',
    expectedSalary: '',
    otherSkills: [] as string[],

    daysPerWeek: 0,
    tutoringStyles: [] as string[],
    placeOfLearning: [] as string[],
    extraFacilities: '',
    preferredMedium: [] as string[],
    preferredClass: '',
    preferredSubjects: '',
    preferredTime: [] as string[],
    preferredStudentGender: 'any',
    alternativePhone: '',
    universityName: '',
    departmentName: '',
    universityYear: '',
    religion: '',
    nationality: '',
    bloodGroup: '',
    socialMediaLinks: '',
    preferredTutoringCategory: '',
    presentLocation: '',
    documentUrls: {} as Record<string, string>,
    // New fields for taxonomy
    selectedCategories: [] as string[],
    selectedSubjects: [] as string[],
    selectedClasses: [] as string[],
    // Preferred areas field
    preferredAreas: [] as string[],
    // Educational qualifications
    educationalQualifications: [
      {
        examTitle: '',
        institute: '',
        board: '',
        group: '',
        year: '',
        gpa: ''
      }
    ] as Array<{
      examTitle: string;
      institute: string;
      board: string;
      group: string;
      year: string;
      gpa: string;
    }>
  });
  
  const [documents, setDocuments] = useState({
    id: null as File | null,
    certificateFront: null as File | null,
    certificateBack: null as File | null,
    education: null as File | null,
  });
  
  // Taxonomy data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);

  // Available areas based on selected district
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  
  // Fetch upgrade status
  const fetchUpgradeStatus = async () => {
    try {
      const response = await getUpgradeStatus();
      if (response.success) {
        setUpgradeStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching upgrade status:', error);
    }
  };
  
  // Fetch tutor profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch basic profile data
        const profileResponse = await profileService.getProfile(user.id);
        
        // Fetch upgrade status
        await fetchUpgradeStatus();
        
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          
          setProfile(prev => ({
            ...prev,
            name: userData.full_name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            photo: userData.avatar_url || '',
            location: userData.location || '',
            area: userData.area || userData.location || '',
            district: userData.district || '',
            about: userData.bio || '',
            experience: userData.experience || '',
            rate: userData.hourly_rate?.toString() || '',
            otherSkills: Array.isArray(userData.other_skills) ? userData.other_skills : []
          }));
          

        }
        
        // Fetch tutor-specific details
        try {
          const tutorDetailsResponse = await tutorDetailsService.getTutorDetails();
          
          if (tutorDetailsResponse.success && tutorDetailsResponse.data) {
            const tutorData = tutorDetailsResponse.data;
            
            setProfile(prev => ({
              ...prev,
              qualification: tutorData.qualification || '',
              expectedSalary: tutorData.expected_salary || '',
              daysPerWeek: tutorData.days_per_week || 0,
              tutoringStyles: Array.isArray(tutorData.preferred_tutoring_style) ? tutorData.preferred_tutoring_style : [],
              placeOfLearning: Array.isArray(tutorData.place_of_learning) ? tutorData.place_of_learning : [],
              extraFacilities: tutorData.extra_facilities || '',
              preferredMedium: Array.isArray(tutorData.preferred_medium) ? tutorData.preferred_medium : [],
              preferredClass: tutorData.preferred_class || '',
              preferredSubjects: tutorData.preferred_subjects || '',
              preferredTime: Array.isArray(tutorData.preferred_time) ? tutorData.preferred_time : [],
              preferredStudentGender: tutorData.preferred_student_gender || 'any',
              alternativePhone: tutorData.alternative_phone || '',
              universityName: tutorData.university_name || '',
              departmentName: tutorData.department_name || '',
              universityYear: tutorData.university_year || '',
              religion: tutorData.religion || '',
              nationality: tutorData.nationality || '',
              bloodGroup: tutorData.blood_group || '',
              socialMediaLinks: tutorData.social_media_links || '',
              preferredTutoringCategory: tutorData.preferred_tutoring_category || '',
              presentLocation: tutorData.present_location || '',
              area: tutorData.present_location || prev.area,
              educationalQualifications: Array.isArray(tutorData.educational_qualifications) 
                ? tutorData.educational_qualifications 
                : [{ examTitle: '', institute: '', board: '', group: '', year: '', gpa: '' }],
              otherSkills: Array.isArray(tutorData.other_skills) ? tutorData.other_skills : []
            }));
          }
        } catch (error) {
          console.error('Error fetching tutor details:', error);
          // Don't show error toast here as the user might be a new tutor without details yet
        }
        
        // Fetch uploaded documents
        try {
          const documentsData = await documentService.getTutorDocuments();
          if (documentsData.success && documentsData.data) {
            // Update UI to show uploaded documents
            const documentUrls: Record<string, string> = {};
            documentsData.data.forEach(doc => {
              documentUrls[doc.document_type] = doc.file_url;
            });
            
            setProfile(prev => ({
              ...prev,
              documentUrls: documentUrls
            }));
          }
        } catch (error) {
          console.error('Error fetching document data:', error);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load profile data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user?.id, toast]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleMultiSelectChange = (name: string, value: string) => {
    setProfile((prev) => {
      const currentValues = prev[name as keyof typeof prev] as string[];
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          return { ...prev, [name]: currentValues.filter(v => v !== value) };
        } else {
          return { ...prev, [name]: [...currentValues, value] };
        }
      }
      return prev;
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a JPG, PNG, or GIF image',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 2MB',
          variant: 'destructive'
        });
        return;
      }
      
      // Show preview immediately
      setProfile((prev) => ({ ...prev, photo: URL.createObjectURL(file) }));
      
      // Upload to server
      try {
        setIsUploadingPhoto(true);
        const result = await avatarService.uploadAvatar(file);
        
        if (result.success && result.data) {
          // Update profile with the server URL
          setProfile((prev) => ({ ...prev, photo: result.data!.fileUrl }));
          
          toast({
            title: 'Success',
            description: 'Profile photo uploaded successfully',
            variant: 'default'
          });
        } else {
          // Revert to previous photo on error
          setProfile((prev) => ({ ...prev, photo: prev.photo }));
          
          toast({
            title: 'Error',
            description: result.error || 'Failed to upload profile photo',
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error('Error uploading profile photo:', error);
        // Revert to previous photo on error
        setProfile((prev) => ({ ...prev, photo: prev.photo }));
        
        toast({
          title: 'Error',
          description: 'Failed to upload profile photo',
          variant: 'destructive'
        });
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleDocumentChange = async (type: 'id' | 'certificateFront' | 'certificateBack' | 'education', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setDocuments((prev) => ({ ...prev, [type]: file }));
      
      // Upload the document immediately
      try {
        setIsSaving(true);
        const result = await documentService.uploadTutorDocument(file, type);
        if (result.success) {
          toast({
            title: 'Success',
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} document uploaded successfully`,
            variant: 'default'
          });
        } else {
          toast({
            title: 'Error',
            description: result.error || `Failed to upload ${type} document`,
            variant: 'destructive'
          });
        }
      } catch (error) {
        console.error(`Error uploading ${type} document:`, error);
        toast({
          title: 'Error',
          description: `Failed to upload ${type} document`,
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Fetch all taxonomy data
  const fetchTaxonomyData = useCallback(async () => {
    setIsLoadingTaxonomy(true);
    try {
      const taxonomy = await taxonomyService.getTaxonomyData();
      // setCategories(taxonomy.categories || []);
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
      // Set empty array as fallback
      setCategories([]);
    } finally {
      setIsLoadingTaxonomy(false);
    }
  }, [toast]);

  // Fetch taxonomy for multiple categories and aggregate subjects and classes
  const fetchMultiCategoryTaxonomy = useCallback(async (categoryNames: string[]) => {
    setIsLoadingTaxonomy(true);
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

      if (allSubjects.length === 0 && allClassLevels.length === 0) {
        // Fallback to mock data if all API calls fail
        setSubjects(SUBJECT_OPTIONS.filter(subject => subject !== 'All Subjects')
          .map((name, index) => ({ id: index + 1, name })));
        setClassLevels(CLASS_LEVELS.map((name, index) => ({ id: index + 1, name })));
      }
    } catch (error) {
      console.error('Error fetching multi-category taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects and class levels',
        variant: 'destructive'
      });
      // Fallback to mock data if API fails
      setSubjects(SUBJECT_OPTIONS.filter(subject => subject !== 'All Subjects')
        .map((name, index) => ({ id: index + 1, name })));
      setClassLevels(CLASS_LEVELS.map((name, index) => ({ id: index + 1, name })));
    } finally {
      setIsLoadingTaxonomy(false);
    }
  }, [categories, toast]);

  // Handle category selection
  const handleCategorySelection = (categoryName: string) => {
    setProfile(prev => {
      const currentCategories = prev.selectedCategories || [];
      const categories = currentCategories.includes(categoryName)
        ? currentCategories.filter(c => c !== categoryName)
        : [...currentCategories, categoryName];
      
      return {
        ...prev,
        selectedCategories: categories
      };
    });
  };

  // Handle subject selection
  const handleSubjectSelection = (subjectName: string) => {
    setProfile(prev => {
      const currentSubjects = prev.selectedSubjects || [];
      const subjects = currentSubjects.includes(subjectName)
        ? currentSubjects.filter(s => s !== subjectName)
        : [...currentSubjects, subjectName];
      
      return {
        ...prev,
        selectedSubjects: subjects
      };
    });
  };

  // Handle class selection
  const handleClassSelection = (className: string) => {
    setProfile(prev => {
      const currentClasses = prev.selectedClasses || [];
      const classes = currentClasses.includes(className)
        ? currentClasses.filter(c => c !== className)
        : [...currentClasses, className];
      
      return {
        ...prev,
        selectedClasses: classes
      };
    });
  };

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

  // Handle preferred areas change
  const handlePreferredAreasChange = (areas: string[]) => {
    setProfile(prev => ({ ...prev, preferredAreas: areas }));
  };

  // Handle other skills change
  const handleOtherSkillsChange = (skills: string[]) => {
    setProfile(prev => ({ ...prev, otherSkills: skills }));
  };

  // Handle educational qualification change
  const handleEducationalQualificationChange = (index: number, field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      educationalQualifications: prev.educationalQualifications.map((qual, i) => 
        i === index ? { ...qual, [field]: value } : qual
      )
    }));
  };

  // Add new educational qualification
  const addEducationalQualification = () => {
    setProfile(prev => ({
      ...prev,
      educationalQualifications: [
        ...prev.educationalQualifications,
        {
          examTitle: '',
          institute: '',
          board: '',
          group: '',
          year: '',
          gpa: ''
        }
      ]
    }));
  };

  // Remove educational qualification
  const removeEducationalQualification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      educationalQualifications: prev.educationalQualifications.filter((_, i) => i !== index)
    }));
  };

  // Fetch taxonomy data on component mount
  useEffect(() => {
    fetchTaxonomyData();
  }, [fetchTaxonomyData]);
  
  // Fetch category-specific subjects and class levels when selected categories change
  useEffect(() => {
    if (profile.selectedCategories && profile.selectedCategories.length > 0) {
      fetchMultiCategoryTaxonomy(profile.selectedCategories);
      // Reset selected subjects and classes when categories change
      setProfile(prev => ({
        ...prev,
        selectedSubjects: [],
        selectedClasses: []
      }));
    } else {
      // Clear subjects and classes when no categories are selected
      setSubjects([]);
      setClassLevels([]);
    }
  }, [profile.selectedCategories, fetchMultiCategoryTaxonomy]);

  // Update available areas when district changes
  useEffect(() => {
    if (profile.district) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(d => d.id === profile.district);
      if (district) {
        setAvailableAreas(district.areas.map(area => area.name));
        // Reset area when district changes
        setProfile(prev => ({
          ...prev,
          area: ''
        }));
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
    }
  }, [profile.district]);

  // Form validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form fields - All fields are optional
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Only validate numeric format if values are provided
    if (profile.rate && isNaN(parseFloat(profile.rate))) {
      newErrors.rate = 'Hourly rate must be a valid number';
    }
    
    if (profile.daysPerWeek && (isNaN(Number(profile.daysPerWeek)) || Number(profile.daysPerWeek) < 1 || Number(profile.daysPerWeek) > 7)) {
      newErrors.daysPerWeek = 'Days per week must be between 1 and 7';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Update basic profile information
      const profileUpdateData = {
        full_name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.area || profile.location,
        district: profile.district,
        area: profile.area,
        bio: profile.about,
        experience: profile.experience,
        hourly_rate: parseFloat(profile.rate) || 0,
        other_skills: profile.otherSkills
      };
      
      const profileResponse = await profileService.updateProfile(user.id, profileUpdateData);
      
      if (!profileResponse.success) {
        throw new Error(profileResponse.message || 'Failed to update profile');
      }
      
      // Update tutor-specific details
      const tutorData = {
        user_id: user.id,
        district: profile.district,
        location: profile.area || profile.location, // Use area as location
        qualification: profile.qualification,
        expectedSalary: profile.expectedSalary,
        availabilityStatus: 'available',
        daysPerWeek: parseInt(profile.daysPerWeek.toString()) || 0,
        tutoringStyles: Array.isArray(profile.tutoringStyles) ? profile.tutoringStyles : [],
        experience: profile.experience,
        placeOfLearning: Array.isArray(profile.placeOfLearning) ? profile.placeOfLearning : [],
        extraFacilities: profile.extraFacilities ? [profile.extraFacilities] : [],
        preferredMedium: Array.isArray(profile.preferredMedium) ? profile.preferredMedium : [],
        preferredClasses: profile.preferredClass ? [profile.preferredClass] : [],
        preferredSubjects: profile.preferredSubjects ? (Array.isArray(profile.preferredSubjects) ? profile.preferredSubjects : [profile.preferredSubjects]) : [],
        preferredTime: Array.isArray(profile.preferredTime) ? profile.preferredTime : [],
        preferredStudentGender: profile.preferredStudentGender,
        bloodGroup: profile.bloodGroup,
        alternativePhone: profile.alternativePhone,
        universityDetails: {
          name: profile.universityName || '',
          department: profile.departmentName || '',
          year: profile.universityYear || ''
        },
        religion: profile.religion,
        nationality: profile.nationality,
        socialMediaLinks: {},
        preferredTutoringCategory: profile.preferredTutoringCategory ? [profile.preferredTutoringCategory] : [],
        presentLocation: profile.area || profile.presentLocation, // Use area as present location
        educationalQualifications: profile.educationalQualifications,
        otherSkills: profile.otherSkills
      };
      
      // Check if tutor details already exist by trying to get them first
      let tutorResponse;
      let tutorDetailsExist = false;
      
      try {
        // Try to get existing tutor details to check if they exist
        const existingDetails = await tutorDetailsService.getTutorDetails();
        tutorDetailsExist = existingDetails.success;
      } catch (error) {
        console.log('No existing tutor details found, will create new ones');
        tutorDetailsExist = false;
      }

      if (tutorDetailsExist) {
        // Update existing tutor details
        try {
          tutorResponse = await tutorDetailsService.updateTutorDetails(tutorData);
        } catch (updateError) {
          console.log('Update method failed, trying basic update method:', updateError);
          try {
            // Try basic update without problematic fields
            const basicTutorData = {
              district: profile.district,
              location: profile.area || profile.location,
              qualification: profile.qualification,
              expectedSalary: profile.expectedSalary,
              daysPerWeek: parseInt(profile.daysPerWeek.toString()) || 0,
              experience: profile.experience,
              bloodGroup: profile.bloodGroup,
              alternativePhone: profile.alternativePhone,
              universityDetails: {
                name: profile.universityName || '',
                department: profile.departmentName || '',
                year: profile.universityYear || ''
              },
              religion: profile.religion,
              nationality: profile.nationality,
              presentLocation: profile.area || profile.presentLocation,
              educationalQualifications: profile.educationalQualifications,
              otherSkills: profile.otherSkills
            };
            tutorResponse = await tutorDetailsService.updateBasicTutorDetails(basicTutorData);
          } catch (basicUpdateError) {
            console.log('Basic update method failed:', basicUpdateError);
            throw basicUpdateError;
          }
        }
      } else {
        // Create new tutor details (only for new tutors)
        console.log('Creating new tutor details for new tutor');
        try {
          tutorResponse = await tutorDetailsService.submitTutorDetails(tutorData);
        } catch (submitError: any) {
          // If tutor details already exist, try to update instead
          if (submitError.message?.includes('TUTOR_DETAILS_EXIST') || submitError.message?.includes('already exist')) {
            console.log('Tutor details already exist, switching to update mode');
            tutorResponse = await tutorDetailsService.updateTutorDetails(tutorData);
          } else {
            throw submitError;
          }
        }
      }
      
      if (!tutorResponse.success) {
        // Attempt to persist blood group even if the main update failed
        if (profile.bloodGroup) {
          try {
            await tutorDetailsService.updateBasicTutorDetails({ user_id: user.id, bloodGroup: profile.bloodGroup } as any);
          } catch (bgErr) {
            console.warn('Blood group update fallback after failure failed:', bgErr);
          }
        }
        throw new Error(tutorResponse.message || 'Failed to update tutor details');
      }

      // Ensure blood group is persisted even if main update endpoint ignores unknown fields
      if (profile.bloodGroup) {
        try {
          await tutorDetailsService.updateBasicTutorDetails({ user_id: user.id, bloodGroup: profile.bloodGroup } as any);
        } catch (bgErr) {
          console.warn('Blood group update fallback failed:', bgErr);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        <span className="ml-2 text-lg">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Badge Display Section */}
          {upgradeStatus && (upgradeStatus.hasPremium || upgradeStatus.hasVerified) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Your Status
              </h3>
              <div className="flex gap-3 flex-wrap">
                {upgradeStatus.hasPremium && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                    <Shield className="h-4 w-4 mr-1" />
                    Genius Tutor
                  </Badge>
                )}
                {upgradeStatus.hasVerified && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    Verified Tutor
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {upgradeStatus.hasPremium && upgradeStatus.hasVerified 
                  ? "You have both Genius and Verified status with full access to all premium features."
                  : upgradeStatus.hasPremium 
                    ? "You have Genius status with access to premium features."
                    : "You have Verified status which builds trust with students and parents."
                }
              </p>
            </div>
          )}
        </CardContent>
        <CardContent className="space-y-4">
          {user?.tutor_id && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <div className="text-green-700 font-medium">Tutor ID:</div>
                <div className="ml-2 bg-white px-3 py-1 rounded border border-green-200 font-mono">{user.tutor_id}</div>
              </div>
            </div>
          )}
          {/* Profile Image Upload - Top Section */}
          <div className="mb-6">
            <Label>Profile Photo</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="relative">
                  <img
                    src={getImageUrl(profile.photo)}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <Input 
                    type="file" 
                    accept="image/jpeg,image/jpg,image/png,image/gif" 
                    onChange={handlePhotoChange}
                    disabled={isUploadingPhoto}
                  />
                  <p className="text-xs text-gray-500">
                    JPG, PNG, or GIF (max 2MB)
                  </p>
                  {profile.photo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setProfile(prev => ({ ...prev, photo: '' }))}
                      disabled={isUploadingPhoto}
                      className="text-xs"
                    >
                      Remove Photo
                    </Button>
                  )}
                </div>
              </div>
            </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                                 <Label>Name</Label>
                <Input 
                  name="name" 
                  value={profile.name} 
                  onChange={handleProfileChange} 
                  placeholder="Full Name" 
                                   />
              </div>
              <div>
                <Label>Email</Label>
                <Input name="email" value={profile.email} onChange={handleProfileChange} placeholder="Email" />
              </div>
              <div>
                                 <Label>Phone</Label>
                <Input 
                  name="phone" 
                  value={profile.phone} 
                  onChange={handleProfileChange} 
                  placeholder="Phone Number" 
                                   />
              </div>
              <div>
                <Label>Alternative Phone</Label>
                <Input name="alternativePhone" value={profile.alternativePhone} onChange={handleProfileChange} placeholder="Alternative Phone" />
              </div>
          </div>

          {/* University Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
              <Label>Institute Name</Label>
                <Input 
                name="universityName" 
                value={profile.universityName} 
                  onChange={handleProfileChange} 
                placeholder="Institute Name" 
                                   />
              </div>
              <div>
              <Label>Department</Label>
                <Input 
                name="departmentName" 
                value={profile.departmentName} 
                  onChange={handleProfileChange} 
                placeholder="Department" 
                                   />
              </div>
              <div>
              <Label>Year/Semester</Label>
                <Input 
                name="universityYear" 
                value={profile.universityYear} 
                  onChange={handleProfileChange} 
                placeholder="Year/Semester" 
                                   />
              </div>
              <div>
              <Label>Blood Group</Label>
              <Select value={profile.bloodGroup} onValueChange={(value) => handleSelectChange('bloodGroup', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Religion</Label>
                <Input 
                name="religion" 
                value={profile.religion} 
                  onChange={handleProfileChange} 
                placeholder="Religion" 
                                   />
              </div>
              <div>
              <Label>Nationality</Label>
                <Input 
                name="nationality" 
                value={profile.nationality} 
                  onChange={handleProfileChange} 
                placeholder="Nationality" 
              />
            </div>
            <div>
              <Label>Preferred Student Gender</Label>
              <Select value={profile.preferredStudentGender} onValueChange={(value) => handleSelectChange('preferredStudentGender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="any">Any</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Other Skills and Days Per Week - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Other Skills (Select up to 5)</Label>
              <MultiSelect
                value={profile.otherSkills}
                onValueChange={handleOtherSkillsChange}
                placeholder="Select your other skills"
                options={SKILLS.map((skill) => ({
                  value: skill,
                  label: skill
                }))}
                maxSelections={5}
              />
              {profile.otherSkills.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected {profile.otherSkills.length} of 5 skills
                </div>
              )}
            </div>
            <div>
              <Label>Days Per Week</Label>
              <Select 
                value={profile.daysPerWeek.toString()} 
                onValueChange={(value) => handleSelectChange('daysPerWeek', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select days per week" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="2">2 Days</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="4">4 Days</SelectItem>
                  <SelectItem value="5">5 Days</SelectItem>
                  <SelectItem value="6">6 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Location and Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>District</Label>
              <SearchableSelect
                value={profile.district}
                onValueChange={(value) => handleSelectChange('district', value)}
                placeholder="Select District"
                options={BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map((district) => ({
                  value: district.id,
                  label: district.name
                }))}
              />
                  </div>
            <div>
              <Label>Present Location</Label>
              <SearchableSelect
                value={profile.area}
                onValueChange={(value) => handleSelectChange('area', value)}
                placeholder="Select Present Location"
                options={availableAreas.map((area) => ({
                  value: area,
                  label: area
                }))}
                disabled={!profile.district}
              />
              </div>
            <div>
              <Label>Preferable Area</Label>
              <MultiSelect
                value={profile.preferredAreas}
                onValueChange={handlePreferredAreasChange}
                placeholder="Select preferable areas"
                options={getAllThanas().map((thana) => ({
                  value: thana,
                  label: thana
                }))}
                maxSelections={5}
              />
            </div>
            <div>
              <Label>Expected Salary</Label>
              <Input name="expectedSalary" value={profile.expectedSalary} onChange={handleProfileChange} placeholder="Expected Monthly Salary" />
            </div>
            <div>
              <Label>Tutoring Experience (years)</Label>
              <Input name="experience" value={profile.experience} onChange={handleProfileChange} placeholder="e.g. 3" />
            </div>
            <div>
              <Label>Qualification</Label>
              <Input 
                name="qualification" 
                value={profile.qualification} 
                onChange={handleProfileChange} 
                placeholder="Highest Qualification" 
              />
              </div>
            </div>
            
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                             <Label className="mb-2 block">Preferred Tutoring Method</Label>
              <div className="space-y-2">
                {['Home Tutoring', 'Batch Tutoring', 'Online Tutoring'].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`style-${style.replace(/\s+/g, '-').toLowerCase()}`} 
                      checked={profile.tutoringStyles.includes(style)}
                      onCheckedChange={(checked) => {
                        if (checked) handleMultiSelectChange('tutoringStyles', style);
                        else handleMultiSelectChange('tutoringStyles', style);
                      }}
                    />
                    <label htmlFor={`style-${style.replace(/\s+/g, '-').toLowerCase()}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {style}
                    </label>
                  </div>
                ))}
              </div>
              
            </div>
            
            
            
            <div>
                             <Label className="mb-2 block">Available Time</Label>
                             <div className="space-y-2">
                {['morning', 'afternoon', 'evening', 'night', 'other'].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`time-${time}`} 
                      checked={profile.preferredTime.includes(time)}
                      onCheckedChange={(checked) => {
                        if (checked) handleMultiSelectChange('preferredTime', time);
                        else handleMultiSelectChange('preferredTime', time);
                      }}
                    />
                    <label htmlFor={`time-${time}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {time.charAt(0).toUpperCase() + time.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
              
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label>Preferred Categories</Label>
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (value && !profile.selectedCategories.includes(value)) {
                    handleCategorySelection(value);
                  }
                }}
                disabled={isLoadingTaxonomy}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Categories" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(category => category && category.id).map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {profile.selectedCategories.length > 0 && (
                <div className="mt-2 space-y-1">
                  {profile.selectedCategories.map((category, index) => (
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
            
            <div>
              <Label>Preferred Subjects</Label>
              {isLoadingTaxonomy ? (
                <div className="text-center py-4 text-sm">Loading subjects...</div>
              ) : (
                <Select 
                  value="" 
                  onValueChange={(value) => {
                    if (value && !profile.selectedSubjects.includes(value)) {
                      handleSubjectSelection(value);
                    }
                  }}
                  disabled={!profile.selectedCategories.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Subjects" />
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
              {profile.selectedSubjects.length > 0 && (
                <div className="mt-2 space-y-1">
                  {profile.selectedSubjects.map((subject, index) => (
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
          
          <div>
              <Label>Preferred Class Levels</Label>
              {isLoadingTaxonomy ? (
                <div className="text-center py-4 text-sm">Loading class levels...</div>
              ) : (
                <Select 
                  value="" 
                  onValueChange={(value) => {
                    if (value && !profile.selectedClasses.includes(value)) {
                      handleClassSelection(value);
                    }
                  }}
                  disabled={!profile.selectedCategories.length}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class Levels" />
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
              {profile.selectedClasses.length > 0 && (
                <div className="mt-2 space-y-1">
                  {profile.selectedClasses.map((className, index) => (
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
          </div>
          
          {/* Educational Qualification Section */}
          <div className="mt-8">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Educational Information</h3>
              <div className="flex-1 h-px bg-gray-300 ml-4"></div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Exam Title</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Institute</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Board</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">Group</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Year</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">GPA</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.educationalQualifications.map((qual, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-3 py-2">
                        <Select 
                          value={qual.examTitle} 
                          onValueChange={(value) => handleEducationalQualificationChange(index, 'examTitle', value)}
                        >
                          <SelectTrigger className="border-0 shadow-none h-8">
                            <SelectValue placeholder="Select Exam" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Primary School Certificate (PSC)">Primary School Certificate (PSC)</SelectItem>
                            <SelectItem value="Primary Education Completion (PEC)">Primary Education Completion (PEC)</SelectItem>
                            <SelectItem value="Junior School Certificate (JSC)">Junior School Certificate (JSC)</SelectItem>
                            <SelectItem value="Secondary School Certificate (SSC)">Secondary School Certificate (SSC)</SelectItem>
                            <SelectItem value="O Level">O Level</SelectItem>
                            <SelectItem value="Dakhil">Dakhil</SelectItem>
                            <SelectItem value="Ebtedayee">Ebtedayee</SelectItem>
                            <SelectItem value="Higher Secondary Certificate (HSC)">Higher Secondary Certificate (HSC)</SelectItem>
                            <SelectItem value="A Level">A Level</SelectItem>
                            <SelectItem value="Alim">Alim</SelectItem>
                            <SelectItem value="Ibtedayee">Ibtedayee</SelectItem>
                            <SelectItem value="Bachelor's Degree (BA)">Bachelor's Degree (BA)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSc)">Bachelor's Degree (BSc)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSS)">Bachelor's Degree (BSS)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BCom)">Bachelor's Degree (BCom)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BBA)">Bachelor's Degree (BBA)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BBS)">Bachelor's Degree (BBS)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSc Engineering)">Bachelor's Degree (BSc Engineering)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSc Agriculture)">Bachelor's Degree (BSc Agriculture)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSc Textile Technology)">Bachelor's Degree (BSc Textile Technology)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSc Leather Technology)">Bachelor's Degree (BSc Leather Technology)</SelectItem>
                            <SelectItem value="Bachelor's Degree (BSc Tech Education)">Bachelor's Degree (BSc Tech Education)</SelectItem>
                            <SelectItem value="Fazil">Fazil</SelectItem>
                            <SelectItem value="Master's Degree (MA)">Master's Degree (MA)</SelectItem>
                            <SelectItem value="Master's Degree (MSc)">Master's Degree (MSc)</SelectItem>
                            <SelectItem value="Master's Degree (MSS)">Master's Degree (MSS)</SelectItem>
                            <SelectItem value="Master's Degree (MCom)">Master's Degree (MCom)</SelectItem>
                            <SelectItem value="Master's Degree (MBA)">Master's Degree (MBA)</SelectItem>
                            <SelectItem value="Master's Degree (MBS)">Master's Degree (MBS)</SelectItem>
                            <SelectItem value="Master's Degree (MSc Engineering)">Master's Degree (MSc Engineering)</SelectItem>
                            <SelectItem value="Master's Degree (MSc Agriculture)">Master's Degree (MSc Agriculture)</SelectItem>
                            <SelectItem value="Kamil">Kamil</SelectItem>
                            <SelectItem value="PhD">PhD</SelectItem>
                            <SelectItem value="MPhil">MPhil</SelectItem>
                            <SelectItem value="Post Graduate Diploma">Post Graduate Diploma</SelectItem>
                            <SelectItem value="Diploma in Engineering">Diploma in Engineering</SelectItem>
                            <SelectItem value="Diploma in Medical Technology">Diploma in Medical Technology</SelectItem>
                            <SelectItem value="Diploma in Nursing">Diploma in Nursing</SelectItem>
                            <SelectItem value="Diploma in Agriculture">Diploma in Agriculture</SelectItem>
                            <SelectItem value="Certificate Course">Certificate Course</SelectItem>
                            <SelectItem value="Vocational Training Certificate">Vocational Training Certificate</SelectItem>
                            <SelectItem value="Technical Training Certificate">Technical Training Certificate</SelectItem>
                            <SelectItem value="Professional Certification">Professional Certification</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input 
                          value={qual.institute} 
                          onChange={(e) => handleEducationalQualificationChange(index, 'institute', e.target.value)}
                          placeholder="Institute Name"
                          className="border-0 shadow-none h-8"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Select 
                          value={qual.board} 
                          onValueChange={(value) => handleEducationalQualificationChange(index, 'board', value)}
                        >
                          <SelectTrigger className="border-0 shadow-none h-8">
                            <SelectValue placeholder="Select Board" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dhaka">Dhaka</SelectItem>
                            <SelectItem value="Chittagong">Chittagong</SelectItem>
                            <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                            <SelectItem value="Sylhet">Sylhet</SelectItem>
                            <SelectItem value="Barisal">Barisal</SelectItem>
                            <SelectItem value="Comilla">Comilla</SelectItem>
                            <SelectItem value="Jessore">Jessore</SelectItem>
                            <SelectItem value="Dinajpur">Dinajpur</SelectItem>
                            <SelectItem value="Mymensingh">Mymensingh</SelectItem>
                            <SelectItem value="Madrasah">Madrasah</SelectItem>
                            <SelectItem value="Technical">Technical</SelectItem>
                            
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input 
                          value={qual.group} 
                          onChange={(e) => handleEducationalQualificationChange(index, 'group', e.target.value)}
                          placeholder="e.g., Science, Arts, Commerce, Business"
                          className="border-0 shadow-none h-8"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <Input 
                          value={qual.year} 
                          onChange={(e) => handleEducationalQualificationChange(index, 'year', e.target.value)}
                          placeholder="Year"
                          className="border-0 shadow-none h-8 text-center"
                          maxLength={4}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <Input 
                          value={qual.gpa} 
                          onChange={(e) => handleEducationalQualificationChange(index, 'gpa', e.target.value)}
                          placeholder="GPA"
                          className="border-0 shadow-none h-8 text-center"
                          type="number"
                          step="0.01"
                          min="0"
                          max="5"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          {profile.educationalQualifications.length > 1 && (
          <Button 
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeEducationalQualification(index)}
                              className="h-6 w-6 p-0"
                            >
                              ×
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEducationalQualification}
                className="text-sm"
              >
                + Add Another Qualification
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
            </div>
            <Button 
              className="bg-green-600 hover:bg-green-700" 
              onClick={handleSaveProfile} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>SSC/HSC Marksheet</Label>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('id', e)} />
                {profile.documentUrls?.id && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>ID document uploaded</span>
                    <a 
                      href={profile.documentUrls.id} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      View
                    </a>
                  </div>
                )}
                {documents.id && <span className="text-xs text-green-700">{documents.id.name}</span>}
              </div>
            </div>
            <div>
              <Label>NID/Birth Certificate</Label>
              <div className="flex flex-col gap-4">
                {/* Front Side */}
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-gray-600">Front Side</Label>
                  <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('certificateFront', e)} />
                  {profile.documentUrls?.certificateFront && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Front side uploaded</span>
                      <a 
                        href={profile.documentUrls.certificateFront} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {documents.certificateFront && <span className="text-xs text-green-700">{documents.certificateFront.name}</span>}
                </div>
                
                {/* Back Side */}
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium text-gray-600">Back Side</Label>
                  <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('certificateBack', e)} />
                  {profile.documentUrls?.certificateBack && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Back side uploaded</span>
                      <a 
                        href={profile.documentUrls.certificateBack} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2"
                      >
                        View
                      </a>
                    </div>
                  )}
                  {documents.certificateBack && <span className="text-xs text-green-700">{documents.certificateBack.name}</span>}
                </div>
              </div>
            </div>
            <div>
              <Label>Institute ID</Label>
              <div className="flex flex-col gap-2">
                <Input type="file" accept="application/pdf,image/*" onChange={e => handleDocumentChange('education', e)} />
                {profile.documentUrls?.education && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span>Education document uploaded</span>
                    <a 
                      href={profile.documentUrls.education} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline ml-2"
                    >
                      View
                    </a>
                  </div>
                )}
                {documents.education && <span className="text-xs text-green-700">{documents.education.name}</span>}
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
            <p className="text-green-700 text-sm">Upload your documents in PDF, JPG, or PNG format (max 10MB). Your documents will be verified by our team before your profile is approved.</p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}