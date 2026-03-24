import { expect, it } from 'vitest'

it('dynamically imports static paths', async () => {
	const tldrFile = await import('./assets/test-sketch.tldr')

	expect(tldrFile.default).toBeDefined()

	expect(tldrFile.default).toBeTypeOf('string')

	expect(tldrFile.default).toContain('test-sketch-')
})

it('dynamically imports variable paths', async () => {
	const importPath = './assets/test-sketch.tldr'
	// eslint-disable-next-line ts/no-unsafe-assignment -- dynamic import with variable
	const tldrFile = await import(/* @vite-ignore */ importPath)

	// eslint-disable-next-line ts/no-unsafe-member-access -- dynamic import
	expect(tldrFile.default).toBeDefined()
	// eslint-disable-next-line ts/no-unsafe-member-access -- dynamic import
	expect(tldrFile.default).toBeTypeOf('string')
})
