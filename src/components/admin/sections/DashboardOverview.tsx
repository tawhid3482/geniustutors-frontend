'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2, UserCheck, MessageSquare
} from "lucide-react";
import { RecentTuitionRequests } from "../components/RecentTuitionRequests";

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
  showAddUserModal?: boolean;
  setShowAddUserModal?: (show: boolean) => void;
  newUser?: any;
  setNewUser?: (user: any) => void;
  handleCreateUser?: () => void;
  showEditUserModal?: boolean;
  setShowEditUserModal?: (show: boolean) => void;
  editingUser?: any;
  setEditingUser?: (user: any) => void;
  handleUpdateUser?: () => void;
}

export function DashboardOverview({
  setActiveTab,
  showAddUserModal,
  setShowAddUserModal,
  newUser,
  setNewUser,
  handleCreateUser,
  showEditUserModal,
  setShowEditUserModal,
  editingUser,
  setEditingUser,
  handleUpdateUser
}: DashboardOverviewProps) {
  return (
    <div className="space-y-6 w-full">
      <div className="rounded-2xl bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard 👑</h2>
            <p className="text-white/90 mt-1">Here is a quick snapshot of the platform status.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" className="bg-white text-green-700 hover:bg-green-50" onClick={() => setActiveTab("tution-request")}>Tuition Request</Button>
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RecentTuitionRequests />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" onClick={() => setActiveTab("support")}>
                <MessageSquare className="h-5 w-5 text-green-600" />
                <span className="text-xs">Support Chat</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" onClick={() => setActiveTab("payment")}>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-xs">Payment Management</span>
              </Button>
              <Button variant="outline" className="h-auto flex flex-col items-center justify-center p-4 gap-2" onClick={() => setActiveTab("users")}>
                <UserCheck className="h-5 w-5 text-green-600" />
                <span className="text-xs">User Management</span>
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && setShowAddUserModal && newUser && setNewUser && handleCreateUser && (
        <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
          <DialogContent className="sm:max-w-[425px] max-w-[95vw]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="name" className="text-right text-sm">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="email" className="text-right text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="password" className="text-right text-sm">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="role" className="text-right text-sm">
                  Role
                </Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="phone" className="text-right text-sm">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="district" className="text-right text-sm">
                  District
                </Label>
                <Input
                  id="district"
                  value={newUser.district}
                  onChange={(e) => setNewUser({...newUser, district: e.target.value})}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowAddUserModal(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto" 
                onClick={handleCreateUser}
                disabled={!newUser.email || !newUser.full_name || !newUser.password}
              >
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && setShowEditUserModal && editingUser && setEditingUser && handleUpdateUser && (
        <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user account information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={editingUser.role} 
                  onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-district" className="text-right">
                  District
                </Label>
                <Input
                  id="edit-district"
                  value={editingUser.district}
                  onChange={(e) => setEditingUser({...editingUser, district: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select 
                  value={editingUser.status} 
                  onValueChange={(value) => setEditingUser({...editingUser, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowEditUserModal(false);
                setEditingUser(null);
              }}>Cancel</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={handleUpdateUser}
                disabled={!editingUser.email || !editingUser.full_name}
              >
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}