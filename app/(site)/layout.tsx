import { preload } from 'react-dom'
import './site.css'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  // The display face is needed for the first paint of every page: fetch it with the
  // stylesheet rather than once the stylesheet has been parsed.
  preload('/fonts/syne-latin.woff2', { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' })
  return <>{children}</>
}
