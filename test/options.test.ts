import { describe, expect, it } from 'vitest'
import { DEFAULT_OPTIONS, resolveOptions } from '../src/core/options'

describe('resolveOptions', () => {
	it('returns defaults when called with no arguments', () => {
		const result = resolveOptions()
		expect(result).toStrictEqual(DEFAULT_OPTIONS)
	})

	it('returns defaults when called with empty object', () => {
		const result = resolveOptions({})
		expect(result).toStrictEqual(DEFAULT_OPTIONS)
	})

	it('overrides top-level options', () => {
		const result = resolveOptions({
			cacheEnabled: false,
			maxConcurrentConversions: 8,
			verbose: true,
		})
		expect(result.cacheEnabled).toBe(false)
		expect(result.maxConcurrentConversions).toBe(8)
		expect(result.verbose).toBe(true)
		// Others remain default
		expect(result.pruneCacheOnBuild).toBe(false)
		expect(result.cacheDirectory).toBe(DEFAULT_OPTIONS.cacheDirectory)
	})

	it('merges defaultImageOptions with defaults', () => {
		const result = resolveOptions({
			defaultImageOptions: {
				format: 'png',
				scale: 2,
			},
		})
		expect(result.defaultImageOptions.format).toBe('png')
		expect(result.defaultImageOptions.scale).toBe(2)
		// Other image defaults preserved
		expect(result.defaultImageOptions.stripStyle).toBe(false)
		expect(result.defaultImageOptions.transparent).toBe(false)
	})

	it('ignores undefined values in user options', () => {
		const result = resolveOptions({
			cacheDirectory: undefined,
			verbose: undefined,
		})
		expect(result.cacheDirectory).toBe(DEFAULT_OPTIONS.cacheDirectory)
		expect(result.verbose).toBe(DEFAULT_OPTIONS.verbose)
	})

	it('overrides cacheDirectory', () => {
		const result = resolveOptions({ cacheDirectory: '/tmp/my-cache' })
		expect(result.cacheDirectory).toBe('/tmp/my-cache')
	})

	it('has correct default image format', () => {
		const result = resolveOptions()
		expect(result.defaultImageOptions.format).toBe('svg')
	})

	it('has correct default maxConcurrentConversions', () => {
		const result = resolveOptions()
		expect(result.maxConcurrentConversions).toBe(2)
	})
})
