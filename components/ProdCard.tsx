import Image from 'next/image'
import type { ProductionProject } from '@/lib/types'

// .prod-grid fits as many 250px-minimum columns as the row allows: three on a desktop.
const SIZES = '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 440px'

/** One project of /productions. `label` is its category's singular name. */
export function ProdCard({ project, label, index, eager }: { project: ProductionProject; label: string; index: number; eager: boolean }) {
  const meta = [project.year, label].filter(Boolean).join(' · ')
  // Cards stagger in by grid column, as on the static site (0, 110, 220 ms).
  const delay = (index % 3) * 110
  const body = (
    <>
      <div className="prod-thumb">
        <Image
          src={project.thumbnail.src}
          alt={project.thumbnail.alt}
          width={1920}
          height={1080}
          sizes={SIZES}
          loading={eager ? 'eager' : 'lazy'}
        />
      </div>
      <span className="prod-client">{project.client}</span>
      <span className="prod-title">{project.title}</span>
      <span className="prod-meta">{meta}</span>
    </>
  )
  // Without a video the card is not a link: there is nowhere for it to go.
  return project.videoUrl ? (
    <a className="prod-card" data-reveal="" data-delay={delay || undefined} href={project.videoUrl} target="_blank" rel="noopener">
      {body}
    </a>
  ) : (
    <div className="prod-card" data-reveal="" data-delay={delay || undefined}>
      {body}
    </div>
  )
}
