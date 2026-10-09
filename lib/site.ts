/**
 * The site's main address, for canonical URLs and the sitemap. next.config.ts sets it at build
 * time from Netlify's `URL` (the custom domain once there is one), so deploy previews and
 * *.netlify.app copies point search engines at the real site. Localhost outside Netlify.
 */
export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:3000'
