import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Shield, Key, Save, Upload, Camera } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { BANGLADESH_DISTRICTS, getAreasByDistrict } from '@/data/bangladeshDistricts';

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  district?: string;
  gender?: string;
  role: string;
  status: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export default function ProfileSection() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableAreas, setAvailableAreas] = useState<string[]>([]);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    location: '',
    district: '',
    gender: '',
    bio: ''
  });
  
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current user from token payload or make an API call
      const userId = JSON.parse(atob(token?.split('.')[1] || '')).userId;
      
      const response = await axios.get(`${API_BASE_URL}/dashboard/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const userData = response.data.data;
        setProfile(userData);
        setProfileForm({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          location: userData.location || '',
          district: userData.district || '',
          gender: userData.gender || '',
          bio: userData.bio || ''
        });

        // Set available areas if district is selected
        if (userData.district) {
          const areas = getAreasByDistrict(userData.district);
          setAvailableAreas(areas);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch profile data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle district change
  const handleDistrictChange = (value: string) => {
    const areas = getAreasByDistrict(value);
    setAvailableAreas(areas);
    setProfileForm(prev => ({ ...prev, district: value, location: '' }));
  };

  // Handle location change
  const handleLocationChange = (value: string) => {
    setProfileForm(prev => ({ ...prev, location: value }));
  };

  // Handle gender change
  const handleGenderChange = (value: string) => {
    setProfileForm(prev => ({ ...prev, gender: value }));
  };

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Update profile
  const updateProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const userId = JSON.parse(atob(token?.split('.')[1] || '')).userId;

      const response = await axios.put(`${API_BASE_URL}/dashboard/users/${userId}/profile`, {
        ...profileForm
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
        fetchProfile(); // Refresh profile data
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`${API_BASE_URL}/auth/change-password`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Password changed successfully',
        });
        setPasswordForm({
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: 'Failed to change password. Please check your current password.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm sm:text-base">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* Profile Overview Card */}
      {profile && (
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Profile Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="text-base sm:text-lg">
                    {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0"
                  title="Upload new avatar"
                >
                  <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold">{profile.full_name}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground">{profile.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                  <Badge variant="outline" className="capitalize text-xs">
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.role.replace('_', ' ')}
                  </Badge>
                  <Badge 
                    variant={profile.status === 'active' ? 'default' : 'secondary'}
                    className="capitalize text-xs"
                  >
                    {profile.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 w-full">
        {/* Personal Information */}
        <Card className="w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              Personal Information
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Update your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="full_name" className="text-xs sm:text-sm">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={profileForm.full_name}
                  onChange={handleProfileChange}
                  placeholder="Enter your full name"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                  className="text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="district" className="text-xs sm:text-sm">District</Label>
                <Select value={profileForm.district} onValueChange={handleDistrictChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {BANGLADESH_DISTRICTS.map((district) => (
                      <SelectItem key={district.id} value={district.name}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location" className="text-xs sm:text-sm">Location/Area</Label>
                <Select 
                  value={profileForm.location} 
                  onValueChange={handleLocationChange}
                  disabled={!profileForm.district}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAreas.map((area, index) => (
                      <SelectItem key={index} value={area}>
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="gender" className="text-xs sm:text-sm">Gender</Label>
              <Select value={profileForm.gender} onValueChange={handleGenderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                placeholder="Tell us about yourself..."
                rows={3}
                className="text-sm"
              />
            </div>

            <Button onClick={updateProfile} disabled={saving} className="w-full">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>
              Update your account password for better security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="current_password">Current Password</Label>
              <Input
                id="current_password"
                name="current_password"
                type="password"
                value={passwordForm.current_password}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <Label htmlFor="new_password">New Password</Label>
              <Input
                id="new_password"
                name="new_password"
                type="password"
                value={passwordForm.new_password}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div>
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
              />
            </div>

            <Button 
              onClick={changePassword} 
              disabled={saving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              {saving ? 'Changing...' : 'Change Password'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Information
          </CardTitle>
          <CardDescription>
            Read-only account details and system information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {profile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">User ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{profile.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Last Updated</p>
                  <p className="text-sm text-muted-foreground">{new Date(profile.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}