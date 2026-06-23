/**
 * gallery.js — Reusable fullscreen lightbox + auto-discovery of images
 *
 * ═══ EASY PHOTO NAMING CONVENTION ═══════════════════════════════════
 *
 * Experience galleries — place files in assets/images/:
 *   exp-usg-1.jpg, exp-usg-2.jpg, exp-usg-3.jpg  … (any number)
 *   exp-cure-1.jpg, exp-cure-2.jpg  …
 *   exp-leadership-1.jpg, exp-leadership-2.jpg  …
 *   exp-vision-1.jpg, exp-vision-2.jpg  …
 *
 * Project galleries — place files in assets/images/:
 *   tomato_slicer_gallery01.jpg, tomato_slicer_gallery02.jpg  …
 *   foam_chair_gallery01.jpg, foam_chair_gallery02.jpg  …
 *   quadruped_gallery01.jpg, quadruped_gallery02.jpg  …
 *
 * The gallery button will automatically find numbered images.
 * Add as many as you want — just keep incrementing the number.
 * No HTML changes needed.
 *
 * data-gallery on the article/element is still supported as an
 * explicit override if you want custom paths.
 * ════════════════════════════════════════════════════════════════════
 */
'use strict';

(function GalleryModule() {

  const lightbox  = document.getElementById('lightbox');
  const backdrop  = document.getElementById('lightboxBackdrop');
  const closeBtn  = document.getElementById('lightboxClose');
  const prevBtn   = document.getElementById('lightboxPrev');
  const nextBtn   = document.getElementById('lightboxNext');
  const imgEl     = document.getElementById('lightboxImg');
  const counterEl = document.getElementById('lightboxCounter');
  const thumbsEl  = document.getElementById('lightboxThumbs');

  if (!lightbox) return;

  let images  = [];
  let current = 0;

  /* ── Image path patterns for each gallery ID ─────────────────── */
  const GALLERY_PATTERNS = {
    // Experience: exp-ID-N.jpg
    'usg':        (n) => `assets/images/exp-usg-${n}.jpg`,
    'cure':       (n) => `assets/images/exp-cure-${n}.jpg`,
    'leadership': (n) => `assets/images/exp-leadership-${n}.jpg`,
    'vision':     (n) => `assets/images/exp-vision-${n}.jpg`,
    // Projects: SLUG_gallery0N.jpg
    'tomato-slicer': (n) => `assets/images/tomato_slicer_gallery${String(n).padStart(2,'0')}.jpg`,
    'foam-chair':    (n) => `assets/images/foam_chair_gallery${String(n).padStart(2,'0')}.jpg`,
    'quadruped':     (n) => `assets/images/quadruped_gallery${String(n).padStart(2,'0')}.jpg`,
  };

  /* ── Probe images via HEAD requests to find how many exist ───── */
  async function discoverImages(pattern, maxCheck = 20) {
    const found = [];
    const checks = [];
    for (let i = 1; i <= maxCheck; i++) {
      checks.push({ i, src: pattern(i) });
    }
    // Check all in parallel
    await Promise.all(checks.map(({ i, src }) =>
      new Promise(resolve => {
        const img = new Image();
        img.onload  = () => { found.push({ i, src }); resolve(); };
        img.onerror = () => resolve();
        img.src = src;
      })
    ));
    // Sort by index
    found.sort((a, b) => a.i - b.i);
    return found.map(f => f.src);
  }

  /* ── Open lightbox ───────────────────────────────────────────── */
  async function open(galleryId, explicitImages, startIndex) {
    startIndex = startIndex || 0;

    if (explicitImages && explicitImages.length > 0) {
      images = explicitImages;
    } else if (GALLERY_PATTERNS[galleryId]) {
      // Show loading state
      lightbox.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
      imgEl.src = '';
      counterEl.textContent = 'Loading…';
      thumbsEl.innerHTML = '';

      images = await discoverImages(GALLERY_PATTERNS[galleryId]);

      if (images.length === 0) {
        counterEl.textContent = 'No photos yet';
        return;
      }
    } else {
      return;
    }

    current = Math.min(startIndex, images.length - 1);
    buildThumbs();
    showImage(current);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  /* ── Close ───────────────────────────────────────────────────── */
  function close() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    images = [];
  }

  /* ── Navigate ────────────────────────────────────────────────── */
  function showImage(idx) {
    current = ((idx % images.length) + images.length) % images.length;
    imgEl.src = images[current];
    imgEl.alt = `Gallery image ${current + 1}`;
    if (counterEl) counterEl.textContent = `${current + 1} / ${images.length}`;
    document.querySelectorAll('.lightbox__thumb').forEach((t, i) => {
      t.classList.toggle('is-active', i === current);
    });
  }

  function prev() { if (images.length) showImage(current - 1); }
  function next() { if (images.length) showImage(current + 1); }

  /* ── Thumbnails ──────────────────────────────────────────────── */
  function buildThumbs() {
    if (!thumbsEl) return;
    thumbsEl.innerHTML = '';
    images.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'lightbox__thumb';
      const img = document.createElement('img');
      img.src = src; img.alt = `Thumbnail ${i + 1}`; img.loading = 'lazy';
      div.appendChild(img);
      div.addEventListener('click', () => showImage(i));
      thumbsEl.appendChild(div);
    });
  }

  /* ── Event bindings ──────────────────────────────────────────── */
  if (closeBtn)  closeBtn.addEventListener('click', close);
  if (prevBtn)   prevBtn.addEventListener('click', prev);
  if (nextBtn)   nextBtn.addEventListener('click', next);
  if (backdrop)  backdrop.addEventListener('click', close);

  // Touch swipe support for mobile
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });

  document.addEventListener('keydown', e => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });

  const inner = lightbox.querySelector('.lightbox__inner');
  if (inner) inner.addEventListener('click', e => e.stopPropagation());

  /* ── Wire trigger buttons ────────────────────────────────────── */
  document.addEventListener('click', e => {
    const trigger = e.target.closest('.gallery-trigger');
    if (!trigger) return;

    const galleryId = trigger.getAttribute('data-gallery-id');
    if (!galleryId) return;

    // Check for explicit data-gallery on closest ancestor
    const ancestor = trigger.closest('[data-gallery]');
    let explicit = null;
    if (ancestor) {
      try { explicit = JSON.parse(ancestor.getAttribute('data-gallery') || 'null'); } catch {}
      // Also prepend primary img
      const primary = ancestor.getAttribute('data-primary-img');
      if (primary && explicit && !explicit.includes(primary)) explicit.unshift(primary);
    }

    open(galleryId, explicit, 0);
  });

  window.GalleryModule = { open, close };

})();
