/**
 * This entry file is for esbuild plugin.
 * @module
 */

import { starter } from './index'

// @case-police-ignore esbuild

/**
 * Esbuild plugin
 * @example
 * ```ts
 * import { build } from 'esbuild'
 * import starter from 'unplugin-tldraw/esbuild'
 * 
 * build({ plugins: [starter()] })
```
 */
const { esbuild } = starter
export default esbuild
export { esbuild as 'module.exports' }
