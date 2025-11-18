import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Mail, 
  MessageSquare, 
  Save, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  TestTube,
  Star
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface ApiCredential {
  id: number;
  name: string;
  type: 'smtp' | 'sms';
  provider: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  api_key?: string;
  api_secret?: string;
  sender_email?: string;
  sender_name?: string;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  created_by_name?: string;
  updated_by_name?: string;
}

interface ApiCredentialForm {
  name: string;
  type: 'smtp' | 'sms';
  provider: string;
  host: string;
  port: string;
  username: string;
  password: string;
  api_key: string;
  api_secret: string;
  sender_email: string;
  sender_name: string;
  is_active: boolean;
  is_default: boolean;
}

export default function ApiCredentialsSection() {
  const [credentials, setCredentials] = useState<ApiCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCredential, setEditingCredential] = useState<ApiCredential | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialToDelete, setCredentialToDelete] = useState<ApiCredential | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('+8801234567890');
  const [testEmail, setTestEmail] = useState('test@example.com');

  const [formData, setFormData] = useState<ApiCredentialForm>({
    name: '',
    type: 'smtp',
    provider: '',
    host: '',
    port: '',
    username: '',
    password: '',
    api_key: '',
    api_secret: '',
    sender_email: '',
    sender_name: '',
    is_active: true,
    is_default: false
  });

  // Fetch API credentials
  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api-credentials`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCredentials(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching API credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch API credentials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      type: 'smtp',
      provider: '',
      host: '',
      port: '',
      username: '',
      password: '',
      api_key: '',
      api_secret: '',
      sender_email: '',
      sender_name: '',
      is_active: true,
      is_default: false
    });
    setEditingCredential(null);
    setTestPhone('+8801234567890');
    setTestEmail('test@example.com');
  };

  // Open form for creating new credential
  const handleCreate = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing credential
  const handleEdit = (credential: ApiCredential) => {
    setFormData({
      name: credential.name,
      type: credential.type,
      provider: credential.provider,
      host: credential.host || '',
      port: credential.port?.toString() || '',
      username: credential.username || '',
      password: '',
      api_key: credential.api_key || '',
      api_secret: '',
      sender_email: credential.sender_email || '',
      sender_name: credential.sender_name || '',
      is_active: credential.is_active,
      is_default: credential.is_default
    });
    setEditingCredential(credential);
    setShowForm(true);
  };

  // Save credential
  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      // Validate only basic required fields
      if (!formData.name || !formData.provider) {
        toast({
          title: 'Validation Error',
          description: 'Name and provider are required fields.',
          variant: 'destructive'
        });
        return;
      }

      // For editing, all other fields are optional
      // For creating new credentials, we can still validate type-specific fields
      if (!editingCredential) {
        if (formData.type === 'smtp') {
          if (!formData.host || !formData.port || !formData.username || !formData.password) {
            toast({
              title: 'Validation Error',
              description: 'SMTP credentials require host, port, username, and password.',
              variant: 'destructive'
            });
            return;
          }
        } else if (formData.type === 'sms') {
          if (!formData.api_key) {
            toast({
              title: 'Validation Error',
              description: 'SMS credentials require API key.',
              variant: 'destructive'
            });
            return;
          }
        }
      }

      const payload = {
        ...formData,
        port: formData.port ? parseInt(formData.port) : null
      };

      if (editingCredential) {
        // Update existing credential
        await axios.put(`${API_BASE_URL}/api-credentials/${editingCredential.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Success',
          description: 'API credential updated successfully',
        });
      } else {
        // Create new credential
        await axios.post(`${API_BASE_URL}/api-credentials`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({
          title: 'Success',
          description: 'API credential created successfully',
        });
      }

      setShowForm(false);
      resetForm();
      fetchCredentials();
    } catch (error: any) {
      console.error('Error saving API credential:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save API credential',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Delete credential
  const handleDelete = async () => {
    if (!credentialToDelete) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api-credentials/${credentialToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'API credential deleted successfully',
      });

      setShowDeleteDialog(false);
      setCredentialToDelete(null);
      fetchCredentials();
    } catch (error: any) {
      console.error('Error deleting API credential:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete API credential',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Toggle credential status
  const handleToggleStatus = async (credential: ApiCredential) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api-credentials/${credential.id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: `API credential ${credential.is_active ? 'deactivated' : 'activated'} successfully`,
      });

      fetchCredentials();
    } catch (error: any) {
      console.error('Error toggling credential status:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to toggle credential status',
        variant: 'destructive'
      });
    }
  };

  // Set default credential
  const handleSetDefault = async (credential: ApiCredential) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE_URL}/api-credentials/${credential.id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'API credential set as default successfully',
      });

      fetchCredentials();
    } catch (error: any) {
      console.error('Error setting default credential:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to set default credential',
        variant: 'destructive'
      });
    }
  };

  // Test SMTP connection
  const handleTestSmtp = async () => {
    try {
      setTesting(true);
      const token = localStorage.getItem('token');
      
      // For editing, we can test with existing credentials if fields are empty
      if (!editingCredential && (!formData.host || !formData.port || !formData.username || !formData.password)) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all SMTP fields before testing.',
          variant: 'destructive'
        });
        return;
      }

      // Use form data or existing credential data for testing
      const testData = {
        host: formData.host || editingCredential?.host,
        port: formData.port || editingCredential?.port,
        username: formData.username || editingCredential?.username,
        password: formData.password || '', // We can't retrieve existing password
        sender_email: formData.sender_email || editingCredential?.sender_email,
        sender_name: formData.sender_name || editingCredential?.sender_name,
        test_email: testEmail
      };

      // If we're editing and password is empty, we can't test
      if (editingCredential && !formData.password) {
        toast({
          title: 'Test Failed',
          description: 'Password is required for testing. Please enter the password to test the connection.',
          variant: 'destructive'
        });
        return;
      }

      await axios.post(`${API_BASE_URL}/api-credentials/test-smtp`, testData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'SMTP connection test successful',
      });
    } catch (error: any) {
      console.error('SMTP test error:', error);
      toast({
        title: 'Test Failed',
        description: error.response?.data?.message || 'SMTP connection test failed',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  // Test SMS API
  const handleTestSms = async () => {
    try {
      setTesting(true);
      const token = localStorage.getItem('token');
      
      // For editing, we can test with existing credentials if fields are empty
      if (!editingCredential && (!formData.provider || !formData.api_key)) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in provider and API key before testing.',
          variant: 'destructive'
        });
        return;
      }

      // Validate phone number format (Bangladesh format)
      const phoneRegex = /^(\+880|880|0)?(1[3-9]\d{8})$/;
      if (!phoneRegex.test(testPhone)) {
        toast({
          title: 'Validation Error',
          description: 'Invalid phone number format. Please use Bangladesh format (e.g., +8801234567890)',
          variant: 'destructive'
        });
        setTesting(false);
        return;
      }

      // Use form data or existing credential data for testing
      const testData = {
        provider: formData.provider || editingCredential?.provider,
        api_key: formData.api_key || editingCredential?.api_key,
        api_secret: formData.api_secret || '', // We can't retrieve existing secret
        test_phone: testPhone // Use the input test phone number
      };

      await axios.post(`${API_BASE_URL}/api-credentials/test-sms`, testData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'SMS API test successful',
      });
    } catch (error: any) {
      console.error('SMS test error:', error);
      toast({
        title: 'Test Failed',
        description: error.response?.data?.message || 'SMS API test failed',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading API credentials...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">API Credentials Management</h2>
        <p className="text-muted-foreground">
          Manage SMTP and SMS API credentials for email and messaging services
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Credential
          </Button>
        </div>
      </div>

      {/* Credentials List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMTP Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              SMTP Credentials
            </CardTitle>
            <CardDescription>Email service configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {credentials.filter(c => c.type === 'smtp').map((credential) => (
              <div key={credential.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{credential.name}</h4>
                      {credential.is_default ? (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not Default
                        </Badge>
                      )}
                      {credential.is_active ? (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{credential.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      {credential.host}:{credential.port} • {credential.username}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {credential.is_default ? '⭐ Default' : '○ Not Default'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 min-w-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(credential)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(credential)}
                    >
                      {credential.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    {!credential.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(credential)}
                      >
                        Set Default
                      </Button>
                    )}
                    {!credential.is_default && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setCredentialToDelete(credential);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {credentials.filter(c => c.type === 'smtp').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No SMTP credentials configured</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SMS Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Credentials
            </CardTitle>
            <CardDescription>Bulk SMS service configurations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {credentials.filter(c => c.type === 'sms').map((credential) => (
              <div key={credential.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{credential.name}</h4>
                      {credential.is_default ? (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Not Default
                        </Badge>
                      )}
                      {credential.is_active ? (
                        <Badge variant="secondary" className="text-xs">Active</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{credential.provider}</p>
                    <p className="text-xs text-muted-foreground">
                      API Key: {credential.api_key ? '••••••••' + credential.api_key.slice(-4) : 'Not set'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {credential.is_default ? '⭐ Default' : '○ Not Default'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 min-w-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(credential)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(credential)}
                    >
                      {credential.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    {!credential.is_default && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetDefault(credential)}
                      >
                        Set Default
                      </Button>
                    )}
                    {!credential.is_default && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setCredentialToDelete(credential);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {credentials.filter(c => c.type === 'sms').length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No SMS credentials configured</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCredential ? 'Edit API Credential' : 'Add New API Credential'}
            </DialogTitle>
            <DialogDescription>
              Configure {formData.type.toUpperCase()} credentials for {formData.type === 'smtp' ? 'email' : 'SMS'} services
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Gmail SMTP, Twilio SMS"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                                 <select
                   id="type"
                   name="type"
                   value={formData.type}
                   onChange={(e) => {
                     const newType = e.target.value as 'smtp' | 'sms';
                     setFormData(prev => ({ 
                       ...prev, 
                       type: newType,
                       provider: newType === 'sms' ? 'BulkSMSBD' : prev.provider
                     }));
                   }}
                   className="w-full px-3 py-2 border border-input rounded-md bg-background"
                 >
                   <option value="smtp">SMTP (Email)</option>
                   <option value="sms">SMS</option>
                 </select>
              </div>
            </div>

                         <div>
               {formData.type === 'sms' ? (
                 <div>
                   <Label htmlFor="provider">Provider</Label>
                   <select
                     id="provider"
                     name="provider"
                     value={formData.provider}
                     onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
                     className="w-full px-3 py-2 border border-input rounded-md bg-background"
                   >
                     <option value="">Select Provider</option>
                     <option value="BulkSMSBD">BulkSMSBD</option>
                   </select>
                 </div>
               ) : (
                 <Input
                   id="provider"
                   name="provider"
                   value={formData.provider}
                   onChange={handleInputChange}
                   placeholder="e.g., Gmail, Outlook, SendGrid"
                 />
               )}
            </div>

                         {/* SMTP Fields */}
             {formData.type === 'smtp' && (
               <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="host">
                       SMTP Host {editingCredential && <span className="text-muted-foreground text-xs">(Optional)</span>}
                     </Label>
                     <Input
                       id="host"
                       name="host"
                       value={formData.host}
                       onChange={handleInputChange}
                       placeholder="e.g., smtp.gmail.com"
                     />
                   </div>
                   <div>
                     <Label htmlFor="port">
                       Port {editingCredential && <span className="text-muted-foreground text-xs">(Optional)</span>}
                     </Label>
                     <Input
                       id="port"
                       name="port"
                       type="number"
                       value={formData.port}
                       onChange={handleInputChange}
                       placeholder="587, 465, 25"
                     />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <Label htmlFor="username">
                       Username {editingCredential && <span className="text-muted-foreground text-xs">(Optional)</span>}
                     </Label>
                     <Input
                       id="username"
                       name="username"
                       value={formData.username}
                       onChange={handleInputChange}
                       placeholder="your-email@gmail.com"
                     />
                   </div>
                   <div>
                     <Label htmlFor="password">
                       Password {editingCredential && <span className="text-muted-foreground text-xs">(Optional)</span>}
                     </Label>
                     <div className="relative">
                       <Input
                         id="password"
                         name="password"
                         type={showPassword ? 'text' : 'password'}
                         value={formData.password}
                         onChange={handleInputChange}
                         placeholder={editingCredential ? "Leave blank to keep current password" : "App password or account password"}
                       />
                       <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                         onClick={() => setShowPassword(!showPassword)}
                       >
                         {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                       </Button>
                     </div>
                   </div>
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sender_email">Sender Email</Label>
                    <Input
                      id="sender_email"
                      name="sender_email"
                      type="email"
                      value={formData.sender_email}
                      onChange={handleInputChange}
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="sender_name">Sender Name</Label>
                    <Input
                      id="sender_name"
                      name="sender_name"
                      value={formData.sender_name}
                      onChange={handleInputChange}
                      placeholder="Your Company Name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="test_email">Test Email Address</Label>
                  <Input
                    id="test_email"
                    name="test_email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Email address to receive the test email when testing SMTP connection
                  </p>
                </div>

                                 <Button
                   type="button"
                   variant="outline"
                   onClick={handleTestSmtp}
                   disabled={testing || (!editingCredential && (!formData.host || !formData.port || !formData.username || !formData.password))}
                   className="w-full"
                 >
                   <TestTube className="h-4 w-4 mr-2" />
                   {testing ? 'Testing...' : 'Test SMTP Connection'}
                 </Button>
              </div>
            )}

                         {/* SMS Fields */}
             {formData.type === 'sms' && (
               <div className="space-y-4">
                 <div>
                   <Label htmlFor="api_key">
                     API Key {editingCredential && <span className="text-muted-foreground text-xs">(Optional)</span>}
                   </Label>
                                       <Input
                      id="api_key"
                      name="api_key"
                      value={formData.api_key}
                      onChange={handleInputChange}
                      placeholder="Your BulkSMSBD API key"
                    />
                 </div>

                <div>
                  <Label htmlFor="api_secret">API Secret (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="api_secret"
                      name="api_secret"
                      type={showApiSecret ? 'text' : 'password'}
                      value={formData.api_secret}
                      onChange={handleInputChange}
                      placeholder="Your SMS provider API secret"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowApiSecret(!showApiSecret)}
                    >
                      {showApiSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="sender_name">Sender Name/ID</Label>
                                     <Input
                     id="sender_name"
                     name="sender_name"
                     value={formData.sender_name}
                     onChange={handleInputChange}
                     placeholder="Your approved BulkSMSBD Sender ID"
                   />
                </div>

                <div>
                  <Label htmlFor="test_phone">Test Phone Number</Label>
                  <Input
                    id="test_phone"
                    name="test_phone"
                    type="tel"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="+8801234567890"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Phone number to use when testing the SMS API (Bangladesh format: +8801234567890)
                  </p>
                </div>

                                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                   <div className="flex items-start gap-2">
                     <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                     <div className="text-sm text-green-800">
                       <p className="font-medium mb-1">SMS Provider:</p>
                       <p>This system is configured to use <strong>BulkSMSBD</strong> as the SMS provider. All SMS functionality will work with BulkSMSBD credentials.</p>
                       
                     </div>
                   </div>
                 </div>

                                 <Button
                   type="button"
                   variant="outline"
                   onClick={handleTestSms}
                   disabled={testing || (!editingCredential && (!formData.provider || !formData.api_key))}
                   className="w-full"
                 >
                   <TestTube className="h-4 w-4 mr-2" />
                   {testing ? 'Testing...' : 'Test SMS API'}
                 </Button>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable this credential for use
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Set as Default</Label>
                  
                </div>
                <Switch
                  checked={formData.is_default}
                  onCheckedChange={(checked) => handleSwitchChange('is_default', checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Credential'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete API Credential</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{credentialToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
