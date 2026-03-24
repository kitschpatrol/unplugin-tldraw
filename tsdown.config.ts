import { defineConfig } from 'tsdown'

export default defineConfig({
	deps: {
		onlyAllowBundle: [],
	},
	entry: ['./src/*.ts'],
	fixedExtension: false,
})
