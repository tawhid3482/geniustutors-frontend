'use client';

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.next";
import { getWebsiteInfo } from "@/services/websiteService";

export default function TermsClient() {
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
        <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-6">
            Last updated: January 2025
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Tutor Connect services, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Tutor Connect provides an online platform connecting students with tutors for educational purposes. 
              We do not directly provide tutoring services but facilitate connections between users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground mb-4">
              To use certain features of our service, you must register for an account. You agree to provide accurate information 
              and to keep your account information updated. You are responsible for maintaining the confidentiality of your account 
              and password.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. User Conduct</h2>
            <p className="text-muted-foreground mb-4">
              You agree not to use the service for any illegal or unauthorized purpose. You agree to comply with all laws, 
              rules, and regulations applicable to your use of the service.
            </p>
            <p className="text-muted-foreground">
              Prohibited activities include but are not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Harassment or abuse of other users</li>
              <li>Posting false or misleading information</li>
              <li>Impersonating another person</li>
              <li>Distributing malware or viruses</li>
              <li>Attempting to gain unauthorized access to the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Payments and Fees</h2>
            <p className="text-muted-foreground mb-4">
              Some aspects of our service may require payment. All fees are in Bangladeshi Taka (BDT) unless otherwise stated. 
              Payment terms are specified at the time of purchase.
            </p>
            <p className="text-muted-foreground">
              Refunds are handled according to our Refund Policy, available upon request.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground">
              The service and its original content, features, and functionality are owned by Tutor Connect and are protected by 
              international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Termination</h2>
            <p className="text-muted-foreground">
              We may terminate or suspend your account and access to the service immediately, without prior notice or liability, 
              for any reason, including without limitation if you breach the Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              In no event shall Tutor Connect be liable for any indirect, incidental, special, consequential, or punitive damages, 
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your 
              access to or use of or inability to access or use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 text-muted-foreground">
              <p>Email: {websiteInfo.contactEmail}</p>
              <p>Phone: {websiteInfo.contactPhone}</p>
              <p>Address: {websiteInfo.address}</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}