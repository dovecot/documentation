import { loadData, normalizeArrayData, watchFiles } from '../utility.js'
import { getVitepressMd } from '../markdown.js'

function wrapInTag(str, tag) {
	if (tag)
		return `<${tag}>${str}</${tag}>`
	return str
}

/* Resolve links in given parameter. If no singular link is detected, it is
 * rendered with the provided tag surrounding the value. */
function normalizeString(md, str, tag = null) {
	let out = ''

	if (str) {
		/* FIXME: This makes the following .startsWith() call work, but might
		 * lead to type-specific errors, e.g. String({}) yields
		 * '[object Object]'. This still needs to be verified manually. */
		out = String(str)
		if (!out.startsWith('[[')) {
			out = wrapInTag(out, tag)
		}
		return md.renderInline(out)
	}

	return str
}

/* Mark a plain item as an inter-settings dovecot-specific link, i.e.
 * [[setting,<item>]]. Don't process already marked links. */
function normalizeArray(md, arr) {
	if (arr) {
		return arr.map(entry => (
			md.renderInline(
				entry.startsWith('[[')
					? entry
					: `[[setting,${entry}]]`
			)
		))
	}

	return arr
}

async function normalizeSettings(settings) {
	const data = normalizeArrayData(
		settings,
		['dependencies', 'seealso', 'tags', 'values_enum']
	)

	const md = await getVitepressMd()

	for (const [k, v] of Object.entries(data)) {
		if (!v) {
			delete data[k]
			continue
		}

		/* Style default entry. */
		if (!!v.default) {
			if (typeof v.default === 'string' || v.default instanceof String)
				v.default = normalizeString(md, v.default, 'code')
			else {
				let out = normalizeString(md, v.default.value ?? '', 'code')
				if (out.length > 0)
					out += '<br />'
				if (!!v.default.text)
					out += `${normalizeString(md, v.default.text ?? '')}`
				v.default = out
			}
		}

		/* Add list of dependencies. */
		v.dependencies = normalizeArray(md, v.dependencies)

		/* Add markdown to seealso settings. */
		v.seealso = normalizeArray(md, v.seealso)

		/* Plugin. */
		if (v.plugin) {
			v.plugin = [ v.plugin ].flat()
			v.plugin_link = v.plugin.map((x) =>
				md.renderInline('[[plugin,' + x + ']]')
			).join(', ')
		}

		/* There can be multiple value entries. */
		if (!Array.isArray(v.values)) {
			v.values = [ v.values ]
		}

		for (const v2 of v.values) {
			v2.url = md.renderInline(v2.url)
		}

		for (const k2 of ['added', 'changed', 'deprecated', 'removed']) {
			if (v[k2]) {
				const changes = []
				for (const[k3, v3] of Object.entries(v[k2])) {
					changes.push({
						text: v3 ? md.render(v3.trim()) : null,
						version: md.renderInline('[[' + k2 + ',' + k3 + ']]')
					})
				}
				v[k2] = changes
			}
		}

		v.text = md.render(v.text.trim())
	}

	return data
}

export default {
	watch: await watchFiles(),
	async load() {
		return await normalizeSettings(
			structuredClone((await loadData('settings')).settings)
		)
	}
}
