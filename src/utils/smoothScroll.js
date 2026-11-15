/**
 * Lightweight inertial scrolling for mouse wheels.
 *
 * Wheel input sets a target position; each animation frame the page eases
 * toward it, so scrolling glides and settles instead of jumping in notches.
 * Touch devices, keyboard, and scrollbar dragging keep native behaviour,
 * and it is disabled entirely for prefers-reduced-motion.
 */

const EASE = 0.09; // fraction of the remaining distance covered per 60fps frame

// The running instance lives on window, not module scope, so every importer
// sees the same one even if the bundler loads this module twice.
const KEY = '__smoothScroll';
const getActive = () => (typeof window === 'undefined' ? null : window[KEY] || null);

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

// Let nested scroll areas (code blocks, menus) handle their own wheel events
const canScrollInside = (node, dy) => {
  for (let el = node; el && el !== document.body; el = el.parentElement) {
    const { overflowY } = window.getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      if (dy < 0 ? el.scrollTop > 0 : el.scrollTop + el.clientHeight < el.scrollHeight - 1) {
        return true;
      }
    }
  }
  return false;
};

export const initSmoothScroll = () => {
  if (typeof window === 'undefined' || getActive()) {
    return () => {};
  }
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  if (reduceMotion || coarsePointer) {
    return () => {};
  }

  const html = document.documentElement;
  const previousBehavior = html.style.scrollBehavior;
  // CSS smooth scrolling would fight the per-frame scrollTo calls
  html.style.scrollBehavior = 'auto';

  let target = window.scrollY;
  let current = window.scrollY;
  let frame = null;
  let last = 0;

  const tick = now => {
    const dt = Math.min(now - last, 64);
    last = now;
    // Frame-rate independent easing (same feel at 60Hz and 120Hz)
    const k = 1 - Math.pow(1 - EASE, dt / 16.67);
    current += (target - current) * k;
    if (Math.abs(target - current) < 0.5) {
      current = target;
      window.scrollTo(0, current);
      frame = null;
      return;
    }
    window.scrollTo(0, current);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!frame) {
      last = performance.now();
      frame = requestAnimationFrame(tick);
    }
  };

  const onWheel = e => {
    if (e.ctrlKey || e.defaultPrevented) {
      return; // pinch-zoom or handled elsewhere
    }
    const { classList } = document.body;
    if (classList.contains('blur') || classList.contains('hidden')) {
      return; // mobile menu open
    }
    let dy = e.deltaY;
    if (e.deltaMode === 1) {
      dy *= 16;
    } else if (e.deltaMode === 2) {
      dy *= window.innerHeight;
    }
    if (canScrollInside(e.target, dy)) {
      return;
    }
    e.preventDefault();
    if (!frame) {
      target = window.scrollY;
      current = window.scrollY;
    }
    target = clamp(target + dy, 0, maxScroll());
    start();
  };

  // Keyboard / scrollbar / programmatic scrolls: resync when we're idle
  const onScroll = () => {
    if (!frame) {
      target = window.scrollY;
      current = window.scrollY;
    }
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });

  window[KEY] = {
    scrollTo: y => {
      if (!frame) {
        current = window.scrollY;
      }
      target = clamp(y, 0, maxScroll());
      start();
    },
  };

  return () => {
    window.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    if (frame) {
      cancelAnimationFrame(frame);
    }
    html.style.scrollBehavior = previousBehavior;
    window[KEY] = null;
  };
};

// Glide to an element: uses the inertial scroller when active, native smooth otherwise
export const scrollToElement = el => {
  if (!el) {
    return;
  }
  const active = getActive();
  if (active) {
    active.scrollTo(el.getBoundingClientRect().top + window.scrollY);
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};
