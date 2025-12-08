// TestimonialsManagement.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Quote,
  Plus,
  Edit,
  Trash2,
  Star,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import {
  useCreateTestimonialMutation,
  useDeleteTestimonialMutation,
  useGetAllTestimonialForAdminQuery,
  useGetAllTestimonialQuery,
  useUpdateTestimonialMutation,
} from "@/redux/features/testimonials/testimonialApi";
import { useAuth } from "@/contexts/AuthContext.next";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  testimonial: string;
  isActive: boolean;
  rating: number;
  tutor_id?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export const TestimonialsManagement = () => {
  const { canDelete } = useRole();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // RTK Query hooks
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllTestimonialForAdminQuery(userId);
  const [createTestimonial] = useCreateTestimonialMutation();
  const [updateTestimonial] = useUpdateTestimonialMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();

  // Extract the actual testimonials data from the API response
  const testimonials = apiResponse?.data || [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] =
    useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "",
    avatar: "",
    testimonial: "",
    rating: 5,
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      location: "",
      avatar: "",
      testimonial: "",
      rating: 5,
      isActive: true,
    });
    setEditingTestimonial(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.role ||
      !formData.location ||
      !formData.testimonial
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingTestimonial) {
        await updateTestimonial({
          id: editingTestimonial.id,
          data: formData,
        }).unwrap();
        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        });
      } else {
        // Create testimonial with user ID if available
        const testimonialData = {
          ...formData,
          userId: user?.id || null,
        };

        await createTestimonial(testimonialData).unwrap();
        toast({
          title: "Success",
          description: "Testimonial created successfully",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      refetch(); // Refetch the data after successful operation
    } catch (error: any) {
      console.error("Error saving testimonial:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to save testimonial",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      location: testimonial.location,
      avatar: testimonial.avatar || "",
      testimonial: testimonial.testimonial,
      rating: testimonial.rating || 5,
      isActive: testimonial.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTestimonial) return;

    try {
      await deleteTestimonial(deletingTestimonial.id).unwrap();
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      setDeletingTestimonial(null);
      refetch(); // Refetch the data after deletion
    } catch (error: any) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (testimonial: Testimonial) => {
    try {
      const updatedData = {
        name: testimonial.name,
        role: testimonial.role,
        location: testimonial.location,
        avatar: testimonial.avatar,
        testimonial: testimonial.testimonial,
        rating: testimonial.rating,
        isActive: !testimonial.isActive,
      };

      await updateTestimonial({
        id: testimonial.id,
        data: updatedData,
      }).unwrap();

      toast({
        title: "Success",
        description: `Testimonial ${
          !testimonial.isActive ? "activated" : "deactivated"
        } successfully`,
      });
      refetch(); // Refetch the data after status change
    } catch (error: any) {
      console.error("Error toggling testimonial status:", error);
      toast({
        title: "Error",
        description:
          error?.data?.message || "Failed to update testimonial status",
        variant: "destructive",
      });
    }
  };

  const handleNewTestimonial = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading testimonials
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Testimonials Management
          </h2>
          <p className="text-gray-600">
            Manage student and parent testimonials
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={handleNewTestimonial}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial
                  ? "Edit Testimonial"
                  : "Add New Testimonial"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="font-medium">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="font-medium">
                    Role *
                  </Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    placeholder="e.g., HSC Student, Parent"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="font-medium">
                  Location *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Dhanmondi, Dhaka"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="avatar" className="font-medium">
                  Avatar URL
                </Label>
                <Input
                  id="avatar"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  placeholder="https://example.com/avatar.jpg"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for default avatar
                </p>
              </div>

              <div>
                <Label htmlFor="testimonial" className="font-medium">
                  Testimonial *
                </Label>
                <Textarea
                  id="testimonial"
                  value={formData.testimonial}
                  onChange={(e) =>
                    setFormData({ ...formData, testimonial: e.target.value })
                  }
                  placeholder="Enter the testimonial text"
                  rows={4}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating" className="font-medium">
                    Rating (1-5)
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rating: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-20"
                    />
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < formData.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <div>
                    <Label htmlFor="isActive" className="font-medium">
                      Status
                    </Label>
                    <p className="text-sm text-gray-500">
                      {formData.isActive
                        ? "Active (will be shown)"
                        : "Inactive (hidden from website)"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {saving
                    ? "Saving..."
                    : editingTestimonial
                    ? "Update Testimonial"
                    : "Create Testimonial"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Testimonials
                </p>
                <p className="text-2xl font-bold">{testimonials.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Quote className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {testimonials.filter((t: any) => t.isActive).length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">
                  {testimonials.filter((t: any) => !t.isActive).length}
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <XCircle className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {testimonials.length > 0
                    ? (
                        testimonials.reduce(
                          (acc: any, t: any) => acc + (t.rating || 0),
                          0
                        ) / testimonials.length
                      ).toFixed(1)
                    : "0.0"}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600 fill-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial: Testimonial) => (
          <Card
            key={testimonial.id}
            className="relative hover:shadow-lg transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-14 w-14 border-2 border-white shadow">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          testimonial.name
                        )}&background=10b981&color=fff&size=128`;
                      }}
                    />
                    <AvatarFallback className="bg-green-600 text-white">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {testimonial.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">
                      {testimonial.location}
                    </p>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (testimonial.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="ml-1 text-xs text-gray-500">
                        ({testimonial.rating || 0})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge
                    variant={testimonial.isActive ? "default" : "secondary"}
                    className={
                      testimonial.isActive
                        ? "bg-green-100 text-green-800 hover:bg-green-100"
                        : ""
                    }
                  >
                    {testimonial.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleStatus(testimonial)}
                    className="h-7 px-2 text-xs"
                  >
                    {testimonial.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Quote className="absolute -top-2 -left-2 h-5 w-5 text-green-200" />
                <blockquote className="text-sm text-gray-700 italic pl-4">
                  "{testimonial.testimonial}"
                </blockquote>
              </div>

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-xs text-gray-500">
                  Added:{" "}
                  {new Date(testimonial.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(testimonial)}
                    className="h-8"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8"
                        onClick={() => setDeletingTestimonial(testimonial)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Testimonial</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the testimonial from{" "}
                          <span className="font-semibold">
                            "{testimonial.name}"
                          </span>
                          ? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setDeletingTestimonial(null)}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {testimonials.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
          <Quote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No testimonials yet
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start by adding your first testimonial to showcase student success
            stories
          </p>
          <Button
            onClick={handleNewTestimonial}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add First Testimonial
          </Button>
        </div>
      )}
    </div>
  );
};
