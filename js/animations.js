/**
 * animations.js
 * Handles:
 *  1. IntersectionObserver reveal animations for all sections
 *  2. Timeline card expand/collapse
 *  3. Contact form submission (frontend only)
 *  4. Footer year
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
    // Individual reveal elements
    document.querySelectorAll('.reveal, .reveal--left, .reveal--scale').forEach(el => {
      revealObserver.observe(el);
    });

    // Staggered groups
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
    // Section headers
    document.querySelectorAll('.section__header').forEach(el => {
      el.classList.add('reveal');
    });

    // About grid columns
    document.querySelectorAll('.about__bio').forEach(el => el.classList.add('reveal--left'));
    document.querySelectorAll('.about__interests').forEach(el => el.classList.add('reveal'));

    // Timeline items — stagger manually
    document.querySelectorAll('.timeline__item').forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 100}ms`;
    });

    // Skill cards as a group
    const skillsGrid = document.querySelector('.skills__grid');
    if (skillsGrid) skillsGrid.classList.add('reveal-group');

    // Project cards as a group
    const projectsGrid = document.querySelector('.projects__grid');
    if (projectsGrid) projectsGrid.classList.add('reveal-group');

    // Resource cards as a group
    const resourcesGrid = document.querySelector('.resources__grid');
    if (resourcesGrid) resourcesGrid.classList.add('reveal-group');

    // Contact grid
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
      // Collapse
      body.style.maxHeight = body.scrollHeight + 'px';
      requestAnimationFrame(() => {
        body.style.transition = 'max-height 0.3s ease, opacity 0.3s ease';
        body.style.maxHeight  = '0px';
        body.style.opacity    = '0';
      });
      body.addEventListener('transitionend', () => {
        body.hidden = true;
        body.style.maxHeight = '';
        body.style.opacity   = '';
        body.style.transition = '';
      }, { once: true });
      card.setAttribute('aria-expanded', 'false');
    } else {
      // Expand
      body.hidden = false;
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

  /* ── 4. Contact form — sends email via mailto fallback ────────── */
  function initContactForm() {
    const form   = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (!form) return;

    const TO_EMAIL = form.getAttribute('data-email') || 'mohashah1213@gmail.com';

    form.addEventListener('submit', e => {
      e.preventDefault();
      const name    = form.contactName.value.trim();
      const email   = form.contactEmail.value.trim();
      const message = form.contactMessage.value.trim();

      if (!name || !email || !message) {
        showStatus('Please fill in all fields.', 'error');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showStatus('Please enter a valid email address.', 'error');
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Opening mail…';

      /*
       * Build a mailto: link pre-filled with the message.
       * This opens the user's default email app with:
       *   To:      mohashah1213@gmail.com
       *   Subject: Portfolio Contact — [Name]
       *   Body:    Name, sender email, and message
       *
       * NOTE: For a server-side send (no mailto popup), replace this block
       * with a fetch() to a backend endpoint or a service like Formspree:
       *   fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body: new FormData(form) })
       */
      const subject = encodeURIComponent('Portfolio Contact — ' + name);
      const body    = encodeURIComponent(
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n\n' +
        message
      );
      const mailto  = 'mailto:' + TO_EMAIL + '?subject=' + subject + '&body=' + body;

      // Open mailto in a hidden link (avoids popup blockers)
      const a = document.createElement('a');
      a.href = mailto;
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      showStatus('Your email app has opened — send from there to complete your message.', 'success');
      form.reset();
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    });

    function showStatus(msg, type) {
      if (!status) return;
      status.textContent = msg;
      status.style.color = type === 'success'
        ? 'var(--color-success)'
        : 'var(--color-warning)';
      setTimeout(() => { status.textContent = ''; }, 7000);
    }
  }

  /* ── 5. Footer year ──────────────────────────────────────────── */
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
    setFooterYear();
  });

  window.AnimationsModule = { toggleTimelineCard };

})();
