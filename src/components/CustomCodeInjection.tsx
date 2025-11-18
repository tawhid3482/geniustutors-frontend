'use client';

import { useEffect } from 'react';
import { getWebsiteInfo } from '@/services/websiteService';

export const CustomCodeInjection = () => {
  useEffect(() => {
    const injectCustomCode = async () => {
      try {
        const websiteInfo = await getWebsiteInfo();
        
        // Inject custom head code
        if (websiteInfo.customHeadCode) {
          const headScript = document.createElement('div');
          headScript.innerHTML = websiteInfo.customHeadCode;
          headScript.id = 'custom-head-code';
          
          // Remove existing custom head code
          const existingHeadCode = document.getElementById('custom-head-code');
          if (existingHeadCode) {
            existingHeadCode.remove();
          }
          
          document.head.appendChild(headScript);
        }
        
        // Inject Google Analytics
        if (websiteInfo.googleAnalyticsId) {
          const gaScript = document.createElement('script');
          gaScript.async = true;
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${websiteInfo.googleAnalyticsId}`;
          document.head.appendChild(gaScript);
          
          const gaConfig = document.createElement('script');
          gaConfig.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', Date.now());
            gtag('config', '${websiteInfo.googleAnalyticsId}');
          `;
          document.head.appendChild(gaConfig);
        }
        
        // Inject Facebook Pixel
        if (websiteInfo.facebookPixelId) {
          const fbScript = document.createElement('script');
          fbScript.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${websiteInfo.facebookPixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(fbScript);
          
          const fbNoscript = document.createElement('noscript');
          fbNoscript.innerHTML = `
            <img height="1" width="1" style="display:none"
            src="https://www.facebook.com/tr?id=${websiteInfo.facebookPixelId}&ev=PageView&noscript=1"/>
          `;
          document.head.appendChild(fbNoscript);
        }
        
        // Inject Google Tag Manager
        if (websiteInfo.googleTagManagerId) {
          const gtmScript = document.createElement('script');
          gtmScript.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            Date.now(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${websiteInfo.googleTagManagerId}');
          `;
          document.head.appendChild(gtmScript);
          
          const gtmNoscript = document.createElement('noscript');
          gtmNoscript.innerHTML = `
            <iframe src="https://www.googletagmanager.com/ns.html?id=${websiteInfo.googleTagManagerId}"
            height="0" width="0" style="display:none;visibility:hidden"></iframe>
          `;
          document.body.appendChild(gtmNoscript);
        }
        
      } catch (error) {
        console.error('Error injecting custom code:', error);
      }
    };

    injectCustomCode();
  }, []);

  return null; // This component doesn't render anything
};
