import js from '@eslint/js';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import astroParser from 'astro-eslint-parser';
import globals from 'globals';

export default [
	js.configs.recommended,
	{
		ignores: ['dist/**', '.astro/**', 'node_modules/**', '.cache/**', 'worker-configuration.d.ts'],
	},
	{
		files: ['**/*.ts'],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				project: './tsconfig.json',
				sourceType: 'module',
			},
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		plugins: {
			'@typescript-eslint': ts,
		},
		rules: {
			// TypeScript resolves ambient globals (D1Database, Env, ExecutionContext
			// from wrangler's generated types); ESLint's no-undef cannot, and tsc
			// already fails on genuinely undefined identifiers.
			'no-undef': 'off',
			...ts.configs.recommended.rules,
		},
	},

	{
		files: ['**/*.astro'],
		languageOptions: {
			parser: astroParser,
			parserOptions: {
				parser: tsParser,
			},
		},
		plugins: {
			astro: astroPlugin,
		},
		rules: {
			// TypeScript resolves ambient globals (D1Database, Env, ExecutionContext
			// from wrangler's generated types); ESLint's no-undef cannot, and tsc
			// already fails on genuinely undefined identifiers.
			'no-undef': 'off',
			...astroPlugin.configs.recommended.rules,
		},
	},
];
