import { eslintConfig } from '@kitschpatrol/eslint-config'

export default eslintConfig({
	ignores: ['/test/fixtures/**'],
	ts: {
		overrides: {
			'ts/consistent-type-definitions': 'off',
		},
	},
	type: 'lib',
})
