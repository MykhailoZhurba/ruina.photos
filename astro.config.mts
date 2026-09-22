import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://ruina.photos',
	// The gallery stays fully static. Only the booking API, the admin page and the
	// auth/calendar endpoints opt out with `export const prerender = false`.
	output: 'static',
	adapter: cloudflare({
		// Gives `astro dev` the real D1 binding and secrets from .dev.vars.
		platformProxy: { enabled: true },
		imageService: 'compile',
	}),
	vite: {
		plugins: [tailwindcss()],
	},
});
