/**
 * Brings the existing dataset in line with lib/data.ts after the V2 review (November 2026):
 *
 * - films: genres, release year or status, director of photography, cast, clean IMDb links
 *   (text and link fields only; stills are left alone);
 * - productions: the Campaigns, Runway films and Selected credits categories (the last one
 *   stays hidden until it has projects), projects moved into them with their brand, title
 *   and season, the `year` field cleared, then the two old categories deleted;
 * - team: the new people (name only), each group's members and roles, the compact board;
 * - network: the shorter sector names, the highlighted "Institutional partners" sector with
 *   its partners (Dutchess Management moves there, four new ones by name).
 *
 *   npm run content:v2            dry run: lists the changes, writes nothing
 *   npm run content:v2 -- --yes   applies them (live on the site within about a minute)
 *
 * Run it once the code that reads the new fields is deployed. Safe to run again: it sets
 * values, creates only what is missing and deletes only what nothing references any more.
 * Portraits, bios, logos and partners outside the highlighted sector are never touched.
 */
import type { SanityDocumentStub } from '@sanity/client'
import { FILMS_STATIC, NETWORK_STATIC, PRODUCTION_STATIC, TEAM_STATIC } from '../lib/data'
import { client, dataset, ids, ordre, projectId, ref, write } from './shared'

type Patch = { id: string; set: Record<string, unknown>; unset?: string[] }

// The categories this update replaces, and the one it adds empty (not in lib/data.ts: an
// empty category would leave a heading over nothing in the static fallback).
const OLD_CATEGORIES = [ids.category('fashion-films'), ids.category('brand-campaigns')]
const SELECTED_CREDITS = {
  _id: ids.category('selected-credits'),
  _type: 'productionCategory',
  title: 'Selected credits',
  label: 'Selected credit',
  ordre: ordre(PRODUCTION_STATIC.length),
}

/** The defined entries of `o` only: a field missing from lib/data.ts is left as it is. */
const defined = (o: Record<string, unknown>) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))

function plan() {
  const creates: SanityDocumentStub[] = []
  const patches: Patch[] = []

  // ─── Films ───
  for (const f of FILMS_STATIC) {
    patches.push({
      id: ids.film(f.id),
      set: defined({
        genres: f.genres,
        rating: f.rating,
        year: f.year,
        status: f.status,
        directedBy: f.directedBy,
        cinematographer: f.cinematographer,
        starring: f.starring,
        imdbUrl: f.imdbUrl,
        trailerUrl: f.trailerUrl,
        watchUrl: f.watchUrl,
      }),
    })
  }

  // ─── Productions ───
  for (const [ci, c] of PRODUCTION_STATIC.entries()) {
    const categoryId = ids.category(c.id)
    creates.push({ _id: categoryId, _type: 'productionCategory', title: c.title, label: c.label, ordre: ordre(ci) })
    patches.push({ id: categoryId, set: { title: c.title, label: c.label, ordre: ordre(ci) } })
    for (const [i, p] of c.projects.entries()) {
      patches.push({
        id: ids.project(p.id),
        set: defined({ client: p.client, title: p.title, category: ref(categoryId), season: p.season, ordre: ordre(i) }),
        unset: ['year'],
      })
    }
  }
  creates.push(SELECTED_CREDITS)

  // ─── Team ───
  const people = new Set<string>()
  for (const g of TEAM_STATIC) for (const m of g.members) people.add(m.name)
  for (const name of people) creates.push({ _id: ids.person(name), _type: 'person', name })
  for (const [gi, g] of TEAM_STATIC.entries()) {
    patches.push({
      id: ids.group(g.id),
      set: {
        title: g.title,
        compact: g.compact,
        ordre: ordre(gi),
        members: g.members.map((m, k) => ({
          _key: `member${k}`,
          _type: 'teamMember',
          person: ref(ids.person(m.name)),
          role: m.role,
        })),
      },
    })
  }

  // ─── Network ───
  for (const [si, s] of NETWORK_STATIC.entries()) {
    const sectorId = ids.sector(s.id)
    creates.push({ _id: sectorId, _type: 'networkSector', title: s.title, highlight: s.highlight, ordre: ordre(si) })
    patches.push({ id: sectorId, set: { title: s.title, highlight: s.highlight, ordre: ordre(si) } })
    // Only the highlighted sector's partners: the others keep whatever the editors set.
    if (!s.highlight) continue
    for (const [i, p] of s.partners.entries()) {
      const fields = defined({
        name: p.name,
        sector: ref(sectorId),
        relationship: p.relationship,
        visibility: p.visibility,
        invertLogo: p.invertLogo,
        url: p.url,
        ordre: ordre(i),
      })
      creates.push({ _id: ids.partner(p.name), _type: 'partner', ...fields })
      patches.push({ id: ids.partner(p.name), set: fields })
    }
  }

  return { creates, patches }
}

