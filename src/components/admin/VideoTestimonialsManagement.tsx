// VideoTestimonialsManagement.tsx
"use client";

import { useState, useEffect } from "react";
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
  Play,
  Plus,
  Edit,
  Trash2,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Video,
  Youtube,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";
import {
  useCreateVideoTestimonialMutation,
  useDeleteVideoTestimonialMutation,
  useGetAllVideoTestimonialForAdminQuery,
  useUpdateVideoTestimonialMutation,
} from "@/redux/features/videoTestimonail/videoTestimonailApi";
import { useAuth } from "@/contexts/AuthContext.next";

interface VideoTestimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  videoUrl: string;
  thumbnail?: string;
  duration: string;
  testimonial: string;
  isActive: boolean;
  rating: number;
  tutor_id?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// YouTube URL parser function
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  
  // Check if already an embed URL
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }
  
  // If no pattern matches, return the original URL
  return url;
};

// Get YouTube thumbnail URL
const getYouTubeThumbnail = (url: string): string => {
  const embedUrl = getYouTubeEmbedUrl(url);
  const videoIdMatch = embedUrl.match(/embed\/([a-zA-Z0-9_-]+)/);
  
  if (videoIdMatch && videoIdMatch[1]) {
    return `https://img.youtube.com/vi/${videoIdMatch[1]}/hqdefault.jpg`;
  }
  
  return '';
};

// Check if URL is YouTube
const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

