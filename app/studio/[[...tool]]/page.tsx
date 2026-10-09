import type { Metadata } from 'next'
import { metadata as studioMetadata, viewport } from 'next-sanity/studio'
import StudioClient from './StudioClient'

// Keep the embedded Studio out of the search index.
export const metadata: Metadata = {
  ...studioMetadata,
  title: 'Studio — JSL Studios',
  robots: { index: false, follow: false },
}

export { viewport }

// The Studio is a client-side app: the page around it never changes, so it is rendered
// once and served from cache rather than running a Netlify function on every visit.
export const dynamic = 'force-static'

export default function StudioPage() {
  return <StudioClient />
}
