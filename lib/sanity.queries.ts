import type { SanityImageSource } from '@sanity/image-url'
import { FILMS_STATIC, NETWORK_STATIC, PRODUCTION_STATIC, TEAM_STATIC } from './data'
import { isSanityConfigured, sanityClient } from './sanity.client'
import { croppedUrl, fullUrl } from './sanity.image'
import {
  RELATIONSHIPS,
  type Film,
  type NetworkSector,
  type Partner,
  type ProductionCategory,
  type ProductionProject,
  type Relationship,
  type SiteImage,
  type TeamGroup,
  type TeamMember,
} from './types'

// Each getX() follows the same contract: the static content of lib/data.ts when Sanity is
// not configured, returns nothing or fails; otherwise Sanity's content, normalised to the
// shapes of lib/types.ts. Pages re-render at most once a minute (ISR), so a publish in the
// Studio shows on the site within about 60 s, with no rebuild.
const REVALIDATE = { next: { revalidate: 60 } }

// Source sizes asked of Sanity, with the crop and hotspot applied. next/image then serves
// each visitor a smaller copy, so these only need to cover the largest display at 2x.
const STILL = { width: 1920, height: 1080 } // 16:9 frames: feature stills, production thumbs
const PORTRAIT = { width: 960, height: 1200 } // 4:5 team portraits
const LOGO_WIDTH = 1200 // logos are never cropped

// The fields urlFor() needs to honour the editor's crop and hotspot.
const IMAGE_PROJ = '{ asset, crop, hotspot, alt }'
const ORDER = 'order(ordre asc, _createdAt asc)'

async function fetchOr<T>(label: string, query: string, normalise: (raw: unknown) => T[], fallback: T[]): Promise<T[]> {
  if (!isSanityConfigured) return fallback
  try {
    const items = normalise(await sanityClient.fetch<unknown>(query, {}, REVALIDATE))
    // An empty dataset (before the first seed) keeps the site whole rather than blank.
    return items.length ? items : fallback
  } catch (err) {
    // A render that throws freezes the page in ISR: the old copy stays cached and every
    // regeneration fails. Falling back keeps the site up while the error is logged.
    console.error(`[sanity] ${label}: falling back to static content`, err)
    return fallback
  }
}

// ─── Normalisation ──────────────────────────────────────────────────────────
// The schema requires only a few fields; anything else can arrive null through GROQ and
// would crash a component (.map, .length…). These functions honour the non-nullable types
// the components rely on, and drop whatever cannot be rendered.

type RawImage = (SanityImageSource & { asset?: unknown; alt?: string | null }) | null | undefined

const str = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() ? v.trim() : undefined)
const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const hasAsset = (img: RawImage): img is NonNullable<RawImage> => !!img && !!img.asset

function cropped(img: RawImage, size: { width: number; height: number }, defaultAlt: string): SiteImage | undefined {
  if (!hasAsset(img)) return undefined
  return { src: croppedUrl(img, size.width, size.height), alt: str(img.alt) ?? defaultAlt }
}

function normaliseFilms(raw: unknown): Film[] {
  return list(raw).flatMap((r) => {
    const f = r as Record<string, unknown>
    const id = str(f.id)
    const title = str(f.title)
    if (!id || !title) return []
    const stills = list(f.stills).flatMap((s) => cropped(s as RawImage, STILL, `${title} — still`) ?? [])
    // A card is built around its stills: one without any cannot be laid out.
    if (!stills.length) return []
    return [
      {
        id,
        title,
        stills,
        genres: list(f.genres).flatMap((g) => str(g) ?? []),
        year: num(f.year),
        directedBy: str(f.directedBy),
        starring: str(f.starring),
        imdbUrl: str(f.imdbUrl),
        watchUrl: str(f.watchUrl),
      },
    ]
  })
}

function normaliseProject(r: unknown): ProductionProject[] {
  const p = r as Record<string, unknown>
  const id = str(p.id)
  const client = str(p.client)
  const title = str(p.title)
  if (!id || !client || !title) return []
  const thumbnail = cropped(p.thumbnail as RawImage, STILL, `${client} — ${title}`)
  if (!thumbnail) return []
  return [{ id, client, title, thumbnail, year: num(p.year), videoUrl: str(p.videoUrl) }]
}

