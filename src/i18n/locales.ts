/**
 * Supported languages and URL helpers.
 *
 * English is served at the site root; every other language lives under its own
 * prefix (/lv/, /ru/, /uk/). Each language gets real, crawlable pages rather
 * than text swapped in the browser, so search engines index every version and
 * the hreflang links in <head> can point at them.
 */

export const LOCALES = ['en', 'lv', 'ru', 'uk'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Languages served under a URL prefix — every language except the default. */
export const PREFIXED_LOCALES: Locale[] = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);

export const LOCALE_META: Record<Locale, { short: string; name: string; ogLocale: string }> = {
	en: { short: 'EN', name: 'English', ogLocale: 'en_US' },
	lv: { short: 'LV', name: 'Latviešu', ogLocale: 'lv_LV' },
	ru: { short: 'RU', name: 'Русский', ogLocale: 'ru_RU' },
	// "uk" is the ISO 639-1 code for Ukrainian, and what hreflang and <html lang>
	// require. "UA" is what Ukrainian readers recognise in a language switcher.
	uk: { short: 'UA', name: 'Українська', ogLocale: 'uk_UA' },
};

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** The language of a page, read from its URL: `/lv/about/` → `lv`, `/about/` → `en`. */
export function getLocale(url: URL | string): Locale {
	const pathname = typeof url === 'string' ? url : url.pathname;
	const first = pathname.split('/')[1];
	return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}

/** Removes the language prefix: `/lv/about/` → `/about/`, `/lv` → `/`. */
export function stripLocale(pathname: string): string {
	const locale = getLocale(pathname);
	if (locale === DEFAULT_LOCALE) return pathname || '/';
	const rest = pathname.slice(locale.length + 1);
	return rest.startsWith('/') ? rest : `/${rest}`;
}

/**
 * The URL of `path` in `locale`, always ending in a slash so it matches what the
 * host serves without a redirect: `localizePath('/about', 'lv')` → `/lv/about/`.
 * Accepts paths that already carry a language prefix.
 */
export function localizePath(path: string, locale: Locale): string {
	const bare = stripLocale(path.startsWith('/') ? path : `/${path}`);
	const withSlash = bare.endsWith('/') ? bare : `${bare}/`;
	return locale === DEFAULT_LOCALE ? withSlash : `/${locale}${withSlash}`;
}
