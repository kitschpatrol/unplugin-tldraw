import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_OPTIONS, parseImportOverrides, resolveOptions } from '../src/core/options'

vi.mock('lognow', () => ({
	log: {
		debug: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
	},
	setDefaultLogOptions: vi.fn(),
}))

describe('resolveOptions', () => {
	it('returns defaults when called with no arguments', () => {
		const result = resolveOptions()
		expect(result).toStrictEqual({
			...DEFAULT_OPTIONS,
			cacheDirectory: path.resolve(DEFAULT_OPTIONS.cacheDirectory),
		})
	})

	it('returns defaults when called with empty object', () => {
		const result = resolveOptions({})
		expect(result).toStrictEqual({
			...DEFAULT_OPTIONS,
			cacheDirectory: path.resolve(DEFAULT_OPTIONS.cacheDirectory),
		})
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
		expect(result.cacheDirectory).toBe(path.resolve(DEFAULT_OPTIONS.cacheDirectory))
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
		expect(result.cacheDirectory).toBe(path.resolve(DEFAULT_OPTIONS.cacheDirectory))
		expect(result.verbose).toBe(DEFAULT_OPTIONS.verbose)
	})

	it('overrides cacheDirectory', () => {
		const result = resolveOptions({ cacheDirectory: '/tmp/my-cache' })
		expect(result.cacheDirectory).toBe(path.resolve('/tmp/my-cache'))
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

describe('parseImportOverrides', () => {
	it('returns empty object for empty query string', () => {
		expect(parseImportOverrides('')).toStrictEqual({})
	})

	it('skips namespace markers tldr and tldraw', () => {
		expect(parseImportOverrides('tldr')).toStrictEqual({})
		expect(parseImportOverrides('tldraw')).toStrictEqual({})
		expect(parseImportOverrides('tldr=&tldraw=')).toStrictEqual({})
	})

	it('parses boolean true (explicit)', () => {
		expect(parseImportOverrides('dark=true')).toStrictEqual({ dark: true })
		expect(parseImportOverrides('stripStyle=true')).toStrictEqual({ stripStyle: true })
		expect(parseImportOverrides('transparent=true')).toStrictEqual({ transparent: true })
	})

	it('parses boolean true (bare-key shorthand)', () => {
		expect(parseImportOverrides('dark')).toStrictEqual({ dark: true })
		expect(parseImportOverrides('dark=')).toStrictEqual({ dark: true })
	})

	it('parses boolean false', () => {
		expect(parseImportOverrides('dark=false')).toStrictEqual({ dark: false })
	})

	it('drops invalid boolean values with a warning', async () => {
		const { log } = await import('lognow')
		const mockedLog = vi.mocked(log)
		mockedLog.warn.mockClear()

		expect(parseImportOverrides('dark=1')).toStrictEqual({})
		expect(parseImportOverrides('dark=yes')).toStrictEqual({})
		// eslint-disable-next-line ts/unbound-method -- assertion on spy method reference
		expect(mockedLog.warn).toHaveBeenCalledTimes(2)
	})

	it('parses format', () => {
		expect(parseImportOverrides('format=png')).toStrictEqual({ format: 'png' })
		expect(parseImportOverrides('format=svg')).toStrictEqual({ format: 'svg' })
	})

	it('parses frame and page', () => {
		expect(parseImportOverrides('frame=Frame 1')).toStrictEqual({ frame: 'Frame 1' })
		expect(parseImportOverrides('page=Page 2')).toStrictEqual({ page: 'Page 2' })
	})

	it('decodes URL-encoded frame and page values', () => {
		expect(parseImportOverrides('frame=My%20Frame')).toStrictEqual({ frame: 'My Frame' })
		expect(parseImportOverrides('page=My%2FPage')).toStrictEqual({ page: 'My/Page' })
	})

	it('parses numeric padding and scale', () => {
		expect(parseImportOverrides('padding=16')).toStrictEqual({ padding: 16 })
		expect(parseImportOverrides('scale=1.5')).toStrictEqual({ scale: 1.5 })
		expect(parseImportOverrides('padding=0')).toStrictEqual({ padding: 0 })
	})

	it('drops non-numeric padding and scale silently', () => {
		expect(parseImportOverrides('padding=abc')).toStrictEqual({})
		expect(parseImportOverrides('scale=NaN')).toStrictEqual({})
	})

	it('ignores unknown keys silently', () => {
		expect(parseImportOverrides('unknown=value&foo=bar')).toStrictEqual({})
	})

	it('parses combinations alongside namespace markers', () => {
		expect(parseImportOverrides('dark=true&format=png&padding=16&tldr')).toStrictEqual({
			dark: true,
			format: 'png',
			padding: 16,
		})
	})

	it('lets the last value win for duplicate keys', () => {
		expect(parseImportOverrides('format=svg&format=png')).toStrictEqual({ format: 'png' })
	})
})
