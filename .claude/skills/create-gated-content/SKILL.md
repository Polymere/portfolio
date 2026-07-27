---
name: create-gated-content
description: Create password-gated content for this portfolio — either a hidden section inside an existing page or a whole gated project page indexed on the homepage. Use whenever the user wants to add "extra"/private/unlockable content, a section behind the passphrase, or a page that only appears when the site is unlocked. Handles the author → encrypt → paste flow and keeps plaintext out of git.
---

# Create gated content

This portfolio has a client-side content gate (see **Gated Content** in `CLAUDE.md`).
Encrypted blocks ship in the public repo and are revealed in-browser to visitors
who supply the shared passphrase (via `#unlock=<phrase>` or the navbar 🔒 button).

It is **not** a security boundary — ciphertext is offline-brute-forceable.
**Never gate anything confidential.** If the user asks to gate secrets, stop and
say so; recommend a server-side approach instead.

## Before you start

1. **Get the passphrase.** It is deliberately not in the repo. Check memory
   (`gated-content-passphrase`), else ask the user. Never commit it or print it
   back in full in a way that lands in a tracked file.
2. **Ensure the encryptor can run.** `tools/encrypt.py` needs `cryptography`
   (`pip install cryptography`). System Python may be externally managed — if
   `pip` is unavailable, create a venv:
   `python3 -m venv .venv && .venv/bin/pip install cryptography`, and run the
   tool with `.venv/bin/python`. Never commit the venv (it's fine in scratch).
3. **Confirm the scope** with the user if unclear: a **section** inside an
   existing page, or a **whole page**? Both are below.

## Crypto contract (must stay in sync)

- `tools/encrypt.py` and `js/gate.js` share: PBKDF2-SHA-256, 200k iterations →
  AES-256-GCM. Payload = base64(`salt[16] || iv[12] || ciphertext+tag`).
- A block decrypts to JSON `{ "en": "<html>", "fr": "<html>" }` — **both
  languages are baked into the ciphertext.** Gated text can NOT use
  `locales/*.json` (that's public plaintext) and must NOT use `data-i18n`
  inside; write final translated markup in each fragment.
- Never hand-edit the base64. Always regenerate via `encrypt.py`.

## Fragment naming

Each fragment is a pair of git-ignored files in `private-src/`:
`<name>.en.html` and `<name>.fr.html`. Pick a short kebab-case `<name>`
describing the content (e.g. `biped-internals`, `salary-detail`).

## Flow A — a gated SECTION inside an existing page

1. Write `private-src/<name>.en.html` and `private-src/<name>.fr.html` with the
   final HTML for each language (may include `<code>`, `<figure>`, etc.).
2. Encrypt:
   `PORTFOLIO_UNLOCK="<phrase>" python tools/encrypt.py <name>`
   (use `.venv/bin/python` if you made a venv). It writes
   `private-out/<name>.html` and prints the block.
3. Paste the printed `<div class="gated" data-gated="<name>">…</div>` block into
   the target page exactly where the content should appear. The page already
   includes `js/gate.js` if it follows the standard template — confirm the three
   script tags (`i18n.js`, `gate.js`, `main.js`) are present near `</body>`.
4. Verify (see **Verify** below).

## Flow B — a whole gated PAGE (indexed on the homepage)

Use `projects/observability.html` as the reference implementation (public shell =
back-link + a `gate.privatePage` notice; the whole article baked into one
`observability-body` gated block; card in the `home-cards` block).

1. **Create the page** at the repo root (root-relative `css/`, `js/`, `assets/`
   paths) or in `projects/` (then use `../`). Copy the standard project-page
   shell: navbar, `main.project-page` with a `project-header` (back-link, `<h1>`,
   `project-meta` tags), `project-content`, footer, and the three scripts.
   - Add `<meta name="robots" content="noindex">` in `<head>` — gated pages must
     not be crawled.
   - Keep the shell public; put the private body in one `.gated` block (author it
     as a fragment per Flow A, e.g. `<name>-body`).
2. **Index it on the homepage.** The `home-cards` gated block at the end of the
   `.project-grid` in `index.html` holds one `<a class="project-card">` per gated
   page. Add this page's card to `private-src/home-cards.en.html` and
   `private-src/home-cards.fr.html` (href → the new page; reuse the
   `project-card` markup from `index.html`).
3. Re-encrypt the index card set:
   `PORTFOLIO_UNLOCK="<phrase>" python tools/encrypt.py home-cards`
   and **replace** the existing `<div class="gated" data-gated="home-cards">…</div>`
   block in `index.html`'s `.project-grid` with the freshly printed one.
   (The `display:contents` rule in `css/style.css` makes the cards flow into the
   grid; no other CSS is needed.)
4. Verify.

## Verify

Do NOT trust that pasted base64 is correct — check it round-trips with the exact
slicing `gate.js` uses, ideally with the same interpreter you encrypted with:

```python
import base64, json, re
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
PHRASE = "<phrase>"
def dec(b64):
    raw = base64.b64decode(b64); s, i, d = raw[:16], raw[16:28], raw[28:]
    k = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=s, iterations=200_000).derive(PHRASE.encode())
    return AESGCM(k).decrypt(i, d, None).decode()
html = open("<page>.html").read()
blk = re.search(r'gated-payload">\s*(\S+)\s*</script>', html).group(1)
print(list(json.loads(dec(blk))))   # -> ['en', 'fr']
```

Then, if a browser is available, smoke-test in the app: `python server.py`, open
the page, confirm the content is hidden, unlock with the navbar 🔒 (wrong phrase
rejected, right phrase reveals), and switch EN/FR to confirm the gated content
re-renders. For a page, also confirm its card appears in the homepage grid only
after unlocking.

## Do / Don't

- **Do** keep plaintext only in `private-src/` (git-ignored). Never commit
  `private-src/` or `private-out/`.
- **Do** regenerate `VERIFY_TOKEN` in `js/gate.js` if the passphrase ever
  changes: `python tools/encrypt.py --verifier`, paste the value in.
- **Don't** put gated strings in `locales/*.json` or use `data-i18n` inside a
  gated fragment.
- **Don't** gate confidential material — the ciphertext is public.
