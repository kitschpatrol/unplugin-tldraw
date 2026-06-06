import { playwright } from '@vitest/browser-playwright'
import { defineConfig } from 'vitest/config'
import tldraw from './src/vite'

export default defineConfig({
	plugins: [tldraw({ verbose: true })],
	root: './test/assets',
	test: {
		browser: {
			enabled: true,
			headless: true,
			instances: [{ browser: 'chromium' }],
			provider: playwright(),
			screenshotFailures: false,
		},
		env: {
			// Backported to Node.js ^22.16.0
			// eslint-disable-next-line ts/naming-convention, node/no-unsupported-features/node-builtins -- Vite env convention
			PROJECT_ROOT: import.meta.dirname,
		},
		include: ['../../test/import.test.ts', '../../test/dynamic.test.ts'],
		silent: 'passed-only',
	},
})