export const VideoTestimonialsManagement = () => {
  const { canDelete } = useRole();
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id;

  // RTK Query hooks
  const { data: apiResponse, isLoading, error, refetch } = useGetAllVideoTestimonialForAdminQuery(userId);
  
  // Extract the actual video testimonials data from the API response
  const videoTestimonials = apiResponse?.data || [];

  // RTK Mutations
  const [createVideoTestimonial] = useCreateVideoTestimonialMutation();
  const [updateVideoTestimonial] = useUpdateVideoTestimonialMutation();
  const [deleteVideoTestimonial] = useDeleteVideoTestimonialMutation();

  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<VideoTestimonial | null>(null);
  const [deletingTestimonial, setDeletingTestimonial] = useState<VideoTestimonial | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoTestimonial | null>(null);
  const [saving, setSaving] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    location: "",
    avatar: "",
    videoUrl: "",
    thumbnail: "",
    duration: "0:00",
    testimonial: "",
    rating: 5,
    isActive: true,
  });

  // Handle YouTube URL input and auto-generate thumbnail
  const handleVideoUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      videoUrl: url
    }));
    
    // Auto-generate YouTube thumbnail if YouTube URL
    if (isYouTubeUrl(url)) {
      const thumbnailUrl = getYouTubeThumbnail(url);
      if (thumbnailUrl) {
        setFormData(prev => ({
          ...prev,
          thumbnail: thumbnailUrl
        }));
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      location: "",
      avatar: "",
      videoUrl: "",
      thumbnail: "",
      duration: "0:00",
      testimonial: "",
      rating: 5,
      isActive: true,
    });
    setEditingTestimonial(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.role || !formData.location || !formData.videoUrl || !formData.testimonial) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (*)",
        variant: "destructive",
      });
      return;
    }

    // Validate YouTube URL format
    if (isYouTubeUrl(formData.videoUrl)) {
      const embedUrl = getYouTubeEmbedUrl(formData.videoUrl);
      if (!embedUrl.includes('youtube.com/embed/')) {
        toast({
          title: "Invalid YouTube URL",
          description: "Please provide a valid YouTube video URL (watch URL or embed URL)",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setSaving(true);

      // Prepare data for submission
      const submitData = {
        ...formData,
        videoUrl: isYouTubeUrl(formData.videoUrl) ? getYouTubeEmbedUrl(formData.videoUrl) : formData.videoUrl,
        userId: user?.id || null,
      };

      if (editingTestimonial) {
        // Update existing testimonial
        await updateVideoTestimonial({
          id: editingTestimonial.id,
          data: submitData
        }).unwrap();
        toast({
          title: "Success",
          description: "Video testimonial updated successfully",
        });
      } else {
        // Create new testimonial
        await createVideoTestimonial(submitData).unwrap();
        toast({
          title: "Success",
          description: "Video testimonial created successfully",
        });
      }

      // Close dialog and reset
      setIsDialogOpen(false);
      resetForm();
      refetch(); // Refresh data
    } catch (error: any) {
      console.error("Error saving video testimonial:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to save video testimonial",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Edit testimonial
  const handleEdit = (testimonial: VideoTestimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      location: testimonial.location,
      avatar: testimonial.avatar || "",
      videoUrl: testimonial.videoUrl,
      thumbnail: testimonial.thumbnail || "",
      duration: testimonial.duration || "0:00",
      testimonial: testimonial.testimonial,
      rating: testimonial.rating || 5,
      isActive: testimonial.isActive,
    });
    setIsDialogOpen(true);
  };

  // Delete testimonial
  const handleDelete = async () => {
    if (!deletingTestimonial) return;

    try {
      await deleteVideoTestimonial(deletingTestimonial.id).unwrap();
      toast({
        title: "Success",
        description: "Video testimonial deleted successfully",
      });
      setDeletingTestimonial(null);
      refetch(); // Refresh data
    } catch (error: any) {
      console.error("Error deleting video testimonial:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to delete video testimonial",
        variant: "destructive",
      });
    }
  };

  // Toggle status (Active/Inactive)
  const handleToggleStatus = async (testimonial: VideoTestimonial) => {
    try {
      const updatedData = {
        name: testimonial.name,
        role: testimonial.role,
        location: testimonial.location,
        avatar: testimonial.avatar,
        videoUrl: testimonial.videoUrl,
        thumbnail: testimonial.thumbnail,
        duration: testimonial.duration,
        testimonial: testimonial.testimonial,
        rating: testimonial.rating,
        isActive: !testimonial.isActive
      };
      
      await updateVideoTestimonial({
        id: testimonial.id,
        data: updatedData
      }).unwrap();
      
      toast({
        title: "Success",
        description: `Video testimonial ${!testimonial.isActive ? 'activated' : 'deactivated'} successfully`,
      });
      refetch(); // Refresh data
    } catch (error: any) {
      console.error("Error toggling video testimonial status:", error);
      toast({
        title: "Error",
        description: error?.data?.message || "Failed to update testimonial status",
        variant: "destructive",
      });
    }
  };

  // Open new testimonial dialog
  const handleNewVideoTestimonial = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Handle video playback
  const handlePlayVideo = (testimonial: VideoTestimonial) => {
    setSelectedVideo(testimonial);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  // Handle escape key to close video modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedVideo) {
        closeVideo();
      }
    };

    if (selectedVideo) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [selectedVideo]);

  // Loading state
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

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading video testimonials
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Video Testimonials Management
            </h2>
            <p className="text-gray-600">
              Manage student and parent video testimonials
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleNewVideoTestimonial}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Video Testimonial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTestimonial
                    ? "Edit Video Testimonial"
                    : "Add New Video Testimonial"}
                </DialogTitle>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  className="absolute right-4 top-4"
                  variant="ghost"
                  size="icon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="font-medium">Name *</Label>
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
                    <Label htmlFor="role" className="font-medium">Role *</Label>
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
                  <Label htmlFor="location" className="font-medium">Location *</Label>
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
                  <Label htmlFor="avatar" className="font-medium">Avatar URL</Label>
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
                  <Label htmlFor="videoUrl" className="font-medium">Video URL *</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Youtube className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID"
                      required
                      className="flex-1"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs font-medium text-gray-700">Examples:</span>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      https://www.youtube.com/watch?v=dQw4w9WgXcQ
                    </code>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      https://youtu.be/dQw4w9WgXcQ
                    </code>
                  </div>
                  {isYouTubeUrl(formData.videoUrl) && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Valid YouTube URL detected. Thumbnail will be auto-generated.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thumbnail" className="font-medium">Thumbnail URL</Label>
                    <Input
                      id="thumbnail"
                      value={formData.thumbnail}
                      onChange={(e) =>
                        setFormData({ ...formData, thumbnail: e.target.value })
                      }
                      placeholder="https://img.youtube.com/vi/VIDEO_ID/hqdefault.jpg"
                      className="mt-1"
                    />
                    {formData.thumbnail && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Preview:</p>
                        <img 
                          src={formData.thumbnail} 
                          alt="Thumbnail preview" 
                          className="w-32 h-20 object-cover rounded border"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="duration" className="font-medium">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                      placeholder="e.g., 2:45"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="testimonial" className="font-medium">Testimonial *</Label>
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
                    <Label htmlFor="rating" className="font-medium">Rating (1-5)</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 1 })}
                        className="w-20"
                      />
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-5 w-5 ${i < formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
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
                      <Label htmlFor="isActive" className="font-medium">Status</Label>
                      <p className="text-sm text-gray-500">
                        {formData.isActive ? 'Active (will be shown)' : 'Inactive (hidden from website)'}
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
                    {saving ? 'Saving...' : (editingTestimonial ? 'Update Testimonial' : 'Create Testimonial')}
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
                  <p className="text-sm font-medium text-gray-600">Total Videos</p>
                  <p className="text-2xl font-bold">{videoTestimonials.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Video className="h-6 w-6 text-blue-600" />
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
                    {videoTestimonials.filter((t:any) => t.isActive).length}
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
                    {videoTestimonials.filter((t:any) => !t.isActive).length}
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
                  <p className="text-sm font-medium text-gray-600">YouTube Videos</p>
                  <p className="text-2xl font-bold">
                    {videoTestimonials.filter((t:any) => isYouTubeUrl(t.videoUrl)).length}
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <Youtube className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoTestimonials.map((testimonial: VideoTestimonial) => {
            const isYouTube = isYouTubeUrl(testimonial.videoUrl);
            const thumbnailUrl = testimonial.thumbnail || 
              (isYouTube ? getYouTubeThumbnail(testimonial.videoUrl) : '');
            const embedUrl = isYouTube ? getYouTubeEmbedUrl(testimonial.videoUrl) : testimonial.videoUrl;
            
            return (
              <Card key={testimonial.id} className="relative hover:shadow-lg transition-shadow">
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
                            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(testimonial.name)}&background=10b981&color=fff&size=128`;
                          }}
                        />
                        <AvatarFallback className="bg-green-600 text-white">
                          {testimonial.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <p className="text-sm text-gray-600">{testimonial.role}</p>
                        <p className="text-xs text-gray-500">{testimonial.location}</p>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < (testimonial.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-500">({testimonial.rating || 0})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        variant={testimonial.isActive ? "default" : "secondary"}
                        className={testimonial.isActive ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                      >
                        {testimonial.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {isYouTube && (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          <Youtube className="h-3 w-3 mr-1" />
                          YouTube
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden group cursor-pointer"
                       onClick={() => handlePlayVideo(testimonial)}>
                    {thumbnailUrl ? (
                      <img 
                        src={thumbnailUrl} 
                        alt={`${testimonial.name}'s video testimonial`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
                              ${isYouTube ? 
                                '<svg class="h-16 w-16 text-red-600 mb-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>' : 
                                '<svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>'
                              }
                              <p class="text-white text-sm">${isYouTube ? 'YouTube Video' : 'Video'}</p>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center">
                        {isYouTube ? (
                          <Youtube className="h-16 w-16 text-red-600 mb-2" />
                        ) : (
                          <Video className="h-16 w-16 text-gray-400" />
                        )}
                        <p className="text-white text-sm">{isYouTube ? 'YouTube Video' : 'Video'}</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-green-600 bg-opacity-90 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    {testimonial.duration && testimonial.duration !== '0:00' && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {testimonial.duration}
                      </div>
                    )}
                  </div>

                  <blockquote className="text-sm text-gray-700 italic border-l-4 border-green-500 pl-4 py-1">
                    "{testimonial.testimonial.length > 120
                      ? `${testimonial.testimonial.substring(0, 120)}...`
                      : testimonial.testimonial}"
                  </blockquote>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="text-xs text-gray-500">
                      Added: {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(testimonial)}
                        className="h-8 text-xs"
                      >
                        {testimonial.isActive ? 'Deactivate' : 'Activate'}
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
                            <AlertDialogTitle>Delete Video Testimonial</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the video testimonial from <span className="font-semibold">"{testimonial.name}"</span>? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setDeletingTestimonial(null)}>
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
            );
          })}
        </div>

        {/* Empty State */}
        {videoTestimonials.length === 0 && (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-lg">
            <Video className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No video testimonials yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by adding your first video testimonial to showcase student success stories
            </p>
            <Button onClick={handleNewVideoTestimonial} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-5 w-5 mr-2" />
              Add First Video Testimonial
            </Button>
          </div>
        )}
      </div>

      {/* Video Player Modal with Close (X) Button */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            {/* Close Button - Fixed at Top Right */}
            <Button
              onClick={closeVideo}
              className="absolute -top-12 right-0 z-50 bg-white hover:bg-gray-100 text-black rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Close Button - Inside Video Container (Alternative) */}
            <Button
              onClick={closeVideo}
              className="absolute top-4 right-4 z-50 bg-black bg-opacity-70 hover:bg-opacity-90 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
              size="icon"
            >
              <X className="h-5 w-5" />
            </Button>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
              {isYouTubeUrl(selectedVideo.videoUrl) ? (
                <iframe
                  src={getYouTubeEmbedUrl(selectedVideo.videoUrl)}
                  title={`${selectedVideo.name}'s video testimonial`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : (
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  className="w-full h-full"
                  poster={selectedVideo.thumbnail}
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
            
            {/* Close Button at Bottom */}
            <div className="mt-6 flex justify-center">
              <Button
                onClick={closeVideo}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Close Video
              </Button>
            </div>

            <div className="mt-6 p-6 bg-gray-900 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedVideo.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-gray-300">
                    <span>{selectedVideo.role}</span>
                    <span>•</span>
                    <span>{selectedVideo.location}</span>
                    <span>•</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < (selectedVideo.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <Button
                  onClick={closeVideo}
                  className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  size="sm"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
              <p className="mt-4 text-gray-300 italic border-l-4 border-green-500 pl-4 py-2">
                "{selectedVideo.testimonial}"
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p>Added: {new Date(selectedVideo.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="mt-1">Duration: {selectedVideo.duration}</p>
              </div>
            </div>
          </div>

          {/* Click Outside to Close */}
          <div 
            className="absolute inset-0 -z-10 cursor-pointer" 
            onClick={closeVideo}
            aria-label="Close video modal"
          />
        </div>
      )}
    </>
  );
};