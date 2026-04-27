import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	// Browser tests use a separate vitest config with a different root, which knip can't resolve
	ignore: ['test/fixtures/**', 'test/import.test.ts', 'test/dynamic.test.ts'],
	ignoreDependencies: [
		'@farmfe/core',
		'@kitschpatrol/tldraw-cli',
		'@nuxt/schema',
		'@sxzz/test-utils',
		'@vitest/browser-playwright',
		'esbuild',
		'playwright',
		'rollup',
		'webpack',
	],
	ignoreExportsUsedInFile: true,
	vitest: {
		config: ['vitest.config.ts', 'vitest.browser.config.ts'],
	},
})
