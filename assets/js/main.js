/* ============================================================
   main.js — Dark mode, skeleton loading, search, tag filter,
             scroll animations, mobile nav, reading time
   ============================================================ */

(function () {
  'use strict';

  // -----------------------------------------------------------
  // DARK MODE
  // -----------------------------------------------------------
  const THEME_KEY = 'site-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.querySelector('.theme-toggle');
    if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  // Apply immediately to avoid flash
  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    // Re-apply to make sure toggle icon is set
    applyTheme(getPreferredTheme());

    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // -----------------------------------------------------------
    // NAVBAR SCROLL EFFECT
    // -----------------------------------------------------------
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      });
    }

    // -----------------------------------------------------------
    // MOBILE NAV TOGGLE
    // -----------------------------------------------------------
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        navToggle.setAttribute('aria-expanded', isOpen);
        navToggle.textContent = isOpen ? '✕' : '☰';
      });

      // Close on link click (mobile)
      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('open');
          navToggle.setAttribute('aria-expanded', false);
          navToggle.textContent = '☰';
        });
      });
    }

    // -----------------------------------------------------------
    // ACTIVE NAV LINK
    // -----------------------------------------------------------
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      const href = link.getAttribute('href').replace(/\/$/, '') || '/';
      if (currentPath === href || (href !== '/' && currentPath.startsWith(href))) {
        link.classList.add('active');
      }
    });

    // -----------------------------------------------------------
    // SKELETON LOADING
    // -----------------------------------------------------------
    function removeSkeleton() {
      document.querySelectorAll('.skeleton-wrapper').forEach(function (el) {
        el.classList.add('loaded');
      });
      document.querySelectorAll('.content-wrapper').forEach(function (el) {
        el.classList.add('loaded');
      });
    }

    // Simulate short loading delay for skeleton effect
    setTimeout(removeSkeleton, 600);

    // -----------------------------------------------------------
    // SCROLL FADE-IN ANIMATIONS
    // -----------------------------------------------------------
    const faders = document.querySelectorAll('.fade-in');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      faders.forEach(function (el) { observer.observe(el); });
    } else {
      // Fallback
      faders.forEach(function (el) { el.classList.add('visible'); });
    }

    // -----------------------------------------------------------
    // BLOG SEARCH (client-side)
    // -----------------------------------------------------------
    const searchInput = document.getElementById('blog-search');
    const postCards = document.querySelectorAll('.blog-post-item');
    const noResults = document.getElementById('no-results');

    if (searchInput && postCards.length) {
      searchInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        let visibleCount = 0;

        postCards.forEach(function (card) {
          const title = (card.dataset.title || '').toLowerCase();
          const tags = (card.dataset.tags || '').toLowerCase();
          const excerpt = (card.dataset.excerpt || '').toLowerCase();
          const matches = !query || title.includes(query) || tags.includes(query) || excerpt.includes(query);
          card.style.display = matches ? '' : 'none';
          if (matches) visibleCount++;
        });

        if (noResults) {
          noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
      });
    }

    // -----------------------------------------------------------
    // TAG FILTER
    // -----------------------------------------------------------
    const tagFilters = document.querySelectorAll('.tag-filter');
    if (tagFilters.length && postCards.length) {
      tagFilters.forEach(function (btn) {
        btn.addEventListener('click', function () {
          // Toggle active
          tagFilters.forEach(function (b) { b.classList.remove('active'); });
          this.classList.add('active');

          const tag = this.dataset.tag;
          let visibleCount = 0;

          postCards.forEach(function (card) {
            const cardTags = (card.dataset.tags || '').toLowerCase();
            const matches = tag === 'all' || cardTags.includes(tag.toLowerCase());
            card.style.display = matches ? '' : 'none';
            if (matches) visibleCount++;
          });

          if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
          }

          // Clear search
          if (searchInput) searchInput.value = '';
        });
      });
    }

    // -----------------------------------------------------------
    // READING TIME (auto-calculate on post pages)
    // -----------------------------------------------------------
    const postContent = document.querySelector('.post-content');
    const readingTimeEl = document.getElementById('reading-time');
    if (postContent && readingTimeEl) {
      const words = postContent.textContent.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      readingTimeEl.textContent = minutes + ' min read';
    }

    // -----------------------------------------------------------
    // TABLE OF CONTENTS (auto-generate on post pages)
    // -----------------------------------------------------------
    const tocContainer = document.getElementById('toc-list');
    if (postContent && tocContainer) {
      const headings = postContent.querySelectorAll('h2, h3');
      if (headings.length > 2) {
        headings.forEach(function (h, i) {
          if (!h.id) h.id = 'heading-' + i;
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent;
          if (h.tagName === 'H3') {
            li.style.paddingLeft = '1.25rem';
          }
          li.appendChild(a);
          tocContainer.appendChild(li);
        });
        document.getElementById('toc')?.style.removeProperty('display');
      }
    }

    // -----------------------------------------------------------
    // SMOOTH SCROLL for anchor links
    // -----------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

  }); // DOMContentLoaded
})();
