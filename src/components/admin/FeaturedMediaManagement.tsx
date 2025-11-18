'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Save,
  X,
  RefreshCw,
  Globe
} from 'lucide-react';
import { 
  getAdminFeaturedMediaOutlets, 
  createFeaturedMediaOutlet, 
  updateFeaturedMediaOutlet, 
  deleteFeaturedMediaOutlet,
  FeaturedMediaOutlet,
  CreateFeaturedMediaOutlet,
  UpdateFeaturedMediaOutlet
} from '@/services/featuredMediaService';
import { useRole } from "@/contexts/RoleContext";

export default function FeaturedMediaManagement() {
  const { canDelete } = useRole();
  const [mediaOutlets, setMediaOutlets] = useState<FeaturedMediaOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<FeaturedMediaOutlet | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateFeaturedMediaOutlet>({
    name: '',
    logo_url: '',
    alt_text: '',
    display_order: 0,
    is_active: true
  });
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Fetch media outlets
  const fetchMediaOutlets = async () => {
    try {
      setLoading(true);
      const outlets = await getAdminFeaturedMediaOutlets();
      console.log('Fetched media outlets:', outlets); // Debug log
      setMediaOutlets(outlets);
    } catch (error: any) {
      console.error('Error fetching media outlets:', error);
      let errorMessage = 'Failed to fetch featured media outlets';
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view featured media.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Featured media service not found. Please contact support.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMediaOutlets();
  }, []);

  // Handle form input changes
  const handleInputChange = (field: keyof CreateFeaturedMediaOutlet, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update logo preview when logo_url changes
    if (field === 'logo_url') {
      setLogoPreview(value);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      logo_url: '',
      alt_text: '',
      display_order: 0,
      is_active: true
    });
    setLogoPreview('');
    setEditingOutlet(null);
  };

  // Create new media outlet
  const handleCreate = async () => {
    try {
      // Basic validation
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Media outlet name is required',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.logo_url.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Logo URL is required',
          variant: 'destructive'
        });
        return;
      }

      setSaving(true);
      console.log('Creating media outlet with data:', formData);
      const result = await createFeaturedMediaOutlet(formData);
      console.log('Create result:', result);
      
      toast({
        title: 'Success',
        description: 'Featured media outlet created successfully'
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchMediaOutlets();
    } catch (error: any) {
      console.error('Error creating media outlet:', error);
      let errorMessage = 'Failed to create featured media outlet';
      
      // Extract error message from response if available
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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

  // Update media outlet
  const handleUpdate = async () => {
    if (!editingOutlet) return;

    try {
      // Basic validation
      if (!formData.name.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Media outlet name is required',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.logo_url.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Logo URL is required',
          variant: 'destructive'
        });
        return;
      }

      setSaving(true);
      console.log('Updating media outlet with data:', formData);
      await updateFeaturedMediaOutlet(editingOutlet.id, formData);
      console.log('Update completed successfully');
      
      toast({
        title: 'Success',
        description: 'Featured media outlet updated successfully'
      });
      setEditingOutlet(null);
      resetForm();
      fetchMediaOutlets();
    } catch (error: any) {
      console.error('Error updating media outlet:', error);
      let errorMessage = 'Failed to update featured media outlet';
      
      // Extract error message from response if available
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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

  // Delete media outlet
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      console.log('Deleting media outlet with ID:', id);
      await deleteFeaturedMediaOutlet(id);
      console.log('Delete completed successfully');
      
      toast({
        title: 'Success',
        description: 'Featured media outlet deleted successfully'
      });
      fetchMediaOutlets();
    } catch (error: any) {
      console.error('Error deleting media outlet:', error);
      let errorMessage = 'Failed to delete featured media outlet';
      
      // Extract error message from response if available
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  // Edit media outlet
  const handleEdit = (outlet: FeaturedMediaOutlet) => {
    setEditingOutlet(outlet);
    setFormData({
      name: outlet.name,
      logo_url: outlet.logo_url,
      alt_text: outlet.alt_text || '',
      display_order: outlet.display_order,
      is_active: outlet.is_active
    });
    setLogoPreview(outlet.logo_url);
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Featured Media Management</h2>
          <p className="text-muted-foreground">
            Manage media outlets featured on the homepage
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchMediaOutlets}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Media Outlet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Media Outlet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter media outlet name"
                  />
                </div>
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="Enter logo URL"
                  />
                  {logoPreview && (
                    <div className="mt-2">
                      <Label>Preview:</Label>
                      <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center mt-1">
                        <img 
                          src={logoPreview} 
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the URL of the logo image. Supported formats: JPG, PNG, SVG, GIF
                  </p>
                </div>
                <div>
                  <Label htmlFor="alt_text">Alt Text</Label>
                  <Input
                    id="alt_text"
                    value={formData.alt_text}
                    onChange={(e) => handleInputChange('alt_text', e.target.value)}
                    placeholder="Enter alt text for logo"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Display Order</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                    placeholder="Enter display order"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Statistics */}
      {mediaOutlets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Outlets</p>
                  <p className="text-2xl font-bold">{mediaOutlets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-green-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold">{mediaOutlets.filter(o => o.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="h-5 w-5 bg-gray-600 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Inactive</p>
                  <p className="text-2xl font-bold">{mediaOutlets.filter(o => !o.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ArrowUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Highest Order</p>
                  <p className="text-2xl font-bold">{Math.max(...mediaOutlets.map(o => o.display_order))}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Media Outlets List */}
      <div className="space-y-4">
        {mediaOutlets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-400 mb-4">
                <Globe className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Featured Media Outlets</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first media outlet to showcase on the homepage.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Media Outlet
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {mediaOutlets.map((outlet) => (
              <Card key={outlet.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center">
                        <img 
                          src={outlet.logo_url} 
                          alt={outlet.alt_text || outlet.name}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold">{outlet.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Order: {outlet.display_order} | 
                          Status: {outlet.is_active ? 'Active' : 'Inactive'}
                        </p>
                        {outlet.alt_text && (
                          <p className="text-xs text-muted-foreground">Alt: {outlet.alt_text}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Created: {new Date(outlet.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(outlet)}
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {canDelete && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(outlet.id, outlet.name)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingOutlet} onOpenChange={() => setEditingOutlet(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Media Outlet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter media outlet name"
              />
            </div>
            <div>
              <Label htmlFor="edit-logo_url">Logo URL</Label>
              <Input
                id="edit-logo_url"
                value={formData.logo_url}
                onChange={(e) => handleInputChange('logo_url', e.target.value)}
                placeholder="Enter logo URL"
              />
              {logoPreview && (
                <div className="mt-2">
                  <Label>Preview:</Label>
                  <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center mt-1">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Enter the URL of the logo image. Supported formats: JPG, PNG, SVG, GIF
              </p>
            </div>
            <div>
              <Label htmlFor="edit-alt_text">Alt Text</Label>
              <Input
                id="edit-alt_text"
                value={formData.alt_text}
                onChange={(e) => handleInputChange('alt_text', e.target.value)}
                placeholder="Enter alt text for logo"
              />
            </div>
            <div>
              <Label htmlFor="edit-display_order">Display Order</Label>
              <Input
                id="edit-display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => handleInputChange('display_order', parseInt(e.target.value) || 0)}
                placeholder="Enter display order"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="edit-is_active">Active</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setEditingOutlet(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
