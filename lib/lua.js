import { getVitepressMd } from './markdown.js'
import { loadData } from './utility.js'

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
	const set = structuredClone((await loadData('settings')).settings)
	const md = await getVitepressMd()
	const out = {}

	for (const v of lua.values()) {
		/* Expand hash args pulled from tagged Dovecot settings. */
		for (const spec of v.args_from_tags ?? []) {
			v.args = v.args ?? {}
			for (const [name, s] of Object.entries(set)) {
				if (!s.tags?.some(t => spec.tags.includes(t)))
					continue

				const key = (spec.strip_prefix &&
					    name.startsWith(spec.strip_prefix))
						? name.slice(spec.strip_prefix.length)
						: name
				if (!v.args[key]) {
					v.args[key] = {
						hash_arg: true,
						type: s.values?.label,
						text: s.text.trim(),
						default: s.default,
					}
				}
			}
		}

		if (v.args) {
			for (const v2 of Object.values(v.args)) {
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

export async function loadLua() {
	const data = await loadData('lua')

	return {
		constants: await normalizeLuaConstants(data.lua_constants),
		functions: await normalizeLuaFunctions(data.lua_functions),
		variables: await normalizeLuaVariables(data.lua_variables)
	}
}
