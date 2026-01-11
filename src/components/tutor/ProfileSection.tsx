import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext.next";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  CheckCircle,
  Shield,
  Award,
  BadgeCheck,
  FileText,
  Eye,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MultiSelect } from "@/components/ui/multi-select";
import { SKILLS } from "@/data/skills";
import { Badge } from "@/components/ui/badge";
import {
  useGetMYInfoQuery,
  useUpdateUserProfileMutation,
} from "@/redux/features/auth/authApi";
import { useRouter } from "next/navigation";
import {
  useCreateDocumentMutation,
  useGetAllDocumentUserQuery,
  useUpdateDocumentMutation,
} from "@/redux/features/document/documentApi";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";
import { useCreateNotificationMutation } from "@/redux/features/notification/notificationApi";

interface ProfileFormData {
  // Personal Information
  fullName: string;
  email: string;
  phone: string;
  alternative_number: string;
  avatar: string;
  gender: string;
  religion: string;
  nationality: string;
  blood_group: string;

  // Institute Information
  Institute_name: string;
  department_name: string;
  year: string;

  // Location Information
  location: string;
  district: string;
  thana: string;
  postOffice: string;

  // Tutoring Information
  background: string[];
  preferred_class: string[];
  preferred_tutoring_category: string[];
  subjects: string[];
  preferred_tutoring_style: string;
  days_per_week: number;
  availability: string[];
  preferred_time: string[];
  preferred_areas: string[];
  expected_salary: string;

  // Skills & Bio
  other_skills: string[];
  social_media_links: string;
  bio: string;
  experience: string;
  hourly_rate: string;
  qualification: string;
  extra_facilities: string;
  preferred_medium: string[];
  preferred_student_gender: string;

  // Educational Qualifications
  educational_qualifications: Array<{
    examTitle: string;
    institute: string;
    board: string;
    group: string;
    year: string;
    gpa: string;
  }>;
}

interface Document {
  id: string;
  userId: string;
  type: "SSC_HSC_MARKSHEET" | "NID_BIRTH_CERTIFICATE" | "INSTITUTE_ID";
  file_url: string;
  file_type?: string;
  uploaded_at: string;
}

interface UpgradeStatus {
  hasPremium: boolean;
  hasVerified: boolean;
}

// Helper function to parse array from string
const parseArrayFromString = (str: any): string[] => {
  if (!str) return [];

  if (Array.isArray(str)) {
    return str;
  }

  if (typeof str === "string") {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (error) {
      // If not valid JSON, try comma-separated
      if (str.includes(",")) {
        return str
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean);
      }
      // Single value
      return [str];
    }
  }

  return [];
};

