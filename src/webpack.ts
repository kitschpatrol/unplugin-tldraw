/**
 * This entry file is for webpack plugin.
 * @module
 */

import { starter } from './index'

// @case-police-ignore webpack

/**
 * Webpack plugin
 * @example
 * ```js
 * // webpack.config.js
 * import starter from 'unplugin-tldraw/webpack'
 *
 * export default {
 *   plugins: [starter()],
 * }
 * ```
 */
const { webpack } = starter
export default webpack
export { webpack as 'module.exports' }
