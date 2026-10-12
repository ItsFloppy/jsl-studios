// The shapes the pages render. Sanity results are normalised into these in
// lib/sanity.queries.ts, and lib/data.ts holds the same shapes as the static fallback,
// so a page never knows (or cares) where its content came from.

/** An image a page can hand to next/image: a Sanity CDN URL with the editor's crop and
 *  hotspot already applied, or a /public path for the static fallback. */
export type SiteImage = {
  src: string
  alt: string
}

export type Film = {
  id: string
  title: string
  /** At least one. With two or more, the card cross-fades through them on hover. */
  stills: SiteImage[]
  genres: string[]
  year?: number
  directedBy?: string
  starring?: string
  imdbUrl?: string
  watchUrl?: string
}

/** A still's alt text when the editors leave it empty; the Studio shows it greyed in the field. */
export const stillAlt = (title: string) => `${title} — still`

export type ProductionProject = {
  id: string
  client: string
  title: string
  thumbnail: SiteImage
  year?: number
  videoUrl?: string
}

export type ProductionCategory = {
  id: string
  /** Section heading, plural: "Fashion films". */
  title: string
  /** Card meta line, singular: "Fashion film". */
  label: string
  projects: ProductionProject[]
}

export type TeamMember = {
  name: string
  role: string
  photo?: SiteImage
  bio?: string
}

export type TeamGroup = {
  id: string
  title: string
  members: TeamMember[]
}

/** How close JSL is to a partner; it weighs on the size of the partner's mosaic tile. */
export type Relationship = 'client' | 'featured' | 'network' | 'relationship' | 'conversation'

export const RELATIONSHIPS: { value: Relationship; title: string }[] = [
  { value: 'client', title: 'Client' },
  { value: 'featured', title: 'Featured' },
  { value: 'network', title: 'Network' },
  { value: 'relationship', title: 'Relationship' },
  { value: 'conversation', title: 'Conversation' },
]

export type Partner = {
  name: string
  relationship: Relationship
  /** Transparent logo. Without one, the tile shows the name in type. */
  logo?: SiteImage
  /** Light logos drawn for dark grounds are inverted to show on the light tiles. */
  invertLogo: boolean
  url?: string
  /** 1 to 5, 3 by default: how widely known the partner is, which also enlarges its tile. */
  visibility: number
}

export type NetworkSector = {
  id: string
  title: string
  partners: Partner[]
}
