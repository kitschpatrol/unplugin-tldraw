/**
 * This entry file is for webpack plugin.
 * @module
 */

import { createWebpackPlugin } from 'unplugin'
import { unpluginFactory } from './index'

// @case-police-ignore webpack

/**
 * Webpack plugin
 * @example
 * ```js
 * // webpack.config.js
 * import tldraw from 'unplugin-tldraw/webpack'
 *
 * export default {
 *   plugins: [tldraw()],
 * }
 * ```
 */
export default createWebpackPlugin(unpluginFactory)
