/**
 * Lightweight i18n module for multilingual support
 */

const I18n = {
    currentLang: 'en',
    translations: {},

    /**
     * Initialize i18n system
     */
    async init() {
        this.currentLang = this.getLanguage();
        await this.loadTranslations(this.currentLang);
        this.applyTranslations();
        this.setupLanguageSwitcher();
        this.updateHtmlLang();
    },

    /**
     * Get saved language or detect from browser
     */
    getLanguage() {
        const saved = localStorage.getItem('portfolio-lang');
        if (saved) return saved;

        const browserLang = navigator.language.slice(0, 2);
        return browserLang === 'fr' ? 'fr' : 'en';
    },

    /**
     * Load translations from JSON file
     */
    async loadTranslations(lang) {
        try {
            // Determine base path (handle both root and subdirectory pages)
            const basePath = window.location.pathname.includes('/projects/') ? '..' : '.';
            const response = await fetch(`${basePath}/locales/${lang}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.error(`Failed to load translations for ${lang}:`, error);
        }
    },

    /**
     * Get nested translation value by key path
     */
    get(keyPath) {
        return keyPath.split('.').reduce((obj, key) => obj?.[key], this.translations) || keyPath;
    },

    /**
     * Apply translations to all elements with data-i18n attribute
     */
    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.get(key);

            // Handle elements with HTML content vs text content
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Handle placeholder attributes
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.get(key);
        });

        // Handle title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.get(key);
        });

        // Handle href attributes (e.g. language-specific file downloads)
        document.querySelectorAll('[data-i18n-href]').forEach(el => {
            const key = el.getAttribute('data-i18n-href');
            el.href = this.get(key);
        });
    },

    /**
     * Setup language switcher button handlers
     */
    setupLanguageSwitcher() {
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLang);

            btn.addEventListener('click', async () => {
                const lang = btn.dataset.lang;
                if (lang === this.currentLang) return;

                await this.setLanguage(lang);
            });
        });
    },

    /**
     * Switch to a new language
     */
    async setLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('portfolio-lang', lang);

        await this.loadTranslations(lang);
        this.applyTranslations();
        this.updateHtmlLang();

        // Update active state on switcher buttons
        document.querySelectorAll('[data-lang]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });
    },

    /**
     * Update html lang attribute
     */
    updateHtmlLang() {
        document.documentElement.lang = this.currentLang;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => I18n.init());
