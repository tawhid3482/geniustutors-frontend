'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.next";
import { getWebsiteInfo } from "@/services/websiteService";

export default function PrivacyClient() {
  const { user, profile, signOut } = useAuth();
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 overflow-x-hidden w-full">
      <div className="bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Last updated: January 2025
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              update your profile, or contact us for support.
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Personal information (name, email, phone number)</li>
              <li>Educational information (subjects, grade level, location)</li>
              <li>Profile information and preferences</li>
              <li>Communication data between tutors and students</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>To provide and improve our tutoring services</li>
              <li>To match students with appropriate tutors</li>
              <li>To communicate with you about our services</li>
              <li>To ensure platform safety and security</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share information in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>With tutors and students as necessary for the service</li>
              <li>With service providers who help us operate our platform</li>
              <li>For legal reasons, including to comply with laws or protect rights</li>
              <li>In connection with a business transaction like a merger or acquisition</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-4">
              Depending on your location, you may have certain rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Access and update your information through your account settings</li>
              <li>Request deletion of your account and personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Object to certain uses of your information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our practices, please contact us at:
              <br />
              <a href={`mailto:${websiteInfo.contactEmail}`} className="text-primary hover:underline">
                {websiteInfo.contactEmail}
              </a>
              <br />
              Phone: {websiteInfo.contactPhone}
              <br />
              Address: {websiteInfo.address}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}