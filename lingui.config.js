import { defineConfig } from '@lingui/cli';

export default defineConfig({
	sourceLocale: 'en',
	locales: ['zh-TW', 'en'],
	catalogs: [
		{
			path: '<rootDir>/locales/{locale}/messages',
			include: ['<rootDir>'],
			exclude: ['**/node_modules/**', '**/convex/**'],
		},
	],
	format: 'po',
});
