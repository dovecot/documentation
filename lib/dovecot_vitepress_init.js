import { dovecotMdInit } from './markdown.js'

export default function dovecotVitepressInit() {
	return {
		name: 'dovecot-vitepress-init',
		async configResolved(config) {
			console.log('\n✅ Config resolved!')

			/* We need to synchronously initialize markdown,
			 * since we need to pre-populate various internal
			 * tables (e.g. links). */
			await dovecotMdInit()
			console.log('\n✅ Markdown initialized!')
		},
	}
}
