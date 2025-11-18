'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext.next";
import { taxonomyService, Category, Subject, ClassLevel, TaxonomyData } from "@/services/taxonomyService";
import { API_BASE_URL } from "@/constants/api";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BookOpen, 
  GraduationCap, 
  Users, 
  MoreHorizontal,
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
  Image as ImageIcon
} from "lucide-react";



export default function TaxonomyManagement() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [taxonomyData, setTaxonomyData] = useState<TaxonomyData>({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // Helper function to construct proper image URL
  const getImageUrl = (iconUrl: string | undefined): string | null => {
    if (!iconUrl) return null;
    
    // If it's already a full URL, return as is
    if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
      return iconUrl;
    }
    
    // If it's a relative path, construct the full URL
    // Remove /uploads prefix if it exists since server serves /uploads route
    const cleanPath = iconUrl.startsWith('/uploads/') ? iconUrl.substring(8) : iconUrl;
    
    // Construct URL based on environment
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
      // Production: use the same domain with backend port
      const protocol = window.location.protocol;
      const hostname = window.location.hostname;
      return `${protocol}//${hostname}:5000/uploads/${cleanPath}`;
    } else {
      // Development: use localhost
      return `http://localhost:5000/uploads/${cleanPath}`;
    }
  };

  // Handle image load error
  const handleImageError = (categoryId: number) => {
    setImageErrors(prev => new Set(prev).add(categoryId));
  };
  
  // Dialog states
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddClassLevel, setShowAddClassLevel] = useState(false);
  
  // Form states
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    icon_url: '',
    subjects: [],
    classLevels: []
  });
  const [newCategoryIcon, setNewCategoryIcon] = useState<File | null>(null);
  const [editingCategoryIcon, setEditingCategoryIcon] = useState<File | null>(null);
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newSubject, setNewSubject] = useState({ name: '' });
  const [newClassLevel, setNewClassLevel] = useState({ name: '' });
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories based on search query
  const filteredCategories = taxonomyData.categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch taxonomy data
  const fetchTaxonomyData = async () => {
    try {
      setLoading(true);
      const data = await taxonomyService.getTaxonomyData();
      setTaxonomyData(data);
      // Clear image errors when refreshing data
      setImageErrors(new Set());
    } catch (error) {
      console.error('Error fetching taxonomy data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load taxonomy data',
        variant: 'destructive'
      });
      // Initialize with empty structure on error
      setTaxonomyData({ categories: [] });
    } finally {
      setLoading(false);
    }
  };

  // Save taxonomy data
  const saveTaxonomyData = async () => {
    try {
      setSaving(true);
      await taxonomyService.updateTaxonomy(taxonomyData);
      toast({
        title: 'Success',
        description: 'Taxonomy data saved successfully',
      });
    } catch (error) {
      console.error('Error saving taxonomy data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save taxonomy data',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Add new category
  const handleAddCategory = async () => {
    if (!newCategory.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const createdCategory = await taxonomyService.createCategory(
        newCategory.name.trim(),
        newCategory.description?.trim() || '',
        newCategoryIcon
      );

      // Refresh the data to get the complete structure
      await fetchTaxonomyData();

      setNewCategory({ name: '', description: '', subjects: [], classLevels: [] });
      setNewCategoryIcon(null);
      setShowAddCategory(false);
      
      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add category',
        variant: 'destructive'
      });
    }
  };

  // Edit category
  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await taxonomyService.updateCategory(
        editingCategory.id,
        editingCategory.name.trim(),
        editingCategory.description?.trim() || '',
        editingCategoryIcon
      );

      // Refresh the data to get the complete structure
      await fetchTaxonomyData();

      setEditingCategory(null);
      setShowEditCategory(false);
      
      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update category',
        variant: 'destructive'
      });
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
    const category = taxonomyData.categories.find(cat => cat.id === categoryId);
    if (!category) return;

    if (confirm(`Are you sure you want to delete the category "${category.name}"? This will also delete all associated subjects and class levels.`)) {
      try {
        await taxonomyService.deleteCategory(categoryId);
        
        // Refresh the data to get the complete structure
        await fetchTaxonomyData();
        
        toast({
          title: 'Success',
          description: 'Category deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete category',
          variant: 'destructive'
        });
      }
    }
  };

  // Add subject to category
  const handleAddSubject = async () => {
    if (!selectedCategoryId || !newSubject.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Subject name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await taxonomyService.createSubject(selectedCategoryId, newSubject.name.trim());

      // Refresh the data to get the complete structure
      await fetchTaxonomyData();

      setNewSubject({ name: '' });
      setShowAddSubject(false);
      
      toast({
        title: 'Success',
        description: 'Subject added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add subject',
        variant: 'destructive'
      });
    }
  };

  // Add class level to category
  const handleAddClassLevel = async () => {
    if (!selectedCategoryId || !newClassLevel.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Class level name is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      await taxonomyService.createClassLevel(selectedCategoryId, newClassLevel.name.trim());

      // Refresh the data to get the complete structure
      await fetchTaxonomyData();

      setNewClassLevel({ name: '' });
      setShowAddClassLevel(false);
      
      toast({
        title: 'Success',
        description: 'Class level added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add class level',
        variant: 'destructive'
      });
    }
  };

  // Delete subject
  const handleDeleteSubject = async (categoryId: number, subjectId: number) => {
    const category = taxonomyData.categories.find(cat => cat.id === categoryId);
    const subject = category?.subjects.find(sub => sub.id === subjectId);
    if (!category || !subject) return;

    if (confirm(`Are you sure you want to delete the subject "${subject.name}" from "${category.name}"?`)) {
      try {
        await taxonomyService.deleteSubject(subjectId);
        
        // Refresh the data to get the complete structure
        await fetchTaxonomyData();
        
        toast({
          title: 'Success',
          description: 'Subject deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete subject',
          variant: 'destructive'
        });
      }
    }
  };

  // Delete class level
  const handleDeleteClassLevel = async (categoryId: number, classLevelId: number) => {
    const category = taxonomyData.categories.find(cat => cat.id === categoryId);
    const classLevel = category?.classLevels.find(level => level.id === classLevelId);
    if (!category || !classLevel) return;

    if (confirm(`Are you sure you want to delete the class level "${classLevel.name}" from "${category.name}"?`)) {
      try {
        await taxonomyService.deleteClassLevel(classLevelId);
        
        // Refresh the data to get the complete structure
        await fetchTaxonomyData();
        
        toast({
          title: 'Success',
          description: 'Class level deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete class level',
          variant: 'destructive'
        });
      }
    }
  };

  useEffect(() => {
    if (user) {
      fetchTaxonomyData();
    }
  }, [user]);



  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Authentication Required</h3>
          <p className="text-muted-foreground">Please log in to access category management.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading category data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Category Management</h2>
        <p className="text-muted-foreground">
          Manage tuition categories, subjects, and class levels
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{taxonomyData.categories.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-bold">
                  {taxonomyData.categories.reduce((total, cat) => total + cat.subjects.length, 0)}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Class Levels</p>
                <p className="text-2xl font-bold">
                  {taxonomyData.categories.reduce((total, cat) => total + cat.classLevels.length, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtered Results</p>
                <p className="text-2xl font-bold">{filteredCategories.length}</p>
              </div>
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Save */}
      <div className="flex justify-between items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Button 
          onClick={saveTaxonomyData} 
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Categories
              </CardTitle>
              <CardDescription>
                Manage tuition categories and their associated subjects and class levels
              </CardDescription>
            </div>
            <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                  <DialogDescription>
                    Create a new tuition category with subjects and class levels
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Category Name</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Bangla Version"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea
                      id="category-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-icon">Category Icon</Label>
                    <Input
                      id="category-icon"
                      type="file"
                      onChange={(e) => setNewCategoryIcon(e.target.files ? e.target.files[0] : null)}
                      accept="image/*"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddCategory(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Add Category
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                        {category.icon_url && !imageErrors.has(category.id) ? (
                          <img 
                            src={getImageUrl(category.icon_url) || ''} 
                            alt={category.name} 
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(category.id)}
                            onLoad={() => {
                              // Remove from error set if image loads successfully
                              setImageErrors(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(category.id);
                                return newSet;
                              });
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription>{category.description}</CardDescription>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => {
                          setEditingCategory(category);
                          setShowEditCategory(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="subjects" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="subjects" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Subjects ({category.subjects.length})
                      </TabsTrigger>
                      <TabsTrigger value="classLevels" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Class Levels ({category.classLevels.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="subjects" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Subjects</h4>
                        <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedCategoryId(category.id)}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add Subject
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Subject to {category.name}</DialogTitle>
                            </DialogHeader>
                            <div>
                              <Label htmlFor="subject-name">Subject Name</Label>
                              <Input
                                id="subject-name"
                                value={newSubject.name}
                                onChange={(e) => setNewSubject({ name: e.target.value })}
                                placeholder="e.g., Mathematics"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddSubject(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddSubject}>
                                Add Subject
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {category.subjects.map((subject) => (
                          <Badge 
                            key={subject.id} 
                            variant="secondary"
                            className="flex items-center justify-between p-2"
                          >
                            <span>{subject.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSubject(category.id, subject.id)}
                              className="h-4 w-4 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {category.subjects.length === 0 && (
                          <p className="text-muted-foreground text-sm col-span-full">
                            No subjects added yet
                          </p>
                        )}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="classLevels" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Class Levels</h4>
                        <Dialog open={showAddClassLevel} onOpenChange={setShowAddClassLevel}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedCategoryId(category.id)}
                              className="flex items-center gap-2"
                            >
                              <Plus className="h-4 w-4" />
                              Add Class Level
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Class Level to {category.name}</DialogTitle>
                            </DialogHeader>
                            <div>
                              <Label htmlFor="class-level-name">Class Level Name</Label>
                              <Input
                                id="class-level-name"
                                value={newClassLevel.name}
                                onChange={(e) => setNewClassLevel({ name: e.target.value })}
                                placeholder="e.g., Class 1"
                              />
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setShowAddClassLevel(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleAddClassLevel}>
                                Add Class Level
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {category.classLevels.map((classLevel) => (
                          <Badge 
                            key={classLevel.id} 
                            variant="secondary"
                            className="flex items-center justify-between p-2"
                          >
                            <span>{classLevel.name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteClassLevel(category.id, classLevel.id)}
                              className="h-4 w-4 p-0 ml-2"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                        {category.classLevels.length === 0 && (
                          <p className="text-muted-foreground text-sm col-span-full">
                            No class levels added yet
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ))}
            
            {filteredCategories.length === 0 && (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery ? 'No categories found' : 'No categories yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try adjusting your search terms' 
                    : 'Start by adding your first tuition category'
                  }
                </p>
                <Button onClick={() => setShowAddCategory(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Category
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={showEditCategory} onOpenChange={setShowEditCategory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-category-description">Description</Label>
                <Textarea
                  id="edit-category-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-category-icon">Category Icon</Label>
                <Input
                  id="edit-category-icon"
                  type="file"
                  onChange={(e) => setEditingCategoryIcon(e.target.files ? e.target.files[0] : null)}
                  accept="image/*"
                />
                {editingCategory.icon_url && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-2">Current icon:</p>
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={getImageUrl(editingCategory.icon_url) || ''} 
                        alt={editingCategory.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCategory(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCategory}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
