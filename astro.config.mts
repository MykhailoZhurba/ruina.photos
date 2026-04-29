import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	site: 'https://ruina.photos',
	base: '/', 
	vite: {
		plugins: [tailwindcss()],
	},
});