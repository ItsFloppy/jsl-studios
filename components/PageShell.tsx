import { SiteFooter } from './SiteFooter'
import { SiteHeader } from './SiteHeader'

export type PageKey = 'home' | 'studios' | 'production' | 'about' | 'justin'

/**
 * Header, <main> and footer of a site page. The wrapper carries `data-page`, which the
 * static site set on <body>: it picks the accent colour and the active nav link in
 * site.css. Every page shares one root layout with the Studio, so <body> cannot know the
 * page; the wrapper is `display: contents` and adds no box of its own.
 */
export function PageShell({ page, brandTag, children }: { page: PageKey; brandTag?: string; children: React.ReactNode }) {
  return (
    <div className="page-root" data-page={page}>
      <SiteHeader brandTag={brandTag} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
