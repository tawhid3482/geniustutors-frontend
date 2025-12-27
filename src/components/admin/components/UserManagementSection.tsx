"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  MoreHorizontal,
  Search,
  UserPlus,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Shield,
  Star,
  Crown,
} from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import {
  useCreateAuthMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "@/redux/features/auth/authApi";

// User type based on your backend response
export type UserData = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  alternative_number?: string | null;
  role: "STUDENT_GUARDIAN" | "TUTOR" | "ADMIN" | "SUPER_ADMIN";
  status: "active" | "suspended" | "pending";
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
    refetch,
  } = useGetAllUsersQuery(undefined, {
    pollingInterval: 30000,
  });

  const [createUser] = useCreateAuthMutation();
  const [updateUser] = useUpdateUserMutation();

  // State management
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  // Calculate paginated users
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    role: "STUDENT_GUARDIAN" as "STUDENT_GUARDIAN" | "TUTOR" | "ADMIN",
    phone: "",
    gender: "" as "Male" | "Female" | "Other" | "",
    password: "123456",
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
        premium: user.premium || false,
        rating: user.rating,
        total_reviews: user.total_reviews,
        tutor_id: user.tutor_id,
        genius: user.genius || false,
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
        background: user.background,
      }));
      setUsers(usersData);
    }
  }, [usersResponse]);

  // Filter users based on search term, role, and status
  useEffect(() => {
    let result = users;

    // Filter out super admin users
    result = result.filter((user) => user.role !== "SUPER_ADMIN");

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          (user.phone && user.phone.toLowerCase().includes(term))
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Handle user status change
  const handleStatusChange = async (
    userId: string,
    newStatus: "active" | "suspended" | "pending"
  ) => {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === userId ? { ...user, status: newStatus } : user
      );

      setUsers(updatedUsers);

      // Update selected user in modal if open
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: newStatus });
      }

      toast({
        title: "Success",
        description: `User status updated to ${newStatus}.`,
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage =
        error.data?.message ||
        "Failed to update user status. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle user editing
  const handleEditUser = async (userId: string) => {
    try {
      const userDetails = users.find((user) => user.id === userId);
      if (!userDetails) {
        throw new Error("User not found in local state");
      }

      setEditingUser(userDetails);
      setShowEditUserModal(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to open user edit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle user update - only update specific fields
  const handleUpdateUser = async () => {
    try {
      if (!editingUser || !editingUser.id) {
        throw new Error("No user selected for editing");
      }

      // Prepare update data - ONLY name, email, phone, status, premium, verified, genius
      const updateData = {
        fullName: editingUser.fullName,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
        status: editingUser.status,
        premium: editingUser.premium,
        verified: editingUser.verified,
        genius: editingUser.genius,
      };

      // Use RTK Query mutation
      await updateUser({
        id: editingUser.id,
        data: updateData,
      }).unwrap();

      // Update local state
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id ? { ...user, ...updateData } : user
      );

      setUsers(updatedUsers);

      // Update selected user if currently viewing
      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser({ ...selectedUser, ...updateData });
      }

      setShowEditUserModal(false);

      toast({
        title: "Success",
        description: "User information updated successfully.",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage =
        error.data?.message ||
        error.message ||
        "Failed to update user information. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Update local state
      const updatedUsers = users.filter((user) => user.id !== userId);
      setUsers(updatedUsers);

      toast({
        title: "Success",
        description: "User deleted successfully.",
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage =
        error.data?.message || "Failed to delete user. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Handle adding a new user
  const handleAddUser = async () => {
    try {
      if (
        !newUser.fullName ||
        !newUser.email ||
        !newUser.role ||
        !newUser.phone ||
        !newUser.gender
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const userData = {
        fullName: newUser.fullName,
        password: "123456",
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        gender: newUser.gender,
      };

      await createUser(userData).unwrap();
      setShowAddUserModal(false);

      toast({
        title: "Success",
        description: `${
          newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)
        } user "${newUser.fullName}" added successfully.`,
        variant: "default",
      });
    } catch (error: any) {
      const errorMessage =
        error.data?.message || "Failed to add user. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
        );
      case "suspended":
        return <Badge className="bg-red-500 hover:bg-red-600">Suspended</Badge>;
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">{status}</Badge>
        );
    }
  };

  // Render role badge with appropriate color
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-purple-500 hover:bg-purple-600">
            Super Admin
          </Badge>
        );
      case "ADMIN":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>;
      case "TUTOR":
        return <Badge className="bg-cyan-500 hover:bg-cyan-600">Tutor</Badge>;
      case "STUDENT_GUARDIAN":
        return <Badge className="bg-teal-500 hover:bg-teal-600">Student</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">{role}</Badge>;
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  // Handle opening user details from table row
  const handleViewUser = (user: UserData) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  // Handle toggling user status from table row
  const handleToggleUserStatus = async (user: UserData) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    await handleStatusChange(user.id, newStatus);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Render page numbers
  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => goToPage(i)}
          className="w-10 h-10"
        >
          {i}
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all users on the platform
          </p>
        </div>
        <Button
          onClick={() => setShowAddUserModal(true)}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

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
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg sm:text-xl">
            Users ({filteredUsers.length})
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">User</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Role
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Contact
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Verification
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
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
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                    target.nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                              ) : null}
                              <span className={user.avatar_url ? "hidden" : ""}>
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {user.fullName}
                                </p>
                                {user.premium && (
                                  <Crown className="w-4 h-4 text-yellow-500" />
                                )}
                                {user.genius && (
                                  <Star className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">
                                {user.email}
                              </p>
                              <div className="sm:hidden mt-1 flex gap-1">
                                {renderRoleBadge(user.role)}
                                {user.premium && (
                                  <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
                                    Premium
                                  </Badge>
                                )}
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
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {renderStatusBadge(user.status)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {user.verified && (
                              <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                                Verified
                              </Badge>
                            )}
                            {user.premium && (
                              <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs">
                                Premium
                              </Badge>
                            )}
                            {user.genius && (
                              <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                                Genius
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleViewUser(user)}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditUser(user.id)}
                              >
                                Edit User
                              </DropdownMenuItem>
                              {canSuspend && (
                                <DropdownMenuItem
                                  onClick={() => handleToggleUserStatus(user)}
                                >
                                  {user.status === "active"
                                    ? "Suspend"
                                    : "Activate"}
                                </DropdownMenuItem>
                              )}
                              {canDelete && (
                                <DropdownMenuItem
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-red-600"
                                >
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-500">
                    Showing {startIndex + 1} to{" "}
                    {Math.min(endIndex, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="hidden sm:flex"
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center space-x-1">
                      {renderPageNumbers()}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="hidden sm:flex"
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog
        open={showUserDetailsModal}
        onOpenChange={setShowUserDetailsModal}
      >
        <DialogContent className="sm:max-w-[600px] mt-2 h-screen overflow-auto">
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
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex items-center justify-center bg-green-100 text-green-700 text-4xl ${
                      selectedUser.avatar_url ? "hidden" : ""
                    }`}
                  >
                    {selectedUser.fullName.charAt(0)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">
                      {selectedUser.fullName}
                    </h3>
                    {selectedUser.premium && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                    {selectedUser.genius && (
                      <Star className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {renderRoleBadge(selectedUser.role)}
                    {renderStatusBadge(selectedUser.status)}
                    {selectedUser.verified && (
                      <Badge className="bg-green-500">Verified</Badge>
                    )}
                    {selectedUser.email_verified && (
                      <Badge className="bg-blue-500">Email Verified</Badge>
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
                      <p>{selectedUser.phone || "Not provided"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <div className="flex items-center gap-2">
                        <span>{selectedUser.status}</span>
                        {selectedUser.premium && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                        {selectedUser.genius && (
                          <Star className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div>
                <h4 className="font-semibold mb-3">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Premium Status</p>
                    <Badge
                      className={
                        selectedUser.premium ? "bg-yellow-500" : "bg-gray-500"
                      }
                    >
                      {selectedUser.premium ? "Premium User" : "Standard User"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Verified Status</p>
                    <Badge
                      className={
                        selectedUser.verified ? "bg-green-500" : "bg-gray-500"
                      }
                    >
                      {selectedUser.verified
                        ? "Verified Account"
                        : "Not Verified"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Genius Status</p>
                    <Badge
                      className={
                        selectedUser.genius ? "bg-blue-500" : "bg-gray-500"
                      }
                    >
                      {selectedUser.genius ? "Genius User" : "Regular User"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Joined on</p>
                    <p>
                      {selectedUser.createdAt
                        ? new Date(selectedUser.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUserDetailsModal(false)}
            >
              Close
            </Button>
            {selectedUser && selectedUser.id && (
              <Button onClick={() => handleEditUser(selectedUser.id)}>
                Edit User
              </Button>
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
                <label htmlFor="fullName" className="text-sm font-medium">
                  Full Name *
                </label>
                <Input
                  id="fullName"
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, fullName: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role *
                </label>
                <Select
                  value={newUser.role}
                  onValueChange={(
                    value: "STUDENT_GUARDIAN" | "TUTOR" | "ADMIN"
                  ) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT_GUARDIAN">Student</SelectItem>
                    <SelectItem value="TUTOR">Tutor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone *
                </label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gender *
                </label>
                <Select
                  value={newUser.gender || ""}
                  onValueChange={(value: "" | "Male" | "Female" | "Other") =>
                    setNewUser({ ...newUser, gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddUserModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-green-600 hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal - Only specific fields */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="sm:max-w-[500px] h-screen mt-2 overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit User - {editingUser?.fullName}</DialogTitle>
            <DialogDescription>
              Update user basic information and account status.
            </DialogDescription>
          </DialogHeader>

          {editingUser && (
            <div className="space-y-6 py-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="edit-fullName"
                      className="text-sm font-medium"
                    >
                      Full Name
                    </label>
                    <Input
                      id="edit-fullName"
                      value={editingUser.fullName}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          fullName: e.target.value,
                        })
                      }
                      placeholder="Full Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="edit-email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          email: e.target.value,
                        })
                      }
                      placeholder="Email"
                      type="email"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="edit-phone" className="text-sm font-medium">
                      Phone
                    </label>
                    <Input
                      id="edit-phone"
                      value={editingUser.phone || ""}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Phone"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="edit-status"
                      className="text-sm font-medium"
                    >
                      Manage Role
                    </label>
                    <Select
                      value={editingUser.role}
                      onValueChange={(value: any) =>
                        setEditingUser({ ...editingUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT_GUARDIAN">
                          Student
                        </SelectItem>
                        <SelectItem value="TUTOR">Tutor</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="edit-status"
                      className="text-sm font-medium"
                    >
                      Status
                    </label>
                    <Select
                      value={editingUser.status}
                      onValueChange={(value: any) =>
                        setEditingUser({ ...editingUser, status: value })
                      }
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
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Status</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">Premium User</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Give premium access to user
                      </p>
                    </div>
                    <Select
                      value={editingUser.premium ? "true" : "false"}
                      onValueChange={(value) =>
                        setEditingUser({
                          ...editingUser,
                          premium: value === "true",
                        })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="font-medium">Verified Account</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Mark account as verified
                      </p>
                    </div>
                    <Select
                      value={editingUser.verified ? "true" : "false"}
                      onValueChange={(value) =>
                        setEditingUser({
                          ...editingUser,
                          verified: value === "true",
                        })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">Genius Status</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Give genius status to user
                      </p>
                    </div>
                    <Select
                      value={editingUser.genius ? "true" : "false"}
                      onValueChange={(value) =>
                        setEditingUser({
                          ...editingUser,
                          genius: value === "true",
                        })
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
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
            <Button type="button" onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
