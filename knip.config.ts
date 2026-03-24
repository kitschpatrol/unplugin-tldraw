import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	// Browser tests use a separate vitest config with a different root, which knip can't resolve
	ignore: ['test/fixtures/**', 'test/import.test.ts', 'test/dynamic.test.ts'],
	ignoreDependencies: [
		'@kitschpatrol/tldraw-cli',
		'@sxzz/test-utils',
		'@vitest/browser-playwright',
		'playwright',
	],
	ignoreExportsUsedInFile: true,
	vitest: {
		config: ['vitest.config.ts', 'vitest.browser.config.ts'],
	},
})
