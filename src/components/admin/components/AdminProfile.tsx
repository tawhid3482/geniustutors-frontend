'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext.next';
import { Eye, EyeOff, Save, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChangePasswordMutation, useUpdateAdminProfileMutation } from '@/redux/features/auth/authApi';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export function AdminProfile({ user: propUser }: { user?: any }) {
  const { user: authUser, updateUserProfile } = useAuth();
  const user = propUser || authUser;
  const { toast } = useToast();

  // RTK Query mutations
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateAdminProfile, { isLoading: isUpdatingProfile }] = useUpdateAdminProfileMutation();
  
  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    id: '',
    fullName: '',
    email: '',
    phone: '',
    role: '',
    createdAt: '',
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Combined loading state for initial data loading
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  
  // Load profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (user?.id) {
        try {
          setIsInitialLoading(true);
          const response = await fetch(`/api/users/profile/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          const data = await response.json();
          
          if (data.success && data.data) {
            const profile = data.data;
            setProfileData({
              id: profile.id || '',
              fullName: profile.full_name || '',
              email: profile.email || '',
              phone: profile.phone || '',
              role: profile.role || '',
              createdAt: profile.created_at || '',
            });
          } else if (data.error) {
            console.error('Profile fetch error:', data.error);
            // Fallback to user data from context
            setProfileData({
              id: user.id || '',
              fullName: user.fullName || user.full_name || '',
              email: user.email || '',
              phone: user.phone || '',
              role: user.role || '',
              createdAt: user.createdAt || user.created_at || '',
            });
          } else {
            // Fallback to user data from context
            setProfileData({
              id: user.id || '',
              fullName: user.fullName || user.full_name || '',
              email: user.email || '',
              phone: user.phone || '',
              role: user.role || '',
              createdAt: user.createdAt || user.created_at || '',
            });
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          // Fallback to user data from context
          setProfileData({
            id: user.id || '',
            fullName: user.fullName || user.full_name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || '',
            createdAt: user.createdAt || user.created_at || '',
          });
        } finally {
          setIsInitialLoading(false);
        }
      }
    };
    
    loadProfileData();
  }, [user]);
  
  // Handle profile data update using RTK Query
  const handleProfileUpdate = async () => {
    try {
      // Prepare update data - only include fields that have changed
      const updateData: {
        fullName?: string;
        email?: string;
        phone?: string;
      } = {};
      
      // Get original user data for comparison
      const originalData = {
        fullName: user.fullName || user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
      };
      
      // Only include fields that have actually changed
      if (profileData.fullName !== originalData.fullName) {
        updateData.fullName = profileData.fullName;
      }
      if (profileData.email !== originalData.email) {
        updateData.email = profileData.email;
      }
      if (profileData.phone !== originalData.phone) {
        updateData.phone = profileData.phone;
      }
      
      // If no changes, show message and return
      if (Object.keys(updateData).length === 0) {
        toast({
          title: 'No Changes',
          description: 'No changes were made to your profile.',
        });
        setIsEditing(false);
        return;
      }
      
      console.log(updateData, user.id)

      const result = await updateAdminProfile({
        id: user.id,
        data: updateData
      }).unwrap();
      
      if (result.success) {
        // Update local auth context if available
        if (updateUserProfile) {
          updateUserProfile({
            ...user,
            fullName: profileData.fullName,
            email: profileData.email,
            phone: profileData.phone,
          });
        }
        
        toast({
          title: 'Profile Updated',
          description: 'Your profile has been updated successfully.',
        });
        
        setIsEditing(false);
      } else {
        throw new Error(result.message || result.error || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error?.data?.message || error?.message || 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };
  
  // Handle password change using RTK Query
  const handlePasswordChange = async () => {
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New password and confirmation do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Password Too Short',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Call RTK Query mutation to change password
      const result = await changePassword({
        id: user.id,
        data: {
          oldPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }
      }).unwrap();
      
      if (result.success) {
        toast({
          title: 'Password Changed',
          description: 'Your password has been changed successfully.',
        });
        
        // Reset password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        throw new Error(result.message || result.error || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Password Change Failed',
        description: error?.data?.message || error?.message || 'Failed to change password',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <ScrollArea className="h-full w-full">
      <div className="space-y-6 w-full max-w-4xl mx-auto pb-8">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Profile Management</h2>
            <p className="text-white/90 mt-1">Manage your account information and security</p>
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        
        {/* Profile Information Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                View and update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isInitialLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="h-8 w-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-muted-foreground">Loading profile...</span>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                      <User className="h-12 w-12 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{profileData.fullName}</h3>
                      <p className="text-sm text-muted-foreground">{profileData.role}</p>
                    </div>
                  </div>
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-700 border-green-200"
                    >
                      Edit Profile
                    </Button>
                  )}
                </div>
              )}
              
              {!isInitialLoading && (
                <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-gray-50" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profileData.role}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              )}
            </CardContent>
            {isEditing && (
              <CardFooter className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original values
                    if (user) {
                      setProfileData({
                        id: user.id || '',
                        fullName: user.fullName || user.full_name || '',
                        email: user.email || '',
                        phone: user.phone || '',
                        role: user.role || '',
                        createdAt: user.createdAt || user.created_at || '',
                      });
                    }
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleProfileUpdate}
                  disabled={isUpdatingProfile}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUpdatingProfile ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Save Changes
                    </span>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        {/* Change Password Tab */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="relative">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div className="relative">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Password must be at least 8 characters long</p>
                </div>
                
                <div className="relative">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                className="bg-green-600 hover:bg-green-700 ml-auto"
              >
                {isChangingPassword ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </span>
                ) : (
                  "Change Password"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </ScrollArea>
  );
}