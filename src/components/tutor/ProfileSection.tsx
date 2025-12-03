import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext.next";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, CheckCircle, Shield, Award, BadgeCheck, FileText, Eye, Upload } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { BANGLADESH_DISTRICTS_WITH_POST_OFFICES } from "@/data/bangladeshDistricts";
import { MultiSelect } from "@/components/ui/multi-select";
import { SKILLS } from "@/data/skills";
import { Badge } from "@/components/ui/badge";
import {
  useGetMYInfoQuery,
  useUpdateUserProfileMutation,
} from "@/redux/features/auth/authApi";
import { getUpgradeStatus } from "@/services/upgradeService";
import { useRouter } from "next/navigation";
import { 
  useCreateDocumentMutation, 
  useGetAllDocumentUserQuery, 
  useUpdateDocumentMutation 
} from "@/redux/features/document/documentApi";

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  location: string;
  district: string;
  bio: string;
  experience: string;
  hourly_rate: string;
  qualification: string;
  expected_salary: string;
  other_skills: string[];
  days_per_week: number;
  preferred_tutoring_style: string[];
  place_of_learning: string[];
  extra_facilities: string;
  preferred_medium: string[];
  preferred_class: string;
  preferred_subjects: string;
  preferred_time: string[];
  preferred_student_gender: string;
  alternative_number: string;
  Institute_name: string;
  department_name: string;
  year: string;
  religion: string;
  nationality: string;
  blood_group: string;
  social_media_links: string;
  preferred_tutoring_category: string;
  present_location: string;
  preferred_areas: string[];
  selectedCategories: string[];
  selectedSubjects: string[];
  selectedClasses: string[];
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
    isLoading: isLoadingDocuments 
  } = useGetAllDocumentUserQuery({ id: userId });


  console.log("Document Data:", documentData);

  const [updateUserProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();

  const [createDocument] = useCreateDocumentMutation();
  const [updateDocument] = useUpdateDocumentMutation();

  // States
  const [profile, setProfile] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phone: "",
    avatar: "",
    location: "",
    district: "",
    bio: "",
    experience: "",
    hourly_rate: "",
    qualification: "",
    expected_salary: "",
    other_skills: [],
    days_per_week: 0,
    preferred_tutoring_style: [],
    place_of_learning: [],
    extra_facilities: "",
    preferred_medium: [],
    preferred_class: "",
    preferred_subjects: "",
    preferred_time: [],
    preferred_student_gender: "any",
    alternative_number: "",
    Institute_name: "",
    department_name: "",
    year: "",
    religion: "",
    nationality: "",
    blood_group: "",
    social_media_links: "",
    preferred_tutoring_category: "",
    present_location: "",
    preferred_areas: [],
    selectedCategories: [],
    selectedSubjects: [],
    selectedClasses: [],
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

  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState<Record<string, boolean>>({});
  const [isLoadingUpgradeStatus, setIsLoadingUpgradeStatus] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);

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

      setProfile((prev) => ({
        ...prev,
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: data.avatar || "",
        location: data.location || "",
        district: data.district || "",
        bio: data.bio || "",
        experience: data.experience?.toString() || "",
        hourly_rate: data.hourly_rate?.toString() || "0",
        other_skills: Array.isArray(data.other_skills) ? data.other_skills : [],
        qualification: data.qualification || "",
        expected_salary: data.expected_salary || "",
        days_per_week: data.days_per_week || 0,
        preferred_tutoring_style: Array.isArray(data.preferred_tutoring_style)
          ? data.preferred_tutoring_style
          : [],
        place_of_learning: Array.isArray(data.place_of_learning)
          ? data.place_of_learning
          : [],
        extra_facilities: data.extra_facilities || "",
        preferred_medium: Array.isArray(data.preferred_medium)
          ? data.preferred_medium
          : [],
        preferred_class: data.preferred_class || "",
        preferred_subjects: Array.isArray(data.subjects) 
          ? data.subjects.join(", ") 
          : "",
        preferred_time: Array.isArray(data.preferred_time)
          ? data.preferred_time
          : [],
        preferred_student_gender: data.preferred_student_gender || "any",
        alternative_number: data.alternative_number || "",
        Institute_name: data.Institute_name || "",
        department_name: data.department_name || "",
        year: data.year || "",
        religion: data.religion || "",
        nationality: data.nationality || "",
        blood_group: data.blood_group || "",
        social_media_links: data.social_media_links || "",
        preferred_tutoring_category: data.preferred_tutoring_category || "",
        present_location: data.present_location || "",
        preferred_areas: Array.isArray(data.preferred_areas)
          ? data.preferred_areas
          : [],
        educational_qualifications: data.educational_qualifications
          ? (() => {
              try {
                if (typeof data.educational_qualifications === 'string') {
                  return JSON.parse(data.educational_qualifications);
                }
                return data.educational_qualifications;
              } catch (e) {
                return [{
                  examTitle: "",
                  institute: "",
                  board: "",
                  group: "",
                  year: "",
                  gpa: "",
                }];
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
    }
  }, [userData, toast]);

  // Load available areas based on selected district
  useEffect(() => {
    if (profile.district) {
      const district = BANGLADESH_DISTRICTS_WITH_POST_OFFICES.find(
        (d) => d.id === profile.district
      );
      if (district) {
        const areas = district.areas.map((area) => area.name);
        setAvailableAreas(areas);
        
        // Set present location if not already set
        if (!profile.present_location && areas.length > 0) {
          setProfile((prev) => ({ 
            ...prev, 
            present_location: areas[0] 
          }));
        }
      } else {
        setAvailableAreas([]);
      }
    } else {
      setAvailableAreas([]);
    }
  }, [profile.district, profile.present_location]);

  // Load upgrade status
  useEffect(() => {
    const fetchUpgradeStatus = async () => {
      if (!userId) return;

      try {
        setIsLoadingUpgradeStatus(true);
        const upgradeResponse = await getUpgradeStatus();
        if (upgradeResponse.success && upgradeResponse.data) {
          setUpgradeStatus(upgradeResponse.data);
        }
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

  // Photo upload handler
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
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
      const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
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
        setIsUploadingDocument(prev => ({ ...prev, [type]: true }));

        // Upload file
        const fileUrl = await uploadImage(file);
        const fileType = file.type;

        // Check if document already exists
        const existingDoc = documentData?.data?.find((doc: Document) => doc.type === type);

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
        setIsUploadingDocument(prev => ({ ...prev, [type]: false }));
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

  const handlePreferredAreasChange = (areas: string[]) => {
    setProfile((prev) => ({ ...prev, preferred_areas: areas }));
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
      // Prepare user profile data
      const userProfileData: any = {
        fullName: profile.fullName || userData?.data?.fullName || "",
        email: profile.email || userData?.data?.email || "",
        phone: profile.phone || userData?.data?.phone || "",
        avatar: profile.avatar || userData?.data?.avatar || "",
        location: profile.location || userData?.data?.location || "",
        district: profile.district || userData?.data?.district || "",
        bio: profile.bio || userData?.data?.bio || "",
        experience: parseInt(profile.experience) || userData?.data?.experience || 0,
        hourly_rate: parseInt(profile.hourly_rate) || userData?.data?.hourly_rate || 0,
        subjects: profile.preferred_subjects ? [profile.preferred_subjects] : userData?.data?.subjects || [],
        other_skills: profile.other_skills || userData?.data?.other_skills || [],
        qualification: profile.qualification || userData?.data?.qualification || "",
        expected_salary: profile.expected_salary || userData?.data?.expected_salary || "",
        days_per_week: profile.days_per_week || userData?.data?.days_per_week || 0,
        preferred_tutoring_style: profile.preferred_tutoring_style || userData?.data?.preferred_tutoring_style || [],
        place_of_learning: profile.place_of_learning || userData?.data?.place_of_learning || [],
        extra_facilities: profile.extra_facilities || userData?.data?.extra_facilities || "",
        preferred_medium: profile.preferred_medium || userData?.data?.preferred_medium || [],
        preferred_class: profile.preferred_class || userData?.data?.preferred_class || "",
        preferred_time: profile.preferred_time || userData?.data?.preferred_time || [],
        preferred_student_gender: profile.preferred_student_gender || userData?.data?.preferred_student_gender || "any",
        alternative_number: profile.alternative_number || userData?.data?.alternative_number || "",
        Institute_name: profile.Institute_name || userData?.data?.Institute_name || "",
        department_name: profile.department_name || userData?.data?.department_name || "",
        year: profile.year || userData?.data?.year || "",
        religion: profile.religion || userData?.data?.religion || "",
        nationality: profile.nationality || userData?.data?.nationality || "",
        blood_group: profile.blood_group || userData?.data?.blood_group || "",
        social_media_links: profile.social_media_links || userData?.data?.social_media_links || "",
        preferred_tutoring_category: profile.preferred_tutoring_category || userData?.data?.preferred_tutoring_category || "",
        present_location: profile.present_location || userData?.data?.present_location || "",
        preferred_areas: profile.preferred_areas || userData?.data?.preferred_areas || [],
      };

      // Handle educational_qualifications
      if (profile.educational_qualifications && profile.educational_qualifications.length > 0) {
        userProfileData.educational_qualifications = JSON.stringify(profile.educational_qualifications);
      }

      // Remove undefined or null values
      Object.keys(userProfileData).forEach((key) => {
        if (userProfileData[key] === undefined || userProfileData[key] === null) {
          delete userProfileData[key];
        }
      });

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

        // Refetch user data
        refetchUser();
      }
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error?.data?.message || error?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const getAllThanas = () => {
    const allThanas: string[] = [];
    BANGLADESH_DISTRICTS_WITH_POST_OFFICES.forEach((district) => {
      district.areas.forEach((area) => {
        if (!allThanas.includes(area.name)) {
          allThanas.push(area.name);
        }
      });
    });
    return allThanas.sort();
  };

  const isLoading = isLoadingUser || isLoadingDocuments || isLoadingUpgradeStatus;
  const isSaving = isUpdatingProfile || isUploadingPhoto || Object.values(isUploadingDocument).some(Boolean);

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
        <CardContent className="space-y-4">
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

          {/* Profile Photo */}
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

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Full Name</Label>
              <Input
                name="fullName"
                value={profile.fullName}
                onChange={handleProfileChange}
                placeholder="Full Name"
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
              />
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
              <Input
                name="alternative_number"
                value={profile.alternative_number}
                onChange={handleProfileChange}
                placeholder="Alternative Phone"
              />
            </div>
          </div>

          {/* University Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Institute Name</Label>
              <Input
                name="Institute_name"
                value={profile.Institute_name}
                onChange={handleProfileChange}
                placeholder="Institute Name"
              />
            </div>
            <div>
              <Label>Department</Label>
              <Input
                name="department_name"
                value={profile.department_name}
                onChange={handleProfileChange}
                placeholder="Department"
              />
            </div>
            <div>
              <Label>Year/Semester</Label>
              <Input
                name="year"
                value={profile.year}
                onChange={handleProfileChange}
                placeholder="Year/Semester"
              />
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select
                value={profile.blood_group}
                onValueChange={(value) => handleSelectChange("blood_group", value)}
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
              <Select
                value={profile.preferred_student_gender}
                onValueChange={(value) => handleSelectChange("preferred_student_gender", value)}
              >
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

          {/* Location Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label>District</Label>
              <SearchableSelect
                value={profile.district}
                onValueChange={(value) => handleSelectChange("district", value)}
                placeholder="Select District"
                options={BANGLADESH_DISTRICTS_WITH_POST_OFFICES.map(
                  (district) => ({
                    value: district.id,
                    label: district.name,
                  })
                )}
              />
            </div>
            <div>
              <Label>Present Location (Thana/Area)</Label>
              <Select
                value={profile.present_location}
                onValueChange={(value) => handleSelectChange("present_location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select present location" />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preferable Areas (Where you can teach)</Label>
              <MultiSelect
                value={profile.preferred_areas}
                onValueChange={handlePreferredAreasChange}
                placeholder="Select preferable areas"
                options={getAllThanas().map((thana) => ({
                  value: thana,
                  label: thana,
                }))}
                maxSelections={10}
              />
            </div>
          </div>

          {/* Skills and Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
                maxSelections={5}
              />
            </div>
            <div>
              <Label>Days Per Week</Label>
              <Select
                value={profile.days_per_week.toString()}
                onValueChange={(value) => handleSelectChange("days_per_week", value)}
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
              <Label>Expected Salary (Monthly)</Label>
              <Input
                name="expected_salary"
                value={profile.expected_salary}
                onChange={handleProfileChange}
                placeholder="Expected Monthly Salary"
              />
            </div>
            <div>
              <Label>Tutoring Experience (years)</Label>
              <Input
                name="experience"
                value={profile.experience}
                onChange={handleProfileChange}
                placeholder="e.g. 3"
                type="number"
                min="0"
              />
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
            <div>
              <Label>Hourly Rate</Label>
              <Input
                name="hourly_rate"
                value={profile.hourly_rate}
                onChange={handleProfileChange}
                placeholder="Hourly rate in BDT"
                type="number"
                min="0"
              />
            </div>
          </div>

          {/* Tutoring Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="mb-2 block">Preferred Tutoring Method</Label>
              <div className="space-y-2">
                {["Home Tutoring", "Online Tutoring", "Both"].map((style) => (
                  <div key={style} className="flex items-center space-x-2">
                    <Checkbox
                      checked={profile.preferred_tutoring_style.includes(style)}
                      onCheckedChange={() => {
                        handleMultiSelectChange("preferred_tutoring_style", style);
                      }}
                    />
                    <label className="text-sm font-medium leading-none">
                      {style}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Preferred Time</Label>
              <div className="space-y-2">
                {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      checked={profile.preferred_time.includes(time.toLowerCase())}
                      onCheckedChange={() => {
                        handleMultiSelectChange("preferred_time", time.toLowerCase());
                      }}
                    />
                    <label className="text-sm font-medium leading-none">
                      {time}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* About/Bio Section */}
          <div className="mb-6">
            <Label>About/Bio</Label>
            <Textarea
              name="bio"
              value={profile.bio}
              onChange={handleProfileChange}
              placeholder="Tell us about yourself, your teaching style, etc."
              rows={4}
            />
          </div>

          {/* Educational Qualifications */}
          <div className="mb-8">
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
                            <SelectItem value="Chittagong">Chittagong</SelectItem>
                            <SelectItem value="Rajshahi">Rajshahi</SelectItem>
                            <SelectItem value="Mymensingh">Mymensingh</SelectItem>
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
                            <SelectItem value="Business Studies">Business Studies</SelectItem>
                            <SelectItem value="Humanities">Humanities</SelectItem>
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

      {/* Documents Section */}
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
                        onClick={() => window.open(getDocumentByType("SSC_HSC_MARKSHEET")?.file_url, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Document
                      </Button>
                      <p className="text-xs text-gray-500">
                        {new Date(getDocumentByType("SSC_HSC_MARKSHEET")?.uploaded_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No document uploaded yet</p>
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
                <Label className="text-lg font-medium">NID/Birth Certificate</Label>
                <FileText className="h-5 w-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={(e) => handleDocumentUpload("NID_BIRTH_CERTIFICATE", e)}
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
                        onClick={() => window.open(getDocumentByType("NID_BIRTH_CERTIFICATE")?.file_url, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Document
                      </Button>
                      <p className="text-xs text-gray-500">
                        {new Date(getDocumentByType("NID_BIRTH_CERTIFICATE")?.uploaded_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No document uploaded yet</p>
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
                        onClick={() => window.open(getDocumentByType("INSTITUTE_ID")?.file_url, '_blank')}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Document
                      </Button>
                      <p className="text-xs text-gray-500">
                        {new Date(getDocumentByType("INSTITUTE_ID")?.uploaded_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No document uploaded yet</p>
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
                <h4 className="text-sm font-medium text-blue-800">Document Upload Guidelines</h4>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Upload documents in PDF, JPG, or PNG format</li>
                  <li>• Maximum file size: 10MB per document</li>
                  <li>• Ensure documents are clear and readable</li>
                  <li>• All documents are stored securely</li>
                  <li>• Existing documents will be replaced when you upload new ones</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}