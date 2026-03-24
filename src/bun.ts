/**
 * This entry file is for Bun plugin.
 * @module
 */

import { starter } from './index'

/**
 * Bun plugin
 * @example
 * ```ts
 * // Build with Bun
 * import starter from 'unplugin-tldraw/bun'
 *
 * Bun.build({ plugins: [starter()] })
 * ```
 */
const { bun } = starter
export default bun
export { bun as 'module.exports' }
