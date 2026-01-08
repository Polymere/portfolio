# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static HTML/CSS/JavaScript portfolio website for a robotics engineer. Features embedded Rerun visualizations for showcasing robot sensor data and simulations. Zero external dependencies.

## Running the Development Server

No build process required. Use any static file server:

```bash
# Python (recommended)
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

Then open http://localhost:8000

## Architecture

**Tech Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+)

**File Structure:**
- `index.html` - Landing page with hero, about, projects grid, and contact sections
- `css/style.css` - All styling with CSS custom properties for theming
- `js/main.js` - Mobile nav, smooth scroll, scroll effects, Intersection Observer animations
- `js/i18n.js` - Internationalization module for French/English support
- `locales/en.json`, `locales/fr.json` - Translation files
- `projects/*.html` - Individual project detail pages
- `pages/*.md` - Original markdown content (reference only)
- `assets/` - Images, videos, and CV (expected but may need creation)

**CSS Design Tokens:** All colors, fonts, shadows, and transitions are defined as CSS custom properties in `:root`. Use these variables for consistency.

**Responsive Breakpoints:**
- 968px - Tablet layout
- 768px - Mobile nav toggle, single-column grids
- 480px - Small mobile adjustments

## Key JavaScript Functions

```javascript
loadRerunViewer(containerId, rrdUrl, rerunVersion='0.20.3')
```

Embeds Rerun visualizations in project pages. The `containerId` is the DOM element ID, and `rrdUrl` is the URL to the `.rrd` recording file.

## Internationalization (i18n)

The site supports French and English via a client-side i18n system in `js/i18n.js`.

**Adding translations:**
1. Add the translation key to both `locales/en.json` and `locales/fr.json`
2. Add the appropriate `data-i18n` attribute to the HTML element

```html
<!-- Text content -->
<h2 data-i18n="about.title">About Me</h2>

<!-- HTML content (rendered as innerHTML) -->
<p data-i18n="section.content" data-i18n-html>Default content</p>

<!-- Placeholder attribute -->
<input data-i18n-placeholder="form.email" placeholder="Email">

<!-- Title attribute -->
<button data-i18n-title="btn.tooltip" title="Click me">Button</button>
```

**Language switcher:** Add `data-lang="en"` or `data-lang="fr"` to buttons. Active state is applied automatically.

**Language preference:** Stored in `localStorage` under key `portfolio-lang`. Defaults to browser language or English.

## Project Pages

Each project page in `projects/` follows a consistent template with:
- Back navigation to main page
- Rerun viewer container (when applicable)
- Content sections with semantic HTML

## When Modifying

- CSS changes go in `css/style.css` - organized by component sections
- Core JS is in `js/main.js` (nav toggle, scroll effects, Intersection Observer, Rerun helper)
- i18n system is in `js/i18n.js` (translation loading, language switching)
- Maintain semantic HTML structure and ARIA labels
- Test at all three responsive breakpoints
- Use existing CSS custom properties rather than hardcoding values
