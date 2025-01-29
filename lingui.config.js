import { defineConfig } from '@lingui/cli';

export default defineConfig({
	sourceLocale: 'en',
	locales: ['zh-TW', 'en'],
	catalogs: [
		{
			path: '<rootDir>/locales/{locale}/messages',
			include: ['locales'],
		},
	],
	format: 'po',
});
