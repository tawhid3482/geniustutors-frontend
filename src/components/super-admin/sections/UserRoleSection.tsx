import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSuperAdminDashboard } from '@/hooks/useSuperAdminDashboard';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, UserPlus, Filter, X, Check, AlertTriangle, Eye } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';


// Define interfaces for user data
interface User {
  id: string;
  email: string;
  full_name?: string;  // Keep for backwards compatibility
  name?: string;       // API returns this field
  role: 'super_admin' | 'admin' | 'manager' | 'tutor' | 'student';
  status: 'active' | 'suspended' | 'pending';
  created_at: string;
  phone?: string;
  location?: string;
  district?: string;
  avatar_url?: string;
  bio?: string;
  rating?: number;
  total_reviews?: number;
}

export default function UserRoleSection() {
  // State for users data
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for filtering and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // State for user management
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserDetails, setSelectedUserDetails] = useState<any | null>(null);
  
  // New user form state
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    gender: 'male'
  });


  
  // Edit user form state
  const [editUser, setEditUser] = useState({
    full_name: '',
    email: '',
    role: '',
    status: '',
    phone: '',
    location: '',
    district: '',
    gender: '',
    bio: '',
    education: '',
    experience: '',
    subjects: '',
    hourly_rate: '',
    premium: 'no'
  });
  
  // Fetch users from the backend
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dashboard/users?page=${page}&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalUsers(response.data.data.pagination.total);
        setCurrentPage(page);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Fetch detailed user information
  const fetchUserDetails = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dashboard/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setSelectedUserDetails(response.data.data);
        setShowUserDetailsModal(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch user details',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error fetching user details:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch user details. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Handle input change for new user form
  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle role change for new user
  const handleNewUserRoleChange = (value: string) => {
    setNewUser(prev => ({ ...prev, role: value }));
  };


  
  // Handle input change for edit user form
  const handleEditUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle role change for edit user
  const handleEditUserRoleChange = (value: string) => {
    setEditUser(prev => ({ ...prev, role: value }));
  };
  
  // Handle status change for edit user
  const handleEditUserStatusChange = (value: string) => {
    setEditUser(prev => ({ ...prev, status: value }));
  };

  // Handle gender change for edit user
  const handleEditUserGenderChange = (value: string) => {
    setEditUser(prev => ({ ...prev, gender: value }));
  };

  // Handle premium change for edit user
  const handleEditUserPremiumChange = (value: string) => {
    setEditUser(prev => ({ ...prev, premium: value }));
  };

  // Handle textarea change for edit user
  const handleEditUserTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };
  
  // Create new user
  const handleCreateUser = async () => {
    // Enhanced validation
    if (!newUser.full_name || !newUser.email || !newUser.password || !newUser.role || !newUser.phone || !newUser.gender) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name, Email, Password, Role, Phone, and Gender)',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Use different endpoints based on role
      let endpoint = `${API_BASE_URL}/auth/register`;
      if (['admin', 'super_admin', 'manager'].includes(newUser.role)) {
        endpoint = `${API_BASE_URL}/auth/admin/register`;
      }
      
      
      
      const response = await axios.post(endpoint, newUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Created new ${newUser.role}: ${newUser.full_name}`,
        });
        
        // Reset form and close modal
        setNewUser({
          full_name: '',
          email: '',
          password: '',
          role: 'student',
          phone: '',
          gender: 'male'
        });
        setShowAddUserModal(false);
        
        // Refresh user list
        fetchUsers(1);
      } else {
        toast({
          title: 'Error',
          description: response.data.error || 'Failed to create user',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create user',
        variant: 'destructive'
      });
    }
  };
  
  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/dashboard/users/${selectedUser.id}`, editUser, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Updated user: ${editUser.full_name}`,
        });
        
        // Close modal and refresh user list
        setShowEditUserModal(false);
        fetchUsers(1);
      } else {
        toast({
          title: 'Error',
          description: response.data.error || 'Failed to update user',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update user',
        variant: 'destructive'
      });
    }
  };
  
  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/dashboard/users/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        toast({
          title: 'Success',
          description: `Deleted user: ${selectedUser.full_name}`,
        });
        
        // Close modal and refresh user list
        setShowDeleteConfirmModal(false);
        fetchUsers(1);
      } else {
        toast({
          title: 'Error',
          description: response.data.error || 'Failed to delete user',
          variant: 'destructive'
        });
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };
  
  // Open edit user modal (fetch detailed user data first)
  const openEditUserModal = async (user: User) => {
    setSelectedUser(user);
    
    // Fetch detailed user information for editing
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/dashboard/users/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        const userData = response.data.data;
        setEditUser({
          full_name: userData.full_name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          phone: userData.phone || '',
          location: userData.location || '',
          district: userData.district || '',
          gender: userData.gender || '',
          bio: userData.bio || '',
          education: userData.education || '',
          experience: userData.experience || '',
          subjects: userData.subjects || '',
          hourly_rate: userData.hourly_rate ? userData.hourly_rate.toString() : '',
          premium: userData.premium || 'no'
        });
        setShowEditUserModal(true);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch user details for editing',
          variant: 'destructive'
        });
      }
    } catch (err) {
      console.error('Error fetching user details for edit:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch user details for editing. Please try again.',
        variant: 'destructive'
      });
    }
  };
  
  // Open delete confirmation modal
  const openDeleteConfirmModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteConfirmModal(true);
  };
  
  // Filter users based on search term, role, and status
  const filteredUsers = users.filter(user => {
    const userName = user.full_name || user.name || '';
    const matchesSearch = 
      (userName && userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });
  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">User & Role Management</h2>
        <p className="text-muted-foreground">
          Manage all users, change their roles, and control access to the platform.
        </p>
      </div>
      
      {/* Actions and Filters */}
      <Card className="border-border shadow-sm w-full">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Role Filter */}
              <div className="w-full md:w-40">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status Filter */}
              <div className="w-full md:w-40">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Add User Button */}
            <Button onClick={() => setShowAddUserModal(true)} className="whitespace-nowrap">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Users Table */}
      <Card className="border-border shadow-sm w-full">
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found (Page {currentPage} of {totalPages}, Total: {totalUsers})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : error ? (
            <div className="text-center py-4 text-red-500">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-4">No users found matching your filters</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name || user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {user.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.status === 'active' ? 'success' : 
                                user.status === 'pending' ? 'warning' : 'destructive'}
                        className="capitalize"
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => fetchUserDetails(user.id)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditUserModal(user)}
                          title="Edit User"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => openDeleteConfirmModal(user)}
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Add New User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Create a new user account with the appropriate role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:gap-4 py-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="full_name" className="text-xs sm:text-sm">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={newUser.full_name}
                  onChange={handleNewUserInputChange}
                  placeholder="Enter full name"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserInputChange}
                  placeholder="Enter email address"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleNewUserInputChange}
                  placeholder="Enter password"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-xs sm:text-sm">Role</Label>
                <Select value={newUser.role} onValueChange={handleNewUserRoleChange}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">Phone <span className="text-red-500">*</span></Label>
                <Input
                  id="phone"
                  name="phone"
                  value={newUser.phone}
                  onChange={handleNewUserInputChange}
                  placeholder="Enter phone number"
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-xs sm:text-sm">Gender</Label>
                <Select value={newUser.gender} onValueChange={(value) => setNewUser(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowAddUserModal(false)} className="w-full sm:w-auto text-sm">Cancel</Button>
            <Button onClick={handleCreateUser} className="w-full sm:w-auto text-sm">Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit User</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Update user details, permissions, and profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="edit_full_name" className="text-xs sm:text-sm">Full Name</Label>
                    <Input
                      id="edit_full_name"
                      name="full_name"
                      value={editUser.full_name}
                      onChange={handleEditUserInputChange}
                      placeholder="Enter full name"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_email" className="text-xs sm:text-sm">Email</Label>
                    <Input
                      id="edit_email"
                      name="email"
                      type="email"
                      value={editUser.email}
                      onChange={handleEditUserInputChange}
                      placeholder="Enter email address"
                      className="text-sm bg-gray-50"
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_phone" className="text-xs sm:text-sm">Phone</Label>
                    <Input
                      id="edit_phone"
                      name="phone"
                      value={editUser.phone}
                      onChange={handleEditUserInputChange}
                      placeholder="Enter phone number"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_gender" className="text-xs sm:text-sm">Gender</Label>
                    <Select value={editUser.gender} onValueChange={handleEditUserGenderChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role & Status */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Role & Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="edit_role" className="text-xs sm:text-sm">Role</Label>
                    <Select value={editUser.role} onValueChange={handleEditUserRoleChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="tutor">Tutor</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_status" className="text-xs sm:text-sm">Status</Label>
                    <Select value={editUser.status} onValueChange={handleEditUserStatusChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit_premium" className="text-xs sm:text-sm">Premium Status</Label>
                    <Select value={editUser.premium} onValueChange={handleEditUserPremiumChange}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select premium status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Premium</SelectItem>
                        <SelectItem value="no">Regular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Location Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="edit_district" className="text-xs sm:text-sm">District</Label>
                    <Input
                      id="edit_district"
                      name="district"
                      value={editUser.district}
                      onChange={handleEditUserInputChange}
                      placeholder="Enter district"
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_location" className="text-xs sm:text-sm">Location</Label>
                    <Input
                      id="edit_location"
                      name="location"
                      value={editUser.location}
                      onChange={handleEditUserInputChange}
                      placeholder="Enter location"
                      className="text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Profile Information */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="edit_bio" className="text-xs sm:text-sm">Bio</Label>
                  <Textarea
                    id="edit_bio"
                    name="bio"
                    value={editUser.bio}
                    onChange={handleEditUserTextareaChange}
                    placeholder="Enter bio/description"
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_education" className="text-xs sm:text-sm">Education</Label>
                  <Textarea
                    id="edit_education"
                    name="education"
                    value={editUser.education}
                    onChange={handleEditUserTextareaChange}
                    placeholder="Enter education background"
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_experience" className="text-xs sm:text-sm">Experience</Label>
                  <Textarea
                    id="edit_experience"
                    name="experience"
                    value={editUser.experience}
                    onChange={handleEditUserTextareaChange}
                    placeholder="Enter experience details"
                    rows={3}
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="edit_subjects" className="text-xs sm:text-sm">Subjects</Label>
                    <Textarea
                      id="edit_subjects"
                      name="subjects"
                      value={editUser.subjects}
                      onChange={handleEditUserTextareaChange}
                      placeholder="Enter subjects (comma-separated)"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit_hourly_rate" className="text-xs sm:text-sm">Hourly Rate (৳)</Label>
                    <Input
                      id="edit_hourly_rate"
                      name="hourly_rate"
                      type="number"
                      value={editUser.hourly_rate}
                      onChange={handleEditUserInputChange}
                      placeholder="Enter hourly rate"
                      className="text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowEditUserModal(false)} className="w-full sm:w-auto text-sm">Cancel</Button>
            <Button onClick={handleUpdateUser} className="w-full sm:w-auto text-sm bg-green-600 hover:bg-green-700">
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedUser && (
              <div className="flex items-center p-4 border rounded-md bg-red-50">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <div>
                  <p className="font-medium">{selectedUser.full_name || selectedUser.name || 'N/A'}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} className="text-sm">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="text-sm">Delete User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Details Modal */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected user
            </DialogDescription>
          </DialogHeader>
          {selectedUserDetails && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-sm font-medium">{selectedUserDetails.full_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm">{selectedUserDetails.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                      <p className="text-sm">{selectedUserDetails.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                      <Badge variant="outline" className="capitalize">
                        {selectedUserDetails.role.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                      <Badge 
                        variant={selectedUserDetails.status === 'active' ? 'default' : 
                                selectedUserDetails.status === 'pending' ? 'secondary' : 'destructive'}
                        className="capitalize"
                      >
                        {selectedUserDetails.status}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                      <p className="text-sm capitalize">{selectedUserDetails.gender || 'Not specified'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">District</Label>
                      <p className="text-sm">{selectedUserDetails.district || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <p className="text-sm">{selectedUserDetails.location || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                      <p className="text-sm">{new Date(selectedUserDetails.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                      <p className="text-sm">{new Date(selectedUserDetails.updated_at).toLocaleString()}</p>
                    </div>
                    {selectedUserDetails.tutor_id && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tutor ID</Label>
                        <p className="text-sm font-mono">{selectedUserDetails.tutor_id}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Profile Information */}
              {(selectedUserDetails.bio || selectedUserDetails.education || selectedUserDetails.experience) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedUserDetails.bio && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Bio</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedUserDetails.bio}</p>
                      </div>
                    )}
                    {selectedUserDetails.education && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Education</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedUserDetails.education}</p>
                      </div>
                    )}
                    {selectedUserDetails.experience && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Experience</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedUserDetails.experience}</p>
                      </div>
                    )}
                    {selectedUserDetails.subjects && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Subjects</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedUserDetails.subjects}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedUserDetails.hourly_rate && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Hourly Rate</Label>
                          <p className="text-sm font-medium">৳{selectedUserDetails.hourly_rate}</p>
                        </div>
                      )}
                      {selectedUserDetails.rating !== null && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                          <p className="text-sm font-medium">{selectedUserDetails.rating}/5.00</p>
                        </div>
                      )}
                      {selectedUserDetails.total_reviews !== null && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Total Reviews</Label>
                          <p className="text-sm font-medium">{selectedUserDetails.total_reviews}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Premium Status</Label>
                      <Badge 
                        variant={selectedUserDetails.premium === 'yes' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {selectedUserDetails.premium === 'yes' ? 'Premium' : 'Regular'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tutor Details */}
              {selectedUserDetails.tutorDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tutor Specific Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Qualification</Label>
                        <p className="text-sm">{selectedUserDetails.tutorDetails.qualification || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Expected Salary</Label>
                        <p className="text-sm">৳{selectedUserDetails.tutorDetails.expected_salary || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Availability</Label>
                        <Badge variant="outline" className="capitalize">
                          {selectedUserDetails.tutorDetails.availability_status || 'Not specified'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Days per Week</Label>
                        <p className="text-sm">{selectedUserDetails.tutorDetails.days_per_week || 'Not specified'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Tutoring Experience</Label>
                        <p className="text-sm">{selectedUserDetails.tutorDetails.tutoring_experience || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Alternative Phone</Label>
                        <p className="text-sm">{selectedUserDetails.tutorDetails.alternative_phone || 'Not provided'}</p>
                      </div>
                    </div>
                    
                    {selectedUserDetails.tutorDetails.university_name && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-blue-50 rounded-md">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">University</Label>
                          <p className="text-sm font-medium">{selectedUserDetails.tutorDetails.university_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                          <p className="text-sm">{selectedUserDetails.tutorDetails.department_name || 'Not specified'}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Year</Label>
                          <p className="text-sm">{selectedUserDetails.tutorDetails.university_year || 'Not specified'}</p>
                        </div>
                      </div>
                    )}
                    
                    {(selectedUserDetails.tutorDetails.preferred_tutoring_style || 
                      selectedUserDetails.tutorDetails.preferred_medium || 
                      selectedUserDetails.tutorDetails.preferred_time) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {selectedUserDetails.tutorDetails.preferred_tutoring_style && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Preferred Style</Label>
                            <p className="text-sm">{selectedUserDetails.tutorDetails.preferred_tutoring_style}</p>
                          </div>
                        )}
                        {selectedUserDetails.tutorDetails.preferred_medium && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Preferred Medium</Label>
                            <p className="text-sm capitalize">{selectedUserDetails.tutorDetails.preferred_medium}</p>
                          </div>
                        )}
                        {selectedUserDetails.tutorDetails.preferred_time && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Preferred Time</Label>
                            <p className="text-sm capitalize">{selectedUserDetails.tutorDetails.preferred_time}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailsModal(false)} className="text-sm">Close</Button>
            {selectedUserDetails && (
              <Button onClick={() => {
                setShowUserDetailsModal(false);
                const user = users.find(u => u.id === selectedUserDetails.id);
                if (user) openEditUserModal(user);
              }} className="text-sm">
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
