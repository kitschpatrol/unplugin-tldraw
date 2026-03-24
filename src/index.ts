import type { UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { Options } from './core/options'
import { resolveOptions } from './core/options'

/**
 * A starter unplugin template.
 */
export const starter: UnpluginInstance<Options | undefined, false> = createUnplugin(
	(rawOptions = {}) => {
		const options = resolveOptions(rawOptions)

		const name = 'unplugin-tldraw'
		return {
			enforce: options.enforce,
			name,
			transform: {
				filter: {
					id: {
						exclude: options.exclude,
						include: options.include,
					},
				},
				handler(code, _id) {
					return `// unplugin-tldraw injected\n${code}`
				},
			},
		}
	},
)
