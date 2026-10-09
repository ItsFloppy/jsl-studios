import { optimisedSrc } from '@/lib/sanity.image'
import type { TeamGroup as Group } from '@/lib/types'

// Portraits show in a 4:5 frame up to 420px wide: 828 covers it at 2x.
const PORTRAIT_WIDTH = 828

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One group of the Team tab. Each row carries everything the viewer needs to show that
 * person (lib/behaviors/about.ts reads the data- attributes): name, role, group, its
 * "02 / 08" position, portrait and bio.
 */
export function TeamGroup({ group, index }: { group: Group; index: number }) {
  const n = group.members.length
  return (
    <div className={`team-group${index % 2 === 1 ? ' alt' : ''}`}>
      <div className="team-group-head">
        <h2>{group.title}</h2>
      </div>
      {group.members.map((m, i) => (
        <div
          key={`${m.name}-${i}`}
          className="team-row"
          role="button"
          tabIndex={0}
          aria-expanded="false"
          aria-controls="team-bio"
          data-reveal=""
          data-delay={i ? i * 70 : undefined}
          data-name={m.name}
          data-role={m.role}
          data-group={group.title}
          data-index={`${pad(i + 1)} / ${pad(n)}`}
          data-photo={m.photo ? optimisedSrc(m.photo.src, PORTRAIT_WIDTH) : undefined}
          data-bio={m.bio}
        >
          <span className="t-name">{m.name}</span>
          <span className="t-role">{m.role}</span>
        </div>
      ))}
      <div className="team-group-end"></div>
    </div>
  )
}
