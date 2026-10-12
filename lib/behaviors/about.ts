/* JSL Studios — About page: tabs, team credits viewer, network mosaic.
   Ported from the data script of the JSL Studios Claude Design file. The content (people,
   partners) now comes from Sanity: team rows carry their photo and bio as data-
   attributes, and the mosaic receives its tiles from components/Behaviors.tsx. */

import type { Relationship } from '../types';
import { reduced as reducedMotion, reveal } from './site';

/* ---------- Tabs (hash-driven) ---------- */

const TABS = ['story', 'team', 'network', 'contact'];

// Set by networkBind(): builds the mosaic the first time the Network tab is shown.
let ensureNetwork: (() => void) | null = null;

function currentTab() {
  const h = (window.location.hash || '').replace('#', '');
  return TABS.indexOf(h) !== -1 ? h : 'story';
}

// On a phone the tab bar scrolls sideways (site.css): bring the open tab into it. Only the
// bar scrolls; scrollIntoView() could move the page too.
function scrollTabIntoView(btn: Element) {
  const list = btn.parentElement;
  if (!list || list.scrollWidth <= list.clientWidth) return;
  const l = list.getBoundingClientRect(), b = btn.getBoundingClientRect();
  const pad = parseFloat(getComputedStyle(list).paddingLeft) || 0;
  if (b.left < l.left + pad) list.scrollLeft -= l.left + pad - b.left;
  else if (b.right > l.right - pad) list.scrollLeft += b.right - (l.right - pad);
}

function showTab(tab: string, scroll: boolean) {
  TABS.forEach(function (t) {
    const btn = document.querySelector('[data-tab="' + t + '"]');
    const panel = document.getElementById('panel-' + t);
    const on = t === tab;
    if (btn) {
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
      btn.setAttribute('tabindex', on ? '0' : '-1');
      if (on) scrollTabIntoView(btn);
    }
    if (panel) panel.hidden = !on;
  });
  if (tab === 'network' && ensureNetwork) ensureNetwork();
  if (scroll) window.scrollTo(0, 0);
  reveal();
}

function tabsBind() {
  document.querySelectorAll('[data-tab]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const tab = btn.getAttribute('data-tab') || 'story';
      // A real history entry per tab, so Back returns to the previous tab. The
      // hashchange listener below does the switching; re-clicking the current tab
      // fires no hashchange, so that case is handled here.
      if (window.location.hash === '#' + tab) showTab(tab, true);
      else window.location.hash = tab;
    });
  });
  // Arrow keys, Home and End move between tabs and open the one they land on, as a click
  // does (ARIA tabs pattern, automatic activation).
  const list = document.querySelector('[role="tablist"]');
  if (list) {
    list.addEventListener('keydown', function (ev) {
      const e = ev as KeyboardEvent;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const from = TABS.indexOf((e.target as Element).getAttribute('data-tab') || currentTab());
      let to = -1;
      if (e.key === 'ArrowRight') to = (from + 1) % TABS.length;
      else if (e.key === 'ArrowLeft') to = (from - 1 + TABS.length) % TABS.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = TABS.length - 1;
      if (to < 0) return;
      e.preventDefault();
      const btn = document.querySelector<HTMLElement>('[data-tab="' + TABS[to] + '"]');
      if (btn) { btn.focus(); btn.click(); }
    });
  }
  window.addEventListener('hashchange', function () { showTab(currentTab(), true); });
  showTab(currentTab(), false);
}

/* ---------- Team credits viewer ---------- */

type Person = { name: string; role: string; group: string; index: string };

// A team row, or the CEO block, carries the person it shows as data- attributes.
function personOf(el: Element): Person {
  return {
    name: el.getAttribute('data-name') || '',
    role: el.getAttribute('data-role') || '',
    group: el.getAttribute('data-group') || '',
    index: el.getAttribute('data-index') || ''
  };
}