export default function ProfileSection() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const userId = user?.id;

  // RTK Query Hooks
  const {
    data: userData,
    isLoading: isLoadingUser,
    refetch: refetchUser,
  } = useGetMYInfoQuery(userId);

  const {
    data: documentData,
    refetch: refetchDocuments,
    isLoading: isLoadingDocuments,
  } = useGetAllDocumentUserQuery({ id: userId } as any);

  const { data: districtData } = useGetAllDistrictsQuery(undefined);
  const { data: categoryData } = useGetAllCategoryQuery(undefined);

  const [createNotification] = useCreateNotificationMutation();

  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();

  const [createDocument] = useCreateDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();

  // States
  const [profile, setProfile] = useState<ProfileFormData>({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    alternative_number: "",
    avatar: "",
    gender: "",
    religion: "",
    nationality: "",
    blood_group: "",

    // Institute Information
    Institute_name: "",
    department_name: "",
    year: "",

    // Location Information
    location: "",
    district: "",
    thana: "",
    postOffice: "",

    // Tutoring Information
    background: [],
    preferred_class: [],
    preferred_tutoring_category: [],
    subjects: [],
    preferred_tutoring_style: "",
    days_per_week: 0,
    availability: [],
    preferred_time: [],
    preferred_areas: [],
    expected_salary: "",

    // Skills & Bio
    other_skills: [],
    social_media_links: "",
    bio: "",
    experience: "",
    hourly_rate: "",
    qualification: "",
    extra_facilities: "",
    preferred_medium: [],
    preferred_student_gender: "any",

    // Educational Qualifications
    educational_qualifications: [
      {
        examTitle: "",
        institute: "",
        board: "",
        group: "",
        year: "",
        gpa: "",
      },
    ],
  });

  // New states for custom inputs
  const [newArea, setNewArea] = useState("");
  const [newSubject, setNewSubject] = useState("");

  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus | null>(
    null
  );
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState<
    Record<string, boolean>
  >({});
  const [isLoadingUpgradeStatus, setIsLoadingUpgradeStatus] = useState(false);

  // Tuition location states
  const [tuitionAvailableThanas, setTuitionAvailableThanas] = useState<
    string[]
  >([]);
  const [tuitionAvailableAreas, setTuitionAvailableAreas] = useState<string[]>(
    []
  );
  const [parsedPreferredAreas, setParsedPreferredAreas] = useState<string[]>([]);


  // File upload function
  const uploadImage = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("image", file);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-image`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      const result = await res.json();
      return result.url;
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to upload file",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Load user data into form
  useEffect(() => {
    if (userData?.data) {
      const data = userData.data;


      // Parse arrays properly
      const parsedPreferredAreas = parseArrayFromString(data.preferred_areas);
      setParsedPreferredAreas(parsedPreferredAreas);
      const parsedBackground = parseArrayFromString(data.background);
      const parsedSubjects = parseArrayFromString(data.subjects);
      const parsedPreferredClass = parseArrayFromString(data.preferred_class);
      const parsedAvailability = parseArrayFromString(data.availability);
      const parsedPreferredTime = parseArrayFromString(data.preferred_time);
      const parsedOtherSkills = parseArrayFromString(data.other_skills);
      const parsedPreferredMedium = parseArrayFromString(data.preferred_medium);

      setProfile((prev) => ({
        ...prev,
        // Personal Information
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        alternative_number: data.alternative_number || "",
        avatar: data.avatar || "",
        gender: data.gender || "",
        religion: data.religion || "",
        nationality: data.nationality || "",
        blood_group: data.blood_group || "",

        // Institute Information
        Institute_name: data.Institute_name || "",
        department_name: data.department_name || "",
        year: data.year || "",

        // Location Information
        location: data.location || "",
        district: data.district || "",
        thana: data.thana || "",
        postOffice: data.postOffice || "",

        // Tutoring Information
        background: parsedBackground,
        preferred_class: parsedPreferredClass,
        preferred_tutoring_category: Array.isArray(
          data.preferred_tutoring_category
        )
          ? data.preferred_tutoring_category
          : [],
        subjects: parsedSubjects,
        preferred_tutoring_style: data.preferred_tutoring_style || "",
        days_per_week: data.days_per_week || 0,
        availability: parsedAvailability,
        preferred_time: parsedPreferredTime,
        preferred_areas: parsedPreferredAreas, // This should now work
        expected_salary: data.expected_salary || "",

        // Skills & Bio
        other_skills: parsedOtherSkills,
        social_media_links: data.social_media_links || "",
        bio: data.bio || "",
        experience: data.experience?.toString() || "",
        hourly_rate: data.hourly_rate?.toString() || "0",
        qualification: data.qualification || "",
        extra_facilities: data.extra_facilities || "",
        preferred_medium: parsedPreferredMedium,
        preferred_student_gender: data.preferred_student_gender || "any",

        // Educational Qualifications
        educational_qualifications: data.educational_qualifications
          ? (() => {
              try {
                if (typeof data.educational_qualifications === "string") {
                  return JSON.parse(data.educational_qualifications);
                }
                return data.educational_qualifications;
              } catch (e) {
                return [
                  {
                    examTitle: "",
                    institute: "",
                    board: "",
                    group: "",
                    year: "",
                    gpa: "",
                  },
                ];
              }
            })()
          : [
              {
                examTitle: "",
                institute: "",
                board: "",
                group: "",
                year: "",
                gpa: "",
              },
            ],
      }));

      // Debug: Check parsed data
      console.log("Parsed preferred_areas:", parsedPreferredAreas);
    }
  }, [userData, toast]);

  // Load tuition thanas and areas based on selected district
  useEffect(() => {
    if (profile.district && districtData?.data) {
      const selectedDistrict = districtData.data.find(
        (d: any) => d.name === profile.district
      );

      if (selectedDistrict) {
        // Set available thanas
        const thanas = selectedDistrict.thana || [];
        setTuitionAvailableThanas(thanas);

        // Set available areas
        const areas = selectedDistrict.area || [];
        setTuitionAvailableAreas(areas);

        // Reset thana if it's not available in the new district
        if (profile.thana && !thanas.includes(profile.thana)) {
          setProfile((prev) => ({
            ...prev,
            thana: thanas.length > 0 ? thanas[0] : "",
            preferred_areas: [], // Reset areas when thana changes
          }));
        }

        // If current thana is empty but we have available thanas, set first one
        if (!profile.thana && thanas.length > 0) {
          setProfile((prev) => ({
            ...prev,
            thana: thanas[0],
          }));
        }
      } else {
        setTuitionAvailableThanas([]);
        setTuitionAvailableAreas([]);
      }
    } else {
      setTuitionAvailableThanas([]);
      setTuitionAvailableAreas([]);
      // Reset thana and areas when no district is selected
      if (profile.thana) {
        setProfile((prev) => ({
          ...prev,
          thana: "",
          preferred_areas: [],
        }));
      }
    }
  }, [profile.district, districtData, profile.thana]);

  // Load upgrade status
  useEffect(() => {
    const fetchUpgradeStatus = async () => {
      if (!userId) return;

      try {
        setIsLoadingUpgradeStatus(true);
        // Add your upgrade status fetching logic here
      } catch (error) {
        console.error("Error fetching upgrade status:", error);
      } finally {
        setIsLoadingUpgradeStatus(false);
      }
    };

    fetchUpgradeStatus();
  }, [userId]);

  // Event handlers
  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (name: string, value: string) => {
    setProfile((prev) => {
      const currentValues = prev[name as keyof ProfileFormData] as string[];
      if (Array.isArray(currentValues)) {
        if (currentValues.includes(value)) {
          return { ...prev, [name]: currentValues.filter((v) => v !== value) };
        } else {
          return { ...prev, [name]: [...currentValues, value] };
        }
      }
      return prev;
    });
  };

  // Medium selection handler
  const handleBackgroundChange = (mediums: string[]) => {
    setProfile((prev) => ({ ...prev, background: mediums }));
  };

  // New functions for custom area and subject handling
  const handleAddArea = () => {
    if (newArea.trim() && !profile.preferred_areas.includes(newArea.trim())) {
      setProfile((prev) => ({
        ...prev,
        preferred_areas: [...prev.preferred_areas, newArea.trim()],
      }));
      setNewArea("");
    }
  };

  const handleRemoveArea = (area: string) => {
    setProfile((prev) => ({
      ...prev,
      preferred_areas: prev.preferred_areas.filter((a) => a !== area),
    }));
  };

  const handleAddSubject = () => {
    if (newSubject.trim() && !profile.subjects.includes(newSubject.trim())) {
      setProfile((prev) => ({
        ...prev,
        subjects: [...prev.subjects, newSubject.trim()],
      }));
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setProfile((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s !== subject),
    }));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: "area" | "subject"
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "area") {
        handleAddArea();
      } else {
        handleAddSubject();
      }
    }
  };

  // Photo upload handler
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, PNG, or GIF image",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 2MB",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsUploadingPhoto(true);
        const imageUrl = await uploadImage(file);

        const result = await updateUserProfile({
          id: userId,
          data: { avatar: imageUrl },
        }).unwrap();

        await createNotification({
          title: "Profile Updated",
          message: "Your profile has been successfully updated.",
          type: "success",
          readStatus: false,
          userId: user.id,
        }).unwrap();

        if (result.success) {
          setProfile((prev) => ({ ...prev, avatar: imageUrl }));
          refetchUser();
          toast({
            title: "Success",
            description: "Profile photo uploaded successfully",
            variant: "default",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to upload profile photo",
          variant: "destructive",
        });
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (
    type: "SSC_HSC_MARKSHEET" | "NID_BIRTH_CERTIFICATE" | "INSTITUTE_ID",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsUploadingDocument((prev) => ({ ...prev, [type]: true }));

        // Upload file
        const fileUrl = await uploadImage(file);
        const fileType = file.type;

        // Check if document already exists
        const existingDoc = documentData?.data?.find(
          (doc: Document) => doc.type === type
        );

        if (existingDoc) {
          // Update existing document
          await updateDocument({
            id: existingDoc.id,
            data: {
              file_url: fileUrl,
              file_type: fileType,
            },
          }).unwrap();
        } else {
          // Create new document
          await createDocument({
            userId,
            type,
            file_url: fileUrl,
            file_type: fileType,
          }).unwrap();
        }

        // Refetch documents
        await refetchDocuments();

        toast({
          title: "Success",
          description: `Document uploaded successfully`,
          variant: "default",
        });
      } catch (error: any) {
        console.error(`Error uploading document:`, error);
        toast({
          title: "Error",
          description: error?.message || `Failed to upload document`,
          variant: "destructive",
        });
      } finally {
        setIsUploadingDocument((prev) => ({ ...prev, [type]: false }));
      }
    }
  };

  // Helper functions
  const getDocumentByType = (type: string) => {
    return documentData?.data?.find((doc: Document) => doc.type === type);
  };

  const handleOtherSkillsChange = (skills: string[]) => {
    setProfile((prev) => ({ ...prev, other_skills: skills }));
  };

  const handleSubjectsChange = (subjects: string[]) => {
    setProfile((prev) => ({ ...prev, subjects }));
  };

  const handlePreferredClassChange = (classes: string[]) => {
    setProfile((prev) => ({ ...prev, preferred_class: classes }));
  };

  const handleCategoryChange = (categories: string[]) => {
    setProfile((prev) => ({
      ...prev,
      preferred_tutoring_category: categories,
    }));
  };

  const handlePreferredAreasChange = (areas: string[]) => {
    setProfile((prev) => ({ ...prev, preferred_areas: areas }));
  };

  const handleAvailabilityChange = (availability: string[]) => {
    setProfile((prev) => ({ ...prev, availability }));
  };

  const handleEducationalQualificationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      educational_qualifications: prev.educational_qualifications.map(
        (qual, i) => (i === index ? { ...qual, [field]: value } : qual)
      ),
    }));
  };

  const addEducationalQualification = () => {
    setProfile((prev) => ({
      ...prev,
      educational_qualifications: [
        ...prev.educational_qualifications,
        {
          examTitle: "",
          institute: "",
          board: "",
          group: "",
          year: "",
          gpa: "",
        },
      ],
    }));
  };

  const removeEducationalQualification = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      educational_qualifications: prev.educational_qualifications.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Get medium options from categoryData
  const getMediumOptions = () => {
    if (!categoryData?.data) return [];

    return categoryData.data.map((category: any) => ({
      value: category.name,
      label: category.name,
    }));
  };

  // Get all districts for dropdown
  const getAllDistricts = () => {
    if (!districtData?.data) return [];
    return districtData.data.map((district: any) => ({
      value: district.name,
      label: district.name,
    }));
  };

  // Get all available time slots
  const getTimeSlots = () => {
    return [
      "Morning (8AM-12PM)",
      "Afternoon (12PM-4PM)",
      "Evening (4PM-8PM)",
      "Night (8PM-10PM)",
    ];
  };

  // Get availability days options
  const getAvailabilityOptions = () => {
    return [
      { value: "Saturday", label: "Saturday" },
      { value: "Sunday", label: "Sunday" },
      { value: "Monday", label: "Monday" },
      { value: "Tuesday", label: "Tuesday" },
      { value: "Wednesday", label: "Wednesday" },
      { value: "Thursday", label: "Thursday" },
      { value: "Friday", label: "Friday" },
      { value: "All Days", label: "All Days" },
      { value: "Flexible", label: "Flexible" },
    ];
  };

  // Get tutoring style options (single select)
  const getTutoringStyleOptions = () => {
    return [
      { value: "Home Tutoring", label: "Home Tutoring" },
      { value: "Online Tutoring", label: "Online Tutoring" },
      { value: "Both", label: "Both (Home & Online)" },
    ];
  };

  // Get class levels
  const getClassLevels = () => {
    return [
      { value: "Play Group/KG", label: "Play Group/KG" },
      { value: "Class 1", label: "Class 1" },
      { value: "Class 2", label: "Class 2" },
      { value: "Class 3", label: "Class 3" },
      { value: "Class 4", label: "Class 4" },
      { value: "Class 5", label: "Class 5" },
      { value: "Class 6", label: "Class 6" },
      { value: "Class 7", label: "Class 7" },
      { value: "Class 8", label: "Class 8" },
      { value: "Class 9", label: "Class 9" },
      { value: "Class 10 (SSC)", label: "Class 10 (SSC)" },
      { value: "Class 11 (HSC)", label: "Class 11 (HSC)" },
      { value: "Class 12 (HSC)", label: "Class 12 (HSC)" },
      { value: "University Level", label: "University Level" },
    ];
  };

  // Get category options from API
  const getCategoryOptions = () => {
    if (!categoryData?.data) return [];
    return categoryData.data.map((category: any) => ({
      value: category.name,
      label: category.name,
    }));
  };

  // Get subject options
  const getSubjectOptions = () => {
    return [
      { value: "Mathematics", label: "Mathematics" },
      { value: "English", label: "English" },
      { value: "Bangla", label: "Bangla" },
      { value: "Physics", label: "Physics" },
      { value: "Chemistry", label: "Chemistry" },
      { value: "Biology", label: "Biology" },
      { value: "ICT", label: "ICT" },
      { value: "Accounting", label: "Accounting" },
      { value: "Economics", label: "Economics" },
      { value: "All Subjects", label: "All Subjects" },
    ];
  };

  // Save profile
  const handleSaveProfile = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare user profile data according to backend schema
      const userProfileData: any = {
        // Personal Information
        fullName: profile.fullName || "",
        email: profile.email || "",
        phone: profile.phone || "",
        alternative_number: profile.alternative_number || "",
        avatar: profile.avatar || "",
        gender: profile.gender || "",
        religion: profile.religion || "",
        nationality: profile.nationality || "",
        blood_group: profile.blood_group || "",

        // Institute Information
        Institute_name: profile.Institute_name || "",
        department_name: profile.department_name || "",
        year: profile.year || "",

        // Location Information
        location: profile.location || "",
        district: profile.district || "",
        thana: profile.thana || "",
        postOffice: profile.postOffice || "",

        // Tutoring Information
        background: profile.background || [],
        preferred_class: profile.preferred_class || [],
        preferred_tutoring_category: profile.preferred_tutoring_category || [],
        subjects: profile.subjects || [],
        preferred_tutoring_style: profile.preferred_tutoring_style || "",
        days_per_week: Number(profile.days_per_week || 0),
        availability: profile.availability || [],
        preferred_time: profile.preferred_time || [],
        preferred_areas: profile.preferred_areas || [],
        expected_salary: profile.expected_salary || "",

        // Skills & Bio
        other_skills: profile.other_skills || [],
        social_media_links: profile.social_media_links || "",
        bio: profile.bio || "",
        experience: parseInt(profile.experience) || 0,
        hourly_rate: parseInt(profile.hourly_rate) || 0,
        qualification: profile.qualification || "",
        extra_facilities: profile.extra_facilities || "",
        preferred_medium: profile.preferred_medium || [],
        preferred_student_gender: profile.preferred_student_gender || "any",
      };

      // Handle educational_qualifications
      if (
        profile.educational_qualifications &&
        profile.educational_qualifications.length > 0
      ) {
        userProfileData.educational_qualifications = JSON.stringify(
          profile.educational_qualifications
        );
      }

      const result = await updateUserProfile({
        id: userId,
        data: userProfileData,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
          variant: "default",
        });

        await createNotification({
          title: "Profile Updated",
          message: "Your profile has been successfully updated.",
          type: "success",
          readStatus: false,
          userId: user.id,
        }).unwrap();

        // Refetch user data
        refetchUser();
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description:
          error?.data?.message || error?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const isLoading =
    isLoadingUser || isLoadingDocuments || isLoadingUpgradeStatus;
  const isSaving =
    isUpdatingProfile ||
    isUploadingPhoto ||
    Object.values(isUploadingDocument).some(Boolean);

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
          {upgradeStatus && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-green-600" />
                Your Status
              </h3>
              <div className="flex gap-3 flex-wrap">
                {userData?.data?.genius && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1">
                    <Shield className="h-4 w-4 mr-1" />
                    Genius Tutor
                  </Badge>
                )}
                {userData?.data?.verified && (
                  <Badge className="bg-green-100 text-green-800 border-green-300 px-3 py-1">
                    <BadgeCheck className="h-4 w-4 mr-1" />
                    Verified Tutor
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {userData?.data?.genius && userData?.data?.verified
                  ? "You have both Genius and Verified status with full access to all premium features."
                  : userData?.data?.genius
                  ? "You have Genius status with access to premium features."
                  : userData?.data?.verified
                  ? "You have Verified status which builds trust with students and parents."
                  : "Complete your profile to get verified status."}
              </p>
            </div>
          )}
        </CardContent>
        <CardContent className="space-y-8">
          {/* Tutor ID Display */}
          {user?.tutor_id && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <div className="text-green-700 font-medium">Tutor ID:</div>
                <div className="ml-2 bg-white px-3 py-1 rounded border border-green-200 font-mono">
                  {user.tutor_id}
                </div>
              </div>
            </div>
          )}

          {/* SECTION 1: Profile Photo */}
          <div className="mb-6">
            <Label>Profile Photo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="relative">
                <img
                  src={profile.avatar || "/placeholder.svg"}
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
              </div>
            </div>
          </div>

          {/* SECTION 2: Personal Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleProfileChange}
                  placeholder="Full Name"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  placeholder="Email"
                  disabled
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Mobile Number"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Alternative Number</Label>
                <Input
                  name="alternative_number"
                  value={profile.alternative_number}
                  onChange={handleProfileChange}
                  placeholder="Alternative Phone"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
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
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Nationality</Label>
                <Input
                  name="nationality"
                  value={profile.nationality}
                  onChange={handleProfileChange}
                  placeholder="Nationality"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Blood Group</Label>
                <Select
                  value={profile.blood_group}
                  onValueChange={(value) =>
                    handleSelectChange("blood_group", value)
                  }
                >
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
            </div>
          </div>

          {/* SECTION 3: Institute Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">
              Institute Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Institute Name</Label>
                <Input
                  name="Institute_name"
                  value={profile.Institute_name}
                  onChange={handleProfileChange}
                  placeholder="Institute Name"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  name="department_name"
                  value={profile.department_name}
                  onChange={handleProfileChange}
                  placeholder="Department"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Year/Semester</Label>
                <Input
                  name="year"
                  value={profile.year}
                  onChange={handleProfileChange}
                  placeholder="Year/Semester"
                  className="border-2 border-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Location Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Location Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Your Location</Label>
                <Input
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                  placeholder="Your location (e.g., Road No, House No)"
                  className="border-2 border-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Tuition Information */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Tuition Information</h3>

            {/* Class (Multi Select) */}
            <div className="mb-4">
              <Label>Classes (Select multiple)</Label>
              <MultiSelect
                value={profile.preferred_class}
                onValueChange={handlePreferredClassChange}
                placeholder="Select classes you can teach"
                options={getClassLevels()}
                maxSelections={10}
                className="border-2 border-green-500"
              />
            </div>

            {/* Medium (Multi Select) - FIXED */}
            <div className="mb-4">
              <Label>Medium (Select multiple)</Label>
              <MultiSelect
                value={profile.background}
                onValueChange={handleBackgroundChange}
                placeholder="Select teaching mediums"
                options={getMediumOptions()}
                maxSelections={10}
                className="border-2 border-green-500"
              />
              {getMediumOptions().length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Loading medium options...
                </p>
              )}
            </div>

            {/* Subject (Multi Select with custom input) */}
            <div className="mb-4">
              <Label>Subjects (Select multiple or add custom)</Label>

              {/* মাল্টি সিলেক্ট অপশন */}
              <div className="mb-3">
                <MultiSelect
                  value={profile.subjects}
                  onValueChange={handleSubjectsChange}
                  placeholder="Select subjects from list"
                  options={getSubjectOptions()}
                  className="border-2 border-green-500"
                  maxSelections={15}
                />
              </div>

              {/* সিলেক্টেড বিষয়গুলো দেখানো */}
              {profile.subjects.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Selected Subjects:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.subjects.map((subject) => (
                      <Badge
                        key={subject}
                        variant="secondary"
                        className="px-3 py-1.5 bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-1 transition-colors duration-200"
                      >
                        {subject}
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subject)}
                          className="ml-1 text-red-500 hover:text-red-700 text-sm font-bold"
                          aria-label={`Remove ${subject}`}
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* নতুন বিষয় যোগ করার জন্য ইনপুট */}
              <div className="mt-4">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Add Custom Subject:
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "subject")}
                    placeholder="Type custom subject and press Enter"
                    className="flex-1 border-2 border-green-500"
                  />
                  <Button
                    type="button"
                    onClick={handleAddSubject}
                    disabled={!newSubject.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Add
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Type custom subject name and press Enter or click Add
                </p>
              </div>
            </div>

            {/* Tutor Method (Single Select) */}
            <div className="mb-4">
              <Label>Tutor Method</Label>
              <Select
                value={profile.preferred_tutoring_style}
                onValueChange={(value) =>
                  handleSelectChange("preferred_tutoring_style", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tutoring method" />
                </SelectTrigger>
                <SelectContent>
                  {getTutoringStyleOptions().map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Days Per Week and Availability (Multi Select) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Days Per Week</Label>
                <Select
                  value={profile.days_per_week.toString()}
                  onValueChange={(value) =>
                    handleSelectChange("days_per_week", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select days per week" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} Day{num > 1 ? "s" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Availability Days</Label>
                <MultiSelect
                  value={profile.availability}
                  onValueChange={handleAvailabilityChange}
                  placeholder="Select availability days"
                  options={getAvailabilityOptions()}
                  maxSelections={10}
                  className="border-2 border-green-500"
                />
              </div>
            </div>

            {/* Available Time */}
            <div className="mb-4">
              <Label className="mb-2 block">Available Time</Label>
              <div className="space-y-2">
                {getTimeSlots().map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      checked={profile.preferred_time.includes(time)}
                      onCheckedChange={() => {
                        handleMultiSelectChange("preferred_time", time);
                      }}
                    />
                    <label className="text-sm font-medium leading-none">
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Tuition Location - FIXED SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Tuition District</Label>
                <Select
                  value={profile.district}
                  onValueChange={(value) =>
                    handleSelectChange("district", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tuition district" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllDistricts().map((district: any) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tuition Thana</Label>
                <Select
                  value={profile.thana}
                  onValueChange={(value) => handleSelectChange("thana", value)}
                  disabled={!profile.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tuition thana" />
                  </SelectTrigger>
                  <SelectContent>
                    {tuitionAvailableThanas.map((thana) => (
                      <SelectItem key={thana} value={thana}>
                        {thana}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!profile.district && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a district first
                  </p>
                )}
              </div>
              <div>
                <Label>Preferred Areas</Label>

         

                {tuitionAvailableAreas.length > 0 && (
                  <div className="mb-3">
                    <MultiSelect
                      value={profile.preferred_areas}
                      onValueChange={handlePreferredAreasChange}
                      placeholder="Select preferred areas from list"
                      className="border-2 border-green-500"
                      options={tuitionAvailableAreas.map((area) => ({
                        value: area,
                        label: area,
                      }))}
                      maxSelections={20}
                      disabled={!profile.district}
                    />
                  </div>
                )}
                       <div className="text-sm text-green-500 mb-1">
                  Your selected areas:
                  <ul className="list-disc ml-4 mt-1">
                    {parsedPreferredAreas?.map(
                      (area: string, index: number) => (
                        <li key={index}>{area}</li>
                      )
                    )}
                  </ul>
                </div>

                {profile.preferred_areas.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Selected Areas ({profile.preferred_areas.length}):
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.preferred_areas.map((area) => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1 transition-colors duration-200"
                        >
                          {area}
                          <button
                            type="button"
                            onClick={() => handleRemoveArea(area)}
                            className="ml-1 text-red-500 hover:text-red-700 text-sm font-bold"
                            aria-label={`Remove ${area}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* নতুন এরিয়া যোগ করার জন্য ইনপুট */}
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Add Custom Area:
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "area")}
                      placeholder="Type custom area and press Enter"
                      className="flex-1 border-2 border-green-500"
                      disabled={!profile.district}
                    />
                    <Button
                      type="button"
                      onClick={handleAddArea}
                      disabled={!newArea.trim() || !profile.district}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Type custom area name and press Enter or click Add
                  </p>
                </div>

                {!profile.district && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a district first
                  </p>
                )}
              </div>
            </div>

            {/* Expected Salary and Hourly Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Expected Salary (Monthly)</Label>
                <Input
                  name="expected_salary"
                  value={profile.expected_salary}
                  onChange={handleProfileChange}
                  placeholder="Expected Monthly Salary"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Hourly Rate</Label>
                <Input
                  name="hourly_rate"
                  value={profile.hourly_rate}
                  onChange={handleProfileChange}
                  placeholder="Hourly rate in BDT"
                  type="number"
                  min="0"
                  className="border-2 border-green-500"
                />
              </div>
              <div>
                <Label>Experience</Label>
                <Input
                  name="experience"
                  value={profile.experience}
                  onChange={handleProfileChange}
                  placeholder="Enter your experience"
                  type="number"
                  min="0"
                  className="border-2 border-green-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 6: Skills & Bio */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-semibold mb-4">Skills & Bio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label>Other Skills (Select up to 5)</Label>
                <MultiSelect
                  value={profile.other_skills}
                  onValueChange={handleOtherSkillsChange}
                  placeholder="Select your other skills"
                  options={SKILLS.map((skill) => ({
                    value: skill,
                    label: skill,
                  }))}
                  className="border-2 border-green-500"
                  maxSelections={5}
                />
              </div>
              <div>
                <Label>Social Media Links</Label>
                <Input
                  name="social_media_links"
                  value={profile.social_media_links}
                  onChange={handleProfileChange}
                  placeholder="Facebook, LinkedIn, etc."
                  className="border-2 border-green-500"
                />
              </div>
            </div>
            <div>
              <Label>About/Bio</Label>
              <Textarea
                name="bio"
                value={profile.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself, your teaching style, etc."
                rows={4}
                className="border-2 border-green-500"
              />
            </div>
          </div>

          {/* SECTION 7: Educational Information */}
          <div className="border-b pb-6">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Educational Information
              </h3>
              <div className="flex-1 h-px bg-gray-300 ml-4"></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-600 text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">
                      Exam Title
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">
                      Institute
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">
                      Board
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-sm font-medium">
                      Group
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                      Year
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                      GPA
                    </th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {profile.educational_qualifications.map((qual, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="border border-gray-300 px-3 py-2">
                        <Select
                          value={qual.examTitle}
                          onValueChange={(value) =>
                            handleEducationalQualificationChange(
                              index,
                              "examTitle",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="border-0 shadow-none h-8">
                            <SelectValue placeholder="Select Exam" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SSC">SSC</SelectItem>
                            <SelectItem value="HSC">HSC</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Bachelor">Bachelor</SelectItem>
                            <SelectItem value="Master">Master</SelectItem>
                            <SelectItem value="Phd">Phd</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Input
                          value={qual.institute}
                          onChange={(e) =>
                            handleEducationalQualificationChange(
                              index,
                              "institute",
                              e.target.value
                            )
                          }
                          placeholder="Institute Name"
                          className="border-0 shadow-none h-8"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Select
                          value={qual.board}
                          onValueChange={(value) =>
                            handleEducationalQualificationChange(
                              index,
                              "board",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="border-0 shadow-none h-8">
                            <SelectValue placeholder="Select Board" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Dhaka">Dhaka</SelectItem>
                            <SelectItem value="Chittagong">
                              Chittagong
                            </SelectItem>
                            <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                            <SelectItem value="Mymensingh">
                              Mymensingh
                            </SelectItem>
                            <SelectItem value="Sylhet">Sylhet</SelectItem>
                            <SelectItem value="Barisal">Barisal</SelectItem>
                            <SelectItem value="Comilla">Comilla</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2">
                        <Select
                          value={qual.group}
                          onValueChange={(value) =>
                            handleEducationalQualificationChange(
                              index,
                              "group",
                              value
                            )
                          }
                        >
                          <SelectTrigger className="border-0 shadow-none h-8">
                            <SelectValue placeholder="Select Group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Science">Science</SelectItem>
                            <SelectItem value="Arts">Arts</SelectItem>
                            <SelectItem value="Commerce">Commerce</SelectItem>
                            <SelectItem value="Business Studies">
                              Business Studies
                            </SelectItem>
                            <SelectItem value="Humanities">
                              Humanities
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <Input
                          value={qual.year}
                          onChange={(e) =>
                            handleEducationalQualificationChange(
                              index,
                              "year",
                              e.target.value
                            )
                          }
                          placeholder="Year"
                          className="border-0 shadow-none h-8 text-center"
                          maxLength={4}
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <Input
                          value={qual.gpa}
                          onChange={(e) =>
                            handleEducationalQualificationChange(
                              index,
                              "gpa",
                              e.target.value
                            )
                          }
                          placeholder="GPA/CGPA"
                          className="border-0 shadow-none h-8 text-center"
                          type="number"
                          step="0.01"
                          min="0"
                          max="5"
                        />
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          {profile.educational_qualifications.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                removeEducationalQualification(index)
                              }
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

          {/* Save Button and Last Updated */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-gray-600">
              <p>
                Last updated:{" "}
                {userData?.data?.updatedAt
                  ? new Date(userData.data.updatedAt).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
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

      {/* SECTION 8: Documents */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* SSC/HSC Marksheet */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-medium">SSC/HSC Marksheet</Label>
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleDocumentUpload("SSC_HSC_MARKSHEET", e)}
                  disabled={isUploadingDocument["SSC_HSC_MARKSHEET"]}
                />
                {getDocumentByType("SSC_HSC_MARKSHEET") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            getDocumentByType("SSC_HSC_MARKSHEET")?.file_url,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Document
                      </Button>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          getDocumentByType("SSC_HSC_MARKSHEET")?.uploaded_at ||
                            ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No document uploaded yet
                  </p>
                )}
                {isUploadingDocument["SSC_HSC_MARKSHEET"] && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* NID/Birth Certificate */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-medium">
                  NID/Birth Certificate
                </Label>
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) =>
                    handleDocumentUpload("NID_BIRTH_CERTIFICATE", e)
                  }
                  disabled={isUploadingDocument["NID_BIRTH_CERTIFICATE"]}
                />
                {getDocumentByType("NID_BIRTH_CERTIFICATE") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            getDocumentByType("NID_BIRTH_CERTIFICATE")
                              ?.file_url,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Document
                      </Button>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          getDocumentByType("NID_BIRTH_CERTIFICATE")
                            ?.uploaded_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No document uploaded yet
                  </p>
                )}
                {isUploadingDocument["NID_BIRTH_CERTIFICATE"] && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Institute ID */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-medium">Institute ID</Label>
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleDocumentUpload("INSTITUTE_ID", e)}
                  disabled={isUploadingDocument["INSTITUTE_ID"]}
                />
                {getDocumentByType("INSTITUTE_ID") ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Uploaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            getDocumentByType("INSTITUTE_ID")?.file_url,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Document
                      </Button>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          getDocumentByType("INSTITUTE_ID")?.uploaded_at || ""
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No document uploaded yet
                  </p>
                )}
                {isUploadingDocument["INSTITUTE_ID"] && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  Document Upload Guidelines
                </h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Upload documents in PDF, JPG, or PNG format</li>
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Ensure documents are clear and readable</li>
                  <li>• All documents are stored securely</li>
                  <li>
                    • Existing documents will be replaced when you upload new
                    ones
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
