/* JSL Studios — shared behaviors, ported from the JSL Studios Claude Design file.
   Plain DOM code, started by components/Behaviors.tsx once React has hydrated the page:
   before that, React owns the markup and any change made to it would be undone. */

export function reduced(): boolean {
  return !!window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
}

/* ---------- Scroll reveal ---------- */

let io: IntersectionObserver | null = null;
let revealSafety: ReturnType<typeof setTimeout> | undefined;

// `renderedOnly` leaves alone elements with no box — those inside a hidden About tab —
// so the safety timeout doesn't spend their reveal before the tab is ever opened.
function showAll(renderedOnly?: boolean) {
  document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-shown])').forEach(function (el) {
    if (renderedOnly && !el.getClientRects().length) return;
    markShown(el);
  });
}

// The per-element delay only staggers the reveal; once that has played it would also
// postpone every later transition on the element (e.g. a Production card's hover border).
// A reveal cut short (its tab hidden mid-fade) fires transitioncancel instead of
// transitionend, and ends it just the same.
function clearDelayAfterReveal(el: HTMLElement) {
  if (!el.style.transitionDelay) return;
  const done = function (e: TransitionEvent) {
    if (e.target !== el || e.propertyName !== 'opacity') return;
    el.style.transitionDelay = '';
    el.removeEventListener('transitionend', done);
    el.removeEventListener('transitioncancel', done);
  };
  el.addEventListener('transitionend', done);
  el.addEventListener('transitioncancel', done);
}

// Every way an element gets revealed (on scroll, at once, by the safety timeout) goes
// through here, so none of them leaves the stagger delay or an observer behind.
function markShown(el: HTMLElement) {
  if (io) io.unobserve(el);
  clearDelayAfterReveal(el);
  el.setAttribute('data-shown', '1');
}

export function reveal() {
  const els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]:not([data-shown])')) as HTMLElement[];
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || reduced()) { showAll(); return; }
  document.body.setAttribute('data-reveal-ready', '1');
  if (!io) {
    io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (en.isIntersecting) markShown(en.target as HTMLElement);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
  }
  const observer = io;
  clearTimeout(revealSafety);
  revealSafety = setTimeout(function () { showAll(true); }, 4000);
  const vh = window.innerHeight || 800;
  els.forEach(function (el) {
    // An element in a hidden tab has no box, and its all-zero rect would read as "on
    // screen". Observe it instead: it reveals once its tab is shown and it scrolls in.
    const rendered = el.getClientRects().length > 0;
    if (rendered && el.getBoundingClientRect().top < vh * 0.94) { markShown(el); return; }
    const dl = parseFloat(el.getAttribute('data-delay') || '0') || 0;
    el.style.transitionDelay = (dl / 1000) + 's';
    observer.observe(el);
  });
}

/* ---------- Feature card image cycling ---------- */

function cycleBind() {
  document.querySelectorAll<HTMLElement>('[data-cycle]').forEach(function (el) {
    const srcs = (el.getAttribute('data-cycle') || '').split(',');
    if (srcs.length < 2) return;
    const imgs = [el.querySelector<HTMLImageElement>('[data-cycle-img="0"]'), el.querySelector<HTMLImageElement>('[data-cycle-img="1"]')];
    if (!imgs[0] || !imgs[1]) return;
    const pair = imgs as HTMLImageElement[];
    let i = 0, active = 0, busy = false;
    let timer: ReturnType<typeof setInterval> | undefined;
    const advance = function () {
      if (busy) return;
      busy = true;
      i = (i + 1) % srcs.length;
      const next = pair[1 - active], prev = pair[active];
      next.src = srcs[i];
      // Cross-fade only once the incoming frame is decoded, so the fade never runs
      // toward a frame that hasn't arrived yet.
      const swap = function () {
        busy = false;
        next.style.opacity = '1';
        prev.style.opacity = '0';
        active = 1 - active;
      };
      if (next.decode) next.decode().then(swap, swap); else swap();
    };
    el.addEventListener('mouseenter', function () {
      if (reduced()) return;
      clearInterval(timer);
      advance();
      timer = setInterval(advance, 3200);
    });
    el.addEventListener('mouseleave', function () { clearInterval(timer); timer = undefined; });
  });
}

/* ---------- Newsletter ---------- */

function newsletterBind() {
  const form = document.querySelector<HTMLFormElement>('[data-newsletter]');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const b = form.querySelector('button');
    if (b) {
      b.textContent = 'Subscribed';
      b.disabled = true;
    }
  });
}

/* ---------- Frame reel ---------- */

// The marquee loops forever; pause it while it is scrolled out of view.
function reelBind() {
  const reel = document.querySelector('.reel');
  if (!reel || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (ents) {
    // Several crossings can queue up before the callback runs; the last one is current.
    reel.classList.toggle('is-paused', !ents[ents.length - 1].isIntersecting);
  }).observe(reel);
}

/* ---------- Home split hero ---------- */

type Side = 'studio' | 'production' | null;

