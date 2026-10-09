import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The embedded Studio is an editing tool behind a login, not content.
      disallow: ['/studio'],
    },
  }
}