function teamBind() {
  const viewer = document.querySelector<HTMLElement>('.team-portrait');
  if (!viewer) return;
  const layersHost = viewer.querySelector('.portrait-layers');
  const bioEl = viewer.querySelector<HTMLElement>('.team-bio');
  if (!layersHost || !bioEl) return;
  const bio = bioEl;
  const bioName = bio.querySelector('.team-bio-name');
  const bioRole = bio.querySelector('.team-bio-role');
  const bioText = bio.querySelector('.team-bio-text');
  const metaGroup = document.querySelector('[data-active-group]');
  const metaIndex = document.querySelector('[data-active-index]');

  // Each person's portrait and bio, read once from their rows. Someone listed in several
  // groups has a row in each, all carrying the same person's data.
  const PHOTOS: Record<string, string> = {};
  const BIOS: Record<string, string> = {};
  document.querySelectorAll('.team-row').forEach(function (row) {
    const name = row.getAttribute('data-name');
    if (!name) return;
    const photo = row.getAttribute('data-photo');
    const text = row.getAttribute('data-bio');
    if (photo) PHOTOS[name] = photo;
    if (text) BIOS[name] = text;
  });

  const layers: Record<string, HTMLElement> = {};
  const portraits: Record<string, HTMLImageElement> = {};

  function layerFor(name: string) {
    if (layers[name]) return layers[name];
    const div = document.createElement('div');
    div.className = 'portrait-layer';
    // Without a portrait the frame stays empty.
    const slot = document.createElement('div');
    slot.className = 'portrait-ph';
    if (PHOTOS[name]) {
      const img = document.createElement('img');
      img.alt = name + ' — portrait';
      img.decoding = 'async';
      img.src = PHOTOS[name];
      // A portrait that fails to load falls back to the slot rather than a broken image.
      img.addEventListener('error', function () {
        if (img.parentNode === div) div.removeChild(img);
        div.appendChild(slot);
      });
      div.appendChild(img);
      portraits[name] = img;
    } else {
      div.appendChild(slot);
    }
    layersHost!.appendChild(div);
    layers[name] = div;
    return div;
  }

  // Settles once someone's layer can be shown without a blank frame: their portrait is
  // decoded, has failed (the slot replaced it), or there is none.
  function ready(name: string): Promise<void> {
    const img = portraits[name];
    if (!img || !img.decode) return Promise.resolve();
    return img.decode().then(function () {}, function () {});
  }

  // The CEO, shown by default: the block above the groups describes them, and the HTML
  // ships their portrait layer.
  const ceoBlock = document.querySelector('.ceo-block');
  const CEO = ceoBlock ? personOf(ceoBlock) : null;
  const staticLayer = layersHost.querySelector<HTMLElement>('[data-person-layer]');
  if (CEO && staticLayer) layers[CEO.name] = staticLayer;

  // Portraits load ahead, once the list comes near the screen (the Team tab may still be
  // hidden), so a name's photo is usually there before its first hover.
  const preload = function () { Object.keys(PHOTOS).forEach(layerFor); };
  const lists = document.querySelector('.team-lists');
  if (lists && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries) {
      if (!entries.some(function (e) { return e.isIntersecting; })) return;
      io.disconnect();
      preload();
    }, { rootMargin: '400px 0px' });
    io.observe(lists);
  } else {
    preload();
  }

  // The layer on top, and the person asked for last: moving fast down the list asks for
  // several portraits, and only the last one may still take the frame once it is ready.
  let shown: HTMLElement | null = staticLayer;
  let wanted = '';

  // The incoming layer fades in over the outgoing one, which stays fully visible underneath
  // (.prev) until then: the frame never dips to its grey background between two people.
  function showPortrait(name: string) {
    wanted = name;
    const layer = layerFor(name);
    ready(name).then(function () {
      if (wanted !== name || layer === shown) return;
      if (layer.classList.contains('prev')) {
        // Back to the previous person: drop their layer out of sight at once so it can
        // fade in again rather than snap.
        layer.style.transition = 'none';
        layer.classList.remove('prev');
        void layer.offsetWidth;
        layer.style.transition = '';
      }
      Object.keys(layers).forEach(function (k) {
        const l = layers[k];
        l.classList.toggle('prev', l === shown);
        l.classList.toggle('active', l === layer);
      });
      shown = layer;
    });
  }

  let active: Person | null = null;
  let bioOpen = false;

  // Someone without a bio has nothing to open: the panel stays closed rather than empty.
  function hasBio(person: Person | null) {
    return !!person && !!BIOS[person.name];
  }

  function setActive(person: Person) {
    if (active && active.name === person.name && active.index === person.index) return;
    active = person;
    showPortrait(person.name);
    if (metaGroup) metaGroup.textContent = person.group;
    if (metaIndex) metaIndex.textContent = person.index;
    if (bioName) bioName.textContent = person.name;
    if (bioRole) bioRole.textContent = person.role;
    if (bioText) bioText.textContent = BIOS[person.name] || '';
  }

  // Which row's bio is showing, so only that row reports aria-expanded="true".
  let openRow: Element | null = null;

  function setBio(open: boolean, row?: Element | null) {
    bioOpen = open;
    openRow = open ? (row || openRow) : null;
    bio.classList.toggle('open', open);
    document.querySelectorAll('.team-row[data-bio]').forEach(function (r) {
      r.setAttribute('aria-expanded', open && r === openRow ? 'true' : 'false');
    });
  }

  if (ceoBlock && CEO) {
    setActive(CEO);
    ceoBlock.addEventListener('mouseenter', function () { setActive(CEO); });
  }

  document.querySelectorAll<HTMLElement>('.team-row').forEach(function (row) {
    let person = personOf(row);
    if (CEO && person.name === CEO.name) person = CEO;
    // While a bio is open, hovering or focusing another row shows that person's bio, so
    // that row becomes the expanded one — and Enter on it then closes what it shows. Over
    // someone without a bio, the panel closes.
    const over = function () {
      setActive(person);
      if (bioOpen) setBio(hasBio(person), row);
    };
    // moveFocus only for keyboard activation: the bio that just appeared is elsewhere in
    // the DOM and nothing would announce it otherwise. Doing it on mouse clicks too would
    // yank focus away from where the pointer is.
    const open = function (moveFocus: boolean) {
      const same = active && active.name === person.name;
      const willOpen = hasBio(person) && (same ? !bioOpen : true);
      setActive(person);
      setBio(willOpen, row);
      if (moveFocus) (willOpen ? bio : row).focus();
      // On narrow screens the viewer is not sticky and sits above the whole list, so a
      // tapped name's bio would open off screen: bring it into view.
      else if (willOpen && viewer.parentElement && getComputedStyle(viewer.parentElement).position === 'static') {
        viewer.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' });
      }
    };
    row.addEventListener('mouseenter', over);
    row.addEventListener('focus', over);
    row.addEventListener('click', function () { open(false); });
    row.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(true); }
    });
  });

  viewer.addEventListener('click', function () {
    if (bioOpen || hasBio(active)) setBio(!bioOpen, openRow);
  });
}

