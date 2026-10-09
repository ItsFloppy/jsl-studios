import { createImageUrlBuilder, type SanityImageSource } from '@sanity/image-url'
import { SANITY_DATASET, SANITY_PROJECT_ID } from './sanity.client'

const builder = createImageUrlBuilder({ projectId: SANITY_PROJECT_ID || 'placeholder', dataset: SANITY_DATASET })

/**
 * The editor's crop and hotspot, applied by Sanity, at the given frame size. The result is
 * a cdn.sanity.io URL that is only ever fetched by next/image (server side): visitors get
 * the image from this site's /_next/image, never from Sanity.
 */
export function croppedUrl(source: SanityImageSource, width: number, height: number): string {
  return builder.image(source).width(width).height(height).fit('crop').url()
}

/** The whole image, no crop, at most `width` wide: for logos, which must never be cut. */
export function fullUrl(source: SanityImageSource, width: number): string {
  return builder.image(source).width(width).fit('max').url()
}

/**
 * The /_next/image URL for `src` at one fixed width, for the few images that are not
 * rendered by <Image> but swapped in by script (feature stills cycling on hover, team
 * portraits, network logos): a script can only set one `src`, not a `srcset`. This is the
 * URL next/image's default loader builds; `width` must be one of the configured sizes
 * (640, 750, 828, 1080, 1200, 1920, 2048, 3840 or 32 to 384).
 */
export function optimisedSrc(src: string, width: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`
}
