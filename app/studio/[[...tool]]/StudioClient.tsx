'use client'

// The config holds React components and functions, which cannot cross from a server
// component to a client one: the Studio is therefore mounted from this client file, and
// page.tsx (a server component) only exports the metadata.
import { NextStudio } from 'next-sanity/studio/client-component'
import { isSanityConfigured } from '../../../lib/sanity.client'
import config from '../../../sanity.config'

export default function StudioClient() {
  // Without a project the Studio throws ("Configuration must contain projectId") and the
  // route answers 500. Say what is missing instead.
  if (!isSanityConfigured) {
    return (
      <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 560, margin: '15vh auto', padding: '0 24px', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: 22 }}>Sanity n’est pas encore configuré</h1>
        <p>
          Renseignez <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (et <code>NEXT_PUBLIC_SANITY_DATASET</code>) dans{' '}
          <code>.env.local</code> en local, ou dans les variables d’environnement Netlify, puis relancez le site.
        </p>
      </main>
    )
  }
  return <NextStudio config={config} />
}
