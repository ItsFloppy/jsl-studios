import type { Metadata } from 'next'
import { PageShell } from '@/components/PageShell'
import './(site)/site.css'

// Unknown URLs land here, under the bare root layout (app/(site)/layout.tsx does not apply),
// so this page brings the site's stylesheet itself. The Studio's own routes never get here:
// /studio/[[...tool]] catches all of them.
export const metadata: Metadata = {
  title: 'Page not found — JSL Studios',
}

export default function NotFound() {
  return (
    <PageShell page="not-found">
      <section className="wrap prod-hero">
        <div className="kicker">
          <span className="kicker-line"></span>
          <span>404</span>
        </div>
        <div className="prod-hero-row">
          <h1>This page does not exist</h1>
          <p>The link may be out of date, or the page has moved. Everything JSL makes is a click away from the home page.</p>
        </div>
      </section>
      <section className="wrap not-found-actions">
        <a className="btn" href="/">Back to the home page</a>
      </section>
    </PageShell>
  )
}
