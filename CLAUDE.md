# CLAUDE.md — JSL Studios

Source of truth for working on this repo. Read it before changing code. The architecture
deliberately mirrors `C:\Users\marti\Dev\Perso\chantemiel-v2` (Next.js + embedded Sanity
Studio + ISR + static fallback): when in doubt about a pattern, check how chantemiel does it
and copy it, unless a constraint below says otherwise.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict. No Tailwind: one stylesheet,
  `app/(site)/site.css`, carried over from the static site.
- Sanity 6 with the Studio embedded at `/studio` (`next-sanity`), dataset `production` (public,
  free plan).
- Netlify with `@netlify/plugin-nextjs`, on a dedicated account (credit-based free plan).
- Node ≥ 22.12 (`.node-version`).

## Commands

| Command | Use |
| --- | --- |
| `npm run dev` | Dev server, http://localhost:3000 (Studio at /studio) |
| `npm run build` / `npm start` | Production build / serve it. ISR only runs here, not in dev |
| `npm run lint`, `npm run typecheck` | Must pass before committing |
| `npm run seed` | Dry run of `scripts/seed.ts`; `-- --yes` writes |

## Environment

| Variable | Where | Use |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | `.env.local`, Netlify | Unset → the whole site renders `lib/data.ts` |
| `NEXT_PUBLIC_SANITY_DATASET` | `.env.local`, Netlify | `production` |
| `SANITY_API_TOKEN` | `.env.local` only | Editor token for `scripts/seed.ts`. Never `NEXT_PUBLIC_`, never on Netlify |
| `MAILCHIMP_API_KEY`, `MAILCHIMP_AUDIENCE_ID` | `.env.local`, Netlify (secret) | Newsletter (`app/api/newsletter/route.ts`). Never `NEXT_PUBLIC_` |

## Routes

| Route | Source | Rendering |
| --- | --- | --- |
| `/` | static copy | static |
| `/studios` | `getFilms()` | ISR 60 s |
| `/productions` | `getProductionCategories()` | ISR 60 s |
| `/about` | `getTeamGroups()`, `getNetwork()` | ISR 60 s |
| `/justin-souriau-levine` | static copy | static |
| `/studio/[[...tool]]` | Studio | static shell (`force-static`) |
| `/api/newsletter` | Mailchimp (server side) | POST only, dynamic |

`/x.html` URLs of the old static site redirect (308) to `/x`, and the former `/production` and
`/production.html` to `/productions` (`redirects()` in `next.config.ts`).

## Sanity

- Types: `film`, `productionCategory`, `productionProject`, `person`, `teamGroup` (members are
  `teamMember` objects: person reference + role), `networkSector`, `partner`. Every ordered type
  has an `ordre` number field (`sanity/schemaTypes/fields.ts`); queries sort by
  `ordre asc, _createdAt asc`.
- Studio labels and descriptions are in French (the editors are French); content and field
  names are in English, like the site.
- **Checklist for a new document type:** `sanity/schemaTypes/<type>.ts` → `sanity/schemaTypes/index.ts`
  → `sanity/structure/index.ts` (or it shows nowhere in the Studio) → `lib/types.ts` →
  `lib/sanity.queries.ts` (query + normalise + static fallback) → `lib/data.ts` →
  `scripts/seed.ts`.
- Every `getX()` falls back to `lib/data.ts` when Sanity is unset or empty. A failing fetch
  falls back too during a build and in dev, but on the live site it throws: ISR then keeps the
  last good page and retries a minute later, rather than putting the static content back
  online (`fetchOr()` in `lib/sanity.queries.ts`). So `lib/data.ts` must never hold
  placeholders a visitor could see.
- `getX()` also normalises whatever comes back: a field can always arrive null through GROQ,
  and a render that throws freezes the page in ISR (the old copy stays cached, every
  regeneration fails). Links are kept only if http(s) (`url()`), SVG images are dropped.
- **Deploy code before changing the shape of data in the dataset**, for the same reason.
- Icons come from per-icon subpaths: `import { UserIcon } from '@sanity/icons/User'`. The root
  entry of `@sanity/icons` v5 no longer exports them (it type-checks, as `never`, but breaks the
  build). Same trap in `@sanity/ui` v4 for what lives in a subpath: `useToast` comes from
  `@sanity/ui/toast`.
- The film stills field handles file drops itself (`sanity/components/FilmStills.tsx`): Sanity
  6.18's own drop of several files onto an array of images added nothing, or threw.

## Constraints

- **Page scripts run after hydration.** `lib/behaviors/site.ts` and `about.ts` (ported from the
  static site's JS) change the DOM directly. They are started by `components/Behaviors.tsx` in a
  `useEffect`, placed last in each page. Never let them run before hydration, and keep their
  `started` guards (React StrictMode runs effects twice in dev).
- **Data reaches the scripts through markup or props**, never through hard-coded tables: team
  rows carry `data-photo` / `data-bio`, the mosaic receives `NetworkTile[]` from `/about`.
- **Plain `<a>` for internal links**, not `next/link`: full page loads, as the scripts expect,
  and no background prefetch spending Netlify requests.
- **`data-page` lives on `.page-root`** (`components/PageShell.tsx`, `display: contents`), not on
  `<body>`: the root layout is shared with the Studio and cannot know the page.
- **Root layout stays bare.** `app/layout.tsx` is shared with the Studio; site CSS, header and
  footer belong to `app/(site)/`.
- **Visitors never contact a third party.** Sanity images go through `/_next/image` (built with
  `croppedUrl()` / `fullUrl()` from `lib/sanity.image.ts`; `optimisedSrc()` for images a script
  swaps in). Fonts are self-hosted (GDPR: no Google Fonts). Third-party services (Mailchimp) are
  called from a route handler, never from the page. Do not add a third-party origin to the
  site CSP without asking.
- **CSP** is in `next.config.ts`: one policy for the site, a looser one for `/studio`. No inline
  `style=` in server-rendered site markup beyond what next/image adds; scripts set styles through
  `element.style`.
- **Responsive.** Page gutter and sticky-bar heights come from `--gutter`, `--head-h` and
  `--tabs-h` in `site.css`: never hard-code 74px or 130px again. Full-screen heights use `svh`
  (after a `vh` fallback line). The home hero lays out from its own shape, through a container
  query (`container: hero`), not a media query. Check changes at 360, 390, 768 px and in
  landscape (844×390), not only on desktop.
- **Netlify credits** (300/month, the account pauses when they run out): no deploy per publish
  (ISR handles content), no prefetching, images through the image CDN at the size displayed.
