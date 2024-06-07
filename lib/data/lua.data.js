import { getVitepressMd } from '../markdown.js'
import { loadData, watchFiles } from '../utility.js'

async function normalizeLua(lua) {
	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(lua)) {
		if (v.params) {
			for (const [k2, v2] of Object.entries(v.params)) {
				v2.text = md.renderInline(v2.text)
			}
		}

		v.text = md.render(v.text)
	}

	return lua
}

export default {
	watch: await watchFiles(),
	async load() {
		return await normalizeLua(
			(await loadData('lua')).lua_functions
		)
	}
}
