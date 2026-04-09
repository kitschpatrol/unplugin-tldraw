import type { TldrawToImageOptions } from '@kitschpatrol/tldraw-cli'
import { tldrawToImage } from '@kitschpatrol/tldraw-cli'
import { defu } from 'defu'
import { log, setDefaultLogOptions } from 'lognow'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import pLimit from 'p-limit'
import prettyBytes from 'pretty-bytes'
import prettyMilliseconds from 'pretty-ms'
import type { ImportOverrides, Options, ResolvedOptions } from './options'
import { resolveOptions } from './options'

type PersistentCacheEntry = {
	result: string
}

type PersistentCache = Record<string, PersistentCacheEntry>

const CACHE_FILE_NAME = '.tldraw-plugin-cache.json'
const TLDR_EXTENSION_REGEX = /\.tldr/
const CACHE_HASH_REGEX = /-([a-f\d]{8})\.[^.]+$/

export class TldrawExport {
	/**
	 * Pattern matching `.tldr` file imports. The `resolveId` hook filters on this.
	 */
	public get identifierPattern(): RegExp {
		return TLDR_EXTENSION_REGEX
	}

	// Concurrency limiter for conversions (each spawns a headless browser)
	private readonly convertLimit: ReturnType<typeof pLimit>

	private readonly options: ResolvedOptions

	// Tracks converted file paths for cache pruning
	private readonly pathsSeen: Set<string> = new Set<string>()

	// In-flight request deduplication: prevents concurrent duplicate conversions
	// Key includes query params so different overrides for the same file are separate
	private readonly pendingRequests = new Map<string, Promise<string>>()

	// Dirty flag for batched cache writes
	private persistentCacheDirty = false

	// Result cache: prevents re-processing already completed requests (in-memory + persisted)
	private readonly resolvedCache = new Map<string, string>()

	private get cacheFilePath(): string {
		return path.join(this.options.cacheDirectory, CACHE_FILE_NAME)
	}

	constructor(options?: Options) {
		this.options = resolveOptions(options)
		this.convertLimit = pLimit(this.options.maxConcurrentConversions)

		setDefaultLogOptions({
			name: 'unplugin-tldraw',
			verbose: this.options.verbose,
		})
	}

	/**
	 * Converts a `.tldr` file to an image and returns the path relative to the cache directory.
	 * Uses caching, request deduplication, and concurrency limiting.
	 * @param tldrPath - Absolute or relative path to the `.tldr` file.
	 * @param overrides - Per-import option overrides (from query params).
	 */
	public async convert(tldrPath: string, overrides?: ImportOverrides): Promise<string> {
		// Normalize to absolute path for consistent cache keys
		const absolutePath = path.resolve(tldrPath)

		// Build a unique cache key that includes overrides
		const cacheKey =
			overrides && Object.keys(overrides).length > 0
				? `${absolutePath}?${JSON.stringify(overrides)}`
				: absolutePath

		// Check in-memory cache
		if (this.options.cacheEnabled) {
			const cached = this.resolvedCache.get(cacheKey)
			if (cached !== undefined) {
				if (await this.isFileHashCurrent(absolutePath, cached, overrides)) {
					log.debug(`Cache hit for "${this.relativePath(absolutePath)}"`)
					if (this.options.pruneCacheOnBuild) {
						this.pathsSeen.add(cached)
					}

					return path.relative(this.options.cacheDirectory, cached)
				}

				// Hash changed, invalidate
				this.resolvedCache.delete(cacheKey)
				this.persistentCacheDirty = true
			}
		}

		// Deduplicate concurrent requests for the same file + overrides
		const pending = this.pendingRequests.get(cacheKey)
		if (pending !== undefined) {
			log.debug(`Waiting for in-flight conversion of "${this.relativePath(absolutePath)}"`)
			return pending
		}

		// Queue the conversion with concurrency limiting
		const convertPromise = this.convertLimit(async () => this.doConvert(absolutePath, overrides))
		this.pendingRequests.set(cacheKey, convertPromise)

		try {
			const result = await convertPromise
			this.resolvedCache.set(cacheKey, result)
			this.persistentCacheDirty = true
			await this.savePersistentCache()
			return path.relative(this.options.cacheDirectory, result)
		} finally {
			this.pendingRequests.delete(cacheKey)
		}
	}

	/**
	 * Initialize the cache directory and load persistent cache from disk.
	 */
	public async initialize(): Promise<void> {
		await fs.mkdir(this.options.cacheDirectory, { recursive: true })
		await this.loadPersistentCache()
		log.debug(`Initialized with cache at "${this.options.cacheDirectory}"`)
	}

