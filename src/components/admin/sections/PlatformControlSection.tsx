import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tag, Code, Save, RefreshCw, Link, Shield } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";
import { useAuth } from "@/contexts/AuthContext.next";

interface WebsiteSettings {
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  google_analytics_id: string;
  facebook_pixel_id: string;
  google_tag_manager_id: string;
  custom_head_code: string;
  custom_footer_code: string;
  footer_credit: string;
}

export default function PlatformControlSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  // Website settings state (only SEO & Analytics related fields)
  const [websiteSettings, setWebsiteSettings] = useState<WebsiteSettings>({
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    google_analytics_id: "",
    facebook_pixel_id: "",
    google_tag_manager_id: "",
    custom_head_code: "",
    custom_footer_code: "",
    footer_credit: "",
  });

  // Fetch website settings
  const fetchWebsiteSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_BASE_URL}/website-management/settings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        setWebsiteSettings({
          seo_title: data.seo_title || "",
          seo_description: data.seo_description || "",
          seo_keywords: data.seo_keywords || "",
          google_analytics_id: data.google_analytics_id || "",
          facebook_pixel_id: data.facebook_pixel_id || "",
          google_tag_manager_id: data.google_tag_manager_id || "",
          custom_head_code: data.custom_head_code || "",
          custom_footer_code: data.custom_footer_code || "",
          footer_credit: data.footer_credit || "",
        });
      }
    } catch (error) {
      console.error("Error fetching website settings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch website settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsiteSettings();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setWebsiteSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Save website settings
  const saveWebsiteSettings = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      // Validate required fields
      if (!websiteSettings.seo_title.trim()) {
        toast({
          title: "Validation Error",
          description: "SEO title is required",
          variant: "destructive",
        });
        return;
      }

      // Prepare data to save based on user role
      const dataToSave = {
        seo_title: websiteSettings.seo_title,
        seo_description: websiteSettings.seo_description,
        seo_keywords: websiteSettings.seo_keywords,
        google_analytics_id: websiteSettings.google_analytics_id,
        facebook_pixel_id: websiteSettings.facebook_pixel_id,
        google_tag_manager_id: websiteSettings.google_tag_manager_id,
        // Only include super admin fields if user is super admin
        ...(isSuperAdmin && {
          custom_head_code: websiteSettings.custom_head_code,
          custom_footer_code: websiteSettings.custom_footer_code,
          footer_credit: websiteSettings.footer_credit,
        }),
      };

      const response = await axios.put(
        `${API_BASE_URL}/website-management/settings`,
        dataToSave,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: isSuperAdmin
            ? "All settings saved successfully"
            : "SEO & Analytics settings saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving website settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading platform settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Platform Control</h2>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? "Manage SEO, analytics, and advanced platform settings (Super Admin)"
            : "Manage SEO and analytics settings for the platform (Admin)"}
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                SEO Configuration
              </CardTitle>
              <CardDescription>
                Search engine optimization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="seo_title">SEO Title</Label>
                <Input
                  id="seo_title"
                  name="seo_title"
                  value={websiteSettings.seo_title}
                  onChange={handleInputChange}
                  placeholder="Your website title for search engines"
                />
              </div>
              <div>
                <Label htmlFor="seo_description">SEO Description</Label>
                <Textarea
                  id="seo_description"
                  name="seo_description"
                  value={websiteSettings.seo_description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your website for search engines"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="seo_keywords">SEO Keywords</Label>
                <Textarea
                  id="seo_keywords"
                  name="seo_keywords"
                  value={websiteSettings.seo_keywords}
                  onChange={handleInputChange}
                  placeholder="Comma-separated keywords relevant to your website"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Analytics Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Analytics & Tracking
              </CardTitle>
              <CardDescription>
                Configure analytics and tracking codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                <Input
                  id="google_analytics_id"
                  name="google_analytics_id"
                  value={websiteSettings.google_analytics_id}
                  onChange={handleInputChange}
                  placeholder="GA4-XXXXXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your Google Analytics 4 Measurement ID (format:
                  GA4-XXXXXXXXXX)
                </p>
              </div>
              <div>
                <Label htmlFor="facebook_pixel_id">Facebook Pixel ID</Label>
                <Input
                  id="facebook_pixel_id"
                  name="facebook_pixel_id"
                  value={websiteSettings.facebook_pixel_id}
                  onChange={handleInputChange}
                  placeholder="123456789012345"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your Facebook Pixel ID for tracking conversions and events
                </p>
              </div>
              <div>
                <Label htmlFor="google_tag_manager_id">
                  Google Tag Manager ID
                </Label>
                <Input
                  id="google_tag_manager_id"
                  name="google_tag_manager_id"
                  value={websiteSettings.google_tag_manager_id}
                  onChange={handleInputChange}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your Google Tag Manager Container ID (format: GTM-XXXXXXX)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Super Admin Only Sections */}
        {isSuperAdmin && (
          <>
            {/* Footer Credit Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Footer Credit
                  <Shield className="h-4 w-4 text-primary" />
                </CardTitle>
                <CardDescription>
                  Manage the footer credit text and link (Super Admin Only)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="footer_credit">Footer Credit Text/Link</Label>
                  <Input
                    id="footer_credit"
                    name="footer_credit"
                    value={websiteSettings.footer_credit}
                    onChange={handleInputChange}
                    placeholder="© 2025 Tutor Today. All rights reserved | Developed by NextGent.org"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can include a link by adding HTML anchor tags. Example:
                    "© 2025 Tutor Today. All rights reserved | Developed by
                    &lt;a href='https://nextgent.org'
                    target='_blank'&gt;NextGent.org&lt;/a&gt;"
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Custom Code */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Custom Head Code
                    <Shield className="h-4 w-4 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    Add custom HTML code to the head section (Super Admin Only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="custom_head_code">
                      Custom HTML/CSS/JavaScript
                    </Label>
                    <Textarea
                      id="custom_head_code"
                      name="custom_head_code"
                      value={websiteSettings.custom_head_code}
                      onChange={handleInputChange}
                      placeholder="Enter custom HTML, CSS, or JavaScript code"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This code will be inserted in the HTML head section. Use
                      carefully.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Custom Footer Code
                    <Shield className="h-4 w-4 text-primary" />
                  </CardTitle>
                  <CardDescription>
                    Add custom HTML code before closing body tag (Super Admin
                    Only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label htmlFor="custom_footer_code">
                      Custom HTML/CSS/JavaScript
                    </Label>
                    <Textarea
                      id="custom_footer_code"
                      name="custom_footer_code"
                      value={websiteSettings.custom_footer_code}
                      onChange={handleInputChange}
                      placeholder="Enter custom HTML, CSS, or JavaScript code"
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This code will be inserted before the closing body tag.
                      Use carefully.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button onClick={saveWebsiteSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving
              ? "Saving..."
              : isSuperAdmin
              ? "Save All Settings"
              : "Save SEO & Analytics"}
          </Button>
        </div>
      </div>
    </div>
  );
}
