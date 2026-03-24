import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TldrawExport } from '../src/core/tldraw'

// Mock tldraw-cli to avoid spawning headless browsers in tests
vi.mock('@kitschpatrol/tldraw-cli', () => ({
	tldrawToImage: vi.fn(),
}))

async function createTempDirectory(): Promise<string> {
	return fs.mkdtemp(path.join(os.tmpdir(), 'unplugin-tldraw-test-'))
}

async function createTldrFixture(directory: string, name = 'test'): Promise<string> {
	const filePath = path.join(directory, `${name}.tldr`)
	await fs.writeFile(filePath, JSON.stringify({ document: { name }, schemaVersion: 2 }))
	return filePath
}

function computeExpectedHash(content: string, options: Record<string, unknown>): string {
	const hash = crypto.createHash('sha1')
	hash.update(content)
	hash.update(JSON.stringify(options))
	return hash.digest('hex').slice(0, 8)
}

function getOutputDirectory(options: unknown): string {
	// eslint-disable-next-line ts/no-unsafe-type-assertion -- mock test helper
	return (options as Record<string, unknown>).output as string
}

describe('TldrawExport', () => {
	let tempDirectory: string
	let cacheDirectory: string

	beforeEach(async () => {
		tempDirectory = await createTempDirectory()
		cacheDirectory = path.join(tempDirectory, 'cache')
	})

	afterEach(async () => {
		vi.clearAllMocks()
		await fs.rm(tempDirectory, { force: true, recursive: true })
	})

	describe('identifierPattern', () => {
		it('matches .tldr files', () => {
			const exporter = new TldrawExport({ cacheDirectory })
			expect(exporter.identifierPattern.test('test.tldr')).toBe(true)
			expect(exporter.identifierPattern.test('../assets/sketch.tldr')).toBe(true)
			expect(exporter.identifierPattern.test('/absolute/path/drawing.tldr')).toBe(true)
		})

		it('does not match non-.tldr files', () => {
			const exporter = new TldrawExport({ cacheDirectory })
			expect(exporter.identifierPattern.test('test.png')).toBe(false)
			expect(exporter.identifierPattern.test('test.svg')).toBe(false)
			expect(exporter.identifierPattern.test('test.js')).toBe(false)
			expect(exporter.identifierPattern.test('tldr')).toBe(false)
		})
	})

	describe('initialize', () => {
		it('creates the cache directory', async () => {
			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			const stat = await fs.stat(cacheDirectory)
			expect(stat.isDirectory()).toBe(true)
		})

		it('loads persistent cache from disk', async () => {
			// Pre-create a cache file
			await fs.mkdir(cacheDirectory, { recursive: true })
			const fakeResultPath = path.join(cacheDirectory, 'test-abc12345.svg')
			await fs.writeFile(fakeResultPath, '<svg/>')

			const cache = {
				'/some/test.tldr': { result: fakeResultPath },
			}
			await fs.writeFile(
				path.join(cacheDirectory, '.tldraw-plugin-cache.json'),
				JSON.stringify(cache),
			)

			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			// The cache should be loaded (we verify indirectly via savePersistentCache)
			await exporter.savePersistentCache()
			// eslint-disable-next-line ts/no-unsafe-assignment -- test assertion on parsed JSON
			const savedCache = JSON.parse(
				await fs.readFile(path.join(cacheDirectory, '.tldraw-plugin-cache.json'), 'utf8'),
			)
			// eslint-disable-next-line ts/no-unsafe-member-access -- test assertion
			expect(savedCache['/some/test.tldr']).toBeDefined()
		})

		it('removes stale entries where files no longer exist', async () => {
			await fs.mkdir(cacheDirectory, { recursive: true })
			const cache = {
				'/some/missing.tldr': { result: path.join(cacheDirectory, 'nonexistent.svg') },
			}
			await fs.writeFile(
				path.join(cacheDirectory, '.tldraw-plugin-cache.json'),
				JSON.stringify(cache),
			)

			const exporter = new TldrawExport({ cacheDirectory, verbose: true })
			await exporter.initialize()

			// After saving, the stale entry should be gone
			await exporter.savePersistentCache()
			// eslint-disable-next-line ts/no-unsafe-assignment -- test assertion on parsed JSON
			const savedCache = JSON.parse(
				await fs.readFile(path.join(cacheDirectory, '.tldraw-plugin-cache.json'), 'utf8'),
			)
			// eslint-disable-next-line ts/no-unsafe-member-access -- test assertion
			expect(savedCache['/some/missing.tldr']).toBeUndefined()
		})
	})

	describe('convert', () => {
		it('calls tldrawToImage and returns the cached file path', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)
			const content = await fs.readFile(tldrPath, 'utf8')
			const expectedHash = computeExpectedHash(content, {
				format: 'svg',
				stripStyle: false,
				transparent: false,
			})
			const expectedFileName = `test-${expectedHash}.svg`

			// Mock: tldrawToImage writes a file and returns its path
			mockedTldrawToImage.mockImplementation(async (_inputPath, options) => {
				const outputDirectory = getOutputDirectory(options)
				const outputPath = path.join(outputDirectory, 'test.svg')
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg>light</svg>')
				return [outputPath]
			})

			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			const result = await exporter.convert(tldrPath)

			expect(result).toBe(path.join(cacheDirectory, expectedFileName))
			expect(mockedTldrawToImage).toHaveBeenCalledOnce()

			// Verify the file was renamed to include the hash
			const exists = await fs
				.access(result)
				.then(() => true)
				.catch(() => false)
			expect(exists).toBe(true)
		})

		it('deduplicates concurrent requests for the same file', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)

			mockedTldrawToImage.mockImplementation(async (_inputPath, options) => {
				const outputDirectory = getOutputDirectory(options)
				const outputPath = path.join(outputDirectory, 'test.svg')
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg/>')
				// Simulate slow conversion
				await new Promise((resolve) => {
					setTimeout(resolve, 50)
				})
				return [outputPath]
			})

			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			// Fire two concurrent conversions for the same file
			const [result1, result2] = await Promise.all([
				exporter.convert(tldrPath),
				exporter.convert(tldrPath),
			])

			expect(result1).toBe(result2)
			// Should only call tldrawToImage once due to deduplication
			expect(mockedTldrawToImage).toHaveBeenCalledOnce()
		})

		it('uses disk cache when file hash matches', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)
			const content = await fs.readFile(tldrPath, 'utf8')
			const expectedHash = computeExpectedHash(content, {
				format: 'svg',
				stripStyle: false,
				transparent: false,
			})

			// Pre-create the cached file with the correct hash in its name
			await fs.mkdir(cacheDirectory, { recursive: true })
			const cachedPath = path.join(cacheDirectory, `test-${expectedHash}.svg`)
			await fs.writeFile(cachedPath, '<svg>cached</svg>')

			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			const result = await exporter.convert(tldrPath)

			expect(result).toBe(cachedPath)
			// Should NOT call tldrawToImage since disk cache hit
			expect(mockedTldrawToImage).not.toHaveBeenCalled()
		})

		it('re-converts when source file changes', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)

			mockedTldrawToImage.mockImplementation(async (_inputPath, options) => {
				const outputDirectory = getOutputDirectory(options)
				const outputPath = path.join(outputDirectory, 'test.svg')
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg/>')
				return [outputPath]
			})

			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			// First conversion
			const result1 = await exporter.convert(tldrPath)

			// Modify the source file
			await fs.writeFile(
				tldrPath,
				JSON.stringify({ document: { name: 'modified' }, schemaVersion: 2 }),
			)

			// Second conversion should re-convert due to changed hash
			const result2 = await exporter.convert(tldrPath)

			expect(result1).not.toBe(result2)
			expect(mockedTldrawToImage).toHaveBeenCalledTimes(2)
		})

		it('skips cache when cacheEnabled is false', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)
			const content = await fs.readFile(tldrPath, 'utf8')
			const expectedHash = computeExpectedHash(content, {
				format: 'svg',
				stripStyle: false,
				transparent: false,
			})

			// Pre-create a cached file
			await fs.mkdir(cacheDirectory, { recursive: true })
			await fs.writeFile(path.join(cacheDirectory, `test-${expectedHash}.svg`), '<svg>old</svg>')

			mockedTldrawToImage.mockImplementation(async (_inputPath, options) => {
				const outputDirectory = getOutputDirectory(options)
				const outputPath = path.join(outputDirectory, 'test.svg')
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg>fresh</svg>')
				return [outputPath]
			})

			const exporter = new TldrawExport({ cacheDirectory, cacheEnabled: false })
			await exporter.initialize()

			await exporter.convert(tldrPath)

			// Should call tldrawToImage even though cached file exists
			expect(mockedTldrawToImage).toHaveBeenCalledOnce()
		})
	})

	describe('savePersistentCache', () => {
		it('writes cache to disk after conversion', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)

			mockedTldrawToImage.mockImplementation(async (_inputPath, options) => {
				const outputDirectory = getOutputDirectory(options)
				const outputPath = path.join(outputDirectory, 'test.svg')
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg/>')
				return [outputPath]
			})

			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()
			await exporter.convert(tldrPath)

			// Cache file should exist
			const cacheFilePath = path.join(cacheDirectory, '.tldraw-plugin-cache.json')
			// eslint-disable-next-line ts/no-unsafe-assignment -- test assertion on parsed JSON
			const cacheContent = JSON.parse(await fs.readFile(cacheFilePath, 'utf8'))
			const absoluteTldrPath = path.resolve(tldrPath)
			// eslint-disable-next-line ts/no-unsafe-member-access -- test assertion
			expect(cacheContent[absoluteTldrPath]).toBeDefined()
			// eslint-disable-next-line ts/no-unsafe-member-access -- test assertion
			expect(cacheContent[absoluteTldrPath].result).toContain('test-')
			// eslint-disable-next-line ts/no-unsafe-member-access -- test assertion
			expect(cacheContent[absoluteTldrPath].result).toContain('.svg')
		})

		it('does not write when cache is not dirty', async () => {
			const exporter = new TldrawExport({ cacheDirectory })
			await exporter.initialize()

			// Save without any conversions — should not create a cache file
			await exporter.savePersistentCache()

			const cacheFilePath = path.join(cacheDirectory, '.tldraw-plugin-cache.json')
			const exists = await fs
				.access(cacheFilePath)
				.then(() => true)
				.catch(() => false)
			expect(exists).toBe(false)
		})
	})

	describe('pruneCache', () => {
		it('removes unused files when pruneCacheOnBuild is true', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			const tldrPath = await createTldrFixture(tempDirectory)

			mockedTldrawToImage.mockImplementation(async (_inputPath, options) => {
				const outputDirectory = getOutputDirectory(options)
				const outputPath = path.join(outputDirectory, 'test.svg')
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg/>')
				return [outputPath]
			})

			const exporter = new TldrawExport({
				cacheDirectory,
				pruneCacheOnBuild: true,
			})
			await exporter.initialize()

			// Create an orphan file in the cache directory
			await fs.writeFile(path.join(cacheDirectory, 'orphan.svg'), '<svg>orphan</svg>')

			// Convert one file (marks it as seen)
			await exporter.convert(tldrPath)

			// Prune should remove the orphan
			await exporter.pruneCache()

			const orphanExists = await fs
				.access(path.join(cacheDirectory, 'orphan.svg'))
				.then(() => true)
				.catch(() => false)
			expect(orphanExists).toBe(false)
		})

		it('does not remove files when pruneCacheOnBuild is false', async () => {
			const exporter = new TldrawExport({
				cacheDirectory,
				pruneCacheOnBuild: false,
			})
			await exporter.initialize()

			await fs.writeFile(path.join(cacheDirectory, 'orphan.svg'), '<svg>orphan</svg>')

			await exporter.pruneCache()

			const orphanExists = await fs
				.access(path.join(cacheDirectory, 'orphan.svg'))
				.then(() => true)
				.catch(() => false)
			expect(orphanExists).toBe(true)
		})

		it('never deletes the persistent cache file', async () => {
			const exporter = new TldrawExport({
				cacheDirectory,
				pruneCacheOnBuild: true,
			})
			await exporter.initialize()

			// Write a cache file
			const cacheFilePath = path.join(cacheDirectory, '.tldraw-plugin-cache.json')
			await fs.writeFile(cacheFilePath, '{}')

			await exporter.pruneCache()

			const exists = await fs
				.access(cacheFilePath)
				.then(() => true)
				.catch(() => false)
			expect(exists).toBe(true)
		})
	})

	describe('concurrency limiting', () => {
		it('limits concurrent conversions', async () => {
			const { tldrawToImage } = await import('@kitschpatrol/tldraw-cli')
			const mockedTldrawToImage = vi.mocked(tldrawToImage)

			let maxConcurrent = 0
			let currentConcurrent = 0

			// Create 4 different .tldr files
			const tldrPaths = await Promise.all(
				Array.from({ length: 4 }, async (_, i) => createTldrFixture(tempDirectory, `test${i}`)),
			)

			mockedTldrawToImage.mockImplementation(async (inputPath, options) => {
				currentConcurrent++
				maxConcurrent = Math.max(maxConcurrent, currentConcurrent)

				const outputDirectory = getOutputDirectory(options)
				const baseName = path.basename(inputPath, '.tldr')
				const outputPath = path.join(outputDirectory, `${baseName}.svg`)
				await fs.mkdir(outputDirectory, { recursive: true })
				await fs.writeFile(outputPath, '<svg/>')

				// Simulate work
				await new Promise((resolve) => {
					setTimeout(resolve, 50)
				})
				currentConcurrent--
				return [outputPath]
			})

			const exporter = new TldrawExport({
				cacheDirectory,
				maxConcurrentConversions: 2,
			})
			await exporter.initialize()

			await Promise.all(tldrPaths.map(async (p) => exporter.convert(p)))

			expect(maxConcurrent).toBeLessThanOrEqual(2)
			expect(mockedTldrawToImage).toHaveBeenCalledTimes(4)
		})
	})
})
