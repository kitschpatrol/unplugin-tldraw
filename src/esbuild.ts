/**
 * This entry file is for esbuild plugin.
 * @module
 */

import { createEsbuildPlugin } from 'unplugin'
import { unpluginFactory } from './index'

// @case-police-ignore esbuild

/**
 * esbuild plugin
 * @example
 * ```ts
 * import { build } from 'esbuild'
 * import tldraw from '@kitschpatrol/unplugin-tldraw/esbuild'
 *
 * build({ plugins: [tldraw()] })
 * ```
 */
export default createEsbuildPlugin(unpluginFactory)
