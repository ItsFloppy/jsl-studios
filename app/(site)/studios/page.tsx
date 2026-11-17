import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { Behaviors } from '@/components/Behaviors'
import { FeatureCard } from '@/components/FeatureCard'
import { PageShell } from '@/components/PageShell'
import { getFilms } from '@/lib/sanity.queries'

export const metadata: Metadata = {
  title: 'JSL Studios — Feature Films',
  description:
    "Inspired by the grandeur of Hollywood's golden age and the power of escapism, JSL Studios creates, develops and produces epic-scale narrative feature films.",
  alternates: { canonical: '/studios' },
}

// Films come from Sanity: re-rendered at most once a minute (ISR).
export const revalidate = 60

export default async function StudiosPage() {
  const films = await getFilms()
  // The hero's background image (set in site.css) is found late by the browser, after the
  // stylesheet: ask for it up front, as the static site did.
  preload('/assets/crop/feat-tall-ship.webp', { as: 'image', type: 'image/webp', fetchPriority: 'high' })

  return (
    <PageShell page="studios">
      <section className="studios-hero">
        <div className="studios-hero-inner">
          <div className="kicker">
            <span className="kicker-line"></span>
            <span>JSL Studios</span>
          </div>
          <div className="studios-hero-row">
            <h1>The magic of cinema is what defines our destiny</h1>
            <div className="studios-hero-copy">
              <p>
                Inspired by the grandeur of Hollywood&rsquo;s golden age and the everlasting power of escapism, JSL Studios creates,
                develops, and produces epic-scale narrative feature films.
              </p>
              <p>We invite audiences of all ages to leave reality behind and enter worlds beyond their wildest imagination.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="wrap features-sec">
        <div className="features-head" data-reveal="">
          <h2>Our features</h2>
        </div>
        {films.map((film, i) => (
          <FeatureCard key={film.id} film={film} index={i} />
        ))}
      </section>

      <Behaviors />
    </PageShell>
  )
}
