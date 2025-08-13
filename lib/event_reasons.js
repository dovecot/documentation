import { getVitepressMd } from './markdown.js'
import { loadData } from './utility.js'

async function normalizeEventReasons(reasons) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(reasons)) {
		v.description = md.renderInline(v.description)
	}

	return reasons
}

export async function loadEventReasons() {
	return await normalizeEventReasons(
		structuredClone(loadData('event_reasons').reasons)
	)
}
