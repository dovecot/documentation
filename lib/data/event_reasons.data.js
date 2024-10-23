import { getVitepressMd } from '../markdown.js'
import { addWatchPaths, loadData } from '../utility.js'

async function normalizeEventReasons(reasons) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(reasons)) {
		v.description = md.renderInline(v.description)
	}

	return reasons
}

export default addWatchPaths({
	async load() {
		return await normalizeEventReasons(
			structuredClone((await loadData('event_reasons')).reasons)
		)
	}
})
