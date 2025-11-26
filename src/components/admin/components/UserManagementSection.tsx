'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from '@/components/ui/use-toast';
import { MoreHorizontal, Search, UserPlus, Filter, CheckCircle, XCircle, AlertCircle, User, Mail, Phone, MapPin, School } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { 
  useCreateAuthMutation,
  useGetAllUsersQuery, 
  useUpdateUserMutation, 
  // useUpdateUsersMutation 
} from '@/redux/features/auth/authApi';

// User type based on your backend response
export type UserData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  alternative_number?: string | null;
  role: 'STUDENT_GUARDIAN' | 'TUTOR' | 'ADMIN' | 'MANAGER' | 'SUPER_ADMIN';
  status: 'active' | 'suspended' | 'pending';
  email_verified?: boolean;
  verified?: boolean;
  avatar_url?: string;
  avatar?: string;
  district?: string | null;
  location?: string | null;
  gender?: string;
  bio?: string;
  education?: string | null;
  experience?: string | null;
  subjects?: string[];
  hourly_rate?: number;
  availability?: string | null;
  premium?: boolean;
  rating?: number | null;
  total_reviews?: number;
  tutor_id?: number;
  genius?: boolean;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  institute_name?: string;
  nationality?: string;
  postOffice?: string | null;
  preferred_areas?: string[];
  qualification?: string | null;
  religion?: string;
  studentId?: string | null;
  year?: string;
  background?: string[];
};

