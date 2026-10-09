import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

// The public pages; /studio is an editing tool, kept out of search (app/robots.ts).
const PAGES = ['/', '/studios', '/production', '/about', '/justin-souriau-levine']

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((path) => ({ url: new URL(path, SITE_URL).href }))
}
