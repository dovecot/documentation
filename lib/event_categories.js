import { getVitepressMd } from './markdown.js'
import { loadData } from './utility.js'

async function normalizeEventCategories(categories) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(categories)) {
		v.description = md.renderInline(v.description)
	}

	return categories
}

export async function loadEventCategories() {
	return await normalizeEventCategories(
		structuredClone(loadData('event_categories').categories)
	)
}
