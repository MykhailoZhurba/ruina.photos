import siteConfig from '../../site.config.mjs';

/**
 * schema.org JSON-LD helpers.
 *
 * Google's rule: structured data must describe content that is actually visible on the page.
 * So the profile image and the email are only added on pages that really show them.
 */

const personId = (origin: URL) => new URL('/#person', origin).href;

export const personSchema = (origin: URL, options: { withImage?: boolean } = {}) => {
	const email = siteConfig.seo.contactEmail;
	return {
		'@type': 'Person',
		'@id': personId(origin),
		name: siteConfig.owner,
		alternateName: siteConfig.title,
		jobTitle: 'Photographer',
		url: origin.href,
		...(options.withImage
			? { image: new URL(`/images/${siteConfig.profileImage}`, origin).href }
			: {}),
		...(options.withImage && email ? { email } : {}),
		sameAs: siteConfig.socialLinks.map((link) => link.url),
	};
};

export const websiteSchema = (origin: URL) => ({
	'@type': 'WebSite',
	'@id': new URL('/#website', origin).href,
	url: origin.href,
	name: siteConfig.title,
	inLanguage: 'en',
	publisher: { '@id': personId(origin) },
});

export const schemaGraph = (...nodes: Record<string, unknown>[]) => ({
	'@context': 'https://schema.org',
	'@graph': nodes,
});
