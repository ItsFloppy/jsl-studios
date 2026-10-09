import type { NetworkSector } from '@/lib/types'

/** The sector filter above the mosaic. `data-sector` is the sector's index, which the
 *  mosaic's tiles also carry (lib/behaviors/about.ts). */
export function NetworkLegend({ sectors }: { sectors: NetworkSector[] }) {
  return (
    <div className="network-legend" role="group" aria-label="Filter by sector">
      <button className="legend-pill" data-sector="all" aria-pressed="true">All</button>
      {sectors.map((s, i) => (
        <button key={s.id} className="legend-pill" data-sector={i} aria-pressed="false">
          {s.title}
        </button>
      ))}
    </div>
  )
}
