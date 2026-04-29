import type { AstroInstance } from 'astro';
import { Facebook, Instagram } from 'lucide-astro';

export interface SocialLink {
	name: string;
	url: string;
	icon: AstroInstance;
}

export default {
	title: 'Mz photography portfolio',
	favicon: 'favicon.png',
	owner: 'Mykhailo Zhurba',
	profileImage: 'profile.webp',
	socialLinks: [
		{
			name: 'Facebook',
			url: 'https://www.facebook.com/ruina.photos',
			icon: Facebook,
		} as SocialLink,
		{
			name: 'Instagram',
			url: 'https://www.instagram.com/ruina.photos/',
			icon: Instagram,
		} as SocialLink,
	],
};
