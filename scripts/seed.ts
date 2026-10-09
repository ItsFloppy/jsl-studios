/**
 * Fills a fresh Sanity dataset with the site's current content (lib/data.ts): films,
 * production categories and projects, people and team groups, network sectors and
 * partners, with their images uploaded from public/.
 *
 *   npm run seed            dry run: lists what would be created, writes nothing
 *   npm run seed -- --yes   uploads the images and creates the documents
 *
 * Safe to run again: documents get stable IDs (film-back-to-the-present, person-…) and are
 * created with createIfNotExists, so nothing edited in the Studio is ever overwritten, and
 * Sanity stores an identical image file only once.
 *
 * Needs NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_TOKEN
 * (an Editor token) in .env.local.
 */
import { createReadStream, existsSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { createClient, type SanityDocumentStub } from '@sanity/client'
import { config } from 'dotenv'
import { FILMS_STATIC, NETWORK_STATIC, PRODUCTION_STATIC, TEAM_STATIC } from '../lib/data'
import type { SiteImage } from '../lib/types'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN
const write = process.argv.includes('--yes')

if (!projectId || !token) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in .env.local (see .env.local.example).')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2025-02-19', useCdn: false })

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const ref = (_ref: string) => ({ _type: 'reference' as const, _ref })
// Lists are spaced by 10 so editors can slot something in between without renumbering.
const ordre = (i: number) => (i + 1) * 10

// ─── Images ─────────────────────────────────────────────────────────────────

const uploaded = new Map<string, string>()

/** Uploads a /public image once per run and returns its asset ID (a placeholder in dry runs). */
async function asset(src: string): Promise<string> {
  const cached = uploaded.get(src)
  if (cached) return cached
  const file = join(process.cwd(), 'public', src)
  if (!existsSync(file)) throw new Error(`missing image ${file}`)
  const id = write
    ? (await client.assets.upload('image', createReadStream(file), { filename: basename(file) }))._id
    : `dry-run:${src}`
  uploaded.set(src, id)
  return id
}

/** An image field. The alt is stored only when it differs from what the site derives
 *  on its own, so the Studio shows a value only where one was deliberately set. */
async function image(img: SiteImage, defaultAlt?: string) {
  return {
    _type: 'image' as const,
    asset: ref(await asset(img.src)),
    ...(img.alt && img.alt !== defaultAlt ? { alt: img.alt } : {}),
  }
}

// ─── Documents ──────────────────────────────────────────────────────────────

async function buildDocuments(): Promise<SanityDocumentStub[]> {
  const docs: SanityDocumentStub[] = []

  for (const [i, f] of FILMS_STATIC.entries()) {
    docs.push({
      _id: `film-${f.id}`,
      _type: 'film',
      title: f.title,
      stills: await Promise.all(
        f.stills.map(async (s, k) => ({ _key: `still${k}`, ...(await image(s, `${f.title} — still`)) })),
      ),
      genres: f.genres,
      ...(f.year ? { year: f.year } : {}),
      ...(f.directedBy ? { directedBy: f.directedBy } : {}),
      ...(f.starring ? { starring: f.starring } : {}),
      ...(f.imdbUrl ? { imdbUrl: f.imdbUrl } : {}),
      ...(f.watchUrl ? { watchUrl: f.watchUrl } : {}),
      ordre: ordre(i),
    })
  }

  for (const [ci, c] of PRODUCTION_STATIC.entries()) {
    const categoryId = `productionCategory-${c.id}`
    docs.push({ _id: categoryId, _type: 'productionCategory', title: c.title, label: c.label, ordre: ordre(ci) })
    for (const [i, p] of c.projects.entries()) {
      docs.push({
        _id: `productionProject-${p.id}`,
        _type: 'productionProject',
        client: p.client,
        title: p.title,
        category: ref(categoryId),
        thumbnail: await image(p.thumbnail, `${p.client} — ${p.title}`),
        ...(p.year ? { year: p.year } : {}),
        ...(p.videoUrl ? { videoUrl: p.videoUrl } : {}),
        ordre: ordre(i),
      })
    }
  }

  // One person per name: Justin, Christopher and Antoine each sit in two groups.
  const people = new Map<string, SanityDocumentStub>()
  for (const g of TEAM_STATIC) {
    for (const m of g.members) {
      if (people.has(m.name)) continue
      people.set(m.name, {
        _id: `person-${slug(m.name)}`,
        _type: 'person',
        name: m.name,
        ...(m.photo ? { photo: { _type: 'image', asset: ref(await asset(m.photo.src)) } } : {}),
        ...(m.bio ? { bio: m.bio } : {}),
      })
    }
  }
  docs.push(...people.values())
  for (const [gi, g] of TEAM_STATIC.entries()) {
    docs.push({
      _id: `teamGroup-${g.id}`,
      _type: 'teamGroup',
      title: g.title,
      members: g.members.map((m, k) => ({
        _key: `member${k}`,
        _type: 'teamMember',
        person: ref(`person-${slug(m.name)}`),
        role: m.role,
      })),
      ordre: ordre(gi),
    })
  }

  for (const [si, s] of NETWORK_STATIC.entries()) {
    const sectorId = `networkSector-${s.id}`
    docs.push({ _id: sectorId, _type: 'networkSector', title: s.title, ordre: ordre(si) })
    for (const [i, p] of s.partners.entries()) {
      docs.push({
        _id: `partner-${slug(p.name)}`,
        _type: 'partner',
        name: p.name,
        sector: ref(sectorId),
        relationship: p.relationship,
        visibility: p.visibility,
        invertLogo: p.invertLogo,
        ...(p.logo ? { logo: { _type: 'image', asset: ref(await asset(p.logo.src)) } } : {}),
        ...(p.url ? { url: p.url } : {}),
        ordre: ordre(i),
      })
    }
  }

  return docs
}

async function main() {
  console.log(`Sanity ${projectId}/${dataset}${write ? '' : ' (dry run: add --yes to write)'}`)
  const docs = await buildDocuments()

  const byType = new Map<string, number>()
  for (const d of docs) byType.set(d._type, (byType.get(d._type) ?? 0) + 1)
  for (const [type, n] of byType) console.log(`  ${type.padEnd(20)} ${n}`)
  console.log(`  ${'images'.padEnd(20)} ${uploaded.size}${write ? ' uploaded' : ' to upload'}`)

  if (!write) return

  const existing = new Set(
    await client.fetch<string[]>('*[_id in $ids]._id', { ids: docs.map((d) => d._id) }),
  )
  const tx = client.transaction()
  for (const d of docs) tx.createIfNotExists(d as SanityDocumentStub & { _id: string })
  await tx.commit()
  console.log(`Done: ${docs.length - existing.size} created, ${existing.size} already there (left untouched).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
