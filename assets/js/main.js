/* ============================================================
   main.js — Dark mode, particle canvas, typing effect,
             skeleton loading, search, tag filter, scroll anims
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

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getPreferredTheme());

    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    // -----------------------------------------------------------
    // PARTICLE CANVAS (connecting dots background)
    // -----------------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let particles = [];
      let animId;
      const PARTICLE_COUNT = 70;
      const CONNECTION_DIST = 130;
      let mouse = { x: null, y: null };

      function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      function createParticles() {
        particles = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.6,
            vy: (Math.random() - 0.5) * 0.6,
            r: Math.random() * 2 + 0.8
          });
        }
      }

      // Occasional glitch frame counter
      let glitchFrame = 0;

      function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Random glitch: every ~300 frames, briefly shift colors
        glitchFrame++;
        const isGlitch = glitchFrame % 300 < 3;
        
        const dotColor = isGlitch
          ? 'rgba(97, 255, 131, 0.9)'
          : isDark ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 180, 220, 0.25)';
        const lineColor = isGlitch
          ? 'rgba(97, 255, 131, 0.2)'
          : isDark ? 'rgba(0, 212, 255, 0.08)' : 'rgba(0, 180, 220, 0.06)';
        
        // Occasional random hex characters drawn on canvas
        if (isDark && Math.random() < 0.02) {
          const chars = '01ABCDEFabcdef{}[];:';
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillStyle = 'rgba(97, 255, 131, 0.06)';
          for (let k = 0; k < 3; k++) {
            ctx.fillText(
              chars[Math.floor(Math.random() * chars.length)],
              Math.random() * canvas.width,
              Math.random() * canvas.height
            );
          }
        }

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.fill();

          // Connections
          for (let j = i + 1; j < particles.length; j++) {
            const q = particles[j];
            const dx = p.x - q.x;
            const dy = p.y - q.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECTION_DIST) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(q.x, q.y);
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }

          // Mouse interaction — green glow lines
          if (mouse.x !== null) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.strokeStyle = isDark ? 'rgba(97, 255, 131, 0.18)' : 'rgba(97, 255, 131, 0.1)';
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        animId = requestAnimationFrame(drawParticles);
      }

      resize();
      createParticles();
      drawParticles();

      window.addEventListener('resize', function () {
        resize();
        createParticles();
      });

      window.addEventListener('mousemove', function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      });

      window.addEventListener('mouseout', function () {
        mouse.x = null;
        mouse.y = null;
      });
    }

    // -----------------------------------------------------------
    // TYPING EFFECT
    // -----------------------------------------------------------
    const typedEl = document.getElementById('typed-text');
    if (typedEl) {
      const phrases = typedEl.dataset.phrases
        ? typedEl.dataset.phrases.split('|')
        : ['Cybersecurity', 'Forensics', 'Human Rights'];
      let phraseIdx = 0;
      let charIdx = 0;
      let deleting = false;
      let pauseTimer = 0;
      const TYPE_SPEED = 80;
      const DELETE_SPEED = 40;
      const PAUSE = 2000;

      function typeLoop() {
        const current = phrases[phraseIdx];

        if (!deleting) {
          typedEl.textContent = current.substring(0, charIdx + 1);
          charIdx++;
          if (charIdx === current.length) {
            deleting = true;
            pauseTimer = PAUSE;
          }
        } else {
          typedEl.textContent = current.substring(0, charIdx - 1);
          charIdx--;
          if (charIdx === 0) {
            deleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
          }
        }

        let delay = deleting ? DELETE_SPEED : TYPE_SPEED;
        if (pauseTimer > 0) {
          delay = pauseTimer;
          pauseTimer = 0;
        }

        setTimeout(typeLoop, delay);
      }

      typeLoop();
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

      navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          navLinks.classList.remove('open');
          navToggle.setAttribute('aria-expanded', false);
          navToggle.textContent = '☰';
        });
      });
    }

    // -----------------------------------------------------------
    // ACTIVE NAV LINK — accounts for baseurl prefix
    // -----------------------------------------------------------
    var brandEl = document.querySelector('.nav-brand');
    var basePath = brandEl ? brandEl.getAttribute('href').replace(/\/$/, '') : '';
    var currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    // Strip the baseurl from the current path to get the page-level path
    var relCurrent = basePath ? currentPath.replace(basePath, '') : currentPath;
    if (!relCurrent || relCurrent === '') relCurrent = '/';

    document.querySelectorAll('.nav-links a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;
      var normalised = href.replace(/\/$/, '') || '/';
      var relLink = basePath ? normalised.replace(basePath, '') : normalised;
      if (!relLink || relLink === '') relLink = '/';

      // Exact match, or sub-page match (e.g. /blog matches /blog/some-post)
      if (relCurrent === relLink || (relLink !== '/' && relCurrent.startsWith(relLink + '/'))) {
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

    setTimeout(removeSkeleton, 600);

    // -----------------------------------------------------------
    // SCROLL ANIMATIONS (fade-in, slide-in-left, scale-in)
    // -----------------------------------------------------------
    const animEls = document.querySelectorAll('.fade-in, .slide-in-left, .scale-in');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      animEls.forEach(function (el) { observer.observe(el); });
    } else {
      animEls.forEach(function (el) { el.classList.add('visible'); });
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

          if (searchInput) searchInput.value = '';
        });
      });
    }

    // -----------------------------------------------------------
    // READING TIME
    // -----------------------------------------------------------
    const postContent = document.querySelector('.post-content');
    const readingTimeEl = document.getElementById('reading-time');
    if (postContent && readingTimeEl) {
      const words = postContent.textContent.trim().split(/\s+/).length;
      const minutes = Math.max(1, Math.ceil(words / 200));
      readingTimeEl.textContent = minutes + ' min read';
    }

    // -----------------------------------------------------------
    // TABLE OF CONTENTS (auto-generate)
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
        var tocEl = document.getElementById('toc');
        if (tocEl) tocEl.style.removeProperty('display');
      }
    }

    // -----------------------------------------------------------
    // SMOOTH SCROLL for anchor links
    // -----------------------------------------------------------
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

  }); // DOMContentLoaded
})();
