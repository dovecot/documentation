import { getVitepressMd } from '../markdown.js'
import { addWatchPaths, loadData } from '../utility.js'

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
	let set = false
	const out = {}

	for (const v of lua.values()) {
		if (v.args) {
			for (const [k2, v2] of Object.entries(v.args)) {
				/* Merge information from Dovecot settings. */
				if (v2.dovecot_setting) {
					if (!set) {
						set = structuredClone(loadData('settings').settings)
					}

					if (!v2.type) {
						v2.type = set[v2.dovecot_setting].values?.label
					}

					if (!v2.text) {
						v2.text = set[v2.dovecot_setting].text.trim()
					}

					if (v2.default === undefined) {
						v2.default = set[v2.dovecot_setting].default
					}
				}

				v2.text = md.render(v2.text)
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

export default addWatchPaths({
	async load() {
		const data = loadData('lua')

		return {
			constants: await normalizeLuaConstants(data.lua_constants),
			functions: await normalizeLuaFunctions(data.lua_functions),
			variables: await normalizeLuaVariables(data.lua_variables)
		}
	}
})
