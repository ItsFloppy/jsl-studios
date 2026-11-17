import { optimisedSrc } from '@/lib/sanity.image'
import type { NetworkSector } from '@/lib/types'

// Logos show at most about 300px wide: 640 covers them at 2x.
const LOGO_WIDTH = 640

/**
 * A highlighted sector of the Network tab (the institutional partners): its partners as one
 * row of equal tiles above the filters, rendered here rather than by the mosaic script.
 * A tile shows the partner's logo, or its name in type, and links to its site if it has one.
 */
export function PartnerBand({ sector }: { sector: NetworkSector }) {
  const labelId = `band-${sector.id}`
  return (
    <div className="partner-band" role="group" aria-labelledby={labelId}>
      <div className="kicker">
        <span className="kicker-line"></span>
        <span id={labelId}>{sector.title}</span>
      </div>
      <ul className="partner-band-list">
        {sector.partners.map((p) => {
          const body = p.logo ? (
            <img src={optimisedSrc(p.logo.src, LOGO_WIDTH)} alt={p.name} className={p.invertLogo ? 'invert' : undefined} decoding="async" />
          ) : (
            <span className="partner-band-name">{p.name}</span>
          )
          return (
            <li key={p.name}>
              {p.url ? (
                <a className="partner-band-tile" href={p.url} target="_blank" rel="noopener">
                  {body}
                </a>
              ) : (
                <div className="partner-band-tile">{body}</div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
