/* JSL Studios — shared behaviors, ported from the JSL Studios Claude Design file */
(function () {
  'use strict';

  var reduced = function () {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  };

  /* ---------- Scroll reveal ---------- */

  var io = null;
  var revealSafety = null;

  // `renderedOnly` leaves alone elements with no box — those inside a hidden About tab —
  // so the safety timeout doesn't spend their reveal before the tab is ever opened.
  function showAll(renderedOnly) {
    document.querySelectorAll('[data-reveal]:not([data-shown])').forEach(function (el) {
      if (renderedOnly && !el.getClientRects().length) return;
      markShown(el);
    });
  }

  // The per-element delay only staggers the reveal; once that has played it would also
  // postpone every later transition on the element (e.g. a Production card's hover border).
  // A reveal cut short (its tab hidden mid-fade) fires transitioncancel instead of
  // transitionend, and ends it just the same.
  function clearDelayAfterReveal(el) {
    if (!el.style.transitionDelay) return;
    var done = function (e) {
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
  function markShown(el) {
    if (io) io.unobserve(el);
    clearDelayAfterReveal(el);
    el.setAttribute('data-shown', '1');
  }

  function reveal() {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]:not([data-shown])'));
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduced()) { showAll(); return; }
    document.body.setAttribute('data-reveal-ready', '1');
    if (!io) {
      io = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) {
          if (en.isIntersecting) markShown(en.target);
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.02 });
    }
    clearTimeout(revealSafety);
    revealSafety = setTimeout(function () { showAll(true); }, 4000);
    var vh = window.innerHeight || 800;
    els.forEach(function (el) {
      // An element in a hidden tab has no box, and its all-zero rect would read as "on
      // screen". Observe it instead: it reveals once its tab is shown and it scrolls in.
      var rendered = el.getClientRects().length > 0;
      if (rendered && el.getBoundingClientRect().top < vh * 0.94) { markShown(el); return; }
      var dl = parseFloat(el.getAttribute('data-delay') || 0) || 0;
      el.style.transitionDelay = (dl / 1000) + 's';
      io.observe(el);
    });
  }

  /* ---------- Feature card image cycling ---------- */

  function cycleBind() {
    document.querySelectorAll('[data-cycle]').forEach(function (el) {
      var srcs = el.getAttribute('data-cycle').split(',');
      if (srcs.length < 2) return;
      var imgs = [el.querySelector('[data-cycle-img="0"]'), el.querySelector('[data-cycle-img="1"]')];
      var i = 0, active = 0, busy = false, timer = null;
      var advance = function () {
        if (busy) return;
        busy = true;
        i = (i + 1) % srcs.length;
        var next = imgs[1 - active], prev = imgs[active];
        next.src = srcs[i];
        // Cross-fade only once the incoming frame is decoded, so the fade never runs
        // toward a frame that hasn't arrived yet.
        var swap = function () {
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
      el.addEventListener('mouseleave', function () { clearInterval(timer); timer = null; });
    });
  }

  /* ---------- Newsletter ---------- */

  function newsletterBind() {
    var form = document.querySelector('[data-newsletter]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = form.querySelector('button');
      if (b) {
        b.textContent = 'Subscribed';
        b.disabled = true;
      }
    });
  }

  /* ---------- Frame reel ---------- */

  // The marquee loops forever; pause it while it is scrolled out of view.
  function reelBind() {
    var reel = document.querySelector('.reel');
    if (!reel || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (ents) {
      // Several crossings can queue up before the callback runs; the last one is current.
      reel.classList.toggle('is-paused', !ents[ents.length - 1].isIntersecting);
    }).observe(reel);
  }

  /* ---------- Home split hero ---------- */

  function heroBind() {
    var root = document.querySelector('[data-hero]');
    if (!root) return;
    var img = root.querySelector('[data-split-img]');
    var line = root.querySelector('[data-split-line]');
    var state = { hover: null, pct: 50, wiping: false };
    var navTimer = null;

    function split() {
      if (state.wiping || !img || !line) return;
      var pct = state.hover === 'studio' ? 64 : state.hover === 'production' ? 36 : 50;
      state.pct = pct;
      img.style.clipPath = 'inset(0 ' + (100 - pct) + '% 0 0)';
      line.style.left = pct + '%';
    }

    function hover(which) {
      if (state.wiping) return;
      state.hover = which;
      split();
    }

    // Clicking a side lets that half take the whole frame, then hands off to its page.
    function wipeTo(toStudio) {
      if (state.wiping) return;
      var target = toStudio ? '/studios' : '/production';
      if (reduced() || !img || !line) { window.location.href = target; return; }
      state.wiping = true;
      var ease = 'cubic-bezier(.76,0,.16,1)';
      img.style.transition = 'clip-path .78s ' + ease;
      img.style.clipPath = 'inset(0 ' + (toStudio ? 0 : 100) + '% 0 0)';
      line.style.transition = 'left .78s ' + ease + ',opacity .38s ease';
      line.style.left = (toStudio ? 100 : 0) + '%';
      line.style.opacity = '0';
      root.querySelectorAll('[data-split-cap]').forEach(function (c) {
        var keep = c.getAttribute('data-split-cap') === (toStudio ? 'studio' : 'production');
        var dx = (toStudio ? 1 : -1) * (keep ? 2.5 : 7);
        c.style.transition = 'opacity .42s ease,transform .78s ' + ease;
        c.style.transform = 'translateX(' + dx + 'vw)';
        if (!keep) c.style.opacity = '0';
      });
      root.querySelectorAll('img').forEach(function (im) {
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
      clearTimeout(navTimer);
      navTimer = null;
      state.wiping = false;
      state.hover = null;
      var els = [root, img, line].concat(Array.prototype.slice.call(root.querySelectorAll('[data-split-cap], img')));
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

    root.addEventListener('mousemove', function (e) {
      if (state.wiping) return;
      var r = root.getBoundingClientRect();
      var side = (e.clientX - r.left) < r.width / 2 ? 'studio' : 'production';
      if (side !== state.hover) hover(side);
    });
    root.addEventListener('mouseleave', function () { hover(null); });
    root.addEventListener('click', function (e) {
      if (state.wiping) return;
      var r = root.getBoundingClientRect();
      var toStudio = (e.clientX - r.left) / r.width * 100 < state.pct;
      wipeTo(toStudio);
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
      var toStudio = a.getAttribute('data-nav') === 'studios';
      a.addEventListener('mouseenter', function () { hover(toStudio ? 'studio' : 'production'); });
      a.addEventListener('mouseleave', function () { hover(null); });
      a.addEventListener('click', function (e) {
        // Leave modified clicks (new tab, new window, download) to the browser.
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        wipeTo(toStudio);
      });
    });
  }

  /* ---------- Init ---------- */

  function init() {
    heroBind();
    cycleBind();
    newsletterBind();
    reelBind();
    reveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run reveal when page content changes visibility (used by the About tabs).
  window.JSL = { reveal: reveal, reduced: reduced };
})();
