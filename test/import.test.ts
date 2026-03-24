import { expect, it } from 'vitest'
import tldrFile from './assets/test-sketch.tldr'

it('converts tldr files to images on import', () => {
	// The plugin resolves .tldr imports to generated image file paths
	expect(tldrFile).toBeTypeOf('string')
	expect(tldrFile).toContain('test-sketch-')
	expect(tldrFile).toMatch(/\.svg/)
})
