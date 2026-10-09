import type { Metadata } from 'next'
import { Behaviors } from '@/components/Behaviors'
import { PageShell } from '@/components/PageShell'
import { ProdCard } from '@/components/ProdCard'
import { getProductionCategories } from '@/lib/sanity.queries'

export const metadata: Metadata = {
  title: 'JSL Production — Work for Houses & Partners',
  description:
    'JSL Production creates campaigns, commercials, fashion films and branded content for fashion houses, brands and cultural partners — with the scale and craft of cinema.',
  icons: { icon: { url: '/favicon-sky.svg', type: 'image/svg+xml' } },
}

// Projects come from Sanity: re-rendered at most once a minute (ISR).
export const revalidate = 60

export default async function ProductionPage() {
  const categories = await getProductionCategories()

  return (
    <PageShell page="production" brandTag="Production">
      <section className="wrap prod-hero">
        <div className="kicker">
          <span className="kicker-line sky"></span>
          <span>JSL Production</span>
        </div>
        <div className="prod-hero-row">
          <h1>Work made for houses and partners</h1>
          <p>Same team, same grammar as the features. The story belongs to the partner; the gaze stays ours.</p>
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
