import type { AstroInstance } from 'astro';
import { Facebook, Instagram } from 'lucide-astro';

export interface SocialLink {
	/** Stable key. SocialIcon maps it to a translated label (src/i18n/ui.ts). */
	name: string;
	/**
	 * English accessible name and hover tooltip, used when no translation exists.
	 * Needed where two entries share an icon (both Instagram accounts) so they
	 * are distinguishable. Falls back to `name`.
	 */
	label?: string;
	url: string;
	icon: AstroInstance;
}

/** Search-result wording for one page. Keep titles ≲ 60 chars and descriptions ≲ 155 chars. */
export interface PageSeo {
	title: string;
	description: string;
}

/** Wording for a gallery category page. `heading` is the visible <h1>, `intro` the visible paragraph. */
export interface CollectionSeo extends PageSeo {
	heading: string;
	intro: string;
}

export interface SiteSeo {
	/** Short, plain-language line shown under the homepage heading. */
	tagline: string;
	/** Optional. If set, it is shown on the About page and added to the Person structured data. */
	contactEmail: string;
	home: PageSeo;
	about: PageSeo;
	privacy: PageSeo;
	gallery: CollectionSeo;
	/** Keyed by the collection id used in src/gallery/gallery.yaml. */
	collections: Record<string, CollectionSeo>;
	/** Used for image alt text, keyed by collection id. Falls back to "Photography". */
	categoryLabels: Record<string, string>;
}

const seo: SiteSeo = {
	tagline: 'Automotive, portrait, aviation and street photography in Latvia',
	contactEmail: '',

	home: {
		title: 'Ruina Photos – Automotive & Portrait Photographer in Latvia',
		description:
			'Portfolio of Mykhailo Zhurba: automotive, portrait, aviation and street photography in Latvia. Available for paid photoshoots – get in touch to book.',
	},

	about: {
		title: 'About Mykhailo Zhurba – Photographer | Ruina Photos',
		description:
			'Mykhailo Zhurba is the photographer behind Ruina Photos: automotive, portrait, aviation and aerial photography. Learn about the work and how to book a shoot.',
	},

	privacy: {
		title: 'Privacy | Ruina Photos',
		description:
			'How Ruina Photos handles your data: no cookies, analytics or tracking, and booking enquiries used only to reply.',
	},

	gallery: {
		title: 'Automotive, Portrait & Aviation Photo Gallery | Ruina Photos',
		description:
			'Browse the photography gallery of Mykhailo Zhurba: cars, portraits, airshow aviation and street photos. Filter by category.',
		heading: 'Photography Gallery',
		intro: 'Automotive, portrait, aviation and street photography by Mykhailo Zhurba.',
	},

	collections: {
		automotive: {
			title: 'Automotive & Drift Photography in Latvia | Ruina Photos',
			description:
				'Automotive photography by Mykhailo Zhurba, current media for LatviaDrift: cars, car events and drift. Book an automotive photoshoot in Latvia.',
			heading: 'Automotive Photography',
			intro:
				'Cars photographed at events and on location, including drift coverage as current media for LatviaDrift. Available for paid automotive photoshoots.',
		},
		portraits: {
			title: 'Portrait & Cosplay Photography | Ruina Photos',
			description:
				'Portrait and cosplay photography by Mykhailo Zhurba. Browse creative portraits and book a paid portrait photoshoot in Latvia.',
			heading: 'Portrait Photography',
			intro:
				'Portraits and cosplay shoots that capture the moment. Available for paid portrait photoshoots.',
		},
		street: {
			title: 'Street & City Photography | Ruina Photos',
			description:
				'Street and city photography by Mykhailo Zhurba: old-town streets, architecture and everyday moments.',
			heading: 'Street Photography',
			intro: 'Old-town streets, architecture and everyday moments from the city.',
		},
		aviation: {
			title: 'Aviation & Airshow Photography | Ruina Photos',
			description:
				'Aviation photography by Mykhailo Zhurba: fighter jets and aerobatic displays at airshows.',
			heading: 'Aviation Photography',
			intro: 'Jets and aircraft photographed at airshows.',
		},
	},

	categoryLabels: {
		automotive: 'Automotive photography',
		portraits: 'Portrait photography',
		street: 'Street photography',
		aviation: 'Aviation photography',
	},
};

export default {
	title: 'Ruina Photos',

	/**
	 * Booking enquiries are forwarded to this address, and the auto-reply carries
	 * it as Reply-To. Keep it in sync with OWNER_EMAIL in wrangler.jsonc.
	 */
	ownerEmail: 'vitoruina@gmail.com',

	/** Options offered in the booking popup's "type of shoot" dropdown. */
	shootTypes: ['Automotive', 'Portrait', 'Cosplay', 'Event', 'Street', 'Something else'],

	favicon: 'favicon.png',
	owner: 'Mykhailo Zhurba',
	profileImage: 'profile.webp',
	profileImageAlt:
		'Mykhailo Zhurba holding a telephoto camera lens at an airfield, with a light aircraft on the runway behind him',
	socialLinks: [
		{
			name: 'Facebook',
			label: 'Ruina Photos on Facebook',
			url: 'https://www.facebook.com/ruina.photos/',
			icon: Facebook,
		} as SocialLink,
		{
			name: 'Instagram',
			label: 'Ruina Photos on Instagram',
			url: 'https://www.instagram.com/ruina.photos/',
			icon: Instagram,
		} as SocialLink,
		{
			name: 'Instagram (personal)',
			label: 'Mykhailo Zhurba on Instagram',
			url: 'https://www.instagram.com/mikelino1370/',
			icon: Instagram,
		} as SocialLink,
	],
	seo,
};
