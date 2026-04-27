import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig(
	{
		html: {
			overrides: {
				'html/no-inline-styles': 'off',
			},
		},
		ignores: ['/test/assets/**'],
		js: {
			overrides: {
				'new-cap': 'off',
			},
		},
		ts: {
			overrides: {
				'new-cap': 'off',
				'ts/consistent-type-definitions': 'off',
			},
		},
		type: 'lib',
	},
	{
		files: ['playground/package.json'],
		rules: {
			'json-package/require-author': 'off',
			'json-package/require-keywords': 'off',
			'json-package/require-version': 'off',
		},
	},
	{
		files: ['readme.md/*.ts'],
		rules: {
			'import/no-unresolved': 'off',
			'ts/no-redeclare': 'off',
			'ts/triple-slash-reference': 'off',
		},
	},
)
