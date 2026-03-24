/**
 * This entry file is for Farm plugin.
 * @module
 */

import { createFarmPlugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Farm plugin
 * @example
 * ```ts
 * // farm.config.js
 * import tldraw from '@kitschpatrol/unplugin-tldraw/farm'
 *
 * export default {
 *   plugins: [tldraw()],
 * }
 * ```
 */
export default createFarmPlugin(unpluginFactory)
