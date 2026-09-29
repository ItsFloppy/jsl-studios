# JSL Studios — website

A static implementation of the JSL Studios design from
[the design project](https://claude.ai/design/p/8ac94c6f-5896-42b3-ba35-986f3650a647). The
source design lives there; its exported `.dc.html` and that file's runtime are no longer kept
in this folder.

The design is a single-file prototype: one document with `sc-if` / `sc-for` template
directives and a `DCLogic` component class driving five screens through `state.page`.
This build turns it into a plain multi-page static site — no framework, no build step.

## Running it

```
python serve.py
```

Then open <http://localhost:8000/>. Pass `-p` for another port. The script serves its own
folder whichever directory it is started from.

Prefer `serve.py` while editing, for two reasons. `python -m http.server` sends `Last-Modified`
with no `Cache-Control`, which lets the browser reuse a cached page without
revalidating; an edit then looks as though it did nothing, because the file on
disk is new and the page on screen is old. `serve.py` sends `no-store`, so a
plain reload always reflects what is on disk.

`no-store` only governs responses from that point on, so `serve.py` also sends
`Clear-Site-Data: "cache"` with each page. That matters when an asset is deleted
or replaced: without it the browser can go on rendering a copy of a file that is
no longer there — a deleted image keeps appearing instead of falling back to its
placeholder. Both behaviours are verified against a live browser rather than
assumed.

`serve.py` is for development only. It answers requests in parallel, gives up on idle
connections after 10 seconds, and returns 404 for a folder URL instead of listing it, as
the production hosts do. One side effect of `no-store`: the browser never keeps these pages
in its back/forward cache, so the Back-button restore handled in `js/site.js` can only be
exercised against a caching server (`python -m http.server` does).

## Layout

| Path | What it is |
| --- | --- |
| `index.html` → `/` | Home — split hero, "who we are", frame reel, newsletter, contact |
| `studios.html` → `/studios` | JSL Studios — feature films |
| `production.html` → `/production` | JSL Production — fashion films, campaigns, commercials |
| `about.html` → `/about` | About — four tabs (story / team / network / contact) |
| `justin-souriau-levine.html` → `/justin-souriau-levine` | Founder profile |
| `css/site.css` | All styling, including the `@font-face` rules |
| `js/site.js` | Shared behaviour — split hero, scroll reveal, image cycling, frame reel, newsletter |
| `js/about.js` | About page — tabs, team credits viewer, network mosaic |
| `assets/` | Images (crops, team portraits, partner logos) |
| `fonts/` | Self-hosted WOFF2 fonts — Syne and Cormorant Garamond italic (latin subset) |
| `favicon.svg`, `favicon-sky.svg` | Favicons (gold; sky blue on the Production page) |
| `_headers` | Security and cache headers for Netlify / Cloudflare Pages |
| `_redirects` | Clean-URL routing for Netlify / Cloudflare Pages |
| `.htaccess` | The same headers, plus compression, for Apache hosts |
| `serve.py` | Development server (static files, caching disabled) |

## URLs

Pages are served without the `.html` extension: `/`, `/studios`, `/production`, `/about`,
`/justin-souriau-levine`. The old `.html` addresses 301 to these, so existing links keep
working and only one URL is canonical.

Three files express the same routing, one per host, and they must be kept in step:
`_redirects` (Netlify, Cloudflare Pages), the `mod_rewrite` block in `.htaccess` (Apache),
and `send_head()` in `serve.py` (local). `serve.py` implements it precisely so that a clean
URL is never something that only works once deployed.

**On Netlify, "Pretty URLs" must be disabled** — Site configuration → Build & deploy → Post
processing → Asset optimization. Left on, it forwards `/about` to `/about/`, and the trailing
slash both fights the rules in `_redirects` and puts a slash in the address bar that nothing
here wants.

**Asset paths are root-absolute on purpose** (`/css/site.css`, `/assets/crop/x.webp`), rather
than relative as they were before clean URLs. A relative path resolves against the document's
directory, so under a trailing-slash URL like `/about/` every one of them would point a level
too deep and the stylesheet, fonts, favicon and all 55 images would 404 at once — a total
failure that appears only in production. Root-absolute paths make the site indifferent to the
URL shape. The three `url()` values in `css/site.css` are the exception and stay relative:
CSS resolves those against the stylesheet's own location, so they are already correct.
`<base href="/">` is not an option here — the CSP sets `base-uri 'none'`.

Adding a page means: create `name.html`, add a `/name` rewrite and a `/name.html` 301 to
`_redirects`, and link it as `/name`.

## How the design maps onto the build

The design's `state.page` switch became separate pages, and `state.tab` on the About
screen became `#story` / `#team` / `#network` / `#contact` hash routing, so every view has
its own URL and the browser's back button steps back through the tabs.

Behaviour ported from the design's component class:

- **Split hero** (`js/site.js`) — hovering biases the clip-path 64/36; clicking wipes the
  chosen half to full width and then navigates. On the home page the Studio and Production
  nav links drive the same wipe, exactly as `_navGo` did; a Ctrl/Cmd/Shift/middle click on
  them is left to the browser (new tab, new window). Coming back with the Back button can
  restore the page from the browser's back/forward cache mid-wipe, so a `pageshow` handler
  puts the hero back to rest.
- **Scroll reveal** — `IntersectionObserver` with the design's `rootMargin`/threshold, its
  per-element `data-delay`, the 4-second safety timeout, and the `prefers-reduced-motion`
  bail-out. Elements inside a hidden About tab wait for their tab to open instead of being
  counted as already on screen.
- **Feature cards** — `data-cycle` cross-fades through a list of stills on hover, using the
  two-image opacity swap from `_cycleBind`; each fade starts once the next still is decoded.
  Only *Back to the Present!* carries a cycle; *Planet of the Astronauts* and *The Greatest
  Race* have a single frame each, so they render as plain images with no hover behaviour.
- **Frame reel** — the home page marquee pauses while it is off screen and stands still under
  `prefers-reduced-motion`.
- **Team credits** (`js/about.js`) — a sticky portrait viewer (in the normal flow on screens
  up to 820px wide, where it would otherwise cover the list, and scrolled into view when a
  name is tapped there); hovering or focusing a name swaps the portrait, clicking opens the
  bio overlay. Portraits are created lazily and a
  person with no photo falls back to a `[PORTRAIT — 4:5]` slot.
- **Network mosaic** (`js/about.js`) — the scoring (`SCORE` + `VISIBILITY` → tile size), the
  seeded shuffle, the explicit dense-pack simulation with its two hole-patching passes, and
  the FLIP animation on filter change are ported from the design so tile layout matches it.
  The packing keeps a cell → tile index rather than scanning every tile per lookup, and each
  filter's layout is computed once and reused; both were checked to produce exactly the same
  layout for all eight filters. The mosaic is only built the first time the Network tab is
  shown.

Accessibility additions: the About tabs use `role="tablist"`/`aria-selected`, the network
filters use `aria-pressed`, team rows are keyboard-focusable and respond to Enter/Space,
and the split hero is reachable by keyboard — the left and right arrow keys pick a side,
Enter or Space opens it.

## Deploying

Publish the five pages, `css/`, `js/`, `assets/`, `fonts/`, the two favicons and the header
file for the host (`_headers` or `.htaccess`). Do not publish `serve.py` or this README.
`.htaccess` refuses to serve them on Apache, but `_headers` cannot hide a file, so on
Netlify or Cloudflare Pages publish a copy of the site without them (or move the site files
into their own folder and point the host at it).

- **Security headers.** Both files set the same policy: a strict Content-Security-Policy
  (everything from the site's own origin, nothing inline), HSTS, `nosniff`, a referrer
  policy, a permissions policy, and framing denied. Each page also carries the CSP in a
  `<meta>` tag, so the content rules hold even on a host that sets no headers — but not the
  framing ban, which only works as a real header (`frame-ancestors`, `X-Frame-Options`).
  The `<meta>` copy also leaves out `upgrade-insecure-requests`, which would break previews
  served over plain HTTP (e.g. `serve.py -b 0.0.0.0` opened from a phone). Keep the three in
  step.
- **What the CSP means when editing.** No `style="…"` attributes and no inline `<script>`
  or `<style>`: styling goes in `css/site.css`, scripts in `js/`. Setting `element.style.…`
  from a script is fine. The policy also enables Trusted Types, so assigning an HTML string
  to `innerHTML` / `insertAdjacentHTML` throws — build elements with `createElement` and
  `textContent`, as the existing code does.
- **Caching.** HTML revalidates on every visit. CSS and JS are cached for an hour and are
  referenced with `?v=YYYY-MM-DD`; bump that value in the five pages whenever
  `css/site.css`, `js/site.js` or `js/about.js` changes. Images are cached for a week, since
  their names carry no content hash — give a replaced image a new file name if it must show
  up sooner. Fonts are cached for a year.
- **Third parties.** None. Fonts are self-hosted, so no visitor data goes to Google Fonts
  and no consent banner is needed for them.

## Images

Every image has been resized to what the site can actually display and re-encoded with
**all metadata removed** — EXIF (including the GPS location several phone portraits
carried), XMP, C2PA manifests and colour profiles, after converting Display-P3 files to
sRGB. Photographs are WebP; partner logos stay PNG (a 256-colour palette wherever that is
visually lossless) so a missing logo can still be dropped in under the name the code
expects. Together the images went from 43.6 MB to 3.5 MB.

Keep new files to the same limits, and **strip their metadata before adding them** — a
phone photo can carry the exact place it was taken:

| Kind | Size limit | Format |
| --- | --- | --- |
| Team portrait | 840 × 1050 (4:5 frame) | WebP or JPEG |
| Feature still / thumbnail | 1280 px wide | WebP |
| Full-width image | 1920 px wide | WebP |
| Partner logo | 1200 × 560 | PNG with transparency |

Re-saving with Pillow drops the metadata, for example:

```
python -c "from PIL import Image, ImageOps; im = ImageOps.exif_transpose(Image.open('in.jpg')).convert('RGB'); im.thumbnail((840, 1050)); im.save('out.webp', quality=80, method=6)"
```

### Assets that still need supplying

Two names have no portrait anywhere: `Yves Philippe` and `Marvin Jay Levy` are absent from the
design project's own `PHOTOS` map too, so no image has ever existed for them. They show a
neutral placeholder, and the real file is picked up automatically once dropped in at the path
below. **No code change is needed** — just copy the file into place.

| Path | Used by |
| --- | --- |
| `assets/team/yves-philippe.jpg` | Team viewer |
| `assets/team/marvin-jay-levy.jpg` | Team viewer |
| `assets/logos/aveiro-maroc.png` | Network mosaic |
| `assets/logos/fff-academy.png` | Network mosaic |
| `assets/logos/harvard-university.png` | Network mosaic |
| `assets/logos/nycfc.png` | Network mosaic |
| `assets/logos/real-murcia.png` | Network mosaic |
| `assets/logos/vosita-healthcare.png` | Network mosaic |

Until then: team portraits show a `[PORTRAIT — 4:5]` slot and the mosaic sets the partner's
name in type.

No stylesheet or script applies a colour filter to a team portrait — each one is drawn
exactly as the file is. `magali-souriau.webp` nevertheless renders black and white, because
the original in the design project is itself monochrome. Showing it in colour needs a colour
original; there is nothing to switch off.

Portraits are drawn with `object-fit: cover` in a 4:5 frame, so a file that is already 4:5
is shown whole. All but one are, and render with nothing trimmed; `gary-springer.webp` is
slightly taller than 4:5 so about 3% is taken off the top and bottom. The extension is not
fixed: the path in `PHOTOS` (`js/about.js`) is what is fetched, so a `.webp` works as well as
a `.jpg` provided the two agree.

Four logos (`al-ahli`, `eduardo-ramos`, `isigny-sainte-mere`, `yale-yale-new-haven-health`) also
came back truncated from the design project, but the part that survived is the whole mark, so
they are used as-is.

### Verification

**Expected console noise is eight 404s at most** — the six absent logos and the two absent
team portraits listed above. A single page load shows fewer, because the mosaic only requests
the logos in the filter currently selected and a portrait is only fetched when that person is
hovered; exercising every filter and every row is what reaches eight. Each one is handled: the
mosaic swaps in the partner's wordmark (and does not ask for that file again during the
visit), the team viewer swaps in its `[PORTRAIT — 4:5]` slot. That is deliberate, so the tiles
and portraits heal themselves the moment the files are added, with no code change. A 404 for
any other path is a real regression, and so is any Content-Security-Policy report in the
console.

The count is derived rather than remembered: the mosaic builds its own paths at runtime from a
slug of each partner's name, so grepping the source will not find them. `js/about.js` holds the
partner list and the slug rule; reproducing that rule against `assets/logos/` is what produces
the six.

## Placeholder copy and links

Square-bracket text (`[YEAR]`, `[CAST]`, `[ADDRESS]`, `[PHONE]`) is carried over from the
design, which had not been filled in yet. Real phone numbers and emails are live.

Also still placeholders, to replace before launch:

- every Production card links to the same placeholder YouTube video;
- *Watch Now* on *Planet of the Astronauts* links to `#`, and the IMDb, Instagram, LinkedIn
  and YouTube links go to those sites' home pages;
- the newsletter form shows "Subscribed" but sends the address nowhere — connect it to a
  mailing provider (and add that provider's origin to `form-action` in the CSP) or remove it;
- "Legal mentions · Privacy" in the footer is plain text: the legal notice and privacy
  policy pages still need writing.
