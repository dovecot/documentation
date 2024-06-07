import { getVitepressMd } from '../markdown.js'
import { loadData, watchFiles } from '../utility.js'

async function normalizeEventCategories(categories) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(categories)) {
		v.description = md.renderInline(v.description)
	}

	return categories
}

export default {
	watch: await watchFiles(),
	async load() {
		return await normalizeEventCategories(
			(await loadData('event_categories')).categories
		)
	}
}
