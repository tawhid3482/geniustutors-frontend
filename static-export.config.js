/**
 * Static Export Configuration
 * This file contains configuration for static export deployment
 */

module.exports = {
  // Output directory for static files
  outputDir: 'out',
  
  // Base path for the application (if deploying to a subdirectory)
  basePath: '',
  
  // Trailing slash configuration
  trailingSlash: true,
  
  // Image optimization settings for static export
  images: {
    unoptimized: true,
    loader: 'default',
  },
  
  // Environment variables for static export
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
    NEXT_PUBLIC_STATIC_EXPORT: 'true',
  },
  
  // Build optimization for static export
  experimental: {
    // Disable features that don't work with static export
    appDir: true,
    serverComponents: false,
  },
  
  // Webpack configuration for static export
  webpack: (config, { isServer, dev }) => {
    // Ensure client-side only code is properly handled
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    return config;
  },
};
