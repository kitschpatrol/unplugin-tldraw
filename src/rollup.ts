/**
 * This entry file is for Rollup plugin.
 * @module
 */

import { starter } from './index'

/**
 * Rollup plugin
 * @example
 * ```ts
 * // rollup.config.js
 * import starter from 'unplugin-tldraw/rollup'
 *
 * export default {
 *   plugins: [starter()],
 * }
 * ```
 */
const { rollup } = starter
export default rollup
export { rollup as 'module.exports' }
