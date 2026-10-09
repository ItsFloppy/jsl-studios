import { createClient } from '@sanity/client'

export const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'

/** False until the project ID is set: the site then renders the static content of lib/data.ts. */
export const isSanityConfigured = SANITY_PROJECT_ID !== ''

const base = {
  // createClient throws on an empty project ID, which would break every import of this
  // module before Sanity is set up. The placeholder is never queried: lib/sanity.queries.ts
  // checks isSanityConfigured first.
  projectId: SANITY_PROJECT_ID || 'placeholder',
  dataset: SANITY_DATASET,
  apiVersion: '2025-02-19',
}

/**
 * Read client for the public site. Goes through Sanity's API CDN: fast, and at most a
 * few seconds behind a publish, which the 60 s ISR window absorbs anyway. Only published
 * documents are ever returned: the dataset is read without a token.
 */
export const sanityClient = createClient({ ...base, useCdn: true, perspective: 'published' })
