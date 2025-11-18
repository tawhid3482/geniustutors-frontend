'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Shield, 
  Settings,
  UserPlus,
  UserMinus,
  Eye,
  Save,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  getRoles, 
  getPermissions, 
  createRole, 
  updateRole, 
  deleteRole,
  getRoleDetails,
  getRolePermissions,
  assignRoleToUser,
  removeRoleFromUser,
  getUsersWithRoles,
  groupPermissionsByModule,
  getPermissionDisplayName,
  canEditRole,
  type Role,
  type Permission,
  type CreateRoleData,
  type UserWithRoles
} from '@/services/roleManagementService';

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('roles');
  
  // Role management states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRoleForAssignment, setSelectedRoleForAssignment] = useState<string>('');
  const [rolePermissions, setRolePermissions] = useState<Record<string, Permission[]>>({});
  const [isViewPermissionsDialogOpen, setIsViewPermissionsDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    description: '',
    permissions: []
  });

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permissionsData, usersData] = await Promise.all([
        getRoles(),
        getPermissions(),
        getUsersWithRoles()
      ]);
      setRoles(rolesData || []);
      setPermissions(permissionsData || []);
      setUsers(usersData || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch role management data',
        variant: 'destructive'
      });
      // Set empty arrays to prevent undefined errors
      setRoles([]);
      setPermissions([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: []
    });
    setSelectedRole(null);
    setSelectedRoleForAssignment('');
  };

  // Handle form input changes
  const handleInputChange = (field: keyof CreateRoleData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle permission toggle
  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  // Create new role
  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive'
      });
      return;
    }

    if (formData.permissions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one permission',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await createRole(formData);
      toast({
        title: 'Success',
        description: 'Role created successfully'
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create role',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Edit role
  const handleEditRole = async () => {
    if (!selectedRole) return;

    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      await updateRole(selectedRole.id, formData);
      toast({
        title: 'Success',
        description: 'Role updated successfully'
      });
      setIsEditDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update role',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (role: Role) => {
    if (!confirm(`Are you sure you want to delete the role "${role.name}"? This action cannot be undone.`)) return;

    try {
      await deleteRole(role.id);
      toast({
        title: 'Success',
        description: 'Role deleted successfully'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete role',
        variant: 'destructive'
      });
    }
  };

  // Open edit dialog
  const openEditDialog = async (role: Role) => {
    try {
      const roleDetails = await getRoleDetails(role.id);
      setSelectedRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: roleDetails.permissions.map(p => p.id)
      });
      setIsEditDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching role details:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch role details',
        variant: 'destructive'
      });
    }
  };

  // View role permissions
  const viewRolePermissions = async (role: Role) => {
    try {
      const rolePerms = await getRolePermissions(role.id);
      setSelectedRole(role);
      setRolePermissions(rolePerms.permissions);
      setIsViewPermissionsDialogOpen(true);
    } catch (error: any) {
      console.error('Error fetching role permissions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch role permissions',
        variant: 'destructive'
      });
    }
  };

  // Assign role to user
  const handleAssignRole = async () => {
    if (!selectedUser || !selectedRoleForAssignment) {
      toast({
        title: 'Error',
        description: 'Please select both a user and a role',
        variant: 'destructive'
      });
      return;
    }

    try {
      await assignRoleToUser(selectedUser.id, selectedRoleForAssignment);
      toast({
        title: 'Success',
        description: 'Role assigned successfully'
      });
      setIsAssignDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoleForAssignment('');
      fetchData();
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign role',
        variant: 'destructive'
      });
    }
  };

  // Remove role from user
  const handleRemoveRole = async (userId: string, roleId: string) => {
    if (!confirm('Are you sure you want to remove this role from the user?')) return;

    try {
      await removeRoleFromUser(userId, roleId);
      toast({
        title: 'Success',
        description: 'Role removed successfully'
      });
      fetchData();
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove role',
        variant: 'destructive'
      });
    }
  };

  // Group permissions by module
  const groupedPermissions = groupPermissionsByModule(permissions);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Role Management</h2>
          <p className="text-muted-foreground">
            Create and manage custom roles with specific permissions for managers
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Role</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Role Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter role name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter role description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className="space-y-4 mt-2">
                    {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                      <div key={module} className="border rounded-lg p-4">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3 capitalize">
                          {module} Permissions
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {modulePermissions.map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={permission.id}
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                              />
                              <Label htmlFor={permission.id} className="text-sm cursor-pointer">
                                {getPermissionDisplayName(permission)}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateRole} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Creating...' : 'Create Role'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="users">User Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Roles List */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No roles found. Create your first role to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {roles
                .filter(role => !role.name.toLowerCase().includes('super admin'))
                .map((role) => (
              <Card key={role.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{role.name}</h3>
                          <Badge variant={role.is_system_role ? "secondary" : "outline"} className="text-xs">
                            {role.is_system_role ? "System Role" : "Not System Role"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                          <span>{role.permission_count} permissions</span>
                          <span>{role.user_count} users</span>
                          <span>Created: {new Date(role.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewRolePermissions(role)}
                        title="View Permissions"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEditRole(role) && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(role)}
                            title="Edit Role"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRole(role)}
                            title="Delete Role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsAssignDialogOpen(true);
                        }}
                        title="Assign to User"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          {/* Users List */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="h-8 w-8 border-4 border-t-green-600 border-green-200 rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No users found.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {user.primary_role}
                          </Badge>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {user.status}
                          </Badge>
                        </div>
                        {user.assigned_roles && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {user.assigned_roles.split(',').filter(role => role.trim()).map((role, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {role.trim()}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setIsAssignDialogOpen(true);
                        }}
                        title="Assign Role"
                      >
                        <UserPlus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role: {selectedRole?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Role Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter role description"
                rows={3}
              />
            </div>
            <div>
              <Label>Permissions</Label>
              <div className="space-y-4 mt-2">
                {Object.entries(groupedPermissions).map(([module, modulePermissions]) => (
                  <div key={module} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-gray-700 mb-3 capitalize">
                      {module} Permissions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`edit-${permission.id}`}
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                          <Label htmlFor={`edit-${permission.id}`} className="text-sm cursor-pointer">
                            {getPermissionDisplayName(permission)}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditRole} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

             {/* Assign Role Dialog */}
       <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
         <DialogContent className="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle>
               Assign Role to {selectedUser?.full_name || 'User'}
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label>Select Role</Label>
               <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                 {roles
                   .filter(role => !role.name.toLowerCase().includes('super admin'))
                   .map((role) => (
                   <div key={role.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                     <input
                       type="radio"
                       id={`role-${role.id}`}
                       name="selectedRole"
                       value={role.id}
                       checked={selectedRoleForAssignment === role.id}
                       onChange={(e) => setSelectedRoleForAssignment(e.target.value)}
                       className="text-green-600 focus:ring-green-500"
                     />
                     <Label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                       <div className="font-medium">{role.name}</div>
                       <div className="text-sm text-muted-foreground">{role.description}</div>
                     </Label>
                   </div>
                 ))}
               </div>
             </div>
             <div className="flex justify-end space-x-2">
               <Button variant="outline" onClick={() => {
                 setIsAssignDialogOpen(false);
                 setSelectedUser(null);
                 setSelectedRoleForAssignment('');
               }}>
                 Cancel
               </Button>
               <Button onClick={handleAssignRole} disabled={!selectedRoleForAssignment}>
                 <UserPlus className="h-4 w-4 mr-2" />
                 Assign Role
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>

       {/* View Permissions Dialog */}
       <Dialog open={isViewPermissionsDialogOpen} onOpenChange={setIsViewPermissionsDialogOpen}>
         <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>
               Permissions for {selectedRole?.name}
             </DialogTitle>
           </DialogHeader>
           <div className="space-y-4">
             {Object.keys(rolePermissions).length === 0 ? (
               <div className="text-center py-8 text-gray-500">
                 <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                 <p>No permissions assigned to this role.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {Object.entries(rolePermissions).map(([module, modulePermissions]) => (
                   <div key={module} className="border rounded-lg p-4">
                     <h4 className="font-semibold text-sm text-gray-700 mb-3 capitalize">
                       {module} Permissions ({modulePermissions.length})
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                       {modulePermissions.map((permission) => (
                         <div key={permission.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                           <CheckCircle2 className="h-4 w-4 text-green-600" />
                           <span className="text-sm">{getPermissionDisplayName(permission)}</span>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
             )}
             <div className="flex justify-end">
               <Button variant="outline" onClick={() => setIsViewPermissionsDialogOpen(false)}>
                 Close
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
     </div>
   );
 }
