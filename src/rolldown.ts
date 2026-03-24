/**
 * This entry file is for Rolldown plugin.
 * @module
 */

import { createRolldownPlugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Rolldown plugin
 * @example
 * ```ts
 * // rolldown.config.js
 * import tldraw from '@kitschpatrol/unplugin-tldraw/rolldown'
 *
 * export default {
 *   plugins: [tldraw()],
 * }
 * ```
 */
export default createRolldownPlugin(unpluginFactory)
