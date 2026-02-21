// ============================================
// DARK MODE TOGGLE
// ============================================
(function() {
  const toggle = document.getElementById('theme-toggle');
  const icon = document.getElementById('theme-icon');
  const html = document.documentElement;

  // Check saved preference or system preference
  const saved = localStorage.getItem('theme');
  if (saved) {
    html.setAttribute('data-theme', saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.setAttribute('data-theme', 'dark');
  }

  function updateIcon() {
    const current = html.getAttribute('data-theme');
    icon.textContent = current === 'dark' ? '☀️' : '🌙';
  }
  updateIcon();

  toggle.addEventListener('click', function() {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon();
  });
})();

// ============================================
// MOBILE NAV TOGGLE
// ============================================
(function() {
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function() {
      navLinks.classList.toggle('open');
    });

    // Close nav when clicking a link (mobile)
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        navLinks.classList.remove('open');
      });
    });
  }
})();

// ============================================
// BLOG SEARCH & FILTER
// ============================================
(function() {
  const searchBox = document.getElementById('blog-search');
  const tagButtons = document.querySelectorAll('.tag-filter');
  const posts = document.querySelectorAll('.blog-post-card');

  if (!searchBox && tagButtons.length === 0) return;

  let activeTag = '';

  // Check URL for tag param
  const urlParams = new URLSearchParams(window.location.search);
  const tagParam = urlParams.get('tag');
  if (tagParam) {
    activeTag = tagParam;
    tagButtons.forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.tag === tagParam);
    });
  }

  function filterPosts() {
    const query = searchBox ? searchBox.value.toLowerCase() : '';
    posts.forEach(function(post) {
      const title = post.dataset.title || '';
      const tags = post.dataset.tags || '';
      const summary = post.dataset.summary || '';
      const matchesSearch = !query || title.includes(query) || summary.includes(query) || tags.includes(query);
      const matchesTag = !activeTag || tags.includes(activeTag);
      post.style.display = (matchesSearch && matchesTag) ? '' : 'none';
    });
  }

  if (searchBox) {
    searchBox.addEventListener('input', filterPosts);
  }

  tagButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      const tag = btn.dataset.tag;
      if (activeTag === tag) {
        activeTag = '';
        btn.classList.remove('active');
      } else {
        activeTag = tag;
        tagButtons.forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
      }
      filterPosts();
    });
  });

  // Initial filter (in case tag param was set)
  filterPosts();
})();

// ============================================
// FADE IN ANIMATION ON SCROLL
// ============================================
(function() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card, .project-card, .highlight-card, .timeline-item').forEach(function(el) {
    observer.observe(el);
  });
})();