export function UserManagementSection() {
  const { canDelete, canSuspend } = useRole();
  
  // RTK Query hooks
  const { 
    data: usersResponse, 
    isLoading, 
    error, 
    refetch 
  } = useGetAllUsersQuery(undefined, {
    pollingInterval: 30000, // Auto-refresh every 30 seconds
  });

  const [createUser] = useCreateAuthMutation();
  const [updateUser] = useUpdateUserMutation();
  // const [deleteUser] = useDeleteUserMutation();
  // const [updateUserStatus] = useUpdateUserStatusMutation();

  // State management
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  
  const [newUser, setNewUser] = useState({
    fullName: '',
    email: '',
    role: 'STUDENT_GUARDIAN' as 'STUDENT_GUARDIAN' | 'TUTOR' | 'ADMIN' | 'MANAGER',
    phone: '',
    gender: '' as 'male' | 'female' | 'other' | '',
    password: 'defaultPassword123' // You might want to generate this or make it required
  });

  const [editingUser, setEditingUser] = useState<UserData | null>(null);




  // Process users data from API response
  useEffect(() => {
    if (usersResponse?.data) {
      const usersData = usersResponse.data.map((user: any) => ({
        
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        alternative_number: user.alternative_number,
        role: user.role,
        status: user.status, 
        email_verified: user.verified,
        verified: user.verified,
        avatar_url: user.avatar,
        avatar: user.avatar,
        district: user.district,
        location: user.location,
        gender: user.gender,
        bio: user.bio,
        education: user.education,
        experience: user.experience,
        subjects: user.subjects || [],
        hourly_rate: user.hourly_rate,
        availability: user.availability,
        premium: user.premium,
        rating: user.rating,
        total_reviews: user.total_reviews,
        tutor_id: user.tutor_id,
        genius: user.genius,
        createdAt: user.createdAt,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
        institute_name: user.institute_name,
        nationality: user.nationality,
        postOffice: user.postOffice,
        preferred_areas: user.preferred_areas,
        qualification: user.qualification,
        religion: user.religion,
        studentId: user.studentId,
        year: user.year,
        background: user.background
      }));
      setUsers(usersData);
    }
  }, [usersResponse]);

  // Filter users based on search term, role, and status
  useEffect(() => {
    let result = users;
    
    // Filter out super admin users
    result = result.filter(user => user.role !== 'SUPER_ADMIN');

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.fullName.toLowerCase().includes(term) || 
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
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      // Use RTK Query mutation
      // await updateUser({
      //   id: userId,
      //   status: newStatus
      // }).unwrap();
      
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
      const errorMessage = error.data?.message || 'Failed to update user status. Please try again.';
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
      
      setEditingUser(userDetails);
      setShowEditUserModal(true);
    } catch (error: any) {
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


    // Prepare update data - only include fields that can be updated
    const updateData = {
      fullName: editingUser.fullName,
      email: editingUser.email,
      phone: editingUser.phone,
      district: editingUser.district,
      gender: editingUser.gender,
      role: editingUser.role,
      location: editingUser.location,
      avatar: editingUser.avatar_url,
      status: editingUser.status,
      bio: editingUser.bio,
      education: editingUser.education,
      experience: editingUser.experience,
      subjects: editingUser.subjects,
      hourly_rate: editingUser.hourly_rate,
      availability: editingUser.availability,
      premium: editingUser.premium,
      verified: editingUser.verified
    };


    // Use RTK Query mutation - pass as { id, data }
    await updateUser({
      id: editingUser.id,
      data: updateData
    }).unwrap();

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
    const errorMessage = error.data?.message || error.message || 'Failed to update user information. Please try again.';
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
      // Use RTK Query mutation
      // await deleteUser(userId).unwrap();
      
      // Update local state
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
        variant: 'default'
      });
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Failed to delete user. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.fullName || !newUser.email || !newUser.role || !newUser.phone || !newUser.gender) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      // Prepare user data for creation
      const userData = {
        fullName: newUser.fullName,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        phone: newUser.phone,
        gender: newUser.gender
      };

      // Use RTK Query mutation
      const createdUser = await createUser(userData).unwrap();

      // Update local state - add the new user to the list
      if (createdUser.data) {
        const newUserData: UserData = {
          id: createdUser.data.id,
          fullName: createdUser.data.fullName,
          email: createdUser.data.email,
          phone: createdUser.data.phone,
          role: createdUser.data.role,
          status: 'active',
          email_verified: false,
          verified: false,
          ...createdUser.data
        };
        setUsers(prev => [...prev, newUserData]);
      }
      
      // Reset form and close modal
      setNewUser({
        fullName: '',
        email: '',
        role: 'STUDENT_GUARDIAN',
        phone: '',
        gender: '',
        password: 'defaultPassword123'
      });
      setShowAddUserModal(false);
      
      toast({
        title: 'Success',
        description: `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} user "${newUser.fullName}" added successfully.`,
        variant: 'default'
      });
    } catch (error: any) {
      const errorMessage = error.data?.message || 'Failed to add user. Please try again.';
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
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Super Admin</Badge>;
      case 'ADMIN':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>;
      case 'MANAGER':
        return <Badge className="bg-indigo-500 hover:bg-indigo-600">Manager</Badge>;
      case 'TUTOR':
        return <Badge className="bg-cyan-500 hover:bg-cyan-600">Tutor</Badge>;
      case 'STUDENT_GUARDIAN':
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
                <SelectItem value="STUDENT_GUARDIAN">Students</SelectItem>
                <SelectItem value="TUTOR">Tutors</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="MANAGER">Managers</SelectItem>
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
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-red-500">
              <AlertCircle className="h-6 w-6 mr-2" />
              Failed to load users. Please try again.
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
                                alt={user.fullName} 
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
                              {user.fullName.charAt(0)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                            <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            <div className="sm:hidden mt-1">
                              {renderRoleBadge(user.role)}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {renderRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="text-sm">
                          <p className="text-gray-900">{user.phone}</p>
                          <p className="text-gray-500">{user.district || 'N/A'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {renderStatusBadge(user.status)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
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
                      alt={selectedUser.fullName} 
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
                    {selectedUser.fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.fullName}</h3>
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
                      <p>{selectedUser.fullName}</p>
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
                    {selectedUser.subjects && selectedUser.subjects.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Subjects</p>
                        <p className="text-sm">{selectedUser.subjects.join(', ')}</p>
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
                        <Badge className={selectedUser.premium ? 'bg-yellow-500' : 'bg-gray-500'}>
                          {selectedUser.premium ? 'Premium' : 'Standard'}
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
                    <p>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {selectedUser.updated_at && (
                    <div>
                      <p className="text-sm text-gray-500">Last updated</p>
                      <p>{new Date(selectedUser.updated_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedUser.total_reviews && (
                    <div>
                      <p className="text-sm text-gray-500">Total Reviews</p>
                      <p>{selectedUser.total_reviews}</p>
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
                    handleStatusChange(selectedUser.id, 'suspended');
                    setShowUserDetailsModal(false);
                  }}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
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
                <label htmlFor="fullName" className="text-sm font-medium">Full Name *</label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
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
                <label htmlFor="role" className="text-sm font-medium">Role *</label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: 'STUDENT_GUARDIAN' | 'TUTOR' | 'ADMIN' | 'MANAGER') => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT_GUARDIAN">Student</SelectItem>
                    <SelectItem value="TUTOR">Tutor</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
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
            <DialogTitle>Edit User - {editingUser?.fullName}</DialogTitle>
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
                    <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
                    <Input
                      id="fullName"
                      value={editingUser.fullName}
                      onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
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
                        <SelectItem value="STUDENT_GUARDIAN">Student</SelectItem>
                        <SelectItem value="TUTOR">Tutor</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
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
                      onChange={(e) => setEditingUser({...editingUser, tutor_id: Number(e.target.value)})}
                      placeholder="Tutor ID"
                      type="number"
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
                    <Input
                      id="subjects"
                      value={editingUser.subjects?.join(', ') || ''}
                      onChange={(e) => setEditingUser({...editingUser, subjects: e.target.value.split(',').map(s => s.trim())})}
                      placeholder="Subjects (comma separated)"
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
                      value={editingUser.premium ? 'true' : 'false'}
                      onValueChange={(value: any) => setEditingUser({...editingUser, premium: value === 'true'})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select premium status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
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