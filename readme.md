<!-- title -->

# @kitschpatrol/unplugin-tldraw

<!-- /title -->

<!-- badges -->

[![NPM Package @kitschpatrol/unplugin-tldraw](https://img.shields.io/npm/v/@kitschpatrol/unplugin-tldraw.svg)](https://npmjs.com/package/@kitschpatrol/unplugin-tldraw)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/kitschpatrol/unplugin-tldraw/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/unplugin-tldraw/actions/workflows/ci.yml)

<!-- /badges -->

<!-- short-description -->

**Unplugin for module-style import of local tldraw .tldr files with automatic conversion to SVG or PNG.**

<!-- /short-description -->

## Overview

**A universal bundler plugin to automate the import and conversion of local [tldraw](https://tldraw.dev) `.tldr` files into SVG or PNG image assets.**

Built on [unplugin](https://unplugin.unjs.io), it works with Vite, webpack, Rspack, Rollup, Rolldown, esbuild, Farm, Bun, and Nuxt.

This allows `.tldr` files to be imported just like regular `.webp`, `.jpeg` etc. files in your project:

```ts
// main.ts
import diagram from './assets/architecture.tldr'

const body = document.querySelector<HTMLDivElement>('body')
if (body) {
  body.innerHTML = `<img src="${diagram}" />`
}
```

The above converts `./assets/architecture.tldr` into `./assets/architecture-{hash}.svg`, caches the output file, and then resolves the import to the generated image path.

The plugin provides a global configuration object to customize the conversion process, and also allows overrides on a per-import basis via query parameters on the import path, e.g.:

```ts
import diagramPng from './assets/architecture.tldr?format=png&tldr'
```

_For lower-level processing of `.tldr` files in Node projects or via the command line, please see [@kitschpatrol/tldraw-cli](https://github.com/kitschpatrol/tldraw-cli). This package replaces an earlier Vite-only package of the same concept: [@kitschpatrol/vite-plugin-tldraw](https://github.com/kitschpatrol/vite-plugin-tldraw)._

## Installation

### 1. Install the plugin package

```sh
npm install @kitschpatrol/unplugin-tldraw
```

### 2. Add the plugin to your bundler config

<details>
<summary>Vite</summary>

```ts
// vite.config.ts
import tldraw from '@kitschpatrol/unplugin-tldraw/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tldraw()],
})
```

</details>

<details>
<summary>Rollup / Rolldown</summary>

```ts
// rollup.config.js
import tldraw from '@kitschpatrol/unplugin-tldraw/rollup'

export default {
  plugins: [tldraw()],
}
```

</details>

<details>
<summary>webpack</summary>

```js
// webpack.config.js
import tldraw from '@kitschpatrol/unplugin-tldraw/webpack'

export default {
  plugins: [tldraw()],
}
```

</details>

<details>
<summary>Rspack</summary>

```js
// rspack.config.js
import tldraw from '@kitschpatrol/unplugin-tldraw/rspack'

export default {
  plugins: [tldraw()],
}
```

</details>

<details>
<summary>esbuild</summary>

```ts
import tldraw from '@kitschpatrol/unplugin-tldraw/esbuild'
import { build } from 'esbuild'

build({ plugins: [tldraw()] })
```

</details>

<details>
<summary>Farm</summary>

```ts
// farm.config.js
import tldraw from '@kitschpatrol/unplugin-tldraw/farm'

export default {
  plugins: [tldraw()],
}
```

</details>

<details>
<summary>Bun</summary>

```ts
// build.ts
import tldraw from '@kitschpatrol/unplugin-tldraw/bun'

Bun.build({
  entrypoints: ['./index.ts'],
  plugins: [tldraw()],
})
```

</details>

<details>
<summary>Nuxt</summary>

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@kitschpatrol/unplugin-tldraw/nuxt'],
})
```

</details>

### 3. Configure TypeScript

_Skip this step if you're using plain JavaScript._

Add the extension declarations to your [types](https://www.typescriptlang.org/tsconfig#types) in tsconfig.json:

```json
{
  "compilerOptions": {
    "types": ["@kitschpatrol/unplugin-tldraw/client"]
  }
}
```

Alternately, you can add a triple-slash package dependency directive to your global types file (e.g. `env.d.ts` or similar):

```ts
/// <reference types="@kitschpatrol/unplugin-tldraw/client" />
```

This step should take care of errors like:

```sh
Cannot find module './assets/test-sketch.tldr' or its corresponding type declarations.ts(2307)
```

## Usage

Save your tldraw project to a `.tldr` file.

Add it to your project, most likely in an `assets` folder.

Then simply import the `.tldr` file to get a working asset path:

```ts
// example.ts
import diagram from './assets/test-sketch.tldr'

// Logs a path to the generated SVG
console.log(diagram)
```

See the sections below for additional conversion options.

## Plugin options

`@kitschpatrol/unplugin-tldraw` inherits most of the configuration flags available in [@kitschpatrol/tldraw-cli](https://github.com/kitschpatrol/tldraw-cli#command-line-usage).

### `Options`

| Key                        | Type                 | Description                                                                                                                                                        | Default                          |
| -------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| `defaultImageOptions`      | `TldrawImageOptions` | Default options for the image conversion process. See section below.                                                                                               | _See section below_              |
| `cacheEnabled`             | `boolean`            | Cache generated image files. Hashes based on the source `.tldr` content _and_ any image options or import query parameters ensure the cache regenerates as needed. | `true`                           |
| `cacheDirectory`           | `string`             | Directory to store cached image files.                                                                                                                             | `"./node_modules/.cache/tldraw"` |
| `maxConcurrentConversions` | `number`             | Maximum number of concurrent `.tldr` conversions. Each conversion spawns a headless browser, so lower values reduce system load.                                   | `2`                              |
| `pruneCacheOnBuild`        | `boolean`            | Delete cached files that were not used during a build. Useful for keeping the cache directory tidy.                                                                | `false`                          |
| `verbose`                  | `boolean`            | Log information about the conversion process to the console.                                                                                                       | `false`                          |

### `TldrawImageOptions`

| Key           | Type             | Description                                                                                                                                      | Default |
| ------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| `format`      | `"png" \| "svg"` | Output image format.                                                                                                                             | `"svg"` |
| `transparent` | `boolean`        | Output image with a transparent background.                                                                                                      | `false` |
| `dark`        | `boolean`        | Output a dark theme version of the image.                                                                                                        | `false` |
| `stripStyle`  | `boolean`        | Remove `<style>` elements from SVG output, useful to lighten the load of embedded fonts or if you are providing your own stylesheet for the SVG. | `false` |
| `padding`     | `number`         | Set a specific padding amount around the exported image.                                                                                         | `32`    |
| `scale`       | `number`         | Set a sampling factor for raster image exports.                                                                                                  | `1`     |

### Plugin options example

Configure the plugin to always generate PNGs with a transparent background, and to log conversion details:

```ts
// vite.config.ts
import tldraw from '@kitschpatrol/unplugin-tldraw/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tldraw({
      defaultImageOptions: {
        format: 'png',
        transparent: true,
      },
      verbose: true,
    }),
  ],
})
```

The `@kitschpatrol/unplugin-tldraw` package also exports `Options` and `TldrawImageOptions` types for your convenience.

## Import path options

Import directives may include query parameters to set image conversion options on a per-import basis.

Query parameters take precedence over `defaultImageOptions` set at plugin instantiation in your bundler config.

_Note: Due to [constraints in TypeScript's module declaration wildcards](https://github.com/microsoft/TypeScript/issues/38638), the import path must be suffixed with `&tldr` or `&tldraw` when query parameters are used._

### Additional query parameter options

In addition to all `TldrawImageOptions`, query parameters also accept additional options for selecting specific parts of a sketch:

| Key     | Type                  | Description                                                                                                                                                                              | Default     |
| ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `frame` | `string \| undefined` | When defined, outputs only a specific frame from the `.tldr` file. Provide either the frame name or its shape ID, e.g. `Frame 1`. Slugified frame names will also match, e.g. `frame-1`. | `undefined` |
| `page`  | `string \| undefined` | When defined, outputs only a specific page from the `.tldr` file. Provide either the page name or its page ID, e.g. `Page 1`. Slugified page names will also match, e.g. `page-1`.       | `undefined` |

### Import path query parameter examples

```ts
// example.ts
import diagramFrame from './assets/test-sketch-three-frames.tldr?frame=frame-1&tldr'
import diagramDark from './assets/test-sketch.tldr?dark=true&tldr'
import diagramPng from './assets/test-sketch.tldr?format=png&tldr'
import diagramTransparentPng from './assets/test-sketch.tldr?format=png&transparent=true&tldr'

