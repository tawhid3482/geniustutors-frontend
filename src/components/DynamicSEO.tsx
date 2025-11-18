'use client';

import { useEffect } from 'react';
import { getWebsiteInfo } from '@/services/websiteService';

export const DynamicSEO = () => {
  useEffect(() => {
    const updateSEO = async () => {
      try {
        const websiteInfo = await getWebsiteInfo();
        
        // Update page title
        if (websiteInfo.seoTitle) {
          document.title = websiteInfo.seoTitle;
        }
        
        // Update meta description
        if (websiteInfo.seoDescription) {
          let metaDescription = document.querySelector('meta[name="description"]');
          if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
          }
          metaDescription.setAttribute('content', websiteInfo.seoDescription);
        }
        
        // Update meta keywords
        if (websiteInfo.seoKeywords) {
          let metaKeywords = document.querySelector('meta[name="keywords"]');
          if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.setAttribute('name', 'keywords');
            document.head.appendChild(metaKeywords);
          }
          metaKeywords.setAttribute('content', websiteInfo.seoKeywords);
        }
        
        // Update Open Graph tags
        if (websiteInfo.seoTitle) {
          let ogTitle = document.querySelector('meta[property="og:title"]');
          if (!ogTitle) {
            ogTitle = document.createElement('meta');
            ogTitle.setAttribute('property', 'og:title');
            document.head.appendChild(ogTitle);
          }
          ogTitle.setAttribute('content', websiteInfo.seoTitle);
        }
        
        if (websiteInfo.seoDescription) {
          let ogDescription = document.querySelector('meta[property="og:description"]');
          if (!ogDescription) {
            ogDescription = document.createElement('meta');
            ogDescription.setAttribute('property', 'og:description');
            document.head.appendChild(ogDescription);
          }
          ogDescription.setAttribute('content', websiteInfo.seoDescription);
        }
        
        // Update Twitter Card tags
        if (websiteInfo.seoTitle) {
          let twitterTitle = document.querySelector('meta[name="twitter:title"]');
          if (!twitterTitle) {
            twitterTitle = document.createElement('meta');
            twitterTitle.setAttribute('name', 'twitter:title');
            document.head.appendChild(twitterTitle);
          }
          twitterTitle.setAttribute('content', websiteInfo.seoTitle);
        }
        
        if (websiteInfo.seoDescription) {
          let twitterDescription = document.querySelector('meta[name="twitter:description"]');
          if (!twitterDescription) {
            twitterDescription = document.createElement('meta');
            twitterDescription.setAttribute('name', 'twitter:description');
            document.head.appendChild(twitterDescription);
          }
          twitterDescription.setAttribute('content', websiteInfo.seoDescription);
        }
        
      } catch (error) {
        console.error('Error updating SEO:', error);
      }
    };

    updateSEO();
  }, []);

  return null; // This component doesn't render anything
};
