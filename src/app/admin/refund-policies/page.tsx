'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  FileText
} from "lucide-react";
import { refundPolicyService, RefundPolicy, CreateRefundPolicyData, UpdateRefundPolicyData } from '@/services/refundPolicyService';
// Test components removed for production

export default function RefundPoliciesPage() {
  const { toast } = useToast();
  const [refundPolicies, setRefundPolicies] = useState<RefundPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RefundPolicy | null>(null);
  const [formData, setFormData] = useState<CreateRefundPolicyData>({
    title: '',
    description: '',
    conditions: [''],
    processing_time: '',
    is_active: true
  });

  // Fetch refund policies
  const fetchRefundPolicies = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Fetching refund policies...');
      const response = await refundPolicyService.getRefundPolicies();
      console.log('Refund policies response:', response);
      setRefundPolicies(response.data || []);
    } catch (error) {
      console.error('Error fetching refund policies:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: 'Error',
        description: `Failed to load refund policies: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRefundPolicies();
  }, [fetchRefundPolicies]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPolicy) {
        // Update existing policy
        const updateData: UpdateRefundPolicyData = {
          id: editingPolicy.id,
          ...formData
        };
        await refundPolicyService.updateRefundPolicy(updateData);
        toast({
          title: 'Success',
          description: 'Refund policy updated successfully'
        });
      } else {
        // Create new policy
        await refundPolicyService.createRefundPolicy(formData);
        toast({
          title: 'Success',
          description: 'Refund policy created successfully'
        });
      }
      
      setIsDialogOpen(false);
      setEditingPolicy(null);
      resetForm();
      fetchRefundPolicies();
    } catch (error) {
      console.error('Error saving refund policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to save refund policy',
        variant: 'destructive'
      });
    }
  };

  // Handle edit
  const handleEdit = (policy: RefundPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      title: policy.title,
      description: policy.description,
      conditions: policy.conditions,
      processing_time: policy.processing_time,
      is_active: policy.is_active
    });
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await refundPolicyService.deleteRefundPolicy(id);
      toast({
        title: 'Success',
        description: 'Refund policy deleted successfully'
      });
      fetchRefundPolicies();
    } catch (error) {
      console.error('Error deleting refund policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete refund policy',
        variant: 'destructive'
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      conditions: [''],
      processing_time: '',
      is_active: true
    });
    setEditingPolicy(null);
  };

  // Handle condition changes
  const handleConditionChange = (index: number, value: string) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = value;
    setFormData({ ...formData, conditions: newConditions });
  };

  const addCondition = () => {
    setFormData({
      ...formData,
      conditions: [...formData.conditions, '']
    });
  };

  const removeCondition = (index: number) => {
    const newConditions = formData.conditions.filter((_, i) => i !== index);
    setFormData({ ...formData, conditions: newConditions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading refund policies...</span>
      </div>
    );
  }

  // Debug information
  console.log('Refund policies state:', { refundPolicies, loading });

  return (
    <div className="space-y-6">
      {/* Debug info removed for production */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Refund Policy Management
        </h2>
        <p className="text-muted-foreground">
          Manage refund policies and terms for the platform
        </p>
      </div>

      {/* Test components removed for production */}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button onClick={fetchRefundPolicies} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Refund Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Refund Policy' : 'Create New Refund Policy'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter policy title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter policy description"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Conditions</Label>
                {formData.conditions.map((condition, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={condition}
                      onChange={(e) => handleConditionChange(index, e.target.value)}
                      placeholder="Enter condition"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCondition(index)}
                      disabled={formData.conditions.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCondition}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="processing_time">Processing Time</Label>
                <Input
                  id="processing_time"
                  value={formData.processing_time}
                  onChange={(e) => setFormData({ ...formData, processing_time: e.target.value })}
                  placeholder="e.g., 3-5 business days"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPolicy ? 'Update' : 'Create'} Policy
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Refund Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Refund Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          {refundPolicies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundPolicies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell className="font-medium">{policy.title}</TableCell>
                    <TableCell className="max-w-xs truncate">{policy.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {policy.processing_time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.is_active ? "default" : "secondary"}>
                        {policy.is_active ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {policy.conditions.length} condition{policy.conditions.length !== 1 ? 's' : ''}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(policy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the refund policy.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(policy.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No refund policies found</h3>
              <p className="text-muted-foreground">
                Create your first refund policy to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
