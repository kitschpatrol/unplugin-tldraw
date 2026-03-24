/**
 * This entry file is for Rspack plugin.
 * @module
 */

import { createRspackPlugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Rspack plugin
 * @example
 * ```js
 * // rspack.config.js
 * import tldraw from '@kitschpatrol/unplugin-tldraw/rspack'
 *
 * export default {
 *   plugins: [tldraw()],
 * }
 * ```
 */
export default createRspackPlugin(unpluginFactory)
