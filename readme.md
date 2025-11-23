"use client";

import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building2,
} from "lucide-react";
import { MultiSelect } from "@/components/ui/multi-select";
import { useGetAllCategoryQuery } from "@/redux/features/category/categoryApi";
import { useGetAllAreaQuery } from "@/redux/features/area/areaApi";
import { useCreateAuthMutation } from "@/redux/features/auth/authApi";

interface TutorSignupFormProps {
  onSuccess?: () => void;
}

export const TutorSignupForm: React.FC<TutorSignupFormProps> = ({
  onSuccess,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // RTK Queries
  const { data: categoryData } = useGetAllCategoryQuery(undefined);
  const { data: areaData } = useGetAllAreaQuery(undefined);
  const [createAuth, { isLoading: creating }] = useCreateAuthMutation();

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

  // Prepare categories for MultiSelect
  const categoryOptions =
    categoryData?.data?.map((category: any) => ({
      value: category.name,
      label: category.name,
    })) || [];

  // Prepare areas for MultiSelect - flatten all area names
  const areaOptions =
    areaData?.data?.flatMap(
      (area: any) =>
        area.name?.map((areaName: string) => ({
          value: areaName,
          label: areaName,
        })) || []
    ) || [];

  // Simplified registration without OTP and phone verification
  const handleTutorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !tutorFormData.fullName ||
      !tutorFormData.phone ||
      !tutorFormData.universityName ||
      !tutorFormData.departmentName ||
      tutorFormData.preferredAreas.length === 0 ||
      tutorFormData.background.length === 0 ||
      !tutorFormData.gender ||
      !tutorFormData.password ||
      !tutorFormData.confirmPassword
    ) {
      toast.error("Please fill in all required fields");
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
      // Normalize phone number
      let normalizedPhone = tutorFormData.phone;
      if (tutorFormData.phone.startsWith("+880")) {
        normalizedPhone = "0" + tutorFormData.phone.slice(4);
      } else if (tutorFormData.phone.startsWith("880")) {
        normalizedPhone = "0" + tutorFormData.phone.slice(3);
      }

      // Build registration payload
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
        preferred_areas: tutorFormData.preferredAreas,
        religion: tutorFormData.religion || null,
        nationality: tutorFormData.nationality,
        background: tutorFormData.background,
      };

      // console.log("Registration payload:", registrationPayload);

      // Direct registration without OTP - use unwrap() for proper error handling
      const result = await createAuth(registrationPayload).unwrap();
      
      // console.log("Registration successful:", result);

      if (result.success) {
        toast.success("Registration successful! Please login.");
        if (onSuccess) {
          onSuccess();
        }

        // Reset form
        setTutorFormData({
          fullName: "",
          email: "",
          phone: "",
          alternativePhone: "",
          universityName: "",
          departmentName: "",
          universityYear: "",
          preferredAreas: [],
          background: [],
          gender: "",
          religion: "",
          nationality: "Bangladeshi",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error: any) {
      // console.error("Registration error:", error);
      
      // RTK Query error structure - check different possible error formats
      if (error?.data) {
        // Case 1: Backend returned error with data property
        const errorMessage = error.data.message || "Registration failed";
        toast.error(errorMessage);
      } else if (error?.error) {
        // Case 2: Backend returned error with error property
        const errorMessage = error.error || "Registration failed";
        toast.error(errorMessage);
      } else if (error?.message) {
        // Case 3: JavaScript error or backend message directly
        const errorMessage = error.message;
        
        // Check for specific backend error messages
        if (errorMessage.includes("phone already registered") || 
            errorMessage.includes("already exists")) {
          toast.error("Phone number already registered. Please use a different number.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        // Case 4: Unknown error format
        toast.error("Registration failed. Please try again.");
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

        {/* Preferred Areas - From Database */}
        <div className="space-y-2">
          <Label
            htmlFor="preferredAreas"
            className="text-sm font-semibold text-green-800"
          >
            Preferred Areas *
          </Label>
          <MultiSelect
            value={tutorFormData.preferredAreas}
            onValueChange={handlePreferredAreasChange}
            placeholder="Select preferred areas"
            options={areaOptions}
            maxSelections={5}
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
          />
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

        {/* Background - Categories From Database */}
        <div className="space-y-2">
          <Label
            htmlFor="background"
            className="text-sm font-semibold text-green-800"
          >
           Background
          </Label>
          <MultiSelect
            value={tutorFormData.background}
            onValueChange={handleBackgroundChange}
            placeholder="Select teaching categories"
            options={categoryOptions}
            maxSelections={5}
            className="h-11 bg-white/80 border-green-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl text-sm transition-all duration-300 backdrop-blur-sm"
          />
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
        disabled={loading || creating}
      >
        {loading || creating ? "Creating Account..." : "Complete Registration"}
      </Button>
    </form>
  );
};