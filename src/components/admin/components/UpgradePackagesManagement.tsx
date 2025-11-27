import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Power,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/contexts/RoleContext";
import { useCreateUpgradePackagesMutation, useDeleteUpgradePackagesMutation, useGetAllUpgradePackagesQuery, useUpdateUpgradePackagesMutation } from "@/redux/features/upgradePackages/upgradePackagesApi";

const UpgradePackagesManagement = () => {
  const { toast } = useToast();
  const { canDelete } = useRole();

  // RTK Query hooks
  const {
    data: packagesData,
    isLoading,
    refetch,
  } = useGetAllUpgradePackagesQuery(undefined);
  const [createUpgradePackage] = useCreateUpgradePackagesMutation();
  const [updateUpgradePackage] = useUpdateUpgradePackagesMutation();
  const [deleteUpgradePackage] = useDeleteUpgradePackagesMutation();

  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state - Prisma model অনুযায়ী
  const [formData, setFormData] = useState({
    name: "",
    packageType: "genius" as "genius" | "premium",
    description: "",
    price: "",
    duration: "",
    features: [] as string[],
    is_active: true,
  });
  const [newFeature, setNewFeature] = useState("");

  // Active/Inactive টগল করার ফাংশন
  const handleToggleActive = async (pkg: any) => {
    try {
      const updateData = {
        id: pkg.id,
        data: {
          is_active: !pkg.is_active
        }
      };

      await updateUpgradePackage(updateData).unwrap();

      toast({
        title: "Success",
        description: `Package ${!pkg.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      refetch();
    } catch (error: any) {
      console.error("Toggle active error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update package status",
        variant: "destructive",
      });
    }
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.price || !formData.duration) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const packageData = {
        name: formData.name,
        packageType: formData.packageType,
        description: formData.description,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
        features: formData.features,
        is_active: true,
      };

      await createUpgradePackage(packageData).unwrap();

      toast({
        title: "Success",
        description: "Package created successfully",
      });

      setShowCreateModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Create package error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to create package",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (
      !selectedPackage ||
      !formData.name ||
      !formData.price ||
      !formData.duration
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      const updateData = {
        id: selectedPackage.id,
        data: {
          name: formData.name,
          packageType: formData.packageType,
          description: formData.description,
          price: parseInt(formData.price),
          duration: parseInt(formData.duration),
          features: formData.features,
          is_active: formData.is_active,
        },
      };

      await updateUpgradePackage(updateData).unwrap();

      toast({
        title: "Success",
        description: "Package updated successfully",
      });

      setShowEditModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error("Update package error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update package",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPackage) return;

    try {
      setSubmitting(true);

      await deleteUpgradePackage(selectedPackage.id).unwrap();

      toast({
        title: "Success",
        description: "Package deleted successfully",
      });

      setShowDeleteModal(false);
      setSelectedPackage(null);
      refetch();
    } catch (error: any) {
      console.error("Delete package error:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete package",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      packageType: "genius",
      description: "",
      price: "",
      duration: "",
      features: [],
      is_active: true,
    });
    setNewFeature("");
  };

  const loadPackageForEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      packageType: pkg.packageType,
      description: pkg.description || "",
      price: pkg.price.toString(),
      duration: pkg.duration.toString(),
      features: Array.isArray(pkg.features) ? pkg.features : [],
      is_active: pkg.is_active,
    });
    setShowEditModal(true);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "premium":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Shield className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        );
      case "genius":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Genius
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Extract packages from RTK Query response
  const packages = packagesData?.data || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Upgrade Packages Management
              </CardTitle>
              <CardDescription>
                Create and manage genius and premium upgrade packages
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Package
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading packages...</span>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg: any) => (
                <Card
                  key={pkg.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      {getTypeBadge(pkg.packageType)}
                    </div>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          ৳{pkg.price?.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">
                            {pkg.duration} days
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-700">
                          Features:
                        </div>
                        {Array.isArray(pkg.features) && pkg.features
                          .slice(0, 3)
                          .map((feature: string, index: number) => (
                            <div
                              key={index}
                              className="text-sm text-gray-600 flex items-center gap-1"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        {Array.isArray(pkg.features) && pkg.features.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{pkg.features.length - 3} more features
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Switch 
                            checked={pkg.is_active} 
                            onCheckedChange={() => handleToggleActive(pkg)}
                          />
                          <span className="text-sm text-gray-600">
                            {pkg.is_active ? "Active" : "Inactive"}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPackage(pkg);
                              setShowDeleteModal(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Genius Tutor Package"
                />
              </div>
              <div>
                <Label htmlFor="packageType">Package Type *</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value: "genius" | "premium") =>
                    setFormData((prev) => ({ ...prev, packageType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genius">Genius</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="1000"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
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
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
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
              {submitting ? "Creating..." : "Create Package"}
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-packageType">Package Type *</Label>
                <Select
                  value={formData.packageType}
                  onValueChange={(value: "genius" | "premium") =>
                    setFormData((prev) => ({ ...prev, packageType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genius">Genius</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
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
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-duration">Duration (Days) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
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
                    onKeyPress={(e) => e.key === "Enter" && addFeature()}
                  />
                  <Button type="button" onClick={addFeature} variant="outline">
                    Add
                  </Button>
                </div>
                <div className="space-y-1">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
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
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
              <Label>Active Package</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={submitting}>
              {submitting ? "Updating..." : "Update Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPackage?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <Alert>
            <AlertDescription>
              This package may have active applications. Deleting it will
              prevent new applications but won't affect existing users.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {submitting ? "Deleting..." : "Delete Package"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpgradePackagesManagement;