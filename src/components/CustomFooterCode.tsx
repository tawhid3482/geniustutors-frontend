'use client';

import { useEffect } from 'react';
import { getWebsiteInfo } from '@/services/websiteService';

export const CustomFooterCode = () => {
  useEffect(() => {
    const injectFooterCode = async () => {
      try {
        const websiteInfo = await getWebsiteInfo();
        
        // Inject custom footer code
        if (websiteInfo.customFooterCode) {
          const footerScript = document.createElement('div');
          footerScript.innerHTML = websiteInfo.customFooterCode;
          footerScript.id = 'custom-footer-code';
          
          // Remove existing custom footer code
          const existingFooterCode = document.getElementById('custom-footer-code');
          if (existingFooterCode) {
            existingFooterCode.remove();
          }
          
          // Insert before closing body tag
          document.body.appendChild(footerScript);
        }
        
      } catch (error) {
        console.error('Error injecting footer code:', error);
      }
    };

    injectFooterCode();
  }, []);

  return null; // This component doesn't render anything
};
