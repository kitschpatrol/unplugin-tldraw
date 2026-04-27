/**
 * This entry file is for Bun plugin.
 *
 * @module
 */

import { createUnplugin } from 'unplugin'
import { unpluginFactory } from './index'

/**
 * Bun plugin
 *
 * @example
 * 	// build.ts
 * 	import tldraw from '@kitschpatrol/unplugin-tldraw/bun'
 *
 * 	Bun.build({ plugins: [tldraw()] })
 */
const unplugin = createUnplugin(unpluginFactory)
export default unplugin.raw