// Logs a PNG path
console.log(diagramPng)

// Logs a dark-mode SVG path
console.log(diagramDark)

// Logs a transparent-background PNG path
console.log(diagramTransparentPng)

// Logs an SVG path for "Frame 1" in the source `.tldr`
console.log(diagramFrame)
```

## Implementation notes

This tool is not a part of the official tldraw project.

Behind the scenes, the plugin calls [@kitschpatrol/tldraw-cli](https://github.com/kitschpatrol/tldraw-cli)'s Node API to generate image files from `.tldr` files, and then resolves the import to the generated file path.

Because [`tldraw-cli`](https://github.com/kitschpatrol/tldraw-cli) relies on the browser automation tool [Puppeteer](https://pptr.dev) for its output, conversion can be a bit slow (on the order of a second or two). To mitigate this, the plugin provides several layers of optimization:

- **Content-addressed caching**: Generated images are named with a hash of the source content and conversion options. If the source hasn't changed, conversion is skipped entirely.
- **Persistent cache**: A JSON lookup table (`.tldraw-plugin-cache.json`) persists across builds, so even cold starts benefit from prior conversions. Stale entries are automatically cleaned.
- **Request deduplication**: If the same `.tldr` file is imported concurrently (e.g. from multiple modules), only one conversion runs and the result is shared.
- **Concurrency limiting**: At most `maxConcurrentConversions` (default: 2) conversions run in parallel, preventing system overload from too many headless browser instances.

The tldraw project evolves quickly. This plugin is somewhat brittle because the tldraw website, the tldraw library, the `.tldr` file format, and the underlying CLI export tool must all be in harmonious alignment for exports to work.

This plugin succeeds [@kitschpatrol/vite-plugin-tldraw](https://github.com/kitschpatrol/vite-plugin-tldraw), extending support to all major bundlers via [unplugin](https://unplugin.unjs.io).

## Migrating from `vite-plugin-tldraw`

If you're upgrading from [`@kitschpatrol/vite-plugin-tldraw`](https://github.com/kitschpatrol/vite-plugin-tldraw), the surface area is mostly the same. The notable changes are listed below.

### Package and import path

Replace the dependency:

```sh
npm uninstall @kitschpatrol/vite-plugin-tldraw
npm install @kitschpatrol/unplugin-tldraw
```

Update the bundler config to import from the bundler-specific subpath. For Vite:

_Before_:

```ts
import tldraw from '@kitschpatrol/vite-plugin-tldraw'
```

_After_:

```ts
import tldraw from '@kitschpatrol/unplugin-tldraw/vite'
```

For other bundlers (webpack, Rollup, Rolldown, esbuild, Rspack, Farm, Bun), see the [Installation](#2-add-the-plugin-to-your-bundler-config) section above for the correct subpath.

### TypeScript client types

Update the types reference in `tsconfig.json` (or your `env.d.ts`):

_Before_:

```jsonc
{
  "types": ["@kitschpatrol/vite-plugin-tldraw/client"],
}
```

_After_:

```jsonc
{
  "types": ["@kitschpatrol/unplugin-tldraw/client"],
}
```

### Removed: `returnMetadata`

The `returnMetadata` plugin option is gone. Imports always resolve to a `string` path now, never to a `{ src, width, height, format }` object. If you need image dimensions, read them from the resolved path with [`image-size`](https://www.npmjs.com/package/image-size) or a similar library at runtime.

### New plugin options

Three new keys are available on the [plugin options](#options) object:

- `cacheDirectory` — customize where converted images are stored.
- `maxConcurrentConversions` — cap the number of headless-browser exports running in parallel (default `2`).
- `pruneCacheOnBuild` — delete cached files that weren't used during a build.

### Cache location

The cache moved from `node_modules/.vite/tldr/` to `./node_modules/.cache/tldraw/` (configurable via `cacheDirectory`). The old directory is not reused and is safe to delete.

### Unchanged

Import-path query parameters (e.g. `?format=png&tldr`), the `&tldr` / `&tldraw` suffix requirement, the `frame` and `page` selectors, every key on `TldrawImageOptions` (`format`, `dark`, `transparent`, `stripStyle`, `padding`, `scale`), and the underlying [`@kitschpatrol/tldraw-cli`](https://github.com/kitschpatrol/tldraw-cli) conversion engine all behave exactly as before.

## Maintainers

[kitschpatrol](https://github.com/kitschpatrol)

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/unplugin-tldraw/issues) are welcome and appreciated.

Please open an issue to discuss changes before submitting a pull request. Unsolicited PRs (especially AI-generated ones) are unlikely to be merged.

This repository uses [@kitschpatrol/shared-config](https://github.com/kitschpatrol/shared-config) (via its `ksc` CLI) for linting and formatting, plus [MDAT](https://github.com/kitschpatrol/mdat) for readme placeholder expansion.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © [Eric Mika](https://ericmika.com)

<!-- /license -->
