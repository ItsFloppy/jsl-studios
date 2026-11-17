import Image from 'next/image'
import type { ProductionProject } from '@/lib/types'

// .prod-grid fits as many 250px-minimum columns as the row allows: three on a desktop.
const SIZES = '(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 440px'

/** One project of /productions: brand, title, then its season, or the category's singular
 *  name (`label`) for a project without one. */
export function ProdCard({ project, label, index, eager }: { project: ProductionProject; label: string; index: number; eager: boolean }) {
  const meta = project.season ?? label
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
        {/* A card that opens a video says so on its image. */}
        {project.videoUrl && (
          <span className="prod-play" aria-hidden="true">
            <svg viewBox="0 0 16 16" width={12} height={12} focusable="false">
              <path d="M5 3.5v9l7.5-4.5z" fill="currentColor" />
            </svg>
          </span>
        )}
      </div>
      <span className="prod-client">{project.client}</span>
      <span className="prod-title">{project.title}</span>
      <span className="prod-meta">{meta}</span>
      <svg className="prod-arrow" viewBox="4 4 16 16" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1} aria-hidden="true" focusable="false">
        <path d="M5 19 19 5M8 5h11v11" />
      </svg>
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
