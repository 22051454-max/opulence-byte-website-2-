/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // AWT Hospital HMS (static build in public/awt-final): send every in-app route to its index.html.
  async rewrites() {
    return {
      fallback: [
        { source: '/awt-final', destination: '/awt-final/index.html' },
        { source: '/awt-final/:path*', destination: '/awt-final/index.html' },
      ],
    }
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
}

export default nextConfig