const show = (v: unknown) => {
  const s = JSON.stringify(v)
  return s.length > 110 ? s.slice(0, 107) + '…' : s
}

async function main() {
  console.log(`Sanity ${projectId}/${dataset}${write ? '' : ' (dry run: add --yes to write)'}\n`)
  const { creates, patches } = plan()

  const touched = [...new Set([...creates.map((d) => d._id!), ...patches.map((p) => p.id), ...OLD_CATEGORIES])]
  const existing = new Set(await client.fetch<string[]>('*[_id in $ids]._id', { ids: touched }))
  // Drafts are only visible in the raw perspective (the client reads published documents).
  const drafts = await client.fetch<string[]>('*[_id in $ids]._id', { ids: touched.map((id) => `drafts.${id}`) }, { perspective: 'raw' })

  const toCreate = creates.filter((d) => !existing.has(d._id!))
  const willExist = new Set([...existing, ...toCreate.map((d) => d._id!)])
  const toPatch = patches.filter((p) => willExist.has(p.id))
  const missing = patches.filter((p) => !willExist.has(p.id))

  console.log(`Create (${toCreate.length}):`)
  for (const d of toCreate) console.log(`  + ${d._id}  ${show('name' in d ? d.name : d.title)}`)
  console.log(`\nUpdate (${toPatch.length}):`)
  for (const p of toPatch) {
    console.log(`  ~ ${p.id}`)
    for (const [k, v] of Object.entries(p.set)) console.log(`      ${k}: ${show(v)}`)
    if (p.unset?.length) console.log(`      unset: ${p.unset.join(', ')}`)
  }
  console.log(`\nDelete once nothing references them: ${OLD_CATEGORIES.filter((id) => existing.has(id)).join(', ') || '(already gone)'}`)
  if (missing.length) console.log(`\nNot in the dataset, skipped: ${missing.map((p) => p.id).join(', ')}`)
  if (drafts.length) {
    console.log(`\nWARNING: unpublished drafts exist for ${drafts.join(', ')}.`)
    console.log('Publishing one of them later would put its old values back: discard them in the Studio first.')
  }

  if (!write) return

  // One transaction: the new documents exist before the projects and groups point at them.
  const tx = client.transaction()
  for (const d of toCreate) tx.createIfNotExists(d as SanityDocumentStub & { _id: string })
  for (const p of toPatch) {
    tx.patch(p.id, (patch) => {
      const next = patch.set(p.set)
      return p.unset?.length ? next.unset(p.unset) : next
    })
  }
  await tx.commit()
  console.log(`\nDone: ${toCreate.length} created, ${toPatch.length} updated.`)

  // Then the old categories, now that no project points at them.
  for (const id of OLD_CATEGORIES) {
    if (!existing.has(id)) continue
    // Raw perspective: a draft still pointing at it counts too.
    const refs = await client.fetch<number>('count(*[references($id)])', { id }, { perspective: 'raw' })
    if (refs) {
      console.log(`Kept ${id}: ${refs} document(s) still point at it.`)
      continue
    }
    await client.delete(id)
    console.log(`Deleted ${id}.`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