function normaliseProduction(raw: unknown): ProductionCategory[] {
  return list(raw).flatMap((r) => {
    const c = r as Record<string, unknown>
    const id = str(c.id)
    const title = str(c.title)
    if (!id || !title) return []
    const projects = list(c.projects).flatMap(normaliseProject)
    // An empty category would leave a heading over nothing.
    if (!projects.length) return []
    return [{ id, title, label: str(c.label) ?? title, projects }]
  })
}

function normaliseTeam(raw: unknown): TeamGroup[] {
  return list(raw).flatMap((r) => {
    const g = r as Record<string, unknown>
    const id = str(g.id)
    const title = str(g.title)
    if (!id || !title) return []
    const members = list(g.members).flatMap((m): TeamMember[] => {
      const row = m as { role?: unknown; person?: Record<string, unknown> | null }
      // A reference to an unpublished or deleted person resolves to null.
      const name = str(row.person?.name)
      const role = str(row.role)
      if (!name || !role) return []
      return [
        {
          name,
          role,
          photo: cropped(row.person?.photo as RawImage, PORTRAIT, `${name} — portrait`),
          bio: str(row.person?.bio),
        },
      ]
    })
    if (!members.length) return []
    return [{ id, title, members }]
  })
}

const RELATIONSHIP_VALUES = RELATIONSHIPS.map((r) => r.value)

function normaliseNetwork(raw: unknown): NetworkSector[] {
  return list(raw).flatMap((r) => {
    const s = r as Record<string, unknown>
    const id = str(s.id)
    const title = str(s.title)
    if (!id || !title) return []
    const partners = list(s.partners).flatMap((x): Partner[] => {
      const p = x as Record<string, unknown>
      const name = str(p.name)
      if (!name) return []
      const relationship = RELATIONSHIP_VALUES.includes(p.relationship as Relationship)
        ? (p.relationship as Relationship)
        : 'network'
      const logo = p.logo as RawImage
      const visibility = num(p.visibility)
      return [
        {
          name,
          relationship,
          logo: hasAsset(logo) ? { src: fullUrl(logo, LOGO_WIDTH), alt: name } : undefined,
          invertLogo: p.invertLogo === true,
          url: str(p.url),
          visibility: visibility && visibility >= 1 && visibility <= 5 ? visibility : 3,
        },
      ]
    })
    if (!partners.length) return []
    return [{ id, title, partners }]
  })
}

// ─── Queries ────────────────────────────────────────────────────────────────

export function getFilms(): Promise<Film[]> {
  return fetchOr(
    'films',
    `*[_type == "film"] | ${ORDER} {
      "id": _id, title, genres, year, directedBy, starring, imdbUrl, watchUrl,
      "stills": stills[]${IMAGE_PROJ}
    }`,
    normaliseFilms,
    FILMS_STATIC,
  )
}

export function getProductionCategories(): Promise<ProductionCategory[]> {
  return fetchOr(
    'production',
    `*[_type == "productionCategory"] | ${ORDER} {
      "id": _id, title, label,
      "projects": *[_type == "productionProject" && category._ref == ^._id] | ${ORDER} {
        "id": _id, client, title, year, videoUrl, "thumbnail": thumbnail${IMAGE_PROJ}
      }
    }`,
    normaliseProduction,
    PRODUCTION_STATIC,
  )
}

export function getTeamGroups(): Promise<TeamGroup[]> {
  return fetchOr(
    'team',
    `*[_type == "teamGroup"] | ${ORDER} {
      "id": _id, title,
      "members": members[]{ role, "person": person->{ name, bio, "photo": photo${IMAGE_PROJ} } }
    }`,
    normaliseTeam,
    TEAM_STATIC,
  )
}

export function getNetwork(): Promise<NetworkSector[]> {
  return fetchOr(
    'network',
    `*[_type == "networkSector"] | ${ORDER} {
      "id": _id, title,
      "partners": *[_type == "partner" && sector._ref == ^._id] | ${ORDER} {
        name, relationship, invertLogo, url, visibility, "logo": logo${IMAGE_PROJ}
      }
    }`,
    normaliseNetwork,
    NETWORK_STATIC,
  )
}
