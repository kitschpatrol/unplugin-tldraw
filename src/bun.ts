/**
 * This entry file is for Bun plugin.
 * @module
 */

import { createUnplugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Bun plugin
 * @example
 * ```ts
 * // Build with Bun
 * import tldraw from 'unplugin-tldraw/bun'
 *
 * Bun.build({ plugins: [tldraw()] })
 * ```
 */
const unplugin = createUnplugin(unpluginFactory)
export default unplugin.raw
