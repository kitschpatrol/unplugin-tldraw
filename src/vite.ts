/**
 * This entry file is for Vite plugin.
 * @module
 */

import { createVitePlugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Vite plugin
 * @example
 * ```ts
 * // vite.config.ts
 * import tldraw from 'unplugin-tldraw/vite'
 *
 * export default defineConfig({
 *   plugins: [tldraw()],
 * })
 * ```
 */
export default createVitePlugin(unpluginFactory)
