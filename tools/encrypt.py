#!/usr/bin/env python3
"""Encrypt gated content fragments for the client-side content gate.

Dev-only tool. It is NOT served with the site and NOT a build step — run it by
hand whenever gated content changes. It matches the crypto in js/gate.js:
PBKDF2-SHA-256 (200k iterations) -> AES-256-GCM, payload = salt||iv||ct+tag.

Requires:  pip install cryptography

Layout — each gated fragment is a pair of plaintext files in private-src/
(which is git-ignored, so plaintext is never committed):

    private-src/<name>.en.html
    private-src/<name>.fr.html

Usage:
    PORTFOLIO_UNLOCK="<phrase>" python tools/encrypt.py            # all fragments
    PORTFOLIO_UNLOCK="<phrase>" python tools/encrypt.py <name>     # one fragment
    PORTFOLIO_UNLOCK="<phrase>" python tools/encrypt.py --verifier # token for gate.js

--verifier prints a base64 token to paste into js/gate.js as VERIFY_TOKEN. It
encrypts a fixed magic string so the UI can tell a right passphrase from a wrong
one on pages that have no gated block. Regenerate it whenever the passphrase
changes. It is not secret — it only proves a passphrase is correct.

For each fragment it writes a ready-to-paste block to private-out/<name>.html
(also git-ignored) and prints it. Paste that <div class="gated">...</div> into
the page where the extra content should appear, then commit the page — only the
ciphertext is committed, never the plaintext or the passphrase.
"""

import base64
import glob
import json
import os
import sys

try:
    from cryptography.hazmat.primitives.ciphers.aead import AESGCM
    from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
    from cryptography.hazmat.primitives import hashes
except ImportError:
    sys.exit("Missing dependency. Run:  pip install cryptography")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "private-src")
OUT_DIR = os.path.join(ROOT, "private-out")
ITERATIONS = 200_000
LANGS = ("en", "fr")
# Fixed plaintext for the UI verifier token. Must match VERIFY_MAGIC in js/gate.js.
VERIFY_MAGIC = "portfolio-unlock-ok"


def derive_key(passphrase: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    return kdf.derive(passphrase.encode("utf-8"))


def encrypt(passphrase: str, plaintext: bytes) -> str:
    salt = os.urandom(16)
    iv = os.urandom(12)
    ct = AESGCM(derive_key(passphrase, salt)).encrypt(iv, plaintext, None)  # ct includes tag
    return base64.b64encode(salt + iv + ct).decode("ascii")


def fragment_names() -> list:
    names = set()
    for path in glob.glob(os.path.join(SRC_DIR, "*.en.html")):
        names.add(os.path.basename(path)[: -len(".en.html")])
    return sorted(names)


def build_block(name: str, passphrase: str) -> str:
    by_lang = {}
    for lang in LANGS:
        path = os.path.join(SRC_DIR, f"{name}.{lang}.html")
        if not os.path.exists(path):
            sys.exit(f"Missing {path} — every fragment needs .en.html and .fr.html")
        with open(path, encoding="utf-8") as fh:
            by_lang[lang] = fh.read()

    payload = encrypt(passphrase, json.dumps(by_lang, ensure_ascii=False).encode("utf-8"))
    return (
        f'<div class="gated" data-gated="{name}">\n'
        f'    <script type="application/octet-stream" class="gated-payload">\n'
        f"{payload}\n"
        f"    </script>\n"
        f"</div>\n"
    )


def main() -> None:
    passphrase = os.environ.get("PORTFOLIO_UNLOCK")
    if not passphrase:
        import getpass
        passphrase = getpass.getpass("Unlock passphrase: ")
    if not passphrase:
        sys.exit("No passphrase provided.")

    if "--verifier" in sys.argv[1:]:
        token = encrypt(passphrase, VERIFY_MAGIC.encode("utf-8"))
        print("# Paste this into js/gate.js as VERIFY_TOKEN:")
        print(token)
        return

    if not os.path.isdir(SRC_DIR):
        sys.exit(f"No {SRC_DIR}/ directory. Create it and add <name>.en.html / <name>.fr.html.")

    names = [sys.argv[1]] if len(sys.argv) > 1 else fragment_names()
    if not names:
        sys.exit(f"No fragments found in {SRC_DIR}/ (expected <name>.en.html + <name>.fr.html).")

    os.makedirs(OUT_DIR, exist_ok=True)
    for name in names:
        block = build_block(name, passphrase)
        out_path = os.path.join(OUT_DIR, f"{name}.html")
        with open(out_path, "w", encoding="utf-8") as fh:
            fh.write(block)
        print(f"# ---- {name}  (written to private-out/{name}.html) ----")
        print(block)


if __name__ == "__main__":
    main()
