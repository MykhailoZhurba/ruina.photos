import { describe, expect, it, vi } from 'vitest';

// seo.ts imports site.config.mts, which imports icon components from
// lucide-astro. Those are .astro files vitest cannot load, and nothing here
// renders them, so stand-ins are enough. (vi.mock is hoisted above the imports.)
vi.mock('lucide-astro', () => ({ Facebook: {}, Instagram: {} }));

import { emailStrings } from './email';
import { LOCALES, getLocale, localizePath, stripLocale } from './locales';
import { seoByLocale } from './seo';
import { ui, useTranslations, type UiKey } from './ui';

const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

describe('locale URLs', () => {
	it('reads the language from the first path segment', () => {
		expect(getLocale('/')).toBe('en');
		expect(getLocale('/about/')).toBe('en');
		expect(getLocale('/lv/')).toBe('lv');
		expect(getLocale('/ru/collections/automotive/')).toBe('ru');
		expect(getLocale('/uk')).toBe('uk');
		expect(getLocale(new URL('https://ruina.photos/lv/about/'))).toBe('lv');
		// Not a language: a page that merely starts with similar letters.
		expect(getLocale('/lvx/')).toBe('en');
		// English never takes a prefix, so /en/ is not treated as English's URL.
		expect(getLocale('/en/about/')).toBe('en');
	});

	it('strips the language prefix', () => {
		expect(stripLocale('/lv/about/')).toBe('/about/');
		expect(stripLocale('/lv/')).toBe('/');
		expect(stripLocale('/lv')).toBe('/');
		expect(stripLocale('/about/')).toBe('/about/');
		expect(stripLocale('/')).toBe('/');
	});

	it('builds trailing-slash URLs in any language, from any language', () => {
		expect(localizePath('/', 'en')).toBe('/');
		expect(localizePath('/', 'lv')).toBe('/lv/');
		expect(localizePath('/about', 'ru')).toBe('/ru/about/');
		expect(localizePath('/collections/automotive/', 'uk')).toBe('/uk/collections/automotive/');
		// Switching language from a translated page.
		expect(localizePath('/lv/collections/street/', 'ru')).toBe('/ru/collections/street/');
		expect(localizePath('/uk/about/', 'en')).toBe('/about/');
	});
});

describe('interface text', () => {
	const keys = Object.keys(ui.en) as UiKey[];

	it.each(LOCALES)('%s has no empty strings', (locale) => {
		for (const key of keys) expect(ui[locale][key].trim(), `${locale}: ${key}`).not.toBe('');
	});

	// Deliberate exceptions: a translation may leave out these placeholders.
	// "About {owner}" becomes "About me" (Par mani / Обо мне / Про мене), since a
	// Latin-spelled name does not take Latvian or Slavic case endings cleanly.
	const MAY_OMIT: Partial<Record<UiKey, string[]>> = { 'about.heading': ['owner'] };

	it.each(LOCALES)('%s keeps the same {placeholders} as English', (locale) => {
		for (const key of keys) {
			const expected = placeholders(ui.en[key]);
			const actual = placeholders(ui[locale][key]);
			const optional = MAY_OMIT[key] ?? [];
			// Never invent a placeholder English does not have...
			for (const name of actual)
				expect(expected, `${locale}: ${key} adds {${name}}`).toContain(name);
			// ...and never drop one, unless it is a listed exception.
			for (const name of expected.filter((n) => !optional.includes(n))) {
				expect(actual, `${locale}: ${key} drops {${name}}`).toContain(name);
			}
		}
	});

	it('fills placeholders and leaves unknown ones visible', () => {
		const { t, tOr } = useTranslations('lv');
		expect(t('hero.by', { owner: 'Mykhailo Zhurba' })).toBe('fotogrāfs Mykhailo Zhurba');
		expect(t('hero.by')).toBe('fotogrāfs {owner}');
		expect(tOr('collection.not-a-real-id', 'Fallback')).toBe('Fallback');
	});
});

describe('email text', () => {
	it.each(LOCALES)('%s greeting keeps the {name} placeholder', (locale) => {
		expect(emailStrings[locale].helloName).toContain('{name}');
		for (const value of Object.values(emailStrings[locale])) expect(value.trim()).not.toBe('');
	});
});

describe('search-result text', () => {
	// Google cuts titles at roughly 60 characters and descriptions at roughly 155.
	// A little headroom, so this catches a translation that runs badly long.
	const TITLE_MAX = 65;
	const DESCRIPTION_MAX = 165;

	it.each(LOCALES)('%s titles and descriptions fit in a search result', (locale) => {
		const seo = seoByLocale[locale];
		const pages = [
			seo.home,
			seo.about,
			seo.privacy,
			seo.gallery,
			...Object.values(seo.collections),
		];
		for (const page of pages) {
			expect(page.title.length, `${locale} title: ${page.title}`).toBeLessThanOrEqual(TITLE_MAX);
			expect(
				page.description.length,
				`${locale} description: ${page.description}`,
			).toBeLessThanOrEqual(DESCRIPTION_MAX);
		}
	});

	it.each(LOCALES)('%s covers every gallery category', (locale) => {
		expect(Object.keys(seoByLocale[locale].collections).sort()).toEqual(
			Object.keys(seoByLocale.en.collections).sort(),
		);
		expect(Object.keys(seoByLocale[locale].categoryLabels).sort()).toEqual(
			Object.keys(seoByLocale.en.categoryLabels).sort(),
		);
	});
});
