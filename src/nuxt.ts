/**
 * This entry file is for Nuxt module.
 *
 * @module
 */

import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit'
import type { Options } from './core/options'
import vite from './vite'
import webpack from './webpack'

export type ModuleOptions = Options

/**
 * Nuxt module
 *
 * @example
 * 	// nuxt.config.ts
 * 	export default defineNuxtConfig({
 * 		modules: ['@kitschpatrol/unplugin-tldraw/nuxt'],
 * 	})
 */
export default defineNuxtModule<ModuleOptions>({
	meta: {
		configKey: 'tldraw',
		name: '@kitschpatrol/unplugin-tldraw',
	},
	setup(options) {
		addVitePlugin(() => vite(options))
		addWebpackPlugin(() => webpack(options))
	},
})
