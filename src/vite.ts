/**
 * This entry file is for Vite plugin.
 * @module
 */

import { starter } from './index'

/**
 * Vite plugin
 * @example
 * ```ts
 * // vite.config.ts
 * import starter from 'unplugin-tldraw/vite'
 *
 * export default defineConfig({
 *   plugins: [starter()],
 * })
 * ```
 */
const { vite } = starter
export default vite
export { vite as 'module.exports' }
