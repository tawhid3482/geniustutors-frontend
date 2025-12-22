"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { SUBJECT_OPTIONS, CLASS_LEVELS } from "@/data/mockData";
import mediumOptions from "@/data/mediumOptions.json";
import { TutorRequestFormData } from "@/services/tutorRequestService";
import { useAuth } from "@/contexts/AuthContext.next";

import {
  BookOpen,
  MapPin,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  School,
  GraduationCap,
} from "lucide-react";
import { taxonomyService, Category } from "@/services/taxonomyService";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";
import { useCreateTutorRequestsMutation } from "@/redux/features/tutorRequest/tutorRequestApi";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";

// Define types based on your backend response
interface District {
  id: string;
  name: string;
  thana: string[];
  area: string[];
  createdAt: string;
  color?: string;
}

export default function TutorRequestPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redux queries for districts and categories
  const {
    data: districtData,
    isLoading: isLoadingDistricts,
    error: districtError,
  } = useGetAllDistrictsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  console.log(districtData)



  const {
    data: categoryData,
    isLoading: isLoadingCategories,
    error: categoryError,
  } = useGetAllCategoryQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const [createTutorRequest, { isLoading: creating }] =
    useCreateTutorRequestsMutation();

  // District, thana and area state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedThana, setSelectedThana] = useState<string>("");
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [customArea, setCustomArea] = useState<string>("");

  // Form data state
  const [formData, setFormData] = useState<TutorRequestFormData>({
    phoneNumber: "",
    userId: user?.id || ("" as any),
    studentGender: "" as any,
    district: "",
    area: "",
    thana: "",
    detailedLocation: "",
    selectedCategories: [],
    selectedSubjects: [],
    selectedClasses: [],
    tutorGenderPreference: "" as any,
    isSalaryNegotiable: true,
    salaryRange: {
      min: "" as any,
      max: "" as any,
    },
    extraInformation: "",
    // New fields
    medium: "" as any,
    numberOfStudents: "" as any,
    tutoringDays: "" as any,
    tutoringTime: "",
    tutoringDuration: "" as any,
    tutoringType: "" as any,
  });

  // Taxonomy data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classLevels, setClassLevels] = useState<any[]>([]);
  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState(false);

  // Effect to update thanas when district changes
  useEffect(() => {
    if (districtData?.data && selectedDistrict) {
      const selectedDistrictData = districtData.data.find(
        (district: District) => district.name === selectedDistrict
      );

      if (selectedDistrictData) {
        // Set available thanas from backend
        setAvailableThanas(selectedDistrictData.thana || []);

        // Clear selected thana and areas when district changes
        setSelectedThana("");
        setSelectedAreas([]);
        setCustomArea("");
        setAvailableAreas([]);

        // Update form data with selected district and clear thana
        setFormData((prev) => ({
          ...prev,
          district: selectedDistrict,
          thana: "", // Clear thana when district changes
          area: "", // Clear area when district changes
        }));
      }
    } else {
      setAvailableThanas([]);
      setAvailableAreas([]);
      setSelectedThana("");
      setSelectedAreas([]);
    }
  }, [selectedDistrict, districtData]);

  // Effect to update areas when thana changes
  useEffect(() => {
    if (districtData?.data && selectedDistrict && selectedThana) {
      const selectedDistrictData = districtData.data.find(
        (district: District) => district.name === selectedDistrict
      );

      if (selectedDistrictData) {
        // Only show areas for the selected district
        setAvailableAreas(selectedDistrictData.area || []);

        // Clear selected areas when thana changes
        setSelectedAreas([]);
        setCustomArea("");
      }
    } else {
      setAvailableAreas([]);
      setSelectedAreas([]);
    }
  }, [selectedThana, selectedDistrict, districtData]);

  // Process categories from categoryData
  useEffect(() => {
    if (categoryData?.data && Array.isArray(categoryData?.data)) {
      // Transform category data to match your Category type
      const processedCategories = categoryData?.data.map((category: any) => ({
        id: category.id,
        name: category.name,
        subjects: category.subjects || [],
        classLevels: category.classLevels || [],
      }));
      setCategories(processedCategories);
    }
  }, [categoryData]);

  // Fetch taxonomy for multiple categories and aggregate subjects and classes
  const fetchMultiCategoryTaxonomy = useCallback(
    async (categoryNames: string[]) => {
      setIsLoadingTaxonomy(true);
      try {
        const allSubjects: any[] = [];
        const allClassLevels: any[] = [];
        const processedSubjects = new Set<string>();
        const processedClassLevels = new Set<string>();

        // Find categories in the current categories
        for (const categoryName of categoryNames) {
          const category = categories.find((cat) => cat.name === categoryName);

          if (category) {
            // Add unique subjects
            if (category.subjects) {
              category.subjects.forEach((subject: any) => {
                if (
                  subject &&
                  typeof subject === "object" &&
                  subject.id !== undefined &&
                  !processedSubjects.has(subject.name)
                ) {
                  allSubjects.push(subject);
                  processedSubjects.add(subject.name);
                }
              });
            }

            // Add unique class levels
            if (category.classLevels) {
              category.classLevels.forEach((classLevel: any) => {
                if (
                  classLevel &&
                  typeof classLevel === "object" &&
                  classLevel.id !== undefined &&
                  !processedClassLevels.has(classLevel.name)
                ) {
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
          setSubjects(
            SUBJECT_OPTIONS.filter((subject) => subject !== "All Subjects").map(
              (name, index) => ({ id: index + 1, name })
            )
          );
          setClassLevels(
            CLASS_LEVELS.map((name, index) => ({ id: index + 1, name }))
          );
        }
      } catch (error) {
        console.error("Error fetching multi-category taxonomy:", error);
        toast({
          title: "Error",
          description: "Failed to load subjects and class levels",
          variant: "destructive",
        });
        // Fallback to mock data if API fails
        setSubjects(
          SUBJECT_OPTIONS.filter((subject) => subject !== "All Subjects").map(
            (name, index) => ({ id: index + 1, name })
          )
        );
        setClassLevels(
          CLASS_LEVELS.map((name, index) => ({ id: index + 1, name }))
        );
      } finally {
        setIsLoadingTaxonomy(false);
      }
    },
    [categories, toast]
  );

  // Fetch category-specific subjects and class levels when selected categories change
  useEffect(() => {
    if (formData.selectedCategories && formData.selectedCategories.length > 0) {
      fetchMultiCategoryTaxonomy(formData.selectedCategories);
      // Reset selected subjects and classes when categories change
      setFormData((prev) => ({
        ...prev,
        selectedSubjects: [],
        selectedClasses: [],
      }));
    } else {
      // Clear subjects and classes when no categories are selected
      setSubjects([]);
      setClassLevels([]);
    }
  }, [formData.selectedCategories, fetchMultiCategoryTaxonomy]);

  // Handle district selection
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
  };

  // Handle thana selection
  const handleThanaChange = (thana: string) => {
    setSelectedThana(thana);
    setSelectedAreas([]);
    setCustomArea("");

    // Update form data with selected thana
    setFormData((prev) => ({
      ...prev,
      thana: thana,
    }));
  };

  // Handle area selection from dropdown
  const handleAreaSelect = (area: string) => {
    if (!selectedAreas.includes(area)) {
      const newAreas = [...selectedAreas, area];
      setSelectedAreas(newAreas);

      // Update form data with selected areas as comma-separated string
      setFormData((prev) => ({
        ...prev,
        area: newAreas.join(", "),
      }));
    }
  };

  // Handle custom area addition
  const handleAddCustomArea = () => {
    if (customArea.trim() && !selectedAreas.includes(customArea.trim())) {
      const newAreas = [...selectedAreas, customArea.trim()];
      setSelectedAreas(newAreas);

      // Update form data with selected areas as comma-separated string
      setFormData((prev) => ({
        ...prev,
        area: newAreas.join(", "),
      }));
      setCustomArea("");
    }
  };

  // Remove area from selection
  const handleRemoveArea = (areaToRemove: string) => {
    const newAreas = selectedAreas.filter((area) => area !== areaToRemove);
    setSelectedAreas(newAreas);

    // Update form data with selected areas as comma-separated string
    setFormData((prev) => ({
      ...prev,
      area: newAreas.join(", "),
    }));
  };

  // Handle form field changes
  const handleChange = (field: keyof TutorRequestFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle subject selection
  const handleSubjectSelection = (subjectName: string) => {
    setFormData((prev) => {
      const currentSubjects = prev.selectedSubjects || [];
      const subjects = currentSubjects.includes(subjectName)
        ? currentSubjects.filter((s) => s !== subjectName)
        : [...currentSubjects, subjectName];

      return {
        ...prev,
        selectedSubjects: subjects,
      };
    });
  };

  // Handle category selection
  const handleCategorySelection = (categoryName: string) => {
    setFormData((prev) => {
      const currentCategories = prev.selectedCategories || [];
      const categories = currentCategories.includes(categoryName)
        ? currentCategories.filter((c) => c !== categoryName)
        : [...currentCategories, categoryName];

      return {
        ...prev,
        selectedCategories: categories,
      };
    });
  };

  // Handle class selection
  const handleClassSelection = (className: string) => {
    setFormData((prev) => {
      const currentClasses = prev.selectedClasses || [];
      const classes = currentClasses.includes(className)
        ? currentClasses.filter((c) => c !== className)
        : [...currentClasses, className];

      return {
        ...prev,
        selectedClasses: classes,
      };
    });
  };

  // Prepare district options for dropdown
  const districtOptions =
    districtData?.data?.map((district: District) => ({
      value: district.name,
      label: district.name,
    })) || [];

  // Update form data when selections change
  useEffect(() => {
    if (selectedDistrict) {
      setFormData((prev) => ({
        ...prev,
        district: selectedDistrict,
      }));
    }
  }, [selectedDistrict]);

  // Submit form using Redux mutation
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Debug logging
      console.log("Form data before submission:", formData);
      console.log("Selected thana:", selectedThana);
      console.log("FormData.thana:", formData.thana);

      // Check if user is logged in
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to submit a tutor request",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Validate form data
      if (
        !formData.phoneNumber ||
        !formData.studentGender ||
        !formData.district ||
        !formData.thana || // thana validation added
        !formData.area ||
        !formData.tutorGenderPreference ||
        !formData.medium ||
        !formData.tutoringType ||
        !formData.tutoringDuration ||
        !formData.tutoringDays ||
        !formData.numberOfStudents
      ) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields (including thana)",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if ((formData.selectedCategories || []).length === 0) {
        toast({
          title: "Missing Information",
          description: "Please select at least one category",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (
        (formData.selectedSubjects || []).length === 0 ||
        (formData.selectedClasses || []).length === 0
      ) {
        toast({
          title: "Missing Information",
          description: "Please select at least one subject and class",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (!formData.tutoringTime) {
        toast({
          title: "Missing Information",
          description: "Please select tutoring time",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (
        !formData.salaryRange.min ||
        !formData.salaryRange.max ||
        formData.salaryRange.min === "" ||
        formData.salaryRange.max === ""
      ) {
        toast({
          title: "Missing Information",
          description: "Please enter salary range",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (
        parseInt(formData.salaryRange.min.toString()) >
        parseInt(formData.salaryRange.max.toString())
      ) {
        toast({
          title: "Invalid Salary Range",
          description: "Minimum salary cannot be greater than maximum salary",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare submit data according to your Prisma model
      const submitData = {
        // Required fields from model
        phoneNumber: formData.phoneNumber,
        studentGender: formData.studentGender,
        district: formData.district,
        thana: formData.thana, // Ensure thana is included
        area: formData.area,
        detailedLocation: formData.detailedLocation,

        // JSON fields - need to be properly formatted
        selectedCategories: formData.selectedCategories || [],
        selectedSubjects: formData.selectedSubjects || [],
        selectedClasses: formData.selectedClasses || [],

        // Additional required fields
        tutorGenderPreference: formData.tutorGenderPreference,
        isSalaryNegotiable: formData.isSalaryNegotiable,

        // Salary range as JSON
        salaryRange: {
          min: parseInt(formData.salaryRange.min.toString()) || 0,
          max: parseInt(formData.salaryRange.max.toString()) || 0,
        },

        // Optional fields
        extraInformation: formData.extraInformation || "",

        // Subject and class for backward compatibility
        subject:
          formData.selectedSubjects.length > 0
            ? formData.selectedSubjects[0]
            : "",
        studentClass:
          formData.selectedClasses.length > 0
            ? formData.selectedClasses[0]
            : "",

        // New fields
        medium: formData.medium,
        numberOfStudents: parseInt(formData.numberOfStudents.toString()) || 1,
        tutoringDays: parseInt(formData.tutoringDays.toString()) || 1,
        tutoringTime: formData.tutoringTime,
        tutoringDuration: formData.tutoringDuration,
        tutoringType: formData.tutoringType,

        // User ID - only send if user is logged in
        userId: user?.id || null,
      };

      // Log the data for debugging
      console.log("Submitting data:", JSON.stringify(submitData, null, 2));

      // Use Redux mutation to create tutor request
      const result = await createTutorRequest(submitData);
      console.log("Response:", result);

      if ("data" in result && result.data) {
        setShowSuccess(true);
        toast({
          title: "Request Submitted",
          description: "Your tutor request has been submitted successfully!",
        });
      } else {
        // Check for specific error message
        const errorMessage =
          (result.error as any)?.data?.message ||
          (result.error as any)?.data?.error?.message ||
          "Failed to submit tutor request";

        toast({
          title: "Submission Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error submitting tutor request:", error);
      toast({
        title: "Submission Error",
        description:
          error.message ||
          "An error occurred while submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form and go to dashboard
  const goToDashboard = () => {
    router.push("/dashboard");
  };

  // If showing success message
  if (showSuccess) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card className="w-full bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">
              Thank you for submitting tutor request!
            </CardTitle>
            <CardDescription className="text-lg text-green-700 mt-2">
              Your tutor request has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Our team will review your request and match you with suitable
              tutors. You will receive notifications when tutors respond to your
              request.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <School className="h-6 w-6 text-green-500" />
                </div>
                <h3 className="font-medium text-gray-800">Subjects</h3>
                <p className="text-sm text-gray-600">
                  {formData.selectedSubjects.join(", ")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <GraduationCap className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="font-medium text-gray-800">Classes</h3>
                <p className="text-sm text-gray-600">
                  {formData.selectedClasses.join(", ")}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-medium text-gray-800">Location</h3>
                <p className="text-sm text-gray-600">
                  {formData.area}, {formData.thana}, {formData.district}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="font-medium text-gray-800">Salary Range</h3>
                <p className="text-sm text-gray-600">
                  ৳{formData.salaryRange.min.toLocaleString()} - ৳
                  {formData.salaryRange.max.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-medium text-gray-800">Schedule</h3>
                <p className="text-sm text-gray-600">
                  {formData.tutoringDays} days/week at {formData.tutoringTime}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <User className="h-6 w-6 text-indigo-500" />
                </div>
                <h3 className="font-medium text-gray-800">Students</h3>
                <p className="text-sm text-gray-600">
                  {formData.numberOfStudents} student(s)
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="font-medium text-gray-800">Medium</h3>
                <p className="text-sm text-gray-600">{formData.medium}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center space-x-4">
            <Button
              onClick={goToDashboard}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 overflow-hidden">
      <style jsx global>{`
        body {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        body::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        html {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
        }
        html::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
      `}</style>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-black-900 mb-2 sm:mb-3">
          Are you looking for a tutor?
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Then fill out the form and tell us which class/area you are looking
          for a tutor for.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-4 sm:mb-6">
        <div className="lg:col-span-2">
          <Card className="w-full shadow-lg border-gray-200">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) =>
                          handleChange("phoneNumber", e.target.value)
                        }
                        placeholder="Phone Number *"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={formData.studentGender || ""}
                        onValueChange={(value) =>
                          handleChange("studentGender", value)
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Student Gender *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Input
                        id="detailedLocation"
                        value={formData.detailedLocation}
                        onChange={(e) =>
                          handleChange("detailedLocation", e.target.value)
                        }
                        placeholder="Address *"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={formData.tutorGenderPreference || ""}
                        onValueChange={(value) =>
                          handleChange("tutorGenderPreference", value)
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Tutor Gender *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="any">Any</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Location Information Section - Sequential Selection */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* District - Dropdown from backend */}
                    <div className="space-y-2">
                      <Select
                        value={selectedDistrict}
                        onValueChange={handleDistrictChange}
                        disabled={isLoadingDistricts}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="District *" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <div className="pr-1 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                            {districtOptions.map((district: any) => (
                              <SelectItem
                                key={district.value}
                                value={district.value}
                              >
                                {district.label}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      {isLoadingDistricts && (
                        <p className="text-xs text-gray-500">
                          Loading districts...
                        </p>
                      )}
                    </div>

                    {/* Thana - Only shown after district is selected */}
                    <div className="space-y-2">
                      <Select
                        value={selectedThana}
                        onValueChange={handleThanaChange}
                        disabled={!selectedDistrict}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Thana *" />
                        </SelectTrigger>
                        <SelectContent className="max-h-80">
                          <div className="pr-1 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                            {availableThanas.map((thana: string) => (
                              <SelectItem key={thana} value={thana}>
                                {thana}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      {!selectedDistrict && (
                        <p className="text-xs text-gray-500">
                          Select district first
                        </p>
                      )}
                    </div>

                    {/* Area - Only shown after thana is selected */}
                    <div className="space-y-2">
                      {selectedThana ? (
                        <>
                          {/* Area selection dropdown */}
                          {availableAreas.length > 0 && (
                            <Select onValueChange={handleAreaSelect}>
                              <SelectTrigger className="h-10 sm:h-11">
                                <SelectValue placeholder="Select area *" />
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                <div className="pr-1 overflow-y-auto max-h-60 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                                  {availableAreas.map((area: string) => (
                                    <SelectItem key={area} value={area}>
                                      {area}
                                    </SelectItem>
                                  ))}
                                </div>
                              </SelectContent>
                            </Select>
                          )}

                          {/* Custom area input */}
                          <div className="flex gap-2">
                            <Input
                              placeholder="Or type custom area name"
                              value={customArea}
                              onChange={(e) => setCustomArea(e.target.value)}
                              className="h-10 sm:h-11 bg-white/80 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustomArea();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleAddCustomArea}
                              className="bg-green-600 hover:bg-green-700 text-white h-10 sm:h-11"
                              disabled={!customArea.trim()}
                            >
                              Add
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="h-10 sm:h-11 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-500">
                            Select thana first
                          </p>
                        </div>
                      )}
                    </div>

                
                  </div>

                  {/* Selected areas display - Shown when areas are selected */}
                  {selectedAreas.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-green-800 mb-1">
                        Selected Areas ({selectedAreas.length}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedAreas.map((area) => (
                          <div
                            key={area}
                            className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs"
                          >
                            <span>{area}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveArea(area)}
                              className="ml-1 text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Academic Information Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (
                            value &&
                            !formData.selectedCategories.includes(value)
                          ) {
                            handleCategorySelection(value);
                          }
                        }}
                        disabled={isLoadingCategories || isLoadingTaxonomy}
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Medium *" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((category) => category && category.id)
                            .map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.name}
                              >
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      {isLoadingCategories && (
                        <p className="text-xs text-gray-500">
                          Loading categories...
                        </p>
                      )}
                      {formData.selectedCategories.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.selectedCategories.map(
                            (category, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm"
                              >
                                <span>{category}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCategorySelection(category)
                                  }
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {isLoadingTaxonomy ? (
                        <div className="text-center py-4 text-sm">
                          Loading subjects...
                        </div>
                      ) : (
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (
                              value &&
                              !formData.selectedSubjects.includes(value)
                            ) {
                              handleSubjectSelection(value);
                            }
                          }}
                          disabled={!formData.selectedCategories.length}
                        >
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Subjects *" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects
                              .filter((subject) => subject && subject.id)
                              .map((subject) => (
                                <SelectItem
                                  key={subject.id}
                                  value={subject.name}
                                >
                                  {subject.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      {formData.selectedSubjects.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.selectedSubjects.map((subject, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm"
                            >
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
                      {isLoadingTaxonomy ? (
                        <div className="text-center py-4 text-sm">
                          Loading class levels...
                        </div>
                      ) : (
                        <Select
                          value=""
                          onValueChange={(value) => {
                            if (
                              value &&
                              !formData.selectedClasses.includes(value)
                            ) {
                              handleClassSelection(value);
                            }
                          }}
                          disabled={!formData.selectedCategories.length}
                        >
                          <SelectTrigger className="h-10 sm:h-11">
                            <SelectValue placeholder="Class Levels *" />
                          </SelectTrigger>
                          <SelectContent>
                            {classLevels
                              .filter(
                                (classLevel) => classLevel && classLevel.id
                              )
                              .map((classLevel) => (
                                <SelectItem
                                  key={classLevel.id}
                                  value={classLevel.name}
                                >
                                  {classLevel.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                      {formData.selectedClasses.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {formData.selectedClasses.map((className, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-50 px-2 py-1 rounded text-xs sm:text-sm"
                            >
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
                      <Select
                        value={formData.tutoringType || ""}
                        onValueChange={(value) =>
                          handleChange("tutoringType", value)
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Tutoring Type *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home Tutoring">
                            Home Tutoring
                          </SelectItem>
                          <SelectItem value="Online Tutoring">
                            Online Tutoring
                          </SelectItem>
                          <SelectItem value="Both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tutoring Details Section */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Input
                        id="numberOfStudents"
                        type="number"
                        min="1"
                        max="10"
                        value={formData.numberOfStudents || ""}
                        onChange={(e) =>
                          handleChange(
                            "numberOfStudents",
                            parseInt(e.target.value) || 1
                          )
                        }
                        placeholder="Total Students*"
                        className="w-full h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={formData.tutoringDuration || ""}
                        onValueChange={(value) =>
                          handleChange("tutoringDuration", value)
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Tutoring Hours *" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1:00">1 Hour</SelectItem>
                          <SelectItem value="1:30">1.5 Hours</SelectItem>
                          <SelectItem value="2:00">2 Hours</SelectItem>
                          <SelectItem value="2:30">2.5 Hours</SelectItem>
                          <SelectItem value="3:00">3 Hours</SelectItem>
                          <SelectItem value="3:30">3.5 Hours</SelectItem>
                          <SelectItem value="4:00">4 Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Select
                        value={formData.tutoringDays.toString() || ""}
                        onValueChange={(value) =>
                          handleChange("tutoringDays", parseInt(value))
                        }
                      >
                        <SelectTrigger className="h-10 sm:h-11">
                          <SelectValue placeholder="Tutoring Days *" />
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

                    <div className="space-y-2">
                      <Input
                        id="tutoringTime"
                        type="time"
                        value={formData.tutoringTime}
                        onChange={(e) =>
                          handleChange("tutoringTime", e.target.value)
                        }
                        className="w-full h-10 sm:h-11"
                      />
                      <p className="text-xs text-gray-500">Tutoring Time *</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Input
                        id="salaryMin"
                        type="number"
                        min="0"
                        value={formData.salaryRange.min || ""}
                        onChange={(e) =>
                          handleChange("salaryRange", {
                            ...formData.salaryRange,
                            min: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Minimum Salary *"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Input
                        id="salaryMax"
                        type="number"
                        min="0"
                        value={formData.salaryRange.max || ""}
                        onChange={(e) =>
                          handleChange("salaryRange", {
                            ...formData.salaryRange,
                            max: parseInt(e.target.value) || 0,
                          })
                        }
                        placeholder="Maximum Salary *"
                        className="w-full h-10 sm:h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Textarea
                        id="extraInformation"
                        value={formData.extraInformation}
                        onChange={(e) =>
                          handleChange("extraInformation", e.target.value)
                        }
                        placeholder="Additional Information"
                        className="w-full min-h-[80px] sm:min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-2 flex items-center justify-center">
                      <div className="flex items-center justify-between w-full">
                        <Label
                          htmlFor="isSalaryNegotiable"
                          className="text-sm leading-tight"
                        >
                          Salary is Negotiable
                        </Label>
                        <Switch
                          id="isSalaryNegotiable"
                          checked={formData.isSalaryNegotiable}
                          onCheckedChange={(checked) =>
                            handleChange("isSalaryNegotiable", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center mt-6">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      creating ||
                      selectedAreas.length === 0 ||
                      !user ||
                      !formData.thana // Disable if thana is not selected
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg w-full max-w-md"
                  >
                    {isSubmitting || creating
                      ? "Submitting..."
                      : "Submit Tutor Request"}
                    {!(isSubmitting || creating) && (
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
                    )}
                  </Button>
                  {!formData.thana && selectedDistrict && (
                    <p className="text-xs text-red-500 mt-2 text-center w-full">
                      Please select a thana
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* HELP & INFO Section */}
        <div className="lg:col-span-1 max-w-sm">
          <Card className="w-full shadow-lg border-gray-200 h-fit bg-white">
            <CardHeader className="bg-white p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg font-bold text-black-900 text-center">
                HELP & INFO
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4 text-center">
                <div className="space-y-3 sm:space-y-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <h4 className="font-bold text-black-900 mb-1 text-xs sm:text-sm">
                        Q. If i cant get the desired tutor ?
                      </h4>
                      <p className="text-gray-600 text-xs">
                        Just fill up the request tutor form and send us. We will
                        try to find your desired tutor.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-black-900 mb-1 text-xs sm:text-sm">
                        Q. what will happen after fill the forms ?
                      </h4>
                      <p className="text-gray-600 text-xs">
                        After fill up the form the information will be sent to
                        genius-tutors support team. They will review/ verify the
                        info and will publish on the available tuitions section.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
