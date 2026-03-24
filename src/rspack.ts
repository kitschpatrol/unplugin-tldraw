/**
 * This entry file is for Rspack plugin.
 * @module
 */

import { starter } from './index'

/**
 * Rspack plugin
 * @example
 * ```js
 * // rspack.config.js
 * import starter from 'unplugin-tldraw/rspack'
 *
 * export default {
 *   plugins: [starter()],
 * }
 * ```
 */
const { rspack } = starter
export default rspack
export { rspack as 'module.exports' }
