import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { SITE_URL } from '@/lib/site'
import './site.css'

// Each page sets its title, description and canonical path; relative URLs resolve against
// the site's main address.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  openGraph: { siteName: 'JSL Studios', type: 'website', locale: 'en_US' },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // The display face is needed for the first paint of every page: fetch it with the
  // stylesheet rather than once the stylesheet has been parsed.
  preload('/fonts/syne-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  return <>{children}</>
}