	/**
	 * Delete cached files that were not used during this build.
	 */
	public async pruneCache(): Promise<void> {
		if (!this.options.pruneCacheOnBuild) {
			return
		}

		const destinationFiles = await fs.readdir(this.options.cacheDirectory)
		const fileNamesToKeep = new Set(
			Array.from(this.pathsSeen, (filePath) => path.basename(filePath)),
		)

		for (const destinationFile of destinationFiles) {
			if (destinationFile === CACHE_FILE_NAME) continue
			if (!fileNamesToKeep.has(destinationFile)) {
				log.debug(`Cleaning up unused image: ${destinationFile}`)
				await fs.rm(path.join(this.options.cacheDirectory, destinationFile))
			}
		}
	}

	/**
	 * Resolve a relative cache path back to an absolute path.
	 */
	public resolveFromCache(relativePath: string): string {
		return path.resolve(this.options.cacheDirectory, relativePath)
	}

	/**
	 * Persist the in-memory cache to disk.
	 */
	public async savePersistentCache(): Promise<void> {
		if (!this.persistentCacheDirty) return

		const cache: PersistentCache = {}
		for (const [identifier, result] of this.resolvedCache.entries()) {
			cache[this.toRelativeCacheKey(identifier)] = {
				result: path.relative(this.options.cacheDirectory, result),
			}
		}

		await fs.writeFile(this.cacheFilePath, JSON.stringify(cache, undefined, 2))
		this.persistentCacheDirty = false
		log.debug(`Saved ${this.resolvedCache.size} entries to persistent cache`)
	}

	private async doConvert(absolutePath: string, overrides?: ImportOverrides): Promise<string> {
		const startTime = performance.now()

		// Merge per-import overrides with defaults
		const { frame, page, ...imageOverrides } = overrides ?? {}
		// eslint-disable-next-line ts/no-unsafe-type-assertion -- defu deep merge loses narrowed type
		const mergedImageOptions = defu(
			imageOverrides,
			this.options.defaultImageOptions,
		) as ResolvedOptions['defaultImageOptions']
		const { format } = mergedImageOptions

		// Compute cache key from file content + merged options + frame/page
		const optionsForHash: Record<string, unknown> = { ...mergedImageOptions }
		if (frame !== undefined) optionsForHash.frame = frame
		if (page !== undefined) optionsForHash.page = page
		const contentHash = await computeCacheKey(absolutePath, optionsForHash)

		// Build filename with optional frame/page slugs
		const sourceFilename = path.basename(absolutePath, '.tldr')
		const slugParts = [sourceFilename]
		if (page !== undefined) slugParts.push(slugify(page))
		if (frame !== undefined) slugParts.push(slugify(frame))
		slugParts.push(contentHash)
		const cachedFileName = `${slugParts.join('-')}.${format}`
		const cachedFilePath = path.join(this.options.cacheDirectory, cachedFileName)

		// Check if the cached file already exists on disk (content-addressed)
		if (this.options.cacheEnabled && (await fileExists(cachedFilePath))) {
			log.debug(`Disk cache hit for "${this.relativePath(absolutePath)}" → "${cachedFileName}"`)
			if (this.options.pruneCacheOnBuild) {
				this.pathsSeen.add(cachedFilePath)
			}

			return cachedFilePath
		}

		log.debug(`Converting "${this.relativePath(absolutePath)}"...`)

		await fs.mkdir(this.options.cacheDirectory, { recursive: true })

		// Use a unique temp directory per conversion to avoid filename collisions
		// when multiple concurrent conversions of the same .tldr file (e.g. light + dark)
		// would otherwise produce the same output filename from tldraw-cli.
		const tempOutputDirectory = path.join(
			this.options.cacheDirectory,
			`.tmp-${crypto.randomUUID()}`,
		)
		await fs.mkdir(tempOutputDirectory, { recursive: true })

		// Build tldraw-cli options
		const tldrawCliOptions: TldrawToImageOptions = {
			format,
			output: tempOutputDirectory,
			stripStyle: mergedImageOptions.stripStyle,
			transparent: mergedImageOptions.transparent,
		}

		if (mergedImageOptions.dark !== undefined) {
			tldrawCliOptions.dark = mergedImageOptions.dark
		}

		if (mergedImageOptions.padding !== undefined) {
			tldrawCliOptions.padding = mergedImageOptions.padding
		}

		if (mergedImageOptions.scale !== undefined) {
			tldrawCliOptions.scale = mergedImageOptions.scale
		}

		if (frame !== undefined) {
			tldrawCliOptions.frames = [frame]
		}

		if (page !== undefined) {
			tldrawCliOptions.pages = [page]
		}

		try {
			const outputFiles = await tldrawToImage(absolutePath, tldrawCliOptions)
			const outputFile = outputFiles[0]

			if (!outputFile) {
				throw new Error(`tldraw-cli produced no output for "${absolutePath}"`)
			}

			// Move to final cache location with content hash in filename
			await fs.rename(outputFile, cachedFilePath)
		} finally {
			// Clean up temp directory
			await fs.rm(tempOutputDirectory, { force: true, recursive: true })
		}

		if (this.options.pruneCacheOnBuild) {
			this.pathsSeen.add(cachedFilePath)
		}

		const elapsed = prettyMilliseconds(performance.now() - startTime)
		const stat = await fs.stat(cachedFilePath)
		const fileSize = prettyBytes(stat.size)
		log.debug(`Converted in ${elapsed} (${fileSize}) → "${cachedFileName}"`)

		return cachedFilePath
	}

