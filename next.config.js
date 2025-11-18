/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standard Next.js configuration
  images: {
    domains: ['localhost', 'backend.geniustutorss.com', 'randomuser.me'],
  },
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: 'false',
  },
  // Enable server-side features
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Webpack configuration
  webpack: (config, { isServer }) => {
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
        child_process: false,
        cluster: false,
        dgram: false,
        dns: false,
        domain: false,
        events: false,
        module: false,
        punycode: false,
        querystring: false,
        readline: false,
        repl: false,
        string_decoder: false,
        sys: false,
        timers: false,
        tty: false,
        util: false,
        vm: false,
        worker_threads: false,
      };
    }
    return config;
  },
  // API rewrites for development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
