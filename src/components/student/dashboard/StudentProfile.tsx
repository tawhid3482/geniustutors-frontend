"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Camera, CreditCard, RefreshCw } from "lucide-react";
import { ALL_DISTRICTS } from "@/data/bangladeshDistricts";
import { avatarService } from "@/services/avatarService";
import { toast } from "@/components/ui/use-toast";

interface StudentProfileProps {
  profile: any;
  paymentMethods: any[];
  isLoadingPaymentMethods: boolean;
  handleProfileUpdate: (profile: any) => Promise<void>;
  handlePasswordChange: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  handleAddPaymentMethod: (method: any) => Promise<boolean>;
  handleUpdatePaymentMethod: (id: string, method: any) => Promise<boolean>;
  handleDeletePaymentMethod: (id: string) => Promise<boolean>;
  handleSetDefaultPaymentMethod: (id: string) => Promise<boolean>;
}

export function StudentProfile({
  profile,
  paymentMethods,
  isLoadingPaymentMethods,
  handleProfileUpdate,
  handlePasswordChange,
  handleAddPaymentMethod,
  handleUpdatePaymentMethod,
  handleDeletePaymentMethod,
  handleSetDefaultPaymentMethod
}: StudentProfileProps) {
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    district: profile.district,
    location: profile.location,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [paymentForm, setPaymentForm] = useState({
    type: 'bKash' as 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank',
    accountNumber: '',
    accountHolderName: '',
  });

  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Update profile form when profile changes
  useEffect(() => {
    setProfileForm({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      district: profile.district,
      location: profile.location,
    });
  }, [profile]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 2MB",
          variant: "destructive"
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF)",
          variant: "destructive"
        });
        return;
      }

      setProfilePhoto(file);
      setIsUploadingAvatar(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to server
      try {
        const result = await avatarService.uploadAvatar(file);
        
        if (result.success && result.data) {
          toast({
            title: "Success",
            description: "Profile photo uploaded successfully",
          });
          
          // Update the profile with the new avatar URL
          await handleProfileUpdate({
            ...profile,
            ...profileForm,
            avatar: result.data.fileUrl,
          });
        } else {
          toast({
            title: "Upload failed",
            description: result.error || "Failed to upload profile photo",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error uploading avatar:', error);
        toast({
          title: "Upload failed",
          description: "An error occurred while uploading the profile photo",
          variant: "destructive"
        });
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const handleCancelEditPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setPaymentForm({
      type: 'bKash',
      accountNumber: '',
      accountHolderName: '',
    });
  };

  // Profile form handlers
  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileFormSubmit = async () => {
    await handleProfileUpdate({
      ...profile,
      ...profileForm,
      avatar: profile.avatar, // Use the actual avatar URL from profile, not the preview
    });
  };

  const handlePasswordFormSubmit = async () => {
    const success = await handlePasswordChange(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    
    if (success) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handlePaymentFormSubmit = async () => {
    if (editingPaymentMethod) {
      const success = await handleUpdatePaymentMethod(editingPaymentMethod, paymentForm);
      if (success) {
        setEditingPaymentMethod(null);
        setPaymentForm({
          type: 'bKash',
          accountNumber: '',
          accountHolderName: '',
        });
      }
    } else {
      const success = await handleAddPaymentMethod(paymentForm);
      if (success) {
        setPaymentForm({
          type: 'bKash',
          accountNumber: '',
          accountHolderName: '',
        });
      }
    }
  };

  const handleEditPaymentMethod = (method: any) => {
    setEditingPaymentMethod(method.id);
    setPaymentForm({
      type: method.type,
      accountNumber: method.account_number,
      accountHolderName: method.account_holder_name,
    });
  };

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
              <Label>Full Name</Label>
              <Input className="mt-1" value={profileForm.name} onChange={(e) => handleProfileFormChange('name', e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1" value={profileForm.email} onChange={(e) => handleProfileFormChange('email', e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={profileForm.phone} onChange={(e) => handleProfileFormChange('phone', e.target.value)} />
            </div>
            <div>
              <Label>District</Label>
              <Select value={profileForm.district || ''} onValueChange={(v) => handleProfileFormChange('district', v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent>
                  {ALL_DISTRICTS.map(district => (
                    <SelectItem key={district} value={district}>{district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input className="mt-1" value={profileForm.location} onChange={(e) => handleProfileFormChange('location', e.target.value)} placeholder="Enter your current location (e.g., Dhanmondi, Dhaka)" />
            </div>
            <div>
              <Label>Profile Photo</Label>
              <div className="mt-1 flex items-center gap-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden">
                    {profilePhotoPreview ? (
                      <img src={profilePhotoPreview} alt="Profile Preview" className="h-full w-full object-cover" />
                    ) : profile.avatar ? (
                      <img src={profile.avatar} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-green-600 text-white p-1 rounded-full cursor-pointer hover:bg-green-700 transition-colors">
                    <Camera className="h-3 w-3" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={isUploadingAvatar}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload a profile photo to personalize your account
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "Uploading..." : "Choose Photo"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleProfileFormSubmit}>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Section */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" className="mt-1" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))} placeholder="Enter current password" />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" className="mt-1" value={passwordForm.newPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))} placeholder="Enter new password" />
            </div>
            <div className="md:col-span-2">
              <Label>Confirm New Password</Label>
              <Input type="password" className="mt-1" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))} placeholder="Confirm new password" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button className="bg-green-600 hover:bg-green-700" onClick={handlePasswordFormSubmit}>Update Password</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
