import axios from 'axios';
import { API_BASE_URL } from '@/constants/api';

interface WebsiteInfo {
  siteName: string;
  siteLogo: string;
  siteFavicon?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  googleAnalyticsId: string;
  facebookPixelId: string;
  googleTagManagerId: string;
  customHeadCode: string;
  customFooterCode: string;
  footerCredit: string;
}

export const getWebsiteInfo = async (): Promise<WebsiteInfo> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/website/info`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch website information');
  } catch (error) {
    console.error('Error fetching website information:', error);
    // Return default values if API call fails
    return {
      siteName: 'Tutor Connect',
      siteLogo: '/Genius-Tutor-Logo.png',
      contactEmail: 'contact@tutorconnect.com',
      contactPhone: '+880-1234-567890',
      address: 'Dhaka, Bangladesh',
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: ''
      },
      seoTitle: 'Tutor Connect - Find Your Perfect Tutor',
      seoDescription: 'Connect with qualified tutors in Bangladesh for all subjects and levels.',
      seoKeywords: 'tutor, education, learning, Bangladesh, online tutoring',
      googleAnalyticsId: '',
      facebookPixelId: '',
      googleTagManagerId: '',
      customHeadCode: '',
      customFooterCode: '',
      footerCredit: '© 2025 Tutor Today. All rights reserved | Developed by <a href="https://webbytestudio.com" target="_blank" class="text-primary hover:text-primary/80 transition-colors">WebByte Studio</a>'
    };
  }
};