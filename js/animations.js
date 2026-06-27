/**
 * animations.js
 * 1. IntersectionObserver reveal animations
 * 2. Timeline card expand/collapse
 * 3. Contact form — mailto
 * 4. Footer year
 */

'use strict';

(function AnimationsModule() {

  /* ── 1. Reveal on scroll ─────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -80px 0px', threshold: 0.08 }
  );

  function registerRevealElements() {
    document.querySelectorAll('.reveal, .reveal--left, .reveal--scale').forEach(el => {
      revealObserver.observe(el);
    });
    document.querySelectorAll('.reveal-group').forEach(group => {
      const groupObserver = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              groupObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
      );
      groupObserver.observe(group);
    });
  }

  /* ── 2. Auto-assign reveal classes ──────────────────────────── */
  function assignRevealClasses() {
    document.querySelectorAll('.section__header').forEach(el => el.classList.add('reveal'));
    document.querySelectorAll('.about__bio').forEach(el => el.classList.add('reveal--left'));
    document.querySelectorAll('.about__interests').forEach(el => el.classList.add('reveal'));
    document.querySelectorAll('.timeline__item').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 100}ms`;
    });
    const skillsGrid    = document.querySelector('.skills__grid');
    const projectsGrid  = document.querySelector('.projects__grid');
    const resourcesGrid = document.querySelector('.resources__grid');
    if (skillsGrid)    skillsGrid.classList.add('reveal-group');
    if (projectsGrid)  projectsGrid.classList.add('reveal-group');
    if (resourcesGrid) resourcesGrid.classList.add('reveal-group');
    document.querySelectorAll('.contact__card, .contact__form').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 120}ms`;
    });
  }

  /* ── 3. Timeline expand/collapse ─────────────────────────────── */
  function initTimeline() {
    document.querySelectorAll('.timeline__card').forEach(card => {
      card.addEventListener('click', () => toggleTimelineCard(card));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTimelineCard(card);
        }
      });
    });
  }

  function toggleTimelineCard(card) {
    const body     = card.querySelector('.timeline__card-body');
    const expanded = card.getAttribute('aria-expanded') === 'true';
    if (!body) return;

    if (expanded) {
      body.style.maxHeight  = body.scrollHeight + 'px';
      requestAnimationFrame(() => {
        body.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        body.style.maxHeight  = '0px';
        body.style.opacity    = '0';
      });
      body.addEventListener('transitionend', () => {
        body.hidden           = true;
        body.style.maxHeight  = '';
        body.style.opacity    = '';
        body.style.transition = '';
      }, { once: true });
      card.setAttribute('aria-expanded', 'false');
    } else {
      body.hidden           = false;
      body.style.maxHeight  = '0px';
      body.style.opacity    = '0';
      body.style.overflow   = 'hidden';
      requestAnimationFrame(() => {
        body.style.transition = 'max-height 0.35s ease, opacity 0.3s ease';
        body.style.maxHeight  = body.scrollHeight + 'px';
        body.style.opacity    = '1';
      });
      body.addEventListener('transitionend', () => {
        body.style.maxHeight  = '';
        body.style.overflow   = '';
        body.style.transition = '';
      }, { once: true });
      card.setAttribute('aria-expanded', 'true');
    }
  }

  /* ── 4. Contact form — mailto ────────────────────────────────── */
  function initContactForm() {
    const form   = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    const TO_EMAIL = form.getAttribute('data-email') || 'mohashah1213@gmail.com';

    form.addEventListener('submit', e => {
      e.preventDefault();

      const messageEl = form.querySelector('[name="message"], #contactMessage, textarea');
      const message   = messageEl ? messageEl.value.trim() : '';

      if (!message) {
        showStatus('Please enter a message.', 'error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Opening mail…';
      }

      const subject = encodeURIComponent('Portfolio Contact');
      const body    = encodeURIComponent(message);
      const mailto  = 'mailto:' + TO_EMAIL + '?subject=' + subject + '&body=' + body;

      /*
       * Use window.location.href for mailto — this is the only reliable
       * cross-browser method. window.open() navigates the tab (as seen
       * in the screenshot). a.click() has the same problem in Chrome.
       * window.location.href triggers the OS email client without
       * navigating away from the page.
       */
      window.location.href = mailto;

      showStatus('Your email app should open — complete sending from there.', 'success');
      form.reset();

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
      }
    });

    function showStatus(msg, type) {
      if (!status) return;
      status.textContent = msg;
      status.style.color = type === 'success' ? 'var(--color-success)' : 'var(--color-warning)';
      setTimeout(() => { status.textContent = ''; }, 7000);
    }
  }

  /* ── 5. Resources — open in new tab ─────────────────────────── */
  function initResources() {
    document.querySelectorAll('.resource-card[data-file]').forEach(card => {
      card.addEventListener('click', () => {
        const file = card.getAttribute('data-file');
        if (file) window.open(file, '_blank', 'noopener');
      });
    });
  }

  /* ── 6. Footer year ──────────────────────────────────────────── */
  function setFooterYear() {
    const el = document.getElementById('footerYear');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ── Init ────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    assignRevealClasses();
    registerRevealElements();
    initTimeline();
    initContactForm();
    initResources();
    setFooterYear();
  });

  window.AnimationsModule = { toggleTimelineCard };

})();
