import type { TldrawToImageOptions } from '@kitschpatrol/tldraw-cli'
import { defu } from 'defu'
import path from 'node:path'

/**
 * Image conversion options for `.tldr` exports.
 * Subset of `@kitschpatrol/tldraw-cli` options relevant to image output.
 */
export type TldrawImageOptions = Pick<
	TldrawToImageOptions,
	'dark' | 'format' | 'padding' | 'scale' | 'stripStyle' | 'transparent'
>

/**
 * Per-import overrides parsed from query params on `.tldr` import paths.
 * Extends TldrawImageOptions with frame/page selection.
 */
export type ImportOverrides = TldrawImageOptions & {
	/** Export a specific frame by name or ID. */
	frame?: string
	/** Export a specific page by name, ID, or index. */
	page?: string
}

export type Options = {
	/**
	 * Directory to store converted images.
	 * Resolved relative to Vite's `cacheDir` at runtime if not absolute.
	 * @default './node_modules/.cache/tldraw'
	 */
	cacheDirectory?: string
	/**
	 * Enable caching of generated image files.
	 * Cache keys include a hash of the `.tldr` file content and image options,
	 * so cached files are automatically invalidated when the source changes.
	 * @default true
	 */
	cacheEnabled?: boolean
	/**
	 * Default image conversion options for all `.tldr` imports.
	 */
	defaultImageOptions?: TldrawImageOptions
	/**
	 * Maximum number of concurrent `.tldr` conversions.
	 * Lower values reduce system load (each conversion spawns a headless browser).
	 * @default 2
	 */
	maxConcurrentConversions?: number
	/**
	 * Delete all files in `cacheDirectory` that are not in the converted
	 * image set at the end of a full build.
	 * @default false
	 */
	pruneCacheOnBuild?: boolean
	/**
	 * Log conversion details and performance information to the console.
	 * @default false
	 */
	verbose?: boolean
}

export type ResolvedOptions = Required<Options> & {
	defaultImageOptions: Pick<TldrawImageOptions, 'dark' | 'padding' | 'scale'> &
		Required<Pick<TldrawImageOptions, 'format' | 'stripStyle' | 'transparent'>>
}

export const DEFAULT_OPTIONS: ResolvedOptions = {
	cacheDirectory: './node_modules/.cache/tldraw',
	cacheEnabled: true,
	defaultImageOptions: {
		format: 'svg',
		stripStyle: false,
		transparent: false,
	},
	maxConcurrentConversions: 2,
	pruneCacheOnBuild: false,
	verbose: false,
}

/**
 * Resolve and normalize user options.
 */
export function resolveOptions(options?: Options): ResolvedOptions {
	// eslint-disable-next-line ts/no-unsafe-type-assertion -- defu returns a deep merge but loses the narrowed type
	const resolved = defu(options, DEFAULT_OPTIONS) as ResolvedOptions
	// Resolve cacheDirectory to absolute to prevent breakage when cwd changes during build
	resolved.cacheDirectory = path.resolve(resolved.cacheDirectory)
	return resolved
}

/**
 * Parse query params from an import path into per-import overrides.
 * Converts string values to appropriate types (booleans, numbers).
 */
export function parseImportOverrides(queryString: string): ImportOverrides {
	const params = new URLSearchParams(queryString)
	const overrides: ImportOverrides = {}

	for (const [key, value] of params.entries()) {
		// Skip namespace markers like `tldr` or `tldraw`
		if (key === 'tldr' || key === 'tldraw') continue

		switch (key) {
			case 'dark':
			case 'stripStyle':
			case 'transparent': {
				overrides[key] = value === 'true' || value === ''
				break
			}

			case 'format': {
				// eslint-disable-next-line ts/no-unsafe-type-assertion -- validated by tldraw-cli at runtime
				overrides.format = value as TldrawImageOptions['format']
				break
			}

			case 'frame':
			case 'page': {
				overrides[key] = value
				break
			}

			case 'padding':
			case 'scale': {
				const numberValue = Number(value)
				if (!Number.isNaN(numberValue)) {
					overrides[key] = numberValue
				}

				break
			}

			default: {
				break
			}
		}
	}

	return overrides
}
