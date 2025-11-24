'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  Search, 
  UserPlus, 
  Shield, 
  Save, 
  RefreshCw,
  Users,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '@/config/api';
import { storeUserPermissions } from '@/utils/auth';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  primary_role?: string; // From role-management endpoint
  status: string;
  created_at: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
}

interface UserPermissions {
  userId: string;
  permissions: string[];
}

export default function PermissionAssignment() {
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userPermissions, setUserPermissions] = useState<UserPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Admin dashboard specific permissions - only show these in permission assignment
  const adminDashboardPermissions = [
    'Dashboard Overview',
    'Tuition Requests',
    'Reviews',
    'User Management',
    'Permission Assignment',
    'Upgrade Applications',
    'Package Management',
    'Tutor Applications',
    'Demo Classes',
    'Course Management',
    'History',
    'Notice Board',
    'Payment Management',
    'SEO & Analytics',
    'Taxonomy',
    'Featured Media',
    'Video Testimonials',
    'Testimonials'
  ];

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('Starting to fetch data...');
      console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api');
      
      // Debug authentication
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        console.log('Auth token:', token ? `${token.substring(0, 20)}...` : 'No token found');
      }

      // Try to fetch users first - only managers and admins (no students)
      let usersData = [];
      try {
        const usersResponse = await api.get('/role-management/users');
        console.log('Users response:', usersResponse);
        usersData = Array.isArray(usersResponse) ? usersResponse : (usersResponse.data || []);
        
        // Filter to only include manager role users (exclude admins and students)
        usersData = usersData.filter((user: User) => 
          user.role === 'manager' || user.primary_role === 'manager'
        );
        
        console.log('Processed manager users:', usersData);
      } catch (error: any) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Warning',
          description: 'Failed to fetch users, but continuing with permissions',
          variant: 'destructive'
        });
      }

      // Try to fetch permissions
      let permissionsData = [];
      try {
        const permissionsResponse = await api.get('/role-management/permissions');
        console.log('Permissions response:', permissionsResponse);
        permissionsData = Array.isArray(permissionsResponse) ? permissionsResponse : (permissionsResponse.data || []);
        console.log('Processed permissions:', permissionsData);
      } catch (error: any) {
        console.error('Error fetching permissions:', error);
        
        let errorMessage = 'Failed to fetch permissions';
        if (error.response?.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view role management.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }

      setUsers(usersData);
      
      // Filter permissions to only show admin dashboard related permissions
      const filteredPermissions = permissionsData.filter((permission: Permission) => 
        adminDashboardPermissions.includes(permission.name)
      );
      setPermissions(filteredPermissions);

      // Fetch current permissions for each user
      const userPermsData = await Promise.all(
        usersData.map(async (user: User) => {
          try {
            const response = await api.get(`/role-management/users/${user.id}/permissions`);
            console.log(`Permissions for user ${user.id}:`, response);
            let permissions = response.permissions || response.data?.permissions || [];
            
            // Ensure Dashboard Overview permission is always included
            if (!permissions.includes('Dashboard Overview')) {
              permissions = [...permissions, 'Dashboard Overview'];
            }
            
            // Ensure Permission Assignment permission is always removed (sensitive)
            permissions = permissions.filter((permission: string) => permission !== 'Permission Assignment');
            
            return {
              userId: user.id,
              permissions: permissions
            };
          } catch (error: any) {
            console.error(`Error fetching permissions for user ${user.id}:`, error);
            
            if (error.response?.status === 403) {
              console.error(`Access denied for user ${user.id}: You do not have permission to view role management.`);
            } else if (error.response?.status === 401) {
              console.error(`Authentication required for user ${user.id}: Please log in again.`);
            }
            
            // Even if there's an error, ensure Dashboard Overview is included and Permission Assignment is excluded
            return {
              userId: user.id,
              permissions: ['Dashboard Overview']
            };
          }
        })
      );

      setUserPermissions(userPermsData);

      // Store filtered permissions in localStorage for frontend permission checking
      const permissionsMap = filteredPermissions.reduce((acc: any, permission: Permission) => {
        acc[permission.name] = true;
        return acc;
      }, {});
      storeUserPermissions(permissionsMap);

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term - only managers
  const filteredUsers = users.filter(user =>
    (user.role === 'manager' || user.primary_role === 'manager') && (
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );



  // Get user's current permissions
  const getUserPermissions = (userId: string): string[] => {
    const userPerms = userPermissions.find(up => up.userId === userId);
    return userPerms ? userPerms.permissions : [];
  };

  // Update user permissions
  const updateUserPermissions = (userId: string, permissionName: string, checked: boolean) => {
    // Prevent unchecking Dashboard Overview permission
    if (permissionName === 'Dashboard Overview' && !checked) {
      return;
    }

    // Prevent checking Permission Assignment permission (sensitive)
    if (permissionName === 'Permission Assignment' && checked) {
      return;
    }

    setUserPermissions(prev => {
      const existing = prev.find(up => up.userId === userId);
      if (existing) {
        if (checked && !existing.permissions.includes(permissionName)) {
          existing.permissions.push(permissionName);
        } else if (!checked && existing.permissions.includes(permissionName)) {
          existing.permissions = existing.permissions.filter(p => p !== permissionName);
        }
        return [...prev];
      } else {
        return [...prev, { userId, permissions: checked ? [permissionName] : [] }];
      }
    });
  };

  // Select all permissions for a user
  const selectAllPermissions = (userId: string) => {
    const availablePermissions = permissions
      .filter(permission => permission.name !== 'Permission Assignment') // Exclude sensitive permission
      .map(permission => permission.name);
    
    setUserPermissions(prev => {
      const existing = prev.find(up => up.userId === userId);
      if (existing) {
        existing.permissions = [...availablePermissions];
        return [...prev];
      } else {
        return [...prev, { userId, permissions: availablePermissions }];
      }
    });
  };

  // Unselect all permissions for a user (except Dashboard Overview)
  const unselectAllPermissions = (userId: string) => {
    setUserPermissions(prev => {
      const existing = prev.find(up => up.userId === userId);
      if (existing) {
        // Keep only Dashboard Overview permission
        existing.permissions = ['Dashboard Overview'];
        return [...prev];
      } else {
        return [...prev, { userId, permissions: ['Dashboard Overview'] }];
      }
    });
  };

  // Check if all permissions are selected for a user
  const areAllPermissionsSelected = (userId: string): boolean => {
    const userPerms = getUserPermissions(userId);
    const availablePermissions = permissions
      .filter(permission => permission.name !== 'Permission Assignment')
      .map(permission => permission.name);
    
    return availablePermissions.every(permission => userPerms.includes(permission));
  };

  // Check if no permissions are selected for a user (except Dashboard Overview)
  const areNoPermissionsSelected = (userId: string): boolean => {
    const userPerms = getUserPermissions(userId);
    return userPerms.length === 1 && userPerms.includes('Dashboard Overview');
  };

  // Save permissions for a user
  const saveUserPermissions = async (userId: string) => {
    try {
      setSaving(true);
      let userPerms = getUserPermissions(userId);
      
      // Ensure Dashboard Overview permission is always included
      if (!userPerms.includes('Dashboard Overview')) {
        userPerms = [...userPerms, 'Dashboard Overview'];
      }
      
      // Ensure Permission Assignment permission is always removed (sensitive)
      userPerms = userPerms.filter((permission: string) => permission !== 'Permission Assignment');
      
      await api.put(`/role-management/users/${userId}/permissions`, {
        permissions: userPerms
      });

      toast({
        title: 'Success',
        description: 'Permissions updated successfully',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      
      let errorMessage = 'Failed to save permissions';
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to edit role management.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Save all permissions
  const saveAllPermissions = async () => {
    try {
      setSaving(true);
      
      await Promise.all(
        userPermissions.map(async (userPerm) => {
          let permissions = [...userPerm.permissions];
          
          // Ensure Dashboard Overview permission is always included
          if (!permissions.includes('Dashboard Overview')) {
            permissions = [...permissions, 'Dashboard Overview'];
          }
          
          // Ensure Permission Assignment permission is always removed (sensitive)
          permissions = permissions.filter((permission: string) => permission !== 'Permission Assignment');
          
          await api.put(`/role-management/users/${userPerm.userId}/permissions`, {
            permissions: permissions
          });
        })
      );

      toast({
        title: 'Success',
        description: 'All permissions updated successfully',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error saving all permissions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save permissions',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permission Assignment</h2>
          <p className="text-gray-600">Manage permissions for manager accounts</p>
        </div>
        <Button onClick={saveAllPermissions} disabled={saving}>
          <Save className="w-4 w-4 mr-2" />
          Save All Changes
        </Button>
              </div>



      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 w-5" />
            Manager Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status}
                      </Badge>
                      <Badge variant="outline">{user.primary_role || user.role}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                  >
                    {selectedUser === user.id ? 'Hide Permissions' : 'Manage Permissions'}
                  </Button>
                </div>

                                  {selectedUser === user.id && (
                    <div className="border-t pt-4">
                      {permissions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="w-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No permissions available</p>
                          <p className="text-sm">Please check if permissions are properly configured</p>
                        </div>
                      ) : (
                                                 <div className="space-y-6">
                           <div className="border-b pb-4">
                             <div className="flex items-center justify-between">
                               <div>
                                 <h3 className="text-lg font-semibold text-gray-900">Admin Dashboard Permissions</h3>
                                 <p className="text-sm text-gray-600">Select admin dashboard permissions to assign to this manager</p>
                               </div>
                               <div className="flex gap-2">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => selectAllPermissions(user.id)}
                                   disabled={areAllPermissionsSelected(user.id)}
                                   className="text-xs"
                                 >
                                   <CheckCircle2 className="w-3 h-3 mr-1" />
                                   Select All
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => unselectAllPermissions(user.id)}
                                   disabled={areNoPermissionsSelected(user.id)}
                                   className="text-xs"
                                 >
                                   <AlertCircle className="w-3 h-3 mr-1" />
                                   Unselect All
                                 </Button>
                               </div>
                             </div>
                             
                             {/* Status indicators */}
                             <div className="mt-3 flex items-center gap-4">
                               {areAllPermissionsSelected(user.id) && (
                                 <div className="flex items-center gap-1 text-green-600 text-sm">
                                   <CheckCircle2 className="w-4 h-4" />
                                   <span>All permissions selected</span>
                                 </div>
                               )}
                               {areNoPermissionsSelected(user.id) && (
                                 <div className="flex items-center gap-1 text-orange-600 text-sm">
                                   <AlertCircle className="w-4 h-4" />
                                   <span>Only required permissions selected</span>
                                 </div>
                               )}
                               {!areAllPermissionsSelected(user.id) && !areNoPermissionsSelected(user.id) && (
                                 <div className="flex items-center gap-1 text-blue-600 text-sm">
                                   <Shield className="w-4 h-4" />
                                   <span>Partial permissions selected</span>
                                 </div>
                               )}
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {permissions.map((permission) => {
                               const isDashboardOverview = permission.name === 'Dashboard Overview';
                               const isPermissionAssignment = permission.name === 'Permission Assignment';
                               const isChecked = getUserPermissions(user.id).includes(permission.name) || isDashboardOverview;
                               const isDisabled = isDashboardOverview || isPermissionAssignment;
                               
                               return (
                                 <div key={permission.id} className={`flex items-center space-x-3 p-3 border rounded-lg ${
                                   isDashboardOverview ? 'bg-blue-50 border-blue-200' : 
                                   isPermissionAssignment ? 'bg-red-50 border-red-200' : 
                                   'hover:bg-gray-50'
                                 }`}>
                                   <Checkbox
                                     id={`${user.id}-${permission.id}`}
                                     checked={isChecked && !isPermissionAssignment}
                                     disabled={isDisabled}
                                     onCheckedChange={(checked) =>
                                       updateUserPermissions(user.id, permission.name, checked as boolean)
                                     }
                                   />
                                   <div className="flex-1 min-w-0">
                                     <Label
                                       htmlFor={`${user.id}-${permission.id}`}
                                       className={`text-sm font-medium cursor-pointer block ${
                                         isDashboardOverview ? 'text-blue-900' : 
                                         isPermissionAssignment ? 'text-red-900' : 
                                         'text-gray-900'
                                       }`}
                                     >
                                       {permission.name}
                                       {isDashboardOverview && (
                                         <span className="ml-2 text-xs text-blue-600 font-normal">(Required)</span>
                                       )}
                                       {isPermissionAssignment && (
                                         <span className="ml-2 text-xs text-red-600 font-normal">(Restricted)</span>
                                       )}
                                     </Label>
                                     <p className="text-xs text-gray-500 mt-1">
                                       {permission.description}
                                     </p>
                                     <div className="flex items-center gap-2 mt-1">
                                       <Badge variant="outline" className="text-xs">
                                         {permission.module}
                                       </Badge>
                                       <Badge variant="secondary" className="text-xs">
                                         {permission.action}
                                       </Badge>
                                       {isDashboardOverview && (
                                         <Badge variant="default" className="text-xs bg-blue-100 text-blue-800">
                                           Always Enabled
                                         </Badge>
                                       )}
                                       {isPermissionAssignment && (
                                         <Badge variant="destructive" className="text-xs bg-red-100 text-red-800">
                                           Sensitive
                                         </Badge>
                                       )}
                                     </div>
                                   </div>
                                 </div>
                               );
                             })}
                           </div>
                         </div>
                      )}

                      <div className="flex justify-end mt-4 pt-4 border-t">
                      <Button
                        onClick={() => saveUserPermissions(user.id)}
                        disabled={saving}
                        size="sm"
                      >
                        <Save className="w-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No manager users found</p>
              <p className="text-sm mt-2">Only manager role users are shown in permission assignment</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

