import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  Shield, 
  CheckCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Settings,
  DollarSign,
  Calendar,
  List
} from 'lucide-react';
import { 
  getUpgradePackages,
  createUpgradePackage,
  updateUpgradePackage,
  deleteUpgradePackage,
  type UpgradePackage
} from '@/services/upgradeService';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useRole } from "@/contexts/RoleContext";

const UpgradePackagesManagement = () => {
  const { toast } = useToast();
  const { canDelete } = useRole();
  const [packages, setPackages] = useState<UpgradePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<UpgradePackage | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Helper function to parse features
  const parseFeatures = (features: any): string[] => {
    if (!features) {
      return [];
    }
    if (Array.isArray(features)) {
      return features.filter(feature => typeof feature === 'string');
    }
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features || '[]');
        return Array.isArray(parsed) ? parsed.filter(feature => typeof feature === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  };
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'genius' as 'genius' | 'verified',
    description: '',
    price: '',
    duration_days: '',
    features: [] as string[],
    is_active: true
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await getUpgradePackages();
      
      if (response.success) {
        setPackages(response.data);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch packages',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.duration_days) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await createUpgradePackage({
        name: formData.name,
        type: formData.type === 'genius' ? 'premium' : formData.type,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        features: formData.features
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Package created successfully',
        });
        setShowCreateModal(false);
        resetForm();
        fetchPackages();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create package',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedPackage || !formData.name || !formData.price || !formData.duration_days) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await updateUpgradePackage(selectedPackage.id, {
        name: formData.name,
        type: formData.type === 'genius' ? 'premium' : formData.type,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_days: parseInt(formData.duration_days),
        features: formData.features,
        is_active: formData.is_active
      });

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Package updated successfully',
        });
        setShowEditModal(false);
        resetForm();
        fetchPackages();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update package',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    console.log('handleDelete called with selectedPackage:', selectedPackage);
    if (!selectedPackage) {
      console.log('No selectedPackage, returning early');
      return;
    }

    try {
      console.log('Starting delete process for package:', selectedPackage.id);
      setSubmitting(true);
      const response = await deleteUpgradePackage(selectedPackage.id);
      console.log('Delete response:', response);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Package deleted successfully',
        });
        setShowDeleteModal(false);
        setSelectedPackage(null);
        fetchPackages();
      } else {
        throw new Error(response.message || 'Failed to delete package');
      }
    } catch (error: any) {
      console.error('Delete package error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete package',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'genius',
      description: '',
      price: '',
      duration_days: '',
      features: [],
      is_active: true
    });
    setNewFeature('');
  };

  const loadPackageForEdit = (pkg: UpgradePackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      type: pkg.type === 'premium' ? 'genius' : pkg.type,
      description: pkg.description,
      price: pkg.price.toString(),
      duration_days: pkg.duration_days.toString(),
      features: parseFeatures(pkg.features),
      is_active: pkg.is_active
    });
    setShowEditModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">
          <Shield className="h-3 w-3 mr-1" />
          Genius
        </Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Verified
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Upgrade Packages Management
              </CardTitle>
              <CardDescription>
                Create and manage genius and verified upgrade packages
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading packages...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {getTypeBadge(pkg.type)}
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          ৳{pkg.price.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{pkg.duration_days} days</span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-700">Features:</div>
                        {(() => {
                          const features = parseFeatures(pkg.features);
                          return Array.isArray(features) ? features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="text-sm text-gray-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          )) : [];
                        })()}
                        {(() => {
                          const features = parseFeatures(pkg.features);
                          return Array.isArray(features) && features.length > 3 ? (
                            <div className="text-xs text-gray-500">
                              +{features.length - 3} more features
                            </div>
                          ) : null;
                        })()}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Switch checked={pkg.is_active} disabled />
                          <span className="text-sm text-gray-600">
                            {pkg.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadPackageForEdit(pkg)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          {canDelete && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Delete button clicked for package:', pkg.id, pkg.name);
                                setSelectedPackage(pkg);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {packages.length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No packages found. Create your first package to get started.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Package Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Package</DialogTitle>
            <DialogDescription>
              Create a new upgrade package for tutors
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="name">Package Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Genius Tutor Package"
                />
              </div>
              <div>
                <Label htmlFor="type">Package Type *</Label>
                <Select value={formData.type} onValueChange={(value: 'genius' | 'verified') => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genius">Genius</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the package benefits..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="price">Price (BDT) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                  placeholder="365"
                />
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Package Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription>
              Update package information and features
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-name">Package Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Genius Tutor Package"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Package Type *</Label>
                <Select value={formData.type} onValueChange={(value: 'genius' | 'verified') => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genius">Genius</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the package benefits..."
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-price">Price (BDT) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (Days) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration_days}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration_days: e.target.value }))}
                  placeholder="365"
                />
              </div>
            </div>

            <div>
              <Label>Features</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Add a feature..."
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{feature}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label>Active Package</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={(open) => {
        console.log('Delete modal state changed:', open);
        setShowDeleteModal(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <Alert>
            <AlertDescription>
              This package may have active applications. Deleting it will prevent new applications but won't affect existing users.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                console.log('Delete confirmation button clicked for package:', selectedPackage?.id, selectedPackage?.name);
                handleDelete();
              }}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? 'Deleting...' : 'Delete Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpgradePackagesManagement;
