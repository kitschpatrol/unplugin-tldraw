import type { UnpluginFactory } from 'unplugin'
import path from 'node:path'
import { createUnplugin } from 'unplugin'
import type { Options } from './core/options'
import { parseImportOverrides } from './core/options'
import { TldrawExport } from './core/tldraw'

export const unpluginFactory: UnpluginFactory<Options | undefined> = (options) => {
	const tldrawExport = new TldrawExport(options)

	return {
		async buildEnd() {
			await tldrawExport.savePersistentCache()
		},
		async buildStart() {
			await tldrawExport.initialize()
		},
		enforce: 'pre',
		name: 'unplugin-tldraw',
		resolveId: {
			filter: {
				id: tldrawExport.identifierPattern,
			},
			async handler(id, importer) {
				const queryIndex = id.indexOf('?')
				const cleanId = queryIndex === -1 ? id : id.slice(0, queryIndex)
				const queryString = queryIndex === -1 ? '' : id.slice(queryIndex + 1)

				// Resolve relative paths against the importer's directory
				const resolvedPath =
					importer && (cleanId.startsWith('./') || cleanId.startsWith('../'))
						? path.resolve(path.dirname(importer), cleanId)
						: cleanId

				const overrides = queryString ? parseImportOverrides(queryString) : undefined
				return tldrawExport.convert(resolvedPath, overrides)
			},
		},
		async writeBundle() {
			await tldrawExport.pruneCache()
		},
	}
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

/** @alias unplugin */
export default unplugin
