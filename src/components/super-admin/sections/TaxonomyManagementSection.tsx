'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  RefreshCw, 
  BookOpen,
  GraduationCap,
  Users
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';

interface TaxonomySubject {
  id: number;
  name: string;
}

interface TaxonomyClassLevel {
  id: number;
  name: string;
}

interface TaxonomyCategory {
  id: number;
  name: string;
  description: string;
  subjects: TaxonomySubject[];
  classLevels: TaxonomyClassLevel[];
}

interface TaxonomyData {
  categories: TaxonomyCategory[];
}

export default function TaxonomyManagementSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [taxonomy, setTaxonomy] = useState<TaxonomyData>({ categories: [] });
  const [editingCategory, setEditingCategory] = useState<TaxonomyCategory | null>(null);
  const [editingSubject, setEditingSubject] = useState<{ categoryId: number; subject: TaxonomySubject } | null>(null);
  const [editingClassLevel, setEditingClassLevel] = useState<{ categoryId: number; classLevel: TaxonomyClassLevel } | null>(null);
  const [addCategoryDialog, setAddCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Fetch taxonomy data
  const fetchTaxonomy = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/website-management/taxonomy`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTaxonomy(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch taxonomy data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxonomy();
  }, []);

  // Save taxonomy
  const saveTaxonomy = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, taxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Taxonomy updated successfully',
      });
    } catch (error) {
      console.error('Error saving taxonomy:', error);
      toast({
        title: 'Error',
        description: 'Failed to save taxonomy',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Add new category via popup
  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }

    const newCategoryData: TaxonomyCategory = {
      id: Date.now(),
      name: newCategory.name.trim(),
      description: newCategory.description.trim(),
      subjects: [],
      classLevels: []
    };

    const updatedTaxonomy = {
      ...taxonomy,
      categories: [...taxonomy.categories, newCategoryData]
    };

    setTaxonomy(updatedTaxonomy);

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and close dialog
      setNewCategory({ name: '', description: '' });
      setAddCategoryDialog(false);

      toast({
        title: 'Success',
        description: 'Category added successfully',
      });
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: 'Error',
        description: 'Failed to save category',
        variant: 'destructive'
      });
      // Revert the change if save failed
      setTaxonomy(taxonomy);
    } finally {
      setSaving(false);
    }
  };

  // Update category
  const updateCategory = async (categoryId: number, updates: Partial<TaxonomyCategory>) => {
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);

      toast({
        title: 'Success',
        description: 'Category updated successfully',
      });
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: number) => {
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.filter(cat => cat.id !== categoryId)
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Add subject to category
  const addSubject = async (categoryId: number) => {
    const newSubject: TaxonomySubject = {
      id: Date.now(),
      name: ''
    };
    
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, subjects: [...cat.subjects, newSubject] }
          : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);
      setEditingSubject({ categoryId, subject: newSubject });

      toast({
        title: 'Success',
        description: 'Subject added successfully',
      });
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to add subject',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Update subject
  const updateSubject = async (categoryId: number, subjectId: number, name: string) => {
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId 
          ? { 
              ...cat, 
              subjects: cat.subjects.map(sub => 
                sub.id === subjectId ? { ...sub, name } : sub
              )
            }
          : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);

      toast({
        title: 'Success',
        description: 'Subject updated successfully',
      });
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subject',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete subject
  const deleteSubject = async (categoryId: number, subjectId: number) => {
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, subjects: cat.subjects.filter(sub => sub.id !== subjectId) }
          : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);

      toast({
        title: 'Success',
        description: 'Subject deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Add class level to category
  const addClassLevel = async (categoryId: number) => {
    const newClassLevel: TaxonomyClassLevel = {
      id: Date.now(),
      name: ''
    };
    
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, classLevels: [...cat.classLevels, newClassLevel] }
          : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);
      setEditingClassLevel({ categoryId, classLevel: newClassLevel });

      toast({
        title: 'Success',
        description: 'Class level added successfully',
      });
    } catch (error) {
      console.error('Error adding class level:', error);
      toast({
        title: 'Error',
        description: 'Failed to add class level',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Update class level
  const updateClassLevel = async (categoryId: number, classLevelId: number, name: string) => {
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId 
          ? { 
              ...cat, 
              classLevels: cat.classLevels.map(cl => 
                cl.id === classLevelId ? { ...cl, name } : cl
              )
            }
          : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);

      toast({
        title: 'Success',
        description: 'Class level updated successfully',
      });
    } catch (error) {
      console.error('Error updating class level:', error);
      toast({
        title: 'Error',
        description: 'Failed to update class level',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete class level
  const deleteClassLevel = async (categoryId: number, classLevelId: number) => {
    const updatedTaxonomy = {
      ...taxonomy,
      categories: taxonomy.categories.map(cat => 
        cat.id === categoryId 
          ? { ...cat, classLevels: cat.classLevels.filter(cl => cl.id !== classLevelId) }
          : cat
      )
    };

    // Save to JSON file
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/website-management/taxonomy`, updatedTaxonomy, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update state only after successful save
      setTaxonomy(updatedTaxonomy);

      toast({
        title: 'Success',
        description: 'Class level deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting class level:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete class level',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading taxonomy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Taxonomy Management</h2>
        <p className="text-muted-foreground">
          Manage educational categories, subjects, and class levels for the platform
        </p>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter category name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category-description">Description</Label>
              <Textarea
                id="category-description"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter category description"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddCategoryDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={addCategory} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Categories Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Categories ({taxonomy.categories.length})
              </CardTitle>
              <CardDescription>Manage educational categories and their subjects/class levels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxonomy.categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories found. Add your first category to get started.</p>
            </div>
          ) : (
            taxonomy.categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4 space-y-4">
                {/* Category Header */}
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {editingCategory?.id === category.id ? (
                      <div className="space-y-2">
                        <Input
                          value={category.name}
                          onChange={(e) => updateCategory(category.id, { name: e.target.value })}
                          placeholder="Category name"
                        />
                        <Textarea
                          value={category.description}
                          onChange={(e) => updateCategory(category.id, { description: e.target.value })}
                          placeholder="Category description"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={async () => {
                              await updateCategory(category.id, { 
                                name: category.name, 
                                description: category.description 
                              });
                              setEditingCategory(null);
                            }}
                            disabled={saving}
                          >
                            {saving ? (
                              <>
                                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingCategory?.id !== category.id && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => deleteCategory(category.id)}
                      disabled={saving}
                    >
                      {saving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Subjects and Class Levels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Subjects */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Subjects ({category.subjects.length})
                      </Label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addSubject(category.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {category.subjects.map((subject) => (
                        <div key={subject.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          {editingSubject?.categoryId === category.id && editingSubject?.subject.id === subject.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={subject.name}
                                onChange={(e) => updateSubject(category.id, subject.id, e.target.value)}
                                size={1}
                              />
                              <Button 
                                size="sm" 
                                onClick={async () => {
                                  await updateSubject(category.id, subject.id, subject.name);
                                  setEditingSubject(null);
                                }}
                                disabled={saving}
                              >
                                {saving ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm">{subject.name}</span>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setEditingSubject({ categoryId: category.id, subject })}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteSubject(category.id, subject.id)}
                                  disabled={saving}
                                >
                                  {saving ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Class Levels */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Class Levels ({category.classLevels.length})
                      </Label>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => addClassLevel(category.id)}
                        disabled={saving}
                      >
                        {saving ? (
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        Add
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {category.classLevels.map((classLevel) => (
                        <div key={classLevel.id} className="flex items-center justify-between p-2 bg-muted rounded">
                          {editingClassLevel?.categoryId === category.id && editingClassLevel?.classLevel.id === classLevel.id ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Input
                                value={classLevel.name}
                                onChange={(e) => updateClassLevel(category.id, classLevel.id, e.target.value)}
                                size={1}
                              />
                              <Button 
                                size="sm" 
                                onClick={async () => {
                                  await updateClassLevel(category.id, classLevel.id, classLevel.name);
                                  setEditingClassLevel(null);
                                }}
                                disabled={saving}
                              >
                                {saving ? (
                                  <RefreshCw className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Save className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm">{classLevel.name}</span>
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setEditingClassLevel({ categoryId: category.id, classLevel })}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteClassLevel(category.id, classLevel.id)}
                                  disabled={saving}
                                >
                                  {saving ? (
                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={fetchTaxonomy} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
    </div>
  );
}
