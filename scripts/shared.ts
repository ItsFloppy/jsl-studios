/**
 * What the dataset scripts (seed.ts, content-v2.ts) share: the write client, the --yes
 * switch, and the helpers that derive document IDs. Both must build the same IDs from
 * lib/data.ts, or a later run would create duplicates instead of finding the documents.
 */
import { resolve } from 'node:path'
import { createClient } from '@sanity/client'
import { config } from 'dotenv'

config({ path: resolve(process.cwd(), '.env.local'), quiet: true })

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN

/** Without --yes a script only reports what it would do. */
export const write = process.argv.includes('--yes')

if (!projectId || !token) {
  console.error('NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN must be set in .env.local (see "Running it" in the README).')
  process.exit(1)
}

export const client = createClient({ projectId, dataset, token, apiVersion: '2025-02-19', useCdn: false })

/** "François Grunenwald" → "francois-grunenwald": the stable part of a document ID. */
export const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const ref = (_ref: string) => ({ _type: 'reference' as const, _ref })

/** Lists are spaced by 10 so editors can slot something in between without renumbering. */
export const ordre = (i: number) => (i + 1) * 10

// The IDs of each document type, as the seed first created them.
export const ids = {
  film: (id: string) => `film-${id}`,
  category: (id: string) => `productionCategory-${id}`,
  project: (id: string) => `productionProject-${id}`,
  person: (name: string) => `person-${slug(name)}`,
  group: (id: string) => `teamGroup-${id}`,
  sector: (id: string) => `networkSector-${id}`,
  partner: (name: string) => `partner-${slug(name)}`,
}
