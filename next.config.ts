import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development'

// The site's policy, carried over from the static site's _headers with two concessions
// Next forces: its pages ship inline <script> payloads (no nonce is possible on
// static/ISR pages), and next/image sets an inline style. Everything else stays first
// party: images go through /_next/image, so visitors never reach cdn.sanity.io.
// 'unsafe-eval' is development only: React uses eval for its dev error overlay.
const SITE_CSP = [
  "default-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ')

// The embedded Studio is an editor-only app that talks to Sanity directly (API, live
// listeners over websockets, asset previews, its UI font, user avatars hosted anywhere),
// so it gets its own, looser policy.
const STUDIO_CSP = [
  "default-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https://cdn.sanity.io",
  // The Studio's UI font (Inter) comes from design-system-static.sanity.io.
  "font-src 'self' data: https://*.sanity.io",
  // sanity-cdn.com: Sanity's module CDN, which the Studio asks for its latest version (the
  // "new version available" notice); blocked, it logs "Failed to fetch version for package".
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io https://sanity-cdn.com https://*.sanity-cdn.com",
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
  "form-action 'self' https://*.sanity.io",
  "base-uri 'none'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join('; ')

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()',
  },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
]

// The pages the static site served as .html files; old links and bookmarks keep working.
const OLD_PAGES = ['studios', 'production', 'about', 'justin-souriau-levine']

// Only this project's images go through the image optimizer. On Netlify /_next/image is the
// Image CDN, which takes any width and quality: open to every Sanity project, it would serve
// anyone's images from this domain, and spend this account's credits doing it.
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
const SANITY_IMAGES = SANITY_PROJECT_ID
  ? [{ protocol: 'https' as const, hostname: 'cdn.sanity.io', pathname: `/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/**` }]
  : []

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // A stray lockfile higher up the disk would otherwise be taken for the workspace root.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: SANITY_IMAGES,
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      // Rules are applied in order and a later one wins for the same header key, so the
      // Studio's policy below overrides the site's for /studio.
      { source: '/:path*', headers: [...SECURITY_HEADERS, { key: 'Content-Security-Policy', value: SITE_CSP }] },
      {
        source: '/studio/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: STUDIO_CSP },
          // Sanity's login may open a provider window; same-origin would cut it off.
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
      // Fonts never change under the same name. Images carry no content hash, so they
      // are cached for a week rather than forever: give a replaced image a new file name
      // if it must show up sooner.
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/assets/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }] },
    ]
  },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      ...OLD_PAGES.map((p) => ({ source: `/${p}.html`, destination: `/${p}`, permanent: true })),
    ]
  },
}

export default nextConfig
