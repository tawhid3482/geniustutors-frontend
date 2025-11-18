'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Star,
  Send,
  MessageCircle,
  ChevronRight,
  Calendar,
  Users,
  Award,
  Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext.next";
import { useState, useEffect } from "react";
import { getWebsiteInfo } from "@/services/websiteService";

const ContactClient = () => {
  const { user, profile, signOut } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [websiteInfo, setWebsiteInfo] = useState({ 
    siteName: 'Tutor Today', 
    siteLogo: '/logo.webp',
    contactEmail: '',
    contactPhone: '',
    address: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: ''
    }
  });
  
  useEffect(() => {
    const fetchWebsiteInfo = async () => {
      try {
        const info = await getWebsiteInfo();
        setWebsiteInfo(info);
      } catch (error) {
        console.error('Error fetching website info:', error);
      }
    };
    
    fetchWebsiteInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Here you would typically send the form data to your backend
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 overflow-x-hidden w-full">
      <div className="flex flex-col items-center justify-center mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Have questions or need assistance? Our team is here to help you with any inquiries about our tutoring services.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Name</label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Your name" 
                    value={formData.name}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Your email address" 
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-medium">Subject</label>
                  <Input 
                    id="subject" 
                    name="subject" 
                    placeholder="Subject of your message" 
                    value={formData.subject}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium">Message</label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    placeholder="Your message" 
                    rows={5} 
                    value={formData.message}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="mr-2 h-4 w-4" /> Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start">
                <Phone className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-sm text-muted-foreground">{websiteInfo.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-sm text-muted-foreground">{websiteInfo.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    {websiteInfo.address}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <h3 className="font-medium">Business Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Our Support Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="/assets/team/support-1.jpg" alt="Support Team Member" />
                  <AvatarFallback>ST</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Sarah Thompson</p>
                  <p className="text-sm text-muted-foreground">Customer Support Lead</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="/assets/team/support-2.jpg" alt="Support Team Member" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">James Davis</p>
                  <p className="text-sm text-muted-foreground">Technical Support</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="/assets/team/support-3.jpg" alt="Support Team Member" />
                  <AvatarFallback>ML</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Maria Lopez</p>
                  <p className="text-sm text-muted-foreground">Tutor Relations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I schedule a tutoring session?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You can schedule a tutoring session by logging into your account, browsing available tutors, and selecting an available time slot that works for you. Once confirmed, you'll receive a notification with session details.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely through our platform at the time of booking.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How do I become a tutor on your platform?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                To become a tutor, you need to create an account, complete your profile with qualifications and expertise, pass our verification process, and set up your availability calendar. Our team will review your application within 3-5 business days.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What if I need to cancel a session?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You can cancel a session up to 24 hours before the scheduled time for a full refund. Cancellations made less than 24 hours in advance may be subject to a cancellation fee. Emergency situations are handled on a case-by-case basis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactClient;