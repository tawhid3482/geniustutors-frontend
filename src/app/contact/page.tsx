'use client'
import { LoginDialog } from '@/components/auth/LoginDialog';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import ContactClient from '@/components/marketing/ContactClient';
import { useAuth } from '@/contexts/AuthContext.next';
import React from 'react';

const Contact = () => {
   const { user, signOut } = useAuth();
    const handleLogout = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };
  return (
    <div className="w-full mx-auto">
      <Navbar
        user={
          user
            ? {
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
              }
            : undefined
        }
        onLogout={handleLogout}
        LoginComponent={LoginDialog}
        RegisterComponent={LoginDialog}
      />
      <ContactClient />

      <Footer />
    </div>
  );
};

export default Contact;