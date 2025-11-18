'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { PendingUser, AccountItem } from "@/hooks/useAdminDashboard";

interface ApprovalsSectionProps {
  pendingUsers: PendingUser[];
  accounts: AccountItem[];
  handleApproveUser: (userId: string) => void;
  handleRejectUser: (userId: string) => void;
  handleSuspendUser: (userId: string) => void;
  handleActivateUser: (userId: string) => void;
  handleDeleteUser: (userId: string) => void;
  setShowEditUserModal: (show: boolean) => void;
  setEditingUser: (user: any) => void;
}

export function ApprovalsSection({
  pendingUsers,
  accounts,
  handleApproveUser,
  handleRejectUser,
  handleSuspendUser,
  handleActivateUser,
  handleDeleteUser,
  setShowEditUserModal,
  setEditingUser
}: ApprovalsSectionProps) {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Filter accounts based on role and search query
  const filteredAccounts = accounts.filter(account => {
    const matchesRole = roleFilter === "all" || account.role === roleFilter;
    const matchesSearch = account.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          account.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = filteredAccounts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white p-6 shadow-lg">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">User Approvals & Management</h2>
        <p className="text-white/90 mt-1">Approve new users and manage existing accounts.</p>
      </div>

      {/* Pending Approvals Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Pending Approvals</span>
            <Badge variant="outline" className="ml-2">{pendingUsers.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CheckCircle2 className="mx-auto h-8 w-8 text-green-500 mb-2" />
              <p>No pending approvals at the moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4">
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{user.role}</Badge>
                      <span className="text-xs text-muted-foreground">Applied {user.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() => handleApproveUser(user.id)}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleRejectUser(user.id)}
                    >
                      <XCircle className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Managed Accounts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Managed Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input 
                placeholder="Search by name or email" 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on new search
                }}
              />
            </div>
            <div>
              <Select value={roleFilter} onValueChange={(value) => {
                setRoleFilter(value);
                setCurrentPage(1); // Reset to first page on filter change
              }}>
                <SelectTrigger className="w-[180px]">
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
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No accounts found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">{account.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{account.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {account.status === "active" ? (
                          <Badge className="bg-green-500">{account.status}</Badge>
                        ) : account.status === "suspended" ? (
                          <Badge className="bg-amber-500">{account.status}</Badge>
                        ) : (
                          <Badge className="bg-slate-500">{account.status}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setEditingUser(account);
                              setShowEditUserModal(true);
                            }}
                          >
                            Edit
                          </Button>
                          
                          {account.status === "active" ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-amber-500 text-amber-600 hover:bg-amber-50"
                              onClick={() => handleSuspendUser(account.id)}
                            >
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Suspend
                            </Button>
                          ) : account.status === "suspended" ? (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() => handleActivateUser(account.id)}
                            >
                              <CheckCircle2 className="mr-1 h-4 w-4" />
                              Activate
                            </Button>
                          ) : null}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteUser(account.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length} accounts
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}