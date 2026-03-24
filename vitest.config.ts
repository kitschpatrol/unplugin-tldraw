import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['test/options.test.ts', 'test/tldraw.test.ts'],
	},
})
