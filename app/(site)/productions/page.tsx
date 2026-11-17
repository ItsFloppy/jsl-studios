import type { Metadata } from 'next'
import { Behaviors } from '@/components/Behaviors'
import { PageShell } from '@/components/PageShell'
import { ProdCard } from '@/components/ProdCard'
import { getProductionCategories } from '@/lib/sanity.queries'

export const metadata: Metadata = {
  title: 'JSL Productions — Cinematic Storytelling for Brands',
  description:
    'JSL Productions brings cinematic storytelling to brands, companies and cultural partners: campaigns, runway films and commercials, from fashion and luxury to food, property and beyond.',
  alternates: { canonical: '/productions' },
}

// Projects come from Sanity: re-rendered at most once a minute (ISR).
export const revalidate = 60

export default async function ProductionPage() {
  const categories = await getProductionCategories()

  return (
    <PageShell page="productions">
      <section className="wrap prod-hero">
        <div className="kicker">
          <span className="kicker-line sky"></span>
          <span>JSL Productions</span>
        </div>
        <div className="prod-hero-row">
          <h1>Cinematic storytelling for brands, companies &amp; cultural partners</h1>
          <p>We bring our cinematic expertise to projects of every scale, from fashion and luxury to food, property and beyond.</p>
        </div>
      </section>

      <section className="wrap prod-groups">
        {categories.map((category, ci) => (
          <div key={category.id} className="prod-group">
            <div className="prod-group-head" data-reveal="">
              <h2>{category.title}</h2>
            </div>
            <div className="prod-grid">
              {category.projects.map((project, i) => (
                // Only the first section is above the fold: the others load lazily.
                <ProdCard key={project.id} project={project} label={category.label} index={i} eager={ci === 0} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <Behaviors />
    </PageShell>
  )
}
