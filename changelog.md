# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

(Node.js support requirements have sometimes increased in minor or patch releases.)

## [1.1.5] - 2026-11-02

### Maintenance

- Refresh runtime dependency requirements, including `@kitschpatrol/tldraw-cli` ^6.1.1, `unplugin` ^3.7.0, `lognow` ^0.8.7, `pretty-ms` ^10.0.0, and Node.js type definitions.
- Refresh development dependencies, shared-config, and pnpm to 12.16.1, and remove obsolete ESLint and Knip exclusions.
- Replace the `prepare` script and standalone skills dependency with pnpm workspace skill permissions and synchronization directories.
- Run automated dependency-update PRs monthly and refresh release, metadata, and dependency-workflow actions.
- Exclude loopback URLs from automated link checks and allow checks with no input links to succeed.

## [1.1.4] - 2026-10-06

### Changed

- **Breaking:** Restrict supported Node.js versions to `^24.16.0 || >=26.3.0`, dropping Node.js 25 and Node.js 26.0–26.2.

### Maintenance

- Refresh runtime dependency requirements, including `@kitschpatrol/tldraw-cli` ^6.1.0, `unplugin` ^3.4.0, logging, concurrency, and output-formatting utilities.
- Upgrade development tooling to pnpm 12 and Vitest 5, refresh build and lint dependencies, and simplify configuration and cache-pruning code.
- Add dependency-provided skill synchronization during `prepare` and rename the deep-clean script to `clean-deep`.
- Add a weekly dependency-update PR workflow, pin release and metadata actions to commit hashes, and correct link-check error logging.

## [1.1.3] - 2026-08-25

### Changed

- **Breaking:** Raise the minimum supported Node.js version to 24.16.0.

### Documentation

- Correct the VS Code preview extension identifier and installation command, and update README links.

### Maintenance

- Refresh runtime dependencies, including `@kitschpatrol/tldraw-cli` ^6.0.3, `lognow` ^0.8.0, and Node.js 24 type definitions.
- Refresh development dependencies and pnpm, add VS Code lint/fix tasks, and simplify TypeScript and lint configuration.
- Add automated repository and website link checks on pushes, pull requests, and a weekly schedule.
- Simplify GitHub release creation with semantic-version tag filters and default-branch validation, and switch npm publishing to one-time-password authentication.

## [1.1.2] - 2026-07-07

### Maintenance

- Update declared runtime requirements to `@kitschpatrol/tldraw-cli` ^6.0.1 and `unplugin` ^3.3.0.
- Migrate development tooling to shared-config 8, Vite 8, and TypeScript 6; require Node.js >=24.16.0 for development and refactor source and tests for stricter linting.

## [1.1.1] - 2026-06-06

### Changed

- **Breaking:** Raise the minimum supported Node.js version from 22.18.0 to 22.22.2.

### Maintenance

- Upgrade the conversion engine to `@kitschpatrol/tldraw-cli` 6 for tldraw 5 and refresh logging and Node.js type dependencies.
- Migrate to pnpm 11, refresh development dependencies and CI actions, and correct npm-token forwarding in the publishing script.

## [1.1.0] - 2026-04-29

### Changed

- Expand optional peer compatibility to Nuxt 4 and Rollup 4, and declare Rspack 1/2 and Rolldown >=1.0.0-rc.1 peers.

### Documentation

- Update the README's MIT license link.

### Maintenance

- Refresh shared-config and bundler development dependencies for the expanded peer ranges.

## [1.0.0] - 2026-04-27

### Added

- Import local `.tldr` sketches as SVG (default) or PNG asset paths through Vite, webpack, Rspack, Rollup, Rolldown, esbuild, Farm, and Bun integrations.
- Provide a Nuxt module that registers the Vite and webpack plugins and accepts options through the `tldraw` configuration key.
- Configure format, dark mode, transparency, SVG style removal, padding, and scale globally or per import, with default padding of 32 and scale of 1; accept explicit or bare-key boolean query flags.
- Select individual frames or pages by name, ID, or slug through import query parameters.
- Persist cached images under configurable `node_modules/.cache/tldraw`, invalidate results when source content or conversion options change, and support disabling caching or pruning unused images after builds.
- Deduplicate simultaneous conversion requests, limit parallel browser exports to two by default, and optionally log conversion timing and output sizes.
- Ship an ESM package for Node.js >=22.18.0, exposing `unplugin` and `unpluginFactory` at the root and `TldrawExport` and `resolveOptions` through `/api` for direct conversion and cache management.
- Provide `/client` TypeScript declarations for `.tldr` imports and query imports ending in `&tldr` or `&tldraw`.

### Documentation

- Add npm installation instructions, bundler configuration examples, TypeScript setup, image-option and caching guides, and optional VS Code preview-extension guidance.
- Document migration from `@kitschpatrol/vite-plugin-tldraw`, including new import and type references, string asset paths, configuration options, and cache location.

### Maintenance

- Establish tsdown builds, shared linting and formatting, Vitest and Playwright tests, cross-platform CI, and npm/GitHub release automation.

[1.0.0]: https://github.com/kitschpatrol/unplugin-tldraw/releases/tag/v1.0.0
[1.1.0]: https://github.com/kitschpatrol/unplugin-tldraw/compare/v1.0.0...v1.1.0
[1.1.1]: https://github.com/kitschpatrol/unplugin-tldraw/compare/v1.1.0...v1.1.1
[1.1.2]: https://github.com/kitschpatrol/unplugin-tldraw/compare/v1.1.1...v1.1.2
[1.1.3]: https://github.com/kitschpatrol/unplugin-tldraw/compare/v1.1.2...v1.1.3
[1.1.4]: https://github.com/kitschpatrol/unplugin-tldraw/compare/v1.1.3...v1.1.4
[1.1.5]: https://github.com/kitschpatrol/unplugin-tldraw/compare/v1.1.4...v1.1.5
