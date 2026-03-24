/**
 * This entry file is for Rollup plugin.
 * @module
 */

import { createRollupPlugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Rollup plugin
 * @example
 * ```ts
 * // rollup.config.js
 * import tldraw from '@kitschpatrol/unplugin-tldraw/rollup'
 *
 * export default {
 *   plugins: [tldraw()],
 * }
 * ```
 */
export default createRollupPlugin(unpluginFactory)
