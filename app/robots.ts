import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The embedded Studio is an editing tool behind a login, not content.
      disallow: ['/studio'],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).href,
  }
}