function heroBind() {
  const root = document.querySelector<HTMLElement>('[data-hero]');
  if (!root) return;
  const img = root.querySelector<HTMLElement>('[data-split-img]');
  const line = root.querySelector<HTMLElement>('[data-split-line]');
  const state: { hover: Side; pct: number; wiping: boolean } = { hover: null, pct: 50, wiping: false };
  let navTimer: ReturnType<typeof setTimeout> | null = null;

  function split() {
    if (state.wiping || !img || !line) return;
    const pct = state.hover === 'studio' ? 64 : state.hover === 'production' ? 36 : 50;
    state.pct = pct;
    img.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
    line.style.left = pct + '%';
  }

  function hover(which: Side) {
    if (state.wiping) return;
    state.hover = which;
    split();
  }

  // Clicking a side lets that half take the whole frame, then hands off to its page.
  function wipeTo(toStudio: boolean) {
    if (state.wiping || !root) return;
    const target = toStudio ? '/studios' : '/production';
    if (reduced() || !img || !line) { window.location.href = target; return; }
    state.wiping = true;
    const ease = 'cubic-bezier(.76,0,.16,1)';
    img.style.transition = 'clip-path .78s ' + ease;
    img.style.clipPath = 'inset(0 ' + (toStudio ? 0 : 100) + '% 0 0)';
    line.style.transition = 'left .78s ' + ease + ',opacity .38s ease';
    line.style.left = (toStudio ? 100 : 0) + '%';
    line.style.opacity = '0';
    root.querySelectorAll<HTMLElement>('[data-split-cap]').forEach(function (c) {
      const keep = c.getAttribute('data-split-cap') === (toStudio ? 'studio' : 'production');
      const dx = (toStudio ? 1 : -1) * (keep ? 2.5 : 7);
      c.style.transition = 'opacity .42s ease,transform .78s ' + ease;
      c.style.transform = 'translateX(' + dx + 'vw)';
      if (!keep) c.style.opacity = '0';
    });
    root.querySelectorAll<HTMLElement>('img').forEach(function (im) {
      im.style.transition = 'transform .95s ' + ease;
      im.style.transform = 'scale(1.05)';
    });
    root.style.transition = 'opacity .26s ease .58s';
    root.style.opacity = '0';
    navTimer = setTimeout(function () { window.location.href = target; }, 820);
  }

  // Coming back with the Back button can restore this page from the back/forward cache
  // exactly as it was left: wiped, faded out, and with `wiping` still set, so nothing
  // on it would respond. Put the hero back to its resting state without animating.
  function resetHero() {
    if (!root) return;
    if (navTimer) clearTimeout(navTimer);
    navTimer = null;
    state.wiping = false;
    state.hover = null;
    const els = ([root, img, line] as (HTMLElement | null)[]).concat(Array.prototype.slice.call(root.querySelectorAll('[data-split-cap], img')));
    els.forEach(function (el) {
      if (!el) return;
      el.style.transition = 'none';
      el.style.transform = '';
      el.style.opacity = '';
    });
    split();
    void root.offsetWidth;
    els.forEach(function (el) { if (el) el.style.transition = ''; });
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) resetHero(); });

  // The side under the pointer: a caption's own side when the pointer is on one (on an
  // upright hero, PRODUCTION runs past the split line), else the half it is over.
  // `split` is where that half ends, in percent of the hero's width.
  const sideAt = function (e: MouseEvent, split: number): 'studio' | 'production' {
    const cap = (e.target as Element).closest('[data-split-cap]');
    if (cap) return cap.getAttribute('data-split-cap') === 'studio' ? 'studio' : 'production';
    const r = root.getBoundingClientRect();
    return (e.clientX - r.left) / r.width * 100 < split ? 'studio' : 'production';
  };

  root.addEventListener('mousemove', function (e) {
    if (state.wiping) return;
    const side = sideAt(e, 50);
    if (side !== state.hover) hover(side);
  });
  root.addEventListener('mouseleave', function () { hover(null); });
  root.addEventListener('click', function (e) {
    if (state.wiping) return;
    wipeTo(sideAt(e, state.pct) === 'studio');
  });
  // Keyboard: the arrow keys preview a side the way hovering does, Enter/Space opens it.
  root.addEventListener('keydown', function (e) {
    // Alt/Cmd+Arrow is the browser's Back/Forward: leave modified keys alone.
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); hover('studio'); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); hover('production'); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wipeTo(state.hover !== 'production'); }
  });
  root.addEventListener('blur', function () { hover(null); });

  // Nav links mirror the hero: hover previews the reveal, click plays the same wipe.
  document.querySelectorAll('.nav-link[data-nav="studios"], .nav-link[data-nav="production"]').forEach(function (a) {
    const toStudio = a.getAttribute('data-nav') === 'studios';
    a.addEventListener('mouseenter', function () { hover(toStudio ? 'studio' : 'production'); });
    a.addEventListener('mouseleave', function () { hover(null); });
    a.addEventListener('click', function (ev) {
      const e = ev as MouseEvent;
      // Leave modified clicks (new tab, new window, download) to the browser.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      wipeTo(toStudio);
    });
  });
}

/* ---------- Init ---------- */

// React runs effects twice in development (StrictMode); listeners must still be bound once.
let started = false;

export function initSite() {
  if (started) return;
  started = true;
  heroBind();
  cycleBind();
  newsletterBind();
  reelBind();
  reveal();
}
