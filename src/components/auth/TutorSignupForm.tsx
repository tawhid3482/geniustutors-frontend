"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";
import { useCheckPhoneNumberMutation } from "@/redux/features/auth/authApi";
import { useSendOtpMutation } from "@/redux/features/phoneVerification/phoneVerificationApi";
import { CreatableMultiSelect } from "@/components/ui/creatable-multi-select";
import { useGetAllDistrictsQuery } from "@/redux/features/district/districtApi";

interface TutorSignupFormProps {
  onPhoneVerification: (
    phoneNumber: string,
    fullName: string,
    formData?: any
  ) => void;
  onSuccess?: () => void;
}

export const TutorSignupForm: React.FC<TutorSignupFormProps> = ({
  onPhoneVerification,
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // RTK Queries
  const { data: categoryData } = useGetAllCategoryQuery(undefined);
  const { data: districtData } = useGetAllDistrictsQuery(undefined);

  // RTK Query mutations for phone verification
  const [checkPhoneNumber] = useCheckPhoneNumberMutation();
  const [sendOTP] = useSendOtpMutation();

  // Form data state
  const [tutorFormData, setTutorFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    alternativePhone: "",
    universityName: "",
    departmentName: "",
    universityYear: "",
    preferredAreas: [] as string[],
    background: [] as string[],
    gender: "",
    religion: "",
    nationality: "Bangladeshi",
    password: "",
    confirmPassword: "",
  });

  // District and area state
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [customArea, setCustomArea] = useState<string>("");
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  const [availableThanas, setAvailableThanas] = useState<string[]>([]);
  const [selectedThana, setSelectedThana] = useState<string>("");

  // Effect to update areas when district changes
  useEffect(() => {
    if (districtData?.data && selectedDistrict) {
      const selectedDistrictData = districtData.data.find(
        (district: any) => district.name === selectedDistrict
      );

      if (selectedDistrictData) {
        // Combine area and thana arrays from backend
        const allAreas = [
          ...(selectedDistrictData.area || []),
          ...(selectedDistrictData.thana || []),
        ];

        setAvailableAreas(allAreas);
        setAvailableThanas(selectedDistrictData.thana || []);
      }
    } else {
      setAvailableAreas([]);
      setAvailableThanas([]);
    }
  }, [selectedDistrict, districtData]);

  // Prepare district options for dropdown
  const districtOptions =
    districtData?.data?.map((district: any) => ({
      value: district.name,
      label: district.name,
    })) || [];

  // Check if phone number already exists using RTK Query
  const handleCheckPhoneExists = async (phone: string) => {
    try {
      const result = await checkPhoneNumber({ phone }).unwrap();
      console.log("📞 Phone check response:", result);

      if (result.success && result.data && result.data.exists === true) {
        console.log("❌ Phone number already exists");
        return true;
      }

      console.log("✅ Phone number is available");
      return false;
    } catch (error: any) {
      console.error("Error checking phone:", error);

      if (error?.data?.data?.exists === true) {
        return true;
      }

      return false;
    }
  };

  // Handle input changes
  const handleTutorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTutorFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTutorSelectChange = (name: string, value: string) => {
    setTutorFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePreferredAreasChange = (areas: string[]) => {
    setTutorFormData((prev) => ({ ...prev, preferredAreas: areas }));
  };

  const handleBackgroundChange = (backgrounds: string[]) => {
    setTutorFormData((prev) => ({ ...prev, background: backgrounds }));
  };

  // Handle district selection
  const handleDistrictChange = (district: string) => {
    setSelectedDistrict(district);
    setSelectedAreas([]);
    setSelectedThana("");
    setCustomArea("");
  };

  // Handle area selection
  const handleAreaSelect = (area: string) => {
    if (!selectedAreas.includes(area)) {
      const newAreas = [...selectedAreas, area];
      setSelectedAreas(newAreas);
      handlePreferredAreasChange(newAreas);
    }
  };

  // Handle custom area addition
  const handleAddCustomArea = () => {
    if (customArea.trim() && !selectedAreas.includes(customArea.trim())) {
      const newAreas = [...selectedAreas, customArea.trim()];
      setSelectedAreas(newAreas);
      handlePreferredAreasChange(newAreas);
      setCustomArea("");
    }
  };

  // Remove area from selection
  const handleRemoveArea = (areaToRemove: string) => {
    const newAreas = selectedAreas.filter((area) => area !== areaToRemove);
    setSelectedAreas(newAreas);
    handlePreferredAreasChange(newAreas);
  };

  // Handle thana selection
  const handleThanaChange = (thana: string) => {
    setSelectedThana(thana);
    // Add thana to areas if not already added
    if (!selectedAreas.includes(thana)) {
      const newAreas = [...selectedAreas, thana];
      setSelectedAreas(newAreas);
      handlePreferredAreasChange(newAreas);
    }
  };

  // Prepare categories for CreatableMultiSelect
  const categoryOptions =
    categoryData?.data?.map((category: any) => ({
      value: category.name,
      label: category.name,
    })) || [];

  // Tutor registration with phone verification
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !tutorFormData.fullName ||
      !tutorFormData.phone ||
      !tutorFormData.universityName ||
      !tutorFormData.departmentName ||
      selectedAreas.length === 0 ||
      tutorFormData.background.length === 0 ||
      !tutorFormData.gender ||
      !tutorFormData.password ||
      !tutorFormData.confirmPassword
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate district selection
    if (!selectedDistrict) {
      toast.error("Please select a district");
      return;
    }

    if (tutorFormData.password !== tutorFormData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (tutorFormData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    // Validate phone number format (Bangladeshi phone number)
    const phoneRegex = /^(\+880|880|0)?1[3-9]\d{8}$/;
    if (!phoneRegex.test(tutorFormData.phone)) {
      toast.error("Please enter a valid Bangladeshi phone number");
      return;
    }

    setLoading(true);

    try {
      const phoneExists = await handleCheckPhoneExists(tutorFormData.phone);

      if (phoneExists) {
        throw new Error(
          "An account with this phone number already exists. Please use a different phone number or try logging in."
        );
      }

      // Normalize phone number
      let normalizedPhone = tutorFormData.phone;
      if (tutorFormData.phone.startsWith("+880")) {
        normalizedPhone = "0" + tutorFormData.phone.slice(4);
      } else if (tutorFormData.phone.startsWith("880")) {
        normalizedPhone = "0" + tutorFormData.phone.slice(3);
      }

      // Build registration payload with district information
      const registrationPayload = {
        fullName: tutorFormData.fullName,
        email: tutorFormData.email || null,
        phone: normalizedPhone,
        password: tutorFormData.password,
        role: "TUTOR" as const,
        gender: tutorFormData.gender,
        alternative_number: tutorFormData.alternativePhone || null,
        Institute_name: tutorFormData.universityName,
        department_name: tutorFormData.departmentName,
        year: tutorFormData.universityYear || null,
        preferred_areas: selectedAreas,
        religion: tutorFormData.religion || null,
        nationality: tutorFormData.nationality,
        background: tutorFormData.background,
        district: selectedDistrict,
        thana: selectedThana || null,
      };

      console.log("Registration Payload:", registrationPayload);

      // Send OTP for phone verification
      await sendOTP({
        phone: normalizedPhone,
        name: tutorFormData.fullName,
      }).unwrap();

      // Proceed to phone verification
      onPhoneVerification(
        normalizedPhone,
        tutorFormData.fullName,
        registrationPayload
      );
    } catch (error: any) {
      console.error("❌ Error in tutor registration:", error);

      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleTutorSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-2">
          <Label
            htmlFor="tutorFullName"
            className="text-sm font-semibold text-green-800"
          >
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorFullName"
              name="fullName"
              type="text"
              placeholder="Enter your full name"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.fullName}
              onChange={handleTutorChange}
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label
            htmlFor="tutorEmail"
            className="text-sm font-semibold text-green-800"
          >
            Email Address (Optional)
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorEmail"
              name="email"
              type="email"
              placeholder="Enter your email address (optional)"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.email}
              onChange={handleTutorChange}
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div className="space-y-2">
          <Label
            htmlFor="tutorPhone"
            className="text-sm font-semibold text-green-800"
          >
            Mobile Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorPhone"
              name="phone"
              type="tel"
              placeholder="01XXXXXXXXX"
              className="pl-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.phone}
              onChange={handleTutorChange}
              required
            />
          </div>
          <p className="text-xs text-gray-500">
            Enter your 11-digit Bangladeshi phone number
          </p>
        </div>

        {/* Alternative Number */}
        <div className="space-y-2">
          <Label
            htmlFor="alternativePhone"
            className="text-sm font-semibold text-green-800"
          >
            Alternative Number
          </Label>
          <Input
            id="alternativePhone"
            name="alternativePhone"
            type="tel"
            placeholder="Alternative contact number"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.alternativePhone}
            onChange={handleTutorChange}
          />
        </div>

        {/* University Name */}
        <div className="space-y-2">
          <Label
            htmlFor="universityName"
            className="text-sm font-semibold text-green-800"
          >
            Institute Name *
          </Label>
          <Input
            id="universityName"
            name="universityName"
            type="text"
            placeholder="Your university/college name"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.universityName}
            onChange={handleTutorChange}
            required
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label
            htmlFor="departmentName"
            className="text-sm font-semibold text-green-800"
          >
            Department *
          </Label>
          <Input
            id="departmentName"
            name="departmentName"
            type="text"
            placeholder="Your department"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.departmentName}
            onChange={handleTutorChange}
            required
          />
        </div>

        {/* Year */}
        <div className="space-y-2">
          <Label
            htmlFor="universityYear"
            className="text-sm font-semibold text-green-800"
          >
            Year
          </Label>
          <Input
            id="universityYear"
            name="universityYear"
            type="text"
            placeholder="e.g., 2nd year, Final year"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.universityYear}
            onChange={handleTutorChange}
          />
        </div>

        {/* District Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-green-800">
            District *
          </Label>
          <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
            <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
              <SelectValue placeholder="Select your district" />
            </SelectTrigger>
            <SelectContent>
              {districtOptions.map((district: any) => (
                <SelectItem key={district.value} value={district.value}>
                  {district.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Thana Selection (if district has thana) */}
        {availableThanas.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-green-800">
              Thana
            </Label>
            <Select value={selectedThana} onValueChange={handleThanaChange}>
              <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
                <SelectValue placeholder="Select a thana (optional)" />
              </SelectTrigger>
              <SelectContent>
                {availableThanas.map((thana: string) => (
                  <SelectItem key={thana} value={thana}>
                    {thana}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Area Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-green-800">
            Preferred Areas *
          </Label>
          <div className="space-y-2">
            {/* Select from available areas */}
            {availableAreas.length > 0 && (
              <Select onValueChange={handleAreaSelect}>
                <SelectTrigger className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm">
                  <SelectValue placeholder="Select from available areas" />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area: string) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Custom area input */}
            <div className="flex gap-2">
              <Input
                placeholder="Or type custom area name"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
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
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!customArea.trim()}
              >
                Add
              </Button>
            </div>

            {/* Selected areas display */}
            {selectedAreas.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-green-800 mb-1">
                  Selected Areas ({selectedAreas.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedAreas.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
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
          <p className="text-xs text-gray-500">
            Select from dropdown or add custom area. Minimum 1 area required.
          </p>
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <Label
            htmlFor="tutorGender"
            className="text-sm font-semibold text-green-800"
          >
            Gender *
          </Label>
          <Select
            value={tutorFormData.gender}
            onValueChange={(value) => handleTutorSelectChange("gender", value)}
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

        {/* Religion */}
        <div className="space-y-2">
          <Label
            htmlFor="religion"
            className="text-sm font-semibold text-green-800"
          >
            Religion
          </Label>
          <Input
            id="religion"
            name="religion"
            type="text"
            placeholder="Your religion"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.religion}
            onChange={handleTutorChange}
          />
        </div>

        {/* Nationality */}
        <div className="space-y-2">
          <Label
            htmlFor="nationality"
            className="text-sm font-semibold text-green-800"
          >
            Nationality
          </Label>
          <Input
            id="nationality"
            name="nationality"
            type="text"
            placeholder="Your nationality"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.nationality}
            onChange={handleTutorChange}
          />
        </div>

        {/* Background - Creatable MultiSelect */}
        <div className="space-y-2">
          <Label
            htmlFor="background"
            className="text-sm font-semibold text-green-800"
          >
            Background *
          </Label>
          <CreatableMultiSelect
            value={tutorFormData.background}
            onValueChange={handleBackgroundChange}
            placeholder="background."
            options={categoryOptions}
            maxSelections={5}
            className="border-green-200 focus:border-green-500"
          />
          <p className="text-xs text-gray-500">
            Type to search existing subjects or add new ones
          </p>
        </div>
      </div>

      {/* Password fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="tutorPassword"
            className="text-sm font-semibold text-green-800"
          >
            Password *
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-green-600" />
            <Input
              id="tutorPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a password"
              className="pl-10 pr-10 h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
              value={tutorFormData.password}
              onChange={handleTutorChange}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-green-600 hover:text-green-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="tutorConfirmPassword"
            className="text-sm font-semibold text-green-800"
          >
            Confirm Password *
          </Label>
          <Input
            id="tutorConfirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Confirm your password"
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
            value={tutorFormData.confirmPassword}
            onChange={handleTutorChange}
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Verifying Phone..." : "Send OTP & Continue"}
      </Button>
    </form>
  );
};
