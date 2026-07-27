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

Each project page in `projects/` follows a consistent template: navbar, back link, title with tags, hero image (`class="project-hero-image"`), content sections, footer. All pages include `js/i18n.js`, `js/gate.js`, and `js/main.js`.

## Gated Content

Some "extra" content is hidden by default and revealed only to visitors who arrive with a secret unlock link. This is **not** a security boundary — the ciphertext ships in the public repo and is offline-brute-forceable. It only keeps content out of casual view, plain View Source, and search indexes. **Never gate anything confidential.**

**Two ways to unlock:**

1. **Secret link** — open any page with `#unlock=<passphrase>` in the URL (URL-encode spaces, e.g. `%20`).
2. **Navbar lock button** — `js/gate.js` injects a discreet 🔒 icon next to the EN|FR switcher on every page. Clicking it opens a passphrase field; the icon turns to an open padlock and shows a "Lock again" action once unlocked.

Either way, `js/gate.js` derives an AES-256-GCM key from the passphrase (PBKDF2-SHA-256, 200k iterations), decrypts every `.gated` block on the page, remembers the passphrase in `sessionStorage`, and (for the link) strips it from the address bar. One unlock reveals the whole site for that tab; "Lock again" clears the session and reloads.

**Verifier token:** so the navbar field can report a wrong passphrase on pages that have no gated block, `gate.js` holds a `VERIFY_TOKEN` — the ciphertext of a fixed magic string. On submit it decrypts that to confirm the passphrase before storing it. **If you change the passphrase, regenerate it:** `PORTFOLIO_UNLOCK="<phrase>" python tools/encrypt.py --verifier`, then paste the printed value into `VERIFY_TOKEN` in `js/gate.js`. It is not secret — it only proves a passphrase is correct.

The UI's EN/FR labels live in the `STRINGS` map in `gate.js` (not in `locales/*.json`), and re-render on language switch.

The shared passphrase is **not stored in the repo** — keep it in your own notes. Only the ciphertext lives in git.

**A gated block** is inserted into any committed page where the extra content should appear:

```html
<div class="gated" data-gated="<name>">
    <script type="application/octet-stream" class="gated-payload">BASE64_CIPHERTEXT</script>
</div>
```

`.gated` blocks are `display:none` until unlocked (fail-closed, so JS-disabled visitors never see them). On unlock the block's `innerHTML` is replaced with the decrypted content for the current language and re-rendered on language switch.

**i18n:** gated text can **not** use `locales/*.json` (that's public plaintext). Each payload decrypts to `{ "en": "<html>", "fr": "<html>" }` — both languages are baked into the ciphertext. Write final translated markup in the fragment; do not use `data-i18n` inside it.

**Authoring workflow** (dev-only, `pip install cryptography` — not shipped, not a build step):

1. Write plaintext fragments in the git-ignored `private-src/` — `<name>.en.html` and `<name>.fr.html`.
2. Run `PORTFOLIO_UNLOCK="<passphrase>" python tools/encrypt.py [<name>]`. It writes a ready-to-paste block to `private-out/<name>.html` (also git-ignored) and prints it.
3. Paste the `<div class="gated">…</div>` block into the target page and commit the page. Plaintext and passphrase are never committed.

Changing gated content = edit the fragment, re-run `encrypt.py`, re-paste the block.

**Fully gated pages:** keep the page shell (navbar, footer, scripts) public but make the content region one `.gated` block, and add `<meta name="robots" content="noindex">` so the secret URL isn't crawled. The page's card in the projects grid should also be gated (see indexing below) so the page is invisible until unlocked. `projects/observability.html` is the live example — a `noindex` page whose public shell shows only a back-link and a `gate.privatePage` notice, with the whole article (its own `project-header` + `project-content`) baked into one `observability-body` gated block and indexed on the homepage via the `home-cards` block. Its `.project-page > .gated.gated-open { display: contents }` rule lets the block's header/content flow as if the wrapper weren't there, and `.project-page:has(.gated.gated-open) .gate-notice` hides the notice once unlocked. Because the body is gated, its text lives only in the encrypted fragment — **not** in `locales/*.json`.

**Indexing gated pages on the homepage:** the `home-cards` gated block lives at the end of the projects grid in `index.html` and holds a `<a class="project-card">…</a>` card for each gated page. Edit `private-src/home-cards.{en,fr}.html`, run `python tools/encrypt.py home-cards`, and replace the existing `<div class="gated" data-gated="home-cards">…</div>` block in `.project-grid` with the freshly printed one. When unlocked, the wrapper becomes `display:contents` (see `css/style.css`) so the private cards flow into the grid alongside the public ones; when locked they're hidden. Injected cards don't get the scroll fade-in (they appear after the observer runs) — that's expected.

**Quick reference — the moving parts:** `js/gate.js` (runtime + navbar UI + `VERIFY_TOKEN`), `tools/encrypt.py` (authoring, dev-only), `private-src/` + `private-out/` (git-ignored plaintext/output), `.gated` CSS in `css/style.css`, and the `home-cards` block in `index.html`. The `create-gated-content` skill (`.claude/skills/`) automates the author→encrypt→paste flow.

## Rerun Viewer

```javascript
loadRerunViewer(containerId, rrdUrl, rerunVersion='0.20.3')
```

Embeds Rerun visualizations via iframe from `app.rerun.io`. The `.rrd` files are tracked with Git LFS (see `.gitattributes`).

unicorn
