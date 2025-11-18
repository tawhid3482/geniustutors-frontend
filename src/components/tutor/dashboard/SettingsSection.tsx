'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.next';
import { useToast } from '@/components/ui/use-toast';
import { Settings, Eye, EyeOff, Lock, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SettingsSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = 'New password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not found. Please log in again.',
        variant: 'destructive'
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      toast({
        title: 'Success',
        description: 'Password changed successfully',
        variant: 'default'
      });

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});

    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-4">
      <Card className="bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl font-semibold text-gray-800">Account Settings</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Change Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Enter current password"
                    className={errors.currentPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.currentPassword && (
                  <p className="text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                    className={errors.newPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handlePasswordChange}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing Password...
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Password Requirements</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Password must be at least 6 characters long</li>
              <li>• Use a combination of letters, numbers, and symbols for better security</li>
              <li>• Avoid using personal information in your password</li>
              <li>• Don't reuse passwords from other accounts</li>
            </ul>
          </div>

          {/* Account Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">User ID</Label>
                <p className="text-sm text-gray-900">{user?.id}</p>
              </div>
              {user?.tutor_id && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Tutor ID</Label>
                  <p className="text-sm text-gray-900">{user.tutor_id}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium text-gray-600">Email</Label>
                <p className="text-sm text-gray-900">{user?.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Phone</Label>
                <p className="text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Role</Label>
                <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : user?.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.status}
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
