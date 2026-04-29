import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://ruina.photos',
	base: '/', // Add this line to ensure CSS paths are relative to the root
	vite: {
		plugins: [tailwindcss()],
	},
});