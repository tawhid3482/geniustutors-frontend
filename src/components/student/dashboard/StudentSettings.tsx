import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext.next';
import { useChangePasswordMutation } from '@/redux/features/auth/authApi';
import { Label } from '@radix-ui/react-label';
import { RefreshCw } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const StudentSettings = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [changePassword, { isLoading: isChangingPassword }] =
    useChangePasswordMutation();

  const handlePasswordFormSubmit = async () => {
    // Check if userId is available
    if (!user?.id) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      // Change password with user ID
      await changePassword({
        id: user?.id,
        data: {
          oldPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
      }).unwrap();

      toast.success("Password changed successfully");

      // Sign out and redirect
      signOut();
      router.push("/");
      toast.success("Please login again with your new password");

      // Clear form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      
      // Extract error message from different possible structures
      const errorMessage = 
        error?.data?.message || 
        error?.error || 
        error?.message || 
        "Failed to change password";
      
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      <Card>
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
      </Card>
    </div>
  );
};

export default StudentSettings;