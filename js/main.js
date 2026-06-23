/**
 * main.js — lazy images, skip link, image fade-in
 */
'use strict';

(function MainModule() {

  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return;
    const imgObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      });
    }, { rootMargin: '200px 0px' });
    document.querySelectorAll('img[loading="lazy"]').forEach(img => imgObserver.observe(img));
  }

  function initSkipLink() {
    const skip = document.createElement('a');
    skip.href = '#overview';
    skip.className = 'skip-link';
    skip.textContent = 'Skip to content';
    skip.addEventListener('click', e => {
      e.preventDefault();
      const t = document.getElementById('overview');
      if (t) { t.focus(); t.scrollIntoView(); }
    });
    document.body.prepend(skip);
  }

  function initImageFadeIn() {
    document.querySelectorAll('.project-card__image').forEach(img => {
      img.style.opacity = '0';
      img.style.transition = 'opacity 0.4s ease';
      const onLoad = () => { img.style.opacity = '1'; };
      if (img.complete) onLoad();
      else img.addEventListener('load', onLoad);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLazyImages();
    initSkipLink();
    initImageFadeIn();
  });

})();
