import { knipConfig } from '@kitschpatrol/knip-config'

export default knipConfig({
	// Browser tests use a separate vitest config with a different root, which knip can't resolve
	ignore: ['test/import.test.ts', 'test/dynamic.test.ts'],
	ignoreExportsUsedInFile: true,
})
