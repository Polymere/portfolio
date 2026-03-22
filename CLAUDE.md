# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JavaScript portfolio website for a robotics engineer. Zero external dependencies, no build process.

## Running the Development Server

```bash
python server.py        # serves on port 8000 with CORS enabled
# or
python -m http.server 8000
```

Then open http://localhost:8000

## Architecture

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+)

**Key Files:**
- `index.html` - Landing page with hero, about, projects grid, and contact sections
- `css/style.css` - All styling with CSS custom properties for theming
- `js/main.js` - Mobile nav, smooth scroll, scroll effects, Intersection Observer animations, Rerun viewer helper
- `js/i18n.js` - Internationalization module (French/English)
- `locales/en.json`, `locales/fr.json` - Translation files
- `projects/*.html` - Individual project detail pages
- `pages/*.md` - Original markdown content (reference only, not served)

**CSS Design Tokens:** All colors, fonts, shadows, and transitions are defined as CSS custom properties in `:root`. Use these variables rather than hardcoding values.

**Responsive Breakpoints:** 968px (tablet), 768px (mobile nav/single-column), 480px (small mobile)

## Internationalization (i18n)

Every user-visible string must exist in both `locales/en.json` and `locales/fr.json` with a matching `data-i18n` attribute on the HTML element. Keys use dot notation (e.g., `projects.real2sim.title`).

**Supported attributes:**
- `data-i18n="key"` - text content
- `data-i18n-html` (+ `data-i18n`) - innerHTML
- `data-i18n-placeholder="key"` - input placeholder
- `data-i18n-title="key"` - title attribute
- `data-i18n-alt="key"` - alt attribute

Language preference stored in `localStorage` key `portfolio-lang`. Defaults to browser language or English.

## Project Pages

Each project page in `projects/` follows a consistent template: navbar, back link, title with tags, hero image (`class="project-hero-image"`), content sections, footer. All project pages include `js/i18n.js` and `js/main.js`.

## Rerun Viewer

```javascript
loadRerunViewer(containerId, rrdUrl, rerunVersion='0.20.3')
```

Embeds Rerun visualizations via iframe from `app.rerun.io`. The `.rrd` files are tracked with Git LFS (see `.gitattributes`).
