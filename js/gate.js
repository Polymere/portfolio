/**
 * Client-side content gate.
 *
 * Reveals encrypted "extra" content to visitors who supply the shared
 * passphrase, either via a secret URL fragment (index.html#unlock=<phrase>)
 * or via the discreet lock button injected into the navbar. The passphrase is
 * remembered for the session, so unlocking once reveals every gated block
 * across the site until the tab is closed.
 *
 * NOT a security boundary. The ciphertext ships in the public repo and is
 * offline-brute-forceable; this only keeps content out of casual view, plain
 * View Source, and search-engine indexes. Never gate anything confidential.
 *
 * Crypto: PBKDF2-SHA-256 (200k iterations) -> AES-256-GCM, via WebCrypto.
 * Payload wire format (base64): salt[16] || iv[12] || ciphertext+tag.
 * A gated block decrypts to JSON: { "en": "<html>", "fr": "<html>" }.
 * Authored with tools/encrypt.py (see CLAUDE.md > Gated Content).
 */
const Gate = {
    STORAGE_KEY: 'portfolio-unlock',
    PBKDF2_ITERATIONS: 200000,

    // Verifier: ciphertext of VERIFY_MAGIC under the passphrase. Lets the UI
    // tell a right passphrase from a wrong one on pages with no gated block.
    // Regenerate with `python tools/encrypt.py --verifier` if the passphrase
    // changes. Not secret — it only proves a passphrase is correct.
    VERIFY_MAGIC: 'portfolio-unlock-ok',
    VERIFY_TOKEN: 'wZma4TS06G6C7IlErs4jhKxR+8uzVmUYVUDZDfAz0DKKdls0/lMP0zf0INot6L8xC2Vz5S37k9WQ0S9kdsaH',

    STRINGS: {
        en: { lock: 'Unlock extra content', locked: 'Passphrase', submit: 'Unlock',
              wrong: 'Incorrect passphrase', unlocked: 'Unlocked for this session', relock: 'Lock again' },
        fr: { lock: 'Déverrouiller le contenu', locked: 'Phrase secrète', submit: 'Déverrouiller',
              wrong: 'Phrase incorrecte', unlocked: 'Déverrouillé pour cette session', relock: 'Verrouiller' }
    },

    // Padlock icons (closed / open shackle), currentColor to match the navbar.
    SVG_LOCKED: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    SVG_UNLOCKED: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.5-1.9"/></svg>',

    passphrase: null,
    unlocked: false,
    control: null,
    popover: null,
    button: null,

    async init() {
        this.injectUI();

        const stored = this.readPassphrase();
        if (stored && await this.verify(stored)) {
            this.passphrase = stored;
            this.unlocked = true;
            document.documentElement.classList.add('unlocked');
            await this.revealAll();
        } else if (stored) {
            // Stored/hash passphrase is wrong — don't let it stick.
            try { sessionStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
        }
        this.refreshUI();
    },

    /** Read a passphrase from the URL fragment (once) or session storage. */
    readPassphrase() {
        const match = (window.location.hash || '').match(/^#unlock=(.+)$/);
        if (match) {
            const phrase = decodeURIComponent(match[1]);
            try { sessionStorage.setItem(this.STORAGE_KEY, phrase); } catch (e) {}
            history.replaceState(null, '', window.location.pathname + window.location.search);
            return phrase;
        }
        try { return sessionStorage.getItem(this.STORAGE_KEY); } catch (e) { return null; }
    },

    currentLang() {
        if (typeof I18n !== 'undefined' && I18n.currentLang) return I18n.currentLang;
        try { return localStorage.getItem('portfolio-lang') || 'en'; } catch (e) { return 'en'; }
    },

    strings() {
        return this.STRINGS[this.currentLang()] || this.STRINGS.en;
    },

    // --- Crypto -------------------------------------------------------------

    async deriveKey(passphrase, salt) {
        const base = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
        );
        return crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt, iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
            base,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
    },

    /** Decrypt a base64 payload to text with the given passphrase; throws on failure. */
    async decryptToText(passphrase, b64) {
        const raw = this.b64ToBytes(b64);
        const salt = raw.slice(0, 16);
        const iv = raw.slice(16, 28);
        const data = raw.slice(28);
        const key = await this.deriveKey(passphrase, salt);
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
        return new TextDecoder().decode(plain);
    },

    /** True if the passphrase decrypts the verifier token. */
    async verify(passphrase) {
        try {
            return (await this.decryptToText(passphrase, this.VERIFY_TOKEN)) === this.VERIFY_MAGIC;
        } catch (e) {
            return false;
        }
    },

    // --- Gated blocks -------------------------------------------------------

    async revealAll() {
        const blocks = document.querySelectorAll('.gated:not(.gated-open)');
        for (const block of blocks) await this.reveal(block);
    },

    async reveal(block) {
        const payloadEl = block.querySelector('.gated-payload');
        if (!payloadEl) return false;
        try {
            const text = await this.decryptToText(this.passphrase, payloadEl.textContent.trim());
            block.__gatedByLang = JSON.parse(text);
            block.classList.add('gated-open');
            this.render(block);
            return true;
        } catch (e) {
            return false;
        }
    },

    render(block) {
        const byLang = block.__gatedByLang;
        if (!byLang) return;
        block.innerHTML = byLang[this.currentLang()] || byLang.en || '';
    },

    rerenderAll() {
        document.querySelectorAll('.gated.gated-open').forEach(b => this.render(b));
    },

    // --- Navbar lock UI -----------------------------------------------------

    injectUI() {
        const container = document.querySelector('.nav-container');
        if (!container || container.querySelector('.gate-control')) return;

        const control = document.createElement('div');
        control.className = 'gate-control';
        control.innerHTML =
            '<button type="button" class="gate-lock-btn" aria-expanded="false" aria-haspopup="true">' +
            this.SVG_LOCKED + '</button>' +
            '<div class="gate-popover" hidden></div>';

        const langSwitcher = container.querySelector('.lang-switcher');
        if (langSwitcher) langSwitcher.after(control); else container.appendChild(control);

        this.control = control;
        this.button = control.querySelector('.gate-lock-btn');
        this.popover = control.querySelector('.gate-popover');

        this.button.addEventListener('click', () => this.togglePopover());
        document.addEventListener('click', (e) => {
            if (!control.contains(e.target)) this.closePopover();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closePopover();
        });
        this.renderPopover();
    },

    renderPopover() {
        if (!this.popover) return;
        const s = this.strings();
        if (this.unlocked) {
            this.popover.innerHTML =
                '<p class="gate-msg gate-ok">' + s.unlocked + '</p>' +
                '<button type="button" class="gate-relock">' + s.relock + '</button>';
            this.popover.querySelector('.gate-relock').addEventListener('click', () => this.relock());
        } else {
            this.popover.innerHTML =
                '<form class="gate-form">' +
                '<input type="password" class="gate-input" placeholder="' + s.locked + '" aria-label="' + s.locked +
                '" autocomplete="off" autocapitalize="off" spellcheck="false">' +
                '<button type="submit" class="gate-submit">' + s.submit + '</button>' +
                '</form><p class="gate-msg gate-error" role="status" hidden></p>';
            this.popover.querySelector('.gate-form').addEventListener('submit', (e) => this.onSubmit(e));
        }
    },

    async onSubmit(e) {
        e.preventDefault();
        const input = this.popover.querySelector('.gate-input');
        const msg = this.popover.querySelector('.gate-msg');
        if (await this.verify(input.value)) {
            this.passphrase = input.value;
            try { sessionStorage.setItem(this.STORAGE_KEY, input.value); } catch (err) {}
            this.unlocked = true;
            document.documentElement.classList.add('unlocked');
            await this.revealAll();
            this.refreshUI();
        } else {
            msg.hidden = false;
            input.select();
        }
    },

    relock() {
        try { sessionStorage.removeItem(this.STORAGE_KEY); } catch (e) {}
        // Reload to re-hide content already injected into the DOM this session.
        window.location.reload();
    },

    togglePopover() {
        if (this.popover.hidden) this.openPopover(); else this.closePopover();
    },

    openPopover() {
        this.popover.hidden = false;
        this.button.setAttribute('aria-expanded', 'true');
        const input = this.popover.querySelector('.gate-input');
        if (input) input.focus();
    },

    closePopover() {
        if (!this.popover || this.popover.hidden) return;
        this.popover.hidden = true;
        this.button.setAttribute('aria-expanded', 'false');
    },

    /** Sync button + popover labels to the current state and language. */
    refreshUI() {
        if (!this.button) return;
        const s = this.strings();
        this.control.classList.toggle('is-unlocked', this.unlocked);
        this.button.innerHTML = this.unlocked ? this.SVG_UNLOCKED : this.SVG_LOCKED;
        this.button.setAttribute('aria-label', this.unlocked ? s.unlocked : s.lock);
        this.button.setAttribute('title', this.unlocked ? s.unlocked : s.lock);
        this.renderPopover();
    },

    b64ToBytes(b64) {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        return bytes;
    }
};

// Keep gated content and the lock UI in sync with the language switcher by
// wrapping I18n.setLanguage — no change to i18n.js required.
if (typeof I18n !== 'undefined' && typeof I18n.setLanguage === 'function') {
    const _setLanguage = I18n.setLanguage.bind(I18n);
    I18n.setLanguage = async function (lang) {
        await _setLanguage(lang);
        Gate.rerenderAll();
        Gate.refreshUI();
    };
}

document.addEventListener('DOMContentLoaded', () => Gate.init());
