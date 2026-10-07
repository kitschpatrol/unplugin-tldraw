import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig(
	{
		html: {
			overrides: {
				'html/no-inline-styles': 'off',
			},
		},
		ts: {
			overrides: {
				'new-cap': 'off',
			},
		},
		type: 'lib',
	},
	{
		files: ['playground/package.json'],
		rules: {
			'json-package/require-author': 'off',
		},
	},
	{
		// Bundler entry points default-export the result of unplugin's pure plugin factories, which do no work at import time
		files: ['src/{esbuild,farm,nuxt,rolldown,rollup,rspack,vite,webpack}.ts'],
		rules: {
			'unicorn/no-top-level-side-effects': 'off',
		},
	},
	{
		files: ['readme.md/*.{js,ts}'],
		rules: {
			'capitalized-comments': 'off',
			'import/no-unresolved': 'off',
			'ts/triple-slash-reference': 'off',
		},
	},
)
