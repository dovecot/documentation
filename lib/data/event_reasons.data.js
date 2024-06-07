import { getVitepressMd } from '../markdown.js'
import { loadData, watchFiles } from '../utility.js'

async function normalizeEventReasons(reasons) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(reasons)) {
		v.description = md.renderInline(v.description)
	}

	return reasons
}

export default {
	watch: await watchFiles(),
	async load() {
		return await normalizeEventReasons(
			(await loadData('event_reasons')).reasons
		)
	}
}
