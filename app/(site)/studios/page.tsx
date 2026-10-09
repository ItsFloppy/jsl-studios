import type { Metadata } from 'next'
import { preload } from 'react-dom'
import { Behaviors } from '@/components/Behaviors'
import { FeatureCard } from '@/components/FeatureCard'
import { PageShell } from '@/components/PageShell'
import { getFilms } from '@/lib/sanity.queries'

export const metadata: Metadata = {
  title: 'JSL Studios — Feature Films',
  description:
    'Inspired by the grandeur of classical Hollywood cinema and the power of escapism, JSL Studios creates feature films that invite audiences to leave reality behind.',
}

// Films come from Sanity: re-rendered at most once a minute (ISR).
export const revalidate = 60

export default async function StudiosPage() {
  const films = await getFilms()
  // The hero's background image (set in site.css) is found late by the browser, after the
  // stylesheet: ask for it up front, as the static site did.
  preload('/assets/crop/feat-tall-ship.webp', { as: 'image', type: 'image/webp', fetchPriority: 'high' })

  return (
    <PageShell page="studios" brandTag="Studios">
      <section className="studios-hero">
        <div className="studios-hero-inner">
          <div className="kicker">
            <span className="kicker-line"></span>
            <span>JSL Studios</span>
          </div>
          <div className="studios-hero-row">
            <h1>Cinema is where our story begins</h1>
            <p>
              Inspired by the grandeur of classical Hollywood cinema and the power of escapism, we create films that invite audiences to
              leave reality behind — and enter a world of their own.
            </p>
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