	private fromRelativeCacheKey(relativeKey: string): string {
		const queryIndex = relativeKey.indexOf('?')
		if (queryIndex === -1) {
			return path.resolve(this.options.cacheDirectory, relativeKey)
		}

		const relativePath = relativeKey.slice(0, queryIndex)
		const query = relativeKey.slice(queryIndex)
		return path.resolve(this.options.cacheDirectory, relativePath) + query
	}

	/**
	 * Checks if a cached result still matches the source file's content hash.
	 */
	private async isFileHashCurrent(
		sourcePath: string,
		cachedResultPath: string,
		overrides?: ImportOverrides,
	): Promise<boolean> {
		if (!(await fileExists(cachedResultPath))) return false

		// Extract the hash from the cached filename: name-HASH.ext
		const cachedBasename = path.basename(cachedResultPath)
		const cachedHashMatch = CACHE_HASH_REGEX.exec(cachedBasename)
		if (!cachedHashMatch?.[1]) return false

		const { frame, page, ...imageOverrides } = overrides ?? {}
		// eslint-disable-next-line ts/no-unsafe-type-assertion -- defu deep merge loses narrowed type
		const mergedOptions = defu(
			imageOverrides,
			this.options.defaultImageOptions,
		) as ResolvedOptions['defaultImageOptions']
		const optionsForHash: Record<string, unknown> = { ...mergedOptions }
		if (frame !== undefined) optionsForHash.frame = frame
		if (page !== undefined) optionsForHash.page = page

		const currentHash = await computeCacheKey(sourcePath, optionsForHash)
		return currentHash === cachedHashMatch[1]
	}

	private async loadPersistentCache(): Promise<void> {
		try {
			const cacheContent = await fs.readFile(this.cacheFilePath, 'utf8')
			// eslint-disable-next-line ts/no-unsafe-type-assertion -- JSON.parse returns unknown
			const cache = JSON.parse(cacheContent) as PersistentCache

			let validEntries = 0
			let staleEntries = 0

			for (const [relativeIdentifier, entry] of Object.entries(cache)) {
				const absoluteIdentifier = this.fromRelativeCacheKey(relativeIdentifier)
				const absoluteResult = path.resolve(this.options.cacheDirectory, entry.result)
				if (await fileExists(absoluteResult)) {
					this.resolvedCache.set(absoluteIdentifier, absoluteResult)
					validEntries++
				} else {
					this.persistentCacheDirty = true
					staleEntries++
				}
			}

			if (staleEntries > 0) {
				log.debug(
					`Removed ${staleEntries} stale entries from cache (files no longer exist on disk)`,
				)
			}

			log.debug(`Loaded ${validEntries} entries from persistent cache`)
		} catch {
			// Cache file doesn't exist or is invalid, start fresh
		}
	}

	private relativePath(absolutePath: string): string {
		return path.relative(process.cwd(), absolutePath)
	}

	private toRelativeCacheKey(absoluteKey: string): string {
		const queryIndex = absoluteKey.indexOf('?')
		if (queryIndex === -1) {
			return path.relative(this.options.cacheDirectory, absoluteKey)
		}

		const absolutePath = absoluteKey.slice(0, queryIndex)
		const query = absoluteKey.slice(queryIndex)
		return path.relative(this.options.cacheDirectory, absolutePath) + query
	}
}

async function computeCacheKey(
	filePath: string,
	options: Record<string, unknown>,
): Promise<string> {
	const fileBuffer = await fs.readFile(filePath)
	const hash = crypto.createHash('sha1')
	hash.update(fileBuffer)
	hash.update(JSON.stringify(options))
	return hash.digest('hex').slice(0, 8)
}

async function fileExists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath)
		return true
	} catch {
		return false
	}
}

/**
 * Simple slugify for frame/page names in filenames.
 * Converts to lowercase, replaces non-alphanumeric with hyphens, trims.
 */
function slugify(text: string): string {
	return text
		.toLowerCase()
		.replaceAll(/[^\da-z]+/g, '-')
		.replaceAll(/^-+|-+$/g, '')
}
