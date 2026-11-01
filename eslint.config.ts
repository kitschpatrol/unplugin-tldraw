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
		files: ['readme.md/*.{js,ts}'],
		rules: {
			'capitalized-comments': 'off',
			'import/no-unresolved': 'off',
			'ts/triple-slash-reference': 'off',
		},
	},
)
