"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { User, Camera, RefreshCw } from "lucide-react";
import { ALL_DISTRICTS } from "@/data/bangladeshDistricts";
import { toast } from "@/components/ui/use-toast";
import {
  useChangePasswordMutation,
  useUpdateUserProfileMutation,
} from "@/redux/features/auth/authApi";
import { useAuth } from "@/contexts/AuthContext.next";
import { useRouter } from "next/navigation";

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  district: string;
  location: string;
  avatar?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function StudentProfile() {
  const { user, signOut } = useAuth();
  console.log(user)
  const router = useRouter();

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    fullName: "",
    email: "",
    phone: "",
    district: "",
    location: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState<PasswordFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // RTK Query mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  // Initialize profile form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        district: user.district || "",
        location: user.location || "",
        avatar: user.avatar || "",
      });

      if (user.avatar) {
        setProfilePhotoPreview(user.avatar);
      }
    }
  }, [user]);

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
      if (!res.ok) throw new Error("Failed to upload image");
      const result = await res.json();
      return result.url;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    // Set preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Store the file for later upload when saving
    setProfilePhoto(file);
  };

  // Profile form handlers
  const handleProfileFormChange = (field: keyof ProfileFormData, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileFormSubmit = async () => {
    // Check if user is available
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!profileForm.fullName.trim()) {
      toast({
        title: "Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }

    if (!profileForm.email.trim()) {
      toast({
        title: "Error",
        description: "Email is required",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    if (!profileForm.phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    try {
      let avatarUrl = user.avatar || ""; // Keep existing avatar by default

      // If a new photo is selected, upload it first
      if (profilePhoto) {
        setIsUploadingAvatar(true);
        try {
          avatarUrl = await uploadImage(profilePhoto);
          toast({
            title: "Success",
            description: "Profile photo uploaded successfully",
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description:
              error?.message || "Failed to upload profile photo",
            variant: "destructive",
          });
          return; // Stop if image upload fails
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Prepare update data
      const updateData = {
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        district: profileForm.district,
        avatar: avatarUrl,
      };

      // Remove empty fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === "") {
          delete updateData[key as keyof typeof updateData];
        }
      });

      // Update profile
      const result = await updateProfile({
        id: user.id,
        data: updateData,
      }).unwrap();

      if (result.success) {
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });

        // Clear the photo state after successful update
        setProfilePhoto(null);

        // Logout and redirect
        signOut();
        router.push("/");
        toast({
          description: "Please login again to see the changes",
        });
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };



  // If no user, show message
  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Please login to view your profile.</p>
          <Button
            className="mt-4 bg-green-600 hover:bg-green-700"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                className="mt-1 border-2 border-green-500"
                value={profileForm.fullName}
                onChange={(e) =>
                  handleProfileFormChange("fullName", e.target.value)
                }
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                className="mt-1 border-2 border-green-500"
                value={profileForm.email}
                onChange={(e) =>
                  handleProfileFormChange("email", e.target.value)
                }
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                className="mt-1 border-2 border-green-500"
                value={profileForm.phone}
                onChange={(e) =>
                  handleProfileFormChange("phone", e.target.value)
                }
                type="tel"
                placeholder="Enter your phone number"
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Select
                value={profileForm.district}
                onValueChange={(v) => handleProfileFormChange("district", v)}
              >
                <SelectTrigger id="district" className="mt-1">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DISTRICTS.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
         
            <div className="md:col-span-2">
              <Label>Profile Photo</Label>
              <div className="mt-1 flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300 overflow-hidden">
                    {profilePhotoPreview ? (
                      <img
                        src={profilePhotoPreview}
                        alt="Profile Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    {profilePhoto
                      ? "New photo selected. Click 'Save Changes' to upload."
                      : "Upload a profile photo to personalize your account"}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("photo-upload")?.click()
                      }
                    >
                      Choose Photo
                    </Button>
                    {profilePhoto && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setProfilePhoto(null);
                          setProfilePhotoPreview(user.avatar || "");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPG, PNG, GIF. Max size: 5MB
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleProfileFormSubmit}
              disabled={isUpdatingProfile || isUploadingAvatar}
            >
              {isUpdatingProfile || isUploadingAvatar ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingAvatar ? "Uploading..." : "Saving..."}
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

     
    </div>
  );
}