/* ---------- Network mosaic ---------- */

/** One partner as the page hands it over: `si` is its sector's index in the filter bar,
 *  `src` its logo (already optimised), absent when there is none. */
export type NetworkTile = {
  name: string;
  rel: Relationship;
  si: number;
  src?: string;
  url?: string;
  invert: boolean;
  visibility: number;
};

type Node = { name: string; rel: Relationship; si: number; slug: string; src: string; url?: string; filter: string; vis: number };
type Tile = Node & { cs: number; rs: number; row: number; col: number };

const SCORE: Record<Relationship, number> = { client: 5, featured: 4, network: 3, relationship: 2, conversation: 1 };

function slugOf(n: string) {
  return n.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '');
}
/**
 * Seeded pseudo-random generator (mulberry32), returning a function that yields
 * successive floats in [0, 1).
 *
 * The mosaic shuffles its tiles before packing them, and that shuffle has to be
 * *deterministic*: the layout is asked for again on every filter click, and the FLIP
 * animation measures each tile's old and new position by matching `data-tile`
 * keys across the two renders. With Math.random() the order would differ every
 * time, so tiles would appear to teleport instead of sliding, and returning to a
 * filter would never reproduce the arrangement the user just saw. Seeding by
 * sector index instead gives each filter one fixed, arbitrary-looking layout.
 *
 * The seed is first spread across the 32-bit range by Knuth's multiplicative
 * hash constant, so adjacent sector indices (0, 1, 2 …) don't yield similar
 * sequences.
 */
