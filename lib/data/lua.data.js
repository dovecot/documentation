import { getVitepressMd } from '../markdown.js'
import { loadData, watchFiles } from '../utility.js'

async function normalizeLuaConstants(lua) {
	const md = await getVitepressMd()
	const out = {}

	for (const v of lua.values()) {
		if (v.text) {
			v.text = md.render(v.text)
		}

		for (const tag of v.tags) {
			const v2 = structuredClone(v)
			v2.tags = tag
			out[tag + '.' + v.name] = v2
		}
	}

	return out
}

async function normalizeLuaFunctions(lua) {
	const md = await getVitepressMd()
	const out = {}

	for (const v of lua.values()) {
		if (v.args) {
			for (const [k2, v2] of Object.entries(v.args)) {
				v2.text = md.renderInline(v2.text)
			}
		}

		v.text = md.render(v.text)

		for (const tag of v.tags) {
			const v2 = structuredClone(v)
			v2.tags = tag
			out[tag + '.' + v.name] = v2
		}
	}

	return out
}

async function normalizeLuaVariables(lua) {
	const md = await getVitepressMd()
	const out = {}

	for (const v of lua.values()) {
		if (v.text) {
			v.text = md.render(v.text)
		}

		for (const tag of v.tags) {
			const v2 = structuredClone(v)
			v2.tags = tag
			out[tag + '.' + v.name] = v2
		}
	}

	return out
}

export default {
	watch: await watchFiles(),
	async load() {
		const data = await(loadData('lua'))

		return {
			constants: await normalizeLuaConstants(data.lua_constants),
			functions: await normalizeLuaFunctions(data.lua_functions),
			variables: await normalizeLuaVariables(data.lua_variables)
		}
	}
}
