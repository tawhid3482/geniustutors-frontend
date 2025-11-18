'use client';

import { useEffect } from 'react';
import { getWebsiteInfo } from '@/services/websiteService';

export const DynamicFavicon = () => {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        const websiteInfo = await getWebsiteInfo();
        
        // Check if there's a favicon URL in the website info
        // Use the favicon if available, otherwise fall back to logo or default favicon
        const faviconUrl = websiteInfo.siteFavicon || websiteInfo.siteLogo || '/favicon.ico';
        
        // Remove existing favicon links
        const existingLinks = document.querySelectorAll('link[rel*="icon"]');
        existingLinks.forEach(link => link.remove());
        
        // Create new favicon link
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
        
        // Also add for different sizes and types
        const link32 = document.createElement('link');
        link32.rel = 'icon';
        link32.type = 'image/png';
        link32.sizes = '32x32';
        link32.href = faviconUrl;
        document.head.appendChild(link32);
        
        const link16 = document.createElement('link');
        link16.rel = 'icon';
        link16.type = 'image/png';
        link16.sizes = '16x16';
        link16.href = faviconUrl;
        document.head.appendChild(link16);
        
      } catch (error) {
        console.error('Error loading favicon:', error);
        // Fallback to default favicon
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = '/favicon.ico';
        document.head.appendChild(link);
      }
    };

    loadFavicon();
  }, []);

  return null; // This component doesn't render anything
};
