# JSL Studios — website

The JSL Studios site, built from
[the design project](https://claude.ai/design/p/8ac94c6f-5896-42b3-ba35-986f3650a647), as a
Next.js (App Router, TypeScript) app with an embedded Sanity Studio at **`/studio`**.

Films, production projects, the team and the network are edited in the Studio and appear on
the site within about a minute, with no rebuild. The rest of the copy (home page, story,
Justin's page, contact) lives in the page components. The architecture mirrors
`Perso/chantemiel-v2`; `CLAUDE.md` is the reference for working on the code.

## Running it

```
npm install
npm run dev
```

Before the first run, create `.env.local` (ignored by git) with:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=q9eq1v3z
NEXT_PUBLIC_SANITY_DATASET=production
# Only for npm run seed: an Editor token from sanity.io/manage → API → Tokens
SANITY_API_TOKEN=
```

Open <http://localhost:3000/>; the Studio is at <http://localhost:3000/studio>. Node 22.12 or
newer is required (Sanity's minimum).

Without `NEXT_PUBLIC_SANITY_PROJECT_ID` the site still runs, entirely on the static content of
`lib/data.ts` (the site as it was before Sanity); `/studio` then says what is missing.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` then `npm start` | Production build, served locally. ISR (the 60 s refresh) only runs in this mode, not in `dev` |
| `npm run lint` / `npm run typecheck` | ESLint / TypeScript |
| `npm run seed` | Dry run of the dataset seed; `npm run seed -- --yes` writes it (see below) |

## Editing content

Everything is under <https://the-site/studio>, after signing in with a Sanity account invited to
the project:

| Studio section | On the site |
| --- | --- |
| **Studio → Films** | `/studios`: one card per film, alternating left and right |
| **Production → Projets / Catégories** | `/production`: one section per category, one card per project |
| **Équipe → Groupes / Personnes** | `/about#team`: the groups (Board, Team, Consultants) and the people in them |
| **Network → Partenaires / Secteurs** | `/about#network`: the mosaic and its filter buttons |

- **Publishing.** Changes go live when published (not while in draft), within about 60 s.
- **Order.** Lists follow their `Ordre` field, smallest first; leave gaps (10, 20, 30…) to slot
  things in. Members of a team group follow the order of the group's list (drag and drop).
- **People and roles.** A person is entered once (name, portrait, bio); the role belongs to
  the group membership, because the same person can have a different role in each group.
  A new person can be created straight from a group's member list.
- **Partners.** The tile size comes from *Relation* (client is largest) plus *Notoriété*
  (1–5). A light logo drawn for dark backgrounds needs *Inverser les couleurs du logo*. With
  no logo, the tile shows the name in type.
- **Images.** Set the hotspot (focal point) on stills, thumbnails and portraits: the site crops
  them to 16:9 or 4:5 around it. An empty optional field (year, cast, IMDb or Watch Now link,
  video link) leaves its line or button out.

Editors are invited from sanity.io/manage (the free plan has 20 seats).

### Seeding a fresh dataset

`scripts/seed.ts` pushes the content of `lib/data.ts` into the dataset and uploads its images
from `public/`. It needs an Editor token in `.env.local` (`SANITY_API_TOKEN`). Documents get
stable IDs (`film-back-to-the-present`, `person-gordon-caplan`…) and are created with
`createIfNotExists`, so running it again never overwrites what was edited in the Studio.

## Layout

| Path | What it is |
| --- | --- |
| `app/(site)/page.tsx` → `/` | Home: split hero, "who we are", frame reel, newsletter, contact |
| `app/(site)/studios/page.tsx` → `/studios` | Feature films (Sanity) |
| `app/(site)/production/page.tsx` → `/production` | Production projects by category (Sanity) |
| `app/(site)/about/page.tsx` → `/about` | Four tabs: story, team (Sanity), network (Sanity), contact |
| `app/(site)/justin-souriau-levine/page.tsx` | Founder profile |
| `app/(site)/site.css` | All site styling, including the `@font-face` rules |
| `app/studio/[[...tool]]/` | The embedded Studio |
| `app/api/newsletter/route.ts` | Newsletter sign-ups, passed on to Mailchimp from the server |
| `app/favicon.ico`, `icon.png`, `apple-icon.png` | Favicons, made from `brand/jsl-logo.png` (the 2000 px master, not served) |
| `components/` | Header, footer, page shell, cards, team group, network filter, `Behaviors` |
| `lib/sanity.queries.ts` | `getFilms()`, `getProductionCategories()`, `getTeamGroups()`, `getNetwork()` |
| `lib/data.ts`, `lib/types.ts` | Static fallback content, and the shapes pages render |
| `lib/behaviors/` | The page scripts (hero, reveal, cycling stills, tabs, team viewer, mosaic) |
| `sanity/` | Studio schema, structure and navbar; `sanity.config.ts` at the root |
| `scripts/seed.ts` | Dataset seed |
| `public/` | Fonts, images (crops, team portraits, partner logos, the header and footer logo) |
| `next.config.ts` | Security headers, cache headers, redirects from the old `.html` URLs, image sources |
| `.github/` | CI (lint, typecheck, build on every PR and on `main`) and Dependabot |

## How it works

- **Data.** Each `getX()` returns Sanity's published content, normalised to `lib/types.ts`, so
  a bad document can never take a page down (a render that throws would freeze it in ISR). It
  falls back to `lib/data.ts` when Sanity is not configured or returns nothing. When Sanity
  cannot be reached, a build falls back too, but a regeneration on the live site fails on
  purpose: ISR keeps serving the last good page and tries again a minute later.
- **Freshness.** `/studios`, `/production` and `/about` set `revalidate = 60`: a page is
  regenerated at most once a minute, on the next visit after the minute has passed. No
  webhook, no rebuild, no deploy credit spent on a publish.
- **Images.** Sanity images are requested with the editor's crop and hotspot applied, then
  served through `/_next/image` (Netlify Image CDN on Netlify): visitors never contact
  `cdn.sanity.io`, and get AVIF or WebP at the size they need. Only this project's dataset is
  accepted as a source (`remotePatterns` in `next.config.ts`).
- **Page scripts.** The behaviours ported from the design manipulate the DOM directly, so
  `components/Behaviors.tsx` starts them only once React has hydrated the page: a change made
  before hydration would be seen by React as a mismatch and undone.
- **Full page loads.** Internal links are plain `<a>`, not `next/link`, as on the static site:
  the page scripts bind once per document, and background prefetching would spend Netlify
  requests for nothing.

## How the design maps onto the build

The design's `state.page` switch became separate pages, and `state.tab` on the About screen
became `#story` / `#team` / `#network` / `#contact` hash routing, so every view has its own URL
and the browser's back button steps back through the tabs.

Behaviour ported from the design's component class:

- **Split hero** (`lib/behaviors/site.ts`): hovering biases the clip-path 64/36; clicking wipes
  the chosen half to full width and then navigates. The Studio and Production nav links drive
  the same wipe; a Ctrl/Cmd/Shift/middle click on them is left to the browser. Coming back with
  the Back button can restore the page from the back/forward cache mid-wipe, so a `pageshow`
  handler puts the hero back to rest.
- **Scroll reveal**: `IntersectionObserver` with the design's `rootMargin`/threshold, its
  per-element `data-delay`, the 4-second safety timeout, and the `prefers-reduced-motion`
  bail-out. Elements inside a hidden About tab wait for their tab to open.
- **Feature cards**: a film with several stills cross-fades through them on hover (the
  two-image opacity swap of the design); each fade starts once the next still is decoded.
- **Frame reel**: the home page marquee pauses while off screen and stands still under
  `prefers-reduced-motion`.
- **Team credits** (`lib/behaviors/about.ts`): a sticky portrait viewer; hovering or focusing a
  name swaps the portrait, clicking opens the bio. Each row carries its person's portrait and bio
  as `data-` attributes, and the CEO block carries the default person the same way. A person
  with no photo shows an empty 4:5 frame; one with no bio has no panel to open.
- **Network mosaic**: the scoring (relationship + visibility → tile size), the seeded shuffle,
  the explicit dense-pack simulation with its two hole-patching passes, and the FLIP animation on
  filter change, as in the design. With the seeded content the layout is identical, tile for
  tile, to the static site's for all eight filters. A partner without a site is a plain tile,
  not a link.

Accessibility additions: the About tabs follow the ARIA tabs pattern (`role="tablist"`,
`aria-selected`, panels labelled by their tab, only the selected tab in the Tab order, arrow
keys/Home/End to move between tabs), the network filters use `aria-pressed`, team rows are
keyboard-focusable and respond to Enter/Space, and the split hero is reachable by keyboard
(left and right arrows pick a side, Enter or Space opens it).

Search engines get a canonical URL on every page and `/sitemap.xml` (listed in `/robots.txt`),
both built on the site's main address (`lib/site.ts`: Netlify's `URL` at build time), so the
`*.netlify.app` copies are not indexed as duplicates. Unknown URLs get the site's own 404 page
(`app/not-found.tsx`).

## Deploying (Netlify)

`netlify.toml` builds with `npm run build` and the Next.js runtime (`@netlify/plugin-nextjs`).
Set on Netlify:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET`. Never `SANITY_API_TOKEN`:
  the site only reads public content. **Do not tick "Contains secret values"** on these two:
  their values are public by design (`NEXT_PUBLIC_` values are written into the pages' code,
  and the project ID is in every image URL), and Netlify's secret scanning would then fail
  the build on every occurrence, `production` included. A variable flagged as secret cannot be
  unflagged: delete it and create it again.
- `MAILCHIMP_API_KEY` and `MAILCHIMP_AUDIENCE_ID` for the newsletter (Mailchimp → Profile →
  Extras → API keys; Audience → Settings → Audience name and defaults → Audience ID). Server
  only: these two can, and the key should, be flagged as secret. Unset, the form answers that
  sign-up is unavailable. Sign-ups are double opt-in: Mailchimp emails a confirmation link.

In sanity.io/manage → API → CORS origins, add the site's origins **with credentials allowed**
(`http://localhost:3000`, the Netlify URL, the final domain): the embedded Studio calls Sanity
from the site's own origin.

The site runs on a Netlify account of its own, on the credit-based free plan (300 credits a
month, shared by every site on an account; once spent, the account's sites are paused until
the next month). Publishing in the Studio costs nothing; each production deploy costs 15
credits, so group merges into `main`; the rest goes on bandwidth (20 credits per GB) and
requests. Netlify warns as usage passes thresholds.

## Security headers

Set in `next.config.ts` for every route: Content-Security-Policy, HSTS, `nosniff`, a referrer
policy, a permissions policy, framing denied, and the cross-origin opener/resource policies.

- **Site pages:** everything from the site's own origin. Next requires two concessions over the
  static site: `script-src 'unsafe-inline'` (its pages ship inline script payloads, and a nonce is
  impossible on static and ISR pages) and `style-src 'unsafe-inline'` (next/image sets an inline
  style). `'unsafe-eval'` is added in development only, for React's error overlay.
- **`/studio`:** a separate, looser policy, since the Studio talks to Sanity directly (API and
  websockets on `*.sanity.io`, its UI font, user avatars from anywhere).
- **Third parties.** None on the site. Fonts are self-hosted, so no visitor data goes to Google
  Fonts and no consent banner is needed for them.
- **Content from Sanity.** The Studio validates links, but a write through the API skips that
  validation, and the network mosaic sets its links by script, out of React's reach. So
  `lib/sanity.queries.ts` keeps only `http(s)` links and drops SVG images (Sanity serves an SVG
  as uploaded, scripts included). This matters because the Studio shares the site's origin and
  keeps its login in the browser: script running on any page could take it.
- **Image optimizer.** On Netlify, `/_next/image` is the Image CDN, which accepts any width and
  quality. Its sources are limited to this project's dataset, so it cannot be used to serve
  other Sanity projects' images from this domain, at this account's expense.
- **Caching.** Pages follow ISR. Next's own CSS and JS have hashed names and are cached
  forever. `/fonts` is cached for a year; `/assets` for a week, since those names carry no
  content hash: give a replaced file a new name if it must show up sooner.

## Images

Images managed in the Studio are resized and re-encoded for each visitor by the image CDN, but
Sanity stores the file **as uploaded**, at a public URL. **Strip metadata before uploading**: a
phone photo can carry the exact place it was taken. Re-saving with Pillow does it, for example:

```
python -c "from PIL import Image, ImageOps; im = ImageOps.exif_transpose(Image.open('in.jpg')).convert('RGB'); im.thumbnail((1920, 1920)); im.save('out.webp', quality=82, method=6)"
```

Sensible sizes: team portraits about 840 × 1050 (4:5), stills and thumbnails about 1920 px
wide (16:9), partner logos about 1200 × 560 PNG with transparency.

The images in `public/assets/` (home reel, story, hero backgrounds) are the static site's,
already resized and stripped of metadata (43.6 MB down to 3.5 MB). The team, film, production
and logo files among them are also the seed's source.

## Dependencies

Dependabot opens grouped update PRs every week (Sanity packages together, Next and React
together), and CI checks each one.

`npm audit` reports vulnerabilities in `@sanity/cli` (js-yaml, smol-toml, braces…) and
`eslint-config-next`. They are in development tooling, which parses local files; none of it is
in what the site serves. **Do not run `npm audit fix --force`**: its "fix" downgrades `sanity`
to v5. They go away with upstream updates. To see what ships, use `npm audit --omit=dev`.

## Content still to supply or fix

In the Studio, once seeded:

- **Missing portraits:** Yves Philippe, Marvin Jay Levy (no image has ever existed for them).
- **Missing bios:** John Dima, Emma Kremer, Yves Philippe, Marvin Jay Levy.
- **Name spellings to confirm:** "Louise Vilepellet" (her bio says Villepelet), "Theodore
  Verzat" (his bio says Théodore).
- **Placeholders:** every production project links to the same placeholder YouTube video
  (replace it, or empty the field: the card then does not click through); no year or cast is
  set on the films yet. `lib/data.ts` no longer holds these placeholders.

In the code:

- the home page's contact block: the Paris address and the phone numbers (the placeholders were
  removed, not replaced);
- the footer's "Follow" column was removed while its links went to IMDb's, Instagram's,
  LinkedIn's and YouTube's home pages: add it back with JSL's own profile URLs;
- "Legal mentions · Privacy" in the footer is plain text: the legal notice and privacy policy
  pages still need writing, all the more now that the newsletter collects email addresses.
