'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, Search, UserPlus, Filter, CheckCircle, XCircle, AlertCircle, User, Mail, Phone, MapPin, School } from 'lucide-react';
import { userService, User as UserType } from '@/services/userService';
import { useRole } from '@/contexts/RoleContext';

// Using the User type from userService
type UserData = UserType;

export function UserManagementSection() {
  const { canDelete, canSuspend } = useRole();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: '',
    email: '',
    role: 'student',
    phone: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    password: ''
  });
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Fetch users from database
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Use userService to fetch users
      const fetchedUsers = await userService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive'
      });
      
      // Fallback to mock data if API fails (excluding super_admin users)
      const mockUsers: UserData[] = [
        {
          id: '1',
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          phone: '+880 1712345678',
          avatar_url: 'https://ui-avatars.com/api/?name=John+Doe',
          status: 'active',
          email_verified: true,
          created_at: '2023-01-15T10:30:00Z',
          district: 'Dhaka'
        },
        {
          id: '2',
          full_name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'tutor',
          phone: '+880 1812345678',
          avatar_url: 'https://ui-avatars.com/api/?name=Jane+Smith',
          status: 'active',
          email_verified: true,
          created_at: '2023-02-20T14:45:00Z',
          district: 'Chittagong'
        },
        {
          id: '3',
          full_name: 'Ahmed Khan',
          email: 'ahmed@example.com',
          role: 'tutor',
          phone: '+880 1912345678',
          avatar_url: 'https://ui-avatars.com/api/?name=Ahmed+Khan',
          status: 'pending',
          email_verified: false,
          created_at: '2023-03-10T09:15:00Z',
          district: 'Sylhet'
        },
        {
          id: '4',
          full_name: 'Fatima Rahman',
          email: 'fatima@example.com',
          role: 'student',
          phone: '+880 1612345678',
          avatar_url: 'https://ui-avatars.com/api/?name=Fatima+Rahman',
          status: 'suspended',
          email_verified: true,
          created_at: '2023-01-05T11:20:00Z',
          district: 'Rajshahi'
        },
        {
          id: '5',
          full_name: 'Mohammad Ali',
          email: 'mohammad@example.com',
          role: 'manager',
          phone: '+880 1512345678',
          avatar_url: 'https://ui-avatars.com/api/?name=Mohammad+Ali',
          status: 'active',
          email_verified: true,
          created_at: '2022-12-10T16:30:00Z',
          district: 'Dhaka'
        }
      ];
      
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and auto-refresh every 30 seconds
  useEffect(() => {
    fetchUsers();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchUsers, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Filter users based on search term, role, and status
  useEffect(() => {
    let result = users;
    
    // Filter out super admin users
    result = result.filter(user => user.role !== 'super_admin');
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.full_name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term) ||
        (user.phone && user.phone.toLowerCase().includes(term))
      );
    }
    
    // Filter by role
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handle user status change
  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    try {
      console.log('Updating user status:', { 
        userId, 
        newStatus, 
        selectedUser: selectedUser?.id,
        userIdType: typeof userId,
        userIdLength: userId?.length
      });
      
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Call the userService to update the user status
      await userService.updateUserStatus(userId, newStatus);
      
      // Update local state
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      );
      
      setUsers(updatedUsers);
      
      // If the user details modal is open and this is the selected user, update that too
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }
      
      toast({
        title: 'Success',
        description: `User status updated to ${newStatus}.`,
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error updating user status:', error);
      const errorMessage = error.message || 'Failed to update user status. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Handle user editing
  const handleEditUser = async (userId: string) => {
    try {
      // Find the user in local state to ensure consistency
      const userDetails = users.find(user => user.id === userId);
      if (!userDetails) {
        throw new Error('User not found in local state');
      }
      
      console.log('Editing user:', userDetails.id, userDetails.full_name);
      setEditingUser(userDetails);
      setShowEditUserModal(true);
    } catch (error: any) {
      console.error('Error opening user edit:', error);
      toast({
        title: 'Error',
        description: 'Failed to open user edit. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle user update
  const handleUpdateUser = async () => {
    try {
      if (!editingUser || !editingUser.id) {
        throw new Error('No user selected for editing');
      }

      console.log('Updating user:', editingUser.id, editingUser.full_name, editingUser.email);

      // Call the userService to update the user
      await userService.updateUser(editingUser.id, {
        full_name: editingUser.full_name,
        email: editingUser.email,
        phone: editingUser.phone,
        district: editingUser.district,
        gender: editingUser.gender,
        role: editingUser.role,
        location: editingUser.location,
        avatar_url: editingUser.avatar_url,
        status: editingUser.status,
        bio: editingUser.bio,
        education: editingUser.education,
        experience: editingUser.experience,
        subjects: editingUser.subjects,
        hourly_rate: editingUser.hourly_rate,
        availability: editingUser.availability,
        premium: editingUser.premium
      });

      // Update local state
      const updatedUsers = users.map(user => 
        user.id === editingUser.id ? { ...user, ...editingUser } : user
      );
      
      setUsers(updatedUsers);
      setShowEditUserModal(false);
      
      toast({
        title: 'Success',
        description: 'User information updated successfully.',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.message || 'Failed to update user information. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Call the userService to delete the user
      await userService.deleteUser(userId);
      
      // Update local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user. Please try again.',
        variant: 'destructive'
      });
    }
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.full_name || !newUser.email || !newUser.role || !newUser.password || !newUser.phone || !newUser.gender) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      // Call the appropriate userService method based on role
      const userData = {
        full_name: newUser.full_name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as 'student' | 'admin' | 'manager' | 'tutor',
        phone: newUser.phone,
        gender: newUser.gender
      };

      let createdUser;
      if (['admin', 'manager'].includes(newUser.role)) {
        // Use admin registration endpoint for admin and manager roles
        createdUser = await userService.createAdminUser(userData);
      } else {
        // Use regular registration endpoint for student and tutor roles
        createdUser = await userService.createUser(userData);
      }
      
      // Update local state
      setUsers([...users, createdUser]);
      
      // Reset form and close modal
      setNewUser({
        full_name: '',
        email: '',
        role: 'student',
        phone: '',
        gender: '' as 'male' | 'female' | 'other' | '',
        password: ''
      });
      setShowAddUserModal(false);
      
      toast({
        title: 'Success',
        description: `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} user "${newUser.full_name}" added successfully.`,
        variant: 'default'
      });
    } catch (error: any) {
      console.error('Error adding user:', error);
      const errorMessage = error.message || 'Failed to add user. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>;
    }
  };

  // Render role badge with appropriate color
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Manager</Badge>;
      case 'tutor':
        return <Badge className="bg-cyan-500 hover:bg-cyan-600">Tutor</Badge>;
      case 'student':
        return <Badge className="bg-teal-500 hover:bg-teal-600">Student</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{role}</Badge>;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
  };

  // Handle opening user details from table row
  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  // Handle toggling user status from table row
  const handleToggleUserStatus = async (user: UserData) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    await handleStatusChange(user.id, newStatus);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage all users on the platform</p>
        </div>
        <Button onClick={() => setShowAddUserModal(true)} className="w-full sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="tutor">Tutors</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="manager">Managers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">User</TableHead>
                    <TableHead className="hidden sm:table-cell">Role</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                            {user.avatar_url ? (
                              <img 
                                src={user.avatar_url} 
                                alt={user.full_name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span className={user.avatar_url ? 'hidden' : ''}>
                              {user.full_name.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="sm:hidden mt-1">
                              <Badge variant={user.role === 'tutor' ? 'default' : 'secondary'} className="text-xs">
                                {user.role}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={user.role === 'tutor' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          <p className="text-gray-900">{user.phone}</p>
                          <p className="text-gray-500">{user.district}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge 
                          variant={
                            user.status === 'active' ? 'default' : 
                            user.status === 'pending' ? 'secondary' : 'destructive'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewUser(user)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                              Edit User
                            </DropdownMenuItem>
                            {canSuspend && (
                              <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-red-600">
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected user.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  {selectedUser.avatar_url ? (
                    <img 
                      src={selectedUser.avatar_url} 
                      alt={selectedUser.full_name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center bg-green-100 text-green-700 text-4xl ${selectedUser.avatar_url ? 'hidden' : ''}`}>
                    {selectedUser.full_name.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {renderRoleBadge(selectedUser.role)}
                    {renderStatusBadge(selectedUser.status)}
                    {selectedUser.email_verified ? (
                      <Badge className="bg-blue-500">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600">Unverified</Badge>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold mb-3">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p>{selectedUser.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p>{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p>{selectedUser.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p>{selectedUser.district || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p>{selectedUser.location || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Gender</p>
                      <p>{selectedUser.gender ? selectedUser.gender.charAt(0).toUpperCase() + selectedUser.gender.slice(1) : 'Not provided'}</p>
                    </div>
                  </div>
                  {selectedUser.tutor_id && (
                    <div className="flex items-center gap-2">
                      <School className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Tutor ID</p>
                        <p>{selectedUser.tutor_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information */}
              {(selectedUser.bio || selectedUser.education || selectedUser.experience || selectedUser.subjects || selectedUser.hourly_rate) && (
                <div>
                  <h4 className="font-semibold mb-3">Profile Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.bio && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Bio</p>
                        <p className="text-sm">{selectedUser.bio}</p>
                      </div>
                    )}
                    {selectedUser.education && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Education</p>
                        <p className="text-sm">{selectedUser.education}</p>
                      </div>
                    )}
                    {selectedUser.experience && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Experience</p>
                        <p className="text-sm">{selectedUser.experience}</p>
                      </div>
                    )}
                    {selectedUser.subjects && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Subjects</p>
                        <p className="text-sm">{selectedUser.subjects}</p>
                      </div>
                    )}
                    {selectedUser.hourly_rate && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Hourly Rate</p>
                        <p className="text-sm">${selectedUser.hourly_rate}</p>
                      </div>
                    )}
                    {selectedUser.rating && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Rating</p>
                        <p className="text-sm">{selectedUser.rating}/5 ({selectedUser.total_reviews || 0} reviews)</p>
                      </div>
                    )}
                    {selectedUser.premium && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Premium Status</p>
                        <Badge className={selectedUser.premium === 'yes' ? 'bg-yellow-500' : 'bg-gray-500'}>
                          {selectedUser.premium === 'yes' ? 'Premium' : 'Standard'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h4 className="font-semibold mb-3">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Joined on</p>
                    <p>{new Date(selectedUser.created_at).toLocaleDateString()} ({new Date(selectedUser.created_at).toLocaleTimeString()})</p>
                  </div>
                  {selectedUser.updated_at && (
                    <div>
                      <p className="text-sm text-gray-500">Last updated</p>
                      <p>{new Date(selectedUser.updated_at).toLocaleDateString()} ({new Date(selectedUser.updated_at).toLocaleTimeString()})</p>
                    </div>
                  )}
                  {selectedUser.total_views && (
                    <div>
                      <p className="text-sm text-gray-500">Total Views</p>
                      <p>{selectedUser.total_views}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDetailsModal(false)}>Close</Button>
            {selectedUser && selectedUser.id && (
              <>
                {selectedUser.status === 'active' ? (
                  <Button variant="destructive" onClick={() => {
                    console.log('Suspending user from modal:', selectedUser.id);
                    handleStatusChange(selectedUser.id, 'suspended');
                    setShowUserDetailsModal(false);
                  }}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                    console.log('Activating user from modal:', selectedUser.id);
                    handleStatusChange(selectedUser.id, 'active');
                    setShowUserDetailsModal(false);
                  }}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate User
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account in the system.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium">Full Name *</label>
                <Input
                  id="full_name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email *</label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password *</label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">Role *</label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">Phone *</label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">Gender *</label>
                <Select
                  value={newUser.gender || ''}
                  onValueChange={(value: "" | "male" | "female" | "other") => setNewUser({ ...newUser, gender: value })}
                >
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
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUserModal(false)}>Cancel</Button>
            <Button onClick={handleAddUser} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User - {editingUser?.full_name}</DialogTitle>
            <DialogDescription>
              Update comprehensive user information including profile details.
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="full_name" className="text-sm font-medium">Full Name</label>
                    <Input
                      id="full_name"
                      value={editingUser.full_name}
                      onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                      placeholder="Full Name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      placeholder="Email"
                      type="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="role" className="text-sm font-medium">Role</label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value: any) => setEditingUser({...editingUser, role: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="tutor">Tutor</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select
                      value={editingUser.status}
                      onValueChange={(value: any) => setEditingUser({...editingUser, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                    <Input
                      id="phone"
                      value={editingUser.phone || ''}
                      onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                      placeholder="Phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="gender" className="text-sm font-medium">Gender</label>
                    <Select
                      value={editingUser.gender || ''}
                      onValueChange={(value: any) => setEditingUser({...editingUser, gender: value})}
                    >
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
                  
                  <div className="space-y-2">
                    <label htmlFor="district" className="text-sm font-medium">District</label>
                    <Input
                      id="district"
                      value={editingUser.district || ''}
                      onChange={(e) => setEditingUser({...editingUser, district: e.target.value})}
                      placeholder="District"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="text-sm font-medium">Location</label>
                    <Input
                      id="location"
                      value={editingUser.location || ''}
                      onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                      placeholder="Location"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="avatar_url" className="text-sm font-medium">Avatar URL</label>
                    <Input
                      id="avatar_url"
                      value={editingUser.avatar_url || ''}
                      onChange={(e) => setEditingUser({...editingUser, avatar_url: e.target.value})}
                      placeholder="Avatar URL"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="tutor_id" className="text-sm font-medium">Tutor ID</label>
                    <Input
                      id="tutor_id"
                      value={editingUser.tutor_id || ''}
                      onChange={(e) => setEditingUser({...editingUser, tutor_id: e.target.value})}
                      placeholder="Tutor ID"
                    />
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                    <textarea
                      id="bio"
                      value={editingUser.bio || ''}
                      onChange={(e) => setEditingUser({...editingUser, bio: e.target.value})}
                      placeholder="Bio"
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="education" className="text-sm font-medium">Education</label>
                    <textarea
                      id="education"
                      value={editingUser.education || ''}
                      onChange={(e) => setEditingUser({...editingUser, education: e.target.value})}
                      placeholder="Education"
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="experience" className="text-sm font-medium">Experience</label>
                    <textarea
                      id="experience"
                      value={editingUser.experience || ''}
                      onChange={(e) => setEditingUser({...editingUser, experience: e.target.value})}
                      placeholder="Experience"
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subjects" className="text-sm font-medium">Subjects</label>
                    <textarea
                      id="subjects"
                      value={editingUser.subjects || ''}
                      onChange={(e) => setEditingUser({...editingUser, subjects: e.target.value})}
                      placeholder="Subjects"
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="hourly_rate" className="text-sm font-medium">Hourly Rate</label>
                    <Input
                      id="hourly_rate"
                      type="number"
                      value={editingUser.hourly_rate || ''}
                      onChange={(e) => setEditingUser({...editingUser, hourly_rate: parseFloat(e.target.value) || undefined})}
                      placeholder="Hourly Rate"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="premium" className="text-sm font-medium">Premium Status</label>
                    <Select
                      value={editingUser.premium || 'no'}
                      onValueChange={(value: any) => setEditingUser({...editingUser, premium: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select premium status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="availability" className="text-sm font-medium">Availability</label>
                    <textarea
                      id="availability"
                      value={editingUser.availability || ''}
                      onChange={(e) => setEditingUser({...editingUser, availability: e.target.value})}
                      placeholder="Availability"
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="rating" className="text-sm font-medium">Rating</label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.01"
                      min="0"
                      max="5"
                      value={editingUser.rating || ''}
                      onChange={(e) => setEditingUser({...editingUser, rating: parseFloat(e.target.value) || undefined})}
                      placeholder="Rating (0-5)"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="total_reviews" className="text-sm font-medium">Total Reviews</label>
                    <Input
                      id="total_reviews"
                      type="number"
                      value={editingUser.total_reviews || ''}
                      onChange={(e) => setEditingUser({...editingUser, total_reviews: parseInt(e.target.value) || undefined})}
                      placeholder="Total Reviews"
                    />
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Verification Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="email_verified" className="text-sm font-medium">Email Verified</label>
                    <Select
                      value={editingUser.email_verified ? 'true' : 'false'}
                      onValueChange={(value: any) => setEditingUser({...editingUser, email_verified: value === 'true'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Email verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Not Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="verified" className="text-sm font-medium">Account Verified</label>
                    <Select
                      value={editingUser.verified ? 'true' : 'false'}
                      onValueChange={(value: any) => setEditingUser({...editingUser, verified: value === 'true'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Account verification status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Verified</SelectItem>
                        <SelectItem value="false">Not Verified</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateUser}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}