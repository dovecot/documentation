import { getVitepressMd } from '../markdown.js'
import { addWatchPaths, loadData } from '../utility.js'

async function normalizeEventCategories(categories) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(categories)) {
		v.description = md.renderInline(v.description)
	}

	return categories
}

export default addWatchPaths({
	async load() {
		return await normalizeEventCategories(
			structuredClone((await loadData('event_categories')).categories)
		)
	}
})
