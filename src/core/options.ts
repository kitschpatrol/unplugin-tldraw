import type { FilterPattern } from 'unplugin'

/**
 * @public
 */
export interface Options {
	enforce?: 'post' | 'pre' | undefined
	exclude?: FilterPattern
	include?: FilterPattern
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U

/**
 * @public
 */
export type OptionsResolved = Overwrite<Required<Options>, Pick<Options, 'enforce'>>

/**
 * Resolve and normalize user options.
 */
export function resolveOptions(options: Options): OptionsResolved {
	return {
		enforce: 'enforce' in options ? options.enforce : 'pre',
		exclude: options.exclude ?? [/node_modules/],
		include: options.include ?? [/\.[cm]?[jt]sx?$/],
	}
}
