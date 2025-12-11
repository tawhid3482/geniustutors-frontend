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

interface StudentProfileProps {
  profile: any;
  refetchProfile?: () => void; // Optional: to refetch profile data after update
}

export function StudentProfile({
  profile,
  refetchProfile,
}: StudentProfileProps) {
  const [profileForm, setProfileForm] = useState({
    fullName: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    district: profile.district || "",
    location: profile.location || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  // RTK Query mutations
  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  useEffect(() => {
    setProfileForm({
      fullName: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      district: profile.district || "",
      location: profile.location || "",
    });

    // Reset preview if profile has avatar
    if (profile.avatar) {
      setProfilePhotoPreview(profile.avatar);
    }
  }, [profile]);

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
  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProfileFormSubmit = async () => {
    // Check if userId is available
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      let avatarUrl = profile.avatar; // Keep existing avatar by default

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
              error?.data?.message || "Failed to upload profile photo",
            variant: "destructive",
          });
          return; // Stop if image upload fails
        } finally {
          setIsUploadingAvatar(false);
        }
      }

      // Update profile with user ID
      await updateProfile({
        id: user?.id,
        data: {
          ...profileForm,
          avatar: avatarUrl, // Include the avatar URL (existing or new)
        },
      }).unwrap();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      signOut();
      router.push("/");
      toast({
        description: "Please Login again to see the changes",
      });
      // Clear the photo state after successful update
      setProfilePhoto(null);

      // Refetch profile if refetch function provided
      if (refetchProfile) {
        refetchProfile();
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

  // const handlePasswordFormSubmit = async () => {
  //   // Check if userId is available
  //   if (!user?.id) {
  //     toast({
  //       title: "Error",
  //       description: "User ID not found. Please log in again.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   // Validate passwords
  //   if (passwordForm.newPassword !== passwordForm.confirmPassword) {
  //     toast({
  //       title: "Error",
  //       description: "New passwords do not match",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (passwordForm.newPassword.length < 6) {
  //     toast({
  //       title: "Error",
  //       description: "Password must be at least 6 characters",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     // Change password with user ID
  //     await changePassword({
  //       id: user?.id,
  //       data: {
  //         oldPassword: passwordForm.currentPassword,
  //         newPassword: passwordForm.newPassword,
  //       },
  //     }).unwrap();

  //     toast({
  //       title: "Success",
  //       description: "Password changed successfully",
  //     });

  //     signOut();
  //     router.push("/");
  //     toast({
  //       description: "Please Login again",
  //     });

  //     // Clear form
  //     setPasswordForm({
  //       currentPassword: "",
  //       newPassword: "",
  //       confirmPassword: "",
  //     });
  //   } catch (error: any) {
  //     console.error("Error changing password:", error);
  //     toast({
  //       title: "Error",
  //       description: error?.data?.message || "Failed to change password",
  //       variant: "destructive",
  //     });
  //   }
  // };

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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                className="mt-1"
                value={profileForm.fullName}
                onChange={(e) =>
                  handleProfileFormChange("fullName", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                className="mt-1"
                value={profileForm.email}
                onChange={(e) =>
                  handleProfileFormChange("email", e.target.value)
                }
                type="email"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                className="mt-1"
                value={profileForm.phone}
                onChange={(e) =>
                  handleProfileFormChange("phone", e.target.value)
                }
                type="tel"
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Select
                value={profileForm.district || ""}
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
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                className="mt-1"
                value={profileForm.location}
                onChange={(e) =>
                  handleProfileFormChange("location", e.target.value)
                }
                placeholder="Enter your current location (e.g., Dhanmondi, Dhaka)"
              />
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
                    ) : profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt="Profile"
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
                      className="ml-2"
                      onClick={() => {
                        setProfilePhoto(null);
                        setProfilePhotoPreview(profile.avatar || "");
                      }}
                    >
                      Remove
                    </Button>
                  )}
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

      {/* Password Change Section */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                className="mt-1"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                className="mt-1"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                placeholder="Enter new password"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="mt-1"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handlePasswordFormSubmit}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
