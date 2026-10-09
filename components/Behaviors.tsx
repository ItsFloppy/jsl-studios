'use client'

import { useEffect } from 'react'
import { initAbout, type NetworkTile } from '@/lib/behaviors/about'
import { initSite } from '@/lib/behaviors/site'

/**
 * Starts the page scripts (reveal on scroll, hero, cycling stills, About tabs, team viewer,
 * network mosaic) once React has hydrated the page. They change the DOM directly, and a
 * change made before hydration would be seen by React as a mismatch and thrown away. Put
 * it last in the page, so every part of the page is hydrated when its effect runs.
 */
export function Behaviors({ network }: { network?: NetworkTile[] }) {
  useEffect(() => {
    initSite()
    if (network) initAbout(network)
  }, [network])
  return null
}
