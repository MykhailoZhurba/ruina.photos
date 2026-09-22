import type { AstroInstance } from 'astro';
import { Github, Instagram } from 'lucide-astro';

export interface SocialLink {
	name: string;
	url: string;
	icon: AstroInstance;
}

export default {
	title: 'SR',
	favicon: 'favicon.ico',
	owner: 'Sara Richard',
	profileImage: 'profile.webp',

	// Booking enquiries are signed as, and forwarded to, this address.
	// Keep it in sync with OWNER_EMAIL in wrangler.jsonc.
	ownerEmail: 'vitoruina@gmail.com',

	// Options offered in the booking popup's "type of shoot" dropdown.
	shootTypes: ['Portrait', 'Wedding', 'Event', 'Product', 'Editorial', 'Something else'],

	socialLinks: [
		{
			name: 'GitHub',
			url: 'https://github.com/rockem/astro-photography-portfolio',
			icon: Github,
		} as SocialLink,
		{
			name: 'Instagram',
			url: 'https://www.instagram.com',
			icon: Instagram,
		} as SocialLink,
	],
};
