import Image from 'next/image'
import { optimisedSrc } from '@/lib/sanity.image'
import type { Film } from '@/lib/types'

// The media column is two thirds of the card on wide screens, the full width once the
// card wraps (the .feature-media / .feature-info flex bases in site.css).
const SIZES = '(max-width: 760px) 100vw, min(62vw, 880px)'
// The width the hover cycle loads its frames at: script-swapped frames get one src.
const CYCLE_WIDTH = 1200

function Actions({ film }: { film: Film }) {
  const buttons = [
    film.imdbUrl && (
      <a key="imdb" className="btn btn-sm" href={film.imdbUrl} target="_blank" rel="noopener">
        View on IMDb<span className="btn-arrow">↗</span>
      </a>
    ),
    film.watchUrl && (
      <a key="watch" className="btn btn-sm btn-fill" href={film.watchUrl} target="_blank" rel="noopener">
        Watch Now
      </a>
    ),
  ].filter(Boolean)
  if (!buttons.length) return null
  // One button sits on its own; two are grouped so they line up side by side.
  return buttons.length > 1 ? <div className="feature-actions">{buttons}</div> : buttons[0]
}

/** One film of /studios. Odd cards put the image on the right. */
export function FeatureCard({ film, index }: { film: Film; index: number }) {
  const flip = index % 2 === 1
  const first = film.stills[0]
  // The first card is above the fold: no lazy loading for its image.
  const loading = index === 0 ? 'eager' : 'lazy'
  const cycle = film.stills.length > 1 ? film.stills.map((s) => optimisedSrc(s.src, CYCLE_WIDTH)) : null
  const facts = [
    film.year && ['Year', String(film.year)],
    film.directedBy && ['Written and directed by', film.directedBy],
    film.starring && ['Starring', film.starring],
  ].filter(Boolean) as [string, string][]

  return (
    <article className="feature-card" data-reveal="">
      <div className={`feature-media${flip ? ' order-2' : ''}`} data-cycle={cycle?.join(',')}>
        {cycle ? (
          <>
            {/* Two stacked frames the hover script cross-fades between (lib/behaviors/site.ts). */}
            <img data-cycle-img="0" src={cycle[0]} alt={first.alt} loading={loading} />
            <img data-cycle-img="1" src={cycle[0]} alt="" aria-hidden="true" loading={loading} />
          </>
        ) : (
          <Image src={first.src} alt={first.alt} width={1920} height={1080} sizes={SIZES} loading={loading} />
        )}
      </div>
      <div className={`feature-info${flip ? ' order-1' : ''}`}>
        <h2 className="feature-title">{film.title}</h2>
        {film.genres.length > 0 && (
          <div className="feature-tags">
            {film.genres.map((g) => (
              <span key={g} className="tag-pill">{g}</span>
            ))}
          </div>
        )}
        {facts.length > 0 && (
          <dl className="feature-facts">
            {facts.map(([dt, dd]) => (
              <div key={dt} className="feature-fact">
                <dt>{dt}</dt>
                <dd>{dd}</dd>
              </div>
            ))}
          </dl>
        )}
        <Actions film={film} />
      </div>
    </article>
  )
}
