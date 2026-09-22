import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	site: 'https://ruina.photos',
	base: '/',
	// The gallery stays fully prerendered. Only the booking API, the admin page
	// and the auth/calendar endpoints opt out with `export const prerender = false`.
	output: 'static',
	adapter: cloudflare({
		// Gives `astro dev` the real D1 binding and the secrets from .dev.vars.
		platformProxy: { enabled: true },
		imageService: 'compile',
	}),
	integrations: [sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
