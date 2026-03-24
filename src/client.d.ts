declare module '*.tldr' {
	const content: string
	export default content
}

// Workarounds for https://github.com/microsoft/TypeScript/issues/38638
// Required when using query params on .tldr imports (e.g. `import x from './sketch.tldr?format=png&tldr'`)

declare module '*&tldr' {
	const content: string
	export default content
}

declare module '*&tldraw' {
	const content: string
	export default content
}