function rng(seed: number) {
  let t = seed * 2654435761 + 1013904223;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function sizeFor(t: number) { return t >= 8 ? [3, 2] : t > 6 ? [2, 2] : t >= 4 ? [2, 1] : [1, 1]; }
function totalOf(n: Node) { return SCORE[n.rel] + n.vis; }

const COLS = 6;

function packMosaic(ALL: Node[], sector: number | null): Tile[] {
  const visible = sector == null ? ALL.slice() : ALL.filter(function (n) { return n.si === sector; });
  const mrnd = rng(41 + (sector == null ? 0 : sector + 1));
  // deterministic shuffle
  for (let k = visible.length - 1; k > 0; k--) {
    const r = Math.floor(mrnd() * (k + 1));
    const t = visible[k]; visible[k] = visible[r]; visible[r] = t;
  }
  const tiles: Tile[] = visible.map(function (n) {
    const sz = sizeFor(totalOf(n));
    return Object.assign({}, n, { cs: sz[0], rs: sz[1], row: 0, col: 0 });
  });
  // Explicit dense-pack simulation (mirrors CSS grid-auto-flow:dense) so post-hoc hole
  // patches never shift other tiles. `cell` maps each grid cell (r * COLS + c) to the tile
  // covering it, so "is this cell free?" and "whose cell is it?" are both one lookup.
  const cell: Tile[] = [], rowFill: number[] = [];
  let firstOpen = 0, maxRow = 0;
  const at = function (r: number, c: number) { return cell[r * COLS + c]; };
  const fits = function (r: number, c: number, cs: number, rs: number) {
    if (c + cs > COLS) return false;
    for (let dr = 0; dr < rs; dr++) for (let dc = 0; dc < cs; dc++) if (at(r + dr, c + dc)) return false;
    return true;
  };
  const place = function (m: Tile, r: number, c: number, cs: number, rs: number) {
    for (let dr = 0; dr < rs; dr++) {
      rowFill[r + dr] = (rowFill[r + dr] || 0) + cs;
      for (let dc = 0; dc < cs; dc++) cell[(r + dr) * COLS + c + dc] = m;
    }
  };
  tiles.forEach(function (m) {
    // First free slot, scanning left-to-right then down. A full row can't take any tile,
    // so the scan starts at the first row with room (the r > 200 guard is a runaway
    // backstop; a fitting slot always exists within a few rows).
    while (rowFill[firstOpen] === COLS) firstOpen++;
    let r: number, c = 0;
    outer: for (r = firstOpen; ; r++) {
      for (c = 0; c <= COLS - m.cs; c++) { if (fits(r, c, m.cs, m.rs)) break outer; }
      if (r > 200) break;
    }
    place(m, r, c, m.cs, m.rs); m.row = r + 1; m.col = c + 1; maxRow = Math.max(maxRow, r + m.rs);
  });
  // Growing a tile by one column adds one cell per row it spans (and vice versa), so the
  // whole strip has to be free first and all of it has to be marked. The design marked
  // only the single hole being patched, which let a later tile land on top of one.
  const stripFree = function (r: number, c: number, rs: number, cs: number) { return r >= 0 && c >= 0 && fits(r, c, cs, rs); };
  const patchPass = function (capped: boolean) {
    let patchedAny = false;
    for (let r = 0; r < maxRow; r++) {
      for (let c = 0; c < COLS; c++) {
        if (at(r, c)) continue;
        const left = c > 0 ? at(r, c - 1) : null;
        if (left && left.col - 1 + left.cs === c && (!capped || left.cs < 3) && stripFree(left.row - 1, c, left.rs, 1)) { left.cs += 1; place(left, left.row - 1, c, 1, left.rs); patchedAny = true; continue; }
        const above = r > 0 ? at(r - 1, c) : null;
        if (above && above.row - 1 + above.rs === r && (!capped || above.rs < 2) && stripFree(r, above.col - 1, 1, above.cs)) { above.rs += 1; place(above, r, above.col - 1, above.cs, 1); patchedAny = true; continue; }
        const right = c < COLS - 1 ? at(r, c + 1) : null;
        if (right && right.col - 1 === c + 1 && (!capped || right.cs < 3) && stripFree(right.row - 1, c, right.rs, 1)) { right.col -= 1; right.cs += 1; place(right, right.row - 1, c, 1, right.rs); patchedAny = true; continue; }
        const below = at(r + 1, c);
        if (below && below.row - 1 === r + 1 && (!capped || below.rs < 2) && stripFree(r, below.col - 1, 1, below.cs)) { below.row -= 1; below.rs += 1; place(below, r, below.col - 1, below.cs, 1); patchedAny = true; continue; }
      }
    }
    return patchedAny;
  };
  while (patchPass(true)) { /* patch until stable */ }
  while (patchPass(false)) { /* patch until stable */ }
  return tiles;
}

function networkBind(input: NetworkTile[]) {
  const host = document.querySelector('.network-mosaic');
  if (!host) return;
  const ALL: Node[] = input.map(function (t) {
    return {
      name: t.name, rel: t.rel, si: t.si, slug: slugOf(t.name),
      src: t.src || '',
      url: t.url,
      filter: t.invert ? 'invert(1)' : 'none',
      vis: t.visibility
    };
  });

  // A filter always packs to the same layout, so each one is packed once and reused.
  const mosaicCache: Record<string, readonly Tile[]> = {};
  function computeMosaic(sector: number | null) {
    const k = sector == null ? 'all' : String(sector);
    if (!mosaicCache[k]) mosaicCache[k] = Object.freeze(packMosaic(ALL, sector).map(function (t) { return Object.freeze(t); }));
    return mosaicCache[k];
  }

  let sector: number | null = null;
  let flipRects: Record<string, DOMRect> | null = null;
  // Logos that failed to load (or don't exist): renders set the name in type straight
  // away instead of requesting a missing file again on every filter click.
  const failed: Record<string, boolean> = {};

  function nameTag(m: Tile) {
    const t = document.createElement('span');
    t.className = 'net-tile-name';
    t.textContent = m.name;
    return t;
  }

  function tileFor(m: Tile) {
    // Only a partner with a site is a link; `url` is already a vetted http(s) URL
    // (lib/sanity.queries.ts), since it is set here out of React's reach.
    let tile: HTMLElement;
    if (m.url) {
      const link = document.createElement('a');
      link.href = m.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', m.name);
      tile = link;
    } else {
      tile = document.createElement('div');
    }
    tile.className = 'net-tile';
    tile.setAttribute('data-tile', m.slug);
    tile.style.gridColumn = m.col + ' / span ' + m.cs;
    tile.style.gridRow = m.row + ' / span ' + m.rs;
    const inner = document.createElement('div');
    inner.className = 'net-tile-inner';
    if (!m.src || failed[m.slug]) {
      inner.appendChild(nameTag(m));
    } else {
      const img = document.createElement('img');
      img.alt = m.name;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = m.src;
      // On the logo only: the name set in its place must stay dark on the white tile.
      if (m.filter !== 'none') img.style.filter = m.filter;
      // A logo that fails to load falls back to the brand name rather than a broken icon.
      img.addEventListener('error', function () {
        failed[m.slug] = true;
        if (img.parentNode === inner) inner.replaceChild(nameTag(m), img);
      });
      inner.appendChild(img);
    }
    tile.appendChild(inner);
    return tile;
  }

  function render() {
    const frag = document.createDocumentFragment();
    computeMosaic(sector).forEach(function (m) { frag.appendChild(tileFor(m)); });
    host!.replaceChildren(frag);
  }

  function flipSnap() {
    const map: Record<string, DOMRect> = {};
    host!.querySelectorAll('[data-tile]').forEach(function (el) {
      const r = el.getBoundingClientRect();
      if (r.width) map[el.getAttribute('data-tile') || ''] = r;
    });
    flipRects = map;
  }

  function flipPlay() {
    const prev = flipRects;
    if (!prev) return;
    flipRects = null;
    if (reducedMotion()) return;
    const ease = 'cubic-bezier(.16,1,.3,1)';
    const els = Array.prototype.slice.call(host!.querySelectorAll('[data-tile]')) as HTMLElement[];
    // Measure every new box before writing any style: interleaving the two would force
    // a style recalculation for each tile.
    const rects = els.map(function (el) { return el.getBoundingClientRect(); });
    const moves: [HTMLElement, number][] = [];
    els.forEach(function (el, i) {
      const r = rects[i], p = prev[el.getAttribute('data-tile') || ''];
      el.style.transition = 'none';
      el.style.willChange = 'transform';
      if (p) {
        // .net-tile scales from its top-left corner, so translating by the corner offset
        // and scaling by the size ratio puts it exactly back on its old box.
        const sx = p.width / r.width, sy = p.height / r.height;
        el.style.transform = 'translate(' + (p.left - r.left) + 'px,' + (p.top - r.top) + 'px) scale(' + sx + ',' + sy + ')';
        moves.push([el, 0]);
      } else {
        // A tile entering the filter grows in from 70% about its centre: (1 - .7) / 2 = 15%.
        el.style.transform = 'translate(15%,15%) scale(.7)';
        el.style.opacity = '0';
        moves.push([el, 220 + i * 22]);
      }
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) inner.style.transition = 'none';
    });
    void document.body.offsetHeight;
    requestAnimationFrame(function () {
      moves.forEach(function (mv) {
        const el = mv[0], d = mv[1];
        el.style.transition = 'transform .85s ' + ease + ' ' + d + 'ms, opacity .6s ' + ease + ' ' + d + 'ms, background-color .5s';
        el.style.transform = '';
        el.style.opacity = '';
        const inner = el.firstElementChild as HTMLElement | null;
        if (inner) inner.style.transition = '';
        // Only the tile's own transform transition ends the move: opacity finishes sooner,
        // and transitions on .net-tile-inner bubble up here too.
        // Hiding the tab mid-move cancels the transition rather than ending it.
        const done = function (e: TransitionEvent) {
          if (e.target !== el || e.propertyName !== 'transform') return;
          el.style.transition = '';
          el.style.willChange = '';
          el.removeEventListener('transitionend', done);
          el.removeEventListener('transitioncancel', done);
        };
        el.addEventListener('transitionend', done);
        el.addEventListener('transitioncancel', done);
      });
    });
  }

  document.querySelectorAll('.legend-pill').forEach(function (pill) {
    pill.addEventListener('click', function () {
      const v = pill.getAttribute('data-sector');
      const next = v === 'all' ? null : parseInt(v || '', 10);
      flipSnap();
      sector = (sector === next) ? null : next;
      document.querySelectorAll('.legend-pill').forEach(function (p) {
        const pv = p.getAttribute('data-sector');
        const pn = pv === 'all' ? null : parseInt(pv || '', 10);
        p.setAttribute('aria-pressed', pn === sector ? 'true' : 'false');
      });
      render();
      flipPlay();
    });
  });

  // The Network tab starts hidden, so the mosaic is only built when it is first shown.
  let built = false;
  ensureNetwork = function () {
    if (built) return;
    built = true;
    render();
  };
  if (currentTab() === 'network') ensureNetwork();
}

/* ---------- Init ---------- */

// React runs effects twice in development (StrictMode); listeners must still be bound once.
let started = false;

export function initAbout(network: NetworkTile[]) {
  if (started) return;
  started = true;
  tabsBind();
  teamBind();
  networkBind(network);
}
