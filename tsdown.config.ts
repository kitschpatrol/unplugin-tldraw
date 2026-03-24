import { defineConfig } from 'tsdown'

export default defineConfig({
	copy: ['./src/client.d.ts'],
	deps: {
		onlyBundle: [],
	},
	entry: ['./src/*.ts'],
	fixedExtension: false,
})
