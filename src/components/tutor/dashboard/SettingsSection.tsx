"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext.next";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useChangePasswordMutation } from "@/redux/features/auth/authApi";
import { useCreateNotificationMutation } from "@/redux/features/notification/notificationApi";

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsSection = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // RTK Query mutation
  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const [createNotification, { isLoading: isCreatingNotification }] = 
    useCreateNotificationMutation();

  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof PasswordChangeData,
    value: string
  ) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters long";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    // Check if userId is available
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User ID not found. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      // Call the RTK Query mutation
      const response = await changePassword({
        id: user.id,
        data: {
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
      }).unwrap();

      if (response.success) {
        // Create notification for successful password change
        try {
          await createNotification({
            title: "Password Changed",
            message: "Your password has been successfully updated.",
            type: "success",
            readStatus: false,
            userId: user.id,
          }).unwrap();
        } catch (notificationError) {
          console.warn("Failed to create notification:", notificationError);
          // Don't show error toast for notification failure, just log it
          // The password change was successful, that's the main thing
        }

        toast({
          title: "Success",
          description: response.message || "Password changed successfully",
          variant: "default",
        });

        // Clear form
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Clear errors
        setErrors({});

        // Sign out and redirect to login page
        setTimeout(() => {
          signOut();
          router.push("/auth/signin");
          toast({
            title: "Please Login Again",
            description:
              "For security reasons, please login with your new password.",
            variant: "default",
          });
        }, 2000);
      } else {
        // Handle API error response
        toast({
          title: "Error",
          description: response.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error changing password:", error);

      // Handle different error formats
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to change password. Please check your current password and try again.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle Enter key press in form
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordChange();
    }
  };

  const isLoading = isChangingPassword || isCreatingNotification;

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4 md:p-6">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl font-semibold text-gray-800">
              Account Settings
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6" onKeyPress={handleKeyPress}>
          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Change Password
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="currentPassword"
                  className="text-sm font-medium"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    placeholder="Enter current password"
                    className={`pr-10 ${
                      errors.currentPassword
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("current")}
                    disabled={isLoading}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">
                    {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    placeholder="Enter new password"
                    className={`pr-10 ${
                      errors.newPassword
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("new")}
                    disabled={isLoading}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Confirm new password"
                    className={`pr-10 ${
                      errors.confirmPassword
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility("confirm")}
                    disabled={isLoading}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handlePasswordChange}
                disabled={
                  isLoading ||
                  !passwordData.currentPassword ||
                  !passwordData.newPassword ||
                  !passwordData.confirmPassword
                }
                className="bg-green-600 hover:bg-green-700 min-w-[180px]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isCreatingNotification ? "Creating Notification..." : "Changing Password..."}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Security Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-5">
            <h4 className="font-medium text-blue-900 mb-2">
              Password Requirements
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Password must be at least 6 characters long</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  Use a combination of letters, numbers, and symbols for better
                  security
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Avoid using personal information in your password</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Don't reuse passwords from other accounts</span>
              </li>
            </ul>
          </div>

          {/* Account Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">
                  User ID
                </Label>
                <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded">
                  {user?.id || "N/A"}
                </p>
              </div>
              {user?.tutor_id && (
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-600">
                    Tutor ID
                  </Label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-100 px-3 py-1 rounded">
                    {user.tutor_id}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">
                  Email
                </Label>
                <p className="text-sm text-gray-900">
                  {user?.email || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">
                  Phone
                </Label>
                <p className="text-sm text-gray-900">
                  {user?.phone || "Not provided"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">
                  Role
                </Label>
                <p className="text-sm text-gray-900 capitalize">
                  {user?.role || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-600">
                  Status
                </Label>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.status === "active"
                      ? "bg-green-100 text-green-800"
                      : user?.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.status || "unknown"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsSection;