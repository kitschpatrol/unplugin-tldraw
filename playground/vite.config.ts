import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import Mkcert from 'vite-plugin-mkcert'
import Tldraw from '../src/vite'

process.env.BROWSER = 'chromium'

export default defineConfig({
	plugins: [
		Mkcert(),
		Inspect(),
		Tldraw({
			verbose: true,
		}),
	],
	server: {
		hmr: {
			host: 'localhost',
			protocol: 'wss',
		},
		open: true,
	},
})
