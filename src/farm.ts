/**
 * This entry file is for Farm plugin.
 * @module
 */

import { starter } from './index'

/**
 * Farm plugin
 * @example
 * ```ts
 * // farm.config.js
 * import starter from 'unplugin-tldraw/farm'
 *
 * export default {
 *   plugins: [starter()],
 * }
 * ```
 */
const { farm } = starter
export default farm
export { farm as 'module.exports' }
