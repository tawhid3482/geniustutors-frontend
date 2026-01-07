import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Upload, Globe, Settings, Phone, Mail, Tag, Code, Image, Save, RefreshCw, Palette } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import ColorThemeSection from './ColorThemeSection';
import ApiCredentialsSection from './ApiCredentialsSection';

interface WebsiteSettings {
  site_name: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  logo_url?: string;
  favicon_url?: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  footer_credit: string;
  commission_rate: number;
  fixed_fee: number;
  maintenance_mode: boolean;
}



export default function PlatformControlSection() {
  const [activeTab, setActiveTab] = useState('website');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Website settings state
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: '',
    footer_credit: '© 2025 Tutor Today. All rights reserved | Developed by NextGent.org',
    commission_rate: 10,
    fixed_fee: 0,
    maintenance_mode: false
  });



  // File upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  // Fetch website settings
  const fetchWebsiteSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/website-management/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setWebsiteSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching website settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch website settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchWebsiteSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setWebsiteSettings(prev => ({ ...prev, [name]: value }));
  };

  // Handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWebsiteSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setWebsiteSettings(prev => ({ ...prev, [name]: checked }));
  };



  // Handle file uploads
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaviconFile(file);
    }
  };

  // Save website settings
  const saveWebsiteSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Validate required fields
      if (!websiteSettings.site_name || !websiteSettings.contact_email || !websiteSettings.contact_phone) {
        toast({
          title: 'Validation Error',
          description: 'Site name, contact email, and contact phone are required fields.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(websiteSettings.contact_email)) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid email address.',
          variant: 'destructive'
        });
        return;
      }
      
      // Validate phone format (basic validation)
      if (websiteSettings.contact_phone.length < 10) {
        toast({
          title: 'Validation Error',
          description: 'Please enter a valid phone number.',
          variant: 'destructive'
        });
        return;
      }
      
      // Create update data excluding footer_credit to prevent interference
      const updateData = {
        site_name: websiteSettings.site_name,
        site_description: websiteSettings.site_description,
        contact_email: websiteSettings.contact_email,
        contact_phone: websiteSettings.contact_phone,
        address: websiteSettings.address,
        facebook_url: websiteSettings.facebook_url,
        twitter_url: websiteSettings.twitter_url,
        instagram_url: websiteSettings.instagram_url,
        linkedin_url: websiteSettings.linkedin_url,
        commission_rate: websiteSettings.commission_rate,
        fixed_fee: websiteSettings.fixed_fee,
        maintenance_mode: websiteSettings.maintenance_mode
      };
      
      
      const response = await axios.put(`${API_BASE_URL}/website-management/settings`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Website settings updated successfully',
        });
        
        // Refresh the data to ensure we have the latest values
        await fetchWebsiteSettings();
      } else {
        throw new Error(response.data.error || 'Failed to update website settings');
      }
      
    } catch (error) {
      console.error('Error saving website settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save website settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Save footer credit only
  const saveFooterCredit = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Validate footer credit is not empty
      if (!websiteSettings.footer_credit.trim()) {
        toast({
          title: 'Validation Error',
          description: 'Footer credit cannot be empty',
          variant: 'destructive'
        });
        return;
      }
      
      // Only send the footer_credit field to ensure it doesn't affect other columns
      const updateData = {
        footer_credit: websiteSettings.footer_credit.trim()
      };
      
      
      const response = await axios.put(`${API_BASE_URL}/website-management/settings`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast({
          title: 'Success',
          description: 'Footer credit updated successfully',
        });
        
        // Refresh the data to ensure we have the latest values
        await fetchWebsiteSettings();
      } else {
        throw new Error(response.data.error || 'Failed to update footer credit');
      }
      
    } catch (error) {
      console.error('Error saving footer credit:', error);
      toast({
        title: 'Error',
        description: 'Failed to save footer credit',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload logo
  const uploadLogo = async () => {
    if (!logoFile) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await axios.post(`${API_BASE_URL}/website-management/upload-logo`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setWebsiteSettings(prev => ({ ...prev, logo_url: response.data.data.logo_url }));
        setLogoFile(null);
        // Reset the file input
        const logoInput = document.getElementById('logo_upload') as HTMLInputElement;
        if (logoInput) {
          logoInput.value = '';
        }
        toast({
          title: 'Success',
          description: 'Logo uploaded successfully',
        });
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Upload favicon
  const uploadFavicon = async () => {
    if (!faviconFile) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('favicon', faviconFile);

      const response = await axios.post(`${API_BASE_URL}/website-management/upload-favicon`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setWebsiteSettings(prev => ({ ...prev, favicon_url: response.data.data.favicon_url }));
        setFaviconFile(null);
        // Reset the file input
        const faviconInput = document.getElementById('favicon_upload') as HTMLInputElement;
        if (faviconInput) {
          faviconInput.value = '';
        }
        toast({
          title: 'Success',
          description: 'Favicon uploaded successfully',
        });
      }
    } catch (error) {
      console.error('Error uploading favicon:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload favicon',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
        <span className="ml-2 text-sm sm:text-base">Loading website settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Website Management</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage platform settings, website configuration, and branding
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-4 sm:mb-6">
          <TabsTrigger value="website" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Website</span>
            <span className="sm:hidden">Site</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Colors</span>
            <span className="sm:hidden">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">API Credentials</span>
            <span className="sm:hidden">API</span>
          </TabsTrigger>
        </TabsList>
        

        {/* Website Tab */}
        <TabsContent value="website" className="space-y-4 sm:space-y-6 w-full">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 w-full">
            {/* Basic Website Information */}
            <Card className="w-full">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                  Website Information
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Basic website details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="site_name" className="text-xs sm:text-sm">Site Name</Label>
                  <Input
                    id="site_name"
                    name="site_name"
                    value={websiteSettings.site_name}
                    onChange={handleInputChange}
                    placeholder="Enter site name"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="site_description" className="text-xs sm:text-sm">Site Description</Label>
                  <Textarea
                    id="site_description"
                    name="site_description"
                    value={websiteSettings.site_description}
                    onChange={handleInputChange}
                    placeholder="Brief description of your website"
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_email" className="text-xs sm:text-sm">Contact Email</Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    value={websiteSettings.contact_email}
                    onChange={handleInputChange}
                    placeholder="contact@example.com"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="contact_phone" className="text-xs sm:text-sm">Contact Phone</Label>
                  <Input
                    id="contact_phone"
                    name="contact_phone"
                    value={websiteSettings.contact_phone}
                    onChange={handleInputChange}
                    placeholder="+880-1234-567890"
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-xs sm:text-sm">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={websiteSettings.address}
                    onChange={handleInputChange}
                    placeholder="Enter business address"
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Branding */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Branding & Assets
                </CardTitle>
                <CardDescription>Upload and manage website branding elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Current Logo */}
                {websiteSettings.logo_url && (
                  <div>
                    <Label>Current Logo</Label>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={websiteSettings.logo_url.startsWith('http') ? websiteSettings.logo_url : `${API_BASE_URL.replace('/api', '')}${websiteSettings.logo_url}`} 
                        alt="Current Logo" 
                        className="h-12 w-auto object-contain"
                        onError={(e) => {
                          console.error('Logo failed to load:', websiteSettings.logo_url);
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) {
                            errorDiv.style.display = 'block';
                          }
                        }}
                      />
                      <div className="text-sm text-muted-foreground hidden">
                        Logo failed to load: {websiteSettings.logo_url}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current website logo
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Favicon */}
                {websiteSettings.favicon_url && (
                  <div>
                    <Label>Current Favicon</Label>
                    <div className="flex items-center gap-4 p-4 border rounded-lg">
                      <img 
                        src={websiteSettings.favicon_url.startsWith('http') ? websiteSettings.favicon_url : `${API_BASE_URL.replace('/api', '')}${websiteSettings.favicon_url}`} 
                        alt="Current Favicon" 
                        className="h-8 w-8 object-contain"
                        onError={(e) => {
                          console.error('Favicon failed to load:', websiteSettings.favicon_url);
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) {
                            errorDiv.style.display = 'block';
                          }
                        }}
                      />
                      <div className="text-sm text-muted-foreground hidden">
                        Favicon failed to load: {websiteSettings.favicon_url}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Current website favicon
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Upload */}
                <div>
                  <Label htmlFor="logo_upload">Upload New Logo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="logo_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    <Button 
                      onClick={uploadLogo} 
                      disabled={!logoFile || saving}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {saving ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: PNG or JPG, max 5MB
                  </p>
                </div>

                {/* Favicon Upload */}
                <div>
                  <Label htmlFor="favicon_upload">Upload Favicon</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="favicon_upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconUpload}
                      className="flex-1"
                    />
                    <Button 
                      onClick={uploadFavicon} 
                      disabled={!faviconFile || saving}
                      variant="outline"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {saving ? 'Uploading...' : 'Upload'}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: ICO or PNG, 32x32px
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Social Media Links */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Social Media Links
              </CardTitle>
              <CardDescription>Configure social media profile links</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook_url">Facebook URL</Label>
                <Input
                  id="facebook_url"
                  name="facebook_url"
                  value={websiteSettings.facebook_url}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <Label htmlFor="twitter_url">Twitter URL</Label>
                <Input
                  id="twitter_url"
                  name="twitter_url"
                  value={websiteSettings.twitter_url}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <Label htmlFor="instagram_url">Instagram URL</Label>
                <Input
                  id="instagram_url"
                  name="instagram_url"
                  value={websiteSettings.instagram_url}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/yourprofile"
                />
              </div>
              <div>
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  name="linkedin_url"
                  value={websiteSettings.linkedin_url}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Credit */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Footer Credit
              </CardTitle>
              <CardDescription>
                Manage the footer credit text displayed on the website.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="footer_credit">Footer Credit Text</Label>
                <Input
                  id="footer_credit"
                  name="footer_credit"
                  value={websiteSettings.footer_credit}
                  onChange={handleInputChange}
                  placeholder="© 2025 Tutor Today. All rights reserved | Developed by NextGent.org"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This text will be displayed in the footer of the website. You can include copyright information and developer credits. 
                  
                </p>
                <div className="mt-4">
                  <Button onClick={saveFooterCredit} disabled={saving} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Footer Credit'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={saveWebsiteSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Website Info'}
            </Button>
          </div>
        </TabsContent>



        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6 w-full">
          <ColorThemeSection />
        </TabsContent>

        {/* API Credentials Tab */}
        <TabsContent value="api" className="space-y-6 w-full">
          <ApiCredentialsSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}