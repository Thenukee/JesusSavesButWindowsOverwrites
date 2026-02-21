# JesusSavesButWindowsOverwrites

A clean, minimal personal website built with **Jekyll** for GitHub Pages.

## Features

- Clean, responsive design (mobile-first)
- Dark mode toggle
- Blog with tag filtering and client-side search
- Projects portfolio
- CV/Resume page with PDF download
- Contact form (via Formspree)
- RSS feed
- SEO optimized
- /now page

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Hero, latest posts, highlights, mini bio |
| About | `/about/` | Story, interests, skills, timeline |
| Blog | `/blog/` | Posts list with search & tag filters |
| Projects | `/projects/` | Portfolio of tools and research |
| CV | `/cv/` | Web resume + PDF download |
| Contact | `/contact/` | Form + social links |
| Now | `/now/` | What you're currently doing |

## Getting Started

### Prerequisites

- Ruby (2.7+)
- Bundler (`gem install bundler`)

### Local Development

```bash
# Install dependencies
bundle install

# Serve locally
bundle exec jekyll serve
```

Visit `http://localhost:4000/JesusSavesButWindowsOverwrites/`

### Adding a New Blog Post

1. Create a file in `_posts/` with the naming format: `YYYY-MM-DD-your-post-title.md`
2. Add front matter:

```yaml
---
title: "Your Post Title"
date: 2026-02-21
tags: [Tag1, Tag2]
toc: true  # optional: adds table of contents
excerpt: "A short summary of your post."
---

Your content here in Markdown...
```

3. Commit and push to GitHub — your post will be published automatically.

### Adding a New Project

1. Create a file in `_projects/` with any name (e.g., `my-project.md`)
2. Add front matter:

```yaml
---
title: "Project Name"
tagline: "One-line description"
description: "What the project does"
tech: [Python, Tool1, Tool2]
github: "https://github.com/you/repo"
demo: "https://demo-url.com"  # optional
date: 2026-01-01
---

Detailed project description...
```

## Customization

- **Colors**: Edit CSS variables in `assets/css/style.css`
- **Site info**: Edit `_config.yml` (name, bio, links)
- **Contact form**: Replace `YOUR_FORM_ID` in `contact.md` with your [Formspree](https://formspree.io) form ID
- **CV PDF**: Place your PDF at `assets/files/cv.pdf`

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to the `main` branch
4. Your site will be live at `https://yourusername.github.io/JesusSavesButWindowsOverwrites/`

## License

MIT License — see [LICENSE](LICENSE) for details.
